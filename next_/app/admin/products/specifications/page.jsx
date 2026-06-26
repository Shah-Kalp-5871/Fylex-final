"use client";
import React, { useState, useRef, useEffect } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import AdminModal from '@/components/admin/AdminModal';
import * as api from '@/services/adminApi';
import PageHeader from '@/components/admin/ui/PageHeader';
import Loader from '@/components/admin/ui/Loader';
import FormField from '@/components/admin/ui/FormField';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import { useToast } from '@/context/ToastContext';

const SpecificationManagement = () => {
  const toast = useToast();
  const { data, loading, refetch, addRecord, updateRecord, deleteRecord } = useAdminData();
  const specifications = data.specifications || [];
  const groups = data.specificationGroups || [];
  
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'groups', 'values'
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [specValues, setSpecValues] = useState([]);
  const [loadingValues, setLoadingValues] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showGroupView, setShowGroupView] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [showValueForm, setShowValueForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Specification Form
  const [form, setForm] = useState({ 
    name: '', code: '', type: 'select', sortOrder: 0, 
    isRequired: false, isFilterable: true, isActive: true 
  });

  // Group Form
  const [groupForm, setGroupForm] = useState({
    name: '', sortOrder: 0, specificationIds: []
  });
  
  // Value Form
  const [valueForm, setValueForm] = useState({ 
    value: '', 
    sortOrder: 0, 
    status: 1 
  });

  const commonValues = [
    { label: 'Red', color: '#ef4444' }, { label: 'Blue', color: '#3b82f6' }, 
    { label: 'Green', color: '#10b981' }, { label: 'Black', color: '#000' }, 
    { label: 'White', color: '#fff' }, { label: 'Yellow', color: '#f59e0b' }, 
    { label: 'Pink', color: '#ec4899' }, { label: 'Purple', color: '#8b5cf6' }
  ];
  
  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const actionsRef = useRef({});

  // ─── Fetch Values for Selected Spec ───
  useEffect(() => {
    if (activeTab === 'values' && selectedSpec) { fetchValues(selectedSpec.id); }
  }, [activeTab, selectedSpec]);

  const fetchValues = async (specId) => {
    setLoadingValues(true);
    const { data, error } = await api.getSpecificationValues(specId);
    if (!error) setSpecValues(data || []);
    setLoadingValues(false);
  };

  // ─── Table Effect ───
  useEffect(() => {
    if (!tableRef.current) return;
    if (activeTab === 'specs' && loading.specifications) return;
    if (activeTab === 'groups' && loading.specificationGroups) return;
    if (activeTab === 'values' && loadingValues) return;

    tabulatorRef.current?.destroy();

    actionsRef.current = {
      onEdit: (rec) => {
        setEditingRecord(rec);
        if (activeTab === 'specs') {
          setForm({
            name: rec.name || '', code: rec.code || '', type: rec.type || 'select',
            sortOrder: Number(rec.sortOrder) || 0, isRequired: !!rec.isRequired,
            isFilterable: !!rec.isFilterable, isActive: !!rec.isActive
          });
          setShowForm(true);
        } else if (activeTab === 'groups') {
          setGroupForm({
            name: rec.name || '',
            sortOrder: Number(rec.sortOrder) || 0,
            specificationIds: rec.specifications?.map(s => s.specificationId.toString()) || []
          });
          setShowGroupForm(true);
        } else if (activeTab === 'values') {
          setValueForm({ value: rec.value || '', sortOrder: Number(rec.sortOrder) || 0, status: rec.status !== undefined ? rec.status : 1 });
          setShowValueForm(true);
        }
      },
      onDelete: (id, name) => setDeleteTarget({ type: activeTab, id, name }),
      onViewValues: (spec) => { setSelectedSpec(spec); setActiveTab('values'); },
      onViewGroup: (group) => { setSelectedGroup(group); setShowGroupView(true); }
    };

    const currentData = activeTab === 'specs' ? specifications : (activeTab === 'groups' ? groups : specValues);
    
    let columns = [];
    if (activeTab === 'specs') {
      columns = [
        { formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 40 },
        { title: "ID", field: "id", width: 80, hozAlign: "center", formatter: cell => `<span class="id-badge">${cell.getValue()}</span>` },
        {
          title: "Name", field: "name", minWidth: 200,
          formatter: (cell) => {
            const d = cell.getRow().getData();
            return `<div class="name-column">
              <div class="icon-box"><i class="fas fa-tag"></i></div>
              <div>
                <div class="main-text font-bold">${d.name}</div>
                <div class="sub-text">${d.code}</div>
              </div>
            </div>`;
          }
        },
        {
          title: "Type", field: "type", width: 130, hozAlign: "center",
          formatter: (cell) => {
            const type = cell.getValue() || 'text';
            const colors = {
              select: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', icon: 'fa-mouse-pointer' },
              multiselect: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', icon: 'fa-list-check' },
              textarea: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', icon: 'fa-align-left' },
              checkbox: { bg: 'rgba(219, 39, 119, 0.1)', text: '#db2777', icon: 'fa-check-square' },
              radio: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', icon: 'fa-circle-dot' },
              text: { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1', icon: 'fa-font' }
            };
            const style = colors[type.toLowerCase()] || colors.text;
            return `<span class="type-badge" style="background:${style.bg};color:${style.text}">
              <i class="fas ${style.icon}"></i>${type.charAt(0).toUpperCase() + type.slice(1)}
            </span>`;
          }
        },
        {
          title: "Values", field: "values_count", width: 100, hozAlign: "center",
          formatter: (cell) => {
            const d = cell.getRow().getData();
            const count = d._count?.values || 0;
            return `<button class="btn-values-count"><i class="fas fa-layer-group"></i>${count}</button>`;
          },
          cellClick: (e, cell) => { actionsRef.current.onViewValues(cell.getRow().getData()); }
        },
        {
          title: "Required", field: "isRequired", width: 110, hozAlign: "center",
          formatter: (cell) => cell.getValue() 
              ? `<span class="badge-status-req"><i class="fas fa-circle"></i> Required</span>`
              : `<span class="badge-status-opt">Optional</span>`
        },
        {
          title: "Filters", field: "isFilterable", width: 100, hozAlign: "center",
          formatter: (cell) => cell.getValue()
              ? `<span class="badge-status-filt"><i class="fas fa-filter"></i> Yes</span>`
              : `<span class="badge-status-opt">No</span>`
        },
        {
          title: "Status", field: "isActive", width: 110, hozAlign: "center",
          formatter: (cell) => {
            const active = cell.getValue();
            return `<span class="badge-active ${active ? 'active' : 'inactive'}">
              <i class="fas fa-circle"></i> ${active ? 'Active' : 'Inactive'}
            </span>`;
          }
        },
        { title: "Order", field: "sortOrder", width: 80, hozAlign: "center" },
        {
          title: "Actions", width: 110, headerSort: false, hozAlign: "right",
          formatter: () => `<div class="table-actions">
            <button class="btn-edit" title="Edit"><i class="fas fa-pen"></i></button>
            <button class="btn-delete" title="Delete"><i class="fas fa-trash"></i></button>
          </div>`,
          cellClick: (e, cell) => {
            const d = cell.getRow().getData();
            if (e.target.closest('.btn-edit')) actionsRef.current.onEdit(d);
            if (e.target.closest('.btn-delete')) actionsRef.current.onDelete(d.id, d.name);
          }
        },
      ];
    } else if (activeTab === 'groups') {
      columns = [
        { formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 40 },
        { title: "ID", field: "id", width: 80, hozAlign: "center", formatter: cell => `<span class="id-badge">${cell.getValue()}</span>` },
        { 
          title: "Group Name", field: "name", minWidth: 250, 
          formatter: (cell) => `<div class="name-column">
            <div class="icon-box-blue"><i class="fas fa-folder-tree"></i></div>
            <div class="main-text font-bold">${cell.getValue()}</div>
          </div>`
        },
        { 
          title: "Specifications", field: "specs_count", width: 180, hozAlign: "center",
          formatter: (cell) => `<span class="spec-count-badge"><i class="fas fa-tags"></i> ${cell.getValue() || 0} Specs</span>`
        },
        {
          title: "Status", field: "isActive", width: 130, hozAlign: "center",
          formatter: () => `<span class="badge-active active"><i class="fas fa-circle"></i> Active</span>`
        },
        { title: "Order", field: "sortOrder", width: 100, hozAlign: "center" },
        {
          title: "Actions", width: 130, headerSort: false, hozAlign: "right",
          formatter: () => `<div class="table-actions">
            <button class="btn-view" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="btn-edit" title="Edit"><i class="fas fa-pen"></i></button>
            <button class="btn-delete" title="Delete"><i class="fas fa-trash"></i></button>
          </div>`,
          cellClick: (e, cell) => {
            const d = cell.getRow().getData();
            if (e.target.closest('.btn-view')) actionsRef.current.onViewGroup(d);
            if (e.target.closest('.btn-edit')) actionsRef.current.onEdit(d);
            if (e.target.closest('.btn-delete')) actionsRef.current.onDelete(d.id, d.name);
          }
        },
      ];
    } else if (activeTab === 'values') {
      columns = [
        { formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 40 },
        { title: "ID", field: "id", width: 100, hozAlign: "center", formatter: cell => `<span class="id-badge">${cell.getValue()}</span>` },
        { title: "Value", field: "value", minWidth: 200, formatter: (cell) => `<div class="value-text font-bold">${cell.getValue()}</div>` },
        { title: "Order", field: "sortOrder", width: 120, hozAlign: "center" },
        {
          title: "Status", field: "status", width: 120, hozAlign: "center",
          formatter: (cell) => {
            const active = cell.getValue() === 1;
            return `<span class="badge-active ${active ? 'active' : 'inactive'}">
              <i class="fas fa-circle"></i> ${active ? 'Active' : 'Inactive'}
            </span>`;
          }
        },
        { 
          title: "Created", field: "createdAt", width: 180, 
          formatter: (cell) => {
             const val = cell.getValue();
             if (!val) return '<span class="date-text text-slate-400">N/A</span>';
             return `<span class="date-text">${new Date(val).toLocaleString('en-US', { dateStyle: 'medium' })}</span>`;
          }
        },
        {
          title: "Actions", width: 110, headerSort: false, hozAlign: "right",
          formatter: () => `<div class="table-actions">
            <button class="btn-edit" title="Edit"><i class="fas fa-pen"></i></button>
            <button class="btn-delete" title="Delete"><i class="fas fa-trash"></i></button>
          </div>`,
          cellClick: (e, cell) => {
            const d = cell.getRow().getData();
            if (e.target.closest('.btn-edit')) actionsRef.current.onEdit(d);
            if (e.target.closest('.btn-delete')) actionsRef.current.onDelete(d.id, d.value);
          }
        },
      ];
    }

    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: currentData, layout: 'fitColumns', responsiveLayout: 'collapse',
      pagination: 'local', paginationSize: 15, placeholder: `No ${activeTab} data found`,
      columns: columns, headerVisible: true,
      paginationSizeSelector: [15, 30, 50, 100],
    });

    return () => { tabulatorRef.current?.destroy(); };
  }, [specifications, groups, specValues, activeTab, loading.specifications, loadingValues]);

  // ─── Handlers ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
    const success = editingRecord 
      ? await updateRecord('specifications', editingRecord.id, payload, api.updateSpecification)
      : await addRecord('specifications', payload, api.createSpecification);
    setSubmitting(false);
    if (success) closeModal();
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...groupForm, sortOrder: Number(groupForm.sortOrder) || 0 };
    const success = editingRecord
      ? await updateRecord('specificationGroups', editingRecord.id, payload, api.updateSpecificationGroup)
      : await addRecord('specificationGroups', payload, api.createSpecificationGroup);
    setSubmitting(false);
    if (success) closeModal();
  };

  const handleValueSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...valueForm, sortOrder: Number(valueForm.sortOrder) || 0 };
    const res = editingRecord ? await api.updateSpecificationValue(editingRecord.id, payload) : await api.createSpecificationValue(selectedSpec.id, payload);
    setSubmitting(false);
    if (!res.error) { fetchValues(selectedSpec.id); closeModal(); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    
    try {
        let success = false;
        let errorMsg = '';
        
        // Direct API calls for faster UX sequence
        if (deleteTarget.type === 'specs') {
            const res = await api.deleteSpecification(deleteTarget.id);
            success = res.success;
            errorMsg = res.error;
        } else if (deleteTarget.type === 'groups') {
            const res = await api.deleteSpecificationGroup(deleteTarget.id);
            success = res.success;
            errorMsg = res.error;
        } else if (deleteTarget.type === 'values') {
            const res = await api.deleteSpecificationValue(deleteTarget.id);
            success = res.success;
            errorMsg = res.error;
        }
        
        if (success) {
            // 1. Close Modal Immediately
            setDeleteTarget(null);
            
            // 2. Show Toast
            toast?.success(`Deleted successfully`);
            
            // 3. Refresh Table in Background
            if (deleteTarget.type === 'specs') refetch.specifications();
            else if (deleteTarget.type === 'groups') refetch.specificationGroups();
            else if (deleteTarget.type === 'values') fetchValues(selectedSpec.id);
        } else {
            toast?.error(errorMsg || `Failed to delete`);
        }
    } catch (err) {
        toast?.error('An unexpected error occurred');
    } finally {
        setDeleting(false);
    }
  };

  const closeModal = () => {
    setShowForm(false); setShowGroupForm(false); setShowValueForm(false); setShowGroupView(false);
    setEditingRecord(null);
    setForm({ name: '', code: '', type: 'select', sortOrder: 0, isRequired: false, isFilterable: true, isActive: true });
    setGroupForm({ name: '', sortOrder: 0, specificationIds: [] });
    setValueForm({ value: '', sortOrder: 0, status: 1 });
  };

  const handleSortOrderChange = (setFn, field) => (e) => {
    const val = e.target.value;
    const num = parseInt(val);
    setFn(prev => ({ ...prev, [field]: isNaN(num) ? val : num }));
  };

  return (
    <div className="admin-page-container !p-6 lg:p-8 space-y-8 animate-fade-in bg-[#fdfdff] min-h-screen">
      <PageHeader
        title={activeTab === 'values' ? `${selectedSpec?.name} Values` : (activeTab === 'groups' ? 'Specification Groups' : 'Specifications')}
        subtitle="Manage technical characteristics, categorized sets, and global options"
        action={{ 
            label: `New ${activeTab === 'specs' ? 'Spec' : (activeTab === 'groups' ? 'Group' : 'Value')}`, 
            icon: 'fas fa-plus', 
            onClick: () => {
                if (activeTab === 'specs') setShowForm(true);
                else if (activeTab === 'groups') setShowGroupForm(true);
                else setShowValueForm(true);
            },
            className: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
        }}
      />

      {/* Navigation Tabs - Modern Glass style */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex !p-1.5 bg-slate-200/50 backdrop-blur-md rounded-2xl border border-white shadow-soft-sm">
          {[
            { k: 'specs', l: 'Specifications', i: 'fa-list-check' }, 
            { k: 'groups', l: 'Groups', i: 'fa-layer-group' }, 
            { k: 'values', l: 'Values', i: 'fa-tags' }
          ].map(t => (
            <button 
              key={t.k} 
              onClick={() => (t.k !== 'values' || selectedSpec) && setActiveTab(t.k)} 
              className={`!px-6 !py-2.5 !rounded-xl text-sm font-bold flex items-center gap-3 transition-all duration-300 ${
                activeTab === t.k 
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-100 scale-105' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              } ${t.k === 'values' && !selectedSpec ? 'opacity-40 cursor-not-allowed' : ''}`}
              disabled={t.k === 'values' && !selectedSpec}
            >
              <i className={`fas ${t.i} ${activeTab === t.k ? 'text-indigo-500' : ''}`}></i>
              <span className="hidden sm:inline">{t.l}</span>
            </button>
          ))}
        </div>

        {activeTab === 'values' && (
          <button 
            onClick={() => setActiveTab('specs')} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-xl border shadow-sm"
          >
            <i className="fas fa-circle-left"></i> Specifications
          </button>
        )}
      </div>

      {activeTab === 'values' && selectedSpec && (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 p-5 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl backdrop-blur-sm shadow-inner-sm">
           <div className="metadata-item">
             <i className="fas fa-code text-indigo-400 mr-2"></i>
             <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider mr-1">Code:</span> 
             <span className="font-mono font-bold text-slate-800">{selectedSpec.code}</span>
           </div>
           <div className="w-px h-6 bg-indigo-200/50 hidden md:block"></div>
           <div className="metadata-item">
             <i className="fas fa-keyboard text-indigo-400 mr-2"></i>
             <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider mr-1">Type:</span> 
             <span className="font-bold text-slate-800">{selectedSpec.type}</span>
           </div>
           <div className="w-px h-6 bg-indigo-200/50 hidden md:block"></div>
           <div className="metadata-item">
             <i className="fas fa-database text-indigo-400 mr-2"></i>
             <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider mr-1">Data:</span> 
             <span className="font-bold text-slate-800">{specValues.length} registered values</span>
           </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-[24px] shadow-soft-lg border border-slate-100/80 overflow-hidden">
        <div className="!p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <div className="relative group max-w-sm w-full">
             <input 
               type="text" 
               placeholder={`Search for ${activeTab}...`} 
               className="w-full pl-11 !pr-5 !py-3 !bg-white !border !border-slate-200 !rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-300 transition-all shadow-sm" 
             />
           </div>
           <div className="flex gap-2">
              <button className="!p-3 !text-slate-400 rounded-xl transition-all"><i className="fas fa-arrows-rotate"></i></button>
              <button className="!p-3 !text-slate-400 rounded-xl transition-all"><i className="fas fa-ellipsis-v"></i></button>
           </div>
        </div>
        
        <div className="p-2 md:p-4">
          <div ref={tableRef} className="custom-tabulator-rounded"></div>
        </div>
      </div>

      {/* Spec Modal */}
      <AdminModal isOpen={showForm} onClose={closeModal} title={editingRecord ? "Edit Specification" : "Add New Specification"} maxWidth={550}>
        <form onSubmit={handleSubmit} className="!space-y-6">
          <FormField 
            label="Name" 
            name="name" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            required 
            placeholder="e.g. Gemstone Cut" 
          />
          <FormField 
            label="Technical Code" 
            name="code" 
            value={form.code} 
            onChange={e => setForm({...form, code: e.target.value})} 
            required 
            placeholder="e.g. gemstone_cut" 
            hint="Lowercase, underscores only. Used for database mapping." 
          />
          
          <div className="grid grid-cols-2 gap-6">
            <div className="form-group flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest !mb-2">Input Control</label>
                <select 
                  className="w-full !p-3 bg-slate-50 border rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-50 border-slate-200 focus:border-indigo-400 transition-all" 
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value})}
                >
                  <option value="text">Single-line Input</option>
                  <option value="textarea">Multi-line Text</option>
                  <option value="select">Dropdown Menu</option>
                  <option value="multiselect">Multi-Select List</option>
                  <option value="radio">Radio Buttons</option>
                  <option value="checkbox">Binary Switch</option>
                </select>
            </div>
            <FormField 
              label="Sort Priority" 
              type="number" 
              value={isNaN(form.sortOrder) ? '' : form.sortOrder} 
              onChange={handleSortOrderChange(setForm, 'sortOrder')} 
            />
          </div>

          <div className="bg-slate-50/50 !p-6 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] !mb-2">Configuration</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[ 
                { k: 'isRequired', l: 'Mandatory', d: 'Required for products' }, 
                { k: 'isFilterable', l: 'Searchable', d: 'Available in frontend filters' }, 
                { k: 'isActive', l: 'Published', d: 'Visible in admin list' } 
              ].map(f => (
                  <label key={f.k} className="flex items-start gap-4 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer transition-all group">
                      <input 
                        type="checkbox" 
                        checked={form[f.k]} 
                        onChange={e => setForm({...form, [f.k]: e.target.checked})} 
                        className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-0.5" 
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{f.l}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{f.d}</span>
                      </div>
                  </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={closeModal} className="px-6 py-3 font-bold text-slate-500 rounded-2xl transition-all">Cancel</button>
            <button type="submit" className="!px-10 !py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2" disabled={submitting}>
               {submitting ? <Loader size="xs" /> : <i className="fas fa-circle-check"></i>}
               {editingRecord ? 'Update Changes' : 'Create Specification'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Group Modal */}
      <AdminModal isOpen={showGroupForm} onClose={closeModal} title={editingRecord ? "Modify Group" : "Construct New Set"} maxWidth={550}>
         <form onSubmit={handleGroupSubmit} className="space-y-6">
            <FormField label="Collection Name" value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} required placeholder="e.g. Dimensions & Weight" />
            
            <div className="form-group">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Specifications Registry</label>
               <div className="border border-slate-200 rounded-[20px] p-3 bg-slate-50/30  overflow-y-auto space-y-2 custom-scrollbar">
                  {specifications.map(s => (
                    <label key={s.id} className="flex items-center gap-3 !p-3 bg-white border border-slate-100 rounded-xl cursor-pointer transition-all /20 group">
                        <input 
                          type="checkbox" 
                          checked={groupForm.specificationIds.includes(s.id.toString())} 
                          onChange={e => {
                            const ids = e.target.checked 
                              ? [...groupForm.specificationIds, s.id.toString()]
                              : groupForm.specificationIds.filter(id => id !== s.id.toString());
                            setGroupForm({...groupForm, specificationIds: ids});
                          }} 
                          className="w-4 h-4 ed text-indigo-600 focus:ring-indigo-200 border-slate-300"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{s.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{s.code}</span>
                        </div>
                    </label>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
                <FormField label="Sort Rank" type="number" value={isNaN(groupForm.sortOrder) ? '' : groupForm.sortOrder} onChange={handleSortOrderChange(setGroupForm, 'sortOrder')} />
                <div className="flex items-center pt-6">
                   <label className="flex items-center gap-3 !p-3 bg-indigo-50/30 rounded-xl border border-indigo-100/50 cursor-pointer">
                     <i className="fas fa-check-circle text-indigo-500"></i>
                     <span className="text-sm font-bold text-indigo-700">Group Active</span>
                   </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
              <button type="button" onClick={closeModal} className="px-6 py-3 font-bold text-slate-500 rounded-2xl transition-all">Cancel</button>
              <button type="submit" className="!px-10 !py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center gap-2" disabled={submitting}>
                 {submitting ? <Loader size="xs" /> : <i className="fas fa-layer-group"></i>}
                 {editingRecord ? 'Push Updates' : 'Confirm Group'}
              </button>
            </div>
         </form>
      </AdminModal>

      {/* Value Modal */}
      <AdminModal isOpen={showValueForm} onClose={closeModal} title={`Define Value for ${selectedSpec?.name}`} maxWidth={550}>
         <form onSubmit={handleValueSubmit} className="space-y-6">
            <FormField label="Label / Value" value={valueForm.value} onChange={e => setValueForm({...valueForm, value: e.target.value})} required placeholder="e.g. 18K Yellow Gold" />
            
            <div className="space-y-3 bg-slate-50 !p-6 rounded-2xl border border-slate-100">
               <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block !mb-2">Smart Templates</label>
               <div className="flex flex-wrap gap-2">
                  {commonValues.map(v => (
                    <button key={v.label} type="button" onClick={() => setValueForm({...valueForm, value: v.label})}
                      className="!px-4 !py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:scale-105 transition-all shadow-sm flex items-center gap-2"
                    >
                      <i className="fas fa-plus-circle text-indigo-300"></i> {v.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <FormField label="Display Order" type="number" value={isNaN(valueForm.sortOrder) ? '' : valueForm.sortOrder} onChange={handleSortOrderChange(setValueForm, 'sortOrder')} />
               <div className="flex flex-col pt-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Publication State</label>
                  <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="!w-5 !h-5 rounded-lg text-indigo-600" 
                      checked={valueForm.status === 1} 
                      onChange={e => setValueForm({...valueForm, status: e.target.checked ? 1 : 0})} 
                    />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Visible to Users</span>
                  </label>
               </div>
            </div>

            <div className="flex justify-end gap-3 !pt-6">
              <button type="button" onClick={closeModal} className="px-6 py-3 font-bold text-slate-500 rounded-2xl transition-all">Cancel</button>
              <button type="submit" className="!px-10 !py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center gap-2" disabled={submitting}>
                 <i className="fas fa-bolt"></i> Register Value
              </button>
            </div>
         </form>
      </AdminModal>

      {/* Group View Modal (Detail Spec List) */}
      <AdminModal isOpen={showGroupView} onClose={closeModal} title={`${selectedGroup?.name}`} maxWidth={650}>
         <div className="!p-2 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between !px-3 !py-2 bg-indigo-50 border border-indigo-100 rounded-xl mb-6">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Enrolled Specifications</span>
               <span className="bg-indigo-600 text-white text-[10px] font-bold !px-2.5 !py-1 !rounded-lg">{selectedGroup?.specs_count}</span>
            </div>
            {selectedGroup?.items?.map(item => (
                <div key={item.id} className="!p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-center !gap-2">
                                <h3 className="text-base font-black text-slate-800">{item.name}</h3>
                                <code className="text-[10px] font-bold text-indigo-400 !px-2 !py-0.5 bg-indigo-50 rounded-md">#{item.code}</code>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-slate-400">
                               <i className="fas fa-font text-[10px]"></i>
                               <span className="text-[11px] font-bold capitalize">Control: {item.type}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className={`!px-3 !py-1 rounded-xl text-[10px] font-black tracking-tighter uppercase ${item.isRequired ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-slate-50 text-slate-400 border'}`}>
                                {item.isRequired ? 'Required' : 'Optional'}
                            </span>
                            <span className={`!px-3 !py-1 rounded-xl text-[10px] font-black tracking-tighter uppercase ${item.isFilterable ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-slate-50 text-slate-400 border'}`}>
                                {item.isFilterable ? 'Filterable' : 'No Filter'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            {selectedGroup?.specs_count === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                <i className="fas fa-folder-open text-3xl text-slate-200 mb-4"></i>
                <p className="text-slate-400 text-sm font-bold italic">This collection is currently empty</p>
              </div>
            )}
         </div>
         <div className="flex justify-center pt-10 border-t border-slate-50 mt-6">
            <button onClick={closeModal} className="!px-10 !py-3 bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl">Close Registry</button>
         </div>
      </AdminModal>

      <ConfirmModal 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleDelete} 
        title={`Remove ${deleteTarget?.type}`} 
        message={`This will permanently remove "${deleteTarget?.name}" from your records.`} 
        loading={deleting} 
        danger 
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

        .id-badge { font-family: monospace; font-weight: 800; color: #94a3b8; font-size: 12px; letter-spacing: -0.05em; }
        .name-column { display: flex; align-items: center; gap: 14px; }
        .icon-box { 
            width: 38px; height: 38px; border-radius: 12px; background: #f5f3ff;
            display: flex; align-items: center; justify-content: center; color: #7c3aed;
            box-shadow: 0 4px 10px -2px rgba(124, 58, 237, 0.15);
        }
        .icon-box-blue { 
            width: 38px; height: 38px; border-radius: 12px; background: #eff6ff;
            display: flex; align-items: center; justify-content: center; color: #3b82f6;
            box-shadow: 0 4px 10px -2px rgba(59, 130, 246, 0.15);
        }
        .main-text { font-weight: 800; color: #1e293b; font-size: 14px; margin-bottom: 1px; }
        .sub-text { font-size: 10px; color: #94a3b8; font-family: monospace; letter-spacing: 0.05em; font-weight: 600; text-transform: uppercase; }
        .type-badge {
            padding: 6px 12px; border-radius: 12px; font-size: 10px; font-weight: 900;
            display: inline-flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.02em;
        }
        .badge-status-req { color: #ef4444; font-size: 10px; font-weight: 900; display: inline-flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.02em; }
        .badge-status-req i { font-size: 6px; }
        .badge-status-opt { color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .badge-status-filt { color: #10b981; font-size: 10px; font-weight: 900; display: inline-flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.02em; }
        .badge-active {
            padding: 6px 14px; border-radius: 12px; font-size: 10px; font-weight: 900;
            display: inline-flex; align-items: center; gap: 6px; text-transform: uppercase; border: 1.5px solid transparent;
        }
        .badge-active.active { background: #ecfdf5; color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
        .badge-active.inactive { background: #fef2f2; color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
        .badge-active i { font-size: 5px; }
        .btn-values-count {
            background: #fff; color: #3b82f6; border: 1.5px solid #eff6ff; padding: 6px 12px;
            border-radius: 12px; font-size: 11px; font-weight: 900; cursor: pointer;
            display: flex; align-items: center; gap: 8px; transition: all 0.3s;
            box-shadow: 0 2px 5px rgba(59, 130, 246, 0.05);
        }
        .btn-values-count:hover { background: #3b82f6; color: white; border-color: #3b82f6; transform: translateY(-2px); }
        .spec-count-badge {
            background: #fdfdff; color: #7c3aed; padding: 6px 14px;
            border-radius: 12px; font-size: 11px; font-weight: 900;
            display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid #f5f3ff;
            box-shadow: 0 2px 5px rgba(124, 58, 237, 0.05);
        }
        .table-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .table-actions button {
            width: 36px; height: 36px; border-radius: 12px; border: none; cursor: pointer;
            display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.2s;
            background: white; border: 1.5px solid transparent;
        }
        .btn-view { color: #3b82f6; background: #eff6ff !important; }
        .btn-view:hover { scale: 1.1; box-shadow: 0 5px 15px rgba(59, 130, 246, 0.2); }
        .btn-edit { color: #7c3aed; background: #f5f3ff !important; }
        .btn-edit:hover { scale: 1.1; box-shadow: 0 5px 15px rgba(124, 58, 237, 0.2); }
        .btn-delete { color: #ef4444; background: #fef2f2 !important; }
        .btn-delete:hover { scale: 1.1; box-shadow: 0 5px 15px rgba(239, 68, 68, 0.2); }
        .value-text { font-weight: 900; color: #1e293b; font-size: 15px; }
        .date-text { color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; }
        
        /* Tabulator Enhancements */
        .tabulator { border: none !important; background: transparent !important; }
        .tabulator-header { background: #f8fafc !important; border-bottom: 2px solid #f1f5f9 !important; border-top: none !important; }
        .tabulator-col { background: transparent !important; color: #64748b !important; font-size: 11px !important; font-weight: 900 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; padding: 15px 10px !important; }
        .tabulator-cell { padding: 18px 12px !important; border-bottom: 1px solid #f8fafc !important; vertical-align: middle !important; }
        .tabulator-row { border-bottom: none !important; transition: all 0.2s; }
        .tabulator-row:hover { background-color: #fcfdfe !important; }
        .tabulator-row-selected { background-color: #f1f5f9 !important; }
      `}</style>
    </div>
  );
};

export default SpecificationManagement;
