import { Router } from 'express';
import {
  getAllSentForms,
  getSentFormById,
  deleteSentForm,
} from '../controllers/adminSentFormController.js';
import authenticate from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import catchAsync from '../utils/catchAsync.js';

const router = Router();

router.get('/',              authenticate, authorize('moderator', 'super_admin'),   catchAsync(getAllSentForms));
router.get('/:id',           authenticate, authorize('moderator', 'super_admin'),   catchAsync(getSentFormById));
router.delete('/:id',        authenticate, authorize('dev_admin', 'super_admin'),   catchAsync(deleteSentForm));

export default router;
