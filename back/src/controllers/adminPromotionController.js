import * as promotionRepo from '../repositories/promotionReposity.js';
import { dev, root, user as userQuery } from '../db/query.js';
import { log } from '../repositories/auditRepository.js';
import AppError from '../utils/AppError.js';
import { success, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';

async function getQueue(req, res) {
  const { page, limit, offset } = getPagination(req.query);

  const result = await promotionRepo.findPending({ page, limit, offset });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function review(req, res) {
  const { id } = req.params;
  const { status, rejection_reason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Status must be approved or rejected', 400);
  }

  if (status === 'rejected' && !rejection_reason) {
    throw new AppError('Rejection reason is required when rejecting', 400);
  }

  const requestResult = await dev(
    `SELECT pq.*, u.email, u.username FROM promotion_queue pq
     JOIN users u ON pq.user_id = u.id
     WHERE pq.id = ?`, [id]
  );
  if (!requestResult.rows.length) {
    throw new AppError('Promotion request not found', 404);
  }

  const promotion = requestResult.rows[0];
  if (promotion.status !== 'pending') {
    throw new AppError('This request has already been reviewed', 400);
  }

  await promotionRepo.updateStatus(id, status, req.user.id, rejection_reason || null);

  if (status === 'approved') {
    await root('UPDATE users SET role = ? WHERE id = ?', ['mentor', promotion.user_id]);
  }

  await log({
    admin_id: req.user.id,
    admin_role: req.user.role,
    action_type: `promotion_${status}`,
    target_type: 'promotion_queue',
    target_id: id,
    method: req.method,
    ip_address: req.ip,
    details: { user_id: promotion.user_id, rejection_reason: rejection_reason || null }
  });

  if (promotion.email) {
    const formType = status === 'approved' ? 'promotion_approved' : 'promotion_rejected';
    const subject = status === 'approved'
      ? 'Mentor Promotion Approved'
      : 'Mentor Promotion Rejected';
    const body = status === 'approved'
      ? `Congratulations ${promotion.username}! Your request to become a mentor has been approved. You can now start mentoring students.`
      : `Your request to become a mentor has been rejected.${rejection_reason ? `\nReason: ${rejection_reason}` : ''}\nYou may re-apply once you meet the requirements.`;
    await userQuery(
      `INSERT INTO admin_sent_forms (subject, recipient_id, sent_by, form_type, body, related_entity_type, related_entity_id)
       VALUES (?, ?, ?, ?, ?, 'promotion', ?)`,
      [subject, promotion.user_id, req.user.id, formType, body, id]
    );
  }

  const updated = await dev(
    `SELECT pq.*, u.email, u.username FROM promotion_queue pq
     JOIN users u ON pq.user_id = u.id
     WHERE pq.id = ?`, [id]
  );
  success(res, updated.rows[0], `Promotion request ${status} successfully`);
}

async function getRequirements(req, res) {
  const result = await dev('SELECT * FROM mentor_requirements ORDER BY id ASC');
  success(res, result.rows);
}

async function updateRequirement(req, res) {
  const { id } = req.params;
  const { requirement_name, threshold_value, description, is_active } = req.body;

  const existing = await dev('SELECT * FROM mentor_requirements WHERE id = ?', [id]);
  if (!existing.rows.length) {
    throw new AppError('Requirement not found', 404);
  }

  await promotionRepo.updateRequirement(id, { requirement_name, threshold_value, description, is_active });

  await log({
    admin_id: req.user.id,
    admin_role: req.user.role,
    action_type: 'update_requirement',
    target_type: 'mentor_requirements',
    target_id: id,
    method: req.method,
    ip_address: req.ip,
    details: { requirement_name, threshold_value, description, is_active }
  });

  const updated = await dev('SELECT * FROM mentor_requirements WHERE id = ?', [id]);
  success(res, updated.rows[0], 'Requirement updated successfully');
}

export {
  getQueue,
  review,
  getRequirements,
  updateRequirement
};
