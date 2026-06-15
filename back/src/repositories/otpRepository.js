import { user } from '../db/query.js';

export async function create(user_id, otp_code, type, expires_at) {
  const sql = 'INSERT INTO email_verifications (user_id, otp_code, type, expires_at) VALUES (?, ?, ?, ?)';
  return user(sql, [user_id, otp_code, type, expires_at]);
}

export async function findLatestByUserAndType(user_id, type) {
  const sql = `
    SELECT * FROM email_verifications 
    WHERE user_id = ? AND type = ? AND used = FALSE AND expires_at > NOW()
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  return user(sql, [user_id, type]);
}

export async function markAsUsed(id) {
  const sql = 'UPDATE email_verifications SET used = TRUE WHERE id = ?';
  return user(sql, [id]);
}