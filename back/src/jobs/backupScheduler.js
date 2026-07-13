import cron from 'node-cron';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import util from 'util';
import { exec } from 'child_process';
import * as backupRepo from '../repositories/backupRepository.js';
import { dev, user as userQuery } from '../db/query.js';
import { rootDB } from '../db/pool.js';
import cloudinary from '../config/cloudinary.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = util.promisify(exec);

const BACKUP_DIR = path.resolve(__dirname, '../../backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function extractPublicIdFromUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.\w+$/);
  return match ? match[1] : null;
}

function isCloudinaryUrl(path) {
  return path && path.startsWith('http') && path.includes('res.cloudinary.com');
}

async function uploadBackupToCloudinary(filePath, filename) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'backups',
    resource_type: 'raw',
    public_id: filename.replace(/\.(sql|csv)$/i, '')
  });
  return result.secure_url;
}

async function destroyCloudinaryBackup(publicId) {
  const r1 = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  if (r1.result === 'ok') return r1;
  const r2 = await cloudinary.uploader.destroy(publicId + '.sql', { resource_type: 'raw' });
  if (r2.result === 'ok') return r2;
  return cloudinary.uploader.destroy(publicId + '.csv', { resource_type: 'raw' });
}

const cronTasks = [];
const oneTimeTimers = [];

function toDateStr(d) {
  if (d instanceof Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return String(d).split('T')[0].split(' ')[0];
}

function toTimeStr(t) {
  if (t instanceof Date) {
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
  }
  return String(t).length <= 8 ? String(t) : String(t).split(' ')[4] || String(t);
}

function toCronExpression(frequency, timeOfDay) {
  if (!timeOfDay) return null;
  const ts = toTimeStr(timeOfDay);
  const parts = ts.split(':');
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

async function runScheduledBackup(schedule) {
  const connection = await rootDB.getConnection();
  let overallSuccess = true;

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    let selectedTables = schedule.selected_tables;
    let rowLimits = schedule.row_limits;
    const backupFormat = schedule.backup_format || 'sql';

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
    const connStr = `--host=${host} --port=${port} --user=${user} --password=${pass} --single-transaction --skip-lock-tables --ssl-ca="${config.caCertPath}"`;

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

    let cloudinaryUrl;
    try {
      cloudinaryUrl = await uploadBackupToCloudinary(filePath, filename);
    } catch (uploadError) {
      await userQuery(
        'UPDATE backup_history SET status = ?, size_bytes = ?, duration_seconds = ? WHERE id = ?',
        ['failed', stats.size, durationSeconds, backupId]
      );
      await backupRepo.createLog(backupId, 'error', 'Cloudinary upload failed: ' + uploadError.message);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      logger.error(`Scheduled SQL backup ${backupId} failed during Cloudinary upload: ${uploadError.message}`);
      return { success: false };
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await userQuery(
      'UPDATE backup_history SET status = ?, size_bytes = ?, duration_seconds = ?, file_path = ? WHERE id = ?',
      ['success', stats.size, durationSeconds, cloudinaryUrl, backupId]
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

      let cloudinaryUrl;
      try {
        cloudinaryUrl = await uploadBackupToCloudinary(filePath, filename);
      } catch (uploadError) {
        await userQuery(
          'UPDATE backup_history SET status = ?, size_bytes = ?, duration_seconds = ? WHERE id = ?',
          ['failed', stats.size, durationSeconds, backupId]
        );
        await backupRepo.createLog(backupId, 'error', `Cloudinary upload failed for ${table}: ${uploadError.message}`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        logger.error(`Scheduled CSV backup ${backupId} (${table}) failed during Cloudinary upload: ${uploadError.message}`);
        anyFailed = true;
        continue;
      }

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await userQuery(
        'UPDATE backup_history SET status = ?, size_bytes = ?, duration_seconds = ?, file_path = ? WHERE id = ?',
        ['success', stats.size, durationSeconds, cloudinaryUrl, backupId]
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
    const allResult = await backupRepo.getAllSchedules();
    const schedules = allResult.rows;
    if (!schedules.length) return;

    const maxRetention = Math.max(...schedules.map(s => s.retention_days || 30));
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxRetention);

    const oldResult = await dev(
      'SELECT id, file_path FROM backup_history WHERE created_at < ? AND file_path IS NOT NULL',
      [cutoff]
    );

    for (const row of oldResult.rows) {
      if (row.file_path) {
        if (isCloudinaryUrl(row.file_path)) {
          const publicId = extractPublicIdFromUrl(row.file_path);
          if (publicId) {
            try {
              await destroyCloudinaryBackup(publicId);
            } catch (e) {
              logger.warn('Failed to delete old backup from Cloudinary: ' + e.message);
            }
          }
        } else if (fs.existsSync(row.file_path)) {
          fs.unlinkSync(row.file_path);
        }
      }
      await backupRepo.deleteById(row.id);
    }

    if (oldResult.rows.length > 0) {
      logger.info(`Pruned ${oldResult.rows.length} old backup(s) older than ${maxRetention} days`);
    }
  } catch (err) {
    logger.error('Backup pruning failed: ' + err.message);
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

function setupOneTimeSchedule(schedule) {
  if (!schedule.custom_date) return;

  const dateStr = toDateStr(schedule.custom_date);
  const timeStr = toTimeStr(schedule.time_of_day);
  const runAt = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  const delayMs = runAt.getTime() - now.getTime();
  const BUFFER_MS = 60000;

  if (delayMs > BUFFER_MS) {
    const timer = setTimeout(async () => {
      const result = await runScheduledBackup(schedule);
      try {
        await backupRepo.updateLastRun(schedule.id, new Date(), null);
      } catch (_) { /* ignore */ }
      await backupRepo.updateSchedule(schedule.id, {
        ...(schedule.run_once ? { enabled: false } : {})
      });
      if (result.success) {
        logger.info(`Backup scheduler: one-time backup #${schedule.id} completed successfully`);
      } else {
        logger.warn(`Backup scheduler: one-time backup #${schedule.id} finished with errors`);
      }
      const idx = oneTimeTimers.findIndex(t => t.id === schedule.id);
      if (idx !== -1) oneTimeTimers.splice(idx, 1);
    }, delayMs);
    oneTimeTimers.push({ id: schedule.id, timer });
    logger.info(`Backup scheduler: one-time #${schedule.id} scheduled for ${dateStr}T${timeStr} (in ${Math.round(delayMs / 1000 / 60)} min)`);
  } else if (delayMs > 0) {
    logger.warn(`Backup scheduler: one-time #${schedule.id} too close (${Math.round(delayMs / 1000)}s), extending by ${BUFFER_MS / 1000}s`);
    const timer = setTimeout(async () => {
      const result = await runScheduledBackup(schedule);
      try {
        await backupRepo.updateLastRun(schedule.id, new Date(), null);
      } catch (_) { /* ignore */ }
      await backupRepo.updateSchedule(schedule.id, {
        ...(schedule.run_once ? { enabled: false } : {})
      });
      if (result.success) {
        logger.info(`Backup scheduler: one-time backup #${schedule.id} completed successfully (delayed)`);
      } else {
        logger.warn(`Backup scheduler: one-time backup #${schedule.id} finished with errors`);
      }
      const idx = oneTimeTimers.findIndex(t => t.id === schedule.id);
      if (idx !== -1) oneTimeTimers.splice(idx, 1);
    }, BUFFER_MS);
    oneTimeTimers.push({ id: schedule.id, timer });
  } else {
    logger.warn(`Backup scheduler: one-time #${schedule.id} scheduled time is in the past`);
  }
}

function setupRecurringSchedule(schedule) {
  if (!schedule.enabled) return;
  if (!['daily', 'weekly', 'monthly'].includes(schedule.frequency)) return;

  const cronExpr = toCronExpression(schedule.frequency, schedule.time_of_day);
  if (!cronExpr) {
    logger.warn(`Backup scheduler: invalid cron config for #${schedule.id}`);
    return;
  }

  const task = cron.schedule(cronExpr, async () => {
    logger.info(`Backup scheduler: cron #${schedule.id} triggered`);
    await runScheduledBackup(schedule);
    try {
      const updated = await backupRepo.getScheduleById(schedule.id);
      const s = updated.rows[0];
      if (s) {
        const next = getNextRunTime(cronExpr);
        await backupRepo.updateLastRun(s.id, new Date(), next);
      }
    } catch (_) { /* ignore */ }
  });

  cronTasks.push({ id: schedule.id, task });
  logger.info(`Backup scheduler: cron #${schedule.id} started ("${cronExpr}", freq: ${schedule.frequency})`);
}

export async function startScheduler() {
  try {
    const result = await backupRepo.getAllSchedules();
    const schedules = result.rows;

    for (const schedule of schedules) {
      if (!['daily', 'weekly', 'monthly', 'one_time'].includes(schedule.frequency)) {
        logger.warn(`Backup scheduler: fixing invalid frequency "${schedule.frequency}" for #${schedule.id} → daily`);
        await backupRepo.updateSchedule(schedule.id, { frequency: 'daily' });
        schedule.frequency = 'daily';
      }

      if (schedule.frequency === 'one_time' && schedule.custom_date) {
        setupOneTimeSchedule(schedule);
      }

      if (['daily', 'weekly', 'monthly'].includes(schedule.frequency)) {
        setupRecurringSchedule(schedule);
      }
    }

    if (schedules.length === 0) {
      logger.info('Backup scheduler: no schedules found');
    } else {
      logger.info(`Backup scheduler: initialized with ${schedules.length} schedule(s)`);
    }
  } catch (err) {
    logger.error('Backup scheduler initialization failed: ' + err.message);
  }
}

export function stopScheduler() {
  for (const { task } of cronTasks) {
    task.stop();
  }
  cronTasks.length = 0;

  for (const { timer } of oneTimeTimers) {
    clearTimeout(timer);
  }
  oneTimeTimers.length = 0;

  logger.info('Backup scheduler: stopped');
}
