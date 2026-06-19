import { Router } from 'express';
import {
  downloadAvatar,
  downloadProjectFile,
  downloadProjectThumbnail
} from '../controllers/downloadController.js';
import authenticate from '../middleware/authenticate.js';
import catchAsync from '../utils/catchAsync.js';

const downloadRoutes = Router();

// Dev-only (no auth): downloadRoutes.get('/projects/:projectId/file', catchAsync(downloadProjectFile));

downloadRoutes.get('/users/:userId/avatar', catchAsync(downloadAvatar));
downloadRoutes.get('/projects/:projectId/file', authenticate, catchAsync(downloadProjectFile));
downloadRoutes.get('/projects/:projectId/thumbnail', catchAsync(downloadProjectThumbnail));

export default downloadRoutes;
