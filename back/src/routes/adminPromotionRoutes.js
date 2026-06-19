import { Router } from 'express';
import {
  getQueue,
  review,
  getRequirements,
  updateRequirement
} from '../controllers/adminPromotionController.js';
import authenticate from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import catchAsync from '../utils/catchAsync.js';

const adminPromotionRoutes = Router();

// Dev-only (no auth): adminPromotionRoutes.get('/queue', catchAsync(getQueue));
// Dev-only (no auth): adminPromotionRoutes.put('/:id/review', catchAsync(review));
// Dev-only (no auth): adminPromotionRoutes.get('/requirements', catchAsync(getRequirements));
// Dev-only (no auth): adminPromotionRoutes.put('/requirements/:id', catchAsync(updateRequirement));

adminPromotionRoutes.get('/queue', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getQueue));
adminPromotionRoutes.put('/:id/review', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(review));
adminPromotionRoutes.get('/requirements', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(getRequirements));
adminPromotionRoutes.put('/requirements/:id', authenticate, authorize('super_admin'), catchAsync(updateRequirement));

export default adminPromotionRoutes;
