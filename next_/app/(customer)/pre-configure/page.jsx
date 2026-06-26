"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchProducts } from '../../../lib/api';
import { getDisplayData } from '../../../lib/utils';

const PreConfigure = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);



  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetchProducts();
        const rawData = res.data || (Array.isArray(res) ? res : []);
        const mapped = rawData.map(p => {
          // Find cheapest variant
          let cheapestVariant = null;
          if (p.variants && p.variants.length > 0) {
            cheapestVariant = p.variants.reduce((prev, curr) => {
              const prevPrice = Number(prev.sellingPrice || prev.price || 0);
              const currPrice = Number(curr.sellingPrice || curr.price || 0);
              return (currPrice > 0 && (currPrice < prevPrice || prevPrice === 0)) ? curr : prev;
            }, p.variants[0]);
          }

          const display = getDisplayData(p, cheapestVariant);

          return {
            id: p.id.toString(),
            title: p.name,
            price: display.formattedPrice,
            heroImage: display.image,
            theme: p.theme || 'champagne',
            textColor: p.textColor || '#1a1a1a',
            accentColor: p.accentColor || '#c4a35a',
            bgColor: p.bgColor || '',
            shortDescription: p.shortDescription || p.description || '',
            category: p.mainCategory?.name || 'Uncategorized'
          };
        });
        setProducts(mapped);

        // Extract unique categories
        const uniqueCats = ['All', ...new Set(mapped.map(p => p.category).filter(c => c !== 'Uncategorized'))];
        setCategories(uniqueCats);
      } catch (err) {
        console.error('Failed to fetch products for pre-configure', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white text-navy font-serif text-2xl">Initializing Atelier...</div>;
  if (products.length === 0) return <div className="h-screen flex items-center justify-center bg-white text-navy font-serif">No timepieces available for configuration.</div>;

  return (
    <div className="pre-configure-page fixed inset-0 flex flex-col bg-white overflow-hidden z-[1001]">
      <style>{`
        .pre-configure-page {
          font-family: 'Inter', sans-serif;
        }
        .swiper-container-main {
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;
          z-index: 5;
        }
        .swiper-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .slide-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .p-aura-shadow {
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 20%, transparent 60%),
            linear-gradient(to left, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 25%, transparent 65%);
          z-index: 2;
        }
        .p-mist-layer {
          position: absolute;
          width: 120%;
          height: 120%;
          filter: blur(120px);
          opacity: 0.7;
          z-index: 1;
        }
        .p-accent-beam {
          position: absolute;
          width: 200%;
          height: 300px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
          transform: rotate(-35deg);
          top: -10%;
          left: -20%;
          pointer-events: none;
          z-index: 3;
          opacity: 0.6;
        }


        .section-champagne { background: #fffafb; --theme-text: #1a1a1a; --theme-accent: #c4a35a; }
        .section-champagne .p-mist-layer { background: radial-gradient(circle at 70% 40%, rgba(196,163,90,0.2) 0%, transparent 70%); }
        
        .section-mist-blue { background: #e5f0f0ef; --theme-text: #1a1a1a; --theme-accent: #1e40af; }
        .section-mist-blue .p-mist-layer { background: radial-gradient(circle at 70% 40%, rgba(30,64,175,0.15) 0%, transparent 70%); }

        .section-soft-green { background: #ddfddcff; --theme-text: #1a1a1a; --theme-accent: #066e50; }
        .section-soft-green .p-mist-layer { background: radial-gradient(circle at 70% 40%, rgba(6,110,80,0.15) 0%, transparent 70%); }

        .section-pearl-silver { background: #fcfcfc; --theme-text: #1a1a1a; --theme-accent: #475569; }
        .section-pearl-silver .p-mist-layer { background: radial-gradient(circle at 70% 40%, rgba(71,85,105,0.15) 0%, transparent 70%); }

        .section-rose-burgundy { background: #d4c0c4cb; --theme-text: #1a1a1a; --theme-accent: #7f1d1d; }
        .section-rose-burgundy .p-mist-layer { background: radial-gradient(circle at 70% 40%, rgba(127,29,29,0.12) 0%, transparent 70%); }

        .slide-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          height: 100%;
          padding: 0;
          pointer-events: none;
        }
        .product-image-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          overflow: hidden;
        }
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transform: scale(1.8);
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.15));
          transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .product-info {
          position: absolute;
          bottom: 80px;
          left: 0;
          right: 0;
          z-index: 20;
          color: var(--theme-text, #1a1a1a);
          pointer-events: auto;
          padding: 0 60px;
        }
        .product-name {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(1.8rem, 4vw, 3rem);
          font-weight: 400;
          margin: 0;
          line-height: 1;
          text-align: left;
        }
        .product-name em {
          font-style: italic;
          opacity: 0.6;
          margin-left: 10px;
        }
        .product-price {
          font-size: 1.1rem;
          color: #555;
          margin: 0 0 15px;
          font-weight: 300;
          display: block;
          text-align: left;
        }
        .product-desc-container {
          max-width: 600px;
          margin: 10px 0;
          text-align: left;
        }
        .product-desc {
          font-size: 0.95rem;
          color: #000;
          line-height: 1.5;
          font-weight: 300;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .product-desc.expanded {
          -webkit-line-clamp: unset;
        }
        .btn-read-more {
          background: none;
          border: none;
          color: #c4a35a;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-top: 4px;
          text-decoration: underline;
          text-underline-offset: 2px;
          pointer-events: auto;
          display: inline-block;
          text-align: left;
        }
        .btn-configure {
          display: inline-block;
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
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .btn-configure:hover, .btn-configure:active {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        /* Custom Pagination Lines */
        .swiper-pagination {
          bottom: 40px !important; /* Adjusted position */
          display: flex;
          justify-content: center;
          gap: 12px;
          z-index: 50;
        }
        .swiper-pagination-bullet {
          width: 40px !important;
          height: 2px !important;
          border-radius: 0 !important;
          background: var(--theme-text, #1a1a1a) !important;
          opacity: 0.2;
          margin: 0 !important;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          width: 60px !important;
          background: var(--theme-accent, #c4a35a) !important;
        }


        .header-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 50;
          transition: filter 0.4s ease;
        }
        .header-wrapper.header-blurred {
          filter: blur(10px);
          pointer-events: none;
        }
        .slide-overlay {
          position: absolute;
          inset: 0;
          z-index: 15;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(12px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.4s ease;
        }
        .slide-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        .btn-container {
          justify-content: center;
        }

        /* Desktop Redesign - SPLIT LAYOUT */
        @media (min-width: 1025px) {
          .btn-container {
            justify-content: flex-start;
          }
          .slide-content {
            flex-direction: row-reverse;
            align-items: center;
            justify-content: space-between;
            padding: 0 12%;
          }
          .product-image-container {
            width: 55%;
            height: 100%;
            position: relative;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .product-image {
            width: auto;
            height: 85%;
            max-height: 800px;
            transform: scale(1.1);
            filter: drop-shadow(0 40px 80px rgba(0,0,0,0.3));
          }
          .product-info {
            position: relative;
            bottom: auto;
            left: auto;
            right: auto;
            width: 40%;
            padding: 0;
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 25px;
            color: var(--theme-text, #1a1a1a);
          }
          .product-name {
            font-size: 5.5rem;
            line-height: 0.85;
            margin-bottom: 5px;
            color: var(--theme-text, #1a1a1a);
          }
          .product-price {
            font-size: 1.5rem;
            margin-bottom: 10px;
            color: var(--theme-text, #1a1a1a);
            opacity: 0.8;
          }
          .product-desc-container {
            max-width: 480px;
            margin-bottom: 15px;
          }
          .product-desc {
            font-size: 1.15rem;
            line-height: 1.6;
            color: var(--theme-text, #1a1a1a);
            opacity: 0.9;
          }
          .btn-read-more {
            color: var(--theme-accent, #c4a35a);
            opacity: 0.8;
          }
          .btn-configure {
            width: fit-content;
            padding: 20px 50px;
            font-size: 0.9rem;
            background: var(--theme-text, #1a1a1a);
            color: var(--theme-bg, #fff);
            border: none;
            font-weight: 800;
          }
          .btn-configure:hover {
            opacity: 0.9;
            transform: translateY(-3px) scale(1.05);
          }
          
          /* Pagination adjustment */
          .swiper-pagination {
            bottom: 60px !important;
          }
          .swiper-pagination-bullet {
            background: var(--theme-text, #1a1a1a) !important;
            opacity: 0.3;
          }
          .swiper-pagination-bullet-active {
            opacity: 1;
            background: var(--theme-accent, #c4a35a) !important;
          }
        }

        @media (max-width: 1024px) {
          .product-image { transform: scale(1.6); }
          .product-info { bottom: 75px; padding: 0 50px; }
          .swiper-pagination { bottom: 35px !important; }
        }

        @media (max-width: 768px) {
          .product-image { transform: scale(1.6); }
          .product-info { bottom: 70px; padding: 0 20px; }
          .product-name { font-size: 1.6rem; }
          .product-price { font-size: 1rem; margin: 2px 0 10px; }
          .btn-configure { padding: 10px 24px; font-size: 0.75rem; }
          .swiper-pagination { bottom: 30px !important; }
        }

        /* Category Filter Styles */
        .category-nav {
          position: absolute;
          top: 100px;
          left: 0;
          width: 100%;
          z-index: 60;
          display: flex;
          justify-content: center;
          gap: 40px;
          pointer-events: auto;
        }
        .category-item {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: #1a1a1a;
          cursor: pointer;
          opacity: 0.4;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: capitalize;
        }
        .category-item:hover {
          opacity: 0.8;
        }
        .category-item.active {
          opacity: 1;
          font-weight: 600;
        }
        .category-dot {
          color: #1a1a1a;
          font-size: 1.2rem;
          line-height: 0;
          margin-left: 2px;
        }

        @media (max-width: 768px) {
          .category-nav { top: 90px; gap: 20px; }
          .category-item { font-size: 0.8rem; }
        }
      `}</style>

      <div className={`header-wrapper ${expandedIds.size > 0 ? 'header-blurred' : ''}`}>
        <Header />
      </div>

      <main className="flex-1 relative overflow-hidden z-10">
        <nav className="category-nav">
          {categories.map(cat => (
            <div
              key={cat}
              className={`category-item ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              {activeCategory === cat && <span className="category-dot">•</span>}
            </div>
          ))}
        </nav>
        <div className="swiper-container-main">
          <Swiper
            onSwiper={setSwiperInstance}
            modules={[Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            allowTouchMove={expandedIds.size === 0}
            pagination={{ clickable: true }}
            loop={true}
            className="mySwiper h-full w-full"
          >
            {products
              .filter(p => activeCategory === 'All' || p.category === activeCategory)
              .map((product) => (
                <SwiperSlide key={product.id}>
                  <div
                    className={`slide-bg section-${product.theme}`}
                    style={{
                      backgroundColor: product.bgColor || undefined,
                      '--theme-text': product.textColor,
                      '--theme-accent': product.accentColor,
                      '--theme-bg': product.bgColor || '#fff'
                    }}
                  >
                    <div className="p-aura-shadow"></div>
                    <div className="p-mist-layer"></div>
                    <div className="p-accent-beam"></div>
                  </div>

                  <div className="slide-content" style={{
                    '--theme-text': product.textColor,
                    '--theme-accent': product.accentColor,
                    '--theme-bg': product.bgColor || '#fff'
                  }}>
                    <div className="product-image-container">
                      <img src={product.heroImage} alt={product.title} className="product-image" />
                    </div>
                    <div
                      className={`slide-overlay ${expandedIds.has(product.id) ? 'active' : ''}`}
                      onClick={() => setExpandedIds(new Set())}
                    ></div>
                    <div className="product-info">
                      <h2 className="product-name">
                        {product.title}
                      </h2>
                      <div className="product-desc-container">
                        <p className={`product-desc ${expandedIds.has(product.id) ? 'expanded' : ''}`}>
                          {product.shortDescription}
                        </p>
                        {product.shortDescription.length > 60 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const next = new Set(expandedIds);
                              if (next.has(product.id)) next.delete(product.id);
                              else next.add(product.id);
                              setExpandedIds(next);
                            }}
                            className="btn-read-more"
                          >
                            {expandedIds.has(product.id) ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </div>
                      <span className="product-price">{product.price}</span>
                      <div className="flex gap-3 items-center mt-4 btn-container">
                        <Link href={`/configure?watch=${product.id}`} className="btn-configure">
                          Configure
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
      </main>

    </div>
  );
};

export default PreConfigure;
