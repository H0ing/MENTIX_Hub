import api from './axiosInstance';

export const getMyNotifications = () => api.get('/notifications');
