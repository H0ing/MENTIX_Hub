import api from './axiosInstance';

export const getMe      = ()      => api.get('/users/me');
export const updateMe   = (data)  => api.put('/users/me', data);
export const getUserById = (id)   => api.get(`/users/${id}`);
export const getAllUsers = (params)=> api.get('/users', { params });
export const deleteUser  = (id)   => api.delete(`/users/${id}`);
