import api from './axiosInstance';

// Dashboard
export const getDashboardStats = ()          => api.get('/admin/dashboard');
export const getSystemHealth   = ()          => api.get('/admin/health');

// Users (admin manages)
export const adminListUsers      = (params)  => api.get('/admin/users', { params });
export const adminGetUser        = (id)      => api.get(`/admin/users/${id}`);
export const adminChangeRole     = (id, data)=> api.put(`/admin/users/${id}/role`, data);
export const adminUpdateStatus   = (id, data)=> api.put(`/admin/users/${id}/status`, data);
export const adminDeleteUser     = (id)      => api.delete(`/admin/users/${id}`);

// Audit logs
export const getAuditLogs = (params) => api.get('/admin/audit-logs', { params });

// Database tables & optimization
export const getTables    = ()     => api.get('/admin/tables');
export const runOptimize  = (data) => api.post('/admin/optimize', data);

// Query tool
export const runQuery = (data) => api.post('/admin/query', data);
