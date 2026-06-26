"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWishlist, toggleWishlistApi } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { resolveProductImage, getDisplayData } from '../lib/utils';
import { eventBus, EVENTS } from '../lib/events';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { user, guestId } = useAuth() || {};
  const { success, info, error: toastError } = useToast() || {};
  const userId = user?.id || guestId;

  const loadWishlist = async () => {
    if (!userId) {
      setWishlist([]);
      return;
    }
    try {
      const result = await fetchWishlist(userId);
      if (result.success) {
          const items = result.data?.items || [];
          const mapped = items.map(item => {
              const variant = item.productVariant;
              const product = variant?.product;
              
              if (!variant || !product) return null;

              const display = getDisplayData(product, variant);

              const attrParams = (variant.variantAttributes || []).map(va => {
                  const name = va.attributeValue?.attribute?.name?.toLowerCase();
                  const label = va.attributeValue?.label;
                  return name && label ? `${name}=${encodeURIComponent(label)}` : null;
              }).filter(Boolean).join('&');

              const isOutOfStock = variant.manageStock ? (!variant.inStock || variant.stock_quantity <= 0 || variant.qty <= 0) : false;

              return {
                  ...display,
                  id: item.id.toString(), // WishlistItem ID (Must be last to avoid being overwritten by display.id)
                  productId: product.id.toString(),
                  variantId: variant.id.toString(),
                  title: display.name,
                  variantName: display.subtitle,
                  price: display.price,
                  formattedPrice: display.formattedPrice,
                  image: display.image,
                  redirectUrl: `/discover?watch=${product.id}&variant=${variant.id}${attrParams ? `&${attrParams}` : ''}`,
                  isOutOfStock,
              };
          }).filter(Boolean);
          setWishlist(mapped);
      } else {
        console.warn('Wishlist fetch error:', result.error);
        if (result.error && result.error.includes('expired')) {
          setWishlist([]); // Clear if session expired
        }
      }
    } catch(err) {
      console.warn('Gracefully caught wishlist fetch error:', err);
    }
  };

  useEffect(() => {
    loadWishlist();
    const unsub = eventBus.on(EVENTS.WISHLIST_UPDATED, loadWishlist);
    return () => unsub();
  }, [userId]);

  const toggleWishlist = async (product) => {
    if (!userId) {
      if (toastError) toastError("Please login to use wishlist");
      return;
    }
    const variantId = product.variantId || product.currentVariantId;
    if (!variantId) throw new Error("ENFORCEMENT: Cannot wishlist without variantId");

    const wasInWishlist = isInWishlist(variantId);

    try {
      const result = await toggleWishlistApi(userId, product);
      if (result.success) {
          eventBus.emit(EVENTS.WISHLIST_UPDATED);
          if (wasInWishlist) {
            if (info) info("Removed from wishlist");
          } else {
            if (success) success("Added to wishlist");
          }
      }
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
      if (toastError) toastError("Failed to update wishlist");
    }
  };

  const isInWishlist = (id) => wishlist.some(i => i.variantId === id?.toString());

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, refreshWishlist: loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
