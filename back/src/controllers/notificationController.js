import { user } from '../db/query.js';
import { success } from '../utils/response.js';

async function getMyNotifications(req, res) {
  const result = await user(
    `SELECT id, subject, form_type, body, related_entity_type, related_entity_id, sent_at
     FROM admin_sent_forms
     WHERE recipient_id = ?
     ORDER BY sent_at DESC`,
    [req.user.id]
  );
  success(res, result.rows);
}

export {
  getMyNotifications
};
