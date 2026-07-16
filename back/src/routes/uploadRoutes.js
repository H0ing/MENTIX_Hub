/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload endpoints
 */

import { Router } from 'express';
import {
  uploadAvatar,
  uploadProjectFile,
  uploadProjectThumbnail
} from '../controllers/uploadController.js';
import authenticate from '../middleware/authenticate.js';
import { uploadAvatar as uploadAvatarMiddleware, uploadProjectFile as uploadProjectFileMiddleware, uploadProjectImage as uploadProjectImageMiddleware } from '../middleware/upload.js';
import catchAsync from '../utils/catchAsync.js';

const uploadRoutes = Router();

// Dev-only (no auth): uploadRoutes.post('/avatar', uploadAvatarMiddleware, catchAsync(uploadAvatar));
// Dev-only (no auth): uploadRoutes.post('/project/:projectId/file', uploadProjectFileMiddleware, catchAsync(uploadProjectFile));
// Dev-only (no auth): uploadRoutes.post('/project/:projectId/thumbnail', uploadProjectImageMiddleware, catchAsync(uploadProjectThumbnail));

/**
 * @swagger
 * /api/uploads/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded
 */
uploadRoutes.post('/avatar', authenticate, uploadAvatarMiddleware, catchAsync(uploadAvatar));

/**
 * @swagger
 * /api/uploads/project/{projectId}/file:
 *   post:
 *     summary: Upload a project file
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded
 */
uploadRoutes.post('/project/:projectId/file', authenticate, uploadProjectFileMiddleware, catchAsync(uploadProjectFile));

/**
 * @swagger
 * /api/uploads/project/{projectId}/thumbnail:
 *   post:
 *     summary: Upload a project thumbnail
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Thumbnail uploaded
 */
uploadRoutes.post('/project/:projectId/thumbnail', authenticate, uploadProjectImageMiddleware, catchAsync(uploadProjectThumbnail));

export default uploadRoutes;
