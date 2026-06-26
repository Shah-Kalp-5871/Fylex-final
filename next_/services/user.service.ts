import api from './api';

export const getUsers = (params?: any) => api.get('/users', { params });
export const getUserById = (id: string | number) => api.get(`/users/${id}`);
export const updateUser = (id: string | number, data: any) => api.put(`/users/${id}`, data);

const userService = {
  getUsers,
  getUserById,
  updateUser,
};

export default userService;
