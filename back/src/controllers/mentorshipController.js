import * as mentorshipRepo from '../repositories/mentorshipRepository.js';
import { findById as findUserById } from '../repositories/userRepository.js';
import AppError from '../utils/AppError.js';
import { success, created, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';

async function createRequest(req, res) {
  const { mentor_id, project_context, help_needed } = req.body;
  const student_id = req.user.id;

  if (student_id === mentor_id) {
    throw new AppError('You cannot send a mentorship request to yourself', 400);
  }

  const mentorResult = await findUserById(mentor_id);
  if (!mentorResult.rows.length) {
    throw new AppError('Mentor not found', 404);
  }

  if (mentorResult.rows[0].role !== 'mentor') {
    throw new AppError('User is not a mentor', 400);
  }

  const result = await mentorshipRepo.create({ student_id, mentor_id, project_context, help_needed });

  const requestResult = await mentorshipRepo.findById(result.rows.insertId);
  created(res, requestResult.rows[0], 'Mentorship request sent successfully');
}

async function respond(req, res) {
  const { id } = req.params;
  const { status, mentor_response } = req.body;

  const requestResult = await mentorshipRepo.findById(id);
  if (!requestResult.rows.length) {
    throw new AppError('Mentorship request not found', 404);
  }

  const request = requestResult.rows[0];
  if (request.mentor_id !== req.user.id) {
    throw new AppError('You are not the mentor for this request', 403);
  }

  if (request.status !== 'pending') {
    throw new AppError('This request has already been responded to', 400);
  }

  if (!['accepted', 'rejected'].includes(status)) {
    throw new AppError('Status must be accepted or rejected', 400);
  }

  await mentorshipRepo.updateStatus(id, status, mentor_response || null, new Date());

  const updated = await mentorshipRepo.findById(id);
  success(res, updated.rows[0], `Mentorship request ${status} successfully`);
}

async function getMyRequests(req, res) {
  const student_id = req.user.id;
  const { page, limit, offset } = getPagination(req.query);

  const result = await mentorshipRepo.findByStudent(student_id, { page, limit, offset });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function getReceived(req, res) {
  const mentor_id = req.user.id;
  const { page, limit, offset } = getPagination(req.query);

  const result = await mentorshipRepo.findByMentor(mentor_id, { page, limit, offset });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function getById(req, res) {
  const { id } = req.params;

  const requestResult = await mentorshipRepo.findById(id);
  if (!requestResult.rows.length) {
    throw new AppError('Mentorship request not found', 404);
  }

  const request = requestResult.rows[0];
  if (request.student_id !== req.user.id && request.mentor_id !== req.user.id) {
    throw new AppError('You do not have permission to view this request', 403);
  }

  success(res, request);
}

export {
  createRequest,
  respond,
  getMyRequests,
  getReceived,
  getById
};
