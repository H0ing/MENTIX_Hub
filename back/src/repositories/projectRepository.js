import { user } from '../db/query.js';
import { getDefaultCover } from '../utils/defaultCover.js';

export async function create({ title, description, category, author_id, tags, external_links }) {
  const defaultThumbnail = getDefaultCover(category);
  const sql = `
    INSERT INTO projects (title, description, category, author_id, tags, external_links, thumbnail)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const tagsJson = tags ? JSON.stringify(tags) : null;
  const linksJson = external_links ? JSON.stringify(external_links) : null;
  return user(sql, [title, description, category || null, author_id, tagsJson, linksJson, defaultThumbnail]);
}

export async function findById(id) {
  const sql = `
    SELECT p.*, u.username, u.full_name, u.avatar_url, u.role AS author_role, u.year AS author_year,
           (SELECT COUNT(*) FROM hearts WHERE project_id = p.id) AS heart_count,
           (SELECT COUNT(*) FROM comments WHERE project_id = p.id) AS comment_count
    FROM projects p
    JOIN users u ON p.author_id = u.id
    WHERE p.id = ?
  `;
  return user(sql, [id]);
}

export async function findAll({ page, limit, offset, search, tags, category, author_id, sort, year, exclude_author_id }) {
  let whereClause = ' WHERE 1=1';
  const params = [];
  
  if (search) {
    whereClause += ' AND (p.title LIKE ? OR p.description LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }
  
  if (tags && tags.length > 0) {
    whereClause += ' AND (';
    tags.forEach((tag, index) => {
      if (index > 0) whereClause += ' OR ';
      whereClause += 'JSON_CONTAINS(p.tags, ?)';
      params.push(JSON.stringify(tag));
    });
    whereClause += ')';
  }
  
  if (author_id) {
    whereClause += ' AND p.author_id = ?';
    params.push(author_id);
  }
  
  if (exclude_author_id) {
    whereClause += ' AND p.author_id != ?';
    params.push(Number(exclude_author_id));
  }

  if (category) {
    whereClause += ' AND p.category = ?';
    params.push(category);
  }
  
  if (year && year.length > 0) {
    whereClause += ` AND u.year IN (${year.map(() => '?').join(',')})`;
    params.push(...year);
  }
  
  const fromClause = `FROM projects p JOIN users u ON p.author_id = u.id${whereClause}`;
  
  const countSql = `SELECT COUNT(*) as total ${fromClause}`;
  const countResult = await user(countSql, params);
  const total = countResult.rows[0].total;
  
  let orderClause;
  switch (sort) {
    case 'oldest':
      orderClause = 'ORDER BY p.created_at ASC';
      break;
    case 'popular':
      orderClause = 'ORDER BY p.view_count DESC';
      break;
    case 'updated':
      orderClause = 'ORDER BY p.updated_at DESC';
      break;
    case 'favorite':
      orderClause = 'ORDER BY heart_count DESC, p.created_at DESC';
      break;
    default:
      orderClause = 'ORDER BY p.created_at DESC';
  }
  
  const dataSql = `
    SELECT p.*, u.username, u.full_name, u.avatar_url, u.role AS author_role, u.year AS author_year,
           (SELECT COUNT(*) FROM hearts WHERE project_id = p.id) AS heart_count,
           (SELECT COUNT(*) FROM comments WHERE project_id = p.id) AS comment_count
    ${fromClause}
    ${orderClause}
    LIMIT ? OFFSET ?
  `;
  
  const result = await user(dataSql, [...params, limit, offset]);
  return { rows: result.rows, count: total };
}

export async function update(id, fields) {
  const allowedFields = ['title', 'description', 'category', 'tags', 'external_links'];
  const updates = [];
  const params = [];
  
  for (const [key, value] of Object.entries(fields)) {
    if (allowedFields.includes(key) && value !== undefined) {
      if (key === 'tags' || key === 'external_links') {
        updates.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      } else {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }
  }
  
  if (updates.length === 0) {
    return { rows: [] };
  }
  
  params.push(id);
  const sql = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
  return user(sql, params);
}

export async function deleteById(id) {
  const sql = 'DELETE FROM projects WHERE id = ?';
  return user(sql, [id]);
}

export async function incrementViewCount(id) {
  const sql = 'UPDATE projects SET view_count = view_count + 1 WHERE id = ?';
  return user(sql, [id]);
}

export async function updateFile(id, { file_name, file_path, file_original_name, file_size }) {
  const sql = `
    UPDATE projects 
    SET file_name = ?, file_path = ?, file_original_name = ?, file_size = ?
    WHERE id = ?
  `;
  return user(sql, [file_name, file_path, file_original_name, file_size, id]);
}

export async function updateThumbnail(id, thumbnail) {
  const sql = 'UPDATE projects SET thumbnail = ? WHERE id = ?';
  return user(sql, [thumbnail, id]);
}