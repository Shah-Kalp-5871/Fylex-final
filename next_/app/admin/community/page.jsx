"use client";
import React, { useState, useEffect, useCallback } from 'react';
import '@/app/admin/css/custom.css';
import * as api from '@/services/adminApi';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import AdminModal from '@/components/admin/AdminModal';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import PageHeader from '@/components/admin/ui/PageHeader';
import { useToast } from '@/context/ToastContext';

const getFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const root = base.replace(/\/api$/, '');
  return `${root}/${path.replace(/^\//, '')}`;
};

const CommunityPage = () => {
  const toast = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', image: '', sortOrder: 0, isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await api.getCommunityImages();
    if (err) {
      setError(err);
    } else {
      setImages(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.image && !imageFile) {
      toast?.error?.('Please select an image');
      return;
    }
    setSaving(true);

    let imagePath = formData.image;

    // Upload file if a new one was selected
    if (imageFile) {
      const fd = new FormData();
      fd.append('file', imageFile);
      const uploadRes = await api.uploadMedia(fd);
      if (uploadRes.error) {
        toast?.error?.('Image upload failed: ' + uploadRes.error);
        setSaving(false);
        return;
      }
      const uploaded = Array.isArray(uploadRes.data) ? uploadRes.data[0] : uploadRes.data;
      imagePath = uploaded?.filePath || uploaded?.file_path || uploaded?.path || uploaded?.fileName || '';
    }

    const payload = {
      title: formData.title,
      image: imagePath,
      sortOrder: Number(formData.sortOrder) || 0,
      isActive: formData.isActive,
    };

    let res;
    if (formData.id) {
      res = await api.updateCommunityImage(formData.id, payload);
    } else {
      res = await api.createCommunityImage(payload);
    }

    if (res.error) {
      toast?.error?.(res.error);
    } else {
      toast?.success?.(formData.id ? 'Image updated successfully' : 'Image added successfully');
      setShowModal(false);
      fetchImages();
    }
    setSaving(false);
  };

  const handleAdd = () => {
    setFormData({ title: '', image: '', sortOrder: images.length, isActive: true });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const handleEdit = (img) => {
    setFormData({
      id: img.id,
      title: img.title || '',
      image: img.image || '',
      sortOrder: img.sortOrder ?? 0,
      isActive: img.isActive ?? true,
    });
    setImageFile(null);
    setImagePreview(img.image ? getFileUrl(img.image) : '');
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await api.deleteCommunityImage(deleteTarget.id);
    if (res.error) {
      toast?.error?.(res.error);
    } else {
      toast?.success?.('Image deleted');
      setDeleteTarget(null);
      fetchImages();
    }
    setDeleting(false);
  };

  const toggleStatus = async (img) => {
    const res = await api.updateCommunityImage(img.id, { isActive: !img.isActive });
    if (!res.error) {
      toast?.success?.(img.isActive ? 'Image hidden' : 'Image visible');
      fetchImages();
    }
  };

  const activeCount = images.filter(i => i.isActive).length;
  const inactiveCount = images.filter(i => !i.isActive).length;

  return (
    <div className="w-full px-6 lg:px-10 xl:px-16 py-6">
      <div className="max-w-[1600px] mx-auto">
        <PageHeader
          title="Community Gallery"
          subtitle={<span>Manage images for The <img src="/fylex.png" alt="FYLEX" style={{ height: '2.5em', display: 'inline-block', verticalAlign: 'middle', transform: 'translateY(-0.1em)' }} /> World. section on the homepage</span>}
          action={{ label: 'Add Image', icon: 'fas fa-plus', onClick: handleAdd }}
        />

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24, marginBottom: 24 }}>
          {[
            { label: 'Total Images', value: images.length, icon: 'fas fa-images', color: '#6366f1', bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' },
            { label: 'Active', value: activeCount, icon: 'fas fa-eye', color: '#10b981', bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' },
            { label: 'Hidden', value: inactiveCount, icon: 'fas fa-eye-slash', color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
              padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: s.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: s.color
              }}>
                <i className={s.icon}></i>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Gallery Grid */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            padding: '16px 24px', borderBottom: '1px solid #f3f4f6',
            background: 'linear-gradient(to bottom, #fafbfc, #f9fafb)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
              <i className="fas fa-th-large" style={{ marginRight: 8, color: '#6366f1' }}></i>
              Gallery Images
            </h3>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>
              Drag images in The <img src="/fylex.png" alt="FYLEX" style={{ height: '2.5em', display: 'inline-block', verticalAlign: 'middle', transform: 'translateY(-0.1em)' }} /> World. carousel
            </span>
          </div>

          <div style={{ padding: 24 }}>
            {loading ? (
              <div style={{ padding: '80px 0' }}><Loader message="Loading community images..." /></div>
            ) : error ? (
              <ErrorBanner message={error} onRetry={fetchImages} />
            ) : images.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '80px 40px',
                color: '#9ca3af'
              }}>
                <i className="fas fa-camera-retro" style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}></i>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>No images yet</p>
                <p style={{ fontSize: 13 }}>Add your first community image to showcase in The <img src="/fylex.png" alt="FYLEX" style={{ height: '2.5em', display: 'inline-block', verticalAlign: 'middle', transform: 'translateY(-0.1em)' }} /> World.</p>
                <button
                  onClick={handleAdd}
                  style={{
                    marginTop: 20, padding: '10px 24px', background: '#6366f1',
                    color: '#fff', border: 'none', borderRadius: 10,
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <i className="fas fa-plus" style={{ marginRight: 8 }}></i>Add Image
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 20
              }}>
                {images.map((img) => (
                  <div key={img.id} style={{
                    position: 'relative', borderRadius: 14, overflow: 'hidden',
                    border: '1px solid #e5e7eb', background: '#f9fafb',
                    transition: 'all 0.3s ease',
                    opacity: img.isActive ? 1 : 0.55,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', paddingTop: '100%', background: '#eee' }}>
                      <img
                        src={getFileUrl(img.image)}
                        alt={img.title || 'Community'}
                        style={{
                          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />

                      {/* Overlay actions */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                        opacity: 0, transition: 'opacity 0.25s', display: 'flex',
                        alignItems: 'flex-end', justifyContent: 'center',
                        padding: '0 12px 14px', gap: 8
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                      >
                        <button
                          onClick={() => handleEdit(img)}
                          style={{
                            padding: '7px 14px', background: 'rgba(255,255,255,0.95)',
                            border: 'none', borderRadius: 8, cursor: 'pointer',
                            fontSize: 12, fontWeight: 600, color: '#111',
                            display: 'flex', alignItems: 'center', gap: 6,
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button
                          onClick={() => toggleStatus(img)}
                          style={{
                            padding: '7px 14px',
                            background: img.isActive ? 'rgba(245,158,11,0.9)' : 'rgba(16,185,129,0.9)',
                            border: 'none', borderRadius: 8, cursor: 'pointer',
                            fontSize: 12, fontWeight: 600, color: '#fff',
                            display: 'flex', alignItems: 'center', gap: 6
                          }}
                        >
                          <i className={`fas fa-eye${img.isActive ? '-slash' : ''}`}></i>
                          {img.isActive ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(img)}
                          style={{
                            padding: '7px 14px', background: 'rgba(239,68,68,0.9)',
                            border: 'none', borderRadius: 8, cursor: 'pointer',
                            fontSize: 12, fontWeight: 600, color: '#fff',
                            display: 'flex', alignItems: 'center', gap: 6
                          }}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>

                      {/* Status badge */}
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        padding: '3px 10px', borderRadius: 20,
                        background: img.isActive ? 'rgba(16,185,129,0.9)' : 'rgba(107,114,128,0.9)',
                        color: '#fff', fontSize: 10, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {img.isActive ? 'Active' : 'Hidden'}
                      </div>

                      {/* Sort order badge */}
                      <div style={{
                        position: 'absolute', top: 10, left: 10,
                        width: 28, height: 28, borderRadius: 8,
                        background: 'rgba(0,0,0,0.5)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, backdropFilter: 'blur(4px)'
                      }}>
                        {img.sortOrder ?? 0}
                      </div>
                    </div>

                    {/* Title bar */}
                    {img.title && (
                      <div style={{
                        padding: '10px 14px', borderTop: '1px solid #f3f4f6',
                        fontSize: 13, fontWeight: 600, color: '#374151',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {img.title}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add new card */}
                <div
                  onClick={handleAdd}
                  style={{
                    borderRadius: 14, border: '2px dashed #d1d5db',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: 220, cursor: 'pointer', transition: 'all 0.25s',
                    background: '#fafbfc', color: '#9ca3af'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = '#fafbfc'; }}
                >
                  <i className="fas fa-plus-circle" style={{ fontSize: 32, marginBottom: 10, transition: 'inherit' }}></i>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Add Image</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload / Edit Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={formData.id ? "Edit Community Image" : "Add Community Image"}
        maxWidth={560}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
              {formData.id ? 'Update Image' : 'Add Image'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Image Upload / Preview */}
          <div className="form-group">
            <label>Image</label>
            <div style={{
              border: '2px dashed #e5e7eb', borderRadius: 14, padding: 20,
              textAlign: 'center', background: '#fafbfc', position: 'relative',
              transition: 'all 0.25s', cursor: 'pointer', minHeight: 180,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
            onClick={() => document.getElementById('community-image-input')?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
            onDragLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fafbfc'; }}
            onDrop={e => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = '#fafbfc';
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                setImageFile(file);
                const reader = new FileReader();
                reader.onload = (ev) => setImagePreview(ev.target.result);
                reader.readAsDataURL(file);
              }
            }}
            >
              {imagePreview ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 10, objectFit: 'contain', margin: '0 auto', display: 'block' }}
                  />
                  <div style={{
                    marginTop: 12, fontSize: 12, color: '#6b7280'
                  }}>
                    <i className="fas fa-sync-alt" style={{ marginRight: 6 }}></i>
                    Click or drag to replace
                  </div>
                </div>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt" style={{ fontSize: 36, color: '#d1d5db', marginBottom: 12 }}></i>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', margin: 0 }}>
                    Drop image here or click to browse
                  </p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                    JPG, PNG, WebP — max 10MB
                  </p>
                </>
              )}
              <input
                id="community-image-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Title <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Precision Craftsmanship"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Sort Order</label>
              <input
                type="number"
                className="form-control"
                value={formData.sortOrder}
                onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                className="form-control"
                value={formData.isActive?.toString()}
                onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              >
                <option value="true">Active</option>
                <option value="false">Hidden</option>
              </select>
            </div>
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Image"
        message={`Are you sure you want to remove this community image${deleteTarget?.title ? ` "${deleteTarget.title}"` : ''}?`}
        loading={deleting}
        danger
      />
    </div>
  );
};

export default CommunityPage;
