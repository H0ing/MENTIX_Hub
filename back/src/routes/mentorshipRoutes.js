/**
 * @swagger
 * tags:
 *   name: Mentorships
 *   description: Mentorship request management
 */

import { Router } from 'express';
import {
  createRequest,
  respond,
  getMyRequests,
  getReceived,
  getById
} from '../controllers/mentorshipController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const mentorshipRoutes = Router();

// Dev-only (no auth): mentorshipRoutes.post('/', catchAsync(createRequest));
// Dev-only (no auth): mentorshipRoutes.get('/sent', catchAsync(getMyRequests));
// Dev-only (no auth): mentorshipRoutes.get('/received', catchAsync(getReceived));
// Dev-only (no auth): mentorshipRoutes.get('/:id', catchAsync(getById));
// Dev-only (no auth): mentorshipRoutes.put('/:id/respond', catchAsync(respond));

/**
 * @swagger
 * /api/mentorships:
 *   post:
 *     summary: Send a mentorship request
 *     tags: [Mentorships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mentor_id:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mentorship request sent
 */
mentorshipRoutes.post('/', authenticate, catchAsync(createRequest));

/**
 * @swagger
 * /api/mentorships/sent:
 *   get:
 *     summary: Get sent mentorship requests
 *     tags: [Mentorships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sent requests
 */
mentorshipRoutes.get('/sent', authenticate, catchAsync(getMyRequests));

/**
 * @swagger
 * /api/mentorships/received:
 *   get:
 *     summary: Get received mentorship requests
 *     tags: [Mentorships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of received requests
 */
mentorshipRoutes.get('/received', authenticate, catchAsync(getReceived));

/**
 * @swagger
 * /api/mentorships/{id}:
 *   get:
 *     summary: Get a mentorship request by ID
 *     tags: [Mentorships]
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
 *         description: Mentorship request data
 */
mentorshipRoutes.get('/:id', authenticate, catchAsync(getById));

/**
 * @swagger
 * /api/mentorships/{id}/respond:
 *   put:
 *     summary: Respond to a mentorship request
 *     tags: [Mentorships]
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
mentorshipRoutes.put('/:id/respond', authenticate, catchAsync(respond));

export default mentorshipRoutes;
