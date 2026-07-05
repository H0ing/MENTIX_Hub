import api from './axiosInstance';

export const submitReport = (data) => api.post('/reports', data);

export const getMyReports = (params) => api.get('/reports/my', { params });

export const getReportsOnMyProjects = (params) => api.get('/reports/on-my-projects', { params });

export const getReportById = (id) => api.get(`/reports/${id}`);

export const adminGetReports = (params) => api.get('/admin/reports', { params });
export const adminGetReportById = (id) => api.get(`/admin/reports/${id}`);
export const adminRespondToReport = (id, data) => api.post(`/admin/reports/${id}/respond`, data);
