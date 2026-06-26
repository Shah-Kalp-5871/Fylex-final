import api from './api';

export const getMedia = () => api.get('/media');
export const uploadMedia = (data: any) => api.post('/media', data);
export const updateMedia = (id: string | number, data: any) => api.patch(`/media/${id}`, data);
export const deleteMedia = (id: string | number) => api.delete(`/media/${id}`);

const mediaService = {
  getMedia,
  uploadMedia,
  updateMedia,
  deleteMedia,
};

export default mediaService;
