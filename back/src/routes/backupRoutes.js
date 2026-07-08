import { Router } from 'express';
import {
  triggerBackup,
  getHistory,
  getRecoverableHistory,
  getBackupById,
  restoreBackup,
  deleteBackup,
  getSchedules,
  createSchedule,
  updateScheduleById,
  deleteScheduleById
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
  backupRoutes.get('/recoverable', catchAsync(getRecoverableHistory));
  backupRoutes.get('/history/:id', catchAsync(getBackupById));
  backupRoutes.post('/:id/restore', catchAsync(restoreBackup));
  backupRoutes.delete('/history/:id', catchAsync(deleteBackup));
  backupRoutes.get('/schedules', catchAsync(getSchedules));
  backupRoutes.post('/schedules', catchAsync(createSchedule));
  backupRoutes.put('/schedules/:id', catchAsync(updateScheduleById));
  backupRoutes.delete('/schedules/:id', catchAsync(deleteScheduleById));
} else {
  backupRoutes.post('/trigger', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(triggerBackup));
  backupRoutes.get('/history', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getHistory));
  backupRoutes.get('/recoverable', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getRecoverableHistory));
  backupRoutes.get('/history/:id', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getBackupById));
  backupRoutes.post('/:id/restore', authenticate, authorize('super_admin'), catchAsync(restoreBackup));
  backupRoutes.delete('/history/:id', authenticate, authorize('super_admin'), catchAsync(deleteBackup));
  backupRoutes.get('/schedules', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getSchedules));
  backupRoutes.post('/schedules', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(createSchedule));
  backupRoutes.put('/schedules/:id', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(updateScheduleById));
  backupRoutes.delete('/schedules/:id', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(deleteScheduleById));
}

export default backupRoutes;
