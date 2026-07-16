/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: User report endpoints
 */

import { Router } from 'express';
import {
  submitReport,
  getById,
  getMyReports,
  getReportsOnMyProjects
} from '../controllers/reportController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const reportRoutes = Router();

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Submit a report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               target_id:
 *                 type: string
 *               target_type:
 *                 type: string
 *                 enum: [user, project, comment]
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report submitted
 */
reportRoutes.post('/', authenticate, catchAsync(submitReport));

/**
 * @swagger
 * /api/reports/my:
 *   get:
 *     summary: Get my submitted reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my reports
 */
reportRoutes.get('/my', authenticate, catchAsync(getMyReports));

/**
 * @swagger
 * /api/reports/on-my-projects:
 *   get:
 *     summary: Get reports on my projects
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports on my projects
 */
reportRoutes.get('/on-my-projects', authenticate, catchAsync(getReportsOnMyProjects));

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Get a report by ID
 *     tags: [Reports]
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
reportRoutes.get('/:id', authenticate, catchAsync(getById));

export default reportRoutes;
