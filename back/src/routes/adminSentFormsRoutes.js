import { Router } from 'express';
import { dev } from '../db/query.js';
import { success, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';
import authenticate from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import catchAsync from '../utils/catchAsync.js';

const router = Router();

// GET /admin/sent-forms — list all sent forms (super_admin + moderator only)
router.get('/', authenticate, authorize('moderator', 'super_admin'), catchAsync(async (req, res) => {
  const { type, search } = req.query;
  const { page, limit, offset } = getPagination(req.query);

  let sql = `
    SELECT
      f.id,
      f.subject,
      f.form_type,
      f.body,
      f.sent_at,
      f.related_entity_type,
      f.related_entity_id,
      recipient.username  AS recipient_username,
      recipient.email     AS recipient_email,
      sender.username     AS sent_by_username,
      sender.role         AS sent_by_role
    FROM admin_sent_forms f
    JOIN users recipient ON f.recipient_id = recipient.id
    JOIN users sender    ON f.sent_by      = sender.id
    WHERE 1=1
  `;
  const params = [];

  if (type) { sql += ' AND f.form_type = ?'; params.push(type); }
  if (search) {
    sql += ' AND (f.subject LIKE ? OR recipient.username LIKE ? OR recipient.email LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countSql = sql.replace(
    /SELECT[\s\S]+?FROM admin_sent_forms/,
    'SELECT COUNT(*) AS total FROM admin_sent_forms'
  );
  const countResult = await dev(countSql, params);
  const total = countResult.rows[0].total;

  sql += ' ORDER BY f.sent_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await dev(sql, params);
  paginated(res, { rows: result.rows, count: total, page, limit });
}));

// GET /admin/sent-forms/:id — detail
router.get('/:id', authenticate, authorize('moderator', 'super_admin'), catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await dev(
    `SELECT f.*,
            recipient.username AS recipient_username,
            recipient.email    AS recipient_email,
            sender.username    AS sent_by_username,
            sender.role        AS sent_by_role
     FROM admin_sent_forms f
     JOIN users recipient ON f.recipient_id = recipient.id
     JOIN users sender    ON f.sent_by      = sender.id
     WHERE f.id = ?`,
    [id]
  );
  if (!result.rows.length) {
    return res.status(404).json({ success: false, message: 'Form not found' });
  }
  success(res, result.rows[0]);
}));

export default router;
