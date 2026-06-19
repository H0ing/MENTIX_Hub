import { Router } from 'express';
import {
  getDashboardStats,
  listUsers,
  getUserDetails,
  changeUserRole,
  updateUserStatus,
  deleteUser,
  getAuditLogs,
  getSystemHealth
} from '../controllers/adminController.js';
import authenticate from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import catchAsync from '../utils/catchAsync.js';

const adminRoutes = Router();

// Dev-only (no auth): adminRoutes.get('/dashboard', catchAsync(getDashboardStats));
// Dev-only (no auth): adminRoutes.get('/users', catchAsync(listUsers));
// Dev-only (no auth): adminRoutes.get('/users/:id', catchAsync(getUserDetails));
// Dev-only (no auth): adminRoutes.put('/users/:id/role', catchAsync(changeUserRole));
// Dev-only (no auth): adminRoutes.put('/users/:id/status', catchAsync(updateUserStatus));
// Dev-only (no auth): adminRoutes.delete('/users/:id', catchAsync(deleteUser));
// Dev-only (no auth): adminRoutes.get('/audit-logs', catchAsync(getAuditLogs));
// Dev-only (no auth): adminRoutes.get('/health', catchAsync(getSystemHealth));

adminRoutes.get('/dashboard', authenticate, authorize('admin', 'dev_admin', 'super_admin'), catchAsync(getDashboardStats));
adminRoutes.get('/users', authenticate, authorize('admin', 'dev_admin', 'super_admin'), catchAsync(listUsers));
adminRoutes.get('/users/:id', authenticate, authorize('admin', 'dev_admin', 'super_admin'), catchAsync(getUserDetails));
adminRoutes.put('/users/:id/role', authenticate, authorize('admin', 'dev_admin', 'super_admin'), catchAsync(changeUserRole));
adminRoutes.put('/users/:id/status', authenticate, authorize('admin', 'dev_admin', 'super_admin'), catchAsync(updateUserStatus));
adminRoutes.delete('/users/:id', authenticate, authorize('admin', 'dev_admin', 'super_admin'), catchAsync(deleteUser));
adminRoutes.get('/audit-logs', authenticate, authorize('admin', 'dev_admin', 'super_admin'), catchAsync(getAuditLogs));
adminRoutes.get('/health', authenticate, authorize('admin', 'dev_admin', 'super_admin'), catchAsync(getSystemHealth));

export default adminRoutes;
