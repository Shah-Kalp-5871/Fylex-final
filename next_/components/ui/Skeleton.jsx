"use client";
import React from 'react';

export const Skeleton = ({ className, style }) => {
  return (
    <div 
      className={`skeleton-base ${className || ''}`} 
      style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s infinite',
        borderRadius: '8px',
        ...style
      }} 
    />
  );
};

export const ProductSkeleton = () => (
  <div className="product-skeleton-card">
    <Skeleton style={{ height: '300px', width: '100%', borderRadius: '12px' }} />
    <div style={{ padding: '20px 0' }}>
      <Skeleton style={{ height: '14px', width: '40%', marginBottom: '12px' }} />
      <Skeleton style={{ height: '24px', width: '80%', marginBottom: '16px' }} />
      <Skeleton style={{ height: '40px', width: '100px', borderRadius: '20px' }} />
    </div>
    <style>{`
      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .product-skeleton-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    `}</style>
  </div>
);
