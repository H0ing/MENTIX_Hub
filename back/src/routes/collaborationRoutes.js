import { Router } from 'express';
import {
  sendRequest,
  respond,
  getMyRequests,
  getReceived,
  getById,
  cancel
} from '../controllers/collaborationController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const collaborationRoutes = Router();

collaborationRoutes.post('/', authenticate, catchAsync(sendRequest));
collaborationRoutes.get('/sent', authenticate, catchAsync(getMyRequests));
collaborationRoutes.get('/received', authenticate, catchAsync(getReceived));
collaborationRoutes.get('/:id', authenticate, catchAsync(getById));
collaborationRoutes.put('/:id/respond', authenticate, catchAsync(respond));
collaborationRoutes.delete('/:id', authenticate, catchAsync(cancel));

export default collaborationRoutes;
