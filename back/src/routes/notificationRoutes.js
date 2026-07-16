/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification endpoints
 */

import { Router } from 'express';
import { getMyNotifications } from '../controllers/notificationController.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get current user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', authenticate, getMyNotifications);

export default router;
