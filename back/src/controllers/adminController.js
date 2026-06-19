import * as userRepo from '../repositories/userRepository.js';
import { log, logRoot } from '../repositories/auditRepository.js';
import { dev, root } from '../db/query.js';
import { transaction } from '../db/transaction.js';
import AppError from '../utils/AppError.js';
import { success, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';

async function getDashboardStats(req, res) {
  const [userCount, projectCount, mentorCount, pendingPromotions, pendingReports, totalHearts, totalComments] = await Promise.all([
    dev('SELECT COUNT(*) as total FROM users'),
    dev('SELECT COUNT(*) as total FROM projects'),
    dev("SELECT COUNT(*) as total FROM users WHERE role = 'mentor'"),
    dev("SELECT COUNT(*) as total FROM promotion_queue WHERE status = 'pending'"),
    dev("SELECT COUNT(*) as total FROM reports WHERE status = 'pending'"),
    dev('SELECT COALESCE(SUM(count), 0) as total FROM hearts'),
    dev('SELECT COUNT(*) as total FROM comments')
  ]);

  success(res, {
    users: userCount.rows[0].total,
    projects: projectCount.rows[0].total,
    mentors: mentorCount.rows[0].total,
    pending_promotions: pendingPromotions.rows[0].total,
    pending_reports: pendingReports.rows[0].total,
    total_hearts: totalHearts.rows[0].total,
    total_comments: totalComments.rows[0].total
  });
}

async function listUsers(req, res) {
  const { role, status, search } = req.query;
  const { page, limit, offset } = getPagination(req.query);

  const result = await userRepo.findAll({ page, limit, offset, role, status, search });

  paginated(res, { rows: result.rows, count: result.count, page, limit });
}

async function getUserDetails(req, res) {
  const { id } = req.params;

  const userResult = await userRepo.findById(id);
  if (!userResult.rows.length) {
    throw new AppError('User not found', 404);
  }

  const user = userResult.rows[0];

  const [projectsResult, heartsResult, commentsResult, mentorshipResult, collabResult] = await Promise.all([
    dev('SELECT COUNT(*) as total FROM projects WHERE author_id = ?', [id]),
    dev('SELECT COALESCE(SUM(h.count), 0) as total FROM hearts h JOIN projects p ON h.project_id = p.id WHERE p.author_id = ?', [id]),
    dev('SELECT COUNT(*) as total FROM comments WHERE user_id = ?', [id]),
    dev("SELECT COUNT(*) as total FROM mentorship_requests WHERE student_id = ? OR mentor_id = ?", [id, id]),
    dev("SELECT COUNT(*) as total FROM collaboration_requests WHERE sender_id = ? OR receiver_id = ?", [id, id])
  ]);

  success(res, {
    ...user,
    stats: {
      projects: projectsResult.rows[0].total,
      hearts_received: heartsResult.rows[0].total,
      comments_made: commentsResult.rows[0].total,
      mentorships: mentorshipResult.rows[0].total,
      collaborations: collabResult.rows[0].total
    }
  });
}

const ROLE_HIERARCHY = ['student', 'mentor', 'moderator', 'dev_admin', 'super_admin'];

async function changeUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['student', 'mentor', 'moderator', 'dev_admin', 'super_admin'];
  if (!validRoles.includes(role)) {
    throw new AppError('Invalid role specified', 400);
  }

  const userResult = await userRepo.findById(id);
  if (!userResult.rows.length) {
    throw new AppError('User not found', 404);
  }

  const targetUser = userResult.rows[0];
  const adminRoleIndex = ROLE_HIERARCHY.indexOf(req.user.role);
  const targetRoleIndex = ROLE_HIERARCHY.indexOf(targetUser.role);
  const newRoleIndex = ROLE_HIERARCHY.indexOf(role);

  if (adminRoleIndex <= targetRoleIndex) {
    throw new AppError('You cannot change the role of a user with equal or higher rank', 403);
  }

  if (newRoleIndex >= adminRoleIndex) {
    throw new AppError('You cannot assign a role equal to or higher than your own', 403);
  }

  if (parseInt(id, 10) === req.user.id) {
    throw new AppError('You cannot change your own role', 400);
  }

  await userRepo.updateRole(id, role);

  await logRoot({
    admin_id: req.user.id,
    admin_role: req.user.role,
    action_type: 'change_user_role',
    target_type: 'user',
    target_id: id,
    method: req.method,
    ip_address: req.ip,
    details: { from: targetUser.role, to: role }
  });

  const updated = await userRepo.findById(id);
  success(res, updated.rows[0], `User role changed to ${role} successfully`);
}

async function updateUserStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['active', 'suspended', 'banned'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status. Must be one of: ' + validStatuses.join(', '), 400);
  }

  const userResult = await userRepo.findById(id);
  if (!userResult.rows.length) {
    throw new AppError('User not found', 404);
  }

  const targetUser = userResult.rows[0];

  if (parseInt(id, 10) === req.user.id) {
    throw new AppError('You cannot change your own status', 400);
  }

  await userRepo.updateStatus(id, status);

  await logRoot({
    admin_id: req.user.id,
    admin_role: req.user.role,
    action_type: `user_${status}`,
    target_type: 'user',
    target_id: id,
    method: req.method,
    ip_address: req.ip,
    details: { previous_status: targetUser.status, new_status: status }
  });

  const updated = await userRepo.findById(id);
  success(res, updated.rows[0], `User status changed to ${status} successfully`);
}

async function deleteUser(req, res) {
  const { id } = req.params;

  const userResult = await userRepo.findById(id);
  if (!userResult.rows.length) {
    throw new AppError('User not found', 404);
  }

  if (parseInt(id, 10) === req.user.id) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const targetUser = userResult.rows[0];
  const adminRoleIndex = ROLE_HIERARCHY.indexOf(req.user.role);
  const targetRoleIndex = ROLE_HIERARCHY.indexOf(targetUser.role);

  if (adminRoleIndex <= targetRoleIndex) {
    throw new AppError('You cannot delete a user with equal or higher rank', 403);
  }

  await transaction(async function(conn) {
    await conn.execute('DELETE FROM users WHERE id = ?', [id]);
  }, 'root');

  await logRoot({
    admin_id: req.user.id,
    admin_role: req.user.role,
    action_type: 'delete_user',
    target_type: 'user',
    target_id: id,
    method: req.method,
    ip_address: req.ip,
    details: { deleted_username: targetUser.username, deleted_email: targetUser.email }
  });

  success(res, null, 'User deleted successfully');
}

async function getAuditLogs(req, res) {
  const { admin_id, action_type, target_type, target_id, start_date, end_date } = req.query;
  const { page, limit, offset } = getPagination(req.query);

  const result = await dev(`
    SELECT al.*, u.username as admin_username
    FROM audit_logs al
    LEFT JOIN users u ON al.admin_id = u.id
    WHERE 1=1
    ${admin_id ? 'AND al.admin_id = ?' : ''}
    ${action_type ? 'AND al.action_type = ?' : ''}
    ${target_type ? 'AND al.target_type = ?' : ''}
    ${target_id ? 'AND al.target_id = ?' : ''}
    ${start_date ? 'AND al.created_at >= ?' : ''}
    ${end_date ? 'AND al.created_at <= ?' : ''}
    ORDER BY al.created_at DESC
    LIMIT ? OFFSET ?
  `, [
    ...(admin_id ? [admin_id] : []),
    ...(action_type ? [action_type] : []),
    ...(target_type ? [target_type] : []),
    ...(target_id ? [target_id] : []),
    ...(start_date ? [start_date] : []),
    ...(end_date ? [end_date] : []),
    limit, offset
  ]);

  const countResult = await dev(`
    SELECT COUNT(*) as total FROM audit_logs WHERE 1=1
    ${admin_id ? 'AND admin_id = ?' : ''}
    ${action_type ? 'AND action_type = ?' : ''}
    ${target_type ? 'AND target_type = ?' : ''}
    ${target_id ? 'AND target_id = ?' : ''}
    ${start_date ? 'AND created_at >= ?' : ''}
    ${end_date ? 'AND created_at <= ?' : ''}
  `, [
    ...(admin_id ? [admin_id] : []),
    ...(action_type ? [action_type] : []),
    ...(target_type ? [target_type] : []),
    ...(target_id ? [target_id] : []),
    ...(start_date ? [start_date] : []),
    ...(end_date ? [end_date] : [])
  ]);

  paginated(res, { rows: result.rows, count: countResult.rows[0].total, page, limit });
}

async function getSystemHealth(req, res) {
  const start = Date.now();

  try {
    await dev('SELECT 1');
    const dbLatency = Date.now() - start;

    success(res, {
      database: {
        status: 'connected',
        latency_ms: dbLatency
      },
      server: {
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        node_version: process.version,
        platform: process.platform
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw new AppError('Database connection failed: ' + error.message, 503);
  }
}

export {
  getDashboardStats,
  listUsers,
  getUserDetails,
  changeUserRole,
  updateUserStatus,
  deleteUser,
  getAuditLogs,
  getSystemHealth
};
