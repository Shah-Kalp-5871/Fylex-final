"use client";
import React, { useState, useEffect, useRef } from 'react';
import '@/app/admin/css/custom.css';
import * as api from '@/services/adminApi';
import { useAdminData } from '@/context/AdminDataContext';
import PageHeader from '@/components/admin/ui/PageHeader';
import FormField from '@/components/admin/ui/FormField';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import { useToast } from '@/context/ToastContext';

const LoginSettingsPage = () => {
    const toast = useToast();
    const { data, loading, errors, refetch } = useAdminData();
    const [settings, setSettings] = useState({
        loginPageImage: '',
        loginButtonColor: '#000000',
        loginButtonTextColor: '#ffffff'
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const fileInputRef = useRef(null);

    const remoteSettings = React.useMemo(() => {
        if (!data.settings) return {};
        if (Array.isArray(data.settings)) {
            const obj = {};
            data.settings.forEach(item => {
                obj[item.key] = item.value;
            });
            return obj;
        }
        return data.settings;
    }, [data.settings]);

    useEffect(() => {
        if (remoteSettings && Object.keys(remoteSettings).length > 0) {
            setSettings({
                loginPageImage: remoteSettings.loginPageImage || remoteSettings.login_page_image || '',
                loginButtonColor: remoteSettings.loginButtonColor || remoteSettings.login_button_color || '#000000',
                loginButtonTextColor: remoteSettings.loginButtonTextColor || remoteSettings.login_button_text_color || '#ffffff',
            });
        }
    }, [remoteSettings]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const { data: resData, error } = await api.uploadMedia(formData);
        setUploading(false);

        if (error) {
            toast?.error?.(error || 'Failed to upload image');
            return;
        }

        if (resData && Array.isArray(resData) && resData[0]) {
            const fileName = resData[0].fileName;
            const imageUrl = `http://localhost:3001/uploads/${fileName}`;
            setSettings(prev => ({ ...prev, loginPageImage: imageUrl }));
            setIsDirty(true);
            toast?.success?.('Image uploaded successfully');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
        setSaveError(null);
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaveError(null);
        setSaving(true);
        
        try {
            const { error: err, success } = await api.saveSettings(settings);
            if (err || success === false) { 
                const msg = err || 'Failed to save settings';
                setSaveError(msg); 
                toast?.error?.(msg); 
            } else { 
                toast?.success?.('Login Settings updated successfully!'); 
                setIsDirty(false); 
                await refetch.settings();
            }
        } catch (err) {
            setSaveError(err.message);
            toast?.error?.(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading.settings && !settings.loginPageImage && !remoteSettings.id) return <Loader message="Fetching settings..." />;
    if (errors.settings) return <ErrorBanner message={errors.settings} onRetry={() => refetch.settings()} />;

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader title="Login Page Settings" subtitle="Customize the appearance of the customer login page">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {isDirty && (
                        <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', padding: '6px 12px', borderRadius: 8, border: '1px solid #fef3c7' }}>
                            <i className="fas fa-exclamation-circle"></i>
                            Unsaved Changes
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleSave}
                        className="btn-indigo-gradient"
                        disabled={saving || !isDirty}
                        style={{ height: 42, padding: '0 20px' }}
                    >
                        {saving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </PageHeader>

            <div className="admin-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
                <div className="admin-card-header" style={{ padding: '24px 30px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f5f3ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            <i className="fas fa-sign-in-alt"></i>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Login Page Styling</h3>
                            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Update the banner image and button colors for your users' login screen.</p>
                        </div>
                    </div>
                </div>
                
                <div className="admin-card-body" style={{ padding: '30px' }}>
                    {saveError && <ErrorBanner message={saveError} compact style={{ marginBottom: 24 }} />}

                    <form onSubmit={handleSave} className="space-y-8">
                        {/* Image Upload */}
                        <div>
                            <h5 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>Login Banner Image</h5>
                            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Upload the image that will be displayed on the login page.</p>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 32 }}>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ 
                                        flex: '1 1 300px',
                                        height: 200, 
                                        borderRadius: 16, 
                                        border: '2px dashed #e2e8f0', 
                                        background: '#f8fafc',
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                    className="hover:border-indigo-400 hover:bg-indigo-50/10"
                                >
                                    {uploading ? (
                                        <><i className="fas fa-spinner fa-spin text-2xl text-indigo-500 mb-2"></i><span style={{ fontSize: 14, fontWeight: 600 }}>Uploading...</span></>
                                    ) : (
                                        <><i className="fas fa-cloud-upload-alt text-3xl text-slate-300 mb-2"></i><span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Click to browse image</span></>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleImageUpload} 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                    />
                                </div>

                                <div style={{ flex: '0 0 auto', width: 300 }}>
                                    <h5 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Preview</h5>
                                    <div style={{ 
                                        width: '100%', 
                                        height: 200, 
                                        background: '#fff', 
                                        borderRadius: 16, 
                                        border: '1px solid #e2e8f0', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        padding: 8,
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        overflow: 'hidden'
                                    }}>
                                        {settings.loginPageImage ? (
                                            <img src={settings.loginPageImage} alt="Login Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                                        ) : (
                                            <div style={{ color: '#cbd5e1', textAlign: 'center' }}>
                                                <i className="fas fa-image text-4xl mb-2 opacity-20"></i>
                                                <div style={{ fontSize: 12, fontWeight: 600 }}>No Image</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Button Colors */}
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 30 }}>
                            <h5 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Button Colors</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Button Background Color</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <input 
                                            type="color" 
                                            name="loginButtonColor" 
                                            value={settings.loginButtonColor} 
                                            onChange={handleChange} 
                                            style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                                        />
                                        <input 
                                            type="text" 
                                            name="loginButtonColor"
                                            value={settings.loginButtonColor} 
                                            onChange={handleChange} 
                                            style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Button Text Color</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <input 
                                            type="color" 
                                            name="loginButtonTextColor" 
                                            value={settings.loginButtonTextColor} 
                                            onChange={handleChange} 
                                            style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                                        />
                                        <input 
                                            type="text" 
                                            name="loginButtonTextColor"
                                            value={settings.loginButtonTextColor} 
                                            onChange={handleChange} 
                                            style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Live Preview Button */}
                            <div style={{ marginTop: 24, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'inline-block' }}>
                                <h6 style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Button Preview</h6>
                                <button 
                                    style={{ 
                                        backgroundColor: settings.loginButtonColor, 
                                        color: settings.loginButtonTextColor, 
                                        padding: '12px 24px', 
                                        border: 'none', 
                                        borderRadius: 8, 
                                        fontSize: 15, 
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Login / Sign In
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginSettingsPage;
