/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Favorite projects management
 */

import { Router } from 'express';
import {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite
} from '../controllers/favoriteController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const favoriteRoutes = Router();

/**
 * @swagger
 * /api/favorites/{projectId}:
 *   post:
 *     summary: Add a project to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Added to favorites
 */
favoriteRoutes.post('/:projectId', authenticate, catchAsync(addFavorite));

/**
 * @swagger
 * /api/favorites/{projectId}:
 *   delete:
 *     summary: Remove a project from favorites
 *     tags: [Favorites]
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
 *         description: Removed from favorites
 */
favoriteRoutes.delete('/:projectId', authenticate, catchAsync(removeFavorite));

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get current user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorites
 */
favoriteRoutes.get('/', authenticate, catchAsync(getMyFavorites));

/**
 * @swagger
 * /api/favorites/{projectId}/check:
 *   get:
 *     summary: Check if a project is in favorites
 *     tags: [Favorites]
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
 *         description: Favorite status
 */
favoriteRoutes.get('/:projectId/check', authenticate, catchAsync(checkFavorite));

export default favoriteRoutes;
