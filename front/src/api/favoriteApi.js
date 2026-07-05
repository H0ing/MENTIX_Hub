import api from './axiosInstance';

export const addFavorite = (projectId) => api.post(`/favorites/${projectId}`);
export const removeFavorite = (projectId) => api.delete(`/favorites/${projectId}`);
export const getFavorites = (params) => api.get('/favorites', { params });
export const checkFavorite = (projectId) => api.get(`/favorites/${projectId}/check`);
