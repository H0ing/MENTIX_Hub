import api from './axiosInstance';

// User-facing
export const submitReport  = (data)   => api.post('/reports', data);
export const getMyReports  = (params) => api.get('/reports/my', { params });

// Admin-facing
export const adminGetReports       = (params) => api.get('/admin/reports', { params });
export const adminGetReportById    = (id)     => api.get(`/admin/reports/${id}`);
export const adminAssignReport     = (id)     => api.put(`/admin/reports/${id}/assign`);
export const adminUpdateReportStatus = (id, data) => api.put(`/admin/reports/${id}/status`, data);
export const adminRespondToReport  = (id, data)   => api.post(`/admin/reports/${id}/respond`, data);
