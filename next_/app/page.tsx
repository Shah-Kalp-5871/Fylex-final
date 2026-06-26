"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { fetchFeaturedProducts } from '@/lib/api';
import cmsService from '@/services/cms.service';
import { getFileUrl, getDisplayData } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import productsData from '@/data/productsData';
import { ProductSkeleton } from '@/components/ui/Skeleton';

gsap.registerPlugin(ScrollTrigger);

const injectLogo = (text: string) => {
  if (!text) return '';
  return text.replace(/(Fylexx|Fylex|FYLEXX|FYLEX)/gi, '<img src="/fylex.png" alt="$1" style="height: 2.5em; display: inline-block; vertical-align: middle; transform: translateY(-0.1em); filter: invert(1);" />');
};

// ─── DATA ────────────────────────────────────────────────────────────────────

const features = [
  { title: "Carbon Fiber Strap", desc: "Lightweight, tactical, and incredibly durable.", img: "https://www.breitling.com/api/image-proxy/images.ctfassets.net/11yu5j5b14kx/7uDlGm6A8qj2hAOE9D2rgO/bf0a4269ce2d43f76081c48eeed2bfcf/SOH_men_hero_mobile.jpg?im=RegionOfInterestCrop%2Cwidth%3D2001%2Cheight%3D1501%2CregionOfInterest%3D%28400%2C250%29&format=auto" },
  { title: "Kinetic Charging", desc: "Self-winding movement powered by your motion.", img: "https://images.unsplash.com/photo-1517502474097-f9b30659dadb?auto=format&fit=crop&q=80&w=1920" },
  { title: "Modular Calibre", desc: "Precisely engineered parts for easy maintenance.", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Lf9fG1n5h47n0yh_hy_OhrM-6kODEl5Z3w&s" },
  { title: "Super-LumiNova®", desc: "Exceptional glow-in-the-dark visibility.", img: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=1920" },
  { title: "Deployment Clasp", desc: "Maximum security with a single click.", img: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?auto=format&fit=crop&q=80&w=1920" },
  { title: "Precision Rating", desc: "Certified chronometer for absolute accuracy.", img: "https://cdn.shopify.com/s/files/1/0699/3156/5284/files/longines.png?v=1727954696" },
  { title: "Shock Resistant", desc: "Designed to withstand extreme g-forces.", img: "https://images.unsplash.com/photo-1517502474097-f9b30659dadb?auto=format&fit=crop&q=80&w=1920" },
  { title: "Grand Complications", desc: "A masterpiece of mechanical complexity.", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Lf9fG1n5h47n0yh_hy_OhrM-6kODEl5Z3w&s" },
  { title: "Heritage Registry", desc: "Protect your investment with unique serial IDs.", img: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?auto=format&fit=crop&q=80&w=1920" },
  { title: "Ceramic Bezel", desc: "Scratch-resistant finish that never fades.", img: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=1920" },
  { title: "Dual Time Zone", desc: "Effortless GMT function for the global traveler.", img: "https://www.breitling.com/api/image-proxy/images.ctfassets.net/11yu5j5b14kx/7uDlGm6A8qj2hAOE9D2rgO/bf0a4269ce2d43f76081c48eeed2bfcf/SOH_men_hero_mobile.jpg?im=RegionOfInterestCrop%2Cwidth%3D2001%2Cheight%3D1501%2CregionOfInterest%3D%28400%2C250%29&format=auto" },
  { title: "Master Chronometer", desc: "Exceeding the highest standards of horology.", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Lf9fG1n5h47n0yh_hy_OhrM-6kODEl5Z3w&s" },
  { title: "Sapphire Crystal", desc: "Ultra-clear, AR-coated for perfect legibility.", img: "https://cdn.shopify.com/s/files/1/0699/3156/5284/files/longines.png?v=1727954696" },
  { title: "Power Reserve", desc: "Extended energy stored for every journey.", img: "https://images.unsplash.com/photo-1517502474097-f9b30659dadb?auto=format&fit=crop&q=80&w=1920" },
  { title: "Signature Crown", desc: "The final touch of master craftsmanship.", img: "https://www.breitling.com/api/image-proxy/images.ctfassets.net/11yu5j5b14kx/7uDlGm6A8qj2hAOE9D2rgO/bf0a4269ce2d43f76081c48eeed2bfcf/SOH_men_hero_mobile.jpg?im=RegionOfInterestCrop%2Cwidth%3D2001%2Cheight%3D1501%2CregionOfInterest%3D%28400%2C250%29&format=auto" }
];

const gallery = [
  { src: "https://www.breitling.com/api/image-proxy/images.ctfassets.net/11yu5j5b14kx/7uDlGm6A8qj2hAOE9D2rgO/bf0a4269ce2d43f76081c48eeed2bfcf/SOH_men_hero_mobile.jpg?im=RegionOfInterestCrop%2Cwidth%3D2001%2Cheight%3D1501%2CregionOfInterest%3D%28400%2C250%29&format=auto" },
  { src: "https://images.unsplash.com/photo-1517502474097-f9b30659dadb?auto=format&fit=crop&q=80&w=1920" },
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Lf9fG1n5h47n0yh_hy_OhrM-6kODEl5Z3w&s" },
  { src: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=1920" },
  { src: "https://zimsonwatches.com/cdn/shop/articles/Rado_2.png?v=1715152502&width=1100" },
  { src: "https://www.breitling.com/api/image-proxy/images.ctfassets.net/11yu5j5b14kx/7uDlGm6A8qj2hAOE9D2rgO/bf0a4269ce2d43f76081c48eeed2bfcf/SOH_men_hero_mobile.jpg?im=RegionOfInterestCrop%2Cwidth%3D2001%2Cheight%3D1501%2CregionOfInterest%3D%28400%2C250%29&format=auto" },
  { src: "https://images.unsplash.com/photo-1517502474097-f9b30659dadb?auto=format&fit=crop&q=80&w=1920" },
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Lf9fG1n5h47n0yh_hy_OhrM-6kODEl5Z3w&s" },
  { src: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=1920" },
  { src: "https://zimsonwatches.com/cdn/shop/articles/Rado_2.png?v=1715152502&width=1100" },
  { src: "https://www.breitling.com/api/image-proxy/images.ctfassets.net/11yu5j5b14kx/7uDlGm6A8qj2hAOE9D2rgO/bf0a4269ce2d43f76081c48eeed2bfcf/SOH_men_hero_mobile.jpg?im=RegionOfInterestCrop%2Cwidth%3D2001%2Cheight%3D1501%2CregionOfInterest%3D%28400%2C250%29&format=auto" },
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Lf9fG1n5h47n0yh_hy_OhrM-6kODEl5Z3w&s" },
  { src: "https://images.unsplash.com/photo-1517502474097-f9b30659dadb?auto=format&fit=crop&q=80&w=1920" },
  { src: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=1920" },
  { src: "https://zimsonwatches.com/cdn/shop/articles/Rado_2.png?v=1715152502&width=1100" },
  { src: "https://www.breitling.com/api/image-proxy/images.ctfassets.net/11yu5j5b14kx/7uDlGm6A8qj2hAOE9D2rgO/bf0a4269ce2d43f76081c48eeed2bfcf/SOH_men_hero_mobile.jpg?im=RegionOfInterestCrop%2Cwidth%3D2001%2Cheight%3D1501%2CregionOfInterest%3D%28400%2C250%29&format=auto" },
  { src: "https://images.unsplash.com/photo-1517502474097-f9b30659dadb?auto=format&fit=crop&q=80&w=1920" },
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Lf9fG1n5h47n0yh_hy_OhrM-6kODEl5Z3w&s" },
  { src: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=1920" },
  { src: "https://zimsonwatches.com/cdn/shop/articles/Rado_2.png?v=1715152502&width=1100" },
  { src: "https://www.breitling.com/api/image-proxy/images.ctfassets.net/11yu5j5b14kx/7uDlGm6A8qj2hAOE9D2rgO/bf0a4269ce2d43f76081c48eeed2bfcf/SOH_men_hero_mobile.jpg?im=RegionOfInterestCrop%2Cwidth%3D2001%2Cheight%3D1501%2CregionOfInterest%3D%28400%2C250%29&format=auto" },
  { src: "https://images.unsplash.com/photo-1517502474097-f9b30659dadb?auto=format&fit=crop&q=80&w=1920" }
];

// ─── DATA ────────────────────────────────────────────────────────────────────

// ─── GALLERY HELPERS ─────────────────────────────────────────────────────────

function buildGalleryColumns(items: any[]) {
  const cols = [];
  let idx = 0;
  let big = true;
  while (idx < items.length) {
    const size = big ? 3 : 2;
    const col = items.slice(idx, idx + size);
    if (col.length) cols.push(col);
    idx += size;
    big = !big;
  }
  return cols;
}

// ─── GALLERY CAROUSEL COMPONENT ──────────────────────────────────────────────

const GalleryCarousel = ({ items }: { items?: any[] }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef<number>(0);
  const velRef = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragStartPos = useRef<number>(0);
  const lastDragX = useRef<number>(0);
  const lastDragTime = useRef<number>(0);
  const halfWidthRef = useRef<number>(0);
  const AUTO_SPEED = 0.6; // px per frame

  // Measure half-width after render
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        halfWidthRef.current = trackRef.current.scrollWidth / 2;
      }
    };
    // Two rAFs to ensure layout is complete
    requestAnimationFrame(() => requestAnimationFrame(measure));
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // RAF animation loop
  const tick = useCallback(() => {
    const half = halfWidthRef.current;

    if (!isDragging.current) {
      velRef.current *= 0.92;
      if (Math.abs(velRef.current) < 0.05) velRef.current = 0;
    }

    posRef.current -= (AUTO_SPEED + Math.max(0, velRef.current));

    // Seamless loop reset
    if (half > 0 && Math.abs(posRef.current) >= half) {
      posRef.current += half;
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [tick]);

  // Pointer handlers
  const onPointerDown = useCallback((e: React.PointerEvent | React.TouchEvent | any) => {
    isDragging.current = true;
    const clientX = 'clientX' in e ? e.clientX : (e as React.TouchEvent).touches?.[0]?.clientX ?? 0;
    dragStartX.current = clientX;
    dragStartPos.current = posRef.current;
    lastDragX.current = clientX;
    lastDragTime.current = performance.now();
    velRef.current = 0;
    if ((e as React.PointerEvent).pointerId != null) {
      (trackRef.current as any)?.setPointerCapture?.((e as React.PointerEvent).pointerId);
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent | React.TouchEvent | any) => {
    if (!isDragging.current) return;
    const clientX = 'clientX' in e ? e.clientX : (e as React.TouchEvent).touches?.[0]?.clientX ?? 0;
    const delta = clientX - dragStartX.current;

    // Left-only drag: clamp to negative delta
    const clampedDelta = Math.min(0, delta);
    posRef.current = dragStartPos.current + clampedDelta;

    const now = performance.now();
    const dt = now - lastDragTime.current;
    if (dt > 0) {
      // velocity in px/frame (positive = moving left)
      const rawVel = ((lastDragX.current - clientX) / dt) * (1000 / 60);
      velRef.current = Math.max(0, rawVel);
    }
    lastDragX.current = clientX;
    lastDragTime.current = now;
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Guarantee visual stability: pad items to complete the 3-2-3 grid pattern & cover screen width
  const sourceItems = items && items.length > 0 ? items : gallery;
  let safeItems = [...sourceItems];

  // 1. Must be at least as long as the original gallery to overflow standard screens and prevent gaps
  while (safeItems.length < gallery.length) {
    safeItems = [...safeItems, ...sourceItems];
  }

  // 2. Must end cleanly on a grid cycle (length % 5 === 0 or length % 5 === 3)
  while (safeItems.length % 5 !== 0 && safeItems.length % 5 !== 3) {
    safeItems.push(sourceItems[safeItems.length % sourceItems.length]);
  }

  const cols = buildGalleryColumns(safeItems);
  // Duplicate for seamless infinite loop
  const allCols = [...cols, ...cols];

  return (
    <div
      className="fylex-gallery-viewport"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onTouchStart={(e) => onPointerDown({ clientX: e.touches[0].clientX })}
      onTouchMove={(e) => onPointerMove({ clientX: e.touches[0].clientX })}
      onTouchEnd={onPointerUp}
    >
      <div className="fylex-gallery-track" ref={trackRef}>
        {allCols.map((col, ci) => (
          <div className="fylex-gallery-col" key={ci}>
            {col.map((g, i) => (
              <div
                className="fylex-gallery-item"
                key={i}
              >
                <img src={g.src} alt={g.alt || 'Atelier'} draggable={false} />
                <div className="fylex-overlay" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// ─── MAIN HOME COMPONENT ──────────────────────────────────────────────────────

// getImageUrl removed in favor of centralized getFileUrl

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [flipValue, setFlipValue] = useState(246308291);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const [videoSettings, setVideoSettings] = useState<any>({});
  const [homeSections, setHomeSections] = useState<Record<string, boolean>>({});
  const [loadingHomeSections, setLoadingHomeSections] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [communityImages, setCommunityImages] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const res = await fetchFeaturedProducts();
      const data = res.data || res || [];
      setFeaturedProducts(Array.isArray(data) ? data : []);
      setLoadingFeatured(false);

      try {
        const { data: bData } = await cmsService.getBanners();
        setBanners(Array.isArray(bData) ? bData : []);
      } catch (err) {
        console.error("Failed to load banners", err);
      }

      try {
        const { data: settings } = await cmsService.getVideoSettings();
        if (settings) {
          const videoMap: Record<string, any> = {};
          settings.forEach((s: any) => {
            if (s.group === 'video') videoMap[s.key] = s.value;
          });
          setVideoSettings(videoMap);
        }
      } catch (err) {
        console.error("Failed to load video settings", err);
      }

      try {
        const { data: hSections } = await cmsService.getHomeSections();
        if (hSections && hSections.length > 0) {
          const sectionMap: Record<string, boolean> = {};
          hSections.forEach((s: any) => {
            sectionMap[s.type] = s.status === true || s.status === 'true' || s.status === 1 || s.status === '1';
          });
          setHomeSections(sectionMap);
          // Refresh ScrollTrigger after a short delay to allow DOM to settle
          setTimeout(() => ScrollTrigger.refresh(), 100);
        }
      } catch (err) {
        console.error("Failed to load home sections", err);
      } finally {
        setLoadingHomeSections(false);
      }

      try {
        const { data: cImages } = await cmsService.getCommunityImages();
        if (cImages && Array.isArray(cImages) && cImages.length > 0) {
          setCommunityImages(cImages.map((img: any) => ({
            src: img.image?.startsWith('http') ? img.image : getFileUrl(img.image),
            alt: img.title || 'Atelier'
          })));
        }
      } catch (err) {
        console.error('Failed to load community images', err);
      }
    };
    loadData();

  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Section refs for potential future use or ScrollTrigger targeting if needed
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const galleryRef = useRef(null);
  const containerRef = useRef(null);

  // Scroll handling removed as we now use ScrollTrigger and Lenis

  // ── Flip counter ─────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setFlipValue(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Section navigation helpers removed


  // ── ScrollTrigger setup ────────────────────────────────────────
  useEffect(() => {
    // Reveal cards on scroll
    const sections = gsap.utils.toArray('.section');
    sections.forEach((section: any) => {
      const card = section.querySelector('.card');
      if (card) {
        ScrollTrigger.create({
          trigger: section,
          start: "top 60%",
          end: "bottom 30%",
          onEnter: () => card.classList.add('in'),
          onEnterBack: () => card.classList.add('in'),
          onLeave: () => card.classList.remove('in'),
          onLeaveBack: () => card.classList.remove('in')
        });
      }
    });

    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [homeSections]);

  // Features focal-point animation removed as the section is currently inactive

  // ── FlipDigit sub-component ───────────────────────────────────
  const FlipDigit = ({ digit }: { digit: any }) => {
    const [prevDigit, setPrevDigit] = useState(digit);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      if (digit !== prevDigit) {
        setIsAnimating(true);
        const timer = setTimeout(() => {
          setPrevDigit(digit);
          setIsAnimating(false);
        }, 350);
        return () => clearTimeout(timer);
      }
    }, [digit, prevDigit]);

    return (
      <div className="flip-digit">
        <div className="flip-top">{isAnimating ? digit : prevDigit}</div>
        <div className="flip-bottom">{isAnimating ? digit : prevDigit}</div>
        <div className={`flip-flap ${isAnimating ? 'animate' : ''}`} data-next={digit}>
          {isAnimating ? prevDigit : digit}
        </div>
      </div>
    );
  };

  const renderFlipCounter = () => {
    const str = String(flipValue).padStart(9, '0');
    const groups = [str.slice(0, 3), str.slice(3, 6), str.slice(6, 9)];
    return (
      <div className="flip-digits">
        {groups.map((group, gi) => (
          <div className="flip-group" key={gi}>
            {[...group].map((d, di) => (
              <FlipDigit key={gi * 3 + di} digit={d} />
            ))}
          </div>
        ))}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────
  const section2Banner = banners.find(b => b.position === 'Section 2');
  const section3Banner = banners.find(b => b.position === 'Section 3');

  return (
    <div className="v1-home" ref={containerRef}>
      <style>{`
        .v1-home { background: #F9F9F7; }

        /* ── Hero sections ── */
        .section {
          height: 100svh; min-height: 500px; width: 100%;
          background-attachment: fixed; background-size: cover; background-position: center;
          display: flex; align-items: center; justify-content: center;
          padding-left: 0;
          position: relative; overflow: hidden;
        }
        .section::before { content: ''; position: absolute; inset: 0; z-index: 0; }
        .s1::before { background: linear-gradient(135deg, rgba(10,8,4,0), rgba(40,28,10,.40)); }
        .s2::before { background: linear-gradient(160deg, rgba(6,4,1,0), rgba(22,14,4,0)); }
        .s1::after, .s4::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4));
          z-index: 1;
        }

        /* ── Featured Grid Section ── */
        .featured-title {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 400; 
          color: #111;
          letter-spacing: 0.03em;
          margin: 0;
        }
        .featured-title em {
          font-style: italic;
          color: #d4af37;
        }
        .featured-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #8A8A8A;
          margin-bottom: 8px;
        }
        .featured-grid-wrap {
          display: flex; flex-direction: column;
          padding: 40px 0 0 !important;
          margin: 0 auto !important;
          width: 100%;
          max-width: 1920px;
          height: 100vh;
          min-height: 800px;
          border-radius: 0;
          overflow: hidden;
          box-sizing: border-box;
          background: #fff;
        }
        .featured-grid-header { 
          padding: 0 4% 2rem; 
          text-align: center;
          width: 100%;
        }
        .featured-container {
          width: 100%;
          flex: 1;
          display: block;
          position: relative;
          overflow: hidden;
        }
        .featured-swiper {
          width: 100%;
          height: 100%;
        }
        .featured-item-v2 {
          position: relative; overflow: hidden;
          background: #f5f5f5;
          height: 100%;
          width: 100%;
        }
        .featured-item-v2 img {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%; object-fit: contain;
          padding: 30px;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .featured-item-v2:hover img { transform: scale(1.04); }
        
        .featured-overlay-grad {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%);
          z-index: 1;
        }

        .featured-content {
          position: absolute; bottom: 80px; left: 48px;
          z-index: 2; color: #fff;
          max-width: 80%;
        }
        .f-label {
          font-family: 'Inter', sans-serif; font-size: 0.85rem;
          font-weight: 500;
          opacity: 0.9;
        }
        .f-title {
          font-family: 'Inter', sans-serif; font-size: 1.6rem;
          font-weight: 600;
          line-height: 1.2;
        }
        .f-shop-btn {
          background: #1a1a1a; color: #fff !important;
          padding: 8px 16px; border-radius: 999px;
          font-size: 10px; font-weight: 700;
          text-decoration: none; border: 1px solid #1a1a1a; cursor: pointer;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          display: inline-block;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .f-shop-btn:hover, .f-shop-btn:active { 
          background: #ffffff !important; 
          color: #000000 !important;
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        /* Custom Swiper Pagination */
        .featured-swiper .swiper-pagination {
          position: absolute !important;
          bottom: 20px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: auto !important;
          z-index: 10;
          display: flex !important;
          justify-content: center;
          gap: 12px;
        }
        .featured-swiper .swiper-pagination-bullet {
          width: 40px;
          height: 4px;
          background: #d1d5db; /* gray-300 */
          border-radius: 2px;
          opacity: 1;
          margin: 0 !important;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .featured-swiper .swiper-pagination-bullet-active {
          width: 100px;
          background: #1a1a1a;
        }

        /* Featured Grid mobile overrides */
        @media (max-width: 768px) {
          .featured-grid-wrap { 
            padding: 0 !important; 
            margin: 0 !important; 
            width: 100%; height: auto;
            min-height: 60vh;
            border-radius: 0;
          }
          .featured-grid-header { padding: 40px 24px 24px; text-align: center; }
          .featured-title { font-size: 2.2rem; }
          .featured-container { display: block; }
          .featured-item-v2 { height: 60vh; border-radius: 0; }
          .featured-content { bottom: 80px; left: 24px; }
          .featured-swiper .swiper-pagination { bottom: 20px !important; }
          
        }

        .s3 { background-image: url('/Watch_1.png'); }
        .s1, .s4 { padding: 0 !important; overflow: hidden; position: relative; }

        /* ── Video container ── */
        .iframe-container, .video-container {
          position: absolute; top: 50%; left: 50%;
          width: 100vw; height: 100vh;
          transform: translate(-50%, -50%);
          pointer-events: none; overflow: hidden;
        }
        .iframe-container iframe, .video-container video {
          position: absolute; top: 50%; left: 50%;
          min-width: 100%; min-height: 100%;
          width: auto; height: auto;
          transform: translate(-50%, -50%);
          object-fit: cover;
        }
        .iframe-container {
          height: 56.25vw;
          min-height: 100vh;
          min-width: 177.77vh;
        }

        /* ── Hero center overlay ── */
        .hero-center {
          position: absolute; inset: 0; z-index: 10;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 0 40px;
        }
        .hero-title {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2rem, 5vw, 3rem) !important;
          font-weight: 300; color: #2D2D2D;
          margin-bottom: 0.5rem; letter-spacing: 0.1em;
        }
        .hero-subtitle {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2.5rem, 8vw, 6rem) !important;
          font-weight: 400; color: #1A1A1A;
          margin-bottom: 2.5rem; line-height: 1;
        }
        .cta-button {
          background: #1a1a1a;
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          color: #fff; padding: 8px 16px;
          border-radius: 999px; font-size: 10px;
          font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.15em;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .cta-button:hover, .cta-button:active {
          background: #ffffff !important;
          color: #000000 !important;
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        /* ── Story cards ── */
        .card {
          position: relative; z-index: 1; text-align: center;
          padding: clamp(32px, 6vw, 64px) 24px;
          max-width: min(640px, 92vw); width: 100%;
          opacity: 0; transform: translateX(-30px);
          transition: opacity 0.7s cubic-bezier(0.2,0,0.2,1),
                      transform 0.7s cubic-bezier(0.2,0,0.2,1);
          margin: 0 auto;
        }
        .card.in { opacity: 1; transform: translateX(0); }
        .card h1 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2rem, 7vw, 5.2rem);
          font-weight: 300; line-height: 1.1;
          letter-spacing: .04em; color: var(--cream);
          margin-bottom: 22px;
        }
        .card h1 em { font-style: italic; color: var(--gold-light); }
        .card p {
          font-size: clamp(0.65rem, 2vw, 0.78rem);
          font-weight: 300; letter-spacing: .12em;
          line-height: 1.9; color: rgba(245,240,232,.75);
          text-transform: uppercase;
        }

        /* ── Features section ── */
        .features-wrapper {
          height: 100svh; display: flex;
          align-items: center; justify-content: center;
          background: #F9F9F7;
        }
        .features-section {
          display: grid; grid-template-columns: 1fr 1fr;
          width: 90%; height: 80vh;
          border-radius: var(--curve);
          border: 1px solid rgba(0,0,0,0.08);
          overflow: hidden; background: #FFFFFF;
          backdrop-filter: blur(14px); position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.06);
        }
        .features-left {
          padding: 60px; border-right: 1px solid rgba(0,0,0,0.06);
          height: 100%; overflow: hidden; position: relative;
        }
        .feature-items-inner {
          position: absolute; top: 0; left: 0; width: 100%;
          padding: 60px; display: flex; flex-direction: column;
        }
        .feature-item {
          padding: 40px 0; border-bottom: 1px solid rgba(0,0,0,0.06);
          cursor: pointer; transition: all 0.4s; opacity: 0.2;
          padding-left: 20px; position: relative;
        }
        .feature-item.active { opacity: 1; }
        .feature-item h3 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(1.2rem, 2.5vw, 2.2rem); color: #111111;
        }
        .features-right { position: relative; height: 100%; overflow: hidden; }
        .image-stack img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; opacity: 0;
          transition: opacity 0.6s, transform 0.8s;
          transform: scale(1.05);
        }
        .image-stack img.active { opacity: 1; transform: scale(1); }

        /* ── Section 5 ── */
        .s5 { background-image: none !important; }

        /* ── Flip counter ── */
        .flip-counter-section {
          background: #F2F2EE;
          border-top: 1px solid rgba(0,0,0,0.06);
          padding: 80px 20px;
          display: flex; justify-content: center; align-items: center;
        }
        .flip-digit {
          position: relative; width: 56px; height: 76px;
          background: var(--navy); border-radius: 8px; overflow: hidden;
        }
        .flip-top, .flip-bottom, .flip-flap {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 2.4rem; font-weight: 700; color: #fff;
        }
        .flip-top  { clip-path: inset(0 0 50% 0); }
        .flip-bottom { clip-path: inset(50% 0 0 0); background: #152238; color: #ddd; }
        .flip-flap {
          clip-path: inset(0 0 50% 0); background: var(--navy);
          transform-origin: center; z-index: 3;
          backface-visibility: hidden; transform-style: preserve-3d;
        }
        .flip-flap.animate { animation: flipDown 0.35s forwards; }
        @keyframes flipDown { to { transform: rotateX(-180deg); } }
        .flip-flap::after {
          content: attr(data-next); position: absolute; inset: 0;
          background: #152238; color: #ddd;
          display: flex; justify-content: center; align-items: center;
          transform: rotateX(180deg); backface-visibility: hidden;
          clip-path: inset(50% 0 0 0);
        }
        .flip-digits { display: flex; gap: 4px; }
        .flip-group  { display: flex; gap: 4px; }
        .flip-group + .flip-group { margin-left: 8px; position: relative; }
        .flip-group + .flip-group::before {
          content: ''; position: absolute; left: -6px;
          top: 10%; height: 80%; width: 1px;
          background: rgba(0,0,0,0.1);
        }

        /* ── Gallery (new RAFmarquee) ── */
        .fylex-gallery-section {
          padding: 80px 0 60px;
          background: #F9F9F7;
          border-top: 1px solid rgba(0,0,0,0.06);
          border-radius: var(--curve, 24px) var(--curve, 24px) 0 0;
          overflow: hidden;
        }
        .fylex-gallery-header {
          text-align: center;
          margin-bottom: 52px;
          padding: 0 40px;
        }
        .fylex-gallery-header h2 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 400; color: #111111;
          letter-spacing: 0.03em; margin: 0 0 12px;
        }
        .fylex-gallery-header p {
          color: #8A8A8A; font-size: 0.75rem;
          text-transform: uppercase; letter-spacing: 0.15em;
        }
        .fylex-gallery-viewport {
          width: 100%; overflow: hidden;
          cursor: grab; user-select: none;
          -webkit-user-select: none;
          touch-action: pan-y;
          padding: 20px 0 32px;
        }
        .fylex-gallery-viewport:active { cursor: grabbing; }
        .fylex-gallery-track {
          display: flex; gap: 16px;
          width: max-content;
          will-change: transform;
        }
        .fylex-gallery-col {
          display: flex; flex-direction: column;
          gap: 16px; width: 240px;
          flex-shrink: 0; align-self: center;
        }
        .fylex-gallery-item {
          position: relative; border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 8px 24px rgba(0,0,0,0.05);
          transition: transform 0.4s cubic-bezier(0.165,0.84,0.44,1),
                      box-shadow 0.4s cubic-bezier(0.165,0.84,0.44,1);
          background: #eee;
        }
        .fylex-gallery-item img {
          width: 100%; display: block;
          transition: transform 0.7s cubic-bezier(0.165,0.84,0.44,1);
          pointer-events: none; -webkit-user-drag: none;
        }
        .fylex-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.28), transparent);
          opacity: 0; transition: opacity 0.35s;
        }
        .fylex-gallery-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 44px rgba(0,0,0,0.10);
        }
        .fylex-gallery-item:hover img { transform: scale(1.06); }
        .fylex-gallery-item:hover .fylex-overlay { opacity: 1; }

        /* ── Mobile overrides ── */
        @media (max-width: 768px) {
          .features-wrapper {
            height: 100svh; width: 100%;
            display: flex; align-items: center; justify-content: center;
            background: #F9F9F7; position: relative;
          }
          .features-section {
            display: flex; flex-direction: column;
            height: 700px; width: 92vw;
            border-radius: var(--curve-sm); position: relative;
            margin-top: 60px;
          }
          .features-left {
            border-right: none; flex: 1; padding: 30px 20px;
            overflow: hidden; position: relative;
          }
          .feature-items-inner {
            padding: 0 20px; top: 0; position: absolute; width: 100%;
            transition: transform 0.6s cubic-bezier(0.23,1,0.32,1);
          }
          .feature-item { padding: 30px 0; border-bottom: 1px solid rgba(0,0,0,0.06); }
          .feature-item h3 { font-size: 1.4rem; }
          .feature-item p { font-size: 0.8rem; line-height: 1.6; }
          .features-right {
            position: absolute; bottom: 25px; right: 25px;
            width: 150px; height: 150px; z-index: 50; pointer-events: none;
          }
          .image-stack { width: 150px; height: 150px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 15px 40px rgba(0,0,0,0.12); }
          .image-stack img { width: 100%; height: 100%; object-fit: cover; }
          .feature-counter { position: absolute; bottom: -30px; right: 0; font-size: 0.65rem; color: var(--gold); font-weight: 500; }
          /* Gallery mobile */
          .fylex-gallery-section { padding: 60px 0 40px; }
          .fylex-gallery-col { width: 160px; }
          .fylex-gallery-track { gap: 10px; }
          /* Flip counter mobile */
          .flip-digit { width: 32px; height: 48px; border-radius: 4px; }
          .flip-top, .flip-bottom, .flip-flap { font-size: 1.4rem; }
          .flip-digits { gap: 2px; }
          .flip-group + .flip-group::before { left: -4px; }
        }
      `}</style>

      {loadingHomeSections ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
          {/* Subtle minimal loader */}
          <div style={{ width: 40, height: 40, border: '2px solid #f3f3f3', borderTop: '2px solid #111', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* ── Hero Section 1 ── */}
          {homeSections.s1 && (
            <div className="section s1" ref={el => { sectionsRef.current[0] = el; }}>
              <div className="video-container">
                <video
                  src={getFileUrl(videoSettings.home_hero_video) || "/assets/Fylexxx.mp4"}
                  autoPlay muted loop playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="hero-center">
                <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: videoSettings.home_hero_video_title || "FYLEX" }} />
                <p className="hero-subtitle">{videoSettings.home_hero_video_subtitle || "Wear Your Choice."}</p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                  <Link href="/products">
                    <button className="cta-button">Explore</button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Hero Section 2 ── */}
          {homeSections.s2 && (
            <div
              className="section s2"
              style={{ backgroundImage: `url('${section2Banner?.image ? getFileUrl(section2Banner.image) : '/Rim.png'}')` }}
              ref={el => { sectionsRef.current[1] = el; }}
            >
              <div className="card" style={section2Banner?.textColor ? { color: section2Banner.textColor } : {}}>
                <div className="label" style={section2Banner?.textColor ? { color: section2Banner.textColor } : {}}>{section2Banner?.subtitle || 'II · Movement'}</div>
                <h1 style={section2Banner?.textColor ? { color: section2Banner.textColor } : {}} dangerouslySetInnerHTML={{ __html: section2Banner?.title || 'The <em>Heart</em> Within' }} />
                <div className="divider"></div>
                <p style={section2Banner?.textColor ? { color: section2Banner.textColor } : {}} dangerouslySetInnerHTML={{ __html: section2Banner?.content || 'Hundreds of hand-finished bridges and jewels.<br />A calibre beating 28,800 times each hour.' }} />
              </div>
            </div>
          )}

          {/* ── Hero Section 3 ── */}
          {homeSections.s3 && (
            <div
              className="section s3"
              style={{ backgroundImage: `url('${section3Banner?.image ? getFileUrl(section3Banner.image) : '/Watch_1.png'}')` }}
              ref={el => { sectionsRef.current[2] = el; }}
            >
              <div className="card" style={section3Banner?.textColor ? { color: section3Banner.textColor } : {}}>
                <div className="label" style={section3Banner?.textColor ? { color: section3Banner.textColor } : {}}>{section3Banner?.subtitle || 'III · Design'}</div>
                <h1 style={section3Banner?.textColor ? { color: section3Banner.textColor } : {}} dangerouslySetInnerHTML={{ __html: section3Banner?.title || 'Form Follows <em>Time</em>' }} />
                <div className="divider"></div>
                <p style={section3Banner?.textColor ? { color: section3Banner.textColor } : {}} dangerouslySetInnerHTML={{ __html: section3Banner?.content || 'Sapphire crystal, polished steel, supple leather.<br />Every element chosen for eternity, not fashion.' }} />
              </div>
            </div>
          )}

          {/* ── Hero Section 4 (video) ── */}
          {homeSections.s4 && (
            <div className="section s4" ref={el => { sectionsRef.current[3] = el; }}>
              <div className="video-container">
                <video
                  src={getFileUrl(videoSettings.home_legacy_video) || "/assets/Fylexx.mp4"}
                  autoPlay muted loop playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="card" style={{ zIndex: 10 }}>
                <h1 dangerouslySetInnerHTML={{ __html: (videoSettings.home_legacy_video_title || "Not Everyone Follows The Same Path.").replace(/Same Path\./g, '<em>Same Path.</em>') }}></h1>
                <p className="legacy-text" dangerouslySetInnerHTML={{ __html: videoSettings.home_legacy_video_subtitle || "Different Ambitions. Different Routines. Different Stories." }}></p>
                <div style={{ marginTop: '40px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>
                  IT'S YOUR TIME.
                </div>
              </div>
            </div>
          )}



          {/* ── Hero Section 6 (Featured Grid) ── */}
          {homeSections.featured && (
            <div className="section featured-grid-wrap s5" ref={el => { sectionsRef.current[5] = el; }}>
              <div className="featured-grid-header">
                <p className="featured-subtitle">Curated Collection</p>
                <h2 className="featured-title"><em>Featured</em> Timepieces</h2>
              </div>
              <div className="featured-container">
                {loadingFeatured ? (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', height: '100%', width: '100%' }}>
                    <ProductSkeleton />
                    {!isMobile && <ProductSkeleton />}
                  </div>
                ) : (
                  <>
                    <Swiper
                      modules={[Autoplay, Pagination]}
                      spaceBetween={0}
                      slidesPerView={isMobile ? 1 : 2}
                      autoplay={{ delay: 5000, disableOnInteraction: false }}
                      pagination={{
                        clickable: true,
                        dynamicBullets: false
                      }}
                      loop={featuredProducts.length >= (isMobile ? 1 : 2)}
                      className="featured-swiper"
                    >
                      {featuredProducts.map((p) => {
                        const display = getDisplayData(p);

                        return (
                          <SwiperSlide key={p.id}>
                            <div className="featured-item-v2" style={{ background: p.gradient || p.bgColor || '#f5f5f5' }}>
                              {display.image && (
                                <img
                                  src={display.image}
                                  alt={display.name}
                                  style={{ position: 'absolute', top: '-40px', left: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }}
                                />
                              )}
                              <div className="featured-content" style={{ color: p.textColor || '#111', zIndex: 2 }}>
                                <div className="f-label" style={{ color: p.accentColor || '#666' }}>{p.subtitle || p.tagline}</div>
                                <div className="f-title" style={{ color: 'inherit' }}>{display.name} <em>{p.titleAccent || ''}</em></div>
                                <div className="f-price" style={{ margin: '4px 0 14px', fontSize: '1.1rem', fontWeight: 500 }}>
                                  {display.isConfigurable ? 'From ' : ''}{display.formattedPrice}
                                </div>
                                <Link href={`/discover?watch=${p.id}`} className="f-shop-btn">Shop</Link>
                              </div>
                            </div>
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Features Section (commented-out in original, preserved here) ── */}
          {/* <div className="features-wrapper" id="featuresWrapper" ref={featuresRef}>
        <section className="features-section" id="features">
          <div className="features-left" ref={featureListRef}>
            <div className="feature-items-inner" ref={featureInnerRef}>
              {features.map((f, i) => (
                <div key={i} className={`feature-item ${i === currentFeat ? 'active' : ''}`} onClick={() => setCurrentFeat(i)}>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="features-right">
            <div className="image-stack">
              {features.map((f, i) => (
                <img key={i} src={f.img} alt={f.title} className={i === currentFeat ? 'active' : ''} />
              ))}
            </div>
            <div className="feature-counter">
              <span>{String(currentFeat + 1).padStart(2, '0')}</span> / {String(features.length).padStart(2, '0')}
            </div>
          </div>
        </section>
      </div> */}

          {/* ── Gallery Section (new smooth RAF marquee) ── */}
          {homeSections.gallery && (
            <div ref={galleryRef}>
              <section className="fylex-gallery-section" id="gallery">
                <div className="fylex-gallery-header">
                  <h2 dangerouslySetInnerHTML={{ __html: injectLogo("The FYLEX World.") }} />
                </div>
                <GalleryCarousel items={communityImages.length > 0 ? communityImages : gallery} />
              </section>
            </div>
          )}

          {/* ── Flip Counter Section ── */}
          {/* {homeSections.counter && (
        <section className="flip-counter-section">
          <div className="flip-counter-wrapper">
            {renderFlipCounter()}
            <p style={{
              marginTop: '24px', fontSize: '1rem', color: '#555555',
              textTransform: 'uppercase', textAlign: 'center'
            }}>
              Seconds of watchmaking excellence
            </p>
          </div>
        </section>
      )} */}
        </>
      )}

      {/* ── Lightbox ── */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-10 right-10 text-gold border border-gold-dim w-12 h-12 rounded-full flex items-center justify-center hover:bg-gold hover:text-dark transition-all"
            onClick={() => setLightboxImg(null)}
          >
            ✕
          </button>
          <img
            src={lightboxImg}
            alt="Lightbox"
            className="max-w-[90vw] max-h-[85vh] object-contain border border-gold-dim rounded"
          />
        </div>
      )}
    </div>
  );
};

export default Home;
