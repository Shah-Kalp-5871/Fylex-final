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

const FaqPage = () => {
  const toast = useToast();
  const { data, loading, errors, refetch, addRecord, updateRecord, deleteRecord } = useAdminData();
  
  const faqs = data.faqs || [];

  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const actionsRef = useRef({});

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    sortOrder: '0',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!tableRef.current || loading.faqs) return;
    tabulatorRef.current?.destroy();

    actionsRef.current = {
      onEdit: (rec) => {
        setEditingItem(rec);
        setFormData({
          question: rec.question || '',
          answer: rec.answer || '',
          sortOrder: rec.sortOrder?.toString() || '0',
          isActive: rec.isActive
        });
        setShowForm(true);
      },
      onDelete: (id, name) => setDeleteTarget({ id, name })
    };

    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: faqs,
      layout: 'fitColumns',
      responsiveLayout: 'collapse',
      pagination: 'local',
      paginationSize: 10,
      placeholder: 'No FAQs found',
      columns: [
        { title: 'ID', field: 'id', width: 70, hozAlign: 'center', formatter: (cell) => `<span class="text-slate-400 font-bold">#${cell.getValue()}</span>` },
        { 
          title: 'QUESTION', field: 'question', minWidth: 250,
          formatter: (cell) => `<div class="font-bold text-slate-800 whitespace-normal leading-tight py-2">${cell.getValue()}</div>`
        },
        { 
          title: 'ANSWER', field: 'answer', minWidth: 350,
          formatter: (cell) => `<div class="text-slate-500 text-sm whitespace-normal leading-snug line-clamp-2 py-2">${cell.getValue()}</div>`
        },
        { title: 'SORT', field: 'sortOrder', width: 90, hozAlign: 'center' },
        { 
          title: 'STATUS', field: 'isActive', width: 110, hozAlign: 'center',
          formatter: (cell) => {
            const active = cell.getValue();
            return `<div class="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}">${active ? 'active' : 'hidden'}</div>`;
          }
        },
        {
          title: 'ACTIONS', headerSort: false, hozAlign: 'right', width: 120,
          formatter: () => `<div class="flex gap-2 justify-end">
            <button class="btn-icon-edit w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl transition-colors" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn-icon-delete w-9 h-9 bg-rose-50 text-rose-600 rounded-xl transition-colors" title="Delete"><i class="fas fa-trash-alt"></i></button>
          </div>`,
          cellClick: (e, cell) => {
            const d = cell.getRow().getData();
            if (e.target.closest('.btn-icon-edit')) actionsRef.current.onEdit(d);
            if (e.target.closest('.btn-icon-delete')) actionsRef.current.onDelete(d.id, 'this FAQ');
          },
        },
      ],
    });

    return () => { tabulatorRef.current?.destroy(); tabulatorRef.current = null; };
  }, [faqs, loading.faqs]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question) { setFormErrors({ question: 'Question is required' }); return; }
    if (!formData.answer) { setFormErrors({ answer: 'Answer is required' }); return; }

    setSubmitting(true);
    const payload = {
      ...formData,
      sortOrder: parseInt(formData.sortOrder) || 0
    };

    try {
      if (editingItem) {
        await updateRecord('faqs', editingItem.id, payload, api.updateFaq);
      } else {
        await addRecord('faqs', payload, api.createFaq);
      }
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const success = await deleteRecord('faqs', deleteTarget.id, api.deleteFaq);
      if (success) {
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ question: '', answer: '', sortOrder: '0', isActive: true });
    setFormErrors({});
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Manage FAQs"
        subtitle="Manage frequently asked questions displayed on the Care & Support page"
        action={{ label: 'Add New FAQ', icon: 'fas fa-plus', onClick: () => setShowForm(true) }}
      />

      <div className="admin-card overflow-hidden border border-slate-200 shadow-sm rounded-[24px]">
        <div className="bg-white border-bottom border-slate-100 !px-6 !py-5 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 m-0">FAQ Entries</h3>
          <div className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-widest">{faqs.length} entries</div>
        </div>
        
        {loading.faqs ? (
          <div className="py-24 text-center"><Loader message="Loading FAQs..." /></div>
        ) : errors.faqs ? (
          <div className="p-10"><ErrorBanner message={errors.faqs} onRetry={() => refetch.faqs()} /></div>
        ) : (
          <div className="px-3 pb-3 overflow-x-auto">
            <div className="min-w-[900px]"><div ref={tableRef}></div></div>
          </div>
        )}
      </div>

      <AdminModal 
        isOpen={showForm} 
        onClose={closeModal} 
        title={editingItem ? "Edit FAQ" : "Add New FAQ"} 
        maxWidth={600}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
            <FormField 
                label="Question *" 
                name="question" 
                value={formData.question} 
                onChange={handleChange} 
                placeholder="Enter the question..." 
                required 
                error={formErrors.question}
            />

            <FormField 
                label="Answer *" 
                name="answer" 
                type="textarea"
                rows={5}
                value={formData.answer} 
                onChange={handleChange} 
                placeholder="Enter the answer..."
                required
                error={formErrors.answer}
            />

            <FormField 
                label="Sort Order" 
                name="sortOrder" 
                type="number"
                value={formData.sortOrder} 
                onChange={handleChange} 
                hint="Lower numbers appear first"
            />

            <label className="flex items-center gap-3 cursor-pointer group pt-2">
                <input 
                    type="checkbox" 
                    name="isActive" 
                    checked={formData.isActive} 
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Visible to Customers</span>
            </label>

            <div className="flex gap-3 justify-end pt-6 border-t border-slate-100">
                <button type="button" className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold transition-colors" onClick={closeModal}>Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2" disabled={submitting}>
                    {submitting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-save"></i>}
                    {editingItem ? 'Update FAQ' : 'Save FAQ'}
                </button>
            </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete FAQ?"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
        confirmLabel="Confirm Deletion"
        loading={deleting}
        danger
      />
    </div>
  );
};

export default FaqPage;
