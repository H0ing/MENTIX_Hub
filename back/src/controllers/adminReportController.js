import * as reportRepo from '../repositories/reportRepository.js';
import { findById as findProjectById } from '../repositories/projectRepository.js';
import { dev, user as userQuery } from '../db/query.js';
import AppError from '../utils/AppError.js';
import { success, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';

async function getAllReports(req, res) {
  const { status, priority, assigned_to } = req.query;
  const { page, limit, offset } = getPagination(req.query);

  const result = await reportRepo.findAll({ page, limit, offset, status, priority, assigned_to });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function getById(req, res) {
  const { id } = req.params;

  const reportResult = await reportRepo.findById(id);
  if (!reportResult.rows.length) {
    throw new AppError('Report not found', 404);
  }

  success(res, reportResult.rows[0]);
}

async function assignModerator(req, res) {
  const { id } = req.params;

  const reportResult = await reportRepo.findById(id);
  if (!reportResult.rows.length) {
    throw new AppError('Report not found', 404);
  }

  const report = reportResult.rows[0];
  if (report.status !== 'pending') {
    throw new AppError('Only pending reports can be assigned', 400);
  }

  await reportRepo.assignModerator(id, req.user.id);

  const updated = await reportRepo.findById(id);
  success(res, updated.rows[0], 'Report assigned to you successfully');
}

async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['under_review', 'resolved', 'dismissed'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status. Must be one of: ' + validStatuses.join(', '), 400);
  }

  const reportResult = await reportRepo.findById(id);
  if (!reportResult.rows.length) {
    throw new AppError('Report not found', 404);
  }

  await reportRepo.updateStatus(id, status);

  const updated = await reportRepo.findById(id);
  success(res, updated.rows[0], `Report status updated to ${status}`);
}

async function respond(req, res) {
  const { id } = req.params;
  const { response_type, message } = req.body;

  const validTypes = ['warning', 'project_removed', 'user_banned', 'dismissed', 'other'];
  if (!validTypes.includes(response_type)) {
    throw new AppError('Invalid response type', 400);
  }

  const reportResult = await reportRepo.findById(id);
  if (!reportResult.rows.length) {
    throw new AppError('Report not found', 404);
  }

  const report = reportResult.rows[0];

  await reportRepo.createResponse({
    report_id: id,
    responded_by: req.user.id,
    response_type,
    message
  });

  if (response_type === 'dismissed') {
    await reportRepo.updateStatus(id, 'dismissed');

    const created = new Date(report.created_at);
    const now = new Date();
    const responseTime = Math.round((now - created) / 60000);

    await reportRepo.archiveReport({
      report_id: id,
      project_id: report.project_id,
      project_title: report.project_title,
      reported_by_username: report.reporter_username,
      reason: report.reason,
      final_status: 'dismissed',
      handled_by: req.user.id,
      response_time_minutes: responseTime,
      resolution_message: message || 'Dismissed'
    });
  } else {
    await reportRepo.updateStatus(id, 'resolved');

    const created = new Date(report.created_at);
    const now = new Date();
    const responseTime = Math.round((now - created) / 60000);

    await reportRepo.archiveReport({
      report_id: id,
      project_id: report.project_id,
      project_title: report.project_title,
      reported_by_username: report.reporter_username,
      reason: report.reason,
      final_status: 'resolved',
      handled_by: req.user.id,
      response_time_minutes: responseTime,
      resolution_message: message || 'Resolved'
    });
  }

  const userResult = await dev('SELECT email, username FROM users WHERE id = ?', [report.reported_by]);
  if (userResult.rows[0]) {
    const statusLabels = {
      warning: 'Warning Issued',
      project_removed: 'Project Removed',
      user_banned: 'User Banned',
      dismissed: 'Dismissed',
      other: 'Resolved'
    };
    const resolutionLabel = statusLabels[response_type] || response_type;
    const subject = `Report Resolved - ${report.project_title}`;
    const body = `Your report on "${report.project_title}" has been resolved.\nReason reported: ${report.reason}\nResolution: ${resolutionLabel}${message ? `\nMessage: ${message}` : ''}`;
    await userQuery(
      `INSERT INTO admin_sent_forms (subject, recipient_id, sent_by, form_type, body, related_entity_type, related_entity_id)
       VALUES (?, ?, ?, 'report_resolution', ?, 'report', ?)`,
      [subject, report.reported_by, req.user.id, body, id]
    );
  }

  const updated = await reportRepo.findById(id);
  success(res, updated.rows[0], 'Response submitted successfully');
}

export {
  getAllReports,
  getById,
  assignModerator,
  updateStatus,
  respond
};
