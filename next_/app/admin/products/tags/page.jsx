"use client";
import React, { useState, useRef, useEffect } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import * as api from '@/services/adminApi';
import PageHeader from '@/components/admin/ui/PageHeader';
import FormField from '@/components/admin/ui/FormField';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/AdminModal';
import { useToast } from '@/context/ToastContext';

const TagsPage = () => {
  const toast = useToast();
  const { data, loading, errors, refetch, addRecord, updateRecord, deleteRecord } = useAdminData();
  const tags = data.tags || [];

  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const actionsRef = useRef({});

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [form, setForm] = useState({ 
    name: '', slug: '', description: '', isActive: true, 
    color: '#6366f1', icon: 'fas fa-tag', isFeatured: false 
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!tableRef.current || loading.tags) return;
    tabulatorRef.current?.destroy();

    actionsRef.current = {
      onEdit: (rec) => {
        setEditingRecord(rec);
        setForm({
          name: rec.name || '',
          slug: rec.slug || '',
          description: rec.description || '',
          isActive: rec.isActive === true || rec.isActive === 1,
          color: rec.color || '#6366f1',
          icon: rec.icon || 'fas fa-tag',
          isFeatured: !!rec.isFeatured
        });
        setShowForm(true);
      },
      onDelete: (id, name) => setDeleteTarget({ id, name })
    };

    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: tags,
      layout: 'fitColumns',
      responsiveLayout: 'collapse',
      pagination: 'local',
      paginationSize: 15,
      placeholder: 'No tags found',
      columnHeaderVertAlign: 'bottom',
      columns: [
        {
          title: 'ID', field: 'id', width: 80, hozAlign: 'center', headerSort: true,
          formatter: (cell) => `<span style="font-weight:600;color:#94a3b8;font-size:12px">#${cell.getValue()}</span>`,
        },
        {
          title: 'TAG IDENTITY', field: 'name', minWidth: 280,
          formatter: (cell) => {
            const d = cell.getRow().getData();
            const color = d.color || '#6366f1';
            return `
              <div style="display:flex;align-items:center;gap:14px;padding:8px 0">
                <div style="width:40px;height:40px;background:${color}10;color:${color};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:16px;border:1px solid ${color}25;box-shadow:0 2px 4px rgba(0,0,0,0.02)">
                  <i class="${d.icon || 'fas fa-tag'}"></i>
                </div>
                <div style="min-width:0">
                  <div style="font-weight:800;color:#1e293b;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.01em">${d.name}</div>
                  <div style="font-size:11px;color:${color};font-weight:700;margin-top:2px;text-transform:lowercase;font-family:'SF Mono',monospace">/${d.slug}</div>
                </div>
              </div>
            `;
          },
        },
        {
          title: 'USAGE', field: '_count.products', width: 110, hozAlign: 'center',
          formatter: (cell) => `<div style="text-align:center"><span style="font-weight:800;color:#1e293b;font-size:15px">${cell.getValue() ?? 0}</span><div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;font-weight:700">Products</div></div>`,
        },
        {
          title: 'FEAURED', field: 'isFeatured', width: 110, hozAlign: 'center',
          formatter: (cell) => cell.getValue() ? `<span style="font-size:16px;color:#f59e0b;filter:drop-shadow(0 2px 4px rgba(245,158,11,0.2))"><i class="fas fa-star"></i></span>` : `<span style="font-size:16px;color:#e2e8f0"><i class="far fa-star"></i></span>`,
        },
        {
          title: 'STATUS', field: 'isActive', width: 120, hozAlign: 'center',
          formatter: (cell) => {
            const active = cell.getValue() === true || cell.getValue() === 1;
            return `<div class="status-badge" style="display:inline-flex;padding:5px 14px;border-radius:10px;font-size:10px;font-weight:800;background:${active ? '#ecfdf5' : '#fef2f2'};color:${active ? '#10b981' : '#ef4444'};border:1px solid ${active ? '#d1fae5' : '#fee2e2'};text-transform:uppercase;letter-spacing:0.04em">${active ? 'active' : 'hidden'}</div>`;
          },
        },
        {
          title: 'ACTIONS', headerSort: false, hozAlign: 'right', width: 110,
          formatter: () => `<div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn-icon btn-icon-edit" style="background:#f5f3ff;color:#6366f1;width:32px;height:32px;border-radius:8px" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn-icon btn-icon-delete" style="background:#fef2f2;color:#ef4444;width:32px;height:32px;border-radius:8px" title="Delete"><i class="fas fa-trash-alt"></i></button>
          </div>`,
          cellClick: (e, cell) => {
            const d = cell.getRow().getData();
            if (e.target.closest('.btn-icon-edit')) actionsRef.current.onEdit(d);
            if (e.target.closest('.btn-icon-delete')) actionsRef.current.onDelete(d.id, d.name);
          },
        },
      ],
    });

    return () => { tabulatorRef.current?.destroy(); tabulatorRef.current = null; };
  }, [tags, loading.tags]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'isActive' ? value === 'active' : value),
      ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {}),
    }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Tag name is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setSubmitting(true);
    const payload = {
        ...form,
        status: form.isActive ? 1 : 0
    };

    let success;
    if (editingRecord) {
      success = await updateRecord('tags', editingRecord.id, payload, api.updateTag);
    } else {
      success = await addRecord('tags', payload, api.createTag);
    }
    
    setSubmitting(false);
    if (success) closeModal();
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingRecord(null);
    setForm({ name: '', slug: '', description: '', isActive: true, color: '#6366f1', icon: 'fas fa-tag', isFeatured: false });
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const success = await deleteRecord('tags', deleteTarget.id, api.deleteTag);
    setDeleting(false);
    if (success) setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Product Tags"
        subtitle="Manage labels and visual indicators for products"
        action={{ label: 'New Tag', icon: 'fas fa-plus', onClick: () => setShowForm(true) }}
      />

      <div className="admin-card" style={{ borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--admin-shadow-sm)', border: '1px solid var(--admin-border-light)' }}>
        {loading.tags ? <Loader message="Loading tags..." /> :
         errors.tags   ? <ErrorBanner message={errors.tags} onRetry={() => refetch.tags()} /> :
         <div style={{ overflowX: 'auto' }}><div style={{ minWidth: 850 }}><div ref={tableRef}></div></div></div>
        }
      </div>

      <AdminModal isOpen={showForm} onClose={closeModal} title={editingRecord ? "Edit Product Tag" : "Create New Tag"} maxWidth={560} icon="fas fa-tags">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ gridColumn: '1 / -1' }}>
                <FormField label="Tag Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. New Arrival" required error={formErrors.name} />
            </div>
            
            <FormField label="Slug / Handle" name="slug" value={form.slug} onChange={handleChange} placeholder="e.g. new-arrival" hint="URL index" />
            
            <FormField 
              label="Tag Color" 
              name="color" 
              type="color" 
              value={form.color} 
              onChange={handleChange} 
            />

            <div className="form-group">
                <label className="admin-label">Visual Icon</label>
                <select name="icon" className="admin-input" style={{ borderRadius: 12 }} value={form.icon} onChange={handleChange}>
                    <option value="fas fa-tag">🏷️ Standard Tag</option>
                    <option value="fas fa-fire">🔥 Hot / Trending</option>
                    <option value="fas fa-star">⭐ Featured</option>
                    <option value="fas fa-gem">💎 Premium Selection</option>
                    <option value="fas fa-leaf">🍃 Sustainable</option>
                    <option value="fas fa-clock">⏰ Limited Time</option>
                    <option value="fas fa-gift">🎁 Special Offer</option>
                </select>
            </div>

            <FormField 
              label="Availability" 
              name="isActive" 
              type="select" 
              value={form.isActive ? 'active' : 'inactive'} 
              onChange={handleChange}
              options={[{ value: 'active', label: 'Active (Visible)' }, { value: 'inactive', label: 'Hidden' }]}
            />

            <div style={{ alignSelf: 'center', paddingTop: 10, gridColumn: '1 / -1' }}>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-5 h-5 rounded text-indigo-600 transition-all border-slate-300 focus:ring-indigo-500" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>Highlight as Featured</span>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Featured tags may be displayed differently on the homepage.</span>
                    </div>
                </label>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
                <FormField label="Internal Description" name="description" type="textarea" value={form.description} onChange={handleChange} placeholder="What is this tag used for?" rows={3} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--admin-border-light)' }}>
            <button type="button" className="btn-secondary" onClick={closeModal} style={{ borderRadius: 12, padding: '10px 20px' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ borderRadius: 12, padding: '10px 24px' }}>
              {submitting ? <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</> : <><i className={editingRecord ? "fas fa-save mr-2" : "fas fa-plus mr-2"}></i> {editingRecord ? 'Update Tag' : 'Create Tag'}</>}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product Tag"
        message={`This will permanently delete the tag "${deleteTarget?.name}". Existing products will no longer display this tag. Continue?`}
        confirmLabel="Confirm Delete"
        loading={deleting}
        danger
      />
    </div>
  );
};

export default TagsPage;
