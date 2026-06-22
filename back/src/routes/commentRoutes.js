import { Router } from 'express';
<<<<<<< Updated upstream
import {
  create,
  getByProject,
  getReplies,
  update,
  delete as deleteComment
} from '../controllers/commentController.js';
=======
import { create, getByProject, getReplies, update, remove } from '../controllers/commentController.js';
>>>>>>> Stashed changes
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const commentRoutes = Router();

<<<<<<< Updated upstream
commentRoutes.post('/', authenticate, catchAsync(create));
commentRoutes.get('/project/:projectId', catchAsync(getByProject));
commentRoutes.get('/:id/replies', catchAsync(getReplies));
commentRoutes.put('/:id', authenticate, catchAsync(update));
commentRoutes.delete('/:id', authenticate, catchAsync(deleteComment));
=======
// Nested under projects
commentRoutes.post('/projects/:projectId/comments',  authenticate, catchAsync(create));
commentRoutes.get('/projects/:projectId/comments',   catchAsync(getByProject));

// Standalone comment operations
commentRoutes.get('/comments/:id/replies',  catchAsync(getReplies));
commentRoutes.put('/comments/:id',          authenticate, catchAsync(update));
commentRoutes.delete('/comments/:id',       authenticate, catchAsync(remove));
>>>>>>> Stashed changes

export default commentRoutes;
