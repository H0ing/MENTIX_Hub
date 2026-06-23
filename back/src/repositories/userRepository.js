import { user, root } from '../db/query.js';

export async function findByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = ?';
  return user(sql, [email]);
}

export async function findById(id) {
  const sql = 'SELECT * FROM users WHERE id = ?';
  return user(sql, [id]);
}

export async function findByUsername(username) {
  const sql = 'SELECT * FROM users WHERE username = ?';
  return user(sql, [username]);
}

export async function create({ username, email, password_hash, full_name, role }) {
  const sql = `
    INSERT INTO users (username, email, password_hash, full_name, role)
    VALUES (?, ?, ?, ?, ?)
  `;
  return user(sql, [username, email, password_hash, full_name, role || 'student']);
}

export async function updateStatus(id, status) {
  const sql = 'UPDATE users SET status = ? WHERE id = ?';
  return user(sql, [status, id]);
}

export async function updatePassword(id, password_hash) {
  const sql = 'UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?';
  return user(sql, [password_hash, id]);
}

export async function updateProfile(id, { full_name, bio, website, github, twitter, linkedin, avatar_url }) {
  const sql = `
    UPDATE users 
    SET full_name = ?, bio = ?, website = ?, github = ?, twitter = ?, linkedin = ?, avatar_url = ?
    WHERE id = ?
  `;
  return user(sql, [full_name, bio, website, github, twitter, linkedin, avatar_url, id]);
}

export async function updateLastLogin(id) {
  const sql = 'UPDATE users SET last_login = NOW() WHERE id = ?';
  return user(sql, [id]);
}

export async function incrementTokenVersion(id) {
  const sql = 'UPDATE users SET token_version = token_version + 1 WHERE id = ?';
  return user(sql, [id]);
}

export async function updateRole(id, role) {
  const sql = 'UPDATE users SET role = ? WHERE id = ?';
  return root(sql, [role, id]);
}

export async function findAll({ page, limit, offset, role, status, search }) {
  let sql = 'SELECT * FROM users WHERE 1=1';
  const params = [];
  
  if (role) {
    const roles = Array.isArray(role) ? role : role.split(',').map(r => r.trim()).filter(Boolean);
    if (roles.length === 1) {
      sql += ' AND role = ?';
      params.push(roles[0]);
    } else if (roles.length > 1) {
      sql += ` AND role IN (${roles.map(() => '?').join(',')})`;
      params.push(...roles);
    }
  }
  
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  
  if (search) {
    sql += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }
  
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countResult = await user(countSql, params);
  const total = countResult.rows[0].total;
  
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const result = await user(sql, params);
  return { rows: result.rows, count: total };
}

export async function deleteById(id) {
  const sql = 'DELETE FROM users WHERE id = ?';
  return root(sql, [id]);
}