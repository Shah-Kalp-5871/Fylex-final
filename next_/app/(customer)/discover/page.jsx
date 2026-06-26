"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, EffectCoverflow, Navigation, Pagination, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-coverflow';
import 'swiper/css/free-mode';
import { fetchProducts } from '../../../lib/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getFileUrl, resolveProductImage, getDisplayData } from '@/lib/utils';
import localProductsData from '../../../data/productsData';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const watchId = searchParams.get('watch');
  const mode = searchParams.get('mode');
  const isGeneralMode = mode === 'all';

  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollDir, setScrollDir] = useState('up');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModalData, setActiveModalData] = useState(null);
  const [activeSpecGroup, setActiveSpecGroup] = useState(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [isAdded, setIsAdded] = useState(false);
  const lastScrollY = useRef(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProducts();
        if (data) {
          const actualData = data.data || (Array.isArray(data) ? data : []);
          const hexToRgb = (hex) => {
            if (!hex) return '196, 163, 90';
            const cleanHex = hex.replace('#', '');
            const r = parseInt(cleanHex.substring(0, 2), 16);
            const g = parseInt(cleanHex.substring(2, 4), 16);
            const b = parseInt(cleanHex.substring(4, 6), 16);
            return `${r}, ${g}, ${b}`;
          };

          const mapped = actualData.map(p => {
            const display = getDisplayData(p);
            return {
              ...p,
              ...display,
              heroBgImage: display.heroBgImage,
              id: p.id.toString(),
              variantId: display.variantId,
              heroImage: display.image, // Resolve heroImage using display logic
              title: display.name,
              subtitle: display.subtitle || 'Luxury Collection',
              description: p.shortDescription || p.description || '',
              longDesc: p.description || p.shortDescription || 'Experience the pinnacle of watchmaking with our masterfully crafted timepiece.',
              theme: p.theme || 'champagne',
              accentColor: p.accentColor || '#c4a35a',
              accentRgb: hexToRgb(p.accentColor || '#c4a35a'),
              mistColor: p.mistColor || '',
              mistRgb: hexToRgb(p.mistColor || p.accentColor || '#c4a35a'),
              textColor: p.textColor || '#1a1a1a',
              videoUrl: p.videoUrl || null,
              heritageText: p.heritageText || 'Founded on the principles of precision and timeless elegance, Fylex has been at the forefront of horological innovation for generations.',
              sold: (p.soldCount !== undefined && p.soldCount !== null) ? p.soldCount : Math.min((p.id % 100) + 120, p.qty || p.stockCount || 500),
              totalStock: p.qty || p.stockCount || 500,
              galleryImages: (p.productMedia?.length > 0)
                ? p.productMedia
                  .filter(m => m.type === 'GALLERY')
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map(m => {
                    let mPath = m.media?.url || (m.media?.fileName ? `/uploads/${m.media.fileName}` : '');
                    return getFileUrl(mPath);
                  }).filter(Boolean)
                : (p.images || []).map(img => getFileUrl(img.startsWith('http') || img.startsWith('/') ? img : `/uploads/${img}`)),
              combinations: (p.variants || []).map(v => {
                const vDisplay = getDisplayData(p, v);
                return {
                  id: v.id.toString(),
                  name: v.variantAttributes?.map(va => va.attributeValue?.label).join(', ') || v.sku,
                  img: vDisplay.image,
                  price: vDisplay.price,
                  formattedPrice: vDisplay.formattedPrice,
                  isSoldConfiguration: v.isSoldConfiguration,
                  attributes: v.variantAttributes?.map(va => ({
                    name: va.attributeValue?.attribute?.name?.toLowerCase(),
                    value: va.attributeValue?.label
                  })) || []
                };
              }),
              specs: (p.specifications || []).reduce((acc, s) => {
                const gName = s.specification?.groups?.[0]?.group?.name || 'Technical Specifications';
                if (!acc[gName]) acc[gName] = [];
                acc[gName].push({
                  label: s.specification?.name,
                  value: s.value
                });
                return acc;
              }, {})
            };
          });
          setProductsData(mapped);
        }
      } catch (err) {
        console.error("Discover loadData error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 60);

      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setScrollDir('down');
      } else {
        setScrollDir('up');
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for Section Pagination
  useEffect(() => {
    if (loading) return;

    const sections = ['hero', 'description', 'specs', 'heritage'];
    const observerOptions = {
      root: null,
      rootMargin: '-49% 0px -49% 0px',
      threshold: 0
    };

    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // We need a small timeout to ensure the DOM is fully ready after loading
    const timeoutId = setTimeout(() => {
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [loading, watchId]); // Re-run on watch change as sections might re-render
  const openInfoModal = (p) => {
    const soldConfigs = (p.combinations || [])
      .filter(combo => combo.isSoldConfiguration)
      .map(combo => ({
        ...combo,
        isProduct: false
      }));
    setActiveModalData({ ...p, combinations: soldConfigs });
  };
  const closeInfoModal = () => setActiveModalData(null);

  const handleComboClick = (combo) => {
    if (combo.isProduct) {
      router.push(`?watch=${combo.id}`);
      closeInfoModal();
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (activeModalData?.id) {
      params.set('watch', activeModalData.id);
    }
    (combo.attributes || []).forEach(attr => {
      if (attr.name && attr.value) {
        params.set(attr.name, attr.value);
      }
    });
    router.push(`?${params.toString()}`);
    closeInfoModal();
  };

  const handleBookNow = () => {
    const hasConfig = searchParams.get('dial') || searchParams.get('material');
    let targetVariant = null;
    const variants = product?.variants || [];

    if (hasConfig) {
      targetVariant = variants.find(v => {
        return (v.variantAttributes || []).every(va => {
          const attrName = va.attributeValue?.attribute?.name?.toLowerCase();
          const selectedVal = searchParams.get(attrName);
          return !selectedVal || selectedVal === va.attributeValue?.label;
        });
      });
    }

    // Removed automatic fallback to first variant to prevent inconsistent UI state
    // targetVariant = variants[0];

    if (targetVariant) {
      addToCart(targetVariant.id.toString(), 1, { title: product.name });
      setIsAdded(true);
    } else {
      throw new Error("ENFORCEMENT: Cannot add to cart without matching variant");
    }
  };

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [watchId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div className="loading-state">Initializing Experience...</div>
      </div>
    );
  }

  // Default to first if no watchId is provided or product not found
  const productIndex = productsData.findIndex(p => p.id === watchId || p.slug === watchId);
  const initialIndex = productIndex !== -1 ? productIndex : 0;
  const product = productsData[initialIndex];

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Products Available</h2>
          <p style={{ color: '#888', marginBottom: '2rem' }}>We are currently updating our collection. Please check back soon.</p>
          <Link href="/" style={{ color: '#1a1a1a', fontWeight: 600 }}>← Back to Home</Link>
        </div>
      </div>
    );
  }
  // ── DYNAMIC VARIANT MATCHING ──
  const selections = {};
  const variantIdParam = searchParams.get('variant');

  searchParams.forEach((value, key) => {
    if (key !== 'watch' && key !== 'mode' && key !== 'variant') {
      selections[key.toLowerCase()] = value;
    }
  });

  const hasSelections = Object.keys(selections).length > 0;
  let matchingVariant = null;

  if (hasSelections || variantIdParam) {
    matchingVariant = (product.variants || []).find(v => {
      // 1. Try to match by variant ID if provided in URL
      if (variantIdParam && v.id.toString() === variantIdParam) return true;

      // 2. Otherwise match by attributes
      const vAttrs = v.variantAttributes || [];
      if (vAttrs.length === 0) return false;

      // Check if ALL selected attributes match this variant
      return Object.keys(selections).every(key => {
        const va = vAttrs.find(a => a.attributeValue?.attribute?.name?.toLowerCase() === key);
        return va && va.attributeValue?.label === selections[key];
      });
    });
  }

  if (matchingVariant) {
    const vDisplay = getDisplayData(product, matchingVariant);
    product.currentVariantId = matchingVariant.id.toString();
    product.variantName = vDisplay.subtitle;
    product.price = vDisplay.price;
    product.formattedPrice = vDisplay.formattedPrice;
    product.heroImage = vDisplay.image;
    product.image = vDisplay.image;
    product.heroBgImage = vDisplay.heroBgImage;

    const vGallery = (matchingVariant.variantImages || [])
      .filter(vi => vi.type === 'GALLERY' || vi.type === 'gallery')
      .map(vi => {
        const m = vi.media;
        const p = m?.url || m?.path || (m?.fileName ? `/uploads/${m.fileName}` : '');
        return getFileUrl(p);
      })
      .filter(Boolean);

    if (vGallery.length > 0) {
      product.galleryImages = vGallery;
    }
  }

  const hasConfig = Object.keys(selections).length > 0;
  if (!hasConfig) {
    product.heroBgImage = null;
  }
  const materialParam = searchParams.get('material');
  const bezelParam = searchParams.get('bezel');
  const dialParam = searchParams.get('dial');

  // Dynamic config map derived from product variants if possible, with hardcoded fallbacks for featured looks
  const configMap = {
    materials: {
      "Yellow Gold": { img: '/assets/fylex-watch-v2/goldwatch.png', desc: '18 ct yellow gold, our proprietary alloy, offers an unmistakable radiance and a majestic presence on the wrist.' },
      "White Gold": { img: '/assets/fylex-watch-v2/white-gold.png', desc: 'Crafted with 18 ct white gold, this finish provides a discreet yet profound sense of luxury, shimmering with a cold, pure light.' },
      "Everose gold": { img: '/assets/fylex-watch-v2/everose-gold.png', desc: 'Our exclusive 18 ct pink gold alloy, Everose gold, preserves the pink beauty of the watch through years of exposure.' },
      "Premium": { img: '/assets/fylex-watch-v2/premium.png', desc: 'The ultimate expression of our manufacture, the premium finish combines our most rare alloys for a truly one-of-a-kind luster.' }
    },
    bezels: {
      "Fluted": { img: '/assets/fylex-watch-v2/Flutted.png', desc: 'The fluted bezel, a signature mark of distinction, was originally designed for waterproofness but has become a purely aesthetic masterpiece.' },
      "Brilliant Diamond set": { img: '/assets/fylex-watch-v2/brilliant-diamond-set.png', desc: 'Each diamond is meticulously selected and set by hand to ensure a symphony of light and brilliance that captures every gaze.' }
    },
    dials: {
      "Olive Green": { img: '/assets/fylex-watch-v2/Olive-green-dial.png', desc: 'A deep, sunray-finished olive green dial that symbolizes growth and the eternal spirit of the Fylex collection.' },
      "Chocolate": { img: '/assets/fylex-watch-v2/Chocolate-dial.png', desc: 'The rich chocolate brown dial offers a warm, sophisticated contrast to the precious metals of the case and bracelet.' },
      "Meteorite": { img: '/assets/fylex-watch-v2/metoritedial.png', desc: 'Forged in the heart of distant stars, the meteorite dial features unique natural patterns that make your timepiece truly unique.' },
      "Diamond-paved": { img: '/assets/fylex-watch-v2/Diamondpavedial.png', desc: 'A breathtaking landscape of light, the diamond-paved dial is a testament to our gem-setting prowess and dedication to opulence.' }
    }
  };

  // Attempt to find images from actual variants if not in hardcoded map
  const findVariantImg = (attrName, valName) => {
    // Try to find the variant that matches the current selection as closely as possible
    const currentSelections = selections || {};
    const match = (product.variants || []).find(v => {
      const vAttrs = v.variantAttributes || [];
      // Must have the target attribute value
      const hasTarget = vAttrs.some(va =>
        va.attributeValue?.attribute?.name?.toLowerCase() === attrName.toLowerCase() &&
        va.attributeValue?.label === valName
      );
      if (!hasTarget) return false;

      // Try to match other current selections too
      return vAttrs.every(va => {
        const aName = va.attributeValue?.attribute?.name?.toLowerCase();
        if (aName === attrName.toLowerCase()) return true; // already checked
        if (currentSelections[aName]) {
          return va.attributeValue?.label === currentSelections[aName];
        }
        return true;
      });
    });

    const vImg = match?.variantImages?.find(vi => vi.type === 'MAIN')?.media || match?.variantImages?.[0]?.media;
    if (!vImg) return null;
    let vPath = vImg.url || vImg.path || (vImg.fileName ? `/uploads/${vImg.fileName}` : '');
    if (vPath && !vPath.startsWith('http') && !vPath.startsWith('/') && !vPath.startsWith('data:')) {
      vPath = `/uploads/${vPath}`;
    }
    return getFileUrl(vPath);
  };

  return (
    <div className={`cfg-page section-${product.theme}`}>
      <style>{`
        /* ═══════════ CONFIGURE PAGE ═══════════ */
        .cfg-page {
          font-family: 'Inter', sans-serif;
          color: ${product.textColor};
          background: #ffffff;
          overflow-x: hidden;
        }

        /* ── YOUR CHOICES SECTION ── */
        .cfg-choices-section {
          padding: 120px 8%;
          background: #fafaf9;
          border-top: 1px solid #eee;
        }
        .cfg-choices-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 60px;
          margin-top: 60px;
        }
        .cfg-choice-card {
          text-align: center;
          transition: transform 0.4s ease;
        }
        .cfg-choice-card:hover { transform: translateY(-10px); }
        .cfg-choice-img-wrap {
          background: #fff;
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 320px;
        }
        .cfg-choice-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1));
        }
        .cfg-choice-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${product.accentColor};
          margin-bottom: 15px;
          display: block;
        }
        .cfg-choice-name {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 1.8rem;
          margin-bottom: 20px;
          color: ${product.textColor};
        }
        .cfg-choice-desc {
          font-size: 0.95rem;
          line-height: 1.7;
          color: ${product.textColor};
          max-width: 280px;
          margin: 0 auto;
        }

        /* ── TOP RIGHT CTA (Navbar-like) ── */
        .cfg-top-right-cta {
          position: fixed;
          top: 90px;
          right: 40px;
          z-index: 2000;
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s;
        }
        .cfg-top-right-cta.hidden {
          transform: translateY(-100px);
          opacity: 0;
          pointer-events: none;
        }
        .cfg-cta-pill {
          display: inline-block;
          padding: 8px 16px;
          background: #1a1a1a;
          color: #fff;
          text-decoration: none;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border-radius: 999px;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          border: 1px solid #1a1a1a;
          pointer-events: auto;
        }
        .cfg-cta-pill:hover, .cfg-cta-pill:active {
          background: rgba(255, 255, 255, 0.1) !important;
          color: #000000 !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .cfg-book-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: #1a1a1a;
          color: #fff;
          border: 1px solid #1a1a1a;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .cfg-book-btn:hover, .cfg-book-btn:active {
          background: rgba(255, 255, 255, 0.1) !important;
          color: #000000 !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        .btn-added {
          background: #000000 !important;
          color: #ffffff !important;
          animation: popBtn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          pointer-events: none;
        }
        @keyframes popBtn {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .top-actions { 
          position: fixed; 
          top: 100px; 
          right: 30px; 
          display: flex; 
          align-items: center; 
          gap: 15px; 
          z-index: 999; 
        }
        .close-btn { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #1a1a1a; 
          cursor: pointer; 
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          border: none;
          transition: all 0.3s;
        }
        .close-btn:hover {
          transform: scale(1.1);
          background: rgba(255,255,255,0.4);
        }

        /* ═══ NEW PREMIUM HERO ═══ */
        .cfg-hero {
          min-height: 100vh;
          background: radial-gradient(circle at center, #ffffff 0%, #e8edf3 100%);
          display: flex;
          align-items: center; /* Vertically center to prevent cutting by navbar */
          justify-content: center;
          position: relative;
          padding: 80px 0;
          overflow: hidden;
        }
        
        .cfg-hero-aura {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 70%);
          z-index: 2;
          pointer-events: none;
        }

        .cfg-hero-bg {
          display: none;
        }

        .cfg-hero-main-visual {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
          margin-top: 40px; /* Add some margin to push it further down if needed, but centering should be enough */
          height: 65vh; 
        }

        .cfg-hero-visual-box {
          position: relative;
          width: 100%;
          height: 100%;
          // background: #ffffff;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          box-shadow: 0 40px 100px rgba(0,0,0,0.03);
          // background: 
          //   radial-gradient(circle at 70% 30%, rgba(255,255,255,1) 0%, rgba(248, 250, 252, 0.8) 100%);
        }

        .cfg-hero-product-img {
          width: 100%;
          height: auto;
          max-height: 70vh;
          object-fit: contain;
          z-index: 12;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.12));
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .cfg-hero-product-img:hover {
          transform: scale(1.02);
        }

        .cfg-hero-image-hidden {
          display: none;
        }

        /* Bottom Left Details */
        .cfg-details-box {
          position: absolute;
          bottom: 60px;
          left: 40px;
          right: 30px;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          pointer-events: none;
        }
        .cfg-details-left, .cfg-details-right {
          pointer-events: auto;
        }
        .cfg-details-right {
          display: flex;
          align-items: center;
          margin-bottom: 0px; 
        }
        .cfg-details-title {
          font-family: 'Inter', sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.4rem);
          font-weight: 700;
          color: ${product.textColor};
          // margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .cfg-hero-subtitle {
          font-size: 1.1rem;
          color: ${product.textColor};
          max-width: 400px;
          line-height: 1.6;
        }
        .cfg-details-specs {
          font-size: 1rem;
          color: #666;
          margin-bottom: 2px;
          font-weight: 300;
          text-align: justify;
        }
        .cfg-details-ref {
          font-size: 1rem;
          color: #666;
          // margin-bottom: 15px;
          font-weight: 300;
        }
        .cfg-hero-price {
          font-size: 1.5rem;
          font-weight: 600;
          color: ${product.textColor};
        }
        .cfg-details-price {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cfg-info-icon {
          width: 16px;
          height: 16px;
          border: 1px solid #1a1a1a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #1a1a1a !important;
          flex-shrink: 0;
          line-height: 1;
          text-transform: lowercase;
        }

        /* Add to Cart Button */
        .cfg-add-cart-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: transparent;
          color: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          border: none;
        }
        .cfg-add-cart-btn:hover, .cfg-add-cart-btn:active {
          background: #ffffff !important;
          color: #000000 !important;
          transform: scale(1.1);
          border: 1px solid #ffffff;
        }
        .cfg-add-cart-btn svg {
          width: 24px;
          height: 24px;
        }

        .cfg-variations-btn {
          position: absolute;
          right: 20px;
          bottom: 20px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .cfg-variations-btn:hover {
            transform: translateY(-5px);
        }
        .cfg-var-thumb {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #f0f0f0;
          padding: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .cfg-var-thumb:hover {
          box-shadow: 0 15px 40px rgba(0,0,0,0.12);
        }
        .cfg-var-thumb img { width: 85%; height: 85%; object-fit: contain; }
        .cfg-var-label {
          font-size: 10px;
          font-weight: 700;
          color: #1a1a1a;
          text-transform: none;
          letter-spacing: 0.02em;
        }

        /* Far Right Vertical Nav */
        .cfg-vert-nav {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cfg-nav-dash {
          width: 3px;
          height: 16px;
          background: #ddd;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: pointer;
        }
        .cfg-nav-dash:hover { background: #bbb; }
        .cfg-nav-dash.active {
          height: 32px;
          background: #666;
        }

        /* ═══ PAGE VERTICAL PAGINATION ═══ */
        .cfg-page-pagination {
          position: fixed;
          right: 35px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        .cfg-pagination-bar {
          width: 4px;
          height: 40px;
          background: #d1d5db;
          border-radius: 2px;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: pointer;
          position: relative;
        }
        .cfg-pagination-bar:hover {
          background: #bbb;
        }
        .cfg-pagination-bar.active {
          height: 100px;
          background: #1a1a1a;
        }
        /* Mobile adjustment */
        @media (max-width: 768px) {
          .cfg-page-pagination {
            right: 15px;
            gap: 8px;
          }
          .cfg-pagination-bar {
            width: 3px;
            height: 25px;
          }
          .cfg-pagination-bar.active {
            height: 60px;
          }
          .cfg-hero {
            padding: 120px 0 60px;
          }
          .cfg-hero-main-visual {
            transform: translateY(-40px);
          }
          .cfg-hero-product-img {
            max-height: 38vh;
          }
          .cfg-details-box {
            bottom: 30px;
            left: 20px;
            right: 20px;
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .cfg-details-title {
            font-size: 1.8rem;
          }
          .cfg-hero-subtitle {
            font-size: 0.95rem;
            text-align: left;
          }
          .cfg-details-specs, .cfg-details-ref {
            font-size: 0.9rem;
          }
          .cfg-details-left {
            width: 100%;
          }
          .cfg-price-add-row {
            width: 100%;
          }
          .cfg-actions-group {
            width: 100%;
            justify-content: space-between;
          }
          .top-actions {
            top: 30px;
            right: 20px;
          }
          .cfg-top-right-cta {
            top: calc(var(--header-h, 70px) + 15px);
            right: 20px;
          }
          .cfg-variations-btn {
            bottom: auto;
            top: 120px;
            right: 15px;
          }
        }

        /* ── TOP SWIPER ── */
        .cfg-top-swiper {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        .cfg-top-swiper .swiper-button-next,
        .cfg-top-swiper .swiper-button-prev {
          color: #1a1a1a;
          background: rgba(255,255,255,0.5);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          backdrop-filter: blur(10px);
        }

        /* ── DESCRIPTION SECTION ── */
        .cfg-desc-section {
          padding: 40px 0;
          max-width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #000;
          position: relative;
          overflow: hidden;
        }
        .cfg-mist-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        .cfg-desc-content {
          padding: 0 40px;
          width: 100%;
          text-align: left;
          box-sizing: border-box;
        }
        .cfg-desc-text {
          text-align: left;
          line-height: 1.8;
          font-size: 1rem;
        }
        .cfg-desc-heading {
          margin: 5px 0 15px;
          font-size: 1.5rem;
          text-align: left;
        }
        .cfg-desc-img-wrap {
          width: 100vw;
          margin: 20px 0 0;
          padding: 0;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
        }
        .cfg-desc-img {
          width: 100%;
          max-width: 100%;
          height: auto;
          display: block;
          filter: none;
        }
        
        .cfg-see-variants {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #999;
          cursor: pointer;
          // margin-top: 10px;
          transition: color 0.3s;
        }
        .cfg-see-variants:hover {
          color: #ffffff;
        }
        .cfg-see-variants svg {
          width: 14px;
          height: 14px;
        }
        
        .cfg-price-add-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
          margin-top: 10px;
        }
        .cfg-actions-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .cfg-fav-inline {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
          transition: all 0.3s;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #000000;
          backdrop-filter: blur(8px);
          border: none;
        }
        .cfg-fav-inline:hover {
          transform: scale(1.1);
          background: #222222;
        }
        .cfg-fav-inline.active {
          background: #e53935;
          color: #fff;
          transform: scale(1.1);
        }
        .cfg-fav-inline.active:hover {
          background: #c62828;
        }
        .cfg-fav-inline svg {
          width: 20px;
          height: 20px;
          transition: transform 0.3s;
        }
        .cfg-fav-inline:active svg { transform: scale(0.9); }
        .cfg-add-now-btn {
          background: #1a1a1a;
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.4s;
        }
        .cfg-add-now-btn:hover {
          background: #333;
          transform: translateY(-2px);
        }

        /* ═══ VIDEO SECTION ═══ */
        .cfg-video-section {
          padding: 40px 8% 100px;
        }
        .cfg-video-wrap {
          max-width: 1000px;
          margin: 0 auto;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.1);
          aspect-ratio: 16/9;
        }

        /* ═══ SWIPER CAROUSEL ═══ */
        .cfg-swiper-section {
          padding: 80px 0;
          background: ${product.bgColor};
        }
        .cfg-swiper-title {
          text-align: center;
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 400;
          margin-bottom: 50px;
        }
        .cfg-swiper-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .cfg-swiper-container .swiper-slide {
          width: 420px;
          height: 415px;
          transition: transform 0.4s ease, opacity 0.4s ease;
          opacity: 0.4;
          transform: scale(0.7);
        }
        .cfg-swiper-container .swiper-slide-active {
          opacity: 1;
          transform: scale(1);
          z-index: 10;
        }
        .cfg-slide-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          background: #fff;
        }
        .cfg-swiper-container .swiper-pagination {
          position: relative;
          margin-top: 50px;
          bottom: 0 !important;
        }
        .cfg-swiper-container .swiper-pagination-bullet {
          width: 50px;
          height: 4px;
          border-radius: 4px;
          background: #ccc;
          opacity: 0.5;
          margin: 0 6px !important;
          transition: all 0.4s ease;
        }
        .cfg-swiper-container .swiper-pagination-bullet-active {
          width: 80px;
          opacity: 1;
          background: ${product.accentColor};
        }

        /* ═══ HERITAGE / FINAL TEXT ═══ */
        .cfg-heritage-section {
          padding: 100px 0;
          width: 100%;
          max-width: 100%;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 60px;
          align-items: center;
          background: #000000;
        }
        .cfg-heritage-left {
          width: 100%;
          padding: 0 40px;
          box-sizing: border-box;
        }
        .cfg-heritage-right {
          display: flex;
          flex-direction: column;
          width: 100%;
          align-items: center;
        }
        .cfg-sold-stats {
          background: #000000;
          color: #ffffff;
          padding: 50px 60px;
          border-radius: 24px;
          text-align: left;
          cursor: pointer;
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 520px;
          border: none;
          z-index: 1;
        }
        /* ── Animated rotating gradient border ── */
        .cfg-sold-stats::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 26px;
          background: conic-gradient(
            from var(--border-angle, 0deg),
            ${product.accentColor},
            rgba(196,163,90,0.15),
            ${product.accentColor}44,
            rgba(255,255,255,0.3),
            ${product.accentColor}
          );
          z-index: -2;
          animation: borderSpin 4s linear infinite;
        }
        /* ── Inner fill to "cut out" the border ── */
        .cfg-sold-stats::after {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 22px;
          background: #000000;
          z-index: -1;
        }
        @property --border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes borderSpin {
          to { --border-angle: 360deg; }
        }
        /* ── Shimmer light sweep ── */
        .cfg-sold-stats .shimmer-sweep {
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          animation: shimmerSweep 3.5s ease-in-out infinite;
          z-index: 3;
          pointer-events: none;
        }
        @keyframes shimmerSweep {
          0%   { left: -100%; }
          50%  { left: 150%; }
          100% { left: 150%; }
        }
        .cfg-sold-stats > * {
          position: relative;
          z-index: 4;
        }
        .cfg-sold-stats:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 35px 70px rgba(0,0,0,0.3), 0 0 30px ${product.accentColor}44;
        }
        .stats-numbers {
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 4rem;
          margin-bottom: 16px;
          color: ${product.accentColor};
          line-height: 1;
          animation: softPulse 3s ease-in-out infinite;
        }
        @keyframes softPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }
        .stats-label {
          font-size: 0.9rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #ffffff;
          font-weight: 600;
          margin-bottom: 5px;
          display: block;
        }
        .stats-description {
          font-size: 1rem;
          line-height: 1.6;
          color: #666;
          font-weight: 300;
          margin: 0;
        }
        .cfg-heritage-eyebrow {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: ${product.accentColor};
          display: block;
          margin-bottom: 20px;
        }
        .cfg-heritage-heading {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 400;
          margin: 0 0 30px;
          line-height: 1.2;
          color: #ffffff;
        }
        .cfg-heritage-text {
          font-size: 1.15rem;
          line-height: 1.9;
          color: #cccccc;
          font-weight: 300;
          text-align: left;
        }

        /* ═══════════ DARK/ELEGANT MODAL STYLES ═══════════ */
        .cfg-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        .cfg-modal-overlay.show {
          opacity: 1;
          visibility: visible;
        }
        .cfg-modal-box {
          width: 950px;
          max-width: 95vw;
          min-height: 600px;
          height: 85vh;
          max-height: 850px;
          margin: auto;
          position: relative;
          overflow: hidden;
          border-radius: 42px;
          background: 
            radial-gradient(circle at left center, rgba(255,185,60,.12), transparent 30%),
            radial-gradient(circle at center, rgba(255,185,60,.06), transparent 40%),
            radial-gradient(circle at right bottom, rgba(255,185,60,.1), transparent 30%),
            linear-gradient(135deg, rgba(12,12,12,.95), rgba(2,2,2,.98));
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,220,140,.45);
          box-shadow: 0 0 40px rgba(255,190,70,.15), 0 0 90px rgba(255,190,70,.08), inset 0 1px 0 rgba(255,255,255,.08);
          display: flex;
          flex-direction: column;
          transform: translateY(20px);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          animation: goldFlow 10s linear infinite;
        }

        @keyframes goldFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .cfg-modal-overlay.show .cfg-modal-box {
          transform: translateY(0);
        }

        .cfg-modal-header {
          padding: 36px 40px;
          border-bottom: 1px solid transparent;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .cfg-modal-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: rgba(255,220,150,.2);
        }

        .cfg-modal-title {
          font-family: 'Inter', sans-serif;
          font-size: 26px;
          font-weight: 500;
          letter-spacing: -1px;
          color: #ffffff;
          margin: 0;
        }

        .cfg-modal-close {
          background: none;
          border: none;
          font-size: 32px;
          cursor: pointer;
          color: rgba(255,240,210,.8);
          transition: color 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        .cfg-modal-close:hover {
          color: white;
        }

        .cfg-modal-content {
          flex: 1;
          overflow-y: scroll;
          padding: 0;
          overscroll-behavior: contain;
          min-height: 0;
          -webkit-overflow-scrolling: touch;
          position: relative;
          z-index: 1;
        }
        .cfg-modal-content::-webkit-scrollbar {
          width: 8px;
        }
        .cfg-modal-content::-webkit-scrollbar-track {
          background: transparent;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
        }
        .cfg-modal-content::-webkit-scrollbar-thumb {
          background-color: #444444;
          border-radius: 4px;
        }
        .cfg-modal-content::-webkit-scrollbar-thumb:hover {
          background-color: #666666;
        }

        .cfg-combo-item {
          width: 90%;
          height: 120px;
          border-radius: 24px;
          background: rgba(255,255,255,.04);
          border: none;
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          box-shadow: 0 0 40px rgba(255,200,90,.1), inset 0 1px 0 rgba(255,255,255,.06);
          margin: 30px auto;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 0 30px;
          position: relative;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
        }

        .cfg-combo-item::after {
          content: '';
          position: absolute;
          left: -15px;
          top: 25px;
          width: 45px;
          height: 60px;
          filter: blur(30px);
          background: rgba(255,190,80,.4);
          z-index: 0;
          pointer-events: none;
        }

        .cfg-combo-item:hover {
          transform: translateY(-6px);
          box-shadow: 0 0 60px rgba(255,210,100,.18), 0 0 120px rgba(255,210,100,.1);
        }

        .cfg-combo-img-wrap {
          width: 80px;
          height: 80px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .cfg-combo-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transform: scale(1.35);
        }

        .cfg-combo-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
          z-index: 1;
        }

        .cfg-combo-name {
          font-family: 'Inter', sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: white;
          line-height: 1.1;
          margin: 0;
        }

        .cfg-combo-status {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: rgba(255,220,180,.75);
        }

        .cfg-combo-chevron {
          font-size: 40px;
          color: rgba(255,230,190,.75);
          transition: transform 0.3s, color 0.3s;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cfg-combo-item:hover .cfg-combo-chevron {
          transform: translateX(10px);
          color: white;
        }

        @media (max-width: 600px) {
          .cfg-modal-box {
            width: 95%;
          }
          .cfg-combo-item {
            width: 80%;
            max-width: 320px;
            height: auto;
            min-height: unset;
            flex-direction: column;
            justify-content: center;
            padding: 24px 20px 20px 20px;
            text-align: center;
            gap: 12px;
            margin: 20px auto;
          }
          .cfg-combo-chevron {
            transform: rotate(90deg);
            margin-top: 15px;
          }
          .cfg-combo-item:hover .cfg-combo-chevron {
            transform: rotate(90deg) translateX(10px);
          }
        }

        /* ═══ DESKTOP TEXT JUSTIFY ═══ */
        @media (min-width: 901px) {
          .cfg-desc-text {
            text-align: justify;
          }
          .cfg-heritage-text {
            text-align: justify;
          }
        }

        /* ═══ RESPONSIVE FIXES ═══ */
        @media (max-width: 900px) {
          .cfg-desc-section {
            padding: 60px 0;
          }
          .cfg-desc-text {
            text-align: justify;
            hyphens: auto;
            -webkit-hyphens: auto;
          }
          .cfg-heritage-text {
            text-align: justify;
            hyphens: auto;
            -webkit-hyphens: auto;
          }
          .cfg-desc-img-wrap {
            width: 100vw;
            margin-top: 30px;
          }
          .cfg-desc-img {
            width: 100% !important;
            max-width: 100% !important;
          }
          .cfg-heritage-section {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .cfg-heritage-right {
            justify-content: flex-start;
          }
        }

        /* GLOBAL: Organic Layered "Aura" Gradients (No 50-50 Split) */
        .section-soft-green .cfg-swiper-section {
          background: 
            radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 80% 70%, rgba(6, 78, 59, 0.2) 0%, transparent 60%),
            #010e0a;
          color: #fff;
        }
        .section-soft-green .cfg-swiper-title { color: #fff; }

        .section-mist-blue .cfg-swiper-section {
          background: 
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 80% 70%, rgba(30, 58, 138, 0.2) 0%, transparent 60%),
            #020617;
          color: #fff;
        }
        .section-mist-blue .cfg-swiper-title { color: #fff; }

        .section-champagne .cfg-swiper-section {
          background: 
            radial-gradient(circle at 20% 30%, rgba(217, 119, 6, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 80% 70%, rgba(69, 26, 3, 0.2) 0%, transparent 60%),
            #0c0501;
          color: #fff;
        }
        .section-champagne .cfg-swiper-title { color: #fff; }

        .section-pearl-silver .cfg-swiper-section {
          background: 
            radial-gradient(circle at 20% 30%, rgba(148, 163, 184, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 80% 70%, rgba(15, 23, 42, 0.2) 0%, transparent 60%),
            #030712;
          color: #fff;
        }
        .section-pearl-silver .cfg-swiper-title { color: #fff; }

        .section-rose-burgundy .cfg-swiper-section {
          background: 
            radial-gradient(circle at 20% 30%, rgba(239, 68, 68, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 80% 70%, rgba(69, 10, 10, 0.2) 0%, transparent 60%),
            #0f0202;
          color: #fff;
        }
        .section-rose-burgundy .cfg-swiper-title { color: #fff; }
        
        .cfg-book-btn {
          background: #1a1a1a;
          color: #fff;
          padding: 12px 24px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          margin-top: 0px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .cfg-book-btn:hover {
          background: #ffffff !important;
          color: #000000 !important;
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255, 255, 255, 0.3);
          border: 1px solid #ffffff;
        }
        .cfg-book-btn svg {
          transition: transform 0.3s;
        }
        .cfg-book-btn:hover svg {
          transform: translateX(5px);
        }

        /* Technical Details Section Styles */
        .cfg-specs-section {
          padding: 20px 0;
          background: #fff;
          color: #1a1a1a;
          position: relative;
        }
        .cfg-specs-container {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
        }
        .cfg-specs-header {
          margin-bottom: 80px;
          padding: 0 8%;
        }
        .cfg-specs-title {
          font-family: 'Outfit', sans-serif;
          font-size: 3rem;
          line-height: 1.1;
          font-weight: 600;
          margin-bottom: 20px;
          color: #1a1a1a;
          letter-spacing: -0.02em;
        }
        .cfg-specs-title span {
          color: #006039;
          display: block;
        }
        .cfg-specs-ref {
          font-size: 1.1rem;
          color: #1a1a1a;
          font-weight: 500;
          opacity: 0.8;
          margin-top: 20px;
        }
        .cfg-specs-grid {
          display: flex;
          flex-direction: column;
          gap: 40px;
          align-items: center;
          width: 100%;
          max-width: 100%;
        }
        .cfg-specs-img-wrap {
          width: 100vw;
          margin: 0;
          display: flex;
          justify-content: center;
        }
        .cfg-specs-img {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 40px 80px rgba(0,0,0,0.12));
        }
        .cfg-spec-accordion {
          border-top: 1px solid #e5e5e5;
          width: 100%;
          max-width: 1000px; /* Optional cap for desktop */
        }
        .cfg-spec-item {
          border-bottom: 1px solid #e5e5e5;
          width: 100%;
        }
        .cfg-spec-trigger {
          width: 100%;
          padding: 15px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.3s;
        }
        .cfg-spec-group-name {
          font-family: 'Outfit', sans-serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: #1a1a1a;
        }
        .cfg-spec-icon {
          width: 14px;
          height: 14px;
          position: relative;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cfg-spec-icon::before,
        .cfg-spec-icon::after {
          content: '';
          position: absolute;
          background: #1a1a1a;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .cfg-spec-icon::before {
          width: 100%;
          height: 2px;
        }
        .cfg-spec-icon::after {
          width: 2px;
          height: 100%;
          transition: transform 0.4s;
        }
        .cfg-spec-item.active .cfg-spec-icon {
          transform: rotate(135deg);
        }
        .cfg-spec-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cfg-spec-item.active .cfg-spec-content {
          max-height: 1200px;
        }
        .cfg-spec-inner {
          padding-bottom: 20px;
        }
        .cfg-spec-row {
          display: flex;
          justify-content: space-between;
          padding: 18px 0;
          font-size: 1.1rem;
          border-bottom: 1px solid #f5f5f5;
        }
        .cfg-spec-row:last-child {
          border-bottom: none;
        }
        .cfg-spec-label {
          color: #1a1a1a;
          font-weight: 600;
          width: 45%;
          word-wrap: break-word;
        }
        .cfg-spec-value {
          color: #444;
          text-align: left;
          width: 50%;
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .cfg-spec-row {
            padding: 15px 0;
          }
          .cfg-spec-label {
            width: 40%;
          }
          .cfg-spec-value {
            width: 55%;
          }
        }

        @media (max-width: 1024px) {
          .cfg-specs-grid {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 0 5%;
          }
          .cfg-specs-title {
            font-size: 1.8rem;
          }
          .cfg-specs-header {
            margin-bottom: 40px;
            padding: 0 5%;
          }
          .cfg-specs-img-wrap {
            position: relative;
            top: 0;
            order: -1;
          }
        }

      `}</style>

      {!hasConfig && (
        <div className={`cfg-top-right-cta ${scrollDir === 'down' && isScrolled ? 'hidden' : ''}`}>
          {product.productType === 'simple' ? (
            <button onClick={handleBookNow} className="cfg-cta-pill">Book Now</button>
          ) : (
            <Link href={`/configure?watch=${product.id}`} className="cfg-cta-pill">Configure</Link>
          )}
        </div>
      )}

      <div className="cfg-page-pagination">
        {['hero', 'description', 'specs', 'heritage'].map((id) => (
          <div
            key={id}
            className={`cfg-pagination-bar ${activeSection === id ? 'active' : ''}`}
            onClick={() => {
              const el = document.getElementById(id);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        ))}
      </div>

      <div className="cfg-content-wrapper">
        {hasConfig && (
          <div className="top-actions">
            <button onClick={() => router.push(`/products`)} className="close-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}

        <section id="hero" className={`cfg-hero ${product.heroBgImage ? 'has-bg-image' : ''}`} ref={heroRef} style={!product.heroBgImage ? { background: product.bgColor || 'radial-gradient(circle at center, #ffffff 0%, #e8edf3 100%)' } : {}}>
          {product.heroBgImage ? (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${getFileUrl(product.heroBgImage)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0
                }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)', zIndex: 1 }} />
            </>
          ) : (
            <div className="cfg-hero-aura"></div>
          )}

          {/* New Focused Visual Container */}
          <div className="cfg-hero-main-visual" style={{ zIndex: 10 }}>
            <div className="cfg-hero-visual-box">
              <img
                src={product.heroImage}
                alt={product.title}
                className="cfg-hero-product-img"
              />
            </div>
          </div>

          {/* Bottom Left Details */}
          <div className="cfg-details-box" style={{ zIndex: 10 }}>
            <div className="cfg-details-left">
              <h1 className="cfg-details-title" style={product.heroBgImage ? { color: '#ffffff' } : {}}>{product.title}</h1>
              <p className="cfg-details-specs" style={product.heroBgImage ? { color: 'rgba(255,255,255,0.8)' } : {}}>{product.subtitle}</p>

              <div className="cfg-price-add-row">
                <div className="cfg-details-price" style={product.heroBgImage ? { color: '#ffffff' } : {}}>
                  ₹ {product.price?.toLocaleString() || '7,838,000'}
                  {/* <div className="cfg-info-icon">i</div> */}
                </div>

                <div className="cfg-actions-group">
                  {hasConfig && (
                    <button 
                      className={`cfg-add-now-btn cfg-book-btn ${isAdded ? 'btn-added' : ''}`} 
                      style={{}} 
                      onClick={handleBookNow}
                    >
                      {isAdded ? 'Added ✓' : 'Add to Cart'}
                    </button>
                  )}
                  {hasConfig && (
                    <div className="cfg-details-right">
                      <div
                        className={`cfg-fav-inline ${isInWishlist(product.currentVariantId || product.variantId) ? 'active' : ''}`}
                        onClick={() => toggleWishlist({ ...product, variantId: product.currentVariantId || product.variantId })}
                        title={isInWishlist(product.currentVariantId || product.variantId) ? 'Remove from Favourite' : 'Add to Favourite'}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={isInWishlist(product.currentVariantId || product.variantId) ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* The image is now a central element, no longer background */}

          {/* Far Right Vertical Nav */}
          {isGeneralMode && (
            <div className="cfg-vert-nav" style={{ zIndex: 10 }}>
              {productsData.map((p, idx) => (
                <div
                  key={p.id}
                  className={`cfg-nav-dash ${initialIndex === idx ? 'active' : ''}`}
                  style={product.discoverHeroBgImage && initialIndex === idx ? { background: '#ffffff' } : product.discoverHeroBgImage ? { background: 'rgba(255,255,255,0.4)' } : {}}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('watch', p.id);
                    router.push(`?${params.toString()}`, { scroll: false });
                  }}
                />
              ))}
            </div>
          )}
        </section>


        {!hasConfig ? (
          <section id="description" className="cfg-desc-section" style={{
            background: product.bgColor || product.gradient || `
              radial-gradient(circle at 10% 10%, rgba(${product.accentRgb}, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 90% 90%, rgba(${product.accentRgb}, 0.1) 0%, transparent 40%),
              linear-gradient(135deg, #000000 0%, #050505 50%, #000000 100%)
            `
          }}>
            <div className="cfg-mist-layer" style={{
              background: `radial-gradient(circle at 70% 40%, rgba(${product.mistRgb}, 0.2) 0%, transparent 70%)`
            }}></div>
            <div className="cfg-desc-content" style={{ position: 'relative', zIndex: 2 }}>
              <h2 className="cfg-desc-heading">Model Stories</h2>
              <p className="cfg-desc-text">{product.longDesc}</p>
            </div>
            <div className="cfg-desc-img-wrap" style={{ position: 'relative', zIndex: 2 }}>
              <img src={product.galleryImages?.[0] || product.heroImage} alt={product.title} className="cfg-desc-img" />
            </div>
          </section>
        ) : (
          <section id="description" className="cfg-desc-section" style={{
            background: product.bgColor || product.gradient || 'radial-gradient(circle at 10% 10%, rgba(255, 45, 117, 0.08) 0%, transparent 40%), linear-gradient(135deg, #ffffff 0%, #fff0f5 100%)'
          }}>
            <div className="cfg-mist-layer" style={{
              background: `radial-gradient(circle at 70% 40%, rgba(${product.mistRgb}, 0.15) 0%, transparent 70%)`
            }}></div>
            <div className="cfg-desc-content" style={{ position: 'relative', zIndex: 2 }}>
              <h2 className="cfg-desc-heading" style={{ color: product.textColor }}>Model Stories</h2>
              <p className="cfg-desc-text" style={{ color: product.textColor }}>
                {product.longDesc}
              </p>
            </div>
            <div className="cfg-desc-img-wrap">
              <img src={product.galleryImages?.[0] || product.heroImage} alt={product.title} className="cfg-desc-img" />
            </div>
          </section>
        )}

        {product.videoUrl && (
          <section className="cfg-video-section">
            <div className="cfg-video-wrap">
              <video
                src={product.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </section>
        )}
        {/* ── TECHNICAL DETAILS SECTION ── */}
        <section id="specs" className="cfg-specs-section">
          <div className="cfg-specs-container">
            <div className="cfg-specs-header">
              <h2 className="cfg-specs-title">
                More {product.title}
                <span>technical details</span>
              </h2>
            </div>

            <div className="cfg-specs-grid">
              <div className="cfg-specs-img-wrap">
                <img src={product.galleryImages?.[1] || product.galleryImages?.[0] || product.heroImage} alt={product.title} className="cfg-specs-img" />
              </div>

              <div className="cfg-spec-accordion">
                {Object.keys(product.specs || {}).map((groupName, idx) => (
                  <div key={groupName} className={`cfg-spec-item ${activeSpecGroup === groupName ? 'active' : ''}`}>
                    <button
                      className="cfg-spec-trigger"
                      onClick={() => setActiveSpecGroup(activeSpecGroup === groupName ? null : groupName)}
                    >
                      <span className="cfg-spec-group-name">{groupName}</span>
                      <div className="cfg-spec-icon"></div>
                    </button>
                    <div className="cfg-spec-content">
                      <div className="cfg-spec-inner">
                        {(product.specs[groupName] || []).map((spec, sIdx) => (
                          <div key={sIdx} className="cfg-spec-row">
                            <span className="cfg-spec-label">{spec.label}</span>
                            <span className="cfg-spec-value">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="heritage" className="cfg-heritage-section">
          <div className="cfg-heritage-left">
            <span className="cfg-heritage-eyebrow">Heritage & Legacy</span>
            <h2 className="cfg-heritage-heading">A Story Written in Time</h2>
            <p className="cfg-heritage-text">{product.heritageText}</p>
          </div>
          <div className="cfg-heritage-right">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'flex-end', width: '100%' }}>
              {product.galleryImages?.[2] && (
                <img
                  src={product.galleryImages[2]}
                  alt="Heritage"
                  style={{ width: '100%', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))' }}
                />
              )}
              <div className="cfg-sold-stats" onClick={() => openInfoModal(product)}>
                <span className="shimmer-sweep"></span>
                <span className="stats-label">Configurations Sold</span>
                <div className="cfg-see-variants">
                  {/* <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg> */}
                  <span>see variants</span>
                  <div className="cfg-info-icon">i</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ═══ ELEGANT LIGHT INFO MODAL ═══ */}
      <div className={`cfg-modal-overlay ${activeModalData ? 'show' : ''}`} onClick={closeInfoModal}>
        <div className="cfg-modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="cfg-modal-header">
            <h3 className="cfg-modal-title">Sold Configurations</h3>
            <button className="cfg-modal-close" onClick={closeInfoModal}>✕</button>
          </div>
          <div className="cfg-modal-content" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
            {activeModalData?.combinations?.length > 0 ? (
              activeModalData.combinations.map((combo) => (
                <div key={combo.id} className="cfg-combo-item" onClick={() => handleComboClick(combo)}>
                  <div className="cfg-combo-img-wrap">
                    <img src={combo.img} alt={`Combo ${combo.id}`} />
                  </div>
                  <div className="cfg-combo-details">
                    <span className="cfg-combo-name">{combo.name}</span>
                    <span className="cfg-combo-status">Exclusive Build</span>
                  </div>
                  <div className="cfg-combo-chevron">&#8250;</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '60px 40px', textAlign: 'center', color: '#888', fontSize: '0.95rem' }}>
                No configurations have been registered yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Discover() {
  return (
    <Suspense fallback={<div>Loading Discovery...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
