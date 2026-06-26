"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchOrders, createOrderApi } from '../lib/api';
import { useAuth } from './AuthContext';
import { resolveProductImage, getDisplayData } from '../lib/utils';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  const normalizeOrder = (order) => {
    const rawItems = Array.isArray(order.items) 
      ? order.items 
      : Array.isArray(order.products) 
      ? order.products 
      : [];

    return {
      ...order,
      id: order.orderNumber || order.id?.toString(),
      date: order.createdAt 
        ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
        : (order.date || 'N/A'),
      total: order.grandTotal || order.total || 0,
      items: rawItems.map(item => {
        const variant = item.productVariant;
        const product = item.product || variant?.product;
        const display = getDisplayData(product, variant);
        
        return {
            id: item.id?.toString(),
            variantId: variant?.id?.toString(),
            productId: product?.id?.toString(),
            productVariant: variant,
            sku: variant?.sku || item.sku,
            price: item.unitPrice || item.price || 0,
            formattedPrice: `₹${Number(item.unitPrice || item.price || 0).toLocaleString('en-IN')}`,
            image: display.image,
            title: display.name,
            variantName: display.subtitle,
            qty: item.quantity || item.qty || 1
        };
      })
    };
  };

  // Initial load from backend
  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) {
        setOrders([]);
        return;
      }
      
      try {
        const response = await fetchOrders(user.id);
        // Handle both { success: true, data: [] }, { orders: [] } and raw array responses
        const data = response?.data || response?.orders || (Array.isArray(response) ? response : []);
        const normalized = data.map(normalizeOrder);
        setOrders(normalized);
      } catch (err) {
        console.warn('Order API unavailable, using local data:', err.message);
      }
    };
    loadOrders();
  }, [user?.id]);

  const addOrder = async (orderData) => {
    try {
      const response = await createOrderApi(orderData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to place order');
      }

      const normalized = normalizeOrder(response.data);
      setOrders(prev => [normalized, ...prev]);
      return { success: true, data: normalized };
    } catch (err) {
      console.error('Order creation failed:', err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used inside OrderProvider');
  return ctx;
}
