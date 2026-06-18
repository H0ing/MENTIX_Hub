import { user } from '../db/query.js';

export async function addHeart(user_id, project_id) {
  const sql = 'INSERT INTO hearts (user_id, project_id) VALUES (?, ?)';
  return user(sql, [user_id, project_id]);
}

export async function removeHeart(user_id, project_id) {
  const sql = 'DELETE FROM hearts WHERE user_id = ? AND project_id = ?';
  return user(sql, [user_id, project_id]);
}

export async function findHeart(user_id, project_id) {
  const sql = 'SELECT * FROM hearts WHERE user_id = ? AND project_id = ?';
  return user(sql, [user_id, project_id]);
}

export async function countByProject(project_id) {
  const sql = 'SELECT COUNT(*) as count FROM hearts WHERE project_id = ?';
  return user(sql, [project_id]);
}

export async function findByUserId(user_id, { page, limit, offset }) {
  const countSql = 'SELECT COUNT(*) as total FROM hearts WHERE user_id = ?';
  const countResult = await user(countSql, [user_id]);
  const total = countResult.rows[0].total;

  const sql = `
    SELECT h.*, p.title, p.description, p.thumbnail, p.view_count, p.created_at,
           u.username, u.full_name, u.avatar_url
    FROM hearts h
    JOIN projects p ON h.project_id = p.id
    JOIN users u ON p.author_id = u.id
    WHERE h.user_id = ?
    ORDER BY h.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const result = await user(sql, [user_id, limit, offset]);
  return { rows: result.rows, count: total };
}