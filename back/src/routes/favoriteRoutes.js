import { Router } from 'express';
import {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite
} from '../controllers/favoriteController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const favoriteRoutes = Router();

favoriteRoutes.post('/:projectId', authenticate, catchAsync(addFavorite));
favoriteRoutes.delete('/:projectId', authenticate, catchAsync(removeFavorite));
favoriteRoutes.get('/', authenticate, catchAsync(getMyFavorites));
favoriteRoutes.get('/:projectId/check', authenticate, catchAsync(checkFavorite));

export default favoriteRoutes;
