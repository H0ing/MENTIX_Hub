import { user } from '../db/query.js';

export async function create({ title, description, author_id, tags, external_links }) {
  const sql = `
    INSERT INTO projects (title, description, author_id, tags, external_links)
    VALUES (?, ?, ?, ?, ?)
  `;
  const tagsJson = tags ? JSON.stringify(tags) : null;
  const linksJson = external_links ? JSON.stringify(external_links) : null;
  return user(sql, [title, description, author_id, tagsJson, linksJson]);
}

export async function findById(id) {
  const sql = `
    SELECT p.*, u.username, u.full_name, u.avatar_url
    FROM projects p
    JOIN users u ON p.author_id = u.id
    WHERE p.id = ?
  `;
  return user(sql, [id]);
}

export async function findAll({ page, limit, offset, search, tags, author_id, sort }) {
  let baseSql = `
    FROM projects p
    JOIN users u ON p.author_id = u.id
    WHERE 1=1
  `;
  let sql = `
    SELECT p.*, u.username, u.full_name, u.avatar_url
    ${baseSql}
  `;
  const params = [];
  
  if (search) {
    sql += ' AND (p.title LIKE ? OR p.description LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }
  
  if (tags && tags.length > 0) {
    sql += ' AND (';
    tags.forEach((tag, index) => {
      if (index > 0) sql += ' OR ';
      sql += 'JSON_CONTAINS(p.tags, ?)';
      params.push(JSON.stringify(tag));
    });
    sql += ')';
  }
  
  if (author_id) {
    sql += ' AND p.author_id = ?';
    params.push(author_id);
  }
  
  const countSql = ` SELECT COUNT(*) as total ${baseSql} `;
  console.log(countSql);
  const countResult = await user(countSql, params);
  const total = countResult.rows[0].total;
  
  switch (sort) {
    case 'oldest':
      sql += ' ORDER BY p.created_at ASC';
      break;
    case 'popular':
      sql += ' ORDER BY p.view_count DESC';
      break;
    case 'updated':
      sql += ' ORDER BY p.updated_at DESC';
      break;
    default:
      sql += ' ORDER BY p.created_at DESC';
  }
  
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const result = await user(sql, params);
  return { rows: result.rows, count: total };
}

export async function update(id, fields) {
  const allowedFields = ['title', 'description', 'tags', 'external_links'];
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