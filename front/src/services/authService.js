/**
 * authService.js
 *
 * Reads the currently logged-in admin from localStorage (set by AuthContext on login).
 * Components that need reactive updates should use useAuth() directly.
 * This file is for non-hook contexts (services, sidebar, topbar snapshot).
 */

const STORAGE_KEY = 'adminUser';

function _getUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function _initials(name) {
  if (!name) return '??';
  return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

export function getCurrentAdmin() {
  const u = _getUser();
  if (!u) {
    // Fallback shape so components never crash before login redirects
    return { id: null, name: 'Admin', email: '', role: 'moderator', initials: 'AD' };
  }
  return {
    id:       u.id,
    name:     u.full_name || u.username,
    email:    u.email,
    role:     u.role,
    initials: _initials(u.full_name || u.username),
    avatar:   u.avatar_url || null,
  };
}

export function isAuthenticated() {
  return !!localStorage.getItem('accessToken') && !!_getUser();
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = '/admin/login';
}

// ─── Role permission map ─────────────────────────────────────────────────────
//
// Sidebar pages — which roles can access each route
const PERMISSIONS = {
  moderation:    ['super_admin', 'moderator'],
  users:         ['super_admin'],
  backup:        ['super_admin', 'dev_admin'],
  database:      ['super_admin', 'dev_admin'],
  'audit-logs':  ['super_admin', 'moderator', 'dev_admin'],
  settings:      ['super_admin'],
  'sent-forms':  ['super_admin', 'moderator'],

  // UsersPage tabs
  tab_admins:    ['super_admin'],
  tab_clients:   ['super_admin', 'moderator'],
  tab_dbusers:   ['super_admin', 'dev_admin'],

  // MailDetailPanel tab
  tab_allmail:   ['super_admin', 'moderator'],
};

export function can(feature) {
  const allowed = PERMISSIONS[feature];
  if (!allowed) return true;
  const user = _getUser();
  if (!user) return false;
  return allowed.includes(user.role);
}
