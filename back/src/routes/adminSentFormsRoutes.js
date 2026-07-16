/**
 * @swagger
 * tags:
 *   name: Admin Sent Forms
 *   description: Admin sent form management
 */

import { Router } from 'express';
import {
  getAllSentForms,
  getSentFormById,
  deleteSentForm,
} from '../controllers/adminSentFormController.js';
import authenticate from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import catchAsync from '../utils/catchAsync.js';

const router = Router();

/**
 * @swagger
 * /api/admin/sent-forms:
 *   get:
 *     summary: Get all sent forms (moderator, super_admin)
 *     tags: [Admin Sent Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sent forms
 */
router.get('/',              authenticate, authorize('moderator', 'super_admin'),   catchAsync(getAllSentForms));

/**
 * @swagger
 * /api/admin/sent-forms/{id}:
 *   get:
 *     summary: Get a sent form by ID (moderator, super_admin)
 *     tags: [Admin Sent Forms]
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
 *         description: Sent form data
 */
router.get('/:id',           authenticate, authorize('moderator', 'super_admin'),   catchAsync(getSentFormById));

/**
 * @swagger
 * /api/admin/sent-forms/{id}:
 *   delete:
 *     summary: Delete a sent form (dev_admin, super_admin)
 *     tags: [Admin Sent Forms]
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
 *         description: Sent form deleted
 */
router.delete('/:id',        authenticate, authorize('dev_admin', 'super_admin'),   catchAsync(deleteSentForm));

export default router;
