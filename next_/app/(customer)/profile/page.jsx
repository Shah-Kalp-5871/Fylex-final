"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchProfileDashboardApi, updateMyProfileApi } from '@/lib/api';
import { getFileUrl } from '@/lib/utils';
import { orderService } from '@/services';
import './profile.css';

const emptyDashboard = {
  profile: null,
  stats: { totalOrders: 0, activeOrders: 0, totalSpent: 0, wishlistCount: 0 },
  recentOrders: [],
  orderHistory: [],
  trackingOrders: [],
  latestOrderTracking: null,
};

const statusStyles = {
  PENDING:    'status-processing',
  CONFIRMED:  'status-processing',
  PROCESSING: 'status-processing',
  SHIPPED:    'status-shipped',
  DELIVERED:  'status-delivered',
  CANCELLED:  'status-cancelled',
  FAILED:     'status-cancelled',
};

const Profile = () => {
  const { logout, loading, isAuthenticated, verifySession } = useAuth();
  const navigate = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState('');
  const [settingsForm, setSettingsForm] = useState({ name: '', mobile: '', address: '' });

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate.replace('/login');
  }, [isAuthenticated, loading, navigate]);

  const loadDashboard = async () => {
    setDashboardLoading(true);
    setDashboardError('');
    const result = await fetchProfileDashboardApi();
    if (!result?.success || !result?.data?.profile) {
      setDashboardError(result?.error || 'Unable to load your profile.');
      setDashboardLoading(false);
      return;
    }
    setDashboard(result.data);
    setSelectedTrackingOrderId(result.data.latestOrderTracking?.orderId || result.data.trackingOrders?.[0]?.orderId || '');
    setSettingsForm({
      name: result.data.profile.name || '',
      mobile: result.data.profile.mobile || '',
      address: result.data.profile.address || '',
    });
    setDashboardLoading(false);
  };

  useEffect(() => {
    if (!loading && isAuthenticated) loadDashboard();
  }, [loading, isAuthenticated]);

  const handleProfileUpdate = async () => {
    if (!settingsForm.name.trim()) { setDashboardError('Full name is required.'); return; }
    setSaving(true); setSaveMessage('');
    const result = await updateMyProfileApi({
      name: settingsForm.name.trim(),
      mobile: settingsForm.mobile.trim() || undefined,
      address: settingsForm.address.trim() || undefined,
    });
    if (!result?.success) { setDashboardError(result?.error || 'Update failed.'); setSaving(false); return; }
    await verifySession();
    await loadDashboard();
    setSaveMessage('Profile updated successfully.');
    setSaving(false);
  };

  if (loading || !isAuthenticated || dashboardLoading) {
    return (
      <div className="profile-spinner-wrap">
        <div className="profile-spinner"></div>
      </div>
    );
  }

  const { profile, stats, recentOrders, orderHistory, trackingOrders } = dashboard;
  const tracking = trackingOrders.find(o => o.orderId === selectedTrackingOrderId) || dashboard.latestOrderTracking;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'orders',   label: 'History',  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { id: 'track',    label: 'Tracking', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'settings', label: 'Settings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg> },
  ];

  return (
    <div className="profile-page-wrapper">
      <div className="profile-bg-blob blob-1"></div>
      <div className="profile-bg-blob blob-2"></div>

      <div className="profile-container">
        {/* MOBILE HEADER */}
        <header className="mobile-header">
          <div className="mobile-avatar">
            {profile?.name ? profile.name[0] : (profile?.email ? profile.email[0] : '?')}
          </div>
          <div className="mobile-user-info">
            <h2>{profile?.name || 'Member'}</h2>
            <div className="mobile-status">Heritage Member</div>
          </div>
        </header>

        {/* MOBILE NAV */}
        <nav className="mobile-nav">
          {tabs.map(tab => (
            <button key={tab.id} className={`mobile-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.icon}
            </button>
          ))}
          <button className="mobile-nav-item" style={{ color: '#ef4444' }} onClick={() => { logout(); navigate.push('/'); }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </nav>

        {/* DESKTOP SIDEBAR */}
        <aside className="profile-sidebar">
          <div className="user-profile-header">
            <div className="profile-avatar-large">
              {profile?.name ? profile.name[0] : (profile?.email ? profile.email[0] : '?')}
            </div>
            <h2 className="profile-name-title">{profile?.name || 'Member'}</h2>
            <span className="profile-tag">Heritage Member</span>
          </div>
          <ul className="profile-nav-list">
            {tabs.map(tab => (
              <li key={tab.id} className={`profile-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.icon} {tab.label}
              </li>
            ))}
          </ul>
          <div className="logout-pill" onClick={() => { logout(); navigate.push('/'); }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </div>
          <Link href="/" className="back-to-home">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Return to Store
          </Link>
        </aside>

        {/* MAIN CONTENT */}
        <main className="profile-main-content">
          {dashboardError && <div className="profile-message error">{dashboardError}</div>}
          {saveMessage   && <div className="profile-message success">{saveMessage}</div>}

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <h1 className="section-title">The Collection Overview</h1>
              <p className="section-subtitle">Monitor your heritage pieces and manage your Fylexx journey.</p>

              <div className="stats-cluster">
                <div className="stat-box">
                  <span className="stat-lbl">Total Orders</span>
                  <span className="stat-val">{stats.totalOrders.toString().padStart(2, '0')}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-lbl">Active Orders</span>
                  <span className="stat-val">{stats.activeOrders.toString().padStart(2, '0')}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-lbl">Wishlist Items</span>
                  <span className="stat-val">{stats.wishlistCount.toString().padStart(2, '0')}</span>
                </div>
              </div>

              <h3 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--navy)', marginBottom: '20px' }}>Recent Acquisitions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentOrders.length > 0 ? recentOrders.map(order => (
                  <div key={order.id} className="order-card-premium">
                    <img src={getFileUrl(order.preview?.image) || '/assets/fylex-watch-v2/premium.png'} alt="Product" className="item-thumb" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>#{order.orderNumber || order.id}</span>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--navy)', marginTop: '2px' }}>{order.preview?.title || 'Bespoke Timepiece'}</h4>
                      <div className="md:hidden" style={{ marginTop: '8px' }}>
                        <span className={`item-status-pill ${statusStyles[order.status?.toUpperCase()] || 'status-processing'}`}>{order.status}</span>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <span className={`item-status-pill ${statusStyles[order.status?.toUpperCase()] || 'status-processing'}`}>{order.status}</span>
                    </div>
                  </div>
                )) : <div className="empty-state">No recent acquisitions.</div>}
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === 'orders' && (
            <div className="tab-pane">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h1 className="section-title" style={{ marginBottom: 0 }}>Acquisition History</h1>
                <button 
                  onClick={() => setDashboard(prev => ({ ...prev, orderHistory: [] }))}
                  style={{ background: 'transparent', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#64748b' }}
                >
                  Clear History
                </button>
              </div>
              <p className="section-subtitle">A complete record of all {stats.totalOrders} orders.</p>

              {/* Desktop table */}
              <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                <table className="order-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Timepiece</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map(order => (
                      <tr key={order.id}>
                        <td className="col-id">#{order.orderNumber || order.id}</td>
                        <td className="col-date">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                        <td className="col-name">{order.preview?.title || 'Watch'}</td>
                        <td className="col-amt">₹{Number(order.grandTotal || 0).toLocaleString('en-IN')}</td>
                        <td><span className={`item-status-pill ${statusStyles[order.status?.toUpperCase()] || 'status-processing'}`}>{order.status}</span></td>
                        <td>
                          <button 
                            onClick={() => orderService.downloadInvoice(order.id, true)}
                            title="Download Invoice"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--navy)', padding: '4px' }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {orderHistory.map(order => (
                  <div key={order.id} className="mobile-order-card">
                    <div className="m-order-info">
                      <span className="m-order-num">#{order.orderNumber || order.id}</span>
                      <span className="m-order-name">{order.preview?.title || 'Watch'}</span>
                      <span className="m-order-date">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="m-order-price" style={{ marginBottom: '6px' }}>₹{Number(order.grandTotal || 0).toLocaleString('en-IN')}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => orderService.downloadInvoice(order.id, true)}
                          title="Download Invoice"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--navy)' }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                        <span className={`item-status-pill ${statusStyles[order.status?.toUpperCase()] || 'status-processing'}`}>{order.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TRACKING ── */}
          {activeTab === 'track' && (
            <div className="tab-pane">
              <h1 className="section-title">Timeline & Tracking</h1>
              <p className="section-subtitle">Select an order to view its real-time progress.</p>

              {trackingOrders.length > 0 && (
                <select
                  value={selectedTrackingOrderId}
                  onChange={e => setSelectedTrackingOrderId(e.target.value)}
                  className="tracking-select"
                >
                  {trackingOrders.map(order => (
                    <option key={order.orderId} value={order.orderId}>{order.orderNumber} | {order.preview?.title || 'Watch'}</option>
                  ))}
                </select>
              )}

              {tracking ? (
                <div className="tracking-viz">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
                    <div>
                      <span style={{ fontSize: '9px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700 }}>Current Journey</span>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 500, marginTop: '4px' }}>Order #{tracking.orderNumber}</h4>
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(255,255,255,0.07)', padding: '5px 12px', borderRadius: '999px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-light)' }}>{tracking.currentStatus}</span>
                  </div>

                  {/* Desktop timeline */}
                  <div className="hidden md:block" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="track-progress-container">
                      <div className="track-bar-bg"></div>
                      <div className="track-bar" style={{ width: `${Math.max(14, (tracking.timeline.filter(s => s.completed).length / tracking.timeline.length) * 100)}%` }}></div>
                      <div className="track-nodes">
                        {tracking.timeline.map(step => (
                          <div key={step.label} className={`node ${step.completed ? 'completed' : ''}`}>
                            <div className={`node-label ${step.completed ? 'active' : ''}`}>{step.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile timeline */}
                  <div className="md:hidden vertical-timeline">
                    {tracking.timeline.map(step => (
                      <div key={step.label} className="v-step">
                        <div className={`v-node ${step.completed ? 'completed' : ''}`}></div>
                        <div className="v-info">
                          <h4>{step.label}</h4>
                          <p>{step.date ? new Date(step.date).toLocaleString('en-IN') : 'Pending'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">No timelines available.</div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <div className="tab-pane">
              <h1 className="section-title">Security & Profile</h1>
              <p className="section-subtitle">Maintain your profile and secure your experience.</p>

              <div className="settings-card">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
                  <div className="form-field">
                    <label className="form-label">Full Name</label>
                    <input type="text" value={settingsForm.name} onChange={e => setSettingsForm(p => ({ ...p, name: e.target.value }))} className="form-input" placeholder="Enter full name" />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Mobile Number</label>
                    <input type="text" value={settingsForm.mobile} onChange={e => setSettingsForm(p => ({ ...p, mobile: e.target.value }))} className="form-input" placeholder="Enter mobile number" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
                  <div className="form-field">
                    <label className="form-label form-label-muted">Digital Address</label>
                    <input type="email" value={profile?.email || ''} className="form-input" disabled />
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-muted">Member Since</label>
                    <input type="text" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : 'N/A'} className="form-input" disabled />
                  </div>
                </div>

                <div className="form-field" style={{ marginBottom: '32px' }}>
                  <label className="form-label">Address</label>
                  <textarea rows="3" value={settingsForm.address} onChange={e => setSettingsForm(p => ({ ...p, address: e.target.value }))} className="form-textarea form-input" placeholder="Enter your full address…" />
                </div>

                <hr className="settings-divider" />

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '20px' }}>
                  <button onClick={handleProfileUpdate} disabled={saving} className="primary-btn">
                    {saving ? 'Updating…' : 'Update Registry'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;