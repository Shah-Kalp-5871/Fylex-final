"use client";
import React, { useState } from 'react';
import '@/app/admin/css/custom.css';
import AdminModal from '@/components/admin/AdminModal';

const MediaList = () => {
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const [files] = useState([
        { id: 1, name: 'hero-banner.jpg', type: 'image/jpeg', size: '2.4 MB', uploaded_at: '2024-03-10', url: '#', assignments: [] },
        { id: 2, name: 'product-alpha-black.png', type: 'image/png', size: '1.1 MB', uploaded_at: '2024-03-08', url: '#', assignments: ['LWA-001-BLK'] },
        { id: 3, name: 'promo-video.mp4', type: 'video/mp4', size: '15.3 MB', uploaded_at: '2024-03-05', url: '#', assignments: [] },
    ]);

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h2>Media Library</h2>
                    <p>Manage images, videos, and documents</p>
                </div>
                <button className="btn-primary"><i className="fas fa-cloud-upload-alt mr-2"></i>Upload Files</button>
            </div>

            {/* Upload Zone */}
            <div className="admin-card" style={{ padding: 32, textAlign: 'center', border: '2px dashed #e2e8f0', background: '#fafbfc', cursor: 'pointer' }}>
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: 32, color: '#94a3b8', marginBottom: 12 }}></i>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#475569', margin: '0 0 4px' }}>Drop files here or click to upload</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Supports JPG, PNG, MP4, PDF up to 50MB</p>
            </div>

            {/* Files Table */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>All Files</h3>
                    <div className="admin-search" style={{ width: 220 }}>
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Search files..." />
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr><th>File Name</th><th>Type</th><th style={{ textAlign: 'center' }}>Size</th><th style={{ textAlign: 'center' }}>Assignments</th><th style={{ textAlign: 'center' }}>Uploaded</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                        </thead>
                        <tbody>
                            {files.map((f) => (
                                <tr key={f.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 8, background: f.type.includes('image') ? '#eef2ff' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                                                <i className={f.type.includes('image') ? 'fas fa-image' : 'fas fa-video'} style={{ color: f.type.includes('image') ? '#4f46e5' : '#dc2626' }}></i>
                                            </div>
                                            <span className="cell-primary">{f.name}</span>
                                        </div>
                                    </td>
                                    <td><span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', background: '#f8fafc', padding: '3px 8px', borderRadius: 4 }}>{f.type.split('/')[1].toUpperCase()}</span></td>
                                    <td style={{ textAlign: 'center' }}>{f.size}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {f.assignments.length > 0 ? (
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', background: '#eef2ff', padding: '4px 8px', borderRadius: 6 }}>{f.assignments.join(', ')}</span>
                                        ) : (
                                            <span style={{ fontSize: 12, color: '#94a3b8' }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>{f.uploaded_at}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                            <button className="btn-icon btn-icon-edit" title="Assign to Variant" onClick={() => { setSelectedFile(f); setShowAssignModal(true); }}><i className="fas fa-link"></i></button>
                                            <button className="btn-icon btn-icon-edit"><i className="fas fa-download"></i></button>
                                            <button className="btn-icon btn-icon-delete"><i className="fas fa-trash-alt"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Modal */}
            <AdminModal
                isOpen={showAssignModal && !!selectedFile}
                onClose={() => setShowAssignModal(false)}
                title="Assign Media to Variant"
                maxWidth={500}
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                        <button className="btn-primary" onClick={() => setShowAssignModal(false)}>Save Assignment</button>
                    </>
                }
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                        <i className="fas fa-image" style={{ color: '#4f46e5' }}></i>
                    </div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedFile?.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{selectedFile?.size}</div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Select Product / Variant</label>
                    <select className="form-control">
                        <option>Luxury Watch Alpha - Black (LWA-001-BLK)</option>
                        <option>Luxury Watch Alpha - Silver (LWA-001-SLV)</option>
                        <option>Classic Gold Edition (CGE-99-GLD)</option>
                        <option>-- Set as Base Product Image --</option>
                    </select>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>This image will appear when a user selects this specific variant.</p>
                </div>
            </AdminModal>
        </div>
    );
};

export default MediaList;
