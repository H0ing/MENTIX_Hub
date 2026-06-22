import { Router } from 'express';
import {
  create,
  getByProject,
  getReplies,
  update,
  delete as deleteComment
} from '../controllers/commentController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const commentRoutes = Router();

commentRoutes.post('/', authenticate, catchAsync(create));
commentRoutes.get('/project/:projectId', catchAsync(getByProject));
commentRoutes.get('/:id/replies', catchAsync(getReplies));
commentRoutes.put('/:id', authenticate, catchAsync(update));
commentRoutes.delete('/:id', authenticate, catchAsync(deleteComment));

export default commentRoutes;
