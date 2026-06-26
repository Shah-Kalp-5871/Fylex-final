"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { fetchProducts } from '../../../lib/api';
import { getFileUrl, resolveProductImage, getDisplayData } from '@/lib/utils';
import cmsService from '@/services/cms.service';

const Products = () => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [scrollDir, setScrollDir] = useState('up');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModalData, setActiveModalData] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoSettings, setVideoSettings] = useState({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetchProducts();
        const rawData = res.data || (Array.isArray(res) ? res : []);

        const hexToRgb = (hex) => {
          if (!hex) return '196, 163, 90';
          const cleanHex = hex.replace('#', '');
          const r = parseInt(cleanHex.substring(0, 2), 16);
          const g = parseInt(cleanHex.substring(2, 4), 16);
          const b = parseInt(cleanHex.substring(4, 6), 16);
          return `${r}, ${g}, ${b}`;
        };

        const mapped = rawData.map((p, idx) => {
          const display = getDisplayData(p);

          // Flatten orderItems into individual "sold cards"
          const soldCards = [];
          let globalIdx = 1;
          (p.orderItems || []).forEach(item => {
            const variant = item.productVariant;
            for (let i = 0; i < item.quantity; i++) {
              const vDisplay = getDisplayData(p, variant);
              soldCards.push({
                id: globalIdx++,
                orderId: item.orderId?.toString(),
                name: vDisplay.subtitle || vDisplay.name,
                img: vDisplay.image,
                soldAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
                sku: item.sku
              });
            }
          });

          return {
            id: p.id.toString(),
            num: String(idx + 1).padStart(2, '0'),
            title: display.name,
            titleAccent: '',
            subtitle: p.subtitle || 'Luxury Collection',
            tagline: p.tagline || '',
            description: p.description || p.shortDescription || '',
            image: display.image,
            price: display.formattedPrice,
            totalStock: p.qty || 0,
            sold: p.soldCount || 0,
            theme: p.theme || 'champagne',
            bgColor: p.bgColor || '#ffffff',
            accentColor: p.accentColor || '#c4a35a',
            accentRgb: hexToRgb(p.accentColor || '#c4a35a'),
            textColor: p.textColor || '#1a1a1a',
            gradient: p.gradient || '',
            mistColor: p.mistColor || '',
            mistRgb: hexToRgb(p.mistColor || p.accentColor || '#c4a35a'),
            combinations: soldCards
          };
        });
        setCollections(mapped);

        const { data: settings } = await cmsService.getVideoSettings();
        if (settings) {
          const videoMap = {};
          settings.forEach(s => {
            if (s.group === 'video') videoMap[s.key] = s.value;
          });
          setVideoSettings(videoMap);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 60);

      if (currentScrollY > 60 && currentScrollY > lastScrollY) {
        setScrollDir('down');
      } else {
        setScrollDir('up');
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openInfoModal = (col) => {
    const templates = col.combinations || [];
    setActiveModalData({ ...col, combinations: templates });
  };
  const closeInfoModal = () => setActiveModalData(null);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Collections...</div>;

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', textAlign: 'center', padding: '0 20px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#dc2626', fontFamily: "'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif" }}>Connectivity Issue</h2>
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 30px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: '600' }}>Retry Connection</button>
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', textAlign: 'center', padding: '0 20px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: "'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif" }}>Our Collection is Evolving</h2>
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>We are currently updating our timepiece inventory. Please check back shortly for our latest masterpieces.</p>
          <Link href="/" style={{ padding: '12px 30px', background: '#1a1a1a', color: '#fff', textDecoration: 'none', borderRadius: '999px', fontSize: '0.9rem', fontWeight: '600' }}>← Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <style>{`
        /* ═══════════ DARK LUXURY SYSTEM ═══════════ */
        .products-container {
          background: #000000;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        /* ═══════════ TOP NAV (Mobile Inspired) ═══════════ */
        .products-top-nav {
          position: fixed;
          top: var(--header-h, 70px);
          left: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 8%;
          z-index: 2000;
          transition: transform 0.4s ease-in-out;
        }
        .products-top-nav.hidden {
          transform: translateY(calc(-100% - var(--header-h, 70px)));
        }
        .btn-config-pill {
            padding: 8px 16px;
            background: #1a1a1a;
            color: #fff;
            text-decoration: none;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            border: 1px solid #1a1a1a;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .btn-config-pill:hover, .btn-config-pill:active { 
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        /* ═══════════ HERO ═══════════ */
        .products-hero {
          position: relative;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #000;
          text-align: center;
          padding: 0 40px;
          overflow: hidden;
        }
        .products-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0));
          z-index: 5;
        }
        .hero-bg-wash {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 70% 30%, #ffffff 0%, #c4d7e6 100%);
          z-index: 1;
        }
        /* Custom Silhouette Gradient Implementation */
        .hero-silhouette {
          position: absolute;
          width: 100%;
          height: 100%;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }
        .silhouette-blob {
          position: absolute;
          background: #1b2b3a; /* Deep misty blue-grey */
          filter: blur(100px);
          opacity: 0.95;
        }
        .blob-1 {
          width: 70vw;
          height: 120vh;
          left: -15%;
          top: -10%;
          transform: rotate(-10deg);
          border-radius: 50%;
        }
        .blob-2 {
          width: 30vw;
          height: 40vh;
          right: 5%;
          top: -5%;
          background: #ffffff;
          opacity: 0.4;
          filter: blur(120px);
        }
        .hero-mist {
          position: absolute;
          width: 150%;
          height: 100%;
          background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%);
          transform: rotate(-15deg);
          z-index: 3;
          opacity: 0.3;
        }
        .products-hero-content {
          max-width: 600px;
          z-index: 10;
          color: #ffffff; /* White text for visibility over dark silhouette */
        }
        .products-hero-content {
          max-width: 600px;
          z-index: 10;
          color: #ffffff;
        }
        .video-container {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100vw;
          height: 100vh;
          transform: translate(-50%, -50%);
          pointer-events: none;
          overflow: hidden;
        }
        .video-container video {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translate(-50%, -50%);
          object-fit: cover;
        }
        .hero-mobile-shade {
          display: none;
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(27, 43, 58, 0.5) 0%, transparent 60%);
          z-index: 4;
          pointer-events: none;
        }
        .hero-eyebrow {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #ffffff;
          margin-bottom: 24px;
          display: block;
          opacity: 0.6;
        }
        .products-hero h1 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2rem, 5vw, 3rem) !important;
          font-weight: 300;
          letter-spacing: 0.1em;
          margin: 0 0 12px;
          color: #ffffff;
        }
        .products-hero p {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2.5rem, 8vw, 5rem) !important;
          color: #ffffff;
          max-width: 800px;
          margin: 0;
          line-height: 1.1;
          font-weight: 400;
        }

        /* ═══════════ PRODUCT SECTIONS ═══════════ */
        .p-sections-list {
          display: block; /* Vertical stack on desktop */
          background: #000000;
        }
        .p-section {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          padding: 100px 8%;
          overflow: hidden;
          background: #000000;
          /* Subtler 3D Depth Shadow for Dark Theme */
          box-shadow: inset 0 40px 80px -40px rgba(255,255,255,0.02), inset 0 -40px 80px -40px rgba(255,255,255,0.02);
        }

        /* 3D Border Layer Plates */
        .p-section-plate {
          position: absolute;
          left: 0;
          width: 100%;
          z-index: 25;
          pointer-events: none;
        }
        .plate-top {
          top: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          border-top: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 4px 12px rgba(255,255,255,0.01);
        }
        .plate-bottom {
          bottom: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 -4px 12px rgba(255,255,255,0.01);
        }

        .p-section-inner {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          align-items: center;
          width: 100%;
          z-index: 10;
          gap: 60px;
        }

        /* Dynamic Layered Backgrounds - Enhanced Depth */
        .p-bg-aura {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        /* Increased contrast for 'Light + Dark' mix */
        .p-aura-shadow {
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 35%, transparent 75%),
            linear-gradient(to left, rgba(0,10,20,0.6) 0%, rgba(0,0,0,0.4) 40%, transparent 80%);
          z-index: 2;
        }
        .p-mist-layer {
          position: absolute;
          width: 120%;
          height: 120%;
          filter: blur(140px);
          opacity: 0.8; 
          z-index: 1;
        }
        .p-accent-beam {
          position: absolute;
          width: 250%;
          height: 400px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transform: rotate(-35deg);
          top: -15%;
          left: -25%;
          pointer-events: none;
          z-index: 3;
          opacity: 0.5;
          filter: blur(40px);
        }

        /* ═══════════ REMOVED STATIC THEMES ═══════════ */

        /* Typography & Content */
        .p-content {
          max-width: 560px;
          text-align: left;
        }
        .p-subtitle {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #ffffff;
          opacity: 0.5;
          margin-bottom: 10px;
          display: block;
        }
        .p-title {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2.5rem, 5vw, 4.2rem);
          font-weight: 400;
          line-height: 1.05;
          margin: 0 0 6px;
          color: #ffffff;
        }
        .p-title em {
            font-style: italic;
            opacity: 0.4;
            margin-left: 10px;
        }
        .p-tagline {
          font-size: 1.35rem;
          font-weight: 300;
          color: #e0e0e0; 
          margin-top: 4px;
          margin-bottom: 8px;
          display: block;
        }
        .p-description {
          font-size: 1.1rem;
          line-height: 1.9;
          color: #bbbbbb; 
          margin: 24px 0 32px;
          font-weight: 300;
          text-align: left;
        }
        .p-link-luxury {
          display: inline-flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 10px !important;
          color: #ffffff !important; 
          // text-decoration: underline dashed rgba(255,255,255,0.3);
          font-size: 0.85rem;
          font-weight: 400;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          position: relative;
          z-index: 110;
          pointer-events: auto !important;
          cursor: pointer !important;
        }
        .p-link-luxury svg {
          flex-shrink: 0 !important;
          display: block !important;
          transition: transform 0.4s;
        }
        .p-link-luxury:hover {
          transform: translateY(-3px);
          gap: 20px !important;
        }
        .p-actions-row {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 20px !important;
          // margin-top: 32px;
          flex-wrap: nowrap !important;
        }
        .p-fav-btn {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          color: #888;
        }
        .p-fav-btn:hover {
          transform: scale(1.1);
          border-color: #ff4d4d;
          color: #ff4d4d;
        }
        .p-fav-btn.active {
          background: #ff4d4d;
          border-color: #ff4d4d;
          color: #fff;
          box-shadow: 0 8px 20px rgba(255, 77, 77, 0.25);
        }
        .p-price-tag {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 2rem;
          font-weight: 400;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
          display: block;
        }
        .p-inventory-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #999999; 
          margin-bottom: 20px;
          font-weight: 400;
          letter-spacing: 0.02em;
        }
        .i-info-icon {
          width: 16px; /* slightly increased from 14px */
          height: 16px;
          opacity: 0.65; /* slightly increased opacity to pop a bit more */
          cursor: pointer;
          transition: all 0.3s;
        }
        .i-info-icon:hover {
          opacity: 1;
          transform: scale(1.1); /* modest hover effect to feel interactive */
        }
        .p-cart-btn {
          display: none; /* Removed as per user request */
        }
        
        /* ═══════════ MODAL STYLES ═══════════ */
        .info-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        .info-modal-overlay.show {
          opacity: 1;
          visibility: visible;
        }
        .info-modal-box {
          background: #000000;
          width: 100%;
          max-width: 400px;
          height: 700px;
          max-height: 90vh;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transform: translateY(20px);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
        }
        .info-modal-overlay.show .info-modal-box {
          transform: translateY(0);
        }
        .info-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #000000;
        }
        .info-modal-title {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 500;
          color: #ffffff;
          margin: 0;
        }
        .info-modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #999;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        .info-modal-close:hover {
          color: #ffffff;
        }
        .info-modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 0;
          overscroll-behavior: contain; /* Prevents background scroll */
          min-height: 0; /* Important for flex scrolling */
        }
        .info-modal-content::-webkit-scrollbar {
          width: 6px;
        }
        .info-modal-content::-webkit-scrollbar-thumb {
          background-color: #ddd;
          border-radius: 4px;
        }
        .info-combo-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: background 0.3s;
        }
        .info-combo-item:hover {
          background: #111111;
        }
        .info-combo-item:last-child {
          border-bottom: none;
        }
        .info-combo-num {
          font-size: 0.75rem;
          font-weight: 600;
          color: #888;
          letter-spacing: 0.1em;
          // min-width: 40px;
        }
        .info-combo-img-wrap {
          width: 60px;
          height: 60px;
          background: #000000;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .info-combo-img-wrap img {
          width: 80%;
          height: 80%;
          object-fit: contain;
        }
        .info-combo-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .info-combo-name {
          font-size: 0.85rem;
          color: #ffffff;
          line-height: 1.4;
          font-weight: 500;
        }
        .info-combo-status {
          font-size: 0.75rem;
          color: #008767; /* success green */
          font-weight: 500;
        }

        /* High-Key Watch Visuals */
        .p-watch-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .p-watch-canvas {
            position: relative;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .p-watch-image {
          width: 100%;
          max-width: 520px;
          z-index: 10;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.08));
        }
        .p-diffusion-glow {
            position: absolute;
            width: 120%;
            height: 120%;
            background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%);
            z-index: 5;
            opacity: 0.6;
        }
        .p-soft-shadow {
            position: absolute;
            width: 80%;
            height: 20px;
            bottom: -40px;
            background: radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 70%);
            filter: blur(15px);
            z-index: 2;
        }

        /* ═══════════ FINAL STATEMENT ═══════════ */
        .p-final {
          padding: 160px 40px;
          text-align: center;
          background: #fafafa;
          border-top: 1px solid #eee;
        }
        .p-final h2 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 400;
          margin-bottom: 32px;
          color: #1a1a1a;
        }
        .p-final p {
          color: #555; /* slightly darker */
          max-width: 600px;
          margin: 0 auto 54px;
          font-size: 1.25rem;
          line-height: 1.7;
          font-weight: 300;
        }
        .p-btn-white {
            padding: 8px 16px;
            background: #1a1a1a;
            color: #fff;
            text-decoration: none;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            border-radius: 999px;
            border: 1px solid #1a1a1a;
        }
        .p-btn-white:hover, .p-btn-white:active {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        /* ═══ DESKTOP TEXT JUSTIFY ═══ */
        @media (min-width: 901px) {
          .p-description {
            text-align: justify;
          }
        }

        /* ═══════════ RESPONSIVE ═══════════ */
        @media (max-width: 1024px) {
          .nav-back, .btn-config-pill {
            font-size: 10px;
            padding: 6px 14px;
          }
          .products-hero {
            height: auto;
            min-height: 100vh;
            padding: 160px 24px 80px;
            justify-content: center;
            text-align: center;
          }
          .hero-mobile-shade {
            display: block;
          }
          .products-hero h1 {
            font-size: 3rem;
          }
          .products-hero p {
            margin: 0 auto;
          }

          /* Match Desktop Style in Mobile */
          .p-sections-list {
            display: block;
            background: #ffffff;
            padding: 0;
          }
          .p-section {
            min-height: auto;
            display: flex;
            align-items: center;
            padding: 60px 8%;
            overflow: hidden;
            box-shadow: inset 0 20px 40px -20px rgba(0,0,0,0.02), inset 0 -20px 40px -20px rgba(0,0,0,0.02);
          }
          .p-section-inner {
            grid-template-columns: 1fr 1fr; /* Keep side-by-side */
            text-align: left;
            gap: 30px;
          }
          
          /* Restore Desktop Elements */
          .p-bg-aura, .p-subtitle, .p-tagline, .p-description {
            display: block !important;
          }
          .p-link-luxury {
            display: inline-flex !important;
            padding: 10px 20px;
            font-size: 0.75rem;
            padding-left: 0;
          }
          .p-tagline { font-size: 1rem; }
          .p-description { font-size: 0.9rem; margin: 16px 0 24px; line-height: 1.6; }
          .p-subtitle { margin-bottom: 12px; font-size: 0.65rem; }
          .p-title { font-size: 1.8rem; }
          
          .p-diffusion-glow {
            display: block !important;
            scale: 0.8;
            opacity: 0.6;
          }
          .p-content { order: 1; margin: 0; }
          .p-watch-wrap { 
            order: 2; 
            margin: 0; 
            border-radius: 8px; 
            overflow: visible; 
            aspect-ratio: auto;
            background: transparent !important;
          }
          .p-watch-image {
            max-width: 100%;
          }
          .p-price-tag {
            font-size: 1.4rem;
            // margin-bottom: 12px;
          }
          .p-actions-row {
            // margin-top: 16px;
            gap: 12px;
          }
        }

        @media (max-width: 640px) {
           .p-section { 
             min-height: auto; 
             height: auto;
             padding: 0; 
             display: flex; 
             align-items: stretch;
             border-bottom: 1px solid rgba(255,255,255,0.08);
           }
           .p-section-inner {
              width: 100%;
              gap: 12px;
              padding: 32px 7%;
              display: grid;
              grid-template-columns: 1fr auto;
              align-items: start;
              position: relative;
           }
           .p-content {
              text-align: left;
              order: 1;
              max-width: 100%;
           }
           
           .p-watch-wrap {
              order: 2;
              display: flex;
              align-items: flex-start;
              justify-content: center;
              position: relative;
              width: 120px;
              flex-shrink: 0;
              padding-top: 8px;
           }
           .p-watch-image {
              max-height: 130px;
              width: auto;
              max-width: 120px;
              object-fit: contain;
           }
           .p-subtitle { 
              font-size: 0.55rem; 
              margin-bottom: 8px; 
              letter-spacing: 0.2em; 
              display: -webkit-box !important;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              line-height: 1.5;
           }
           .p-title { font-size: 1.3rem; line-height: 1.15; margin-bottom: 2px; }
           .p-tagline { font-size: 0.8rem; opacity: 0.7; margin-bottom: 10px; display: block !important; }
           .p-description { 
              display: -webkit-box !important;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
              font-size: 0.8rem; 
              line-height: 1.6; 
              margin: 8px 0 14px; 
              color: #999;
              text-align: justify;
              hyphens: auto;
              -webkit-hyphens: auto;
           }
           .p-price-tag { font-size: 1.15rem; margin-bottom: 4px; }
           .p-inventory-status { font-size: 0.7rem; margin-bottom: 8px; }
           .p-link-luxury { font-size: 0.75rem; }
           .p-actions-row { gap: 10px !important; }
           
           .p-diffusion-glow { display: none !important; }
           .p-soft-shadow { display: none !important; }
        }
      `}</style>

      {/* ═══ NAVIGATION ═══ */}
      <nav className={`products-top-nav ${scrollDir === 'down' && isScrolled ? 'hidden' : ''}`} style={{ justifyContent: 'flex-end' }}>
        <Link href="/pre-configure" className="btn-config-pill">Configure</Link>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="products-hero">
        <div className="video-container">
          <video
            src={getFileUrl(videoSettings.products_hero_video) || "/assets/Fylex.mp4"}
            autoPlay
            muted
            loop
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="products-hero-content">
          <span className="hero-eyebrow">{videoSettings.products_hero_video_subtitle || "A Legacy of Distinction"}</span>
          <h1>{videoSettings.products_hero_video_title || "Exceptional Timepieces"}</h1>
        </div>
      </section>

      {/* ═══ PRODUCT SECTIONS ═══ */}
      <div className="p-sections-list">
        {collections.map((col) => {
          const sectionStyle = {
            background: col.gradient || `
              radial-gradient(circle at 100% 0%, rgba(${col.accentRgb}, 0.25) 0%, transparent 60%),
              radial-gradient(circle at 5% 40%, rgba(${col.accentRgb}, 0.15) 0%, transparent 50%),
              linear-gradient(145deg, #020202 0%, #151515 40%, rgba(${col.accentRgb}, 0.05) 50%, #050505 100%)
            `
          };

          const mistStyle = {
            background: `radial-gradient(circle at 75% 35%, rgba(${col.mistRgb}, 0.35) 0%, transparent 80%)`
          };

          return (
            <section key={col.id} className="p-section" style={sectionStyle}>
              {/* 3D Border Layers */}
              <div className="p-section-plate plate-top"></div>
              <div className="p-section-plate plate-bottom"></div>

              {/* Light Layered Backgrounds */}
              <div className="p-bg-aura">
                <div className="p-aura-shadow"></div>
                <div className="p-mist-layer" style={mistStyle}></div>
                <div className="p-accent-beam"></div>
              </div>

              <div className="p-section-inner">
                {/* Content Layer */}
                <div className="p-content">
                  <span className="p-subtitle">{col.subtitle}</span>
                  <h2 className="p-title">
                    {col.title}
                    <em>{col.titleAccent}</em>
                  </h2>
                  <span className="p-tagline">{col.tagline}</span>
                  <p className="p-description">{col.description}</p>

                  <span className="p-price-tag">{col.price}</span>
                  <div className="p-inventory-status">
                    <svg onClick={() => openInfoModal(col)} className="i-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title="View previously configured combinations">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                  <div className="p-actions-row">
                    <Link href={`/discover?watch=${col.id}`} className="p-link-luxury">
                      <span>Explore</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </div>

                {/* Watch Visual Layer */}
                <Link href={`/discover?watch=${col.id}`} className="p-watch-wrap">
                  <div className="p-watch-canvas">
                    <div className="p-diffusion-glow"></div>
                    <img src={col.image} alt={col.title} className="p-watch-image" />
                    <div className="p-soft-shadow"></div>
                  </div>
                </Link>
              </div>
            </section>
          );
        })}
      </div>
      {/* ═══ INFO MODAL ═══ */}
      <div className={`info-modal-overlay ${activeModalData ? 'show' : ''}`} onClick={closeInfoModal}>
        <div className="info-modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="info-modal-header">
            <h3 className="info-modal-title">Sold Configurations</h3>
            <button className="info-modal-close" onClick={closeInfoModal}>✕</button>
          </div>
          <div className="info-modal-content" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
            {activeModalData?.combinations?.length > 0 ? (
              activeModalData.combinations.map((combo) => (
                <div key={combo.id} className="info-combo-item">
                  <span className="info-combo-num" style={{ fontSize: '1.2rem', color: '#c4a35a' }}>•</span>
                  <div className="info-combo-img-wrap">
                    <img src={combo.img} alt={`Combo ${combo.id}`} />
                  </div>
                  <div className="info-combo-details">
                    <span className="info-combo-name">{combo.name}</span>
                    <span className="info-combo-status">Sold on {combo.soldAt}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
                No configurations have been registered yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
