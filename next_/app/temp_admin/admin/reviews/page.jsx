"use client";
import React, { useState, useRef } from 'react';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import AdminModal from '@/components/admin/AdminModal';

const ReviewList = () => {
  const { data, updateRecord, deleteRecord } = useAdminData();
  const reviews = data.reviews || [];
  const tableRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const selectedReview = reviews.find(r => r.id === selectedReviewId);

  const getStatusClass = (s) => ({ 'Approved': 'pill-active', 'Pending': 'pill-warning', 'Rejected': 'pill-inactive' }[s] || 'pill-warning');

  const starHtml = (rating) => {
    let html = '<div style="display:flex;gap:2px;align-items:center">';
    for (let i = 0; i < 5; i++) {
      html += `<i class="${i < rating ? 'fas' : 'far'} fa-star" style="font-size:11px;color:${i < rating ? '#f59e0b' : '#e4e8f0'}"></i>`;
    }
    html += `<span style="font-size:11px;font-weight:700;color:#8a96b0;margin-left:4px">${rating}/5</span></div>`;
    return html;
  };

  const columns = [
    {
      title: 'Product', field: 'product_name', widthGrow: 1.5, minWidth: 130,
      formatter: (cell) => `<span style="font-weight:600;color:#0e1726;font-size:13px">${cell.getValue()}</span>`
    },
    {
      title: 'Customer', field: 'user_name', widthGrow: 1.2, minWidth: 120,
      formatter: (cell) => {
        const name = cell.getValue() || '?';
        return `<div style="display:flex;align-items:center;gap:8px">
          <div style="width:28px;height:28px;border-radius:7px;background:#f1f4f9;border:1px solid #e4e8f0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#4b5a7a;font-size:11px">${name[0]}</div>
          <span style="font-weight:500;font-size:13px">${name}</span>
        </div>`;
      }
    },
    {
      title: 'Rating', field: 'rating', width: 160, hozAlign: 'center',
      formatter: (cell) => starHtml(cell.getValue())
    },
    {
      title: 'Comment', field: 'comment', widthGrow: 2, minWidth: 200,
      formatter: (cell) => `<span style="color:#4b5a7a;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;max-width:280px" title="${cell.getValue()}">${cell.getValue()}</span>`
    },
    {
      title: 'Status', field: 'status', width: 110, hozAlign: 'center',
      formatter: (cell) => `<span class="status-pill ${getStatusClass(cell.getValue())}">${cell.getValue()}</span>`
    },
    {
      title: 'Actions', headerSort: false, hozAlign: 'right', width: 110,
      formatter: () => `<div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="btn-icon btn-icon-edit" title="Moderate"><i class="fas fa-gavel"></i></button>
        <button class="btn-icon btn-icon-delete" title="Delete"><i class="fas fa-trash-alt"></i></button>
      </div>`,
      cellClick: (e, cell) => {
        const r = cell.getRow().getData();
        if (e.target.closest('.btn-icon-edit')) { setSelectedReviewId(r.id); setShowModal(true); }
        if (e.target.closest('.btn-icon-delete')) {
          if (window.confirm('Delete this review?')) deleteRecord('reviews', r.id);
        }
      }
    }
  ];

  const renderStars = (rating) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <i key={i} className={`${i < rating ? 'fas' : 'far'} fa-star`} style={{ fontSize: 13, color: i < rating ? '#f59e0b' : '#e4e8f0' }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2>Reviews & Ratings</h2>
          <p>Moderate customer feedback and ratings</p>
        </div>
        <select className="form-control" style={{ width: 'auto' }}>
          <option value="">All Status</option><option>Pending</option><option>Approved</option><option>Rejected</option>
        </select>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>All Reviews</h3>
          <div className="admin-search" style={{ width: 260 }}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search by product or customer..." onChange={e => {
              const val = e.target.value;
              tableRef.current?.table && tableRef.current.table.setFilter([
                { field: 'product_name', type: 'like', value: val },
                { field: 'user_name', type: 'like', value: val }
              ], 'or');
            }} />
          </div>
        </div>
        <ReactTabulator
          ref={tableRef}
          data={reviews}
          columns={columns}
          layout="fitColumns"
          pagination
          paginationSize={10}
          options={{ responsiveLayout: 'collapse' }}
        />
      </div>

      {/* Moderation Modal */}
      <AdminModal
        isOpen={showModal && !!selectedReview}
        onClose={() => setShowModal(false)}
        title="Moderate Review"
        maxWidth={480}
        footer={
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
            <i className="fas fa-check mr-2"></i>Done
          </button>
        }
      >
        <div style={{ padding: 18, background: '#fafbff', borderRadius: 12, border: '1px solid #e4e8f0', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0e1726' }}>{selectedReview?.product_name}</div>
              <div style={{ fontSize: 12, color: '#8a96b0', marginTop: 2 }}>by {selectedReview?.user_name} · {selectedReview?.created_at}</div>
            </div>
            {selectedReview && renderStars(selectedReview.rating)}
          </div>
          <p style={{ fontSize: 14, color: '#4b5a7a', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>"{selectedReview?.comment}"</p>
        </div>

        <div className="form-group">
          <label>Update Status</label>
          <select className="form-control" value={selectedReview?.status} onChange={e => updateRecord('reviews', selectedReview.id, { status: e.target.value })}>
            <option value="Pending">Pending Validation</option>
            <option value="Approved">Approve (Publish)</option>
            <option value="Rejected">Reject (Hide)</option>
          </select>
        </div>
      </AdminModal>
    </div>
  );
};

export default ReviewList;
