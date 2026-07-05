import { dev, user as userQuery } from '../db/query.js';
import AppError from '../utils/AppError.js';
import { success, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';

const TYPE_LABEL = {
  report_resolution:   'System Notification',
  promotion_approved:  'Promotion Notice',
  promotion_rejected:  'Promotion Notice',
  account_action:      'Account Action',
  other:               'System Notification',
};

async function getAllSentForms(req, res) {
  const { page, limit, offset } = getPagination(req.query);

  const countResult = await dev(
    `SELECT COUNT(*) as total FROM admin_sent_forms`
  );
  const total = countResult.rows[0].total;

  const result = await dev(
    `SELECT f.*,
            u.email as recipient_email, u.username as recipient_username,
            s.email as sender_email, s.username as sender_username
     FROM admin_sent_forms f
     JOIN users u ON f.recipient_id = u.id
     JOIN users s ON f.sent_by = s.id
     ORDER BY f.sent_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const rows = result.rows.map(r => ({
    ...r,
    type: TYPE_LABEL[r.form_type] || r.form_type,
  }));

  paginated(res, { rows, count: total, page, limit });
}

async function getSentFormById(req, res) {
  const { id } = req.params;

  const result = await dev(
    `SELECT f.*,
            u.email as recipient_email, u.username as recipient_username,
            s.email as sender_email, s.username as sender_username
     FROM admin_sent_forms f
     JOIN users u ON f.recipient_id = u.id
     JOIN users s ON f.sent_by = s.id
     WHERE f.id = ?`,
    [id]
  );

  if (!result.rows.length) {
    throw new AppError('Sent form not found', 404);
  }

  const row = result.rows[0];
  row.type = TYPE_LABEL[row.form_type] || row.form_type;

  success(res, row);
}

async function getFormReplies(req, res) {
  const { id } = req.params;

  const formResult = await dev('SELECT id FROM admin_sent_forms WHERE id = ?', [id]);
  if (!formResult.rows.length) {
    throw new AppError('Sent form not found', 404);
  }

  const result = await dev(
    `SELECT r.*, u.email, u.username, u.full_name
     FROM admin_form_replies r
     JOIN users u ON r.replied_by = u.id
     WHERE r.form_id = ?
     ORDER BY r.sent_at ASC`,
    [id]
  );

  success(res, result.rows);
}

async function deleteSentForm(req, res) {
  const { id } = req.params;

  const existing = await dev('SELECT id FROM admin_sent_forms WHERE id = ?', [id]);
  if (!existing.rows.length) {
    throw new AppError('Sent form not found', 404);
  }

  await dev('DELETE FROM admin_sent_forms WHERE id = ?', [id]);
  success(res, null, 'Sent form deleted');
}

export {
  getAllSentForms,
  getSentFormById,
  getFormReplies,
  deleteSentForm,
};
