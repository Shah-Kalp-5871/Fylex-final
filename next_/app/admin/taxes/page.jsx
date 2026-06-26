"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';
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

const TaxPage = () => {
  const toast = useToast();
  const { data, loading, errors, refetch, addRecord, updateRecord, deleteRecord } = useAdminData();
  
  const taxes = data.taxes || [];
  const taxClasses = data.taxClasses || [];

  const [activeTab, setActiveTab] = useState('rates'); // 'rates' or 'classes'

  // Refs for Tabulator
  const ratesTableRef = useRef(null);
  const ratesTabulatorRef = useRef(null);
  const classesTableRef = useRef(null);
  const classesTabulatorRef = useRef(null);
  
  const ratesActionsRef = useRef({});
  const classesActionsRef = useRef({});

  // Modals & Forms State
  const [showRateForm, setShowRateForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, type: 'rate'|'class' }
  const [deleting, setDeleting] = useState(false);

  // Rate Form State
  const [rateForm, setRateForm] = useState({
    name: '',
    code: '',
    description: '',
    rate: '0',
    type: 'percentage',
    priority: '0',
    sortOrder: '0',
    taxClassIds: [],
    isCompound: false,
    isActive: true
  });

  // Class Form State
  const [classForm, setClassForm] = useState({
    name: '',
    code: '',
    description: '',
    taxRateIds: [],
    isDefault: false
  });

  const [formErrors, setFormErrors] = useState({});

  // ─── Tabulator: Tax Rates ────────────────────────────────────
  useEffect(() => {
    if (!ratesTableRef.current || loading.taxes || activeTab !== 'rates') return;
    ratesTabulatorRef.current?.destroy();

    ratesActionsRef.current = {
      onEdit: (rec) => {
        setEditingRate(rec);
        setRateForm({
          name: rec.name || '',
          code: rec.code || '',
          description: rec.description || '',
          rate: rec.rate?.toString() || '0',
          type: rec.type || 'percentage',
          priority: rec.priority?.toString() || '0',
          sortOrder: rec.sortOrder?.toString() || '0',
          taxClassIds: rec.taxClasses?.map(c => c.id.toString()) || [],
          isCompound: !!rec.isCompound,
          isActive: rec.isActive === true || rec.isActive === 1
        });
        setShowRateForm(true);
      },
      onDelete: (id, name) => setDeleteTarget({ id, name, type: 'rate' })
    };

    ratesTabulatorRef.current = new Tabulator(ratesTableRef.current, {
      data: taxes,
      layout: 'fitColumns',
      responsiveLayout: 'collapse',
      pagination: 'local',
      paginationSize: 10,
      placeholder: 'No tax rates found',
      columns: [
        { title: 'ID', field: 'id', width: 70, hozAlign: 'center', formatter: (cell) => `<span class="text-slate-400 font-bold">#${cell.getValue()}</span>` },
        { 
          title: 'TAX NAME', field: 'name', minWidth: 200,
          formatter: (cell) => `<div><div class="font-bold text-slate-800">${cell.getValue()}</div><div class="text-xs text-slate-400">${cell.getRow().getData().code || ''}</div></div>`
        },
        { 
          title: 'RATE', field: 'rate', width: 120, hozAlign: 'center',
          formatter: (cell) => {
            const row = cell.getRow().getData();
            const symbol = row.type === 'percentage' ? '%' : ' (Fixed)';
            return `<span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-mono font-bold border border-indigo-100">${cell.getValue()}${symbol}</span>`;
          }
        },
        { 
            title: 'CLASSES', field: 'taxClasses', minWidth: 150,
            formatter: (cell) => {
                const classes = cell.getValue() || [];
                if (classes.length === 0) return '<span class="text-slate-300 text-xs">—</span>';
                return `<div class="flex flex-wrap gap-1">${classes.map(c => `<span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">${c.name}</span>`).join('')}</div>`;
            }
        },
        { 
          title: 'STATUS', field: 'isActive', width: 110, hozAlign: 'center',
          formatter: (cell) => {
            const active = cell.getValue() === true || cell.getValue() === 1;
            return `<div class="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}">${active ? 'active' : 'disabled'}</div>`;
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
            if (e.target.closest('.btn-icon-edit')) ratesActionsRef.current.onEdit(d);
            if (e.target.closest('.btn-icon-delete')) ratesActionsRef.current.onDelete(d.id, d.name);
          },
        },
      ],
    });

    return () => { ratesTabulatorRef.current?.destroy(); ratesTabulatorRef.current = null; };
  }, [taxes, loading.taxes, activeTab]);

  // ─── Tabulator: Tax Classes ───────────────────────────────────
  useEffect(() => {
    if (!classesTableRef.current || loading.taxClasses || activeTab !== 'classes') return;
    classesTabulatorRef.current?.destroy();

    classesActionsRef.current = {
      onEdit: (rec) => {
        setEditingClass(rec);
        setClassForm({
          name: rec.name || '',
          code: rec.code || '',
          description: rec.description || '',
          taxRateIds: rec.taxRates?.map(r => r.id.toString()) || [],
          isDefault: rec.isDefault === true || rec.isDefault === 1
        });
        setShowClassForm(true);
      },
      onDelete: (id, name) => setDeleteTarget({ id, name, type: 'class' })
    };

    classesTabulatorRef.current = new Tabulator(classesTableRef.current, {
      data: taxClasses,
      layout: 'fitColumns',
      responsiveLayout: 'collapse',
      pagination: 'local',
      paginationSize: 10,
      placeholder: 'No tax classes found',
      columns: [
        { title: 'ID', field: 'id', width: 70, hozAlign: 'center', formatter: (cell) => `<span class="text-slate-400 font-bold">#${cell.getValue()}</span>` },
        { 
          title: 'CLASS NAME', field: 'name', minWidth: 200,
          formatter: (cell) => `<div><div class="font-bold text-slate-800 uppercase tracking-tight">${cell.getValue()}</div><div class="text-xs text-slate-400">${cell.getRow().getData().code || ''}</div></div>`
        },
        { 
            title: 'TAX RATES', field: 'taxRates', minWidth: 200,
            formatter: (cell) => {
                const rates = cell.getValue() || [];
                if (rates.length === 0) return '<span class="text-slate-300 text-xs">No rates assigned</span>';
                return `<div class="flex flex-wrap gap-1">${rates.map(r => `<span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold border border-indigo-100">${r.name} (${r.rate}%)</span>`).join('')}</div>`;
            }
        },
        { 
          title: 'DEFAULT', field: 'isDefault', width: 120, hozAlign: 'center',
          formatter: (cell) => {
            const isDef = cell.getValue() === true || cell.getValue() === 1;
            return isDef ? `<div class="text-amber-500"><i class="fas fa-star mr-1"></i> Default</div>` : `<span class="text-slate-300 text-xs">No</span>`;
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
            if (e.target.closest('.btn-icon-edit')) classesActionsRef.current.onEdit(d);
            if (e.target.closest('.btn-icon-delete')) classesActionsRef.current.onDelete(d.id, d.name);
          },
        },
      ],
    });

    return () => { classesTabulatorRef.current?.destroy(); classesTabulatorRef.current = null; };
  }, [taxClasses, loading.taxClasses, activeTab]);

  // ─── Handlers ───────────────────────────────────────────────
  const handleRateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRateForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleClassChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClassForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!rateForm.name) { setFormErrors({ name: 'Name is required' }); return; }

    setSubmitting(true);
    const payload = {
        ...rateForm,
        rate: parseFloat(rateForm.rate),
        priority: parseInt(rateForm.priority),
        sortOrder: parseInt(rateForm.sortOrder),
        taxClassIds: rateForm.taxClassIds
    };

    try {
      if (editingRate) {
        await updateRecord('taxes', editingRate.id, payload, api.updateTaxRate);
      } else {
        await addRecord('taxes', payload, api.createTaxRate);
      }
      closeRateModal();
      await refetch.taxes();
      await refetch.taxClasses(); // Refresh relations
    } finally {
      setSubmitting(false);
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    if (!classForm.name) { setFormErrors({ name: 'Name is required' }); return; }

    setSubmitting(true);
    try {
      if (editingClass) {
        await updateRecord('taxClasses', editingClass.id, classForm, api.updateTaxClass);
      } else {
        await addRecord('taxClasses', classForm, api.createTaxClass);
      }
      closeClassModal();
      await refetch.taxClasses();
      await refetch.taxes(); // Refresh relations
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const isRate = deleteTarget.type === 'rate';
      const success = isRate 
        ? await deleteRecord('taxes', deleteTarget.id, api.deleteTaxRate)
        : await deleteRecord('taxClasses', deleteTarget.id, api.deleteTaxClass);
      
      if (success) {
        setDeleteTarget(null);
        await (isRate ? refetch.taxes() : refetch.taxClasses());
      }
    } finally {
      setDeleting(false);
    }
  };

  const closeRateModal = () => {
    setShowRateForm(false);
    setEditingRate(null);
    setRateForm({
      name: '', code: '', description: '', rate: '0', type: 'percentage',
      priority: '0', sortOrder: '0', taxClassIds: [], isCompound: false, isActive: true
    });
    setFormErrors({});
  };

  const closeClassModal = () => {
    setShowClassForm(false);
    setEditingClass(null);
    setClassForm({ name: '', code: '', description: '', taxRateIds: [], isDefault: false });
    setFormErrors({});
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Tax & VAT Settings"
        subtitle="Configure global tax rates, classes, and regional VAT rules"
        action={{ 
            label: activeTab === 'rates' ? 'Add New Tax Rate' : 'Create New Class', 
            icon: 'fas fa-plus', 
            onClick: () => activeTab === 'rates' ? setShowRateForm(true) : setShowClassForm(true) 
        }}
      />

      {/* Tabs Layout */}
      <div className="flex gap-4 !mb-2">
        <button 
            onClick={() => setActiveTab('rates')}
            className={`!px-6 !py-3 rounded-2xl font-bold transition-all ${activeTab === 'rates' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
        >
            <i className="fas fa-percent mr-2"></i> Tax Rates
        </button>
        <button 
            onClick={() => setActiveTab('classes')}
            className={`!px-6 !py-3 rounded-2xl font-bold transition-all ${activeTab === 'classes' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
        >
            <i className="fas fa-layer-group mr-2"></i> Tax Classes
        </button>
      </div>

      {activeTab === 'rates' ? (
        <div className="admin-card overflow-hidden border border-slate-200 shadow-sm rounded-[24px]">
          <div className="bg-white border-bottom border-slate-100 !px-6 !py-5 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 m-0">Global Tax Rates</h3>
            <div className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-widest">{taxes.length} entries found</div>
          </div>
          {loading.taxes ? (
            <div className="py-24 text-center"><Loader message="Loading tax rates..." /></div>
          ) : errors.taxes ? (
            <div className="p-10"><ErrorBanner message={errors.taxes} onRetry={() => refetch.taxes()} /></div>
          ) : (
            <div className="px-3 pb-3 overflow-x-auto">
              <div className="min-w-[900px]"><div ref={ratesTableRef}></div></div>
            </div>
          )}
        </div>
      ) : (
        <div className="admin-card overflow-hidden border border-slate-200 shadow-sm rounded-[24px]">
          <div className="bg-white border-bottom border-slate-100 px-6 py-5 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 m-0">Tax Classes</h3>
            <div className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-widest">{taxClasses.length} entries found</div>
          </div>
          {loading.taxClasses ? (
            <div className="py-24 text-center"><Loader message="Loading tax classes..." /></div>
          ) : errors.taxClasses ? (
            <div className="p-10"><ErrorBanner message={errors.taxClasses} onRetry={() => refetch.taxClasses()} /></div>
          ) : (
            <div className="px-3 pb-3 overflow-x-auto">
              <div className="min-w-[900px]"><div ref={classesTableRef}></div></div>
            </div>
          )}
        </div>
      )}

      {/* Tax Rate Modal */}
      <AdminModal 
        isOpen={showRateForm} 
        onClose={closeRateModal} 
        title={editingRate ? "Edit Tax Rate" : "Add New Tax Rate"} 
        maxWidth={550}
      >
        <form onSubmit={handleRateSubmit} className="space-y-5">
            <FormField 
                label="Tax Name *" 
                name="name" 
                value={rateForm.name} 
                onChange={handleRateChange} 
                placeholder="e.g., GST, SGST, CGST" 
                required 
                error={formErrors.name}
            />

            <FormField 
                label="Tax Code" 
                name="code" 
                value={rateForm.code} 
                onChange={handleRateChange} 
                placeholder="e.g., GST18, SGST9" 
                hint="Unique identifier (optional)"
            />

            <FormField 
                label="Description" 
                name="description" 
                type="textarea"
                rows={3}
                value={rateForm.description} 
                onChange={handleRateChange} 
                placeholder="Brief description of this tax rate"
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField 
                    label="Rate (%) *" 
                    name="rate" 
                    type="number"
                    value={rateForm.rate} 
                    onChange={handleRateChange} 
                    required
                />
                <FormField 
                    label="Type *" 
                    name="type" 
                    type="select"
                    value={rateForm.type} 
                    onChange={handleRateChange} 
                    options={[
                        { value: 'percentage', label: 'Percentage (%)' },
                        { value: 'fix_amount', label: 'Fixed Amount' }
                    ]}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField 
                    label="Priority" 
                    name="priority" 
                    type="number"
                    value={rateForm.priority} 
                    onChange={handleRateChange} 
                />
                <FormField 
                    label="Sort Order" 
                    name="sortOrder" 
                    type="number"
                    value={rateForm.sortOrder} 
                    onChange={handleRateChange} 
                />
            </div>

            <FormField 
                label="Tax Classes" 
                name="taxClassIds" 
                type="select"
                multiple
                value={rateForm.taxClassIds} 
                onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setRateForm(prev => ({ ...prev, taxClassIds: values }));
                }} 
                options={taxClasses.map(c => ({ value: c.id.toString(), label: c.name }))}
                hint="Hold Ctrl/Cmd to select multiple classes"
            />

            <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        name="isCompound" 
                        checked={rateForm.isCompound} 
                        onChange={handleRateChange}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Compound Tax</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        name="isActive" 
                        checked={rateForm.isActive} 
                        onChange={handleRateChange}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Active</span>
                </label>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t border-slate-100">
                <button type="button" className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold transition-colors" onClick={closeRateModal}>Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2" disabled={submitting}>
                    {submitting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-check"></i>}
                    {editingRate ? 'Update Rate' : 'Create Tax Rate'}
                </button>
            </div>
        </form>
      </AdminModal>

      {/* Tax Class Modal */}
      <AdminModal 
        isOpen={showClassForm} 
        onClose={closeClassModal} 
        title={editingClass ? "Edit Tax Class" : "Create New Tax Class"} 
        maxWidth={550}
      >
        <form onSubmit={handleClassSubmit} className="space-y-5">
            <FormField 
                label="Class Name *" 
                name="name" 
                value={classForm.name} 
                onChange={handleClassChange} 
                placeholder="e.g., Standard, Reduced, Zero" 
                required 
                error={formErrors.name}
            />

            <FormField 
                label="Tax Code" 
                name="code" 
                value={classForm.code} 
                onChange={handleClassChange} 
                placeholder="e.g., STANDARD, REDUCED" 
                hint="Unique identifier (auto-generated if empty)"
            />

            <FormField 
                label="Description" 
                name="description" 
                type="textarea"
                rows={3}
                value={classForm.description} 
                onChange={handleClassChange} 
                placeholder="Brief description of this tax class"
            />

            <FormField 
                label="Tax Rates" 
                name="taxRateIds" 
                type="select"
                multiple
                value={classForm.taxRateIds} 
                onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setClassForm(prev => ({ ...prev, taxRateIds: values }));
                }} 
                options={taxes.map(r => ({ value: r.id.toString(), label: `${r.name} (${r.rate}%)` }))}
                hint="Hold Ctrl/Cmd to select multiple tax rates"
            />

            <label className="flex items-center gap-3 cursor-pointer group pt-2">
                <input 
                    type="checkbox" 
                    name="isDefault" 
                    checked={classForm.isDefault} 
                    onChange={handleClassChange}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Set as Default Class</span>
            </label>

            <div className="flex gap-3 justify-end pt-6 border-t border-slate-100">
                <button type="button" className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold transition-colors" onClick={closeClassModal}>Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2" disabled={submitting}>
                    {submitting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-save"></i>}
                    {editingClass ? 'Update Class' : 'Create Tax Class'}
                </button>
            </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget?.type === 'rate' ? "Remove Tax Rate?" : "Delete Tax Class?"}
        message={`Warning: Deleting "${deleteTarget?.name}" may affect linked products and calculations. Are you absolutely sure?`}
        confirmLabel="Confirm Removal"
        loading={deleting}
        danger
      />
    </div>
  );
};

export default TaxPage;
