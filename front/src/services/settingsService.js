import * as adminApi     from '../api/adminApi';
import * as promotionApi from '../api/promotionApi';

function unwrap(response) {
  return response.data;
}

function asRequirementsMap(items) {
  const map = {};
  items.forEach(item => {
    map[item.requirement_key] = item;
  });
  return map;
}

// ── System health / DB stats ─────────────────────────────────────────────────
export async function getDatabaseStats() {
  return unwrap(await adminApi.getSystemHealth());
}

// ── Mentor requirements (used by SettingsPage) ───────────────────────────────
export async function getMentorRequirements() {
  const response = unwrap(await promotionApi.adminGetRequirements());
  const items = response.data ?? [];
  const reqs = asRequirementsMap(items);

  return {
    items,
    minProjects: reqs.min_projects?.threshold_value ?? 0,
    minProjectsEnabled: reqs.min_projects?.is_active ?? true,
    minHearts: reqs.min_hearts?.threshold_value ?? 0,
    minHeartsEnabled: reqs.min_hearts?.is_active ?? true,
    minAccountAge: reqs.min_account_age_days?.threshold_value ?? 0,
    minAccountAgeEnabled: reqs.min_account_age_days?.is_active ?? true,
    minComments: reqs.min_comments?.threshold_value ?? 0,
    minCommentsEnabled: reqs.min_comments?.is_active ?? true
  };
}

export async function updateMentorRequirement(id, payload) {
  return unwrap(await promotionApi.adminUpdateRequirement(id, payload));
}

export async function saveMentorRequirements(payload) {
  const response = await promotionApi.adminGetRequirements();
  const items = response.data?.data ?? [];
  const reqs = asRequirementsMap(items);
  const results = [];

  if (reqs.min_projects) {
    results.push(updateMentorRequirement(reqs.min_projects.id, {
      threshold_value: Number(payload.minProjects),
      is_active: !!payload.minProjectsEnabled
    }));
  }

  if (reqs.min_hearts) {
    results.push(updateMentorRequirement(reqs.min_hearts.id, {
      threshold_value: Number(payload.minHearts),
      is_active: !!payload.minHeartsEnabled
    }));
  }

  if (reqs.min_account_age_days) {
    results.push(updateMentorRequirement(reqs.min_account_age_days.id, {
      threshold_value: Number(payload.minAccountAge),
      is_active: !!payload.minAccountAgeEnabled
    }));
  }

  if (reqs.min_comments) {
    results.push(updateMentorRequirement(reqs.min_comments.id, {
      threshold_value: Number(payload.minComments),
      is_active: !!payload.minCommentsEnabled
    }));
  }

  return Promise.all(results);
}

// ── DB optimization ──────────────────────────────────────────────────────────
export async function runOptimization(tables) {
  return unwrap(await adminApi.runOptimize({ tables }));
}

export async function getTables() {
  return unwrap(await adminApi.getTables());
}

// ── DB query runner — runs through the backend read-only guard ───────────────
export async function runQuery(sql) {
  if (!/^\s*select\b/i.test(sql.trim())) {
    throw new Error('Only SELECT statements are allowed.');
  }
  const response = unwrap(await adminApi.runQuery({ sql }));
  return response;
}

// ── Sent forms — real backend (admin_sent_forms table) ──────────────────────
export async function getSentForms(params = {}) {
  const response = unwrap(await adminApi.getSentForms(params));
  return response.data ?? [];
}

export async function getSentFormById(id) {
  const response = unwrap(await adminApi.getSentFormById(id));
  return response.data ?? null;
}

export async function getMailReplies(formId) {
  const response = unwrap(await adminApi.getFormReplies(formId));
  return response.data ?? [];
}
