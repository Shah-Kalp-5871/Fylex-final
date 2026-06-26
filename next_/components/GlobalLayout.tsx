"use client";
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import SmoothScroll from './SmoothScroll';
import { usePathname } from 'next/navigation';

export default function GlobalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAdminPath = pathname.startsWith('/admin');
  const hideHeader = ['/pre-configure'].includes(pathname);
  const hideFooter = ['/customize', '/login', '/signup', '/cart', '/checkout', '/pre-configure', '/configure', '/customer/configure', '/customer/discover'].includes(pathname);

  if (isAdminPath) {
    return <>{children}</>;
  }

  return (
    <SmoothScroll>
      {!hideHeader && <Header />}
      {children}
      {!hideFooter && <Footer />}
    </SmoothScroll>
  );
}
