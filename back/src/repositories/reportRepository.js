import { user } from '../db/query.js';

export async function findActiveByUserAndProject(reported_by, project_id) {
  const sql = `
    SELECT id, status FROM reports
    WHERE reported_by = ? AND project_id = ? AND status IN ('pending', 'under_review')
  `;
  return user(sql, [reported_by, project_id]);
}

export async function create({ project_id, reported_by, reason, description, priority }) {
  const sql = `
    INSERT INTO reports (project_id, reported_by, reason, description, priority)
    VALUES (?, ?, ?, ?, ?)
  `;
  return user(sql, [project_id, reported_by, reason, description, priority || 'low']);
}

export async function findById(id) {
  const sql = `
    SELECT r.*, 
           p.title as project_title,
           rb.username as reporter_username, rb.full_name as reporter_name,
           a.username as assignee_username, a.full_name as assignee_name
    FROM reports r
    JOIN projects p ON r.project_id = p.id
    JOIN users rb ON r.reported_by = rb.id
    LEFT JOIN users a ON r.assigned_to = a.id
    WHERE r.id = ?
  `;
  return user(sql, [id]);
}

export async function findByUser(reported_by, { page, limit, offset }) {
  const countSql = 'SELECT COUNT(*) as total FROM reports WHERE reported_by = ?';
  const countResult = await user(countSql, [reported_by]);
  const total = countResult.rows[0].total;
  
  const sql = `
    SELECT r.*, p.title as project_title
    FROM reports r
    JOIN projects p ON r.project_id = p.id
    WHERE r.reported_by = ?
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const result = await user(sql, [reported_by, limit, offset]);
  return { rows: result.rows, count: total };
}

export async function findByProjectOwner(owner_id, { page, limit, offset }) {
  const countSql = `
    SELECT COUNT(*) as total FROM reports r
    JOIN projects p ON r.project_id = p.id
    WHERE p.author_id = ?
  `;
  const countResult = await user(countSql, [owner_id]);
  const total = countResult.rows[0].total;

  const sql = `
    SELECT r.*, p.title as project_title,
           rb.username as reporter_username, rb.full_name as reporter_name
    FROM reports r
    JOIN projects p ON r.project_id = p.id
    JOIN users rb ON r.reported_by = rb.id
    WHERE p.author_id = ?
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const result = await user(sql, [owner_id, limit, offset]);
  return { rows: result.rows, count: total };
}

export async function findAll({ page, limit, offset, status, priority, assigned_to }) {
  let sql = `
    SELECT r.*, 
           p.title as project_title,
           rb.username as reporter_username,
           a.username as assignee_username,
           rb2.username as resolved_by_username,
           rr.response_type,
           rr.message as response_message,
           rr.created_at as response_date
    FROM reports r
    JOIN projects p ON r.project_id = p.id
    JOIN users rb ON r.reported_by = rb.id
    LEFT JOIN users a ON r.assigned_to = a.id
    LEFT JOIN users rb2 ON r.resolved_by = rb2.id
    LEFT JOIN report_responses rr ON rr.report_id = r.id
    WHERE 1=1
  `;
  const params = [];
  
  if (status) {
    sql += ' AND r.status = ?';
    params.push(status);
  }
  
  if (priority) {
    sql += ' AND r.priority = ?';
    params.push(priority);
  }
  
  if (assigned_to) {
    sql += ' AND r.assigned_to = ?';
    params.push(assigned_to);
  }
  
  const countSql = sql.replace(/SELECT r\.\*,.*?FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await user(countSql, params);
  const total = countResult.rows[0].total;
  
  sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const result = await user(sql, params);
  return { rows: result.rows, count: total };
}

export async function updateStatus(id, status) {
  const sql = 'UPDATE reports SET status = ? WHERE id = ?';
  return user(sql, [status, id]);
}

export async function assignModerator(id, assigned_to) {
  const sql = 'UPDATE reports SET assigned_to = ?, status = ? WHERE id = ?';
  return user(sql, [assigned_to, 'under_review', id]);
}

export async function updateResolvedBy(id, resolved_by) {
  const sql = 'UPDATE reports SET resolved_by = ? WHERE id = ?';
  return user(sql, [resolved_by, id]);
}

export async function createResponse({ report_id, responded_by, response_type, message }) {
  const sql = `
    INSERT INTO report_responses (report_id, responded_by, response_type, message)
    VALUES (?, ?, ?, ?)
  `;
  return user(sql, [report_id, responded_by, response_type, message]);
}

export async function archiveReport({ report_id, project_id, project_title, reported_by_username, reason, final_status, handled_by, response_time_minutes, resolution_message }) {
  const sql = `
    INSERT INTO report_history 
    (report_id, project_id, project_title, reported_by_username, reason, final_status, handled_by, response_time_minutes, resolution_message, resolved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  return user(sql, [report_id, project_id, project_title, reported_by_username, reason, final_status, handled_by, response_time_minutes, resolution_message]);
}