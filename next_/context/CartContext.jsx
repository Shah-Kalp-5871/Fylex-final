"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCart, addToCartApi, removeFromCartApi, updateCartQtyApi } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { resolveProductImage, getDisplayData } from '../lib/utils';
import { eventBus, EVENTS } from '../lib/events';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, grandTotal: 0 });
  const [loading, setLoading] = useState(false);
  const [processingItems, setProcessingItems] = useState(new Set()); // IDs of items currently being updated
  const { user, guestId } = useAuth() || {};
  const { success, error: toastError, info } = useToast() || {};
  const userId = user?.id || guestId;

  const mapCartData = (data) => {
    console.log('DEBUG: Cart Items Order from API:', data?.items?.map(i => i.id.toString()));
    const cartItems = data?.items || [];
    const mapped = cartItems.map(item => {
        const variant = item.productVariant;
        const product = variant?.product;
        if (!variant || !product) return null;

        const display = getDisplayData(product, variant);
        return {
            ...display,
            id: item.id.toString(),
            productId: product.id.toString(),
            variantId: variant.id.toString(),
            sku: display.sku,
            title: display.name,
            subtitle: display.subtitle, // Already standardized in utils.js
            unitPrice: Number(item.unitPrice || 0),
            total: Number(item.total || 0),
            image: display.image,
            qty: item.quantity,
        };
    }).filter(Boolean);

    setItems(mapped);
    setTotals({
        subtotal: Number(data?.subtotal || 0),
        grandTotal: Number(data?.grandTotal || 0)
    });
  };

  const loadCart = async () => {
    if (!userId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
        const result = await fetchCart(userId);
        if (result.success) {
            mapCartData(result.data);
        } else {
            if (result.error && result.error.includes('expired')) {
                setItems([]);
                setTotals({ subtotal: 0, grandTotal: 0 });
            }
        }
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    const unsub = eventBus.on(EVENTS.CART_UPDATED, loadCart);
    return () => unsub();
  }, [userId]);

  const addToCart = async (variantId, quantity = 1) => {
    if (!userId) return { success: false, error: 'Login required' };
    
    setLoading(true);
    try {
        const result = await addToCartApi(userId, variantId, quantity);
        if (result.success) {
            mapCartData(result.data);
            eventBus.emit(EVENTS.CART_UPDATED);
            // if (success) success('Added to cart successfully');
        } else {
            if (toastError) toastError(result.error || 'Failed to add to cart');
        }
        return result;
    } catch (err) {
        console.error('Add to cart failed:', err);
        if (toastError) toastError('Failed to add to cart');
        return { success: false, error: err.message };
    } finally {
        setLoading(false);
    }
  };

  const removeFromCart = async (id) => {
    if (!userId) return;
    setProcessingItems(prev => new Set(prev).add(id));
    try {
        const result = await removeFromCartApi(userId, id);
        if (result.success) {
            mapCartData(result.data);
            eventBus.emit(EVENTS.CART_UPDATED);
            if (info) info('Removed from cart');
        }
    } catch (err) {
        console.error('Remove from cart failed:', err);
        if (toastError) toastError('Failed to remove item');
    } finally {
        setProcessingItems(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }
  };

  const updateQty = async (id, delta) => {
    if (!userId) return;
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    const newQty = Math.max(1, item.qty + delta);
    if (newQty === item.qty) return;

    setProcessingItems(prev => new Set(prev).add(id));
    try {
        const result = await updateCartQtyApi(userId, id, newQty);
        if (result.success) {
            mapCartData(result.data);
            eventBus.emit(EVENTS.CART_UPDATED);
        } else {
            if (toastError) toastError(result.error || 'Failed to update quantity');
        }
    } catch (err) {
        console.error('Update cart qty failed:', err);
    } finally {
        setProcessingItems(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }
  };

  const clearCart = async () => {
    setItems([]);
    setTotals({ subtotal: 0, grandTotal: 0 });
  };

  const totalCount = items.reduce((s, i) => s + (i.qty || 0), 0);

  return (
    <CartContext.Provider value={{ 
        items, 
        totals,
        loading, 
        processingItems,
        addToCart, 
        removeFromCart, 
        updateQty, 
        clearCart, 
        totalCount, 
        refreshCart: loadCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
