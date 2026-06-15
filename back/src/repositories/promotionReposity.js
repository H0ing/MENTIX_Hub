import { user, root } from '../db/query.js';

export async function create(user_id, requirements_met) {
  const sql = 'INSERT INTO promotion_queue (user_id, requirements_met) VALUES (?, ?)';
  const requirementsJson = requirements_met ? JSON.stringify(requirements_met) : null;
  return user(sql, [user_id, requirementsJson]);
}

export async function findByUser(user_id) {
  const sql = 'SELECT * FROM promotion_queue WHERE user_id = ? ORDER BY created_at DESC';
  return user(sql, [user_id]);
}

export async function findPending({ page, limit, offset }) {
  const countSql = "SELECT COUNT(*) as total FROM promotion_queue WHERE status = 'pending'";
  const countResult = await user(countSql);
  const total = countResult.rows[0].total;
  
  const sql = `
    SELECT pq.*, u.username, u.full_name, u.email
    FROM promotion_queue pq
    JOIN users u ON pq.user_id = u.id
    WHERE pq.status = 'pending'
    ORDER BY pq.created_at ASC
    LIMIT ? OFFSET ?
  `;
  const result = await user(sql, [limit, offset]);
  return { rows: result.rows, count: total };
}

export async function updateStatus(id, status, reviewed_by, rejection_reason) {
  const sql = `
    UPDATE promotion_queue 
    SET status = ?, reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ?
    WHERE id = ?
  `;
  return user(sql, [status, reviewed_by, rejection_reason || null, id]);
}

export async function getRequirements() {
  const sql = 'SELECT * FROM mentor_requirements WHERE is_active = TRUE';
  return user(sql);
}

export async function updateRequirement(id, { requirement_name, threshold_value, description, is_active }) {
  const updates = [];
  const params = [];
  
  if (requirement_name !== undefined) {
    updates.push('requirement_name = ?');
    params.push(requirement_name);
  }
  
  if (threshold_value !== undefined) {
    updates.push('threshold_value = ?');
    params.push(threshold_value);
  }
  
  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description);
  }
  
  if (is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(is_active);
  }
  
  if (updates.length === 0) {
    return { rows: [] };
  }
  
  params.push(id);
  const sql = `UPDATE mentor_requirements SET ${updates.join(', ')} WHERE id = ?`;
  return root(sql, params);
}