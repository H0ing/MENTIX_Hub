import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import {
  getProfile,
  updateProfile,
  getUserById,
  getUserProjects
} from '../controllers/userController.js';

const userRoutes = Router();

userRoutes.get('/profile', authenticate, getProfile);
userRoutes.put('/profile', authenticate, updateProfile);
userRoutes.get('/:id', getUserById);
userRoutes.get('/:id/projects', getUserProjects);

export default userRoutes;