/**
 * @swagger
 * tags:
 *   name: Collaborations
 *   description: Collaboration request management
 */

import { Router } from 'express';
import {
  sendRequest,
  respond,
  getMyRequests,
  getReceived,
  getById,
  cancel
} from '../controllers/collaborationController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const collaborationRoutes = Router();

/**
 * @swagger
 * /api/collaborations:
 *   post:
 *     summary: Send a collaboration request
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Collaboration request sent
 */
collaborationRoutes.post('/', authenticate, catchAsync(sendRequest));

/**
 * @swagger
 * /api/collaborations/sent:
 *   get:
 *     summary: Get sent collaboration requests
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sent requests
 */
collaborationRoutes.get('/sent', authenticate, catchAsync(getMyRequests));

/**
 * @swagger
 * /api/collaborations/received:
 *   get:
 *     summary: Get received collaboration requests
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of received requests
 */
collaborationRoutes.get('/received', authenticate, catchAsync(getReceived));

/**
 * @swagger
 * /api/collaborations/{id}:
 *   get:
 *     summary: Get a collaboration request by ID
 *     tags: [Collaborations]
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
 *         description: Collaboration request data
 */
collaborationRoutes.get('/:id', authenticate, catchAsync(getById));

/**
 * @swagger
 * /api/collaborations/{id}/respond:
 *   put:
 *     summary: Respond to a collaboration request
 *     tags: [Collaborations]
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
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Response recorded
 */
collaborationRoutes.put('/:id/respond', authenticate, catchAsync(respond));

/**
 * @swagger
 * /api/collaborations/{id}:
 *   delete:
 *     summary: Cancel a collaboration request
 *     tags: [Collaborations]
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
 *         description: Request cancelled
 */
collaborationRoutes.delete('/:id', authenticate, catchAsync(cancel));

export default collaborationRoutes;
