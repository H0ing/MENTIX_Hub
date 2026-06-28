import * as userRepo from '../repositories/userRepository.js';
import { log, logRoot } from '../repositories/auditRepository.js';
import { dev, root } from '../db/query.js';
import { transaction } from '../db/transaction.js';
import AppError from '../utils/AppError.js';
import { success, created, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';
import { hashPassword } from '../utils/hash.js';
import config from '../config/env.js';

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
  const userRole = req.user.role;

  let roleFilter = '';
  let roleParam = undefined;
  if (userRole !== 'super_admin') {
    roleFilter = 'AND u.role = ?';
    roleParam = userRole;
  }

  const result = await dev(`
    SELECT al.*, u.username as admin_username
    FROM audit_logs al
    LEFT JOIN users u ON al.admin_id = u.id
    WHERE 1=1
    ${roleFilter}
    ${admin_id ? 'AND al.admin_id = ?' : ''}
    ${action_type ? 'AND al.action_type = ?' : ''}
    ${target_type ? 'AND al.target_type = ?' : ''}
    ${target_id ? 'AND al.target_id = ?' : ''}
    ${start_date ? 'AND al.created_at >= ?' : ''}
    ${end_date ? 'AND al.created_at <= ?' : ''}
    ORDER BY al.created_at DESC
    LIMIT ? OFFSET ?
  `, [
    ...(roleParam ? [roleParam] : []),
    ...(admin_id ? [admin_id] : []),
    ...(action_type ? [action_type] : []),
    ...(target_type ? [target_type] : []),
    ...(target_id ? [target_id] : []),
    ...(start_date ? [start_date] : []),
    ...(end_date ? [end_date] : []),
    limit, offset
  ]);

  const countResult = await dev(`
    SELECT COUNT(*) as total FROM audit_logs al
    LEFT JOIN users u ON al.admin_id = u.id
    WHERE 1=1
    ${roleFilter}
    ${admin_id ? 'AND al.admin_id = ?' : ''}
    ${action_type ? 'AND al.action_type = ?' : ''}
    ${target_type ? 'AND al.target_type = ?' : ''}
    ${target_id ? 'AND al.target_id = ?' : ''}
    ${start_date ? 'AND al.created_at >= ?' : ''}
    ${end_date ? 'AND al.created_at <= ?' : ''}
  `, [
    ...(roleParam ? [roleParam] : []),
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

async function runQuery(req, res) {
  const { sql } = req.body;
  if (!sql || !/^\s*select\b/i.test(sql.trim())) {
    throw new AppError('Only SELECT statements are allowed.', 400);
  }

  let result;
  try {
    result = await dev(sql);
  } catch (queryError) {
    throw new AppError('Query failed: ' + queryError.message, 400);
  }

  const rows = result.rows;
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const rowValues = rows.map(r => Object.values(r));

  await log({
    admin_id: req.user.id,
    admin_role: req.user.role,
    action_type: 'run_query',
    target_type: 'database',
    target_id: null,
    method: req.method,
    ip_address: req.ip,
    details: { sql: sql.substring(0, 200) }
  });

  success(res, { columns, rows: rowValues });
}

async function listTables(req, res) {
  const result = await dev("SELECT TABLE_NAME as name, TABLE_ROWS as rows, ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as size_mb, ENGINE as engine, TABLE_COLLATION as collation FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME", [config.db.database]);

  const tables = result.rows.map(t => ({
    name: t.name,
    rows: t.rows !== null ? Number(t.rows).toLocaleString() : '0',
    size: t.size_mb !== null ? `${t.size_mb} MB` : '0 MB',
    engine: t.engine,
    collation: t.collation
  }));

  success(res, tables);
}

async function optimizeTables(req, res) {
  const { tables } = req.body;
  if (!tables || !Array.isArray(tables) || tables.length === 0) {
    throw new AppError('At least one table must be specified.', 400);
  }

  const sanitized = tables.map(t => t.replace(/[^a-zA-Z0-9_]/g, ''));
  const sql = `OPTIMIZE TABLE ${sanitized.join(', ')}`;

  try {
    await root(sql);
  } catch (queryError) {
    throw new AppError('Optimization failed: ' + queryError.message, 500);
  }

  await logRoot({
    admin_id: req.user.id,
    admin_role: req.user.role,
    action_type: 'optimize_tables',
    target_type: 'database',
    method: req.method,
    ip_address: req.ip,
    details: { tables: sanitized }
  });

  success(res, { optimized: sanitized }, 'Tables optimized successfully.');
}

async function listDbUsers(req, res) {
  const viewResult = await root('SELECT * FROM mentix_hub.db_user_grants');

  const userMap = {};
  for (const row of viewResult.rows) {
    if (!userMap[row.id]) {
      userMap[row.id] = { id: row.id, username: row.username, host: row.host, grants: [] };
    }
    if (row.db_grants) {
      userMap[row.id].grants.push(row.db_grants);
    }
  }

  success(res, Object.values(userMap));
}

async function createDbUser(req, res) {
  const { username, host, password, privileges } = req.body;

  if (!username || !password) {
    throw new AppError('Username and password are required', 400);
  }

  const sanitizedUser = username.replace(/[^a-zA-Z0-9_$-]/g, '');
  const sanitizedHost = host === '%' ? '%' : 'localhost';
  const escapedPass = password.replace(/'/g, "\\'");

  try {
    await root(`CREATE USER IF NOT EXISTS '${sanitizedUser}'@'${sanitizedHost}' IDENTIFIED BY '${escapedPass}'`);

    if (privileges && privileges.length > 0) {
      for (const p of privileges) {
        const table = p.table === 'ALL' ? '*' : '`' + p.table.replace(/[^a-zA-Z0-9_]/g, '') + '`';
        const priv = p.priv || 'SELECT';
        await root(`GRANT ${priv} ON mentix_hub.${table} TO '${sanitizedUser}'@'${sanitizedHost}'`);
      }
    }

    await root(`FLUSH PRIVILEGES`);
  } catch (err) {
    throw new AppError('Failed to create database user: ' + err.message, 500);
  }

  success(res, { username: sanitizedUser, host: sanitizedHost }, 'Database user created successfully');
}

async function deleteDbUser(req, res) {
  const { id } = req.params;
  const [username, host] = id.split('@');

  if (!username || !host) {
    throw new AppError('Invalid user identifier', 400);
  }

  const sanitizedUser = username.replace(/[^a-zA-Z0-9_$-]/g, '');
  const sanitizedHost = host === '%' ? '%' : 'localhost';

  try {
    await root(`DROP USER IF EXISTS '${sanitizedUser}'@'${sanitizedHost}'`);
    await root('FLUSH PRIVILEGES');
  } catch (err) {
    throw new AppError('Failed to delete database user: ' + err.message, 500);
  }

  success(res, null, 'Database user deleted successfully');
}

async function createUser(req, res) {
  const { username, email, password, full_name, role } = req.body;

  if (!username || !email || !password) {
    throw new AppError('Username, email, and password are required.', 400);
  }

  const existingEmail = await userRepo.findByEmail(email);
  if (existingEmail.rows.length) {
    throw new AppError('Email already in use.', 409);
  }

  const existingUsername = await userRepo.findByUsername(username);
  if (existingUsername.rows.length) {
    throw new AppError('Username already taken.', 409);
  }

  const password_hash = await hashPassword(password);
  const validRole = ['student', 'mentor', 'moderator', 'dev_admin', 'super_admin'].includes(role) ? role : 'student';

  const result = await userRepo.create({ username, email, password_hash, full_name, role: validRole, status: 'active' });

  await log({
    admin_id: req.user.id,
    admin_role: req.user.role,
    action_type: 'create_user',
    target_type: 'user',
    target_id: result.rows.insertId,
    method: req.method,
    ip_address: req.ip,
    details: { created_username: username, created_email: email, created_role: validRole }
  });

  created(res, { id: result.rows.insertId, username, email, full_name, role: validRole }, 'User created successfully');
}

export {
  listUsers,
  getUserDetails,
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
};
