"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollDir, setScrollDir] = useState('up');
  const pathname = usePathname() || '';
  const location = { pathname };
  const { user } = useAuth() || { user: null };
  const wishlistCtx = useWishlist();
  const cartCtx = useCart();

  const wishlist = wishlistCtx?.wishlist || [];
  const cartCount = cartCtx?.totalCount || 0;
  const wishlistCount = wishlist.length;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeAll = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  const handleLinkClick = (e, targetId) => {
    closeAll();
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };


  return (
    <>
      <style>{`
        header.nav-v1 {
          position: fixed; top: 0; left: 0; width: 100%; height: var(--header-h);
          z-index: 3000;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 clamp(20px, 5vw, 56px);
          background: ${isMenuOpen ? '#000000ff' : '#000000'};
          border-bottom: 1px solid ${isMenuOpen ? 'rgba(255,255,255,0.1)' : 'var(--gold-dim)'};
          transition: background .4s, border-color .4s, transform .4s ease-in-out;
        }
        header.nav-v1.scrolled {
          background: ${isMenuOpen ? '#000000ff' : '#000000'};
          backdrop-filter: ${isMenuOpen ? 'none' : 'blur(14px)'};
        }
        header.nav-v1.hidden {
          transform: translateY(-100%);
        }

        .header-left, .header-middle, .header-right {
          display: flex;
          align-items: center;
          color: #fff;
        }

        .header-middle { justify-content: center; }
        .header-right { justify-content: flex-end; gap: clamp(15px, 2vw, 30px); }

        .logo-v1 {
          display: flex; align-items: center; justify-content: center;
          text-decoration: none;
        }
        .logo-v1 img { height: clamp(22px, 3.5vw, 30px); width: auto; filter: brightness(0) invert(1); }
        
        .nav-trigger {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          background: none; border: none; padding: 0; color: #fff;
        }

        .hamburger-v1 {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 22px;
          height: 8px;
          cursor: pointer;
        }

        .hamburger-v1 span {
          display: block;
          width: 100%;
          height: 1.5px;
          background: #fff;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          transform-origin: center;
        }

        .hamburger-v1.open span:nth-child(1) {
          transform: translateY(3.25px) rotate(45deg);
        }

        .hamburger-v1.open span:nth-child(2) {
          transform: translateY(-3.25px) rotate(-45deg);
        }

        .trigger-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          color: #fff;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .header-right-item {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem; font-weight: 500;
          cursor: pointer; opacity: 0.9;
          transition: opacity 0.3s;
          background: none; border: none; padding: 0;
        }
        .header-right-item:hover { opacity: 1; }
        .header-right-item svg { width: 18px; height: 18px; stroke-width: 1.5; }

        .badge-v1 {
          background: #008767;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: -8px;
          right: -8px;
          border: 1.5px solid #000;
          z-index: 5;
        }
        .header-right-item { position: relative; }

        .overlay-screen-v1 {
          position: fixed; top: 0; left: 0; width: 100%;
          z-index: 2500;
          background: #000000;
          display: flex;
          transform: translateY(-100%);
          transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .overlay-screen-v1.menu-overlay {
          height: 100vh;
          flex-direction: column;
          padding-top: var(--header-h);
        }
        .overlay-screen-v1.open { transform: translateY(0); }

        .menu-grid-v1 {
          display: flex;
          flex-direction: column;
          flex: 1;
          width: 100%;
          padding: 40px clamp(20px, 5vw, 56px);
        }

        .menu-links-side {
          display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start;
          gap: 30px;
          padding-top: 20px;
          flex: 1;
        }
        
        .nav-link-group {
          display: flex; flex-direction: column; gap: 15px;
        }
        
        .menu-links-side a {
          font-family: 'Inter', sans-serif;
          color: #fff; text-decoration: none;
          width: auto; text-align: left;
          transition: opacity 0.3s;
        }
        .menu-links-side a.primary {
          font-size: 1.35rem; font-weight: 700; letter-spacing: -0.01em;
        }
        .menu-links-side a.secondary {
          font-size: 0.95rem; font-weight: 500;
        }
        .menu-links-side a:hover { opacity: 0.7; }

        .menu-swiper-side {
          display: flex; flex-direction: column; justify-content: flex-start;
          padding-top: 20px; overflow: hidden;
        }
        .menu-swiper-header {
          margin-bottom: 25px;
        }
        .menu-swiper-header h2 {
          color: #fff; font-family: 'Inter', sans-serif;
          font-size: 2.5rem; font-weight: 700; letter-spacing: -0.02em;
        }
        .swiper-container-v1 {
          width: 100%; height: auto;
          margin-left: 0;
          padding: 0;
          overflow: visible !important;
          position: relative;
        }
        .watch-slide-v1 {
          display: flex; flex-direction: column; align-items: flex-start;
          transition: transform 0.3s ease;
          width: 100%;
          cursor: pointer;
        }
        .watch-img-container {
          width: 100%; aspect-ratio: 1.5/1;
          background: linear-gradient(to right, #cfd3d8, #e5e5e5);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
          margin-bottom: 15px;
        }
        .watch-slide-v1 img {
          width: 80%; height: 80%; object-fit: contain;
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .watch-slide-v1:hover img { transform: scale(1.05); }
        
        .watch-info-v1 {
          width: 100%; text-align: left;
        }
        .watch-info-v1 h3 {
          color: #fff; font-family: 'Inter', sans-serif;
          font-weight: 700; font-size: 0.95rem; letter-spacing: -0.01em;
          text-transform: none;
        }

        /* Swiper Navigation Customization */
        .swiper-button-prev, .swiper-button-next {
          width: 44px !important; height: 44px !important;
          background: rgba(255, 255, 255, 0.5) !important;
          backdrop-filter: blur(5px);
          border-radius: 50% !important;
          color: #333 !important;
          transition: background 0.3s, transform 0.3s !important;
          top: 45% !important;
          z-index: 10;
        }
        .swiper-button-prev { left: -22px !important; display: none; }
        .swiper-button-next { right: auto !important; left: calc(100% - 22px) !important// ; }

        .swiper-button-prev:after, .swiper-button-next:after {
          font-size: 16px !important; font-weight: bold;
        }
        .swiper-button-prev:hover, .swiper-button-next:hover {
          background: rgba(255, 255, 255, 0.8) !important;
          transform: scale(1.05);
        }
        .swiper-button-disabled { opacity: 0 !important; cursor: auto !important; display: none !important; }

        @media (max-width: 1024px) {
          .menu-grid-v1 { 
            grid-template-columns: 1fr; 
            grid-template-rows: auto 1fr;
            gap: 20px;
            overflow-y: auto;
            padding-bottom: 20px;
          }
          .menu-links-side { align-items: flex-start; text-align: left; padding-top: 0; }
          .menu-swiper-side { padding-top: 10px; }
          .menu-swiper-header h2 { font-size: 1.8rem; }
        }
        @media (max-width: 768px) {
          .header-right { gap: 15px; }
          .trigger-text { display: none; }
          .header-right-item span { display: none; }
        }
      `}</style>

      {/* Menu Overlay */}
      <div className={`overlay-screen-v1 menu-overlay ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-grid-v1">
          <div className="menu-links-side">
            <div className="nav-link-group">
              <Link href="/products" className="primary" onClick={closeAll}>
                FYLEX Watches
              </Link>
              <Link href="/my-purchases" className="primary" onClick={closeAll}>Your Collection</Link>
              <Link href="/shop" className="primary" onClick={closeAll}>About Us</Link>
              <Link href="/#gallery" className="primary" onClick={(e) => handleLinkClick(e, 'gallery')}>Community</Link>
            </div>
            <div className="nav-link-group" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', width: '100%', paddingBottom: '20px' }}>
              {user ? (
                <Link href="/profile" className="secondary" onClick={closeAll} style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  My Profile
                </Link>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                  <Link href="/login" className="secondary" onClick={closeAll} style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Sign In
                  </Link>

                </div>
              )}
              <Link href="/care-support" className="secondary" onClick={closeAll} style={{ fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                Care & Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      <header className={`nav-v1 ${isScrolled ? 'scrolled' : ''} ${scrollDir === 'down' && isScrolled ? 'hidden' : ''}`}>
        <div className="header-left">
          <button className="nav-trigger" onClick={toggleMenu}>
            <div className={`hamburger-v1 ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
            </div>
            <span className="trigger-text">{isMenuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>

        <div className="header-middle">
          <Link className="logo-v1" href="/" onClick={closeAll}>
            <img src="/logo.png" alt="Fylex" />
          </Link>
        </div>

        <div className="header-right">
          <Link href="/wishlist" className="header-right-item" onClick={closeAll} title="Wishlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78v0z" />
            </svg>
            {mounted && wishlistCount > 0 ? <div className="badge-v1">{wishlistCount}</div> : null}
          </Link>
          <Link href="/cart" className="header-right-item" onClick={closeAll} title="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {mounted && cartCount > 0 ? <div className="badge-v1">{cartCount}</div> : null}
          </Link>
        </div>
      </header>
    </>
  );
};

export default Header;
