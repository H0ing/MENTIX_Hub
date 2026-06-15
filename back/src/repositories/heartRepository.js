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