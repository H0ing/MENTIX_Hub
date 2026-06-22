/**
 * userService.js
 * All async functions call the real API.
 * Sync helper stubs (getDbUsers, createDbUser, etc.) are kept for UsersPage
 * compatibility — DB users are managed locally until a backend endpoint exists.
 */
import * as adminApi from '../api/adminApi';
import * as userApi  from '../api/userApi';
import { dbUsers as dbSeed } from '../data/mock/users.js';

// ── Admin-managed users ──────────────────────────────────────────────────────
export async function getAdminUsers(params = {}) {
  const { data } = await adminApi.adminListUsers({ ...params });
  return data;
}

export async function getClientUsers(params = {}) {
  const { data } = await adminApi.adminListUsers(params);
  return data;
}

export async function getUserDetails(id) {
  const { data } = await adminApi.adminGetUser(id);
  return data;
}

export async function changeUserRole(id, role) {
  const { data } = await adminApi.adminChangeRole(id, { role });
  return data;
}

// Alias used by UsersPage for admin role edits
export async function updateAdminRole(id, role) {
  return changeUserRole(id, role);
}

export async function updateUserStatus(id, status) {
  const { data } = await adminApi.adminUpdateStatus(id, { status });
  return data;
}

export async function deleteUser(id) {
  const { data } = await adminApi.adminDeleteUser(id);
  return data;
}

// Aliases used by UsersPage
export async function deleteAdminUser(id)  { return deleteUser(id); }
export async function deleteClientUser(id) { return deleteUser(id); }

export async function createAdminUser(data) {
  // Not yet a real API endpoint — reflect locally only
  return { success: true, data };
}

export async function createClientUser(data) {
  return { success: true, data };
}

export async function toggleSuspend(id, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
  return updateUserStatus(id, newStatus);
}

// ── DB users — local mock until a backend endpoint exists ───────────────────
let _dbUsers  = dbSeed.map(u => ({ ...u }));
let _nextDbId = _dbUsers.length + 1;

export function getDbUsers()       { return [..._dbUsers]; }
export function createDbUser(data) { const u = { id: _nextDbId++, ...data }; _dbUsers.unshift(u); return u; }
export function deleteDbUser(id)   { _dbUsers = _dbUsers.filter(x => x.id !== id); }

// ── Own profile ──────────────────────────────────────────────────────────────
export async function getMe() {
  const { data } = await userApi.getMe();
  return data;
}

export async function updateMe(payload) {
  const { data } = await userApi.updateMe(payload);
  return data;
}
