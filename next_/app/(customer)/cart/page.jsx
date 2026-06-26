"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Real watch assets
const watchRose = '/assets/fylex-watch-v2/everose-gold.png';
const watchSilver = '/assets/fylex-watch-v2/white-gold.png';
const watchGold = '/assets/fylex-watch-v2/goldwatch.png';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

function CartItemRow({ item, index, onQtyChange, onRemove, onMoveToWishlist, isProcessing }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 120 + 80);
    return () => clearTimeout(t);
  }, [index]);

  const displayPrice = item.priceDisplay;
  const displayName = `${item.title} ${item.titleAccent || ''}`;
  const displayVariant = item.subtitle;
  const displayColor = item.accentColor || '#1C2E4A';
  const displayImage = item.image;
  const redirectUrl = item.redirectUrl || '#';

  return (
    <div
      className="cart-item-row"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.55s ease, transform 0.55s ease',
      }}
    >
      <Link href={redirectUrl} className="cart-item-top-link">
        <div className="cart-item-top">
          <div className="cart-watch-visual" style={{
            background: `linear-gradient(135deg, ${displayColor}15, ${displayColor}25)`
          }}>
            {displayImage ? (
              <img
                src={displayImage}
                alt={displayName}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div className="cart-placeholder-icon">⌚</div>
            )}
          </div>

          <div className="cart-item-details">
            <div className="cart-item-name">{displayName}</div>
            <div className="cart-item-variant">{displayVariant}</div>
            <div className="cart-item-price">{displayPrice}</div>
          </div>
        </div>
      </Link>

      <div className="cart-item-actions">
        <div className={`cart-qty-block ${isProcessing ? 'processing' : ''}`}>
          <button 
            className="cart-qty-btn" 
            onClick={() => !isProcessing && onQtyChange(item.id, -1)}
            disabled={isProcessing}
          >−</button>
          <span className="cart-qty-val">{isProcessing ? '...' : item.qty}</span>
          <button 
            className="cart-qty-btn" 
            onClick={() => !isProcessing && onQtyChange(item.id, 1)}
            disabled={isProcessing}
          >+</button>
        </div>

        <div className="cart-row-secondary-actions">
          <button 
            className={`cart-wishlist-btn ${isProcessing ? 'processing' : ''}`}
            onClick={() => !isProcessing && onMoveToWishlist(item)}
            disabled={isProcessing}
            title="Move to Wishlist"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>

          <button 
            className={`cart-remove-btn ${isProcessing ? 'processing' : ''}`} 
            onClick={() => !isProcessing && onRemove(item.id)} 
            disabled={isProcessing}
            title="Remove"
          >
            {isProcessing ? (
               <div className="cart-spinner-small" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const navigate = useRouter();
  const { items, updateQty, removeFromCart, totals, processingItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [heroVisible, setHeroVisible] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const summaryRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setSummaryVisible(true); },
      { threshold: 0.15 }
    );
    if (summaryRef.current) observer.observe(summaryRef.current);
    return () => observer.disconnect();
  }, []);

  const handleQty = (id, delta) => {
    updateQty(id, delta);
  };

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleMoveToWishlist = async (item) => {
    // 1. Add to wishlist
    await toggleWishlist({
      variantId: item.variantId,
      productId: item.productId
    });
    // 2. Remove from cart
    removeFromCart(item.id);
  };

  const subtotal = totals.subtotal;
  const shippingPlaceholder = subtotal > 150000 ? 0 : 500;
  const total = totals.grandTotal;

  return (
    <div className="cart-page">
      {/* Hero */}
      <div
        className="cart-hero"
        style={{
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        <h1 className="cart-hero-title">Shopping Cart</h1>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items-col">
          {items.length === 0 ? (
            <div className="cart-empty">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#ffffff" strokeWidth="1.5" opacity="0.2" />
                <path d="M20 22h24l-3 18H23L20 22z" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                <circle cx="26" cy="46" r="2" fill="#ffffff" opacity="0.4" />
                <circle cx="38" cy="46" r="2" fill="#ffffff" opacity="0.4" />
              </svg>
              <p>Your cart is empty</p>
              <Link href="/products" className="cart-empty-cta">Explore Watches</Link>
            </div>
          ) : (
            items.map((item, i) => (
              <CartItemRow
                key={item.id}
                item={item}
                index={i}
                onQtyChange={handleQty}
                onRemove={handleRemove}
                onMoveToWishlist={handleMoveToWishlist}
                isProcessing={processingItems.has(item.id)}
              />
            ))
          )}
        </div>

        {/* Summary */}
        <div
          ref={summaryRef}
          className="cart-summary-col"
          style={{
            opacity: summaryVisible ? 1 : 0,
            transform: summaryVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.65s ease 0.2s, transform 0.65s ease 0.2s',
          }}
        >
          <div className="cart-summary-card">
            <div className="cart-summary-title">Order Summary</div>
            <div className="cart-summary-line">
              <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary-line">
              <span>Shipping</span>
              <span>{shippingPlaceholder === 0 ? <span className="cart-free-tag">Free</span> : (subtotal > 0 ? "Calculated at checkout" : "₹0")}</span>
            </div>
            <div className="cart-summary-divider" />
            <div className="cart-summary-total">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Total</span>
                {shippingPlaceholder > 0 && <span style={{ fontSize: '10px', fontWeight: '400', color: '#94a3b8' }}>Excl. shipping</span>}
              </div>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <button className="cart-checkout-btn" onClick={() => navigate.push('/checkout')}>
              <span>Proceed to Checkout</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Link href="/products" className="cart-continue-link">← Continue Shopping</Link>
          </div>

          {/* Trust badges */}
          {/* <div className="cart-trust-badges">
            {[
              { icon: '🔒', label: 'Secure Payment' },
              { icon: '↩', label: '30-Day Returns' },
              { icon: '🚚', label: 'Fast Delivery' },
            ].map(b => (
              <div className="cart-badge" key={b.label}>
                <span className="cart-badge-icon">{b.icon}</span>
                <span className="cart-badge-label">{b.label}</span>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      <style>{`
        .cart-page {
          min-height: 100vh;
          padding: calc(var(--header-h, 70px) + 40px) 24px 80px;
          position: relative;
          overflow: hidden;
          background: #000000;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
        }

        .cart-hero {
          position: relative; z-index: 1;
          text-align: center;
          margin-bottom: 52px;
        }
        .cart-hero-title {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
       

        .cart-layout {
          position: relative; z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
          align-items: start;
        }
        @media(max-width: 860px) {
          .cart-layout { grid-template-columns: 1fr; }
        }

        .cart-item-row {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #111111;
          border: 1px solid #333333;
          padding: 20px 24px;
          margin-bottom: 16px;
          transition: transform 0.3s;
        }
        .cart-item-row:hover {
          transform: translateY(-2px);
        }
        .cart-item-top-link {
          text-decoration: none;
          color: inherit;
          display: block;
          flex: 1;
        }
        .cart-item-top {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .cart-watch-visual {
          width: 80px; height: 96px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: transparent !important;
        }
        .cart-item-details { flex: 1; min-width: 0; }
        .cart-item-name {
          font-size: 1.2rem; color: #ffffff;
          font-weight: 700; margin-bottom: 4px;
        }
        .cart-item-variant {
          font-size: 0.9rem; color: #ffffff;
          margin-bottom: 10px;
        }
        .cart-item-price {
          font-size: 1rem; font-weight: 600;
          color: #ffffff;
        }
        /* Actions layout for Desktop */
        @media (min-width: 861px) {
          .cart-item-actions {
            display: flex;
            align-items: center;
            gap: 24px;
            margin-left: auto;
            flex-shrink: 0;
          }
        }

        .cart-qty-block {
          display: flex; align-items: center;
          gap: 10px;
        }
        .cart-qty-btn {
          width: 32px; height: 32px;
          border: none;
          background: transparent; color: #ffffff;
          font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s;
        }
        .cart-qty-btn:hover {
          transform: scale(1.1);
        }
        .cart-qty-val {
          font-size: 15px; font-weight: 600;
          color: #ffffff; width: 24px; text-align: center;
        }
        .cart-row-secondary-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cart-wishlist-btn {
          cursor: pointer; border: none; background: transparent;
          padding: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #ffffff;
          transition: all 0.3s ease;
        }
        .cart-wishlist-btn:hover {
          transform: scale(1.1);
        }
        .cart-remove-btn {
          cursor: pointer; border: none; background: transparent;
          padding: 8px;
          color: #ffffff; 
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease;
        }
        .cart-remove-btn:hover {
          transform: scale(1.1);
        }

        /* Empty */
        .cart-empty {
          text-align: center; padding: 80px 24px;
          color: #ffffff;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .cart-empty p { font-size: 16px; }
        .cart-empty-cta {
          display: inline-block;
          padding: 8px 16px;
          background: #ffffff;
          color: #000000; border-radius: 50px;
          text-decoration: none; font-size: 10px;
          letter-spacing: 0.15em; text-transform: uppercase; font-weight: 700;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          border: 1px solid #ffffff;
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
        }
        .cart-empty-cta:hover, .cart-empty-cta:active { 
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
        }

        /* Summary */
        .cart-summary-card {
          background: #111111;
          border: 1px solid #333333;
          padding: 32px 28px;
        }
        .cart-summary-title {
          font-size: 1.5rem; font-weight: 700; color: #ffffff;
          margin-bottom: 28px;
        }
        .cart-summary-line {
          display: flex; justify-content: space-between;
          font-size: 13px; color: #ffffff;
          margin-bottom: 14px;
        }
        .cart-free-tag {
          color: #ffffff; font-weight: 600; font-size: 12px;
          border: 1px solid #ffffff; padding: 2px 8px; border-radius: 20px;
        }
        .cart-free-hint {
          font-size: 11px; color: #ffffff;
          margin-bottom: 14px;
        }
        .cart-summary-divider {
          height: 1px;
          background: #333333;
          margin: 20px 0;
        }
        .cart-summary-total {
          display: flex; justify-content: space-between;
          font-size: 18px; font-weight: 700;
          color: #ffffff; margin-bottom: 28px;
        }
        .cart-checkout-btn {
          width: 100%;
          padding: 8px 16px;
          background: #ffffff;
          color: #000000; border: 1px solid #ffffff; border-radius: 999px;
          font-size: 10px; letter-spacing: 0.15em;
          text-transform: uppercase; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          margin-bottom: 16px;
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
        }
        .cart-checkout-btn:hover, .cart-checkout-btn:active {
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
        }
        .cart-continue-link {
          display: block; text-align: center;
          font-size: 12px; color: #ffffff;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .cart-continue-link:hover { color: #cccccc; }

        .cart-trust-badges {
          display: flex; justify-content: space-between;
          margin-top: 20px; gap: 8px;
        }
        .cart-badge {
          flex: 1;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 12px 8px;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          font-size: 10px; color: #a0aec0;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cart-badge:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(255,255,255,0.08); }
        .cart-badge-icon { font-size: 18px; }
        .cart-badge-label { letter-spacing: 0.04em; font-weight: 500; }
        
        /* Mobile Layout */
        @media (max-width: 600px) {
          .cart-page {
            padding: calc(var(--header-h, 70px) + 20px) 16px 80px;
          }
          .cart-hero-title {
            font-size: 22px;
          }
          .cart-item-row {
             flex-direction: column;
             align-items: stretch;
             gap: 16px;
             padding: 16px;
          }
          /* Top portion: Image + Details */
          .cart-item-top {
             display: flex;
             align-items: center;
             gap: 16px;
          }
          .cart-watch-visual {
             width: 65px; height: 80px;
          }
          .cart-item-name {
             font-size: 15px;
          }
          .cart-item-variant {
             font-size: 10px;
          }
          /* Bottom portion: Qty + Remove */
          .cart-item-actions {
             display: flex;
             justify-content: space-between;
             align-items: center;
             padding-top: 12px;
             border-top: 1px solid rgba(255,255,255,0.05);
          }
          .cart-qty-block { margin: 0; }
          // .cart-remove-btn { padding: 8px; background: rgba(255,255,255,0.03); }
          .cart-summary-card {
            padding: 24px 20px;
          }
          .cart-trust-badges {
            flex-direction: column;
            gap: 10px;
          }
          .cart-badge {
            flex-direction: row;
            text-align: left;
            padding: 12px 16px;
          }
        }

        .cart-spinner-small {
          width: 14px; height: 14px;
          border: 2px solid rgba(224, 92, 107, 0.2);
          border-top-color: #e05c6b;
          border-radius: 50%;
          animation: cart-spin 0.6s linear infinite;
        }
        @keyframes cart-spin { to { transform: rotate(360deg); } }

        .processing {
          opacity: 0.5;
          pointer-events: none;
          filter: grayscale(0.5);
        }
      `}</style>
    </div>
  );
}
