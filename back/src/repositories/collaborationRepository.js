import { user } from '../db/query.js';

export async function create({ sender_id, receiver_id, project_interest, benefit, why_needed }) {
  const sql = `
    INSERT INTO collaboration_requests (sender_id, receiver_id, project_interest, benefit, why_needed)
    VALUES (?, ?, ?, ?, ?)
  `;
  return user(sql, [sender_id, receiver_id, project_interest, benefit, why_needed]);
}

export async function findById(id) {
  const sql = `
    SELECT cr.*,
           s.username as sender_username, s.full_name as sender_name, s.avatar_url as sender_avatar,
           r.username as receiver_username, r.full_name as receiver_name, r.avatar_url as receiver_avatar
    FROM collaboration_requests cr
    JOIN users s ON cr.sender_id = s.id
    JOIN users r ON cr.receiver_id = r.id
    WHERE cr.id = ?
  `;
  return user(sql, [id]);
}

export async function findBySender(sender_id, { page, limit, offset }) {
  const countSql = 'SELECT COUNT(*) as total FROM collaboration_requests WHERE sender_id = ?';
  const countResult = await user(countSql, [sender_id]);
  const total = countResult.rows[0].total;
  
  const sql = `
    SELECT cr.*, r.username as receiver_username, r.full_name as receiver_name, r.avatar_url as receiver_avatar
    FROM collaboration_requests cr
    JOIN users r ON cr.receiver_id = r.id
    WHERE cr.sender_id = ?
    ORDER BY cr.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const result = await user(sql, [sender_id, limit, offset]);
  return { rows: result.rows, count: total };
}

export async function findByReceiver(receiver_id, { page, limit, offset }) {
  const countSql = 'SELECT COUNT(*) as total FROM collaboration_requests WHERE receiver_id = ?';
  const countResult = await user(countSql, [receiver_id]);
  const total = countResult.rows[0].total;
  
  const sql = `
    SELECT cr.*, s.username as sender_username, s.full_name as sender_name, s.avatar_url as sender_avatar
    FROM collaboration_requests cr
    JOIN users s ON cr.sender_id = s.id
    WHERE cr.receiver_id = ?
    ORDER BY cr.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const result = await user(sql, [receiver_id, limit, offset]);
  return { rows: result.rows, count: total };
}

export async function updateStatus(id, status, response_message, responded_at) {
  const sql = `
    UPDATE collaboration_requests 
    SET status = ?, response_message = ?, responded_at = ?
    WHERE id = ?
  `;
  const responseJson = response_message ? JSON.stringify(response_message) : null;
  return user(sql, [status, responseJson, responded_at || new Date(), id]);
}

export async function deleteById(id) {
  const sql = 'DELETE FROM collaboration_requests WHERE id = ?';
  return user(sql, [id]);
}