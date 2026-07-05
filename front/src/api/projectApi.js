import api from './axiosInstance';

export const getProjects = (params) => api.get('/projects', { params });
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const toggleHeart = (id) => api.post(`/projects/${id}/heart`);
export const getHeartedProjects = (params) => api.get('/projects/hearted/me', { params });

export const uploadProjectThumbnail = (projectId, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post(`/projects/${projectId}/upload-thumbnail`, formData, {
    headers: { 'Content-Type': undefined },
  });
};

export const uploadProjectFile = (projectId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/projects/${projectId}/upload-file`, formData, {
    headers: { 'Content-Type': undefined },
  });
};

export const downloadProjectFile = async (projectId, fileName) => {
  const response = await api.get(`/downloads/projects/${projectId}/file`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName || 'project.zip');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
