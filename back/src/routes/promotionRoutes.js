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

promotionRoutes.post('/request', authenticate, catchAsync(requestPromotion));
promotionRoutes.get('/my', authenticate, catchAsync(getMyRequests));
promotionRoutes.get('/check-eligibility', authenticate, catchAsync(checkEligibility));

export default promotionRoutes;
