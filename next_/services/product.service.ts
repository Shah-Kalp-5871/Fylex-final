import api from './api';

export const getProducts = () => api.get('/products');
export const getProductById = (id: string | number) => api.get(`/products/${id}`);
export const createProduct = (data: any) => api.post('/products', data);
export const updateProduct = (id: string | number, data: any) => api.put(`/products/${id}`, data);
export const deleteProduct = (id: string | number) => api.delete(`/products/${id}`);

const productService = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productService;

