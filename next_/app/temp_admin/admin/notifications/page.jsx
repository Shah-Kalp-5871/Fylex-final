"use client";
import React, { useState } from 'react';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';


const NotificationList = () => {
    const [notifications] = useState([
        { id: 1, title: 'New Order Received', message: 'Order #FLX-1024 has been placed by John Doe.', type: 'order', is_read: false, created_at: '2 mins ago' },
        { id: 2, title: 'Low Stock Alert', message: 'Luxury Chronograph is below 5 units.', type: 'inventory', is_read: false, created_at: '1 hour ago' },
        { id: 3, title: 'System Update', message: 'The admin panel has been updated to v2.4.0.', type: 'system', is_read: true, created_at: '2 days ago' },
    ]);

    const iconMap = {
        order: { icon: 'fa-shopping-bag', bg: '#ecfdf5', color: '#059669' },
        inventory: { icon: 'fa-box-open', bg: '#fffbeb', color: '#d97706' },
        system: { icon: 'fa-info-circle', bg: '#f8fafc', color: '#64748b' },
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Notifications</h2>
                    <p style={{ color: '#64748b', fontSize: 14, marginTop: 4, fontWeight: 500 }}>Stay updated with store activities and system alerts</p>
                </div>
                <button className="btn-indigo-gradient">
                    <i className="fas fa-check-double mr-2" style={{ fontSize: 12 }}></i>Mark All Read
                </button>
            </div>

            <div className="admin-card" style={{ padding: '20px 24px', borderRadius: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="admin-search" style={{ flex: 2, minWidth: 300 }}>
                        <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
                        <input 
                            type="text" 
                            placeholder="Search notifications..." 
                            style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '11px 16px 11px 42px' }} 
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <select style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#4b5a7a', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                            <option>All Alerts</option>
                            <option>Orders</option>
                            <option>Inventory</option>
                            <option>System</option>
                        </select>
                    </div>
                    <button className="btn-filter-dark">
                        <i className="fas fa-filter mr-2"></i> Filter
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {notifications.map((n) => {
                    const { icon, bg, color } = iconMap[n.type] || iconMap.system;
                    return (
                        <div key={n.id} className="admin-card" style={{ padding: 20, borderRadius: 16, opacity: n.is_read ? 0.7 : 1, border: n.is_read ? '1px solid #f1f5f9' : '1px solid #eef2ff', background: n.is_read ? '#fff' : '#fcfdff', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: n.is_read ? bg : '#fff', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, border: !n.is_read ? `1px solid ${color}20` : 'none', boxShadow: !n.is_read ? `0 4px 12px ${color}15` : 'none' }}>
                                    <i className={`fas ${icon}`}></i>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <h4 style={{ fontSize: 15, fontWeight: n.is_read ? 600 : 700, color: n.is_read ? '#475569' : '#1e293b', margin: 0 }}>{n.title}</h4>
                                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, flexShrink: 0, marginLeft: 12 }}>{n.created_at}</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                                </div>
                                {!n.is_read && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 6, boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)' }}></div>}
                            </div>
                        </div>
                    );
                })}

                {notifications.length === 0 && (
                    <div className="admin-card" style={{ padding: 60, textAlign: 'center', borderRadius: 16 }}>
                        <div style={{ width: 64, height: 64, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <i className="fas fa-bell-slash" style={{ fontSize: 24, color: '#cbd5e1' }}></i>
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>All caught up!</h3>
                        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>No new notifications to show.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
