/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Project comments endpoints
 */

import { Router } from 'express';
import {
  create,
  getByProject,
  getReplies,
  update,
  delete as deleteComment
} from '../controllers/commentController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const commentRoutes = Router();

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a comment on a project
 *     tags: [Comments]
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
 *               content:
 *                 type: string
 *               parent_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
commentRoutes.post('/', authenticate, catchAsync(create));

/**
 * @swagger
 * /api/comments/project/{projectId}:
 *   get:
 *     summary: Get all comments for a project (public)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
commentRoutes.get('/project/:projectId', catchAsync(getByProject));

/**
 * @swagger
 * /api/comments/{id}/replies:
 *   get:
 *     summary: Get replies to a comment (public)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of replies
 */
commentRoutes.get('/:id/replies', catchAsync(getReplies));

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 */
commentRoutes.put('/:id', authenticate, catchAsync(update));

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
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
 *         description: Comment deleted
 */
commentRoutes.delete('/:id', authenticate, catchAsync(deleteComment));

export default commentRoutes;
