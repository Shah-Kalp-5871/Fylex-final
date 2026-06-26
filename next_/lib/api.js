// lib/api.js
import { eventBus, EVENTS } from './events';

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

if (typeof window !== 'undefined') {
  try {
    const url = new URL(API_BASE_URL);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.hostname = window.location.hostname;
      API_BASE_URL = url.toString().replace(/\/$/, '');
    }
  } catch (e) {
    console.warn('Failed to parse API_BASE_URL', e);
  }
}


/**
 * Standardized request handler with strict error policy and auth handling.
 */
async function request(method, path, body = null, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Idempotency-Key': options.idempotencyKey || `idemp-${Date.now()}-${Math.random()}`,
    ...options.headers,
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fylexx_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const fetchOptions = {
      method,
      headers,
    };
    if (body && method !== 'GET') fetchOptions.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);
    
    const isAuthPath = path.includes('/auth/login') || path.includes('/auth/register');
    
    if (response.status === 401 && !isAuthPath) {
        eventBus.emit(EVENTS.AUTH_EXPIRED);
        return { success: false, data: null, error: 'Session expired. Please login again.' };
    }

    const result = await response.json();
    
    // Response Standardization
    if (!response.ok) {
        return {
            success: false,
            data: null,
            error: result.message || result.error || `API Error: ${response.statusText}`
        };
    }

    // Interceptor in backend already wraps in { success, data, error }
    // but we ensure we return exactly that structure
    return {
        success: result.success ?? true,
        data: result.data ?? result,
        error: result.error ?? null
    };
  } catch (error) {
    console.error(`API ${method} ${path} failed:`, error);
    return {
        success: false,
        data: null,
        error: error.message || 'Network connectivity issue'
    };
  }
}

// Products API
export const fetchProducts = () => request('GET', '/products?status=active');
export const fetchFeaturedProducts = () => request('GET', '/products/featured');

// Cart API
export const fetchCart = (userId) => request('GET', userId ? `/cart?userId=${userId}` : '/cart');

export const addToCartApi = (userId, variantId, quantity = 1) => {
  if (!variantId) throw new Error("CRITICAL: variantId is mandatory for cart operations");
  return request('POST', '/cart/items', { userId, variantId, quantity });
};

export const removeFromCartApi = (userId, id) => request('DELETE', `/cart/items/${id}`, { userId });

export const updateCartQtyApi = (userId, id, quantity) => request('PATCH', `/cart/items/${id}`, { userId, quantity });

// Wishlist API
export const fetchWishlist = (userId) => request('GET', userId ? `/wishlist?customerId=${userId}` : '/wishlist');

export const toggleWishlistApi = (userId, product) => {
  const variantId = product.variantId || product.currentVariantId;
  if (!variantId) throw new Error("CRITICAL: variantId is mandatory for wishlist operations");
  
  // Strip non-essential data, keep config query
  return request('POST', `/wishlist/${variantId}`, { 
    customerId: userId,
    configQuery: product.configQuery || ''
  });
};

// Orders API
export const fetchOrders = (userId) => request('GET', userId ? `/orders?customerId=${userId}` : '/orders');

export const calculateTotalApi = (userId, pincode, couponCode) => {
    return request('POST', '/orders/calculate-total', { customerId: userId, pincode, couponCode });
};

export const createOrderApi = (orderData) => {
  // SECURITY: Delete any total/price fields sent from frontend
  const securedData = { ...orderData };
  delete securedData.total;
  delete securedData.subtotal;
  delete securedData.shipping;
  delete securedData.discount;
  
  return request('POST', '/orders', securedData);
};

export const calculateShippingApi = (customerId, pincode) => {
    return request('POST', '/orders/calculate-shipping', { customerId, pincode });
};

export const deleteOrderApi = (id) => request('DELETE', `/orders/${id}`);

// Payment API
export const initiatePaymentApi = (userId, pincode, receipt, couponCode) => {
    // SECURITY: Amount is NOT sent to server, server calculates it
    return request('POST', '/payments/create-order', { customerId: userId, pincode, receipt, couponCode });
};
export const verifyPaymentApi = (paymentData) => request('POST', '/payments/verify', paymentData);

// Address API
export const addAddressApi = (userId, addressData) => request('POST', `/customers/${userId}/addresses`, addressData);
export const fetchAddressesApi = (userId) => request('GET', `/customers/${userId}/addresses`);
export const fetchProfileDashboardApi = () => request('GET', '/customers/me/dashboard');
export const updateMyProfileApi = (payload) => request('PUT', '/customers/me', payload);

export const checkMobileApi = (payload) => request('POST', '/auth/check-mobile', payload);
export const signupApi = (userData) => request('POST', '/auth/register', userData);
export const loginApi = (credentials) => request('POST', '/auth/login', credentials);
export const loginOtpApi = (payload) => request('POST', '/auth/login-otp', payload);
export const fetchCurrentUserApi = () => request('GET', '/auth/me');
export const forgotPasswordApi = (payload) => request('POST', '/auth/forgot-password', payload);
export const resetPasswordApi = (payload) => request('POST', '/auth/reset-password', payload);

// FAQs & Care Steps
export const fetchActiveFaqs = () => request('GET', '/faq/active');
export const fetchProductCareStepsGrouped = () => request('GET', '/product-care/grouped');


export const fetchPolicies = () => request('GET', '/policies');
export const fetchPolicy = (id) => request('GET', `/policies/${id}`);
export const createPolicy = (data) => request('POST', '/policies', data);
export const updatePolicy = (id, data) => request('PUT', `/policies/${id}`, data);
export const deletePolicy = (id) => request('DELETE', `/policies/${id}`);

export const fetchSettings = () => request('GET', '/system/settings');

