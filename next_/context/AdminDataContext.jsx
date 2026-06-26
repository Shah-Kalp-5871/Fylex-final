"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import * as api from '@/services/adminApi';

const AdminDataContext = createContext();
export const useAdminData = () => useContext(AdminDataContext);

/**
 * AdminDataProvider
 *
 * Fetches all admin data from the NestJS backend on mount.
 * Falls back gracefully — if an endpoint fails, that entity gets an empty array
 * and an error state is set so pages can show a proper message.
 *
 * Pages use: const { data, loading, errors, addRecord, updateRecord, deleteRecord } = useAdminData();
 */
export const AdminDataProvider = ({ children }) => {
  const toast = useToast();

  // Per-entity state
  const [data, setData] = useState({
    products: [],
    categories: [],

    orders: [],
    users: [],
    offers: [],
    reviews: [],
    taxes: [],
    taxClasses: [],
    tags: [],
    attributes: [],
    specifications: [],
    specificationGroups: [],
    media: [],
    pages: [],
    banners: [],
    testimonials: [],
    homeSections: [],
    settings: null,
    inventory: [],
    shippingMethods: [],
    faqs: [],
    productCareSteps: [],
  });

  const [loading, setLoading] = useState({
    products: true,
    categories: true,

    orders: true,
    users: true,
    offers: true,
    reviews: true,
    taxes: true,
    taxClasses: true,
    tags: true,
    attributes: true,
    specifications: true,
    specificationGroups: true,
    media: true,
    pages: true,
    banners: true,
    testimonials: true,
    homeSections: true,
    settings: true,
    inventory: true,
    shippingMethods: true,
    faqs: true,
    productCareSteps: true,
  });

  const [errors, setErrors] = useState({});

  // ─── Fetch helpers ──────────────────────────────────────────
  const fetchEntity = useCallback(async (entity, apiFn) => {
    setLoading(prev => ({ ...prev, [entity]: true }));
    setErrors(prev => ({ ...prev, [entity]: null }));

    const { data: result, error } = await apiFn();

    if (error) {
      setErrors(prev => ({ ...prev, [entity]: error }));
      setData(prev => ({ ...prev, [entity]: [] }));
    } else {
      // Normalize: some APIs may return { data: [...] } or directly [...]
      const list = Array.isArray(result)
        ? result
        : (result?.data ?? result?.items ?? result ?? []);
      setData(prev => ({ ...prev, [entity]: list }));
    }

    setLoading(prev => ({ ...prev, [entity]: false }));
  }, []);

  // ─── Initial data load ──────────────────────────────────────
  useEffect(() => {
    fetchEntity('products', api.getProducts);
    fetchEntity('categories', api.getCategories);

    fetchEntity('orders', api.getOrders);
    fetchEntity('users', api.getUsers);
    fetchEntity('offers', api.getOffers);
    fetchEntity('reviews', api.getReviews);
    fetchEntity('tags', api.getTags);
    fetchEntity('attributes', api.getAttributes);
    fetchEntity('specifications', api.getSpecifications);
    fetchEntity('specificationGroups', api.getSpecificationGroups);
    fetchEntity('taxes', api.getTaxes);
    fetchEntity('taxClasses', api.getTaxClasses);
    fetchEntity('media', api.getMedia);
    fetchEntity('pages', api.getPages);
    fetchEntity('banners', api.getBanners);
    fetchEntity('testimonials', api.getTestimonials);
    fetchEntity('homeSections', api.getHomeSections);
    fetchEntity('settings', api.getSettings);
    fetchEntity('inventory', api.getInventory);
    fetchEntity('shippingMethods', api.getShippingMethods);
    fetchEntity('faqs', api.getFaqs);
    fetchEntity('productCareSteps', api.getProductCareStepsGrouped);
  }, [fetchEntity]);

  // ─── Memoized API Actions ──────────────────────────────────
  const memoizedRefetch = React.useMemo(() => ({
    products: () => fetchEntity('products', api.getProducts),
    categories: () => fetchEntity('categories', api.getCategories),

    orders: () => fetchEntity('orders', api.getOrders),
    users: () => fetchEntity('users', api.getUsers),
    offers: () => fetchEntity('offers', api.getOffers),
    reviews: () => fetchEntity('reviews', api.getReviews),
    tags: () => fetchEntity('tags', api.getTags),
    attributes: () => fetchEntity('attributes', api.getAttributes),
    specifications: () => fetchEntity('specifications', api.getSpecifications),
    specificationGroups: () => fetchEntity('specificationGroups', api.getSpecificationGroups),
    taxes: () => fetchEntity('taxes', api.getTaxes),
    taxClasses: () => fetchEntity('taxClasses', api.getTaxClasses),
    media: () => fetchEntity('media', api.getMedia),
    pages: () => fetchEntity('pages', api.getPages),
    banners: () => fetchEntity('banners', api.getBanners),
    testimonials: () => fetchEntity('testimonials', api.getTestimonials),
    homeSections: () => fetchEntity('homeSections', api.getHomeSections),
    settings: () => fetchEntity('settings', api.getSettings),
    inventory: () => fetchEntity('inventory', api.getInventory),
    shippingMethods: () => fetchEntity('shippingMethods', api.getShippingMethods),
    faqs: () => fetchEntity('faqs', api.getFaqs),
    productCareSteps: () => fetchEntity('productCareSteps', api.getProductCareStepsGrouped),
  }), [fetchEntity]);

  // ─── CRUD Operations (optimistic + real API) ────────────────

  /**
   * addRecord — POST to API, then refresh entity list.
   * @param {string} entity  - e.g. 'products'
   * @param {object} record  - payload to send
   * @param {function} apiFn - API function to call (e.g. api.createProduct)
   * @returns {object|null}  - created record or null on failure
   */
  const addRecord = useCallback(async (entity, record, apiFn) => {
    if (!apiFn) {
      // Fallback: local only
      const local = { ...record, id: Date.now() };
      setData(prev => ({ ...prev, [entity]: [local, ...(prev[entity] || [])] }));
      toast?.success?.(`Added successfully`);
      return local;
    }

    const res = await apiFn(record);
    const { data: created, error, success } = res;

    if (error || success === false) {
      toast?.error?.(error || 'Failed to save record');
      return null;
    }
    
    // Refresh list from server to ensure visibility
    await memoizedRefetch[entity]?.();
    toast?.success?.(`Added successfully`);
    return created?.data || created;
  }, [memoizedRefetch, toast]);

  /**
   * updateRecord — PUT to API, then refresh.
   */
  const updateRecord = useCallback(async (entity, id, updates, apiFn) => {
    if (!apiFn) {
      setData(prev => ({
        ...prev,
        [entity]: (prev[entity] || []).map(item => item.id === id ? { ...item, ...updates } : item),
      }));
      toast?.success?.(`Updated successfully`);
      return;
    }

    const { error, success } = await apiFn(id, updates);
    if (error || success === false) {
      toast?.error?.(error || 'Failed to update');
      return false;
    }
    // Refresh list from server to ensure visibility
    await memoizedRefetch[entity]?.();
    toast?.success?.(`Updated successfully`);
    return true;
  }, [memoizedRefetch, toast]);

  /**
   * deleteRecord — DELETE from API, then remove from local state.
   */
  const deleteRecord = useCallback(async (entity, id, apiFn) => {
    if (!apiFn) {
      setData(prev => ({
        ...prev,
        [entity]: (prev[entity] || []).filter(item => item.id !== id),
      }));
      toast?.success?.(`Deleted successfully`);
      return true;
    }

    const { error, success } = await apiFn(id);
    if (error || success === false) {
      toast?.error?.(error || 'Failed to delete');
      return false;
    }
    // Refresh list from server to ensure visibility
    await memoizedRefetch[entity]?.();
    toast?.success?.(`Deleted successfully`);
    return true;
  }, [memoizedRefetch, toast]);

  const generateVariants = useCallback(async (productId, selections) => {
    const res = await api.generateVariants(productId, selections);
    if (res.error || res.success === false) {
      toast?.error?.(res.error || 'Failed to generate variants');
      return null;
    }
    toast?.success?.(`Generated ${res.data?.count || 0} variants`);
    return res.data;
  }, [toast]);

  const getProductVariants = useCallback(async (productId) => {
    const res = await api.getProductVariants(productId);
    if (res.error || res.success === false) {
      toast?.error?.(res.error || 'Failed to fetch variants');
      return [];
    }
    return res.data;
  }, [toast]);

  const upload360Media = useCallback(async (productId, formData) => {
    const res = await api.upload360Media(productId, formData);
    if (res.error || res.success === false) {
      toast?.error?.(res.error || 'Failed to upload 360 media');
      return null;
    }
    toast?.success?.('360 media uploaded');
    return res.data;
  }, [toast]);

  const value = React.useMemo(() => ({
    data,
    loading,
    errors,
    refetch: memoizedRefetch,
    addRecord,
    updateRecord,
    deleteRecord,
    generateVariants,
    getProductVariants,
    upload360Media,
  }), [data, loading, errors, memoizedRefetch, addRecord, updateRecord, deleteRecord, generateVariants, getProductVariants, upload360Media]);

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};
