import { user, dev, root } from '../db/query.js';

export async function create({ backup_type, size_bytes, status, file_path, initiated_by, duration_seconds }) {
  const sql = `
    INSERT INTO backup_history (backup_type, size_bytes, status, file_path, initiated_by, duration_seconds)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  return user(sql, [backup_type || 'manual', size_bytes, status || 'in_progress', file_path, initiated_by, duration_seconds]);
}

export async function findById(id) {
  const sql = 'SELECT * FROM backup_history WHERE id = ?';
  return user(sql, [id]);
}

export async function findAll({ page, limit, offset, status, backup_type }) {
  let sql = 'SELECT * FROM backup_history WHERE 1=1';
  const params = [];
  
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  
  if (backup_type) {
    sql += ' AND backup_type = ?';
    params.push(backup_type);
  }
  
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countResult = await dev(countSql, params);
  const total = countResult.rows[0].total;
  
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const result = await dev(sql, params);
  return { rows: result.rows, count: total };
}

export async function deleteById(id) {
  const sql = 'DELETE FROM backup_history WHERE id = ?';
  return user(sql, [id]);
}

export async function createLog(backup_id, level, message) {
  const sql = 'INSERT INTO backup_logs (backup_id, level, message) VALUES (?, ?, ?)';
  return user(sql, [backup_id, level || 'info', message]);
}

export async function getLogs(backup_id) {
  const sql = 'SELECT * FROM backup_logs WHERE backup_id = ? ORDER BY created_at ASC';
  return user(sql, [backup_id]);
}

export async function getSchedule() {
  const sql = 'SELECT * FROM backup_schedule LIMIT 1';
  return dev(sql);
}

export async function updateSchedule(id, { frequency, time_of_day, retention_days, enabled, updated_by, custom_date, run_once }) {
  const updates = [];
  const params = [];
  
  if (frequency !== undefined) {
    updates.push('frequency = ?');
    params.push(frequency);
  }
  
  if (time_of_day !== undefined) {
    updates.push('time_of_day = ?');
    params.push(time_of_day);
  }
  
  if (retention_days !== undefined) {
    updates.push('retention_days = ?');
    params.push(retention_days);
  }
  
  if (enabled !== undefined) {
    updates.push('enabled = ?');
    params.push(enabled);
  }
  
  if (updated_by !== undefined) {
    updates.push('updated_by = ?');
    params.push(updated_by);
  }

  if (custom_date !== undefined) {
    updates.push('custom_date = ?');
    params.push(custom_date);
  }

  if (run_once !== undefined) {
    updates.push('run_once = ?');
    params.push(run_once);
  }
  
  if (updates.length === 0) {
    return { rows: [] };
  }
  
  params.push(id);
  const sql = `UPDATE backup_schedule SET ${updates.join(', ')} WHERE id = ?`;
  return root(sql, params);
}

export async function updateLastRun(id, last_run, next_run) {
  const sql = 'UPDATE backup_schedule SET last_run = ?, next_run = ? WHERE id = ?';
  return dev(sql, [last_run, next_run, id]);
}