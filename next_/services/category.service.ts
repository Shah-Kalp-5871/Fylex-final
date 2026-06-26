import api from './api';

export const getCategories = () => api.get('/categories');
export const getCategoryById = (id: string | number) => api.get(`/categories/${id}`);
export const createCategory = (data: any) => api.post('/categories', data);
export const updateCategory = (id: string | number, data: any) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id: string | number) => api.delete(`/categories/${id}`);

const categoryService = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
