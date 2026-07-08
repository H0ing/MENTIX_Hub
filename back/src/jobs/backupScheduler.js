import cron from 'node-cron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import util from 'util';
import { exec } from 'child_process';
import * as backupRepo from '../repositories/backupRepository.js';
import { dev, user as userQuery } from '../db/query.js';
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

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

async function runScheduledBackup() {
  const connection = await rootDB.getConnection();
  let overallSuccess = true;

  try {
    await connection.query('FLUSH TABLES WITH READ LOCK');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const schedResult = await backupRepo.getSchedule();
    const sched = schedResult.rows[0];
    if (!sched) return { success: true };

    let selectedTables = sched.selected_tables;
    let rowLimits = sched.row_limits;
    const backupFormat = sched.backup_format || 'sql';

    if (typeof selectedTables === 'string') selectedTables = JSON.parse(selectedTables);
    if (typeof rowLimits === 'string') rowLimits = JSON.parse(rowLimits);

    const isTableSelection = selectedTables && Array.isArray(selectedTables) && selectedTables.length > 0;

    if (backupFormat === 'csv' && isTableSelection) {
      const result = await runCSVExport(connection, timestamp, selectedTables, rowLimits);
      overallSuccess = result.success;
    } else {
      const result = await runSQLExport(connection, timestamp, selectedTables, rowLimits);
      overallSuccess = result.success;
    }
  } catch (err) {
    logger.error('Scheduled backup error: ' + err.message);
    overallSuccess = false;
  } finally {
    try {
      await connection.query('UNLOCK TABLES');
    } catch (_) { /* ignore */ }
    connection.release();
  }

  await pruneOldBackups();
  return { success: overallSuccess };
}

async function runSQLExport(connection, timestamp, selectedTables, rowLimits) {
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
  const dumpStart = Date.now();

  try {
    const mysqldump = config.mysqldumpPath;
    const db = config.db.database;
    const host = config.db.host;
    const port = config.db.port;
    const user = config.db.users.root.user;
    const pass = config.db.users.root.password;
    const connStr = `--host=${host} --port=${port} --user=${user} --password=${pass}`;

    let dumpCmd;
    if (selectedTables && selectedTables.length > 0) {
      const hasRowLimits = rowLimits && typeof rowLimits === 'object' && Object.keys(rowLimits).length > 0;
      if (hasRowLimits) {
        const parts = [];
        for (const table of selectedTables) {
          const limit = rowLimits[table];
          const redirect = parts.length === 0 ? '>' : '>>';
          if (limit) {
            parts.push(`"${mysqldump}" ${connStr} ${db} --tables ${table} --where="1=1 LIMIT ${parseInt(limit, 10) || limit}" ${redirect} "${filePath}"`);
          } else {
            parts.push(`"${mysqldump}" ${connStr} ${db} --tables ${table} ${redirect} "${filePath}"`);
          }
        }
        dumpCmd = parts.join(' && ');
      } else {
        dumpCmd = `"${mysqldump}" ${connStr} ${db} --tables ${selectedTables.join(' ')} > "${filePath}"`;
      }
    } else {
      dumpCmd = `"${mysqldump}" ${connStr} ${db} > "${filePath}"`;
    }

    await execPromise(dumpCmd, { timeout: 300000 });

    const durationSeconds = Math.round((Date.now() - dumpStart) / 1000);
    const stats = fs.statSync(filePath);

    await userQuery(
      'UPDATE backup_history SET status = ?, size_bytes = ?, duration_seconds = ? WHERE id = ?',
      ['success', stats.size, durationSeconds, backupId]
    );

    await backupRepo.createLog(backupId, 'info', `Scheduled SQL backup completed in ${durationSeconds}s, size: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
    logger.info(`Scheduled SQL backup ${backupId} completed: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
  } catch (dumpError) {
    const durationSeconds = Math.round((Date.now() - dumpStart) / 1000);
    await userQuery(
      'UPDATE backup_history SET status = ?, duration_seconds = ? WHERE id = ?',
      ['failed', durationSeconds, backupId]
    );
    await backupRepo.createLog(backupId, 'error', 'Scheduled SQL backup failed: ' + dumpError.message);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    logger.error(`Scheduled SQL backup ${backupId} failed after ${durationSeconds}s: ${dumpError.message}`);
    return { success: false };
  }
  
  return { success: true };
}

async function runCSVExport(connection, timestamp, selectedTables, rowLimits) {
  let anyFailed = false;

  for (const table of selectedTables) {
    const limit = rowLimits?.[table];
    const filename = `mentix_hub_auto_${timestamp}_${table}.csv`;
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
    const dumpStart = Date.now();

    try {
      const safeTable = table.replace(/`/g, '``');
      const limitClause = limit ? ` LIMIT ${parseInt(limit, 10)}` : '';
      const [rows, fields] = await connection.execute(`SELECT * FROM \`${safeTable}\`${limitClause}`);

      const headers = fields.map(f => f.name);
      const csvLines = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => headers.map(h => escapeCSV(row[h])).join(','))
      ];
      const csvContent = csvLines.join('\n');

      fs.writeFileSync(filePath, csvContent, 'utf8');

      const durationSeconds = Math.round((Date.now() - dumpStart) / 1000);
      const stats = fs.statSync(filePath);

      await userQuery(
        'UPDATE backup_history SET status = ?, size_bytes = ?, duration_seconds = ? WHERE id = ?',
        ['success', stats.size, durationSeconds, backupId]
      );

      await backupRepo.createLog(backupId, 'info', `Scheduled CSV backup for ${table} completed in ${durationSeconds}s, size: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
      logger.info(`Scheduled CSV backup ${backupId} (${table}) completed: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
    } catch (err) {
      anyFailed = true;
      const durationSeconds = Math.round((Date.now() - dumpStart) / 1000);
      await userQuery(
        'UPDATE backup_history SET status = ?, duration_seconds = ? WHERE id = ?',
        ['failed', durationSeconds, backupId]
      );
      await backupRepo.createLog(backupId, 'error', `Scheduled CSV backup for ${table} failed: ${err.message}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      logger.error(`Scheduled CSV backup ${backupId} (${table}) failed: ${err.message}`);
    }
  }

  if (!anyFailed && selectedTables.length > 0) {
    logger.info(`Scheduled CSV backup completed for ${selectedTables.length} table(s)`);
  }
  
  return { success: !anyFailed };
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

    if (!['daily', 'weekly', 'monthly', 'one_time'].includes(schedule.frequency)) {
      logger.warn(`Backup scheduler: fixing invalid frequency "${schedule.frequency}" → daily`);
      await backupRepo.updateSchedule(schedule.id, { frequency: 'daily' });
      schedule.frequency = 'daily';
    }

    const isRecurring = ['daily', 'weekly', 'monthly'].includes(schedule.frequency);

    if (schedule.custom_date) {
      const runAt = new Date(`${schedule.custom_date}T${schedule.time_of_day}`);
      const now = new Date();
      const delayMs = runAt.getTime() - now.getTime();
      const BUFFER_MS = 60000;

      if (delayMs > BUFFER_MS) {
        oneTimeTimer = setTimeout(async () => {
          const result = await runScheduledBackup();
          try {
            await backupRepo.updateLastRun(schedule.id, new Date(), null);
          } catch (_) { /* ignore */ }
          // Always clear one-time fields after it fires (success or fail)
          // If run_once, disable the schedule too
          await backupRepo.updateSchedule(schedule.id, {
            custom_date: null,
            selected_tables: null,
            row_limits: null,
            run_once: false,
            ...(schedule.run_once ? { enabled: false } : {})
          });
          if (result.success) {
            logger.info('Backup scheduler: one-time backup completed successfully');
          } else {
            logger.warn('Backup scheduler: one-time backup finished with errors — check backup_history for failed entries');
          }
          oneTimeTimer = null;
        }, delayMs);
        logger.info(`Backup scheduler: one-time backup scheduled for ${schedule.custom_date}T${schedule.time_of_day} (in ${Math.round(delayMs / 1000 / 60)} min)`);
      } else if (delayMs > 0) {
        logger.warn(`Backup scheduler: one-time scheduled time too close (${Math.round(delayMs / 1000)}s), extending by ${BUFFER_MS / 1000}s`);
        oneTimeTimer = setTimeout(async () => {
          const result = await runScheduledBackup();
          try {
            await backupRepo.updateLastRun(schedule.id, new Date(), null);
          } catch (_) { /* ignore */ }
          await backupRepo.updateSchedule(schedule.id, {
            custom_date: null,
            selected_tables: null,
            row_limits: null,
            run_once: false,
            ...(schedule.run_once ? { enabled: false } : {})
          });
          if (result.success) {
            logger.info('Backup scheduler: one-time backup completed successfully (delayed)');
          } else {
            logger.warn('Backup scheduler: one-time backup finished with errors — check backup_history for failed entries');
          }
          oneTimeTimer = null;
        }, BUFFER_MS);
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
