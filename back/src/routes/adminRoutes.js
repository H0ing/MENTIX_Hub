/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Super admin & dev admin endpoints
 */

import { Router } from 'express';
import {
  listUsers,
  getUserDetails,
  updateUser,
  changeUserRole,
  updateUserStatus,
  deleteUser,
  createUser,
  getAuditLogs,
  getSystemHealth,
  runQuery,
  listTables,
  optimizeTables,
  listDbUsers,
  createDbUser,
  deleteDbUser
} from '../controllers/adminController.js';
import authenticate from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import catchAsync from '../utils/catchAsync.js';

const adminRoutes = Router();

// Dev-only (no auth): adminRoutes.get('/users', catchAsync(listUsers));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users (super_admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
adminRoutes.get('/users', authenticate, authorize('super_admin'), catchAsync(listUsers));

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a user (super_admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
adminRoutes.post('/users', authenticate, authorize('super_admin'), catchAsync(createUser));

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details (super_admin)
 *     tags: [Admin]
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
 *         description: User details
 */
adminRoutes.get('/users/:id', authenticate, authorize('super_admin'), catchAsync(getUserDetails));

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user (super_admin)
 *     tags: [Admin]
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
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 */
adminRoutes.put('/users/:id', authenticate, authorize('super_admin'), catchAsync(updateUser));

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Change user role (super_admin)
 *     tags: [Admin]
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
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role changed
 */
adminRoutes.put('/users/:id/role', authenticate, authorize('super_admin'), catchAsync(changeUserRole));

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status (super_admin)
 *     tags: [Admin]
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
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: Status updated
 */
adminRoutes.put('/users/:id/status', authenticate, authorize('super_admin'), catchAsync(updateUserStatus));

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user (super_admin)
 *     tags: [Admin]
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
 *         description: User deleted
 */
adminRoutes.delete('/users/:id', authenticate, authorize('super_admin'), catchAsync(deleteUser));

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs (moderator, dev_admin, super_admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs
 */
adminRoutes.get('/audit-logs', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getAuditLogs));

/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     summary: Get system health (moderator, dev_admin, super_admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health data
 */
adminRoutes.get('/health', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(getSystemHealth));

/**
 * @swagger
 * /api/admin/tables:
 *   get:
 *     summary: List database tables (moderator, dev_admin, super_admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tables
 */
adminRoutes.get('/tables', authenticate, authorize('moderator', 'dev_admin', 'super_admin'), catchAsync(listTables));

/**
 * @swagger
 * /api/admin/optimize:
 *   post:
 *     summary: Optimize database tables (dev_admin, super_admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tables optimized
 */
adminRoutes.post('/optimize', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(optimizeTables));

/**
 * @swagger
 * /api/admin/query:
 *   post:
 *     summary: Run a database query (dev_admin, super_admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: Query result
 */
adminRoutes.post('/query', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(runQuery));

/**
 * @swagger
 * /api/admin/db-users:
 *   get:
 *     summary: List database users (dev_admin, super_admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of DB users
 */
adminRoutes.get('/db-users', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(listDbUsers));

/**
 * @swagger
 * /api/admin/db-users:
 *   post:
 *     summary: Create a database user (dev_admin, super_admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: DB user created
 */
adminRoutes.post('/db-users', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(createDbUser));

/**
 * @swagger
 * /api/admin/db-users/{id}:
 *   delete:
 *     summary: Delete a database user (dev_admin, super_admin)
 *     tags: [Admin]
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
 *         description: DB user deleted
 */
adminRoutes.delete('/db-users/:id', authenticate, authorize('dev_admin', 'super_admin'), catchAsync(deleteDbUser));

export default adminRoutes;
