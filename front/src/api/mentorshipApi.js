import api from './axiosInstance';

export const sendMentorshipRequest = (data) => api.post('/mentorships', data);

export const respondToMentorship = (id, data) => api.put(`/mentorships/${id}/respond`, data);

export const getMyMentorshipRequests = (params) => api.get('/mentorships/sent', { params });

export const getReceivedMentorshipRequests = (params) => api.get('/mentorships/received', { params });

export const getMentorshipRequestById = (id) => api.get(`/mentorships/${id}`);
