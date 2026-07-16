/**
 * @swagger
 * tags:
 *   name: Admin Promotions
 *   description: Admin promotion management (moderator, super_admin)
 */

import { Router } from 'express';
import {
  getQueue,
  review,
  getRequirements,
  updateRequirement,
  getAllStudentEligibility,
  triggerAutoEnqueue
} from '../controllers/adminPromotionController.js';
import authenticate from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import catchAsync from '../utils/catchAsync.js';

const adminPromotionRoutes = Router();

// Dev-only (no auth): adminPromotionRoutes.get('/queue', catchAsync(getQueue));
// Dev-only (no auth): adminPromotionRoutes.put('/:id/review', catchAsync(review));
// Dev-only (no auth): adminPromotionRoutes.get('/requirements', catchAsync(getRequirements));
// Dev-only (no auth): adminPromotionRoutes.put('/requirements/:id', catchAsync(updateRequirement));

/**
 * @swagger
 * /api/admin/promotions/queue:
 *   get:
 *     summary: Get promotion request queue
 *     tags: [Admin Promotions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Promotion queue
 */
adminPromotionRoutes.get('/queue', authenticate, authorize('moderator', 'super_admin'), catchAsync(getQueue));

/**
 * @swagger
 * /api/admin/promotions/{id}/review:
 *   put:
 *     summary: Review a promotion request
 *     tags: [Admin Promotions]
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
 *                 enum: [approved, rejected]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review submitted
 */
adminPromotionRoutes.put('/:id/review', authenticate, authorize('moderator', 'super_admin'), catchAsync(review));

/**
 * @swagger
 * /api/admin/promotions/requirements:
 *   get:
 *     summary: Get promotion requirements
 *     tags: [Admin Promotions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of requirements
 */
adminPromotionRoutes.get('/requirements', authenticate, authorize('moderator', 'super_admin'), catchAsync(getRequirements));

/**
 * @swagger
 * /api/admin/promotions/requirements/{id}:
 *   put:
 *     summary: Update a promotion requirement
 *     tags: [Admin Promotions]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Requirement updated
 */
adminPromotionRoutes.put('/requirements/:id', authenticate, authorize('moderator', 'super_admin'), catchAsync(updateRequirement));

/**
 * @swagger
 * /api/admin/promotions/student-eligibility:
 *   get:
 *     summary: Get all student eligibility statuses
 *     tags: [Admin Promotions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student eligibility data
 */
adminPromotionRoutes.get('/student-eligibility', authenticate, authorize('moderator', 'super_admin'), catchAsync(getAllStudentEligibility));

/**
 * @swagger
 * /api/admin/promotions/auto-enqueue:
 *   post:
 *     summary: Trigger auto-enqueue eligible students
 *     tags: [Admin Promotions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Auto-enqueue triggered
 */
adminPromotionRoutes.post('/auto-enqueue', authenticate, authorize('moderator', 'super_admin'), catchAsync(triggerAutoEnqueue));

export default adminPromotionRoutes;
