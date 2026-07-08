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

const router = Router();

router.get('/',              authenticate, authorize('moderator', 'super_admin'),   catchAsync(getAllSentForms));
router.get('/:id',           authenticate, authorize('moderator', 'super_admin'),   catchAsync(getSentFormById));
router.get('/:id/replies',   authenticate, authorize('moderator', 'super_admin'),   catchAsync(getFormReplies));
router.delete('/:id',        authenticate, authorize('dev_admin', 'super_admin'),   catchAsync(deleteSentForm));

export default router;
