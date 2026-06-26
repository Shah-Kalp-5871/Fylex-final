"use client";
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Link from 'next/link';
import { dashboardService } from '@/services';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

// ── Status badge helper (matches Laravel status-badge classes) ──────────────
const statusColors = {
  pending:    { bg: '#fef3c7', color: '#92400e' },
  confirmed:  { bg: '#dbeafe', color: '#1e40af' },
  processing: { bg: '#e0e7ff', color: '#3730a3' },
  shipped:    { bg: '#f0f9ff', color: '#0369a1' },
  delivered:  { bg: '#f0fdf4', color: '#166534' },
  cancelled:  { bg: '#fef2f2', color: '#991b1b' },
  refunded:   { bg: '#f5f3ff', color: '#5b21b6' },
};

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase() || 'pending';
  const { bg, color } = statusColors[s] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 12px',
      borderRadius: 9999,
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'capitalize',
      background: bg,
      color,
    }}>
      {status}
    </span>
  );
};

// ── Stat Card  ───────────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, changePeriod, icon, iconGradient }) => {
  const changeNum = parseFloat(change) || 0;
  const isPos = changeNum >= 0;

  return (
    <div className="admin-card" style={{
      padding: 24,
      borderRadius: 18,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--admin-shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text-muted)', margin: 0, textTransform: 'none' }}>
            {title}
          </p>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--admin-text)', margin: '4px 0', letterSpacing: '-0.02em' }}>
            {value ?? '—'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: isPos ? 'var(--admin-success)' : 'var(--admin-danger)' }}>
              <i className={`fas fa-arrow-${isPos ? 'up' : 'down'}`} style={{ marginRight: 3 }}></i>
              {Math.abs(changeNum)}%
            </span>
            <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', fontWeight: 500 }}>
              {changePeriod || 'this month'}
            </span>
          </div>
        </div>
        <div style={{
          width: 50,
          height: 50,
          borderRadius: 14,
          background: iconGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginLeft: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}>
          <i className={icon} style={{ color: '#fff', fontSize: 18 }}></i>
        </div>
      </div>
    </div>
  );
};

// ── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon, message }) => (
  <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--admin-text-muted)' }}>
    <i className={icon} style={{ fontSize: 28, marginBottom: 10, display: 'block', opacity: 0.4 }}></i>
    <p style={{ fontSize: 13, margin: 0 }}>{message}</p>
  </div>
);

// ── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueView, setRevenueView] = useState('weekly'); // 'weekly' | 'monthly'
  const [orderView, setOrderView] = useState('status'); // 'status' | 'category'

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await dashboardService.getDashboard();
    if (err) {
      setError(err);
    } else {
      setDashData(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return <Loader message="Loading dashboard..." />;
  if (error)   return <ErrorBanner message={error} onRetry={fetchDashboard} />;

  // ── Data extraction with safe fallbacks ──────────────────────
  const stats = dashData?.stats || {};
  const recentOrders = dashData?.recentOrders || dashData?.recent_orders || [];
  const topProducts  = dashData?.topProducts  || dashData?.top_products  || [];
  const recentCustomers = dashData?.recentCustomers || dashData?.recent_customers || [];
  const salesByPayment  = dashData?.salesByPaymentMethod || dashData?.sales_by_payment || [];
  const visitorStats    = dashData?.visitorStats || dashData?.visitor_stats || {};

  const revenueLabels  = dashData?.revenueChartData?.labels || dashData?.revenue_chart?.labels || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const revenueValues  = dashData?.revenueChartData?.data   || dashData?.revenue_chart?.data   || [];
  const monthlyLabels  = dashData?.monthlyRevenue?.labels   || dashData?.monthly_revenue?.labels || [];
  const monthlyValues  = dashData?.monthlyRevenue?.data     || dashData?.monthly_revenue?.data   || [];
  const orderDist      = dashData?.orderStatusDistribution  || dashData?.order_status_dist || {};

  const activeRevLabels = revenueView === 'weekly' ? revenueLabels : monthlyLabels;
  const activeRevValues = revenueView === 'weekly' ? revenueValues : monthlyValues;

  // Chart configs
  const revenueChartData = {
    labels: activeRevLabels,
    datasets: [{
      label: 'Revenue',
      data: activeRevValues,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.08)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const orderChartData = {
    labels: Object.keys(orderDist),
    datasets: [{
      data: Object.values(orderDist),
      backgroundColor: ['#f59e0b','#3b82f6','#8b5cf6','#0ea5e9','#10b981','#ef4444','#6366f1','#64748b'],
      borderWidth: 0,
      hoverOffset: 12,
    }],
  };

  const chartBaseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  const mainStatCards = [
    {
      title: 'Total Revenue',
      value: `₹${Number(stats.total_revenue || stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      change: stats.revenue_change ?? stats.revenueChange ?? 0,
      changePeriod: 'This month',
      icon: 'fas fa-rupee-sign',
      iconGradient: 'linear-gradient(135deg, #34d399, #059669)',
    },
    {
      title: 'Total Orders',
      value: Number(stats.total_orders || stats.totalOrders || 0).toLocaleString(),
      change: stats.orders_change ?? stats.ordersChange ?? 0,
      changePeriod: 'This month',
      icon: 'fas fa-shopping-cart',
      iconGradient: 'linear-gradient(135deg, #38bdf8, #0284c7)',
    },
    {
      title: 'Total Products',
      value: Number(stats.total_products || stats.totalProducts || 0).toLocaleString(),
      change: stats.products_change ?? stats.productsChange ?? 0,
      changePeriod: 'New this month',
      icon: 'fas fa-box',
      iconGradient: 'linear-gradient(135deg, #818cf8, #4f46e5)',
    },
    {
      title: 'Total Customers',
      value: Number(stats.total_customers || stats.totalCustomers || 0).toLocaleString(),
      change: stats.customers_change ?? stats.customersChange ?? 0,
      changePeriod: 'New this month',
      icon: 'fas fa-users',
      iconGradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
    },
  ];

  const quickStatCards = [
    {
      title: "Today's Orders",
      value: Number(stats.today_orders ?? stats.todayOrders ?? 0).toLocaleString(),
      change: stats.yesterday_orders > 0
        ? (((stats.today_orders - stats.yesterday_orders) / stats.yesterday_orders) * 100).toFixed(1)
        : 100,
      changePeriod: 'from yesterday',
      icon: 'fas fa-shopping-cart',
      iconGradient: 'linear-gradient(135deg, #38bdf8, #0284c7)',
    },
    {
      title: "Today's Revenue",
      value: `₹${Number(stats.today_revenue ?? stats.todayRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      change: stats.yesterday_revenue > 0
        ? (((stats.today_revenue - stats.yesterday_revenue) / stats.yesterday_revenue) * 100).toFixed(1)
        : 100,
      changePeriod: 'from yesterday',
      icon: 'fas fa-rupee-sign',
      iconGradient: 'linear-gradient(135deg, #34d399, #059669)',
    },
    {
      title: 'Pending Orders',
      value: Number(stats.pending_orders ?? stats.pendingOrders ?? 0).toLocaleString(),
      change: null,
      changePeriod: 'Needs attention',
      icon: 'fas fa-clock',
      iconGradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
    },
    {
      title: 'Low Stock',
      value: Number(stats.low_stock_products ?? stats.lowStockProducts ?? 0).toLocaleString(),
      change: null,
      changePeriod: `${stats.out_of_stock_products ?? 0} out of stock`,
      icon: 'fas fa-box',
      iconGradient: 'linear-gradient(135deg, #f87171, #dc2626)',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page Title & Cute Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-banner-content">
          <h2 className="welcome-banner-title">
            Welcome back, Admin! <span className="welcome-banner-waving">👋</span>
          </h2>
          <p className="welcome-banner-text">
            Here's what's happening with your store today. Have a great day managing <img src="/fylex.png" alt="Fylex" style={{ height: '2.5em', display: 'inline-block', verticalAlign: 'middle', transform: 'translateY(-0.1em)' }} />!
          </p>
        </div>
        <div className="welcome-banner-illustration hidden md:flex">
          <i className="fas fa-rocket"></i>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {quickStatCards.map((card, i) => (
          <div key={i} className="admin-card" style={{ padding: '20px 24px', borderRadius: 16, transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--admin-shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-muted)', margin: 0 }}>{card.title}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', margin: '4px 0', letterSpacing: '-0.02em' }}>{card.value}</p>
                <p style={{ fontSize: 12, color: card.change !== null && card.change >= 0 ? 'var(--admin-success)' : 'var(--admin-text-muted)', margin: 0, fontWeight: 500 }}>
                  {card.change !== null ? (
                    <><i className={`fas fa-arrow-${card.change >= 0 ? 'up' : 'down'}`} style={{ marginRight: 3 }}></i>{Math.abs(card.change)}% </>
                  ) : ''}
                  {card.changePeriod}
                </p>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: card.iconGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={card.icon} style={{ color: '#fff', fontSize: 18 }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {mainStatCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="admin-card" style={{ padding: 24, borderRadius: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>Revenue Trend</h3>
            </div>
            <div style={{ display: 'flex', gap: 6, background: 'var(--admin-bg)', padding: 3, borderRadius: 8 }}>
              {['weekly', 'monthly'].map(v => (
                <button key={v} onClick={() => setRevenueView(v)}
                  style={{
                    padding: '5px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: revenueView === v ? '#fff' : 'transparent',
                    color: revenueView === v ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
                    boxShadow: revenueView === v ? 'var(--admin-shadow-xs)' : 'none',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize',
                  }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 280 }}>
            <Line data={revenueChartData} options={{
              ...chartBaseOptions,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `Revenue: ₹${Number(ctx.raw).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                  },
                },
              },
              scales: {
                y: { beginAtZero: true, grid: { color: 'var(--admin-border-light)' }, ticks: { callback: v => `₹${v.toLocaleString()}`, fontSize: 11 } },
                x: { grid: { display: false } },
              },
            }} />
          </div>
        </div>

        {/* Order Distribution */}
        <div className="admin-card" style={{ padding: 24, borderRadius: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', margin: 0 }}>Order Distribution</h3>
            <div style={{ display: 'flex', gap: 6, background: 'var(--admin-bg)', padding: 3, borderRadius: 8 }}>
              {['status', 'category'].map(v => (
                <button key={v} onClick={() => setOrderView(v)}
                  style={{
                    padding: '5px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: orderView === v ? '#fff' : 'transparent',
                    color: orderView === v ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
                    boxShadow: orderView === v ? 'var(--admin-shadow-xs)' : 'none',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize',
                  }}>
                  By {v}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 280 }}>
            {Object.keys(orderDist).length > 0 ? (
              <Doughnut data={orderChartData} options={{
                ...chartBaseOptions,
                cutout: '65%',
                plugins: {
                  legend: { position: 'right', labels: { boxWidth: 10, padding: 14, font: { size: 11, weight: '600' }, color: 'var(--admin-text-secondary)' } },
                  tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} orders` } },
                },
              }} />
            ) : (
              <EmptyState icon="fas fa-chart-pie" message="No order distribution data" />
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="admin-card" style={{ borderRadius: 18 }}>
          <div className="admin-card-header">
            <h3>Recent Orders</h3>
            <Link href="/admin/orders" style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-primary)', textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          <div style={{ padding: '8px 16px 16px' }}>
            {recentOrders.length === 0 ? (
              <EmptyState icon="fas fa-shopping-cart" message="No recent orders" />
            ) : (
              recentOrders.map((order, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 12px', borderRadius: 12, border: '1px solid var(--admin-border-light)', marginBottom: 8, transition: 'all 0.15s', background: '#fafbff' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--admin-border)'; e.currentTarget.style.background = '#f6f8fc'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--admin-border-light)'; e.currentTarget.style.background = '#fafbff'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    <div style={{ width: 36, height: 36, background: 'var(--admin-primary-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fas fa-shopping-bag" style={{ color: 'var(--admin-primary)', fontSize: 14 }}></i>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.orderNumber || order.order_number || `#${order.id}`}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', margin: 0, fontWeight: 500 }}>
                        {order.customer?.name || order.customer || order.customer_name} · ₹{Number(order.amount || order.grandTotal || order.grand_total || 0).toLocaleString('en-IN')} · {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order.date || order.created_at)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="admin-card" style={{ borderRadius: 18 }}>
          <div className="admin-card-header">
            <h3>Top Products</h3>
            <Link href="/admin/products" style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-primary)', textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          <div style={{ padding: '8px 16px 16px' }}>
            {topProducts.length === 0 ? (
              <EmptyState icon="fas fa-box" message="No products sold yet" />
            ) : (
              topProducts.map((product, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: 12, border: '1px solid var(--admin-border-light)', marginBottom: 8, background: '#fafbff', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--admin-border)'; e.currentTarget.style.background = '#f6f8fc'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--admin-border-light)'; e.currentTarget.style.background = '#fafbff'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--admin-primary-light), #ddd6fe)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fas fa-box" style={{ color: 'var(--admin-primary)', fontSize: 14 }}></i>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', margin: 0, fontWeight: 500 }}>
                        {product.sales} sales · ₹{Number(product.revenue || 0).toLocaleString('en-IN')} revenue
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--admin-success)', flexShrink: 0, marginLeft: 8 }}>
                    ₹{Number(product.price || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Customers + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Customers (2/3 width) */}
        <div className="admin-card lg:col-span-2" style={{ borderRadius: 18 }}>
          <div className="admin-card-header">
            <h3>Recent Customers</h3>
            <Link href="/admin/users" style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-primary)', textDecoration: 'none' }}>View All</Link>
          </div>
          <div style={{ padding: '12px 16px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {recentCustomers.length === 0 ? (
              <div style={{ gridColumn: '1 / -1' }}>
                <EmptyState icon="fas fa-users" message="No recent customers" />
              </div>
            ) : recentCustomers.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12, border: '1px solid var(--admin-border-light)', background: '#fafbff', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--admin-border)'; e.currentTarget.style.background = '#f6f8fc'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--admin-border-light)'; e.currentTarget.style.background = '#fafbff'; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {(c.avatar || (c.name || '?')[0]).toString().toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
                </div>
                <span style={{ fontSize: 11, color: 'var(--admin-text-muted)', flexShrink: 0, fontWeight: 500 }}>{c.joined || c.created_at}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Payment */}
        <div className="admin-card" style={{ borderRadius: 18 }}>
          <div className="admin-card-header">
            <h3>Sales by Payment</h3>
          </div>
          <div style={{ padding: '12px 16px 16px' }}>
            {salesByPayment.length === 0 ? (
              <EmptyState icon="fas fa-credit-card" message="No payment data" />
            ) : salesByPayment.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < salesByPayment.length - 1 ? '1px dashed var(--admin-border-light)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <div style={{ width: 32, height: 32, background: 'var(--admin-primary-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="fas fa-credit-card" style={{ color: 'var(--admin-primary)', fontSize: 12 }}></i>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--admin-text)', margin: 0 }}>₹{Number(m.total_amount || m.totalAmount || 0).toLocaleString('en-IN')}</p>
                  <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', margin: 0 }}>{m.order_count || m.orderCount || 0} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visitor Stats */}
      {(visitorStats.today_unique !== undefined || visitorStats.todayUnique !== undefined) && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 16 }}>Unique Visitor Tracking</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Today's Visitors", value: visitorStats.today_unique ?? visitorStats.todayUnique ?? 0, sub: 'Unique daily visits', icon: 'fas fa-user-check', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
              { title: "This Month's Visitors", value: visitorStats.monthly_unique ?? visitorStats.monthlyUnique ?? 0, sub: visitorStats.current_month ?? visitorStats.currentMonth ?? '', icon: 'fas fa-calendar-check', gradient: 'linear-gradient(135deg, #818cf8, #6366f1)' },
              { title: 'Total Unique Visitors', value: visitorStats.total_unique ?? visitorStats.totalUnique ?? 0, sub: 'All time records', icon: 'fas fa-users', gradient: 'linear-gradient(135deg, #c084fc, #a855f7)' },
            ].map((v, i) => (
              <div key={i} className="admin-card" style={{ padding: '20px 24px', borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-muted)', margin: 0 }}>{v.title}</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--admin-text)', margin: '4px 0', letterSpacing: '-0.02em' }}>{Number(v.value).toLocaleString()}</p>
                    <p style={{ fontSize: 11, color: 'var(--admin-text-muted)', margin: 0 }}>{v.sub}</p>
                  </div>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: v.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={v.icon} style={{ color: '#fff', fontSize: 16 }}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
