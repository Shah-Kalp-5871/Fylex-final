"use client";
import React, { useState, useRef } from 'react';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '../../css/datatable.css';
import '../../css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import AdminModal from '@/components/admin/AdminModal';

const tableWrapStyle = {
  width: '100%',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
};

const TagList = () => {
  const { data, addRecord, deleteRecord } = useAdminData();
  const tags = data.tags || [];
  const tableRef = useRef(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', featured: false });

  const handleSave = () => {
    if (!formData.name) return;
    addRecord('tags', { ...formData, product_count: 0, status: 'active' });
    setFormData({ name: '', slug: '', featured: false });
    setShowAddModal(false);
  };

  const columns = [
    {
      title: 'Tag', field: 'name', minWidth: 140, widthGrow: 1.5,
      formatter: (cell) => `<div style="display:flex;align-items:center;gap:8px">
        <div style="width:28px;height:28px;border-radius:7px;background:#eef0ff;color:#4f46e5;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px">#</div>
        <span style="font-weight:600;color:#0e1726;font-size:13px">${cell.getValue()}</span>
      </div>`
    },
    {
      title: 'Slug', field: 'slug', minWidth: 120, widthGrow: 1.3,
      formatter: (cell) => `<span style="font-style:italic;color:#8a96b0;font-size:12px">/${cell.getValue()}</span>`
    },
    {
      title: 'Products', field: 'product_count', width: 100, hozAlign: 'center',
      formatter: (cell) => `<span style="font-size:12px;font-weight:700;color:#059669;background:#ecfdf5;padding:3px 10px;border-radius:6px">${cell.getValue()}</span>`
    },
    {
      title: 'Featured', field: 'featured', width: 90, hozAlign: 'center',
      formatter: (cell) => cell.getValue()
        ? `<i class="fas fa-star" style="color:#f59e0b;font-size:15px"></i>`
        : `<i class="far fa-star" style="color:#e4e8f0;font-size:15px"></i>`
    },
    {
      title: 'Status', field: 'status', width: 100, hozAlign: 'center',
      formatter: (cell) => `<span class="status-pill ${cell.getValue() === 'active' ? 'pill-active' : 'pill-inactive'}">${cell.getValue()}</span>`
    },
    {
      title: 'Actions', headerSort: false, hozAlign: 'right', width: 90,
      formatter: () => `<div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn-icon btn-icon-delete"><i class="fas fa-trash-alt"></i></button></div>`,
      cellClick: (e, cell) => {
        if (e.target.closest('.btn-icon-delete')) {
          if (window.confirm('Delete tag?')) deleteRecord('tags', cell.getRow().getData().id);
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div><h2>Product Tags</h2><p>Organize and label your catalog</p></div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}><i className="fas fa-plus mr-2"></i>Create Tag</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="stat-card"><div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}><i className="fas fa-tags"></i></div><div><div className="stat-label">Active Tags</div><div className="stat-value">{tags.length}</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}><i className="fas fa-star"></i></div><div><div className="stat-label">Featured</div><div className="stat-value">{tags.filter(t => t.featured).length}</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}><i className="fas fa-box"></i></div><div><div className="stat-label">Total Products</div><div className="stat-value">{tags.reduce((a, t) => a + t.product_count, 0)}</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#f6f8fc', color: '#64748b' }}><i className="fas fa-eye-slash"></i></div><div><div className="stat-label">Inactive</div><div className="stat-value">{tags.filter(t => t.status !== 'active').length}</div></div></div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Tag Directory</h3>
          <div className="admin-search" style={{ width: 220 }}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search tags..." onChange={e => {
              tableRef.current?.table && tableRef.current.table.setFilter('name', 'like', e.target.value);
            }} />
          </div>
        </div>
        <div style={tableWrapStyle}>
          <ReactTabulator
            ref={tableRef}
            data={tags}
            columns={columns}
            layout="fitDataFill"
            pagination
            paginationSize={10}
            options={{ minWidth: 560 }}
          />
        </div>
      </div>

      {/* Create New Tag Modal */}
      <AdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Tag"
        maxWidth={400}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}><i className="fas fa-save mr-2"></i>Save Tag</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Tag Name</label><input type="text" className="form-control" placeholder="e.g. Summer Sale" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
          <div className="form-group"><label>Slug</label><input type="text" className="form-control" placeholder="e.g. summer-sale" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: 16, height: 16 }} checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#4b5a7a' }}>Mark as Featured</span>
          </label>
        </div>
      </AdminModal>
    </div>
  );
};

export default TagList;
