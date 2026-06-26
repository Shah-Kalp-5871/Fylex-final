/**
 * Fylex Admin — Centralized API Service
 * All API calls go through here. Never call fetch/axios directly in pages.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Core request handler with unified error handling.
 * Always returns { data, error } — never throws.
 */
async function request(method, path, body = null) {
  try {
    const isFormData = body instanceof FormData;
    const options = {
      method,
      headers: {},
    };

    if (!isFormData) {
      options.headers['Content-Type'] = 'application/json';
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      if (token) options.headers.Authorization = `Bearer ${token}`;
    }

    if (body && method !== 'GET') {
      options.body = isFormData ? body : JSON.stringify(body);
    }
    const res = await fetch(`${BASE_URL}${path}`, options);
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || `Request failed with status ${res.status}`;
      return { data: null, error: msg, success: false };
    }

    // Standardize: if backend returns { success, data, error }
    if (data && typeof data === 'object' && 'success' in data) {
      return {
        data: data.data || null,
        error: data.error || data.message || null,
        success: data.success,
      };
    }

    return { 
      data: (data && typeof data === 'object' && 'data' in data) ? data.data : data, 
      error: null, 
      success: true 
    };
  } catch (err) {
    const msg = (err.name === 'TypeError' && err.message.includes('fetch'))
      ? 'Cannot connect to server. Make sure the backend is running.'
      : (err.message || 'An unexpected error occurred');
    return { data: null, error: msg, success: false };
  }
}

const get = (path) => request('GET', path);
const post = (path, body) => request('POST', path, body);
const put = (path, body) => request('PUT', path, body);
const del = (path) => request('DELETE', path);

// ─── Authentication ───────────────────────────────────────────
export const adminLogin = (credentials) => post('/auth/admin/login', credentials);
export const adminLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('fylexx_user');
  }
};

// ─── Dashboard ────────────────────────────────────────────────
export const getDashboard = () => get('/dashboard');

// ─── Reports ────────────────────────────────────────────────────
export const getDashboardReports = () => get('/reports/dashboard');
export const getVariantPerformanceReport = () => get('/reports/variant-performance');
export const getRevenueReport = () => get('/reports/revenue');
export const getOrdersReport = () => get('/reports/orders');
export const getInventoryReport = () => get('/reports/inventory');
export const getFinancialReport = () => get('/reports/financial');
export const getTrafficReport = () => get('/reports/traffic');

// ─── Products ─────────────────────────────────────────────────
export const getProducts = () => get('/products');
export const getProduct = (id) => get(`/products/${id}`);
export const createProduct = (data) => post('/products', data);
export const updateProduct = (id, data) => put(`/products/${id}`, data);
export const deleteProduct = (id) => del(`/products/${id}`);

export const getAllVariants = (page=1, limit=50) => get(`/variants?page=${page}&limit=${limit}`);
export const generateVariants = (productId, selections) => post(`/products/${productId}/generate-variants`, { selections });
export const getProductVariants = (productId) => get(`/products/${productId}/variants`);
export const upload360Media = (productId, formData) => post(`/products/${productId}/media/360`, formData);
export const getInventory = () => get('/products/inventory');
export const updateInventory = (id, data) => request('PATCH', `/products/inventory/${id}`, data);

// ─── Variants ─────────────────────────────────────────────────
export const updateVariant = (id, data) => request('PATCH', `/variants/${id}`, data);
export const uploadVariantMedia = (id, formData) => post(`/variants/${id}/media`, formData);

// ─── Categories ───────────────────────────────────────────────
export const getCategories = () => get('/categories');
export const getCategory = (id) => get(`/categories/${id}`);
export const createCategory = (data) => post('/categories', data);
export const updateCategory = (id, data) => put(`/categories/${id}`, data);
export const deleteCategory = (id) => del(`/categories/${id}`);


// ─── Orders ───────────────────────────────────────────────────
export const getOrders = () => get('/orders');
export const getOrder = (id) => get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => put(`/orders/${id}/status`, { status });
export const updateOrderPaymentStatus = (id, payment_status) => put(`/orders/${id}/payment-status`, { payment_status });

// ─── Customers / Users ────────────────────────────────────────
export const getUsers = () => get('/users');
export const getUser = (id) => get(`/users/${id}`);
export const updateUser = (id, data) => put(`/users/${id}`, data);
export const deleteUser = (id) => del(`/users/${id}`);

// ─── Offers ───────────────────────────────────────────────────
export const getOffers = () => get('/marketing/offers');
export const getOfferAnalytics = () => get('/marketing/offers/analytics');
export const createOffer = (data) => post('/marketing/offers', data);
export const updateOffer = (id, data) => put(`/marketing/offers/${id}`, data);
export const deleteOffer = (id) => del(`/marketing/offers/${id}`);

// ─── Reviews ──────────────────────────────────────────────────
export const getReviews = () => get('/reviews');
export const updateReviewStatus = (id, status) => request('PATCH', `/reviews/${id}/status`, { status });
export const deleteReview = (id) => del(`/reviews/${id}`);

// ─── Settings ─────────────────────────────────────────────────
export const getSettings = () => get('/system/settings');
export const saveSettings = (data) => post('/system/settings', data);

// ─── Tags ─────────────────────────────────────────────────────
export const getTags = () => get('/tags');
export const createTag = (data) => post('/tags', data);
export const updateTag = (id, data) => put(`/tags/${id}`, data);
export const deleteTag = (id) => del(`/tags/${id}`);

// ─── Product Attributes ────────────────────────────────────────
export const getAttributes = () => get('/attributes');
export const createAttribute = (data) => post('/attributes', data);
export const updateAttribute = (id, data) => put(`/attributes/${id}`, data);
export const deleteAttribute = (id) => del(`/attributes/${id}`);
export const createAttributeValue = (attrId, data) => post(`/attributes/${attrId}/values`, data);
export const updateAttributeValue = (id, data) => put(`/attributes/values/${id}`, data);
export const deleteAttributeValue = (valueId) => del(`/attributes/values/${valueId}`);

// ─── Specifications ───────────────────────────────────────────
export const getSpecifications = () => get('/specifications');
export const createSpecification = (data) => post('/specifications', data);
export const updateSpecification = (id, data) => put(`/specifications/${id}`, data);
export const deleteSpecification = (id) => del(`/specifications/${id}`);

export const getSpecificationGroups = () => get('/specifications/groups');
export const createSpecificationGroup = (data) => post('/specifications/groups', data);
export const updateSpecificationGroup = (id, data) => put(`/specifications/groups/${id}`, data);
export const deleteSpecificationGroup = (id) => del(`/specifications/groups/${id}`);

export const getSpecificationValues = (specId) => get(`/specifications/${specId}/values`);
export const createSpecificationValue = (specId, data) => post(`/specifications/${specId}/values`, data);
export const updateSpecificationValue = (id, data) => put(`/specifications/values/${id}`, data);
export const deleteSpecificationValue = (id) => del(`/specifications/values/${id}`);

// ─── Taxes ────────────────────────────────────────────────────
export const getTaxes = () => get('/system/taxes');
export const createTaxRate = (data) => post('/system/taxes', data);
export const updateTaxRate = (id, data) => put(`/system/taxes/${id}`, data);
export const deleteTaxRate = (id) => del(`/system/taxes/${id}`);

export const getTaxClasses = () => get('/system/taxes/classes');
export const createTaxClass = (data) => post('/system/taxes/classes', data);
export const updateTaxClass = (id, data) => put(`/system/taxes/classes/${id}`, data);
export const deleteTaxClass = (id) => del(`/system/taxes/classes/${id}`);


// ─── Shipping Methods ──────────────────────────────────────────
export const getShippingMethods = () => get('/system/shipping-methods');
export const createShippingMethod = (data) => post('/system/shipping-methods', data);
export const updateShippingMethod = (id, data) => put(`/system/shipping-methods/${id}`, data);
export const deleteShippingMethod = (id) => del(`/system/shipping-methods/${id}`);

// ─── Media ────────────────────────────────────────────────────
export const getMedia = () => get('/media');
export const uploadMedia = (formData) => post('/media/upload', formData);
export const deleteMedia = (id) => del(`/media/${id}`);

// ─── CMS (Pages, Banners, Sliders, Testimonials) ─────────────
export const getPages = () => get('/cms/pages');
export const createPage = (data) => post('/cms/pages', data);
export const updatePage = (id, data) => put(`/cms/pages/${id}`, data);
export const deletePage = (id) => del(`/cms/pages/${id}`);

export const getBanners = () => get('/cms/all-banners');
export const createBanner = (data) => post('/cms/banners', data);
export const updateBanner = (id, data) => put(`/cms/banners/${id}`, data);
export const deleteBanner = (id) => del(`/cms/banners/${id}`);

export const getTestimonials = () => get('/cms/testimonials');
export const createTestimonial = (data) => post('/cms/testimonials', data);
export const updateTestimonial = (id, data) => put(`/cms/testimonials/${id}`, data);
export const deleteTestimonial = (id) => del(`/cms/testimonials/${id}`);

export const getHomeSections = () => get('/cms/home-sections');
export const createHomeSection = (data) => post('/cms/home-sections', data);
export const updateHomeSection = (id, data) => put(`/cms/home-sections/${id}`, data);
export const deleteHomeSection = (id) => del(`/cms/home-sections/${id}`);

// ─── Community Images (Atelier Chronicles) ────────────────────
export const getCommunityImages = () => get('/cms/community-images/all');
export const createCommunityImage = (data) => post('/cms/community-images', data);
export const updateCommunityImage = (id, data) => put(`/cms/community-images/${id}`, data);
export const deleteCommunityImage = (id) => del(`/cms/community-images/${id}`);

// ─── FAQs ──────────────────────────────────────────────────────
export const getFaqs = () => get('/faq');
export const createFaq = (data) => post('/faq', data);
export const updateFaq = (id, data) => put(`/faq/${id}`, data);
export const deleteFaq = (id) => del(`/faq/${id}`);

// ─── Product Care Steps ────────────────────────────────────────
export const getProductCareStepsGrouped = () => get('/product-care/grouped');
export const getProductCareSteps = (productId) => get(`/product-care/product/${productId}`);
export const createProductCareStep = (data) => post('/product-care', data);
export const updateProductCareStep = (id, data) => put(`/product-care/${id}`, data);
export const deleteProductCareStep = (id) => del(`/product-care/${id}`);


export const getPolicies = () => request('/policies');
export const createPolicy = (data) => request('/policies', { method: 'POST', body: JSON.stringify(data) });
export const updatePolicy = (id, data) => request(/policies/, { method: 'PUT', body: JSON.stringify(data) });
export const deletePolicy = (id) => request(/policies/, { method: 'DELETE' });
