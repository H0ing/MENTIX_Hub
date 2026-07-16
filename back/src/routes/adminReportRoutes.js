/**
 * @swagger
 * tags:
 *   name: Admin Reports
 *   description: Admin report management (moderator, dev_admin, super_admin)
 */

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

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get all reports (admin)
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reports
 */
adminReportRoutes.get('/', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getAllReports));

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   get:
 *     summary: Get report by ID (admin)
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report data
 */
adminReportRoutes.get('/:id', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getById));

/**
 * @swagger
 * /api/admin/reports/{id}/assign:
 *   put:
 *     summary: Assign a moderator to a report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moderator_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Moderator assigned
 */
adminReportRoutes.put('/:id/assign', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(assignModerator));

/**
 * @swagger
 * /api/admin/reports/{id}/status:
 *   put:
 *     summary: Update report status
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, under_review, resolved, dismissed]
 *     responses:
 *       200:
 *         description: Status updated
 */
adminReportRoutes.put('/:id/status', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(updateStatus));

/**
 * @swagger
 * /api/admin/reports/{id}/respond:
 *   post:
 *     summary: Respond to a report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               response:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response submitted
 */
adminReportRoutes.post('/:id/respond', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(respond));

export default adminReportRoutes;
