import * as collabRepo from '../repositories/collaborationRepository.js';
import { findById as findUserById } from '../repositories/userRepository.js';
import AppError from '../utils/AppError.js';
import { success, created, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';

async function sendRequest(req, res) {
  const { receiver_id, project_interest, benefit, why_needed } = req.body;
  const sender_id = req.user.id;

  if (sender_id === receiver_id) {
    throw new AppError('You cannot send a collaboration request to yourself', 400);
  }

  const receiverResult = await findUserById(receiver_id);
  if (!receiverResult.rows.length) {
    throw new AppError('User not found', 404);
  }

  const result = await collabRepo.create({ sender_id, receiver_id, project_interest, benefit, why_needed });

  const requestResult = await collabRepo.findById(result.rows.insertId);
  created(res, requestResult.rows[0], 'Collaboration request sent successfully');
}

async function respond(req, res) {
  const { id } = req.params;
  const { status, response_message } = req.body;

  const requestResult = await collabRepo.findById(id);
  if (!requestResult.rows.length) {
    throw new AppError('Collaboration request not found', 404);
  }

  const request = requestResult.rows[0];
  if (request.receiver_id !== req.user.id) {
    throw new AppError('You are not the receiver of this request', 403);
  }

  if (request.status !== 'pending') {
    throw new AppError('This request has already been responded to', 400);
  }

  if (!['accepted', 'rejected'].includes(status)) {
    throw new AppError('Status must be accepted or rejected', 400);
  }

  await collabRepo.updateStatus(id, status, response_message || null, new Date());

  const updated = await collabRepo.findById(id);
  success(res, updated.rows[0], `Collaboration request ${status} successfully`);
}

async function getMyRequests(req, res) {
  const sender_id = req.user.id;
  const { page, limit, offset } = getPagination(req.query);

  const result = await collabRepo.findBySender(sender_id, { page, limit, offset });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function getReceived(req, res) {
  const receiver_id = req.user.id;
  const { page, limit, offset } = getPagination(req.query);

  const result = await collabRepo.findByReceiver(receiver_id, { page, limit, offset });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function cancel(req, res) {
  const { id } = req.params;

  const requestResult = await collabRepo.findById(id);
  if (!requestResult.rows.length) {
    throw new AppError('Collaboration request not found', 404);
  }

  const request = requestResult.rows[0];
  if (request.sender_id !== req.user.id) {
    throw new AppError('You are not the sender of this request', 403);
  }

  if (request.status !== 'pending') {
    throw new AppError('Only pending requests can be cancelled', 400);
  }

  await collabRepo.deleteById(id);
  success(res, null, 'Collaboration request cancelled successfully');
}

export {
  sendRequest,
  respond,
  getMyRequests,
  getReceived,
  cancel
};
