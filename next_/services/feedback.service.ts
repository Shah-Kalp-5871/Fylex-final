import api from './api';

export const getReviews = () => api.get('/reviews');
export const createReview = (data: any) => api.post('/reviews', data);
export const updateReview = (id: string | number, data: any) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id: string | number) => api.delete(`/reviews/${id}`);

const feedbackService = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
};

export default feedbackService;
