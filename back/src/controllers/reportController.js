import * as reportRepo from '../repositories/reportRepository.js';
import { findById as findProjectById } from '../repositories/projectRepository.js';
import AppError from '../utils/AppError.js';
import { success, created, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';

async function submitReport(req, res) {
  const { project_id, reason, description, priority } = req.body;
  const reported_by = req.user.id;

  const projectResult = await findProjectById(project_id);
  if (!projectResult.rows.length) {
    throw new AppError('Project not found', 404);
  }

  const result = await reportRepo.create({ project_id, reported_by, reason, description, priority });

  const reportResult = await reportRepo.findById(result.rows.insertId);
  created(res, reportResult.rows[0], 'Report submitted successfully');
}

async function getMyReports(req, res) {
  const reported_by = req.user.id;
  const { page, limit, offset } = getPagination(req.query);

  const result = await reportRepo.findByUser(reported_by, { page, limit, offset });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

export {
  submitReport,
  getMyReports
};
