"use client";
import React, { useRef, useState, useEffect } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import * as api from '@/services/adminApi';
import { useAdminData } from '@/context/AdminDataContext';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import AdminModal from '@/components/admin/AdminModal';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import PageHeader from '@/components/admin/ui/PageHeader';
import { useToast } from '@/context/ToastContext';

const TestimonialList = () => {
  const toast = useToast();
  const { data, loading, errors, refetch, addRecord, updateRecord, deleteRecord } = useAdminData();
  const testimonials = data.testimonials || [];

  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const actionsRef = useRef({});

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', designation: '', rating: 5, message: '', isActive: true });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const starHtml = (rating) => {
    let html = '<div style="display:flex;gap:2px">';
    for (let i = 0; i < 5; i++) {
      html += `<i class="${i < rating ? 'fas' : 'far'} fa-star" style="font-size:11px;color:${i < rating ? '#f59e0b' : '#e4e8f0'}"></i>`;
    }
    return html + '</div>';
  };

  useEffect(() => {
    if (!tableRef.current || loading.testimonials) return;
    tabulatorRef.current?.destroy();

    actionsRef.current = {
      onEdit: (d) => {
        setFormData({
          id: d.id,
          name: d.name,
          designation: d.designation,
          rating: d.rating || 5,
          message: d.message || d.content || '',
          isActive: d.isActive ?? true
        });
        setShowModal(true);
      },
      onDelete: (id, name) => setDeleteTarget({ id, name }),
    };


    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: testimonials,
      layout: "fitColumns",
      pagination: "local",
      paginationSize: 10,
      placeholder: "No testimonials found",
      columns: [
        {
          title: 'Client', field: 'name', widthGrow: 1.4,
          formatter: (cell) => {
            const d = cell.getRow().getData();
            const name = d.name || 'Unknown';
            return `<div style="display:flex;align-items:center;gap:10px">
              <div style="width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#eef2ff,#f5f3ff);border:1px solid #e4e8f0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#4f46e5;font-size:13px;flex-shrink:0">${name[0]}</div>
              <span style="font-weight:600;color:#0e1726;font-size:13px">${name}</span>
            </div>`;
          }
        },
        {
          title: 'Designation', field: 'designation', widthGrow: 1.2,
          formatter: (cell) => `<span style="font-style:italic;color:#8a96b0;font-size:12px">${cell.getValue() || '—'}</span>`
        },
        {
          title: 'Rating', field: 'rating', width: 140, hozAlign: 'center',
          formatter: (cell) => starHtml(cell.getValue() || 0)
        },
        {
          title: 'Content', field: 'message', widthGrow: 2.5,
          formatter: (cell) => {
            const val = cell.getValue() || cell.getRow().getData().content || '';
            return `<span style="font-style:italic;color:#4b5a7a;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;max-width:320px" title="${val}">"${val}"</span>`;
          }
        },
        {
          title: 'Status', field: 'isActive', width: 100, hozAlign: 'center',
          formatter: (cell) => {
            const active = cell.getValue() === true || cell.getValue() === 1;
            return `<span class="status-pill ${active ? 'pill-active' : 'pill-inactive'}">${active ? 'Active' : 'Inactive'}</span>`;
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
            if (e.target.closest('.btn-icon-delete')) actionsRef.current.onDelete(d.id, d.name);
          }
        }
      ],
    });

    return () => {
      tabulatorRef.current?.destroy();
      tabulatorRef.current = null;
    };
  }, [testimonials, loading.testimonials]);


  const handleSave = async () => {
    if (!formData.name && !formData.message) return;
    setSaving(true);
    let success;
    if (formData.id) {
      success = await updateRecord('testimonials', formData.id, formData, api.updateTestimonial);
    } else {
      success = await addRecord('testimonials', formData, api.createTestimonial);
    }
    setSaving(false);
    if (success || success === undefined) {
      setShowModal(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: '', designation: '', rating: 5, message: '', isActive: true });
    setShowModal(true);
  };

  return (
    <div className="w-full px-6 lg:px-10 xl:px-16 py-6">
      <div className="max-w-[1600px] mx-auto">
        <PageHeader
          title="Testimonials"
          subtitle="Manage client endorsements and brand voices"
          action={{ label: 'Add Testimonial', icon: 'fas fa-plus', onClick: handleAdd }}
        />

        <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">All Testimonials</h3>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"></i>
                <input
                  type="text"
                  placeholder="Search testimonials..."
                  className="pl-10 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all w-64"
                  onChange={e => {
                    if (tabulatorRef.current) {
                      if (e.target.value) tabulatorRef.current.setFilter('name', 'like', e.target.value);
                      else tabulatorRef.current.clearFilter();
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="p-1">
            {loading.testimonials ? (
              <div className="py-24"><Loader message="Loading testimonials..." /></div>
            ) : errors.testimonials ? (
              <div className="p-8"><ErrorBanner message={errors.testimonials} onRetry={() => refetch.testimonials()} /></div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div ref={tableRef}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={formData.id ? "Edit Testimonial" : "Add New Testimonial"}
        maxWidth={600}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
              Save Testimonial
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label>Client Name</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. John Doe" />
          </div>
          <div className="form-group">
            <label>Designation / Title</label>
            <input type="text" className="form-control" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} placeholder="e.g. Luxury Watch Enthusiast" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label>Rating</label>
              <select className="form-control" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={formData.isActive?.toString()} onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Testimonial Content</label>
            <textarea className="form-control" rows="4" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="What the client said about Fylexx..."></textarea>
          </div>
        </div>
      </AdminModal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          setDeleting(true);
          const success = await deleteRecord('testimonials', deleteTarget.id, api.deleteTestimonial);
          setDeleting(false);
          if (success) setDeleteTarget(null);
        }}
        title="Delete Testimonial"
        message={`Are you sure you want to remove the testimonial from "${deleteTarget?.name}"?`}
        loading={deleting}
        danger
      />
    </div>
  );
};

export default TestimonialList;
