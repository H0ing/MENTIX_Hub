import api from './axiosInstance';

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post('/uploads/avatar', formData, {
    headers: { 'Content-Type': undefined },
  });
};
