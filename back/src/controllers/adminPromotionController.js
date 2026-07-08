import * as promotionRepo from '../repositories/promotionRepository.js';
import { dev, root, user as userQuery } from '../db/query.js';
import { log } from '../repositories/auditRepository.js';
import AppError from '../utils/AppError.js';
import { success, paginated } from '../utils/response.js';
import { getPagination } from '../utils/pagination.js';

async function getQueue(req, res) {
  const { page, limit, offset } = getPagination(req.query);

  const result = await promotionRepo.findPending({ page, limit, offset });

  const activeResult = await dev('SELECT requirement_key, threshold_value FROM mentor_requirements WHERE is_active = TRUE');
  const requirements = activeResult.rows;

  const rows = await Promise.all(result.rows.map(async row => {
    const statsResult = await dev(`
      SELECT
        (SELECT COUNT(*) FROM projects WHERE author_id = ?) AS project_count,
        (SELECT COUNT(*) FROM hearts h JOIN projects p ON h.project_id = p.id WHERE p.author_id = ?) AS total_hearts,
        (SELECT DATEDIFF(NOW(), created_at) FROM users WHERE id = ?) AS account_age_days,
        (SELECT COUNT(*) FROM comments WHERE user_id = ?) AS comment_count
    `, [row.user_id, row.user_id, row.user_id, row.user_id]);
    const stats = statsResult.rows[0];

    const requirementsMet = {};
    let allMet = true;

    for (const req of requirements) {
      let actual;
      if (req.requirement_key === 'min_projects') actual = stats.project_count;
      else if (req.requirement_key === 'min_hearts') actual = stats.total_hearts;
      else if (req.requirement_key === 'min_account_age_days') actual = stats.account_age_days;
      else if (req.requirement_key === 'min_comments') actual = stats.comment_count;

      const met = actual >= req.threshold_value;
      requirementsMet[req.requirement_key] = { required: req.threshold_value, actual, met };
      if (!met) allMet = false;
    }

    const parsed = typeof row.requirements_met === 'string'
      ? JSON.parse(row.requirements_met)
      : row.requirements_met;

    return {
      ...row,
      requirements_met: requirementsMet,
      _stored_requirements: parsed
    };
  }));

  paginated(res, { rows, count: result.count, page, limit });
}

async function review(req, res) {
  const { id } = req.params;
  const { status, rejection_reason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Status must be approved or rejected', 400);
  }

  if (status === 'rejected' && !rejection_reason) {
    throw new AppError('Rejection reason is required when rejecting', 400);
  }

  const requestResult = await dev(
    `SELECT pq.*, u.email, u.username FROM promotion_queue pq
     JOIN users u ON pq.user_id = u.id
     WHERE pq.id = ?`, [id]
  );
  if (!requestResult.rows.length) {
    throw new AppError('Promotion request not found', 404);
  }

  const promotion = requestResult.rows[0];
  if (promotion.status !== 'pending') {
    throw new AppError('This request has already been reviewed', 400);
  }

  await promotionRepo.updateStatus(id, status, req.user.id, rejection_reason || null);

  if (status === 'approved') {
    await root('UPDATE users SET role = ? WHERE id = ?', ['mentor', promotion.user_id]);
  }

  await log({
    admin_id: req.user.id,
    admin_role: req.user.role,
    action_type: `promotion_${status}`,
    target_type: 'promotion_queue',
    target_id: id,
    method: req.method,
    ip_address: req.ip,
    details: { user_id: promotion.user_id, rejection_reason: rejection_reason || null }
  });

  if (promotion.email) {
    const formType = status === 'approved' ? 'promotion_approved' : 'promotion_rejected';
    const subject = status === 'approved'
      ? 'Mentor Promotion Approved'
      : 'Mentor Promotion Rejected';
    const body = status === 'approved'
      ? `Congratulations ${promotion.username}! Your request to become a mentor has been approved. You can now start mentoring students.`
      : `Your request to become a mentor has been rejected.${rejection_reason ? `\nReason: ${rejection_reason}` : ''}\nYou may re-apply once you meet the requirements.`;
    await userQuery(
      `INSERT INTO admin_sent_forms (subject, recipient_id, sent_by, form_type, body, related_entity_type, related_entity_id)
       VALUES (?, ?, ?, ?, ?, 'promotion', ?)`,
      [subject, promotion.user_id, req.user.id, formType, body, id]
    );
  }

  const updated = await dev(
    `SELECT pq.*, u.email, u.username FROM promotion_queue pq
     JOIN users u ON pq.user_id = u.id
     WHERE pq.id = ?`, [id]
  );
  success(res, updated.rows[0], `Promotion request ${status} successfully`);
}

async function getRequirements(req, res) {
  const result = await dev('SELECT * FROM mentor_requirements ORDER BY id ASC');
  success(res, result.rows);
}

async function autoEnqueueEligibleStudents(scannedBy) {
  const activeResult = await dev('SELECT requirement_key, threshold_value FROM mentor_requirements WHERE is_active = TRUE');
  const requirements = activeResult.rows;

  if (requirements.length === 0) return 0;

  const studentsResult = await dev(
    `SELECT id, username, email, full_name FROM users WHERE role = 'student' ORDER BY username ASC`
  );
  const students = studentsResult.rows;
  if (students.length === 0) return 0;

  const existingResult = await dev(
    `SELECT user_id FROM promotion_queue WHERE status = 'pending'`
  );
  const pendingUserIds = new Set(existingResult.rows.map(r => r.user_id));

  const studentIds = students.map(s => s.id);
  const placeholders = studentIds.map(() => '?').join(',');

  const statsResult = await dev(`
    SELECT
      u.id AS user_id,
      (SELECT COUNT(*) FROM projects WHERE author_id = u.id) AS project_count,
      (SELECT COUNT(*) FROM hearts h JOIN projects p ON h.project_id = p.id WHERE p.author_id = u.id) AS total_hearts,
      DATEDIFF(NOW(), u.created_at) AS account_age_days,
      (SELECT COUNT(*) FROM comments WHERE user_id = u.id) AS comment_count
    FROM users u WHERE u.id IN (${placeholders})
  `, studentIds);

  const statsMap = {};
  statsResult.rows.forEach(row => {
    statsMap[row.user_id] = row;
  });

  let enqueued = 0;

  for (const student of students) {
    if (pendingUserIds.has(student.id)) continue;

    const stats = statsMap[student.id];
    if (!stats) continue;

    let allMet = true;
    const requirementsMet = {};

    for (const req of requirements) {
      let actual;
      if (req.requirement_key === 'min_projects') actual = stats.project_count;
      else if (req.requirement_key === 'min_hearts') actual = stats.total_hearts;
      else if (req.requirement_key === 'min_account_age_days') actual = stats.account_age_days;
      else if (req.requirement_key === 'min_comments') actual = stats.comment_count;

      const met = actual >= req.threshold_value;
      requirementsMet[req.requirement_key] = { required: req.threshold_value, actual, met };
      if (!met) allMet = false;
    }

    if (allMet) {
      await promotionRepo.create(student.id, requirementsMet);
      enqueued++;
    }
  }

  if (scannedBy) {
    await log({
      admin_id: scannedBy.id,
      admin_role: scannedBy.role,
      action_type: 'auto_enqueue',
      target_type: 'promotion_queue',
      target_id: null,
      method: 'POST',
      ip_address: null,
      details: { students_scanned: students.length, enqueued }
    });
  }

  return enqueued;
}

async function updateRequirement(req, res) {
  const { id } = req.params;
  const { requirement_name, threshold_value, description, is_active } = req.body;

  const existing = await dev('SELECT * FROM mentor_requirements WHERE id = ?', [id]);
  if (!existing.rows.length) {
    throw new AppError('Requirement not found', 404);
  }

  await promotionRepo.updateRequirement(id, { requirement_name, threshold_value, description, is_active });

  const enqueued = await autoEnqueueEligibleStudents(req.user);

  await log({
    admin_id: req.user.id,
    admin_role: req.user.role,
    action_type: 'update_requirement',
    target_type: 'mentor_requirements',
    target_id: id,
    method: req.method,
    ip_address: req.ip,
    details: { requirement_name, threshold_value, description, is_active, auto_enqueued: enqueued }
  });

  const updated = await dev('SELECT * FROM mentor_requirements WHERE id = ?', [id]);
  success(res, { requirement: updated.rows[0], auto_enqueued: enqueued }, 'Requirement updated successfully');
}

async function triggerAutoEnqueue(req, res) {
  const count = await autoEnqueueEligibleStudents(req.user);
  success(res, { enqueued: count }, `${count} student(s) auto-enqueued for promotion`);
}

async function getAllStudentEligibility(req, res) {
  const { page, limit, offset } = getPagination(req.query);

  const activeResult = await dev('SELECT requirement_key, threshold_value FROM mentor_requirements WHERE is_active = TRUE');
  const requirements = activeResult.rows;

  const countResult = await dev("SELECT COUNT(*) AS total FROM users WHERE role = 'student'");
  const total = countResult.rows[0].total;

  if (total === 0) {
    return paginated(res, { rows: [], count: 0, page, limit });
  }

  const studentsResult = await dev(
    `SELECT id, username, email, full_name FROM users WHERE role = 'student' ORDER BY username ASC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const students = studentsResult.rows;

  const studentIds = students.map(s => s.id);
  const placeholders = studentIds.map(() => '?').join(',');

  const statsResult = await dev(`
    SELECT
      u.id AS user_id,
      (SELECT COUNT(*) FROM projects WHERE author_id = u.id) AS project_count,
      (SELECT COUNT(*) FROM hearts h JOIN projects p ON h.project_id = p.id WHERE p.author_id = u.id) AS total_hearts,
      DATEDIFF(NOW(), u.created_at) AS account_age_days,
      (SELECT COUNT(*) FROM comments WHERE user_id = u.id) AS comment_count
    FROM users u WHERE u.id IN (${placeholders})
  `, studentIds);

  const statsMap = {};
  statsResult.rows.forEach(row => {
    statsMap[row.user_id] = row;
  });

  const rows = students.map(student => {
    const stats = statsMap[student.id] || { project_count: 0, total_hearts: 0, account_age_days: 0, comment_count: 0 };
    const requirementsMet = {};
    let allMet = true;

    for (const req of requirements) {
      let actual;
      if (req.requirement_key === 'min_projects') actual = stats.project_count;
      else if (req.requirement_key === 'min_hearts') actual = stats.total_hearts;
      else if (req.requirement_key === 'min_account_age_days') actual = stats.account_age_days;
      else if (req.requirement_key === 'min_comments') actual = stats.comment_count;

      const met = actual >= req.threshold_value;
      requirementsMet[req.requirement_key] = { required: req.threshold_value, actual, met };
      if (!met) allMet = false;
    }

    return {
      user_id: student.id,
      username: student.username,
      email: student.email,
      full_name: student.full_name,
      role: student.role,
      stats: {
        projects: stats.project_count,
        hearts: stats.total_hearts,
        account_age_days: stats.account_age_days,
        comments: stats.comment_count
      },
      requirements_met: requirementsMet,
      all_met: requirements.length === 0 ? true : allMet
    };
  });

  paginated(res, { rows, count: total, page, limit });
}

export {
  getQueue,
  review,
  getRequirements,
  updateRequirement,
  getAllStudentEligibility,
  triggerAutoEnqueue
};
