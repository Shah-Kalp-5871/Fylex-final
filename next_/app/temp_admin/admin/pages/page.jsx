"use client";
import React, { useRef, useState } from 'react';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import AdminModal from '@/components/admin/AdminModal';

const PAGES = [
  { id: 1, title: 'About Us', slug: 'about-us', status: 'published', last_updated: '2024-03-01' },
  { id: 2, title: 'Privacy Policy', slug: 'privacy-policy', status: 'published', last_updated: '2024-03-05' },
  { id: 3, title: 'Terms & Conditions', slug: 'terms-and-conditions', status: 'draft', last_updated: '2024-03-10' },
  { id: 4, title: 'Refund Policy', slug: 'refund-policy', status: 'published', last_updated: '2024-03-12' },
];

const PageList = () => {
  const tableRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', slug: '', status: 'draft' });

  const handleAdd = () => {
    setFormData({ title: '', slug: '', status: 'draft' });
    setShowModal(true);
  };

  const handleEdit = (page) => {
    setFormData(page);
    setShowModal(true);
  };

  const columns = [
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
      title: 'Status', field: 'status', width: 110, hozAlign: 'center',
      formatter: (cell) => `<span class="status-pill ${cell.getValue() === 'published' ? 'pill-active' : 'pill-warning'}">${cell.getValue()}</span>`
    },
    {
      title: 'Last Updated', field: 'last_updated', width: 130, hozAlign: 'center',
      formatter: (cell) => `<span style="font-size:12px;color:#8a96b0">${cell.getValue()}</span>`
    },
    {
      title: 'Actions', headerSort: false, hozAlign: 'right', width: 100,
      formatter: () => `<div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="btn-icon btn-icon-edit"><i class="fas fa-edit"></i></button>
        <button class="btn-icon btn-icon-delete"><i class="fas fa-trash-alt"></i></button>
      </div>`,
      cellClick: (e, cell) => {
        if (e.target.closest('.btn-icon-edit')) {
          handleEdit(cell.getRow().getData());
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2>CMS Pages</h2>
          <p>Manage static pages and content</p>
        </div>
        <button className="btn-primary" onClick={handleAdd}><i className="fas fa-plus mr-2"></i>Create Page</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>All Pages</h3>
          <div className="admin-search" style={{ width: 240 }}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search pages..." onChange={e => {
              tableRef.current?.table && tableRef.current.table.setFilter('title', 'like', e.target.value);
            }} />
          </div>
        </div>
        <ReactTabulator
          ref={tableRef}
          data={PAGES}
          columns={columns}
          layout="fitColumns"
          pagination
          paginationSize={10}
          options={{ responsiveLayout: 'collapse' }}
        />
      </div>

      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={formData.id ? "Edit CMS Page" : "Create New CMS Page"}
        maxWidth={800}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => setShowModal(false)}>Save Content</button>
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
            <div style={{ height: 300, border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, background: '#f8fafc', color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              Rich Text Editor Placeholder<br/>(CKEditor / TinyMCE would be initialized here)
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default PageList;
