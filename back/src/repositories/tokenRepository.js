import { user } from '../db/query.js';

export async function create(user_id, token, expires_at) {
  const sql = 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';
  return user(sql, [user_id, token, expires_at]);
}

export async function findByToken(token) {
  const sql = 'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()';
  return user(sql, [token]);
}

export async function deleteByToken(token) {
  const sql = 'DELETE FROM refresh_tokens WHERE token = ?';
  return user(sql, [token]);
}

export async function deleteAllByUserId(user_id) {
  const sql = 'DELETE FROM refresh_tokens WHERE user_id = ?';
  return user(sql, [user_id]);
}