import api from './api';

export const getDashboard = () => api.get('/dashboard');

const dashboardService = {
  getDashboard,
};

export default dashboardService;
