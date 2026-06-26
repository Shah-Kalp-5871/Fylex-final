import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Custom Response Type to handle API consistency
 */
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
  meta?: any;
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available (future proofing)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Extract data based on common NestJS/Laravel wrappers found in reference
    const rawData = response.data;
    
    // Standardize structure: { success, data, error, meta }
    let standardized;
    if (rawData && typeof rawData === 'object' && 'success' in rawData) {
      standardized = {
        data: rawData.data?.data || rawData.data || null,
        meta: rawData.data?.meta || rawData.meta || null,
        success: rawData.success,
        error: rawData.message || rawData.error || null,
      };
    } else {
      const finalData = (rawData && typeof rawData === 'object' && 'data' in rawData) 
        ? rawData.data 
        : rawData;
      const finalMeta = (rawData && typeof rawData === 'object' && 'meta' in rawData)
        ? rawData.meta
        : null;

      standardized = {
        data: finalData,
        meta: finalMeta,
        success: true,
        error: null,
      };
    }

    // IMPORTANT: Return standardized data directly to allow 
    // const { success, error } = await api.call()
    return standardized as any;
  },
  (error: AxiosError) => {
    let errorMessage = 'Something went wrong. Please try again.';
    
    if (error.response) {
      // Backend returned an error response
      const data = error.response.data as any;
      errorMessage = data?.message || data?.error || `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // Network error (no response received)
      errorMessage = 'Cannot connect to server. Make sure the backend is running.';
    } else {
      errorMessage = error.message;
    }

    return {
      data: null,
      success: false,
      error: errorMessage,
    } as any;
  }
);

export default api;
