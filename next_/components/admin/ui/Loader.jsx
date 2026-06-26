"use client";
import React from 'react';

/**
 * Loader — Full-area spinner for data loading states.
 * Usage: <Loader /> or <Loader message="Loading products..." />
 */
const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const sizes = { sm: 24, md: 36, lg: 48 };
  const px = sizes[size] || 36;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      gap: 16,
    }}>
      <div style={{
        width: px,
        height: px,
        border: `3px solid var(--admin-border)`,
        borderTopColor: 'var(--admin-primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', fontWeight: 500, margin: 0 }}>
        {message}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/**
 * TableLoader — Skeleton rows for table loading states.
 */
export const TableLoader = ({ rows = 5, cols = 5 }) => (
  <div style={{ padding: '8px 0' }}>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid var(--admin-border-light)',
      }}>
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} style={{
            height: 14,
            background: 'linear-gradient(90deg, #f0f2f7 25%, #e8eaf0 50%, #f0f2f7 75%)',
            backgroundSize: '200% 100%',
            borderRadius: 6,
            animation: 'shimmer 1.4s infinite',
            opacity: c === 0 ? 1 : 0.6,
          }} />
        ))}
      </div>
    ))}
    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
);

export default Loader;
