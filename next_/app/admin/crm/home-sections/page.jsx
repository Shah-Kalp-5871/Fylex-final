"use client";
import React, { useState, useEffect } from 'react';
import * as api from '@/services/adminApi';
import { useAdminData } from '@/context/AdminDataContext';
import PageHeader from '@/components/admin/ui/PageHeader';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/AdminModal';
import { useToast } from '@/context/ToastContext';

const HomeSections = () => {
    const toast = useToast();
    const { data, loading, errors, refetch, addRecord, updateRecord, deleteRecord } = useAdminData();
    const sections = (data.homeSections || []).sort((a,b) => a.order - b.order);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: '', order: 1, status: true });
    
    const [confirmTarget, setConfirmTarget] = useState(null); // For toggle status
    const [deleteTarget, setDeleteTarget] = useState(null); // For delete
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!formData.name || !formData.type) {
            toast?.error?.("Name and Key are required");
            return;
        }
        setSubmitting(true);
        let success;
        
        // Ensure order is a number and status is boolean
        const payload = {
            ...formData,
            order: parseInt(formData.order) || 1,
            status: formData.status === 'true' || formData.status === true
        };

        if (formData.id) {
           success = await updateRecord('homeSections', formData.id, payload, api.updateHomeSection);
        } else {
           success = await addRecord('homeSections', payload, api.createHomeSection);
        }
        
        setSubmitting(false);
        if (success || success === undefined) {
          setShowModal(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!confirmTarget) return;
        setSubmitting(true);
        
        const updatedData = {
            ...confirmTarget,
            status: !confirmTarget.status
        };

        const success = await updateRecord('homeSections', confirmTarget.id, updatedData, api.updateHomeSection);
        setSubmitting(false);
        if (success || success === undefined) {
            setConfirmTarget(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        const success = await deleteRecord('homeSections', deleteTarget.id, api.deleteHomeSection);
        setDeleting(false);
        if (success || success === undefined) {
            setDeleteTarget(null);
        }
    };

    const openAddModal = () => {
        // Auto-increment order
        const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) : 0;
        setFormData({ name: '', type: '', order: maxOrder + 1, status: true });
        setShowModal(true);
    };

    const openEditModal = (s) => {
        setFormData({ ...s });
        setShowModal(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader 
                title="Home Page Sections" 
                subtitle="Manage and configure layout sections for the homepage"
                action={{ label: 'Add Section', icon: 'fas fa-plus', onClick: openAddModal }}
            />

            <div className="admin-card" style={{ borderRadius: 16 }}>
                <div className="admin-card-header"><h3>Active Layout Structure</h3></div>
                {loading.homeSections ? <Loader message="Loading layout..." /> :
                 errors.homeSections  ? <ErrorBanner message={errors.homeSections} onRetry={() => refetch.homeSections()} /> :
                 <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: 80, textAlign: 'center' }}>ORDER</th>
                                <th>SECTION NAME</th>
                                <th>KEY</th>
                                <th style={{ textAlign: 'center' }}>STATUS</th>
                                <th style={{ textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No sections found. Please ensure database is seeded.</td></tr> : 
                             sections.map((s) => (
                                <tr key={s.id}>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 10, background: '#f5f3ff', color: '#6366f1', fontWeight: 800, fontSize: 13, border: '1px solid #ddd6fe' }}>{s.order}</div>
                                    </td>
                                    <td className="cell-primary" style={{ fontWeight: 800 }}>{s.name}</td>
                                    <td><span className="cell-mono" style={{ textTransform: 'uppercase', fontSize: 11, background: '#f1f5f9', padding: '4px 10px', borderRadius: 8, color: '#475569', fontWeight: 700 }}>{s.type}</span></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button 
                                            onClick={() => setConfirmTarget(s)}
                                            style={{ 
                                                display: 'inline-flex', 
                                                padding: '5px 12px', 
                                                borderRadius: 10, 
                                                fontSize: 11, 
                                                fontWeight: 700, 
                                                background: s.status ? '#ecfdf5' : '#fff1f2', 
                                                color: s.status ? '#10b981' : '#f43f5e', 
                                                border: `1px solid ${s.status ? '#d1fae5' : '#fecdd3'}`, 
                                                textTransform: 'uppercase',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Click to toggle status"
                                        >
                                            {s.status ? 'Visible' : 'Hidden'}
                                        </button>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button 
                                                className="btn-icon btn-icon-edit" 
                                                style={{ background: '#f1f5f9', color: '#6366f1' }} 
                                                title="Edit"
                                                onClick={() => openEditModal(s)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                className="btn-icon btn-icon-delete" 
                                                style={{ background: '#fef2f2', color: '#ef4444' }} 
                                                title="Delete"
                                                onClick={() => setDeleteTarget(s)}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                 </div>
                }
            </div>

            {/* Add / Edit Modal */}
            <AdminModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={formData.id ? "Edit Section" : "Add New Section"}
                maxWidth={450}
            >
                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                        <div className="form-group">
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'block' }}>Section Name</label>
                            <input 
                                type="text" 
                                style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none' }}
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Featured Products Grid"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'block' }}>Key Identifier (Type)</label>
                            <input 
                                type="text" 
                                style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none' }}
                                value={formData.type} 
                                onChange={e => setFormData({...formData, type: e.target.value})}
                                placeholder="e.g. featured"
                                required
                            />
                            <p style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>This must match the key used in your frontend code (e.g. s1, s2, gallery).</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="form-group">
                                <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'block' }}>Display Order</label>
                                <input 
                                    type="number" 
                                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none' }}
                                    value={formData.order} 
                                    onChange={e => setFormData({...formData, order: e.target.value})}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'block' }}>Status</label>
                                <select 
                                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', background: '#fff' }}
                                    value={formData.status.toString()}
                                    onChange={e => setFormData({...formData, status: e.target.value === 'true'})}
                                >
                                    <option value="true">Visible</option>
                                    <option value="false">Hidden</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 32, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                        <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</> : 'Save Section'}
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* Toggle Status Modal */}
            <ConfirmModal
                isOpen={!!confirmTarget}
                onClose={() => setConfirmTarget(null)}
                onConfirm={handleToggleStatus}
                title={confirmTarget?.status ? "Hide Section" : "Show Section"}
                message={`Are you sure you want to ${confirmTarget?.status ? 'hide' : 'show'} the "${confirmTarget?.name}" section on the home page?`}
                confirmLabel={confirmTarget?.status ? "Hide" : "Show"}
                loading={submitting}
                danger={confirmTarget?.status}
            />

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Section"
                message={`Are you sure you want to permanently delete the "${deleteTarget?.name}" section? This might break the frontend layout if it's still being referenced in the code.`}
                confirmLabel="Delete"
                loading={deleting}
                danger
            />
        </div>
    );
};

export default HomeSections;
