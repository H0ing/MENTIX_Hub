import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import {
  getProfile,
  updateProfile,
  listUsers,
  getUserById,
  getUserProjects
} from '../controllers/userController.js';

const userRoutes = Router();

userRoutes.get('/', authenticate, listUsers);
userRoutes.get('/profile', authenticate, getProfile);
userRoutes.put('/profile', authenticate, updateProfile);
userRoutes.get('/:id', authenticate, getUserById);
userRoutes.get('/:id/projects', authenticate, getUserProjects);

export default userRoutes;