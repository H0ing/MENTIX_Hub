import { user } from '../db/query.js';

export async function create({ project_id, user_id, parent_id, content }) {
  const sql = `
    INSERT INTO comments (project_id, user_id, parent_id, content)
    VALUES (?, ?, ?, ?)
  `;
  return user(sql, [project_id, user_id, parent_id || null, content]);
}

export async function findByProjectId(project_id, { page, limit, offset }) {
  const countSql = `
    SELECT COUNT(*) as total 
    FROM comments 
    WHERE project_id = ? AND parent_id IS NULL AND is_deleted = FALSE
  `;
  const countResult = await user(countSql, [project_id]);
  const total = countResult.rows[0].total;
  
  const sql = `
    SELECT c.*, u.username, u.full_name, u.avatar_url,
           (SELECT COUNT(*) FROM comments replies WHERE replies.parent_id = c.id AND replies.is_deleted = FALSE) as reply_count
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.project_id = ? AND c.parent_id IS NULL AND c.is_deleted = FALSE
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const result = await user(sql, [project_id, limit, offset]);
  return { rows: result.rows, count: total };
}

export async function findReplies(parent_id) {
  const sql = `
    SELECT c.*, u.username, u.full_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.parent_id = ? AND c.is_deleted = FALSE
    ORDER BY c.created_at ASC
  `;
  return user(sql, [parent_id]);
}

export async function update(id, content) {
  const sql = 'UPDATE comments SET content = ?, is_edited = TRUE WHERE id = ?';
  return user(sql, [content, id]);
}

export async function deleteById(id) {
  const checkSql = 'SELECT COUNT(*) as reply_count FROM comments WHERE parent_id = ? AND is_deleted = FALSE';
  const checkResult = await user(checkSql, [id]);
  const replyCount = checkResult.rows[0].reply_count;
  
  if (replyCount > 0) {
    const softSql = "UPDATE comments SET is_deleted = TRUE, content = '[deleted]' WHERE id = ?";
    return user(softSql, [id]);
  } else {
    const hardSql = 'DELETE FROM comments WHERE id = ?';
    return user(hardSql, [id]);
  }
}