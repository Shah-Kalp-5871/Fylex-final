import api from './api';

export const getBanners = (position?: string) => api.get(`/cms/banners${position ? `?position=${position}` : ''}`);
export const getActivePopups = () => api.get('/cms/popups');
export const getPage = (slug: string) => api.get(`/cms/pages/${slug}`);
export const getVideoSettings = () => api.get('/system/settings');

// Pages
export const getPages = () => api.get('/cms/pages');
export const createPage = (data: any) => api.post('/cms/pages', data);
export const updatePage = (id: number | string, data: any) => api.put(`/cms/pages/${id}`, data);
export const deletePage = (id: number | string) => api.delete(`/cms/pages/${id}`);

// Banners
export const getAllBanners = () => api.get('/cms/all-banners');
export const createBanner = (data: any) => api.post('/cms/banners', data);
export const updateBanner = (id: number | string, data: any) => api.put(`/cms/banners/${id}`, data);
export const deleteBanner = (id: number | string) => api.delete(`/cms/banners/${id}`);

// Testimonials
export const getTestimonials = () => api.get('/cms/testimonials');
export const createTestimonial = (data: any) => api.post('/cms/testimonials', data);
export const updateTestimonial = (id: number | string, data: any) => api.put(`/cms/testimonials/${id}`, data);
export const deleteTestimonial = (id: number | string) => api.delete(`/cms/testimonials/${id}`);

// Home Sections
export const getHomeSections = () => api.get('/cms/home-sections');

// Community Images (Atelier Chronicles)
export const getCommunityImages = () => api.get('/cms/community-images');

const cmsService = {
  getBanners,
  getActivePopups,
  getPage,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getVideoSettings,
  getHomeSections,
  getCommunityImages
};

export default cmsService;
