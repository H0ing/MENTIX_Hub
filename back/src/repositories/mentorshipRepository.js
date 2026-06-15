import { user } from '../db/query.js';

export async function create({ student_id, mentor_id, project_context, help_needed }) {
  const sql = `
    INSERT INTO mentorship_requests (student_id, mentor_id, project_context, help_needed)
    VALUES (?, ?, ?, ?)
  `;
  return user(sql, [student_id, mentor_id, project_context, help_needed]);
}

export async function findById(id) {
  const sql = `
    SELECT mr.*, 
           s.username as student_username, s.full_name as student_name, s.avatar_url as student_avatar,
           m.username as mentor_username, m.full_name as mentor_name, m.avatar_url as mentor_avatar
    FROM mentorship_requests mr
    JOIN users s ON mr.student_id = s.id
    JOIN users m ON mr.mentor_id = m.id
    WHERE mr.id = ?
  `;
  return user(sql, [id]);
}

export async function findByStudent(student_id, { page, limit, offset }) {
  const countSql = 'SELECT COUNT(*) as total FROM mentorship_requests WHERE student_id = ?';
  const countResult = await user(countSql, [student_id]);
  const total = countResult.rows[0].total;
  
  const sql = `
    SELECT mr.*, m.username as mentor_username, m.full_name as mentor_name, m.avatar_url as mentor_avatar
    FROM mentorship_requests mr
    JOIN users m ON mr.mentor_id = m.id
    WHERE mr.student_id = ?
    ORDER BY mr.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const result = await user(sql, [student_id, limit, offset]);
  return { rows: result.rows, count: total };
}

export async function findByMentor(mentor_id, { page, limit, offset }) {
  const countSql = 'SELECT COUNT(*) as total FROM mentorship_requests WHERE mentor_id = ?';
  const countResult = await user(countSql, [mentor_id]);
  const total = countResult.rows[0].total;
  
  const sql = `
    SELECT mr.*, s.username as student_username, s.full_name as student_name, s.avatar_url as student_avatar
    FROM mentorship_requests mr
    JOIN users s ON mr.student_id = s.id
    WHERE mr.mentor_id = ?
    ORDER BY mr.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const result = await user(sql, [mentor_id, limit, offset]);
  return { rows: result.rows, count: total };
}

export async function updateStatus(id, status, mentor_response, responded_at) {
  const sql = `
    UPDATE mentorship_requests 
    SET status = ?, mentor_response = ?, responded_at = ?
    WHERE id = ?
  `;
  const responseJson = mentor_response ? JSON.stringify(mentor_response) : null;
  return user(sql, [status, responseJson, responded_at || new Date(), id]);
}