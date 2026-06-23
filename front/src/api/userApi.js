import api from './axiosInstance';

// Own profile — matches backend GET/PUT /users/profile
export const getMe       = ()      => api.get('/users/profile');
export const updateMe    = (data)  => api.put('/users/profile', data);

// Public profile by id — matches backend GET /users/:id
export const getUserById = (id)    => api.get(`/users/${id}`);

// User's projects — matches backend GET /users/:id/projects
export const getUserProjects = (id, params) => api.get(`/users/${id}/projects`, { params });
