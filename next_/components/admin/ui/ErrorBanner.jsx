"use client";
import React from 'react';

/**
 * ErrorBanner — Shows a user-friendly API error message.
 * Usage: <ErrorBanner message="Failed to load products" onRetry={fetchProducts} />
 */
const ErrorBanner = ({ message, onRetry, compact = false }) => {
  if (!message) return null;

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        background: 'var(--admin-danger-light)',
        border: '1px solid rgba(220,38,38,0.15)',
        borderRadius: 'var(--admin-radius)',
        fontSize: 13,
        color: 'var(--admin-danger)',
        fontWeight: 500,
      }}>
        <i className="fas fa-exclamation-circle" style={{ flexShrink: 0 }}></i>
        <span style={{ flex: 1 }}>{message}</span>
        {onRetry && (
          <button onClick={onRetry} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--admin-danger)', fontSize: 12, fontWeight: 700,
            padding: '2px 8px', borderRadius: 6,
            textDecoration: 'underline',
          }}>Retry</button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      gap: 16,
      textAlign: 'center',
    }}>
      <div style={{
        width: 56,
        height: 56,
        background: 'var(--admin-danger-light)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <i className="fas fa-exclamation-triangle" style={{
          fontSize: 22,
          color: 'var(--admin-danger)',
        }}></i>
      </div>
      <div>
        <p style={{
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--admin-text)',
          margin: '0 0 6px',
        }}>
          Something went wrong
        </p>
        <p style={{
          fontSize: 13,
          color: 'var(--admin-text-muted)',
          margin: 0,
          maxWidth: 400,
        }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary" style={{ marginTop: 4 }}>
          <i className="fas fa-redo" style={{ fontSize: 12 }}></i>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
