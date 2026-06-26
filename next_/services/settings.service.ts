import api from './api';
export const getSettings = () => api.get('/system/settings');
export const updateSettings = (data: any) => api.post('/system/settings', data);

const settingsService = {
  getSettings,
  updateSettings,
};

export default settingsService;
