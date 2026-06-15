import { user } from '../db/query.js';

export async function saveFile({ user_id, filename, original_name, mime_type, file_size, file_path, upload_type }) {
  const sql = `
    INSERT INTO uploads (user_id, filename, original_name, mime_type, file_size, file_path, upload_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  return user(sql, [user_id, filename, original_name, mime_type, file_size, file_path, upload_type || 'other']);
}

export async function findByProjectId(project_id) {
  const sql = 'SELECT * FROM uploads WHERE id = ? AND upload_type = ?';
  return user(sql, [project_id, 'resource']);
}

export async function findById(id) {
  const sql = 'SELECT * FROM uploads WHERE id = ?';
  return user(sql, [id]);
}

export async function deleteById(id) {
  const sql = 'DELETE FROM uploads WHERE id = ?';
  return user(sql, [id]);
}