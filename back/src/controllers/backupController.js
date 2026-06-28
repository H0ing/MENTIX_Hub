import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import util from 'util';
import { exec } from 'child_process';
import * as backupRepo from '../repositories/backupRepository.js';
import { user as userQuery, dev, root } from '../db/query.js';
import { rootDB } from '../db/pool.js';
import { startScheduler, stopScheduler } from '../jobs/backupScheduler.js';
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

async function triggerBackup(req, res) {
  logger.info('Backup triggered', { method: req.method, url: req.originalUrl });

  const connection = await rootDB.getConnection();
  logger.info('Got DB connection');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
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
    await connection.query('FLUSH TABLES WITH READ LOCK');
    logger.info('Tables locked');

    try {
      const mysqldump = config.mysqldumpPath;
      logger.info('Using mysqldump: ' + mysqldump);
      await execPromise(
        `"${mysqldump}" --host=${config.db.host} --port=${config.db.port} --user=${config.db.users.root.user} --password=${config.db.users.root.password} ${config.db.database} > "${filePath}"`,
        { timeout: 300000 }
      );
      logger.info('mysqldump completed');
      durationSeconds = Math.round((Date.now() - dumpStart) / 1000);
    } catch (dumpError) {
      logger.error('mysqldump failed: ' + dumpError.message);
      durationSeconds = Math.round((Date.now() - dumpStart) / 1000);
      dumpErrorObj = dumpError;
    } finally {
      try { await connection.query('UNLOCK TABLES'); } catch (e) { logger.error('UNLOCK TABLES failed: ' + e.message); }
      logger.info('Tables unlocked');
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
    await userQuery(
      'UPDATE backup_history SET status = ?, size_bytes = ?, duration_seconds = ? WHERE id = ?',
      ['success', stats.size, durationSeconds, backupId]
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

async function getHistory(req, res) {
  const { status, backup_type } = req.query;
  const { page, limit, offset } = getPagination(req.query);

  const result = await backupRepo.findAll({ page, limit, offset, status, backup_type });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function getRecoverableHistory(req, res) {
  const { page, limit, offset } = getPagination(req.query);

  const result = await backupRepo.findAll({ page, limit, offset, status: 'success' });
  const filtered = result.rows.filter(b => fs.existsSync(b.file_path));

  paginated(res, { rows: filtered, count: filtered.length, page, limit });
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

  if (!fs.existsSync(backup.file_path)) {
    throw new AppError('Backup file not found on disk', 404);
  }

  await backupRepo.createLog(id, 'info', 'Restore initiated');

  try {
    const restoreStart = Date.now();

    const mysql = config.mysqlPath;
    logger.info('Using mysql: ' + mysql);
    await execPromise(
      `"${mysql}" --host=${config.db.host} --port=${config.db.port} --user=${config.db.users.root.user} --password=${config.db.users.root.password} ${config.db.database} < "${backup.file_path}"`,
      { timeout: 600000 }
    );

    const durationSeconds = Math.round((Date.now() - restoreStart) / 1000);

    await backupRepo.createLog(id, 'info', `Restore completed successfully in ${durationSeconds}s`);

    success(res, { backup_id: id, duration_seconds: durationSeconds }, 'Database restored successfully');
  } catch (restoreError) {
    await backupRepo.createLog(id, 'error', 'Restore failed: ' + restoreError.message);
    throw new AppError('Restore failed: ' + restoreError.message, 500);
  }
}

async function deleteBackup(req, res) {
  const { id } = req.params;

  const backupResult = await backupRepo.findById(id);
  if (!backupResult.rows.length) {
    throw new AppError('Backup not found', 404);
  }

  const backup = backupResult.rows[0];
  if (backup.file_path && fs.existsSync(backup.file_path)) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        fs.unlinkSync(backup.file_path);
        break;
      } catch (e) {
        if (e.code === 'EBUSY' && attempt < 4) {
          await new Promise(r => setTimeout(r, 300));
          continue;
        }
        throw e;
      }
    }
  }

  await backupRepo.deleteById(id);

  success(res, null, 'Backup deleted successfully');
}

async function getSchedule(req, res) {
  const result = await backupRepo.getSchedule();
  success(res, result.rows[0] || null);
}

async function updateSchedule(req, res) {
  const { frequency, time_of_day, retention_days, enabled, custom_date, run_once } = req.body;

  const existing = await backupRepo.getSchedule();
  if (!existing.rows.length) {
    throw new AppError('No backup schedule found', 404);
  }

  const schedule = existing.rows[0];

  const updates = {
    time_of_day,
    retention_days,
    enabled,
    updated_by: req.user?.id ?? null
  };

  if (frequency !== undefined) {
    updates.frequency = frequency;
    updates.custom_date = null;
  }

  if (custom_date !== undefined) {
    updates.custom_date = custom_date || null;
  }

  if (run_once !== undefined) {
    updates.run_once = run_once;
  }

  await backupRepo.updateSchedule(schedule.id, updates);

  const updated = await backupRepo.getSchedule();

  stopScheduler();
  startScheduler().catch(err => logger.error('Failed to restart backup scheduler', err));

  success(res, updated.rows[0], 'Backup schedule updated successfully');
}

export {
  triggerBackup,
  getHistory,
  getRecoverableHistory,
  getBackupById,
  restoreBackup,
  deleteBackup,
  getSchedule,
  updateSchedule
};
