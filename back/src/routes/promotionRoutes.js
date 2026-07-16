/**
 * @swagger
 * tags:
 *   name: Promotions
 *   description: Promotion request endpoints (student)
 */

import { Router } from 'express';
import {
  requestPromotion,
  getMyRequests,
  checkEligibility
} from '../controllers/promotionController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const promotionRoutes = Router();

// Dev-only (no auth): promotionRoutes.post('/request', catchAsync(requestPromotion));
// Dev-only (no auth): promotionRoutes.get('/my', catchAsync(getMyRequests));
// Dev-only (no auth): promotionRoutes.get('/check-eligibility', catchAsync(checkEligibility));

/**
 * @swagger
 * /api/promotions/request:
 *   post:
 *     summary: Request a promotion
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Promotion requested
 */
promotionRoutes.post('/request', authenticate, catchAsync(requestPromotion));

/**
 * @swagger
 * /api/promotions/my:
 *   get:
 *     summary: Get my promotion requests
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of promotion requests
 */
promotionRoutes.get('/my', authenticate, catchAsync(getMyRequests));

/**
 * @swagger
 * /api/promotions/check-eligibility:
 *   get:
 *     summary: Check promotion eligibility
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eligibility status
 */
promotionRoutes.get('/check-eligibility', authenticate, catchAsync(checkEligibility));

export default promotionRoutes;
