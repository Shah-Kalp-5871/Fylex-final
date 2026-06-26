import api from './api';

export const getDashboardStats = () => api.get('/system/dashboard/stats');
export const getLowStock = () => api.get('/system/inventory/low-stock');
export const getSystemSettings = () => api.get('/system/settings');
export const updateSettings = (data: any) => api.post('/system/settings', data);

// Taxes
export const getTaxes = () => api.get('/system/taxes');
export const createTaxRate = (data: any) => api.post('/system/taxes', data);
export const updateTaxRate = (id: number | string, data: any) => api.put(`/system/taxes/${id}`, data);
export const deleteTaxRate = (id: number | string) => api.delete(`/system/taxes/${id}`);

const systemService = {
  getDashboardStats,
  getLowStock,
  getSystemSettings,
  updateSettings,
  getTaxes,
  createTaxRate,
  updateTaxRate,
  deleteTaxRate,
};

export default systemService;
