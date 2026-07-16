/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import {
  getProfile,
  updateProfile,
  listUsers,
  getUserById,
  getUserProjects
} from '../controllers/userController.js';

const userRoutes = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (authenticated)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
userRoutes.get('/', authenticate, listUsers);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
userRoutes.get('/profile', authenticate, getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
userRoutes.put('/profile', authenticate, updateProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User data
 */
userRoutes.get('/:id', authenticate, getUserById);

/**
 * @swagger
 * /api/users/{id}/projects:
 *   get:
 *     summary: Get projects by user ID
 *     tags: [Users]
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
 *         description: List of user projects
 */
userRoutes.get('/:id/projects', authenticate, getUserProjects);

export default userRoutes;