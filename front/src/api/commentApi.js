import api from './axiosInstance';

export const getProjectComments = (projectId, params) => api.get(`/comments/project/${projectId}`, { params });
export const getCommentReplies = (commentId) => api.get(`/comments/${commentId}/replies`);
export const createComment = (data) => api.post('/comments', data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);
