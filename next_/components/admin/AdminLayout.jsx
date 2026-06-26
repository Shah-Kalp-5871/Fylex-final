"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePathname, useRouter } from 'next/navigation';

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Initialize as false to avoid SSR mismatch, then read localStorage in useEffect
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Read localStorage only on client
    const saved = localStorage.getItem('sidebarState');
    setSidebarExpanded(saved !== 'collapsed');

    // Auth Guard
    const token = localStorage.getItem('admin_token');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setMounted(true);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarState', sidebarExpanded ? 'expanded' : 'collapsed');
    }
  }, [sidebarExpanded, mounted]);

  // If not mounted yet (or redirecting), don't render to avoid flash
  if (!mounted) return null;

  // Don't render sidebar and header for the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className={`admin-root ${sidebarExpanded ? 'sidebar-open' : ''}`}>
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isExpanded={sidebarExpanded}
        setIsExpanded={setSidebarExpanded}
      />

      {/* Mobile Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className="admin-main">
        <Header setMobileOpen={setMobileOpen} />
        <div className="admin-page animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
