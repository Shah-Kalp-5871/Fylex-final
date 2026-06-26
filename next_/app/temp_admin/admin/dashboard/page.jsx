"use client";
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const Dashboard = () => {
  const stats = {
    today_orders: 12, today_revenue: 4500, revenue_change: 15,
    total_orders: 450, orders_change: 10, total_products: 85,
    products_change: 5, total_customers: 1200, customers_change: 8,
  };

  const revenueData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Revenue', data: [1200, 1900, 1500, 2100, 2400, 1800, 2800],
      borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.06)',
      borderWidth: 3, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5,
      pointHoverBackgroundColor: '#6366f1', pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2
    }],
  };

  const orderDistData = {
    labels: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [{
      data: [5, 12, 8, 15, 45, 2],
      backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#0ea5e9', '#10b981', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 4
    }],
  };

  const recentOrders = [
    { id: '#ORD-7892', customer: 'John Doe', amount: 1250, date: 'Oct 25', status: 'pending' },
    { id: '#ORD-7891', customer: 'Jane Smith', amount: 850, date: 'Oct 24', status: 'delivered' },
    { id: '#ORD-7890', customer: 'Robert Brown', amount: 2100, date: 'Oct 24', status: 'shipped' },
    { id: '#ORD-7889', customer: 'Alice Wong', amount: 3200, date: 'Oct 23', status: 'processing' },
  ];

  const topProducts = [
    { name: 'Luxury Watch Alpha', sales: 45, revenue: 56250, stock: 12, trend: 15 },
    { name: 'Classic Gold Edition', sales: 32, revenue: 48000, stock: 5, trend: 8 },
    { name: 'Silver Diver', sales: 28, revenue: 25200, stock: 24, trend: -3 },
    { name: 'Sport Chrono', sales: 22, revenue: 19800, stock: 18, trend: 5 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Dashboard Overview</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4, fontWeight: 500 }}>Real-time insights and store performance metrics</p>
        </div>
        <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
          {['Today', '7D', '30D', '1Y'].map((label, i) => (
            <button 
              key={label}
              style={{ 
                padding: '10px 20px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: i === 1 ? '#fff' : 'transparent',
                color: i === 1 ? '#6366f1' : '#64748b',
                boxShadow: i === 1 ? '0 4px 12px rgba(99,102,241,0.08)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Daily Orders" value={stats.today_orders} change={12} icon="fas fa-shopping-bag" iconBg="#f5f3ff" iconColor="#6366f1" />
        <StatCard title="Revenue" value={`₹${stats.today_revenue.toLocaleString()}`} change={stats.revenue_change} icon="fas fa-wallet" iconBg="#ecfdf5" iconColor="#10b981" />
        <StatCard title="Total Customers" value="1,450" change={8} icon="fas fa-users" iconBg="#f0f9ff" iconColor="#0ea5e9" />
        <StatCard title="Stock Inventory" value="2,845" change={-3} icon="fas fa-box-open" iconBg="#fffbeb" iconColor="#f59e0b" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 admin-card" style={{ padding: 32, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: 0 }}>Revenue Analytics</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, marginTop: 4 }}>Weekly sales trend and distribution</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: '#6366f1', borderRadius: '50%' }}></span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Revenue (₹)</span>
            </div>
          </div>
          <div style={{ height: 320 }}>
            <Line data={revenueData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              interaction: { intersect: false, mode: 'index' },
              scales: {
                y: { display: true, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { size: 11, weight: 600 }, color: '#94a3b8', padding: 10 } },
                x: { grid: { display: false }, ticks: { font: { size: 11, weight: 600 }, color: '#94a3b8', padding: 10 } },
              },
            }} />
          </div>
        </div>

        <div className="admin-card" style={{ padding: 32, borderRadius: 16 }}>
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: 0 }}>Order Status</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, marginTop: 4 }}>Breakdown by fulfillment state</p>
          </div>
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={orderDistData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { 
                legend: { 
                  position: 'bottom', 
                  labels: { 
                    padding: 20, 
                    usePointStyle: true,
                    pointStyle: 'rectRounded',
                    font: { size: 11, weight: 700 }, 
                    color: '#64748b' 
                  } 
                } 
              },
              cutout: '72%',
            }} />
          </div>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>85%</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Success</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>2%</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Failed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="admin-card" style={{ borderRadius: 16 }}>
          <div className="admin-card-header" style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b' }}>Recent Orders</h3>
            <button style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>View All Orders</button>
          </div>
          <div style={{ padding: '12px 14px' }}>
            {recentOrders.map((order, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, transition: 'all 0.2s', gap: 12 }} className="hover-list-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: 1 }}>
                  <div style={{ width: 44, height: 44, background: '#f8fafc', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                    <i className="fas fa-receipt" style={{ color: '#6366f1', fontSize: 15 }}></i>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{order.id}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{order.customer} · {order.date}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>₹{order.amount.toLocaleString()}</div>
                  <span className={`status-pill ${order.status === 'delivered' ? 'pill-info' : order.status === 'shipped' ? 'pill-info' : 'pill-warning'}`} style={{ borderRadius: 8, padding: '4px 10px', marginTop: 4 }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing */}
        <div className="admin-card" style={{ borderRadius: 16 }}>
          <div className="admin-card-header" style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b' }}>Today's Top Products</h3>
            <button style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>Inventory Logs</button>
          </div>
          <div style={{ padding: '12px 14px' }}>
            {topProducts.map((product, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, transition: 'all 0.2s', gap: 12 }} className="hover-list-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: 1 }}>
                  <div style={{ width: 44, height: 44, background: '#f8fafc', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0 }}>
                    <i className="fas fa-image" style={{ color: '#cbd5e1', fontSize: 16 }}></i>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 1 }}>{product.sales} units sold · {product.stock} in stock</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>+₹{product.revenue.toLocaleString()}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: product.trend >= 0 ? '#10b981' : '#ef4444' }}>
                      {product.trend >= 0 ? '↑' : '↓'} {Math.abs(product.trend)}%
                    </span>
                    <div style={{ width: 40, height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: product.trend >= 0 ? '#10b981' : '#ef4444', opacity: 0.3, width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, iconBg, iconColor }) => (
  <div className="admin-card" style={{ padding: 24, borderRadius: 16, border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 52, height: 52, background: iconBg, color: iconColor, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: `1px solid ${iconColor}15`, flexShrink: 0 }}>
        <i className={icon}></i>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
          <span style={{ fontSize: 11, fontWeight: 800, color: change >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
            {change >= 0 ? '↑' : '↓'}{Math.abs(change)}%
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;
