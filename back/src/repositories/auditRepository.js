import { user, dev, root } from '../db/query.js';

export async function log({ admin_id, admin_role, action_type, target_type, target_id, method, ip_address, details }) {
  const sql = `
    INSERT INTO audit_logs (admin_id, admin_role, action_type, target_type, target_id, method, ip_address, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const detailsJson = details ? JSON.stringify(details) : null;
  return user(sql, [admin_id, admin_role, action_type, target_type, target_id, method, ip_address, detailsJson]);
}

export async function logRoot({ admin_id, admin_role, action_type, target_type, target_id, method, ip_address, details }) {
  const sql = `
    INSERT INTO audit_logs (admin_id, admin_role, action_type, target_type, target_id, method, ip_address, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const detailsJson = details ? JSON.stringify(details) : null;
  return root(sql, [admin_id, admin_role, action_type, target_type, target_id, method, ip_address, detailsJson]);
}

export async function findAll({ page, limit, offset, admin_id, action_type, target_type, target_id, start_date, end_date }) {
  let sql = `
    SELECT al.*, u.username as admin_username
    FROM audit_logs al
    LEFT JOIN users u ON al.admin_id = u.id
    WHERE 1=1
  `;
  const params = [];
  
  if (admin_id) {
    sql += ' AND al.admin_id = ?';
    params.push(admin_id);
  }
  
  if (action_type) {
    sql += ' AND al.action_type = ?';
    params.push(action_type);
  }
  
  if (target_type) {
    sql += ' AND al.target_type = ?';
    params.push(target_type);
  }
  
  if (target_id) {
    sql += ' AND al.target_id = ?';
    params.push(target_id);
  }
  
  if (start_date) {
    sql += ' AND al.created_at >= ?';
    params.push(start_date);
  }
  
  if (end_date) {
    sql += ' AND al.created_at <= ?';
    params.push(end_date);
  }
  
  const countSql = sql.replace(/SELECT al\.\*,.*?FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await dev(countSql, params);
  const total = countResult.rows[0].total;
  
  sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const result = await dev(sql, params);
  return { rows: result.rows, count: total };
}