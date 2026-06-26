"use client";
import React from 'react';
import Link from 'next/link';

/**
 * PageHeader — Standardized page header with title, subtitle, and optional action button.
 *
 * Usage:
 *   <PageHeader
 *     title="Products"
 *     subtitle="Manage your store inventory"
 *     action={{ label: 'Add Product', icon: 'fas fa-plus', href: '/admin/products/create' }}
 *   />
 *   // or with onClick instead of href:
 *   <PageHeader title="Categories" action={{ label: 'Add', icon: 'fas fa-plus', onClick: () => setShowForm(true) }} />
 */
const PageHeader = ({ title, subtitle, action, children }) => {
  return (
    <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 28 }}>
      <div>
        <h2 style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#1e293b',
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{
            color: '#64748b',
            fontSize: 14,
            marginTop: 4,
            fontWeight: 500,
          }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {children}
        {action && (
          action.href ? (
            <Link href={action.href} className="btn-primary">
              {action.icon && <i className={action.icon} style={{ fontSize: 12 }}></i>}
              {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} className="btn-primary" disabled={action.disabled}>
              {action.icon && <i className={action.icon} style={{ fontSize: 12 }}></i>}
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default PageHeader;
