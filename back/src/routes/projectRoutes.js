/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */

import { Router } from 'express';
import {
  create,
  getAll,
  getById,
  update,
  delete as deleteProjectCtrl,
  toggleHeart,
  getHeartedProjects,
  uploadFile,
  uploadThumbnail
} from '../controllers/projectController.js';
import authenticate from '../middleware/authenticate.js';
import { uploadProjectFile, uploadProjectImage } from '../middleware/upload.js';
import catchAsync from '../utils/catchAsync.js';

const projectRoutes = Router();

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 */
projectRoutes.post('/', authenticate, catchAsync(create));

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects (public)
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
 */
projectRoutes.get('/', catchAsync(getAll));

/**
 * @swagger
 * /api/projects/hearted/me:
 *   get:
 *     summary: Get current user's hearted projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of hearted projects
 */
projectRoutes.get('/hearted/me', authenticate, catchAsync(getHeartedProjects));

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID (public)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project data
 */
projectRoutes.get('/:id', catchAsync(getById));

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated
 */
projectRoutes.put('/:id', authenticate, catchAsync(update));

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
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
 *         description: Project deleted
 */
projectRoutes.delete('/:id', authenticate, catchAsync(deleteProjectCtrl));

/**
 * @swagger
 * /api/projects/{id}/heart:
 *   post:
 *     summary: Toggle heart on a project
 *     tags: [Projects]
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
 *         description: Heart toggled
 */
projectRoutes.post('/:id/heart', authenticate, catchAsync(toggleHeart));

/**
 * @swagger
 * /api/projects/{id}/upload-file:
 *   post:
 *     summary: Upload a file to a project
 *     tags: [Projects]
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
projectRoutes.post('/:id/upload-file', authenticate, uploadProjectFile, catchAsync(uploadFile));

/**
 * @swagger
 * /api/projects/{id}/upload-thumbnail:
 *   post:
 *     summary: Upload a thumbnail for a project
 *     tags: [Projects]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Thumbnail uploaded
 */
projectRoutes.post('/:id/upload-thumbnail', authenticate, uploadProjectImage, catchAsync(uploadThumbnail));

export default projectRoutes;
