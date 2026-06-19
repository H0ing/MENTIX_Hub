import { Router } from 'express';
import {
  createRequest,
  respond,
  getMyRequests,
  getReceived,
  getById
} from '../controllers/mentorshipController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const mentorshipRoutes = Router();

// Dev-only (no auth): mentorshipRoutes.post('/', catchAsync(createRequest));
// Dev-only (no auth): mentorshipRoutes.get('/sent', catchAsync(getMyRequests));
// Dev-only (no auth): mentorshipRoutes.get('/received', catchAsync(getReceived));
// Dev-only (no auth): mentorshipRoutes.get('/:id', catchAsync(getById));
// Dev-only (no auth): mentorshipRoutes.put('/:id/respond', catchAsync(respond));

mentorshipRoutes.post('/', authenticate, catchAsync(createRequest));
mentorshipRoutes.get('/sent', authenticate, catchAsync(getMyRequests));
mentorshipRoutes.get('/received', authenticate, catchAsync(getReceived));
mentorshipRoutes.get('/:id', authenticate, catchAsync(getById));
mentorshipRoutes.put('/:id/respond', authenticate, catchAsync(respond));

export default mentorshipRoutes;
