import { Router } from 'express';
import {
  submitReport,
  getById,
  getMyReports,
  getReportsOnMyProjects
} from '../controllers/reportController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const reportRoutes = Router();

reportRoutes.post('/', authenticate, catchAsync(submitReport));
reportRoutes.get('/my', authenticate, catchAsync(getMyReports));
reportRoutes.get('/on-my-projects', authenticate, catchAsync(getReportsOnMyProjects));
reportRoutes.get('/:id', authenticate, catchAsync(getById));

export default reportRoutes;
