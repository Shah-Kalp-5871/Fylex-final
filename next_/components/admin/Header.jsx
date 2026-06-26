"use client";
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminLogout } from '@/services/adminApi';
import Link from 'next/link';

const Header = ({ setMobileOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Derive page title from URL — matches Laravel's str_replace('_', ' ', Request::segment(2))
  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    // parts[0] = 'admin', parts[1] = segment
    const segment = parts[1] || 'dashboard';
    return segment.replace(/-/g, ' ').replace(/_/g, ' ');
  };

  const pageTitle = getPageTitle();

  return (
    <header className="admin-header">
      {/* Left — title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        <div className="header-title">
          <h1 style={{ textTransform: 'capitalize' }}>{pageTitle}</h1>
          <div className="header-breadcrumb">
            Admin / <span style={{ textTransform: 'capitalize' }}>{pageTitle}</span>
          </div>
        </div>
      </div>

      {/* Right — admin dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Admin Profile Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 8px 4px 4px',
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            aria-label="Admin menu"
          >
            {/* Avatar — matches Laravel: gradient circle with first letter */}
            <div style={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
            }}>
              A
            </div>
            <div className="hidden md:block" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', lineHeight: 1.2 }}>
                Admin
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Super Admin
              </div>
            </div>
            <i
              className="fas fa-chevron-down hidden md:block"
              style={{
                fontSize: 9,
                color: 'var(--admin-text-muted)',
                transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            ></i>
          </button>

          {/* Dropdown — matches Laravel's admin-menu */}
          {dropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                onClick={() => setDropdownOpen(false)}
              />
              <div
                className="animate-fade-in"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 200,
                  background: 'rgba(255,255,255,0.97)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(14,165,233,0.12), 0 4px 12px rgba(28,25,23,0.06)',
                  border: '1px solid rgba(14,165,233,0.1)',
                  padding: '6px',
                  zIndex: 50,
                }}
              >
                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    color: 'var(--admin-text-secondary)',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'background 0.15s',
                  }}
                  className="hover:bg-slate-50"
                >
                  <i className="fas fa-user" style={{ width: 16, textAlign: 'center', color: '#0ea5e9' }}></i>
                  Profile
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    color: 'var(--admin-text-secondary)',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'background 0.15s',
                  }}
                  className="hover:bg-slate-50"
                >
                  <i className="fas fa-cog" style={{ width: 16, textAlign: 'center', color: '#0ea5e9' }}></i>
                  Settings
                </Link>
                <div style={{ margin: '4px 8px', borderTop: '1px solid var(--admin-border-light)' }}></div>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    color: 'var(--admin-danger)',
                    width: '100%',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'background 0.15s',
                  }}
                  className="hover:bg-red-50"
                  onClick={() => {
                    setDropdownOpen(false);
                    adminLogout();
                    logout();
                    router.push('/admin/login');
                  }}
                >
                  <i className="fas fa-sign-out-alt" style={{ width: 16, textAlign: 'center' }}></i>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
