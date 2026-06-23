import cron from 'node-cron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import util from 'util';
import { exec } from 'child_process';
import * as backupRepo from '../repositories/backupRepository.js';
import { dev } from '../db/query.js';
import { rootDB } from '../db/pool.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = util.promisify(exec);

const BACKUP_DIR = path.resolve(__dirname, '../../backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

let task = null;
let oneTimeTimer = null;

function toCronExpression(frequency, timeOfDay) {
  if (!timeOfDay) return null;
  const parts = timeOfDay.split(':');
  const minutes = parseInt(parts[1], 10) || 0;
  const hours = parseInt(parts[0], 10) || 0;

  switch (frequency) {
    case 'daily':   return `${minutes} ${hours} * * *`;
    case 'weekly':  return `${minutes} ${hours} * * 0`;
    case 'monthly': return `${minutes} ${hours} 1 * *`;
    default:        return null;
  }
}

async function runScheduledBackup() {
  const connection = await rootDB.getConnection();

  try {
    await connection.query('FLUSH TABLES WITH READ LOCK');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `mentix_hub_auto_${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, filename);

    const result = await backupRepo.create({
      backup_type: 'scheduled',
      size_bytes: null,
      status: 'in_progress',
      file_path: filePath,
      initiated_by: null,
      duration_seconds: null
    });

    const backupId = result.rows.insertId;

    try {
      const dumpStart = Date.now();

      await execPromise(
        `mysqldump --host=${config.db.host} --port=${config.db.port} --user=${config.db.users.root.user} --password=${config.db.users.root.password} ${config.db.database} > "${filePath}"`,
        { timeout: 300000 }
      );

      const durationSeconds = Math.round((Date.now() - dumpStart) / 1000);
      const stats = fs.statSync(filePath);

      await dev(
        'UPDATE backup_history SET status = ?, size_bytes = ?, duration_seconds = ? WHERE id = ?',
        ['success', stats.size, durationSeconds, backupId]
      );

      await backupRepo.createLog(backupId, 'info', `Scheduled backup completed in ${durationSeconds}s, size: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);

      logger.info(`Scheduled backup ${backupId} completed: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
    } catch (dumpError) {
      await dev(
        'UPDATE backup_history SET status = ? WHERE id = ?',
        ['failed', backupId]
      );

      await backupRepo.createLog(backupId, 'error', dumpError.message);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      logger.error(`Scheduled backup ${backupId} failed: ${dumpError.message}`);
    }
  } catch (err) {
    logger.error('Scheduled backup error before dump: ' + err.message);
  } finally {
    try {
      await connection.query('UNLOCK TABLES');
    } catch (_) { /* ignore */ }
    connection.release();
  }

  await pruneOldBackups();
}

async function pruneOldBackups() {
  try {
    const scheduleResult = await backupRepo.getSchedule();
    const schedule = scheduleResult.rows[0];
    if (!schedule || !schedule.retention_days) return;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - schedule.retention_days);

    const oldResult = await dev(
      'SELECT id, file_path FROM backup_history WHERE created_at < ? AND file_path IS NOT NULL',
      [cutoff]
    );

    for (const row of oldResult.rows) {
      if (row.file_path && fs.existsSync(row.file_path)) {
        fs.unlinkSync(row.file_path);
      }
      await backupRepo.deleteById(row.id);
    }

    if (oldResult.rows.length > 0) {
      logger.info(`Pruned ${oldResult.rows.length} old backup(s) older than ${schedule.retention_days} days`);
    }
  } catch (err) {
    logger.error('Backup pruning failed: ' + err.message);
  }
}

export async function startScheduler() {
  try {
    const result = await backupRepo.getSchedule();
    const schedule = result.rows[0];
    if (!schedule) return;

    const isRecurring = ['daily', 'weekly', 'monthly'].includes(schedule.frequency);

    if (schedule.custom_date) {
      const runAt = new Date(`${schedule.custom_date}T${schedule.time_of_day}`);
      const now = new Date();
      const delayMs = runAt.getTime() - now.getTime();

      if (delayMs > 0) {
        oneTimeTimer = setTimeout(async () => {
          await runScheduledBackup();
          try {
            await backupRepo.updateLastRun(schedule.id, new Date(), null);
          } catch (_) { /* ignore */ }
          await backupRepo.updateSchedule(schedule.id, { custom_date: null });
          if (schedule.run_once) {
            await backupRepo.updateSchedule(schedule.id, { enabled: false });
          }
          logger.info('Backup scheduler: one-time backup completed');
          oneTimeTimer = null;
        }, delayMs);
        logger.info(`Backup scheduler: one-time backup scheduled for ${schedule.custom_date}T${schedule.time_of_day} (in ${Math.round(delayMs / 1000 / 60)} min)`);
      } else {
        logger.warn('Backup scheduler: one-time scheduled time is in the past, clearing');
        await backupRepo.updateSchedule(schedule.id, { custom_date: null });
      }
    }

    if (isRecurring && schedule.enabled) {
      const cronExpr = toCronExpression(schedule.frequency, schedule.time_of_day);
      if (!cronExpr) {
        logger.warn('Backup scheduler: invalid frequency/time_of_day config');
      } else {
        task = cron.schedule(cronExpr, async () => {
          logger.info('Backup scheduler: trigger triggered');
          await runScheduledBackup();

          try {
            const updatedSchedule = await backupRepo.getSchedule();
            const s = updatedSchedule.rows[0];
            if (s) {
              const next = getNextRunTime(cronExpr);
              await backupRepo.updateLastRun(s.id, new Date(), next);
            }
          } catch (_) { /* ignore */ }
        });

        logger.info(`Backup scheduler: cron started ("${cronExpr}", retention: ${schedule.retention_days}d)`);
      }
    }

    if (!isRecurring && !schedule.custom_date) {
      logger.info('Backup scheduler: no active schedules');
    }
  } catch (err) {
    logger.error('Backup scheduler initialization failed: ' + err.message);
  }
}

function getNextRunTime(cronExpr) {
  const parts = cronExpr.split(' ');
  const minutes = parseInt(parts[0], 10);
  const hours = parseInt(parts[1], 10);
  const dayOfMonth = parts[2] === '*' ? null : parseInt(parts[2], 10);
  const dayOfWeek = parts[4] === '*' ? null : parseInt(parts[4], 10);

  const now = new Date();
  let next = new Date(now);
  next.setSeconds(0, 0);
  next.setMinutes(minutes);
  next.setHours(hours);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  if (dayOfMonth !== null) {
    next.setDate(dayOfMonth);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }

  if (dayOfWeek !== null) {
    const diff = (dayOfWeek - next.getDay() + 7) % 7;
    if (diff === 0 && next <= now) {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + diff);
    }
  }

  return next;
}

export function stopScheduler() {
  if (task) {
    task.stop();
    task = null;
  }
  if (oneTimeTimer) {
    clearTimeout(oneTimeTimer);
    oneTimeTimer = null;
  }
  logger.info('Backup scheduler: stopped');
}
