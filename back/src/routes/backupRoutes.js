import { Router } from 'express';
import {
  triggerBackup,
  getHistory,
  getBackupById,
  restoreBackup,
  getSchedule,
  updateSchedule
} from '../controllers/backupController.js';
import authenticate from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import catchAsync from '../utils/catchAsync.js';

const backupRoutes = Router();

// Dev-only (no auth): backupRoutes.post('/trigger', catchAsync(triggerBackup));
// Dev-only (no auth): backupRoutes.get('/history', catchAsync(getHistory));
// Dev-only (no auth): backupRoutes.get('/history/:id', catchAsync(getBackupById));
// Dev-only (no auth): backupRoutes.post('/:id/restore', catchAsync(restoreBackup));
// Dev-only (no auth): backupRoutes.get('/schedule', catchAsync(getSchedule));
// Dev-only (no auth): backupRoutes.put('/schedule', catchAsync(updateSchedule));

backupRoutes.post('/trigger', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(triggerBackup));
backupRoutes.get('/history', authenticate, authorize('admin', 'dev_admin', 'super_admin'), catchAsync(getHistory));
backupRoutes.get('/history/:id', authenticate, authorize('admin', 'dev_admin', 'super_admin'), catchAsync(getBackupById));
backupRoutes.post('/:id/restore', authenticate, authorize('super_admin'), catchAsync(restoreBackup));
backupRoutes.get('/schedule', authenticate, authorize('admin', 'dev_admin', 'super_admin'), catchAsync(getSchedule));
backupRoutes.put('/schedule', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(updateSchedule));

export default backupRoutes;
