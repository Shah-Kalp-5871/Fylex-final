"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminLogout } from '@/services/adminApi';
import '@/app/admin/css/custom.css';

/**
 * Navigation config — mirrors Laravel sidebar.blade.php exactly.
 * Active state uses left-border + bg gradient (matches Laravel's active styling).
 */
const navItems = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: 'fas fa-home',
    path: '/admin/dashboard',
  },
  {
    key: 'reports',
    title: 'Reports',
    icon: 'fas fa-chart-line',
    path: '/admin/reports',
  },
  {
    key: 'products',
    title: 'Products',
    icon: 'fas fa-cube',
    path: '/admin/products',
    submenu: [
      { title: 'All Products', path: '/admin/products' },
      { title: 'Add Product', path: '/admin/products/create' },
      { title: 'Variants', path: '/admin/products/variants' },
      { title: 'Attributes', path: '/admin/products/attributes' },
      { title: 'Specifications', path: '/admin/products/specifications' },
      { title: 'Tags', path: '/admin/products/tags' },
    ],
  },
  {
    key: 'categories',
    title: 'Categories',
    icon: 'fas fa-tags',
    path: '/admin/categories',
    submenu: [
      { title: 'All Categories', path: '/admin/categories' },
      { title: 'Add New', path: '/admin/categories?new=true' },
    ],
  },
  {
    key: 'taxes',
    title: 'Taxes',
    icon: 'fas fa-percent',
    path: '/admin/taxes',
  },
  {
    key: 'orders',
    title: 'Orders',
    icon: 'fas fa-shopping-cart',
    path: '/admin/orders',
  },
  {
    key: 'offers',
    title: 'Offers',
    icon: 'fas fa-percentage',
    path: '/admin/offers',
    submenu: [
      { title: 'All Offers', path: '/admin/offers' },
      { title: 'Add New', path: '/admin/offers/create' },
    ],
  },
  {
    key: 'users',
    title: 'Customers',
    icon: 'fas fa-users',
    path: '/admin/users',
  },
  {
    key: 'media',
    title: 'Media',
    icon: 'fas fa-images',
    path: '/admin/media',
  },
  {
    key: 'crm',
    title: 'CRM',
    icon: 'fas fa-bullhorn',
    path: '/admin/crm',
    submenu: [
      { title: 'Sliders', path: '/admin/crm/banners' },
      { title: 'Home Page', path: '/admin/crm/home-sections' },
      { title: 'Video Settings', path: '/admin/settings/videos' },
      { title: 'Shop Page Settings', path: '/admin/settings/shop' },
    ],
  },
  {
    key: 'community',
    title: 'Community',
    icon: 'fas fa-camera-retro',
    path: '/admin/community',
  },
  {
    key: 'care',
    title: 'Care & Support',
    icon: 'fas fa-life-ring',
    path: '/admin/care',
    submenu: [
      { title: 'FAQs', path: '/admin/faqs' },
      { title: 'Watch Care Steps', path: '/admin/care-steps' },
    ],
  },
  {
    key: 'shipping',
    title: 'Shipping',
    icon: 'fas fa-truck',
    path: '/admin/shipping',
  },
  {
    key: 'settings',
    title: 'Settings',
    icon: 'fas fa-cog',
    path: '/admin/settings',
  },
  {
    key: 'login-settings',
    title: 'Login',
    icon: 'fas fa-sign-in-alt',
    path: '/admin/login-settings',
  },
];

const Sidebar = ({ mobileOpen, setMobileOpen, isExpanded, setIsExpanded }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (key) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isPathActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const isItemActive = (item) => {
    if (isPathActive(item.path)) return true;
    return item.submenu ? item.submenu.some(sub => isPathActive(sub.path)) : false;
  };

  const isSubmenuOpen = (item) => {
    const active = isItemActive(item);
    // If manually toggled, use that state; otherwise auto-open active parent
    return openSubmenus[item.key] !== undefined ? openSubmenus[item.key] : active;
  };

  return (
    <>
      <aside
        className={`admin-sidebar ${isExpanded ? 'expanded' : ''} ${mobileOpen ? 'mobile-show' : ''}`}
        style={{ transition: 'width 0.3s ease, transform 0.3s ease' }}
      >
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <div className="sidebar-logo-icon" style={{ width: '220px', height: '80px', background: 'transparent', border: 'none', margin: '0 auto' }}>
            <img src="/fylex.png" alt="Fylex" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'none' }} />
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const hasSubmenu = !!item.submenu;
            const active = isItemActive(item);
            const submenuOpen = hasSubmenu && isSubmenuOpen(item);

            return (
              <div key={item.key}>
                {/* Parent link / button */}
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleSubmenu(item.key)}
                    className={`nav-link ${active ? 'active' : ''}`}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'none',
                      font: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    title={!isExpanded ? item.title : undefined}
                  >
                    <i className={item.icon}></i>
                    <span className="nav-link-text" style={{ flex: 1 }}>{item.title}</span>
                    {isExpanded && (
                      <i
                        className="fas fa-chevron-down nav-link-text"
                        style={{
                          fontSize: 10,
                          transform: submenuOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      ></i>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.path}
                    className={`nav-link ${active ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                    title={!isExpanded ? item.title : undefined}
                  >
                    <i className={item.icon}></i>
                    <span className="nav-link-text">{item.title}</span>
                  </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && submenuOpen && isExpanded && (
                  <div className="submenu">
                    {item.submenu.map((sub, idx) => (
                      <Link
                        key={idx}
                        href={sub.path}
                        className={isPathActive(sub.path) ? 'active' : ''}
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div
            className="nav-link logout-btn"
            style={{
              marginBottom: 10,
              border: '1px solid rgba(239,68,68,0.18)',
              background: 'rgba(239,68,68,0.05)',
              cursor: 'pointer'
            }}
            onClick={() => {
              adminLogout();
              logout();
              router.push('/admin/login');
            }}
            title={!isExpanded ? 'Logout' : undefined}
          >
            <i className="fas fa-sign-out-alt" style={{ color: '#ef4444' }}></i>
            <span className="nav-link-text" style={{ color: '#ef4444', fontWeight: 600 }}>
              Logout
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="sidebar-toggle hidden md:flex"
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'left' : 'right'}`}></i>
            {isExpanded && <span className="nav-link-text">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 30,
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
