import api from './axiosInstance';

export const triggerBackup   = ()     => api.post('/backups/trigger');
export const getBackupHistory = (params) => api.get('/backups/history', { params });
export const getBackupById   = (id)   => api.get(`/backups/history/${id}`);
export const restoreBackup   = (id)   => api.post(`/backups/${id}/restore`);
export const deleteBackup    = (id)   => api.delete(`/backups/history/${id}`);
export const getSchedule     = ()     => api.get('/backups/schedule');
export const updateSchedule  = (data) => api.put('/backups/schedule', data);
