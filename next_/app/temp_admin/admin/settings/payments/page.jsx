"use client";
import React, { useState, useEffect, useRef } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import { useToast } from '@/context/ToastContext';
import AdminModal from '@/components/admin/AdminModal';

const PaymentSettings = () => {
    const { data, updateRecord } = useAdminData();
    const { showToast } = useToast();
    const transactions = data.transactions || [];
    const settings = data.siteSettings?.[0] || {};
    
    const [activeTab, setActiveTab] = useState('gateways');
    const [form, setForm] = useState(settings);
    const [editingGateway, setEditingGateway] = useState(null);
    const tableRef = useRef(null);
    const [table, setTable] = useState(null);

    useEffect(() => {
        setForm(settings);
    }, [settings.id]);

    useEffect(() => {
        if (activeTab === 'transactions' && tableRef.current && !table) {
            const tabulator = new Tabulator(tableRef.current, {
                data: transactions,
                layout: "fitDataFill",
                responsiveLayout: false,
                pagination: "local",
                paginationSize: 10,
                columns: [
                    {
                        title: "TXN ID", field: "txn_id", width: 180,
                        formatter: (cell) => `<span style="font-family:'SF Mono',monospace;font-size:11px;font-weight:600;color:#64748b;letter-spacing:0.02em">${cell.getValue()}</span>`
                    },
                    {
                        title: "ORDER", field: "order_id", width: 120,
                        formatter: (cell) => `<span style="font-weight:700;color:#1e293b;font-size:14px">#${cell.getValue()}</span>`
                    },
                    {
                        title: "METHOD", field: "method", width: 160,
                        formatter: (cell) => {
                            const v = cell.getValue();
                            const icon = v === 'Razorpay' ? 'fa-credit-card' : 'fab fa-stripe';
                            return `<div style="display:flex;align-items:center;gap:8px"><i class="fas ${icon}" style="color:#94a3b8;font-size:12px"></i><span style="font-weight:600;color:#475569">${v}</span></div>`;
                        }
                    },
                    {
                        title: "AMOUNT", field: "amount", width: 140, hozAlign: "center",
                        formatter: (cell) => `<span style="font-weight:800;color:#1e293b;font-size:14px">${cell.getValue()}</span>`
                    },
                    {
                        title: "STATUS", field: "status", width: 120, hozAlign: "center",
                        formatter: (cell) => {
                            const v = cell.getValue();
                            return `<span class="status-pill ${v === 'Success' ? 'pill-info' : 'pill-inactive'}" style="border-radius:8px;padding:4px 12px">${v?.toUpperCase()}</span>`;
                        }
                    },
                    {
                        title: "TIMESTAMP", field: "date", width: 180, hozAlign: "right",
                        formatter: (cell) => `<span style="font-size:12px;color:#94a3b8;font-weight:500">${cell.getValue()}</span>`
                    }
                ],
            });
            setTable(tabulator);
        } else if (table && activeTab === 'transactions') {
            table.replaceData(transactions);
        }
    }, [activeTab, transactions, table]);

    const handleSave = () => {
        updateRecord('siteSettings', settings.id, form);
        showToast('Payment settings saved successfully!', 'success');
        setEditingGateway(null);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Payment Gateways</h2>
                    <p style={{ color: '#64748b', fontSize: 14, marginTop: 4, fontWeight: 500 }}>Manage store's payment methods, API credentials, and transaction logs</p>
                </div>
                <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
                    <button 
                        style={{ 
                            padding: '10px 24px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            background: activeTab === 'gateways' ? '#fff' : 'transparent',
                            color: activeTab === 'gateways' ? '#6366f1' : '#64748b',
                            boxShadow: activeTab === 'gateways' ? '0 4px 12px rgba(99,102,241,0.08)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onClick={() => setActiveTab('gateways')}
                    >
                        GATEWAYS
                    </button>
                    <button 
                        style={{ 
                            padding: '10px 24px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            background: activeTab === 'transactions' ? '#fff' : 'transparent',
                            color: activeTab === 'transactions' ? '#6366f1' : '#64748b',
                            boxShadow: activeTab === 'transactions' ? '0 4px 12px rgba(99,102,241,0.08)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onClick={() => setActiveTab('transactions')}
                    >
                        TRANSACTIONS
                    </button>
                </div>
            </div>

            {activeTab === 'gateways' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
                    {/* Razorpay Card */}
                    <div className="admin-card" style={{ borderRadius: 16 }}>
                        <div style={{ padding: 28 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f5f3ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(99,102,241,0.1)' }}>
                                        <i className="fas fa-credit-card"></i>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>Razorpay</h3>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>India Domestic</span>
                                    </div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 28, fontWeight: 500 }}>Accept UPI, Netbanking, Wallts, and Indian cards. Highly optimized for India checkout flow.</p>
                            <button className="btn-filter-dark" style={{ width: '100%', height: 44, borderRadius: 10 }} onClick={() => setEditingGateway('razorpay')}>
                                <i className="fas fa-cog mr-2" style={{ fontSize: 12 }}></i>Configure Razorpay
                            </button>
                        </div>
                    </div>

                    {/* Stripe Card */}
                    <div className="admin-card" style={{ borderRadius: 16 }}>
                        <div style={{ padding: 28 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(59,130,246,0.1)' }}>
                                        <i className="fab fa-stripe-s"></i>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>Stripe</h3>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>International</span>
                                    </div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 28, fontWeight: 500 }}>Enable global payments with Apple Pay, G-Pay, and foreign cards. Supports multiple currencies.</p>
                            <button className="btn-filter-dark" style={{ width: '100%', height: 44, borderRadius: 10 }} onClick={() => setEditingGateway('stripe')}>
                                <i className="fas fa-cog mr-2" style={{ fontSize: 12 }}></i>Configure Stripe
                            </button>
                        </div>
                    </div>

                    {/* COD Card */}
                    <div className="admin-card" style={{ borderRadius: 16 }}>
                        <div style={{ padding: 28 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(21,128,61,0.1)' }}>
                                        <i className="fas fa-truck-loading"></i>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>COD</h3>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cash / QR Offline</span>
                                    </div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked={form.codEnabled || false} onChange={e => setForm({...form, codEnabled: e.target.checked})} />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 28, fontWeight: 500 }}>Maintain manual payments on delivery. Set order limits, verification steps, and fees.</p>
                            <button className="btn-filter-dark" style={{ width: '100%', height: 44, borderRadius: 10 }} onClick={() => setEditingGateway('cod')}>
                                <i className="fas fa-cog mr-2" style={{ fontSize: 12 }}></i>Configure COD
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="admin-card" style={{ padding: '20px 24px', borderRadius: 16, marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div className="admin-search" style={{ flex: 2, minWidth: 300 }}>
                                <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
                                <input 
                                    type="text" 
                                    placeholder="Search by ID, Order # or Customer..." 
                                    style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '11px 16px 11px 42px' }} 
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <select style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#4b5a7a', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                                    <option>All Methods</option>
                                    <option>Razorpay</option>
                                    <option>Stripe</option>
                                    <option>COD</option>
                                </select>
                            </div>
                            <button className="btn-filter-dark">
                                <i className="fas fa-filter mr-2"></i> Filter
                            </button>
                        </div>
                    </div>

                    <div className="admin-card" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <div style={{ overflowX: 'auto', padding: '0 8px 8px' }}>
                            <div style={{ minWidth: 1000 }}>
                                <div ref={tableRef}></div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <AdminModal
                isOpen={editingGateway !== null}
                onClose={() => setEditingGateway(null)}
                title={editingGateway === 'cod' ? 'COD Rules & Limits' : `API Credentials: ${editingGateway?.charAt(0).toUpperCase()}${editingGateway?.slice(1)}`}
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setEditingGateway(null)}>Discard</button>
                        <button className="btn-indigo-gradient" onClick={handleSave}>Apply & Save</button>
                    </>
                }
            >
                {editingGateway === 'razorpay' && (
                    <div className="space-y-5">
                        <div className="form-group">
                            <label>Razorpay Key ID</label>
                            <input type="text" className="form-control" value={form.razorpayKey || ''} onChange={e => setForm({...form, razorpayKey: e.target.value})} placeholder="rzp_live_..." />
                        </div>
                        <div className="form-group">
                            <label>Razorpay Key Secret</label>
                            <input type="password" name="password" className="form-control" placeholder="••••••••••••••••" />
                            <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Get these from your Razorpay Dashboard &gt; Settings &gt; API Keys</p>
                        </div>
                    </div>
                )}
                {editingGateway === 'stripe' && (
                    <div className="space-y-5">
                        <div className="form-group">
                            <label>Stripe Publishable Key</label>
                            <input type="text" className="form-control" placeholder="pk_live_..." />
                        </div>
                        <div className="form-group">
                            <label>Stripe Secret Key</label>
                            <input type="password" name="password" className="form-control" placeholder="sk_live_..." />
                        </div>
                    </div>
                )}
                {editingGateway === 'cod' && (
                    <div className="space-y-5">
                        <div className="form-group">
                            <label>Handling Fee per Order (₹)</label>
                            <input type="number" className="form-control" value={form.codCharge || 0} onChange={e => setForm({...form, codCharge: Number(e.target.value)})} />
                        </div>
                        <div className="form-group">
                            <label>Threshold for COD (₹)</label>
                            <input type="number" className="form-control" value={form.codMaxAmount || 0} onChange={e => setForm({...form, codMaxAmount: Number(e.target.value)})} />
                        </div>
                    </div>
                )}
            </AdminModal>
        </div>
    );
};


export default PaymentSettings;
