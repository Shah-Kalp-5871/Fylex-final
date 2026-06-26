"use client";
import React, { useState, useEffect } from 'react';
import '@/app/admin/css/custom.css';
import * as api from '@/services/adminApi';
import { useAdminData } from '@/context/AdminDataContext';
import PageHeader from '@/components/admin/ui/PageHeader';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import { useToast } from '@/context/ToastContext';

export default function FounderAdminPage() {
    const toast = useToast();
    const { data, loading, errors, refetch } = useAdminData();
    const [founderMessage, setFounderMessage] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

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
        if (remoteSettings && remoteSettings.founder_message !== undefined) {
            setFounderMessage(remoteSettings.founder_message || '');
        }
    }, [remoteSettings]);

    const handleChange = (e) => {
        setFounderMessage(e.target.value);
        setIsDirty(true);
        setSaveError(null);
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaveError(null);
        setSaving(true);
        
        try {
            const { error: err, success } = await api.saveSettings({ founder_message: founderMessage });
            if (err || success === false) { 
                const msg = err || 'Failed to save founder message';
                setSaveError(msg); 
                toast?.error?.(msg); 
            } else { 
                toast?.success?.('Founder section updated successfully!'); 
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

    if (loading.settings) return <Loader message="Fetching founder data..." />;
    if (errors.settings) return <ErrorBanner message={errors.settings} onRetry={() => refetch.settings()} />;

    return (
        <div className="animate-fade-in space-y-6">
            <PageHeader title="Founder Section" subtitle="Manage the founder text displayed on the Shop page">
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

            <div className="card" style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid #eee' }}>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 600, color: '#111', marginBottom: 8, fontSize: 15 }}>
                        Founder Message
                    </label>
                    <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                        This text will be prominently displayed at the bottom of the Shop page. Keep it authentic and inspiring.
                    </p>
                    <textarea
                        value={founderMessage}
                        onChange={handleChange}
                        rows={10}
                        style={{
                            width: '100%',
                            padding: '16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '15px',
                            lineHeight: '1.6',
                            color: '#111',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                        placeholder="Enter the founder's message here..."
                    />
                </div>
                {saveError && (
                    <div style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>
                        <i className="fas fa-info-circle mr-1"></i> {saveError}
                    </div>
                )}
            </div>
        </div>
    );
}
