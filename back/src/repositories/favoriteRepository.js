import { user } from '../db/query.js';

export async function addFavorite(user_id, project_id) {
  const sql = 'INSERT INTO favorites (user_id, project_id) VALUES (?, ?)';
  return user(sql, [user_id, project_id]);
}

export async function removeFavorite(user_id, project_id) {
  const sql = 'DELETE FROM favorites WHERE user_id = ? AND project_id = ?';
  return user(sql, [user_id, project_id]);
}

export async function findFavorite(user_id, project_id) {
  const sql = 'SELECT * FROM favorites WHERE user_id = ? AND project_id = ?';
  return user(sql, [user_id, project_id]);
}

export async function findByUserId(user_id, { page, limit, offset }) {
  const countSql = 'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?';
  const countResult = await user(countSql, [user_id]);
  const total = countResult.rows[0].total;
  
  const sql = `
    SELECT f.*, p.title, p.description, p.thumbnail, p.view_count, p.created_at,
           u.username, u.full_name, u.avatar_url
    FROM favorites f
    JOIN projects p ON f.project_id = p.id
    JOIN users u ON p.author_id = u.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const result = await user(sql, [user_id, limit, offset]);
  return { rows: result.rows, count: total };
}