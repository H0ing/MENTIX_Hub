import { Router } from 'express';
import {
  getAllSentForms,
  getSentFormById,
  getFormReplies,
  deleteSentForm,
} from '../controllers/adminSentFormController.js';
import authenticate from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import catchAsync from '../utils/catchAsync.js';

const adminSentFormRoutes = Router();

adminSentFormRoutes.get('/',       authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getAllSentForms));
adminSentFormRoutes.get('/:id',    authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getSentFormById));
adminSentFormRoutes.get('/:id/replies', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getFormReplies));
adminSentFormRoutes.delete('/:id', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(deleteSentForm));

export default adminSentFormRoutes;
