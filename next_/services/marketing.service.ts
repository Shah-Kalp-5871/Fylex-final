import api from './api';

export const getOffers = () => api.get('/marketing/offers');
export const createOffer = (data: any) => api.post('/marketing/offers', data);
export const updateOffer = (id: string | number, data: any) => api.put(`/marketing/offers/${id}`, data);
export const deleteOffer = (id: string | number) => api.delete(`/marketing/offers/${id}`);

export const getBanners = () => api.get('/cms/banners');
export const createBanner = (data: any) => api.post('/cms/banners', data);
export const updateBanner = (id: string | number, data: any) => api.put(`/cms/banners/${id}`, data);
export const deleteBanner = (id: string | number) => api.delete(`/cms/banners/${id}`);

export const getHomeSections = () => api.get('/cms/home-sections');
export const createHomeSection = (data: any) => api.post('/cms/home-sections', data);
export const updateHomeSection = (id: string | number, data: any) => api.put(`/cms/home-sections/${id}`, data);
export const deleteHomeSection = (id: string | number) => api.delete(`/cms/home-sections/${id}`);

const marketingService = {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getHomeSections,
  createHomeSection,
  updateHomeSection,
  deleteHomeSection,
};

export default marketingService;
