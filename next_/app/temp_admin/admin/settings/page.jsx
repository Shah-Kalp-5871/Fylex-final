"use client";
import React, { useState, useEffect } from 'react';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import { useToast } from '@/context/ToastContext';

const SettingsPage = () => {
    const { data, updateRecord } = useAdminData();
    const { showToast } = useToast();
    const settings = data.siteSettings?.[0] || {};
    
    const [activeTab, setActiveTab] = useState('general');
    const [form, setForm] = useState(settings);

    useEffect(() => {
        setForm(settings);
    }, [settings.id]);

    const handleSave = () => {
        updateRecord('siteSettings', settings.id, form);
        showToast('Settings saved successfully!', 'success');
    };

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h2>Settings</h2>
                    <p>Store configuration and preferences</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
                        <button 
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'general' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('general')}
                        >
                            General
                        </button>
                        <button 
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'email' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('email')}
                        >
                            Email
                        </button>
                        <button 
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'payment' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('payment')}
                        >
                            Payment
                        </button>
                        <button 
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'seo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('seo')}
                        >
                            SEO
                        </button>
                    </div>
                    <button className="btn-primary" onClick={handleSave}>
                        <i className="fas fa-save mr-2"></i>Save Changes
                    </button>
                </div>
            </div>

            <div className="admin-card">
                <div className="p-8">
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label>Store Name</label>
                                <input type="text" className="form-control" value={form.storeName || ''} onChange={e => setForm({...form, storeName: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Contact Email</label>
                                <input type="email" className="form-control" value={form.contactEmail || ''} onChange={e => setForm({...form, contactEmail: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="text" className="form-control" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Currency Symbol</label>
                                <input type="text" className="form-control" value={form.currency || ''} onChange={e => setForm({...form, currency: e.target.value})} />
                            </div>
                            <div className="form-group md:col-span-2">
                                <label>Store Address</label>
                                <textarea className="form-control" rows="3" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})}></textarea>
                            </div>
                        </div>
                    )}
                    {activeTab === 'email' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label>SMTP Host</label>
                                <input type="text" className="form-control" defaultValue="smtp.gmail.com" />
                            </div>
                            <div className="form-group">
                                <label>SMTP Port</label>
                                <input type="text" className="form-control" defaultValue="587" />
                            </div>
                            <div className="form-group">
                                <label>SMTP Username</label>
                                <input type="text" className="form-control" defaultValue="noreply@fylexx.com" />
                            </div>
                            <div className="form-group">
                                <label>SMTP Password</label>
                                <input type="password" name="password" className="form-control" defaultValue="••••••••" />
                            </div>
                        </div>
                    )}
                    {activeTab === 'payment' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label>Razorpay Key ID</label>
                                <input type="text" className="form-control" value={form.razorpayKey || ''} onChange={e => setForm({...form, razorpayKey: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Razorpay Key Secret</label>
                                <input type="password" name="secret" className="form-control" defaultValue="••••••••" />
                            </div>
                            <div className="form-group">
                                <label>Enable Cash on Delivery</label>
                                <select className="form-control" value={form.codEnabled ? 'true' : 'false'} onChange={e => setForm({...form, codEnabled: e.target.value === 'true'})}>
                                    <option value="true">Active Always</option>
                                    <option value="false">Disabled</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {activeTab === 'seo' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group md:col-span-2">
                                <label>Global Meta Title</label>
                                <input type="text" className="form-control" value={form.metaTitle || ''} onChange={e => setForm({...form, metaTitle: e.target.value})} />
                            </div>
                            <div className="form-group md:col-span-2">
                                <label>Global Meta Description</label>
                                <textarea className="form-control" rows="3" value={form.metaDesc || ''} onChange={e => setForm({...form, metaDesc: e.target.value})}></textarea>
                            </div>
                            <div className="form-group">
                                <label>Google Analytics Tracking ID</label>
                                <input type="text" className="form-control" value={form.gaId || ''} onChange={e => setForm({...form, gaId: e.target.value})} placeholder="G-XXXXXXXXXX" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
