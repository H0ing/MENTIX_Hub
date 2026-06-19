import * as promotionRepo from '../repositories/promotionReposity.js';
import { dev } from '../db/query.js';
import { findById as findUserById } from '../repositories/userRepository.js';
import AppError from '../utils/AppError.js';
import { success, created, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';

async function requestPromotion(req, res) {
  const userId = req.user.id;

  const userResult = await findUserById(userId);
  if (!userResult.rows.length) {
    throw new AppError('User not found', 404);
  }

  if (userResult.rows[0].role === 'mentor') {
    throw new AppError('You are already a mentor', 400);
  }

  const existingResult = await promotionRepo.findByUser(userId);
  const pendingRequest = existingResult.rows.find(r => r.status === 'pending');
  if (pendingRequest) {
    throw new AppError('You already have a pending promotion request', 400);
  }

  const reqResult = await dev('SELECT requirement_key, threshold_value FROM mentor_requirements WHERE is_active = TRUE');
  const requirements = reqResult.rows;

  const statsResult = await dev(`
    SELECT
      (SELECT COUNT(*) FROM projects WHERE author_id = ?) AS project_count,
      (SELECT COALESCE(SUM(h.count), 0) FROM hearts h JOIN projects p ON h.project_id = p.id WHERE p.author_id = ?) AS total_hearts,
      (SELECT DATEDIFF(NOW(), created_at) FROM users WHERE id = ?) AS account_age_days,
      (SELECT COUNT(*) FROM comments WHERE user_id = ?) AS comment_count
  `, [userId, userId, userId, userId]);
  const stats = statsResult.rows[0];

  const requirementsMet = {};
  let allMet = true;

  for (const req of requirements) {
    let actual;
    if (req.requirement_key === 'min_projects') actual = stats.project_count;
    else if (req.requirement_key === 'min_hearts') actual = stats.total_hearts;
    else if (req.requirement_key === 'min_account_age_days') actual = stats.account_age_days;
    else if (req.requirement_key === 'min_comments') actual = stats.comment_count;

    const met = actual >= req.threshold_value;
    requirementsMet[req.requirement_key] = { required: req.threshold_value, actual, met };
    if (!met) allMet = false;
  }

  if (!allMet) {
    throw new AppError('You do not meet all the requirements for promotion to mentor. Check your eligibility for details.', 400);
  }

  const result = await promotionRepo.create(userId, requirementsMet);
  const requestResult = await promotionRepo.findByUser(userId);
  const createdRequest = requestResult.rows.find(r => r.id === result.rows.insertId);

  created(res, createdRequest, 'Promotion request submitted successfully');
}

async function getMyRequests(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const result = await promotionRepo.findByUser(req.user.id);

  const total = result.rows.length;
  const rows = result.rows.slice(offset, offset + limit);

  paginated(res, { rows, count: total, page, limit });
}

async function checkEligibility(req, res) {
  const userId = req.user.id;

  const reqResult = await dev('SELECT requirement_key, requirement_name, threshold_value, description FROM mentor_requirements WHERE is_active = TRUE');
  const requirements = reqResult.rows;

  const statsResult = await dev(`
    SELECT
      (SELECT COUNT(*) FROM projects WHERE author_id = ?) AS project_count,
      (SELECT COALESCE(SUM(h.count), 0) FROM hearts h JOIN projects p ON h.project_id = p.id WHERE p.author_id = ?) AS total_hearts,
      (SELECT DATEDIFF(NOW(), created_at) FROM users WHERE id = ?) AS account_age_days,
      (SELECT COUNT(*) FROM comments WHERE user_id = ?) AS comment_count
  `, [userId, userId, userId, userId]);
  const stats = statsResult.rows[0];

  const eligibility = requirements.map(r => {
    let actual;
    if (r.requirement_key === 'min_projects') actual = stats.project_count;
    else if (r.requirement_key === 'min_hearts') actual = stats.total_hearts;
    else if (r.requirement_key === 'min_account_age_days') actual = stats.account_age_days;
    else if (r.requirement_key === 'min_comments') actual = stats.comment_count;

    return {
      requirement: r.requirement_name,
      key: r.requirement_key,
      required: r.threshold_value,
      actual,
      met: actual >= r.threshold_value,
      description: r.description
    };
  });

  const allMet = eligibility.every(e => e.met);

  success(res, {
    eligible: allMet,
    requirements: eligibility,
    stats: {
      projects: stats.project_count,
      total_hearts: stats.total_hearts,
      account_age_days: stats.account_age_days,
      comments: stats.comment_count
    }
  }, allMet ? 'You meet all requirements' : 'You do not meet all requirements');
}

export {
  requestPromotion,
  getMyRequests,
  checkEligibility
};
