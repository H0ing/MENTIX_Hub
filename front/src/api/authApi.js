import api from './axiosInstance';

export const login          = (data) => api.post('/login', data);
export const register       = (data) => api.post('/register', data);
export const logout         = (data) => api.post('/logout', data);
export const verifyEmail    = (data) => api.post('/verify-email', data);
export const refreshToken   = (data) => api.post('/refresh-token', data);
export const forgotPassword = (data) => api.post('/forgot-password', data);
export const resetPassword  = (data) => api.post('/reset-password', data);
export const resendOTP      = (data) => api.post('/resend-otp', data);
