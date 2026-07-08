import api from './axiosInstance';

export const triggerBackup           = (data) => api.post('/backups/trigger', data);
export const getBackupHistory        = (params) => api.get('/backups/history', { params });
export const getBackupById           = (id)   => api.get(`/backups/history/${id}`);
export const restoreBackup           = (id)   => api.post(`/backups/${id}/restore`);
export const deleteBackup            = (id)   => api.delete(`/backups/history/${id}`);
export const getRecoverableBackups   = (params) => api.get('/backups/recoverable', { params });

export const getSchedules            = ()     => api.get('/backups/schedules');
export const createSchedule          = (data) => api.post('/backups/schedules', data);
export const updateSchedule          = (id, data) => api.put(`/backups/schedules/${id}`, data);
export const deleteSchedule          = (id)   => api.delete(`/backups/schedules/${id}`);
