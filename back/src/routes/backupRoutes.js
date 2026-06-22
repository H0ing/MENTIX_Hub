import { Router } from 'express';
import {
  triggerBackup,
  getHistory,
  getBackupById,
  restoreBackup,
  deleteBackup,
  getSchedule,
  updateSchedule
} from '../controllers/backupController.js';
import authenticate from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import catchAsync from '../utils/catchAsync.js';
import config from '../config/env.js';

const backupRoutes = Router();
const isDev = config.env === 'development';

if (isDev) {
  backupRoutes.post('/trigger', catchAsync(triggerBackup));
  backupRoutes.get('/history', catchAsync(getHistory));
  backupRoutes.get('/history/:id', catchAsync(getBackupById));
  backupRoutes.post('/:id/restore', catchAsync(restoreBackup));
  backupRoutes.delete('/history/:id', catchAsync(deleteBackup));
  backupRoutes.get('/schedule', catchAsync(getSchedule));
  backupRoutes.put('/schedule', catchAsync(updateSchedule));
} else {
  backupRoutes.post('/trigger', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(triggerBackup));
  backupRoutes.get('/history', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getHistory));
  backupRoutes.get('/history/:id', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getBackupById));
  backupRoutes.post('/:id/restore', authenticate, authorize('super_admin'), catchAsync(restoreBackup));
  backupRoutes.delete('/history/:id', authenticate, authorize('super_admin'), catchAsync(deleteBackup));
  backupRoutes.get('/schedule', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getSchedule));
  backupRoutes.put('/schedule', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(updateSchedule));
}

export default backupRoutes;
