"use client";
import React, { useRef, useState } from 'react';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import AdminModal from '@/components/admin/AdminModal';

const TESTIMONIALS = [
  { id: 1, name: 'David Beckham', designation: 'Celebrity Ambassador', rating: 5, content: 'A truly remarkable timepiece that combines heritage with modern innovation.', is_active: true },
  { id: 2, name: 'Sarah Jessica', designation: 'Fashion Designer', rating: 5, content: 'The attention to detail in these watches is unparalleled in the industry.', is_active: true },
  { id: 3, name: 'Alex Thompson', designation: 'Professional Diver', rating: 4, content: 'Robust and reliable under extreme pressure. Highly recommended.', is_active: false },
];

const TestimonialList = () => {
  const tableRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', designation: '', rating: 5, content: '', is_active: true });

  const handleAdd = () => {
    setFormData({ name: '', designation: '', rating: 5, content: '', is_active: true });
    setShowModal(true);
  };

  const handleEdit = (testimonial) => {
    setFormData(testimonial);
    setShowModal(true);
  };

  const starHtml = (rating) => {
    let html = '<div style="display:flex;gap:2px">';
    for (let i = 0; i < 5; i++) {
      html += `<i class="${i < rating ? 'fas' : 'far'} fa-star" style="font-size:11px;color:${i < rating ? '#f59e0b' : '#e4e8f0'}"></i>`;
    }
    return html + '</div>';
  };

  const columns = [
    {
      title: 'Client', field: 'name', widthGrow: 1.4,
      formatter: (cell) => {
        const d = cell.getRow().getData();
        return `<div style="display:flex;align-items:center;gap:10px">
          <div style="width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#eef2ff,#f5f3ff);border:1px solid #e4e8f0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#4f46e5;font-size:13px;flex-shrink:0">${d.name[0]}</div>
          <span style="font-weight:600;color:#0e1726;font-size:13px">${d.name}</span>
        </div>`;
      }
    },
    {
      title: 'Title', field: 'designation', widthGrow: 1.2,
      formatter: (cell) => `<span style="font-style:italic;color:#8a96b0;font-size:12px">${cell.getValue()}</span>`
    },
    {
      title: 'Rating', field: 'rating', width: 140, hozAlign: 'center',
      formatter: (cell) => starHtml(cell.getValue())
    },
    {
      title: 'Content', field: 'content', widthGrow: 2.5,
      formatter: (cell) => `<span style="font-style:italic;color:#4b5a7a;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;max-width:320px" title="${cell.getValue()}">"${cell.getValue()}"</span>`
    },
    {
      title: 'Status', field: 'is_active', width: 100, hozAlign: 'center',
      formatter: (cell) => `<span class="status-pill ${cell.getValue() ? 'pill-active' : 'pill-inactive'}">${cell.getValue() ? 'Active' : 'Inactive'}</span>`
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
          <h2>Testimonials</h2>
          <p>Client endorsements and collection voices</p>
        </div>
        <button className="btn-primary" onClick={handleAdd}><i className="fas fa-plus mr-2"></i>Add Testimonial</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>All Testimonials</h3>
          <div className="admin-search" style={{ width: 240 }}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search testimonials..." onChange={e => {
              tableRef.current?.table && tableRef.current.table.setFilter('name', 'like', e.target.value);
            }} />
          </div>
        </div>
        <ReactTabulator
          ref={tableRef}
          data={TESTIMONIALS}
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
        title={formData.id ? "Edit Testimonial" : "Add New Testimonial"}
        maxWidth={600}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => setShowModal(false)}>Save Testimonial</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="form-group">
            <label>Client Name</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
          </div>
          <div className="form-group">
            <label>Designation / Title</label>
            <input type="text" className="form-control" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Luxury Watch Enthusiast" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Rating</label>
              <select className="form-control" value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})}>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={formData.is_active.toString()} onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Testimonial Content</label>
            <textarea className="form-control" rows="4" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="What the client said about Fylexx..."></textarea>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default TestimonialList;
