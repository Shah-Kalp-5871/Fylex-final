"use client";
import React, { useRef, useState, useEffect } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import AdminModal from '@/components/admin/AdminModal';
import * as api from '@/services/adminApi';
import { useAdminData } from '@/context/AdminDataContext';
import { useToast } from '@/context/ToastContext';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import Swal from 'sweetalert2';

const PageList = () => {
  const toast = useToast();
  const { data, loading, errors, refetch, addRecord, updateRecord, deleteRecord } = useAdminData();
  const pages = data.pages || [];

  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const actionsRef = useRef({});

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', slug: '', status: 'draft', content: '' });

  useEffect(() => {
    if (!tableRef.current || loading.pages) return;
    tabulatorRef.current?.destroy();

    actionsRef.current = {
      onEdit: (d) => { setFormData(d); setShowModal(true); },
      onDelete: async (id) => {
        const result = await Swal.fire({
          title: 'Delete this page?',
          text: 'This action cannot be undone.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it'
        });
        if (result.isConfirmed) {
          await deleteRecord('pages', id, api.deletePage);
        }
      },
    };

    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: pages,
      layout: "fitColumns",
      pagination: "local",
      paginationSize: 10,
      placeholder: "No pages found",
      columns: [
        {
          title: 'Page Title', field: 'title', widthGrow: 2,
          formatter: (cell) => `<div style="display:flex;align-items:center;gap:10px">
            <div style="width:30px;height:30px;border-radius:7px;background:#f6f8fc;border:1px solid #e4e8f0;display:flex;align-items:center;justify-content:center;color:#8a96b0;font-size:12px;flex-shrink:0"><i class="fas fa-file-alt"></i></div>
            <span style="font-weight:600;color:#0e1726;font-size:13px">${cell.getValue()}</span>
          </div>`
        },
        {
          title: 'Slug', field: 'slug', widthGrow: 1.5,
          formatter: (cell) => `<span style="font-style:italic;color:#8a96b0;font-size:12px">/${cell.getValue()}</span>`
        },
        {
          title: 'Status', field: 'isActive', width: 110, hozAlign: 'center',
          formatter: (cell) => {
            const v = cell.getValue();
            const active = v === true || v === 1 || v === 'published';
            return `<span class="status-pill ${active ? 'pill-active' : 'pill-warning'}">${active ? 'Published' : 'Draft'}</span>`;
          }
        },
        {
          title: 'Last Updated', field: 'updatedAt', width: 130, hozAlign: 'center',
          formatter: (cell) => {
            const val = cell.getValue();
            return `<span style="font-size:12px;color:#8a96b0">${val ? new Date(val).toLocaleDateString() : '—'}</span>`;
          }
        },
        {
          title: 'Actions', headerSort: false, hozAlign: 'right', width: 100,
          formatter: () => `<div style="display:flex;gap:6px;justify-content:flex-end">
            <button class="btn-icon btn-icon-edit"><i class="fas fa-edit"></i></button>
            <button class="btn-icon btn-icon-delete"><i class="fas fa-trash-alt"></i></button>
          </div>`,
          cellClick: (e, cell) => {
            const d = cell.getRow().getData();
            if (e.target.closest('.btn-icon-edit')) actionsRef.current.onEdit(d);
            if (e.target.closest('.btn-icon-delete')) actionsRef.current.onDelete(d.id);
          }
        }
      ],
    });

    return () => { tabulatorRef.current?.destroy(); tabulatorRef.current = null; };
  }, [pages, loading.pages]);

  const handleSave = async () => {
    if (!formData.title || !formData.slug) return;
    setSaving(true);
    const payload = { ...formData, isActive: formData.status === 'published' };
    
    let success;
    if (formData.id) {
       success = await updateRecord('pages', formData.id, payload, api.updatePage);
    } else {
       success = await addRecord('pages', payload, api.createPage);
    }
    
    setSaving(false);
    if (success || success === undefined) {
      setShowModal(false);
    }
  };

  const handleAdd = () => {
    setFormData({ title: '', slug: '', status: 'draft', content: '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>CMS Pages</h2>
          <p style={{ color: '#64748b' }}>Manage static pages and content</p>
        </div>
        <button className="btn-primary" onClick={handleAdd}><i className="fas fa-plus mr-2"></i>Create Page</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>All Pages</h3>
          <div className="admin-search" style={{ width: 240 }}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search pages..." />
          </div>
        </div>
        {loading.pages ? <Loader /> : 
         errors.pages  ? <ErrorBanner message={errors.pages} onRetry={() => refetch.pages()} /> : (
            <div ref={tableRef}></div>
        )}
      </div>

      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={formData.id ? "Edit CMS Page" : "Create New CMS Page"}
        maxWidth={800}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                Save Content
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group sm:col-span-1">
              <label>Page Title</label>
              <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Terms of Service" />
            </div>
            <div className="form-group sm:col-span-1">
              <label>Slug</label>
              <input type="text" className="form-control" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. terms-of-service" />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="form-group">
            <label>Page Content</label>
            <textarea 
               className="form-control" 
               style={{ height: 300 }} 
               value={formData.content || ''} 
               onChange={e => setFormData({...formData, content: e.target.value})}
               placeholder="Enter page HTML or text content..."
            ></textarea>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default PageList;
