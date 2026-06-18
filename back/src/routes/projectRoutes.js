import { Router } from 'express';
import {
  create,
  getAll,
  getById,
  update,
  delete as deleteProjectCtrl,
  toggleHeart,
  getHeartedProjects,
  uploadFile,
  uploadThumbnail
} from '../controllers/projectController.js';
import authenticate from '../middleware/authenticate.js';
import { uploadProjectFile, uploadProjectImage } from '../middleware/upload.js';
import catchAsync from '../utils/catchAsync.js';

const projectRoutes = Router();

projectRoutes.post('/', authenticate, catchAsync(create));
projectRoutes.get('/', catchAsync(getAll));
projectRoutes.get('/hearted/me', authenticate, catchAsync(getHeartedProjects));
projectRoutes.get('/:id', catchAsync(getById));
projectRoutes.put('/:id', authenticate, catchAsync(update));
projectRoutes.delete('/:id', authenticate, catchAsync(deleteProjectCtrl));
projectRoutes.post('/:id/heart', authenticate, catchAsync(toggleHeart));
projectRoutes.post('/:id/upload-file', authenticate, uploadProjectFile, catchAsync(uploadFile));
projectRoutes.post('/:id/upload-thumbnail', authenticate, uploadProjectImage, catchAsync(uploadThumbnail));

export default projectRoutes;
