import { Router } from 'express';
import {
  submitReport,
  getMyReports
} from '../controllers/reportController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const reportRoutes = Router();

// Dev-only (no auth): reportRoutes.post('/', catchAsync(submitReport));
// Dev-only (no auth): reportRoutes.get('/my', catchAsync(getMyReports));

reportRoutes.post('/', authenticate, catchAsync(submitReport));
reportRoutes.get('/my', authenticate, catchAsync(getMyReports));

export default reportRoutes;
