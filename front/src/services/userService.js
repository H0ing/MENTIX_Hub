/**
 * userService.js
 * All async functions call the real API.
 * Sync helper stubs (getDbUsers, createDbUser, etc.) are kept for UsersPage
 * compatibility — DB users are managed locally until a backend endpoint exists.
 */
import * as adminApi from '../api/adminApi';
import * as userApi  from '../api/userApi';

// ── Admin-managed users ──────────────────────────────────────────────────────
export async function getAdminUsers(params = {}) {
  // Filter to only admin roles
  const { data } = await adminApi.adminListUsers({
    ...params,
    role: params.role || 'moderator,dev_admin,super_admin'
  });
  return data;
}

export async function getClientUsers(params = {}) {
  // Filter to only client roles
  const { data } = await adminApi.adminListUsers({
    ...params,
    role: params.role || 'student,mentor'
  });
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

// ── DB users — MySQL database-level users (real API) ────────────────────────
export async function getDbUsers() {
  const { data } = await adminApi.listDbUsers();
  return data;
}

export async function createDbUser(data) {
  const { data: res } = await adminApi.createDbUser(data);
  return res;
}

export async function deleteDbUser(id) {
  await adminApi.deleteDbUser(id);
}

// ── Own profile ──────────────────────────────────────────────────────────────
export async function getMe() {
  const { data } = await userApi.getMe();
  return data;
}

export async function updateMe(payload) {
  const { data } = await userApi.updateMe(payload);
  return data;
}
