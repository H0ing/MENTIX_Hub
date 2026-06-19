import { Router } from 'express';
import {
  getAllReports,
  getById,
  assignModerator,
  updateStatus,
  respond
} from '../controllers/adminReportController.js';
import authenticate from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import catchAsync from '../utils/catchAsync.js';

const adminReportRoutes = Router();

// Dev-only (no auth): adminReportRoutes.get('/', catchAsync(getAllReports));
// Dev-only (no auth): adminReportRoutes.get('/:id', catchAsync(getById));
// Dev-only (no auth): adminReportRoutes.put('/:id/assign', catchAsync(assignModerator));
// Dev-only (no auth): adminReportRoutes.put('/:id/status', catchAsync(updateStatus));
// Dev-only (no auth): adminReportRoutes.post('/:id/respond', catchAsync(respond));

adminReportRoutes.get('/', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getAllReports));
adminReportRoutes.get('/:id', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getById));
adminReportRoutes.put('/:id/assign', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(assignModerator));
adminReportRoutes.put('/:id/status', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(updateStatus));
adminReportRoutes.post('/:id/respond', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(respond));

export default adminReportRoutes;
