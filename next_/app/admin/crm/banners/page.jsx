'use client';
import { useState, useEffect, useRef } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import * as api from '@/services/adminApi';
import { useAdminData } from '@/context/AdminDataContext';
import PageHeader from '@/components/admin/ui/PageHeader';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/AdminModal';
import { useToast } from '@/context/ToastContext';
import { getFileUrl } from '@/lib/utils';

const BannerList = () => {
    const toast = useToast();
    const { data, loading, errors, refetch, addRecord, updateRecord, deleteRecord } = useAdminData();
    const banners = data.banners || [];

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', subtitle: '', content: '', position: 'Hero', status: 'active', image: '', textColor: '#ffffff' });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    
    const fileInputRef = useRef(null);
    
    const tableRef = useRef(null);
    const tabulatorRef = useRef(null);
    const actionsRef = useRef({});

    useEffect(() => {
        if (!tableRef.current || loading.banners) return;
        tabulatorRef.current?.destroy();

        actionsRef.current = {
            onEdit: (d) => { setFormData({ ...d, status: d.isActive ? 'active' : 'inactive', image: d.image || d.image_url || '', textColor: d.textColor || '#ffffff' }); setShowModal(true); },
            onDelete: (id, title) => setDeleteTarget({ id, title }),
        };

        tabulatorRef.current = new Tabulator(tableRef.current, {
            data: banners,
            layout: "fitDataFill",
            pagination: "local",
            paginationSize: 10,
            placeholder: "No banners found",
            columns: [
                {
                    title: "ID", field: "id", width: 70, hozAlign: "center",
                    formatter: (cell) => `<span style="font-weight:600;color:#94a3b8">#${cell.getValue()}</span>`
                },
                {
                    title: "BANNER INFO", field: "title", width: 340,
                    formatter: (cell) => {
                        const d = cell.getRow().getData();
                        const img = d.image || d.image_url;
                        return `
                            <div style="display:flex;align-items:center;gap:14px;padding:6px 0">
                                <div style="width:64px;height:40px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center">
                                    ${img ? `<img src="${getFileUrl(img)}" style="width:100%;height:100%;object-fit:cover" />` : `<i class="fas fa-image" style="color:#cbd5e1;font-size:14px"></i>`}
                                </div>
                                <div style="min-width:0">
                                    <div style="font-weight:800;color:#1e293b;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.title || 'Untitled Banner'}</div>
                                    <div style="font-size:11px;color:#6366f1;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">${d.position || 'HERO'}</div>
                                </div>
                            </div>
                        `;
                    }
                },
                {
                    title: "STATUS", field: "isActive", width: 140, hozAlign: "center",
                    formatter: (cell) => {
                        const val = cell.getValue();
                        const active = val === true || val === 'active' || val === '1' || val === 'true';
                        return `<div class="status-badge" style="display:inline-flex;padding:5px 14px;border-radius:10px;font-size:11px;font-weight:700;background:${active ? '#ecfdf5' : '#10b981'};color:${active ? '#10b981' : '#ef4444'};border:1px solid ${active ? '#d1fae5' : '#fee2e2'};text-transform:uppercase">${active ? 'ACTIVE' : 'INACTIVE'}</div>`;
                    }
                },
                {
                    title: "ACTIONS", headerSort: false, hozAlign: "right", width: 110,
                    formatter: () => `
                        <div style="display:flex;gap:8px;justify-content:flex-end">
                            <button class="btn-icon btn-icon-edit" style="background:#f1f5f9;color:#6366f1" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon btn-icon-delete" style="background:#fef2f2;color:#ef4444" title="Delete"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    `,
                    cellClick: (e, cell) => {
                        const d = cell.getRow().getData();
                        if (e.target.closest('.btn-icon-edit')) actionsRef.current.onEdit(d);
                        if (e.target.closest('.btn-icon-delete')) actionsRef.current.onDelete(d.id, d.title);
                    }
                }
            ],
        });

        return () => { tabulatorRef.current?.destroy(); tabulatorRef.current = null; };
    }, [banners, loading.banners]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!formData.title) return;
        setSubmitting(true);
        let success;
        if (formData.id) {
           success = await updateRecord('banners', formData.id, formData, api.updateBanner);
        } else {
           success = await addRecord('banners', formData, api.createBanner);
        }
        setSubmitting(false);
        if (success || success === undefined) {
          setShowModal(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        const success = await deleteRecord('banners', deleteTarget.id, api.deleteBanner);
        setDeleting(false);
        if (success) {
            setDeleteTarget(null);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file); // Field name must match backend

        const { data: resData, error } = await api.uploadMedia(formDataUpload);
        setUploading(false);

        if (error) {
            toast?.error?.(error || 'Failed to upload image');
            return;
        }

        // The backend returns an array of media objects
        if (resData && Array.isArray(resData) && resData[0]) {
            const fileName = resData[0].fileName;
            // Use getFileUrl to handle the domain and prefix correctly
            const imageUrl = `/uploads/${fileName}`;
            setFormData(prev => ({ ...prev, image: imageUrl }));
            toast?.success?.('Image uploaded successfully');
        } else if (resData && resData.url) {
            setFormData(prev => ({ ...prev, image: resData.url }));
            toast?.success?.('Image uploaded successfully');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader 
                title="Sliders & Banners" 
                subtitle="Manage homepage sliders and promotional campaign assets"
                action={{ label: 'Add Banner', icon: 'fas fa-plus', onClick: () => { setFormData({ title: '', subtitle: '', content: '', position: 'Hero', status: 'active', image: '', textColor: '#ffffff' }); setShowModal(true); } }}
            />

            <div className="admin-card" style={{ padding: '20px 24px', borderRadius: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="admin-search" style={{ flex: 2, minWidth: 300 }}>
                        <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
                        <input 
                            type="text" 
                            placeholder="Search by title, position..." 
                            style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '11px 16px 11px 42px' }} 
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <select style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#4b5a7a', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                            <option>All Positions</option>
                            <option>Hero</option>
                            <option>Section 2</option>
                            <option>Section 3</option>
                            <option>Below Hero</option>
                            <option>Footer</option>
                        </select>
                    </div>
                    <button className="btn-filter-dark">
                        <i className="fas fa-filter mr-2"></i> Filter
                    </button>
                </div>
            </div>

            <div className="admin-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
                {loading.banners ? <Loader message="Loading banners..." /> :
                 errors.banners  ? <ErrorBanner message={errors.banners} onRetry={() => refetch.banners()} /> :
                 <div style={{ overflowX: 'auto' }}><div style={{ minWidth: 900 }}><div ref={tableRef}></div></div></div>
                }
            </div>

            <AdminModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={formData.id ? "Edit Banner" : "Add New Banner"}
                maxWidth={520}
            >
                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                        <div className="form-group">
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'block' }}>Banner Title</label>
                            <input 
                                type="text" 
                                style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none' }}
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g. Summer Collection 2024"
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="form-group">
                                <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'block' }}>Subtitle (Label)</label>
                                <input 
                                    type="text" 
                                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none' }}
                                    value={formData.subtitle || ''} 
                                    onChange={e => setFormData({...formData, subtitle: e.target.value})}
                                    placeholder="e.g. II · Movement"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'block' }}>Content</label>
                                <textarea 
                                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', resize: 'vertical', minHeight: 46 }}
                                    value={formData.content || ''} 
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                    placeholder="Enter content details (HTML allowed)"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                            <div className="form-group">
                                <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'block' }}>Position</label>
                                <select 
                                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', background: '#fff' }}
                                    value={formData.position}
                                    onChange={e => setFormData({...formData, position: e.target.value})}
                                >
                                    <option>Hero</option>
                                    <option>Section 2</option>
                                    <option>Section 3</option>
                                    <option>Below Hero</option>
                                    <option>Footer</option>
                                    <option>Sidebar</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'block' }}>Status</label>
                                <select 
                                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', background: '#fff' }}
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'block' }}>Text Color</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', height: 46 }}>
                                    <input 
                                        type="color" 
                                        style={{ width: 32, height: 32, padding: 0, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', cursor: 'pointer', flexShrink: 0 }}
                                        value={formData.textColor || '#ffffff'} 
                                        onChange={e => setFormData({...formData, textColor: e.target.value})}
                                        title="Pick text color for banner overlay"
                                    />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{formData.textColor || '#ffffff'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="form-group border-t pt-4">
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'block' }}>Banner Media</label>
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                style={{ 
                                    width: '100%', height: 160, borderRadius: 12, border: '2px dashed #e2e8f0', 
                                    background: '#f8fafc', display: 'flex', flexDirection: 'column', 
                                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    position: 'relative', overflow: 'hidden', transition: 'all 0.2s'
                                }}
                            >
                                {formData.image ? (
                                    <>
                                        <img src={getFileUrl(formData.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} className="hover:opacity-100 opacity-hover">
                                            <i className="fas fa-camera mr-2"></i> Change Image
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {uploading ? (
                                            <><i className="fas fa-spinner fa-spin text-2xl text-indigo-500 mb-2"></i><span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Uploading...</span></>
                                        ) : (
                                            <><i className="fas fa-cloud-upload-alt text-3xl text-slate-300 mb-2"></i><span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Click to select banner image</span><span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Recommended: 1920x800px</span></>
                                        )}
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageUpload} 
                                    accept="image/*" 
                                    style={{ display: 'none' }} 
                                />
                            </div>

                            {formData.image && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, background: '#f1f5f9', padding: '8px 12px', borderRadius: 8 }}>
                                    <i className="fas fa-link text-slate-400 text-xs"></i>
                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{formData.image}</div>
                                    <button type="button" onClick={() => setFormData({ ...formData, image: '' })} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}><i className="fas fa-times-circle"></i></button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 32, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                        <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</> : 'Save Banner'}
                        </button>
                    </div>
                </form>
            </AdminModal>

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Banner"
                message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
                loading={deleting}
                danger
            />
        </div>
    );
};

export default BannerList;
