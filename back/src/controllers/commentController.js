import { user } from '../db/query.js';
import * as commentRepo from '../repositories/commentRepository.js';
import AppError from '../utils/AppError.js';
import { success, created, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';

async function getCommentDepth(commentId) {
  const sql = `
    WITH RECURSIVE cte AS (
      SELECT id, parent_id, 1 AS lvl FROM comments WHERE id = ?
      UNION ALL
      SELECT c.id, c.parent_id, cte.lvl + 1 FROM comments c JOIN cte ON c.id = cte.parent_id
    )
    SELECT MAX(lvl) AS depth FROM cte
  `;
  const result = await user(sql, [commentId]);
  return result.rows[0]?.depth || 0;
}

async function create(req, res) {
  const { project_id, parent_id, content } = req.body;
  const user_id = req.user.id;

  const projectResult = await user('SELECT id FROM projects WHERE id = ?', [project_id]);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  if (parent_id) {
    const parentResult = await user('SELECT id, is_deleted FROM comments WHERE id = ?', [parent_id]);
    if (!parentResult.rows.length) {
      throw new AppError('Parent comment not found', 404);
    }

    if (parentResult.rows[0].is_deleted) {
      throw new AppError('Cannot reply to a deleted comment', 400);
    }

    const depth = await getCommentDepth(parent_id);
    if (depth >= 3) {
      throw new AppError('Maximum reply depth (3) reached', 400);
    }
  }

  const result = await commentRepo.create({ project_id, user_id, parent_id, content });
  const commentId = result.rows.insertId;

  const commentResult = await user(`
    SELECT c.*, u.username, u.full_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `, [commentId]);

  created(res, commentResult.rows[0], 'Comment created successfully');
}

async function getByProject(req, res) {
  const { projectId } = req.params;
  const { page, limit, offset } = getPagination(req.query);

  const projectResult = await user('SELECT id FROM projects WHERE id = ?', [projectId]);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const result = await commentRepo.findByProjectId(projectId, { page, limit, offset });
  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function getReplies(req, res) {
  const { id } = req.params;

  const commentResult = await user('SELECT id FROM comments WHERE id = ? AND is_deleted = FALSE', [id]);
  if (!commentResult.rows.length) {
    throw new AppError('Comment not found', 404);
  }

  const result = await commentRepo.findReplies(id);
  success(res, result.rows || []);
}

async function update(req, res) {
  const { id } = req.params;
  const { content } = req.body;

  const commentResult = await user(`
    SELECT c.*, u.username, u.full_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `, [id]);

  if (!commentResult.rows.length) {
    throw new AppError('Comment not found', 404);
  }

  const comment = commentResult.rows[0];

  if (comment.is_deleted) {
    throw new AppError('Cannot edit a deleted comment', 400);
  }

  if (comment.user_id !== req.user.id) {
    throw new AppError('You do not have permission to update this comment', 403);
  }

  const hoursSinceCreation = (Date.now() - new Date(comment.created_at).getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation > 24) {
    throw new AppError('Comments can only be edited within 24 hours of posting', 400);
  }

  await commentRepo.update(id, content);

  const updatedResult = await user(`
    SELECT c.*, u.username, u.full_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `, [id]);

  success(res, updatedResult.rows[0], 'Comment updated successfully');
}

async function deleteComment(req, res) {
  const { id } = req.params;

  const commentResult = await user(`
    SELECT c.*, u.username, u.full_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `, [id]);

  if (!commentResult.rows.length) {
    throw new AppError('Comment not found', 404);
  }

  const comment = commentResult.rows[0];

  if (comment.user_id !== req.user.id && !['moderator', 'dev_admin', 'super_admin'].includes(req.user.role)) {
    throw new AppError('You do not have permission to delete this comment', 403);
  }

  await commentRepo.deleteById(id);
  success(res, null, 'Comment deleted successfully');
}

export { create, getByProject, getReplies, update, deleteComment as delete };
