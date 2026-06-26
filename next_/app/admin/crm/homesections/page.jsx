"use client";
import React, { useState } from 'react';
import '@/app/admin/css/custom.css';
import AdminModal from '@/components/admin/AdminModal';
import { useAdminData } from '@/context/AdminDataContext';
import * as api from '@/services/adminApi';
import Swal from 'sweetalert2';

const HomeSections = () => {
    const { data, addRecord, updateRecord, deleteRecord, loading } = useAdminData();
    const sections = data.homeSections || [];

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', type: 'products', sortOrder: 1, isActive: true });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdd = () => {
        setFormData({ title: '', type: 'products', sortOrder: (sections.length + 1), isActive: true });
        setShowModal(true);
    };

    const handleEdit = (section) => {
        setFormData({
            id: section.id,
            title: section.title,
            type: section.type,
            sortOrder: section.sortOrder,
            isActive: section.isActive
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.title) return;
        setIsSubmitting(true);
        try {
            if (formData.id) {
                await updateRecord('homeSections', formData.id, formData, api.updateHomeSection);
            } else {
                await addRecord('homeSections', formData, api.createHomeSection);
            }
            setShowModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete this section?',
            text: 'Are you sure you want to delete this section?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it'
        });
        if (result.isConfirmed) {
            await deleteRecord('homeSections', id, api.deleteHomeSection);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>Home Page Sections</h2>
                    <p style={{ color: '#64748b' }}>Manage the structure and layout of the homepage</p>
                </div>
                <button className="btn-indigo-gradient" onClick={handleAdd}>
                    <i className="fas fa-plus mr-2"></i>Add Section
                </button>
            </div>

            <div className="admin-card" style={{ borderRadius: 16 }}>
                <div className="admin-card-header" style={{ padding: '20px 24px' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>All Layout Sections</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Section Title</th>
                                <th>Type</th>
                                <th style={{ textAlign: 'center' }}>Order</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading.homeSections ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading sections...</td></tr>
                            ) : sections.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No sections found. Add one to get started.</td></tr>
                            ) : sections.sort((a,b) => a.sortOrder - b.sortOrder).map((s) => (
                                <tr key={s.id}>
                                    <td className="cell-primary">
                                        <div style={{ fontWeight: 700 }}>{s.title}</div>
                                    </td>
                                    <td>
                                        <span className="status-pill" style={{ background: '#f1f5f9', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                                            {s.type}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontWeight: 800, fontSize: 13, color: '#6366f1' }}>
                                            {s.sortOrder}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`status-pill ${s.isActive ? 'pill-active' : 'pill-inactive'}`}>
                                            {s.isActive ? 'Visible' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button className="btn-icon btn-icon-edit" onClick={() => handleEdit(s)}>
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="btn-icon btn-icon-delete" onClick={() => handleDelete(s.id)}>
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={formData.id ? "Edit Section" : "Add New Section"}
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn-indigo-gradient px-6" onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : null}
                            Save Changes
                        </button>
                    </>
                }
            >
                <div className="space-y-5">
                    <div className="form-group">
                        <label style={{ fontWeight: 700, fontSize: 13, color: '#64748b', marginBottom: 8, display: 'block' }}>Section Display Title</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            style={{ height: 48, borderRadius: 10 }}
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g. New Seasonal Arrivals"
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontWeight: 700, fontSize: 13, color: '#64748b', marginBottom: 8, display: 'block' }}>Content Type</label>
                        <select 
                            className="form-control"
                            style={{ height: 48, borderRadius: 10 }}
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="products">Products Grid</option>
                            <option value="categories">Categories Showcase</option>
                            <option value="testimonials">Testimonials / Reviews</option>
                            <option value="custom">Custom Banner / Newsletter</option>
                            <option value="video">Promotional Video</option>
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div className="form-group">
                            <label style={{ fontWeight: 700, fontSize: 13, color: '#64748b', marginBottom: 8, display: 'block' }}>Display Order</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                style={{ height: 48, borderRadius: 10 }}
                                value={formData.sortOrder} 
                                onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontWeight: 700, fontSize: 13, color: '#64748b', marginBottom: 8, display: 'block' }}>Visibility Status</label>
                            <select 
                                className="form-control"
                                style={{ height: 48, borderRadius: 10 }}
                                value={formData.isActive.toString()}
                                onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})}
                            >
                                <option value="true">Active & Visible</option>
                                <option value="false">Hidden from Store</option>
                            </select>
                        </div>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
};

export default HomeSections;
