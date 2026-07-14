import path from 'path';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import util from 'util';
import { exec } from 'child_process';
import * as backupRepo from '../repositories/backupRepository.js';
import { user as userQuery, dev, root } from '../db/query.js';
import { rootDB } from '../db/pool.js';
import { startScheduler, stopScheduler } from '../jobs/backupScheduler.js';
import cloudinary from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';
import { success, created, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';
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

function downloadCloudinaryFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`Download failed with status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', err => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function triggerBackup(req, res) {
  logger.info('Backup triggered', { method: req.method, url: req.originalUrl });

  const connection = await rootDB.getConnection();
  logger.info('Got DB connection');

  const { backup_format, selected_tables, row_limits } = req.body || {};
  const format = backup_format || 'sql';
  let selectedTables = selected_tables;
  let rowLimits = row_limits;
  if (typeof selectedTables === 'string') selectedTables = JSON.parse(selectedTables);
  if (typeof rowLimits === 'string') rowLimits = JSON.parse(rowLimits);
  const isTableSelection = selectedTables && Array.isArray(selectedTables) && selectedTables.length > 0;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (format === 'csv' && isTableSelection) {
    try {
      await runManualCSVExport(connection, timestamp, selectedTables, rowLimits, req.user?.id ?? null);
      const latest = await backupRepo.findAll({ page: 1, limit: selectedTables.length, offset: 0 });
      logger.info('CSV backup completed for ' + selectedTables.length + ' table(s)');
      success(res, { backups: latest.rows, count: latest.count }, 'CSV backup completed');
    } finally {
      connection.release();
      logger.info('Connection released');
    }
    return;
  }

  const filename = `mentix_hub_backup_${timestamp}.sql`;
  const filePath = path.join(BACKUP_DIR, filename);
  logger.info('Backup file path: ' + filePath);

  let backupId;
  let dumpErrorObj = null;
  let durationSeconds = 0;

  try {
    const result = await backupRepo.create({
      backup_type: 'manual',
      size_bytes: null,
      status: 'in_progress',
      file_path: filePath,
      initiated_by: req.user?.id ?? null,
      duration_seconds: null
    });

    backupId = result.rows.insertId;
    logger.info('Backup record created, id: ' + backupId);

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
      if (isTableSelection) {
        const safeTables = selectedTables.map(t => t.replace(/[^a-zA-Z0-9_]/g, ''));
        const hasRowLimits = rowLimits && typeof rowLimits === 'object' && Object.keys(rowLimits).length > 0;
        if (hasRowLimits) {
          const parts = [];
          for (const table of safeTables) {
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
          dumpCmd = `"${mysqldump}" ${connStr} ${db} --tables ${safeTables.join(' ')} > "${filePath}"`;
        }
      } else {
        dumpCmd = `"${mysqldump}" ${connStr} ${db} > "${filePath}"`;
      }

      logger.info('Running mysqldump: ' + dumpCmd.substring(0, 200));
      await execPromise(dumpCmd, { timeout: 300000 });
      logger.info('mysqldump completed');
      durationSeconds = Math.round((Date.now() - dumpStart) / 1000);
    } catch (dumpError) {
      logger.error('mysqldump failed: ' + dumpError.message);
      durationSeconds = Math.round((Date.now() - dumpStart) / 1000);
      dumpErrorObj = dumpError;
    }

    if (dumpErrorObj) {
      await userQuery(
        'UPDATE backup_history SET status = ?, duration_seconds = ? WHERE id = ?',
        ['failed', durationSeconds, backupId]
      );
      await backupRepo.createLog(backupId, 'error', dumpErrorObj.message);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      throw new AppError('Backup failed: ' + dumpErrorObj.message, 500);
    }

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
      throw new AppError('Backup failed: ' + uploadError.message, 500);
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await userQuery(
      'UPDATE backup_history SET status = ?, size_bytes = ?, duration_seconds = ?, file_path = ? WHERE id = ?',
      ['success', stats.size, durationSeconds, cloudinaryUrl, backupId]
    );
    await backupRepo.createLog(backupId, 'info', `Backup completed successfully in ${durationSeconds}s, size: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
  } finally {
    connection.release();
    logger.info('Connection released');
  }

  const backupResult = await backupRepo.findById(backupId);
  const logs = await backupRepo.getLogs(backupId);

  logger.info('Backup completed successfully, id: ' + backupId);
  created(res, { ...backupResult.rows[0], logs: logs.rows }, 'Backup created successfully');
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

async function runManualCSVExport(connection, timestamp, selectedTables, rowLimits, initiatedBy) {
  const backupIds = [];

  for (const table of selectedTables) {
    const limit = rowLimits?.[table];
    const filename = `mentix_hub_backup_${timestamp}_${table}.csv`;
    const filePath = path.join(BACKUP_DIR, filename);

    const result = await backupRepo.create({
      backup_type: 'manual',
      size_bytes: null,
      status: 'in_progress',
      file_path: filePath,
      initiated_by: initiatedBy,
      duration_seconds: null
    });

    const backupId = result.rows.insertId;
    backupIds.push(backupId);
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
      fs.writeFileSync(filePath, csvLines.join('\n'), 'utf8');

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
        continue;
      }

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await userQuery(
        'UPDATE backup_history SET status = ?, size_bytes = ?, duration_seconds = ?, file_path = ? WHERE id = ?',
        ['success', stats.size, durationSeconds, cloudinaryUrl, backupId]
      );
      await backupRepo.createLog(backupId, 'info', `CSV backup for ${table} completed in ${durationSeconds}s, size: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
    } catch (err) {
      const durationSeconds = Math.round((Date.now() - dumpStart) / 1000);
      await userQuery(
        'UPDATE backup_history SET status = ?, duration_seconds = ? WHERE id = ?',
        ['failed', durationSeconds, backupId]
      );
      await backupRepo.createLog(backupId, 'error', `CSV backup for ${table} failed: ${err.message}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
}

async function getHistory(req, res) {
  const { status, backup_type } = req.query;
  const { page, limit, offset } = getPagination(req.query);

  const result = await backupRepo.findAll({ page, limit, offset, status, backup_type });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function getRecoverableHistory(req, res) {
  const { page, limit, offset } = getPagination(req.query);

  const result = await backupRepo.findAll({ page, limit, offset, status: 'success' });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function getBackupById(req, res) {
  const { id } = req.params;

  const backupResult = await backupRepo.findById(id);
  if (!backupResult.rows.length) {
    throw new AppError('Backup not found', 404);
  }

  const logs = await backupRepo.getLogs(id);

  success(res, { ...backupResult.rows[0], logs: logs.rows });
}

async function restoreBackup(req, res) {
  const { id } = req.params;

  const backupResult = await backupRepo.findById(id);
  if (!backupResult.rows.length) {
    throw new AppError('Backup not found', 404);
  }

  const backup = backupResult.rows[0];
  logger.info('Restore check — backup status: "' + backup.status + '" for id: ' + id);

  if (backup.status !== 'success') {
    throw new AppError('Cannot restore a backup that is not successful (status: ' + backup.status + ')', 400);
  }

  let restorePath = backup.file_path;
  let isTempFile = false;

  if (isCloudinaryUrl(backup.file_path)) {
    const tempFilename = `restore_${id}_${Date.now()}.sql`;
    restorePath = path.join(BACKUP_DIR, tempFilename);
    logger.info('Downloading backup from Cloudinary: ' + backup.file_path);
    try {
      await downloadCloudinaryFile(backup.file_path, restorePath);
      isTempFile = true;
    } catch (downloadError) {
      throw new AppError('Failed to download backup from Cloudinary: ' + downloadError.message, 500);
    }
  } else {
    if (!fs.existsSync(backup.file_path)) {
      throw new AppError('Backup file not found on disk', 404);
    }
  }

  await backupRepo.createLog(id, 'info', 'Restore initiated');

  try {
    const restoreStart = Date.now();

    const mysql = config.mysqlPath;
    logger.info('Using mysql: ' + mysql);
    await execPromise(
      `"${mysql}" --host=${config.db.host} --port=${config.db.port} --user=${config.db.users.root.user} --password=${config.db.users.root.password} --ssl-ca="${config.caCertPath}" ${config.db.database} < "${restorePath}"`,
      { timeout: 600000 }
    );

    const durationSeconds = Math.round((Date.now() - restoreStart) / 1000);

    await backupRepo.createLog(id, 'info', `Restore completed successfully in ${durationSeconds}s`);

    success(res, { backup_id: id, duration_seconds: durationSeconds }, 'Database restored successfully');
  } catch (restoreError) {
    await backupRepo.createLog(id, 'error', 'Restore failed: ' + restoreError.message);
    throw new AppError('Restore failed: ' + restoreError.message, 500);
  } finally {
    if (isTempFile && fs.existsSync(restorePath)) {
      fs.unlinkSync(restorePath);
    }
  }
}

async function deleteBackup(req, res) {
  const { id } = req.params;

  const backupResult = await backupRepo.findById(id);
  if (!backupResult.rows.length) {
    throw new AppError('Backup not found', 404);
  }

  const backup = backupResult.rows[0];
  if (backup.file_path) {
    if (isCloudinaryUrl(backup.file_path)) {
      const publicId = extractPublicIdFromUrl(backup.file_path);
      if (publicId) {
        try {
          await destroyCloudinaryBackup(publicId);
        } catch (e) {
          logger.warn('Failed to delete backup from Cloudinary: ' + e.message);
        }
      }
    } else if (fs.existsSync(backup.file_path)) {
      const maxAttempts = 5;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          fs.unlinkSync(backup.file_path);
          break;
        } catch (e) {
          if (e.code === 'EBUSY' && attempt < maxAttempts - 1) {
            await new Promise(r => setTimeout(r, 300));
            continue;
          }
          if (e.code === 'EBUSY') {
            logger.warn('Could not delete backup file (in use), removing DB record only: ' + backup.file_path);
            break;
          }
          throw e;
        }
      }
    }
  }

  await backupRepo.deleteById(id);

  success(res, null, 'Backup deleted successfully');
}

async function getSchedules(req, res) {
  const result = await backupRepo.getAllSchedules();
  success(res, result.rows);
}

async function createSchedule(req, res) {
  const { frequency, time_of_day, retention_days, custom_date, run_once, selected_tables, row_limits, backup_format } = req.body;

  if (frequency && !['daily', 'weekly', 'monthly', 'one_time'].includes(frequency)) {
    throw new AppError('Invalid frequency value', 400);
  }

  const payload = {
    frequency: frequency || 'one_time',
    time_of_day: time_of_day || '00:00:00',
    retention_days: retention_days || 30,
    enabled: true,
    custom_date: custom_date || null,
    run_once: run_once !== undefined ? run_once : (frequency === 'one_time'),
    selected_tables: selected_tables || null,
    row_limits: row_limits || null,
    backup_format: backup_format || 'sql'
  };

  let result;
  try {
    result = await backupRepo.createSchedule(payload);
  } catch (err) {
    if (err.message && err.message.includes('Unknown column')) {
      const safe = { ...payload };
      delete safe.selected_tables;
      delete safe.row_limits;
      delete safe.backup_format;
      result = await backupRepo.createSchedule(safe);
    } else {
      throw err;
    }
  }

  const newSchedule = await backupRepo.getScheduleById(result.rows.insertId);

  stopScheduler();
  startScheduler().catch(err => logger.error('Failed to restart backup scheduler', err));

  created(res, newSchedule.rows[0], 'Backup schedule created successfully');
}

async function updateScheduleById(req, res) {
  const { id } = req.params;
  const updates = { ...req.body, updated_by: req.user?.id ?? null };
  delete updates.id;

  const existing = await backupRepo.getScheduleById(id);
  if (!existing.rows.length) {
    throw new AppError('Backup schedule not found', 404);
  }

  if (updates.frequency && !['daily', 'weekly', 'monthly', 'one_time'].includes(updates.frequency)) {
    throw new AppError('Invalid frequency value', 400);
  }

  // If updating to recurring, clear custom_date
  if (updates.frequency && ['daily', 'weekly', 'monthly'].includes(updates.frequency)) {
    updates.custom_date = null;
  }

  try {
    await backupRepo.updateSchedule(id, updates);
  } catch (err) {
    if (err.message && err.message.includes('Unknown column')) {
      const safe = { ...updates };
      delete safe.selected_tables;
      delete safe.row_limits;
      delete safe.backup_format;
      await backupRepo.updateSchedule(id, safe);
    } else {
      throw err;
    }
  }

  const updated = await backupRepo.getScheduleById(id);

  stopScheduler();
  startScheduler().catch(err => logger.error('Failed to restart backup scheduler', err));

  success(res, updated.rows[0], 'Backup schedule updated successfully');
}

async function deleteScheduleById(req, res) {
  const { id } = req.params;

  const existing = await backupRepo.getScheduleById(id);
  if (!existing.rows.length) {
    throw new AppError('Backup schedule not found', 404);
  }

  await backupRepo.deleteSchedule(id);

  stopScheduler();
  startScheduler().catch(err => logger.error('Failed to restart backup scheduler', err));

  success(res, null, 'Backup schedule deleted successfully');
}

export {
  triggerBackup,
  getHistory,
  getRecoverableHistory,
  getBackupById,
  restoreBackup,
  deleteBackup,
  getSchedules,
  createSchedule,
  updateScheduleById,
  deleteScheduleById
};
