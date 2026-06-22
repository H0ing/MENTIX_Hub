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
    minComments: reqs.min_comments?.threshold_value ?? 0,
    minCommentsEnabled: reqs.min_comments?.is_active ?? true
  };
}

export async function updateMentorRequirement(id, payload) {
  return unwrap(await promotionApi.adminUpdateRequirement(id, payload));
}

// SettingsPage calls this — alias for updateMentorRequirement bulk save
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

// ── Sent forms — still mock (admin_sent_forms table exists from schema_v2) ───
import {
  sentForms     as sentFormsSeed,
  mailReplies   as mailRepliesSeed,
} from '../data/mock/settings.js';

const _sentForms = sentFormsSeed.map(f => ({ ...f, timeline: [...f.timeline] }));

export function getSentForms()        { return [..._sentForms]; }
export function getSentFormById(id)   { return _sentForms.find(f => f.id === id) ?? null; }
export function getMailReplies(formId){ return mailRepliesSeed[formId] ?? []; }
