import { Router } from 'express';
import {
  uploadAvatar,
  uploadProjectFile,
  uploadProjectThumbnail
} from '../controllers/uploadController.js';
import authenticate from '../middleware/authenticate.js';
import { uploadAvatar as uploadAvatarMiddleware, uploadProjectFile as uploadProjectFileMiddleware, uploadProjectImage as uploadProjectImageMiddleware } from '../middleware/upload.js';
import catchAsync from '../utils/catchAsync.js';

const uploadRoutes = Router();

// Dev-only (no auth): uploadRoutes.post('/avatar', uploadAvatarMiddleware, catchAsync(uploadAvatar));
// Dev-only (no auth): uploadRoutes.post('/project/:projectId/file', uploadProjectFileMiddleware, catchAsync(uploadProjectFile));
// Dev-only (no auth): uploadRoutes.post('/project/:projectId/thumbnail', uploadProjectImageMiddleware, catchAsync(uploadProjectThumbnail));

uploadRoutes.post('/avatar', authenticate, uploadAvatarMiddleware, catchAsync(uploadAvatar));
uploadRoutes.post('/project/:projectId/file', authenticate, uploadProjectFileMiddleware, catchAsync(uploadProjectFile));
uploadRoutes.post('/project/:projectId/thumbnail', authenticate, uploadProjectImageMiddleware, catchAsync(uploadProjectThumbnail));

export default uploadRoutes;
