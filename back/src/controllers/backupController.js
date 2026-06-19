import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import util from 'util';
import { exec } from 'child_process';
import * as backupRepo from '../repositories/backupRepository.js';
import { dev, root } from '../db/query.js';
import { devDB } from '../db/pool.js';
import AppError from '../utils/AppError.js';
import { success, created, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';
import config from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = util.promisify(exec);

const BACKUP_DIR = path.resolve(__dirname, '../../backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function triggerBackup(req, res) {
  const connection = await devDB.getConnection();

  try {
    await connection.execute('FLUSH TABLES WITH READ LOCK');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `mentix_hub_backup_${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, filename);

    const result = await backupRepo.create({
      backup_type: 'manual',
      size_bytes: null,
      status: 'in_progress',
      file_path: filePath,
      initiated_by: req.user.id,
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

      await backupRepo.createLog(backupId, 'info', `Backup completed successfully in ${durationSeconds}s, size: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
    } catch (dumpError) {
      await dev(
        'UPDATE backup_history SET status = ? WHERE id = ?',
        ['failed', backupId]
      );

      await backupRepo.createLog(backupId, 'error', dumpError.message);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      throw new AppError('Backup failed: ' + dumpError.message, 500);
    }
  } finally {
    await connection.execute('UNLOCK TABLES');
    connection.release();
  }

  const backupResult = await backupRepo.findById(result.rows.insertId);
  const logs = await backupRepo.getLogs(result.rows.insertId);

  created(res, { ...backupResult.rows[0], logs: logs.rows }, 'Backup created successfully');
}

async function getHistory(req, res) {
  const { status, backup_type } = req.query;
  const { page, limit, offset } = getPagination(req.query);

  const result = await backupRepo.findAll({ page, limit, offset, status, backup_type });

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

  if (backup.status !== 'success') {
    throw new AppError('Cannot restore a backup that is not successful', 400);
  }

  if (!fs.existsSync(backup.file_path)) {
    throw new AppError('Backup file not found on disk', 404);
  }

  await backupRepo.createLog(id, 'info', 'Restore initiated');

  try {
    const restoreStart = Date.now();

    await execPromise(
      `mysql --host=${config.db.host} --port=${config.db.port} --user=${config.db.users.root.user} --password=${config.db.users.root.password} ${config.db.database} < "${backup.file_path}"`,
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

async function getSchedule(req, res) {
  const result = await backupRepo.getSchedule();
  success(res, result.rows[0] || null);
}

async function updateSchedule(req, res) {
  const { frequency, time_of_day, retention_days, enabled } = req.body;

  const existing = await backupRepo.getSchedule();
  if (!existing.rows.length) {
    throw new AppError('No backup schedule found', 404);
  }

  const schedule = existing.rows[0];

  await backupRepo.updateSchedule(schedule.id, {
    frequency,
    time_of_day,
    retention_days,
    enabled,
    updated_by: req.user.id
  });

  const updated = await backupRepo.getSchedule();
  success(res, updated.rows[0], 'Backup schedule updated successfully');
}

export {
  triggerBackup,
  getHistory,
  getBackupById,
  restoreBackup,
  getSchedule,
  updateSchedule
};
