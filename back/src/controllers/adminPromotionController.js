import * as promotionRepo from '../repositories/promotionReposity.js';
import { dev, root } from '../db/query.js';
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

  const requestResult = await dev('SELECT * FROM promotion_queue WHERE id = ?', [id]);
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

  const updated = await dev('SELECT * FROM promotion_queue WHERE id = ?', [id]);
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
