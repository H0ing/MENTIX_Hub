/**
 * @swagger
 * tags:
 *   name: Backups
 *   description: "Database backup and restore (dev mode: no auth, prod: role-based)"
 */

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

/**
 * @swagger
 * /api/backups/trigger:
 *   post:
 *     summary: Trigger a manual backup
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup triggered
 */
if (isDev) {
  backupRoutes.post('/trigger', catchAsync(triggerBackup));
} else {
  backupRoutes.post('/trigger', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(triggerBackup));
}

/**
 * @swagger
 * /api/backups/history:
 *   get:
 *     summary: Get backup history
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup history
 */
if (isDev) {
  backupRoutes.get('/history', catchAsync(getHistory));
} else {
  backupRoutes.get('/history', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getHistory));
}

/**
 * @swagger
 * /api/backups/recoverable:
 *   get:
 *     summary: Get recoverable backups
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recoverable backups
 */
if (isDev) {
  backupRoutes.get('/recoverable', catchAsync(getRecoverableHistory));
} else {
  backupRoutes.get('/recoverable', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getRecoverableHistory));
}

/**
 * @swagger
 * /api/backups/history/{id}:
 *   get:
 *     summary: Get backup by ID
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup data
 */
if (isDev) {
  backupRoutes.get('/history/:id', catchAsync(getBackupById));
} else {
  backupRoutes.get('/history/:id', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getBackupById));
}

/**
 * @swagger
 * /api/backups/{id}/restore:
 *   post:
 *     summary: Restore a backup
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup restored
 */
if (isDev) {
  backupRoutes.post('/:id/restore', catchAsync(restoreBackup));
} else {
  backupRoutes.post('/:id/restore', authenticate, authorize('super_admin'), catchAsync(restoreBackup));
}

/**
 * @swagger
 * /api/backups/history/{id}:
 *   delete:
 *     summary: Delete a backup
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup deleted
 */
if (isDev) {
  backupRoutes.delete('/history/:id', catchAsync(deleteBackup));
} else {
  backupRoutes.delete('/history/:id', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(deleteBackup));
}

/**
 * @swagger
 * /api/backups/schedules:
 *   get:
 *     summary: Get backup schedules
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of schedules
 */
if (isDev) {
  backupRoutes.get('/schedules', catchAsync(getSchedules));
} else {
  backupRoutes.get('/schedules', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getSchedules));
}

/**
 * @swagger
 * /api/backups/schedules:
 *   post:
 *     summary: Create a backup schedule
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cron_expression:
 *                 type: string
 *     responses:
 *       201:
 *         description: Schedule created
 */
if (isDev) {
  backupRoutes.post('/schedules', catchAsync(createSchedule));
} else {
  backupRoutes.post('/schedules', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(createSchedule));
}

/**
 * @swagger
 * /api/backups/schedules/{id}:
 *   put:
 *     summary: Update a backup schedule
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cron_expression:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Schedule updated
 */
if (isDev) {
  backupRoutes.put('/schedules/:id', catchAsync(updateScheduleById));
} else {
  backupRoutes.put('/schedules/:id', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(updateScheduleById));
}

/**
 * @swagger
 * /api/backups/schedules/{id}:
 *   delete:
 *     summary: Delete a backup schedule
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schedule deleted
 */
if (isDev) {
  backupRoutes.delete('/schedules/:id', catchAsync(deleteScheduleById));
} else {
  backupRoutes.delete('/schedules/:id', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(deleteScheduleById));
}

export default backupRoutes;
