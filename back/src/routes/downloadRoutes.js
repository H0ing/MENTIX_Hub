/**
 * @swagger
 * tags:
 *   name: Downloads
 *   description: File download endpoints
 */

import { Router } from 'express';
import {
  downloadAvatar,
  downloadProjectFile,
  downloadProjectThumbnail
} from '../controllers/downloadController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const downloadRoutes = Router();

// Dev-only (no auth): downloadRoutes.get('/projects/:projectId/file', catchAsync(downloadProjectFile));

/**
 * @swagger
 * /api/downloads/users/{userId}/avatar:
 *   get:
 *     summary: Download user avatar (public)
 *     tags: [Downloads]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Avatar file
 */
downloadRoutes.get('/users/:userId/avatar', catchAsync(downloadAvatar));

/**
 * @swagger
 * /api/downloads/projects/{projectId}/file:
 *   get:
 *     summary: Download project file
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project file
 */
downloadRoutes.get('/projects/:projectId/file', authenticate, catchAsync(downloadProjectFile));

/**
 * @swagger
 * /api/downloads/projects/{projectId}/thumbnail:
 *   get:
 *     summary: Download project thumbnail (public)
 *     tags: [Downloads]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thumbnail file
 */
downloadRoutes.get('/projects/:projectId/thumbnail', catchAsync(downloadProjectThumbnail));

export default downloadRoutes;
