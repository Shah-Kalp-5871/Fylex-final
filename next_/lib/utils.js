"use client";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getFileUrl(path) {
  if (!path) return null;
  if (typeof path !== 'string') return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  if (path.startsWith('/assets/')) return path;

  let baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001').replace(/\/api$/, '');
  
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(baseUrl);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        url.hostname = window.location.hostname;
        baseUrl = url.toString().replace(/\/$/, '');
      }
    } catch (e) {}
  }

  let cleanPath = path;
  // Remove leading slash if present
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
  
  // If it already has uploads/, remove it so we can add it back cleanly
  if (cleanPath.startsWith('uploads/')) {
      cleanPath = cleanPath.slice(8);
  }
  
  return `${baseUrl}/uploads/${cleanPath}`;
}

/**
 * UNIFIED DISPLAY MODEL
 * One source of truth for price, image, and configuration across the entire app.
 * Use this in Homepage, Discover, Wishlist, Shop, and Admin.
 */
export function getDisplayData(product, variant = null) {
    if (!product) return { name: '', price: 0, image: '', isConfigurable: false };

    const isConfig = product.productType === 'configurable' || product.isConfigurable;
    
    // DETERMINISTIC SELECTION: Use variant only if explicitly provided.
    // Fallback to first variant ONLY for price/meta if product-level defaults are missing.
    const targetVariant = variant;
    const fallbackVariant = isConfig ? product.variants?.[0] : null;

    const priceValue = isConfig 
        ? (targetVariant?.sellingPrice || targetVariant?.price || fallbackVariant?.sellingPrice || fallbackVariant?.price || product.sellingPrice || product.price)
        : (product.sellingPrice || product.price);

    return {
        id: product.id?.toString(),
        variantId: targetVariant?.id?.toString(),
        name: product.name || product.title,
        subtitle: (targetVariant?.variantAttributes || [])
            .map(va => va.attributeValue?.label)
            .filter(Boolean)
            .join(', ') || product.subtitle || targetVariant?.sku || fallbackVariant?.sku,
        isConfigurable: isConfig,
        variant: targetVariant || fallbackVariant,
        price: Number(priceValue || 0),
        formattedPrice: `₹${Number(priceValue || 0).toLocaleString('en-IN')}`,
        image: resolveProductImage(product, targetVariant),
        heroBgImage: resolveProductBackground(product, targetVariant),
        slug: product.slug,
        sku: targetVariant?.sku || fallbackVariant?.sku || product.sku
    };
}

export function resolveProductImage(product, variant = null) {
  if (!product) return '/assets/fylex-watch-v2/premium.png';

  let resolvedPath = null;
  
  // 1. PRIORITY: Explicitly selected variant media
  if (variant) {
    const vImages = variant.variantImages || [];
    if (vImages.length > 0) {
      const mainImg = vImages.find(img => img.type === 'MAIN' || img.isPrimary) || vImages[0];
      const media = mainImg.media || mainImg;
      resolvedPath = media.filePath || media.path || media.url || media.fileName;
    }
  }

  // 2. PRIORITY: Product-level Default Media (New Source of Truth)
  if (!resolvedPath && product.productMedia?.length > 0) {
    const mainMedia = product.productMedia.find(m => m.type === 'MAIN' || m.isPrimary) || product.productMedia[0];
    const m = mainMedia.media || mainMedia;
    resolvedPath = m.filePath || m.path || m.url || m.fileName;
  }

  // 3. LEGACY FALLBACK: images array
  if (!resolvedPath && product.images?.length > 0) {
    const imgs = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? JSON.parse(product.images) : []);
    if (imgs.length > 0) resolvedPath = imgs[0];
  }

  // 4. LEGACY FALLBACK: heroImage field
  if (!resolvedPath && product.heroImage) {
    resolvedPath = product.heroImage;
  }

  // 5. SYSTEM FALLBACK: First variant (Last resort)
  if (!resolvedPath && product.variants?.length > 0) {
    const firstV = product.variants[0];
    const vImages = firstV.variantImages || [];
    if (vImages.length > 0) {
        const mainImg = vImages.find(img => img.type === 'MAIN' || img.isPrimary) || vImages[0];
        const media = mainImg.media || mainImg;
        resolvedPath = media.filePath || media.path || media.url || media.fileName;
    }
  }

  return resolvedPath ? getFileUrl(resolvedPath) : '/assets/fylex-watch-v2/premium.png';
}

export function resolveProductBackground(product, variant = null) {
  if (!product) return null;

  let resolvedPath = null;

  // 1. PRIORITY: Variant Background
  if (variant) {
    const vImages = variant.variantImages || [];
    const bgImg = vImages.find(img => img.type === 'HERO_BG');
    if (bgImg) {
      const media = bgImg.media || bgImg;
      resolvedPath = media.filePath || media.path || media.url || media.fileName;
    }
  }

  // 2. PRIORITY: Product-level Hero Background
  if (!resolvedPath && product.discoverHeroBgImage) {
    resolvedPath = product.discoverHeroBgImage;
  }

  return resolvedPath ? getFileUrl(resolvedPath) : null;
}

export function serializeConfig(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== 'watch' && key !== 'mode') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
}
