import api from './axiosInstance';

// User-facing
export const requestPromotion   = ()      => api.post('/promotions/request');
export const getMyPromotions    = ()      => api.get('/promotions/my');
export const checkEligibility   = ()      => api.get('/promotions/check-eligibility');

// Admin-facing
export const adminGetQueue         = (params) => api.get('/admin/promotions/queue', { params });
export const adminReviewPromotion  = (id, data) => api.put(`/admin/promotions/${id}/review`, data);
export const adminGetRequirements  = ()       => api.get('/admin/promotions/requirements');
export const adminUpdateRequirement = (id, data) => api.put(`/admin/promotions/requirements/${id}`, data);
