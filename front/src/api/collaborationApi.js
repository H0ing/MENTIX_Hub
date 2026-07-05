import api from './axiosInstance';

export const sendCollaborationRequest = (data) => api.post('/collaborations', data);

export const respondToCollaboration = (id, data) => api.put(`/collaborations/${id}/respond`, data);

export const getMyCollaborationRequests = (params) => api.get('/collaborations/sent', { params });

export const getReceivedCollaborationRequests = (params) => api.get('/collaborations/received', { params });

export const getCollaborationRequestById = (id) => api.get(`/collaborations/${id}`);

export const cancelCollaborationRequest = (id) => api.delete(`/collaborations/${id}`);
