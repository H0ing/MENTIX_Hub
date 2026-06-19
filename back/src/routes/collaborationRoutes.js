import { Router } from 'express';
import {
  sendRequest,
  respond,
  getMyRequests,
  getReceived,
  cancel
} from '../controllers/collaborationController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const collaborationRoutes = Router();

// Dev-only (no auth): collaborationRoutes.post('/', catchAsync(sendRequest));
// Dev-only (no auth): collaborationRoutes.get('/sent', catchAsync(getMyRequests));
// Dev-only (no auth): collaborationRoutes.get('/received', catchAsync(getReceived));
// Dev-only (no auth): collaborationRoutes.put('/:id/respond', catchAsync(respond));
// Dev-only (no auth): collaborationRoutes.delete('/:id', catchAsync(cancel));

collaborationRoutes.post('/', authenticate, catchAsync(sendRequest));
collaborationRoutes.get('/sent', authenticate, catchAsync(getMyRequests));
collaborationRoutes.get('/received', authenticate, catchAsync(getReceived));
collaborationRoutes.put('/:id/respond', authenticate, catchAsync(respond));
collaborationRoutes.delete('/:id', authenticate, catchAsync(cancel));

export default collaborationRoutes;
