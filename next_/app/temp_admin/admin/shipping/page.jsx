"use client";
import React, { useState, useRef } from 'react';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import AdminModal from '@/components/admin/AdminModal';

const ShippingList = () => {
  const { data, addRecord, deleteRecord } = useAdminData();
  const methods = data.shippingMethods || [];
  const tableRef = useRef(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', provider: 'BlueDart', rate: '', min_amount: '' });

  const handleSave = () => {
    if (!form.name) return;
    addRecord('shippingMethods', { ...form, status: 'active', rate: `₹${form.rate}`, min_amount: `₹${form.min_amount || 0}` });
    setForm({ name: '', provider: 'BlueDart', rate: '', min_amount: '' });
    setShowAddModal(false);
  };

  const columns = [
    {
      title: 'Method', field: 'name', minWidth: 200,
      formatter: (cell) => `<div style="display:flex;align-items:center;gap:10px">
        <div style="width:34px;height:34px;border-radius:9px;background:#eef0ff;color:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0">
          <i class="fas fa-truck"></i>
        </div>
        <span style="font-weight:600;color:#0e1726;font-size:13px">${cell.getValue()}</span>
      </div>`
    },
    { title: 'Provider', field: 'provider', minWidth: 130 },
    {
      title: 'Rate', field: 'rate', minWidth: 100, hozAlign: 'center',
      formatter: (cell) => `<span style="font-weight:700;color:#059669;font-size:13px">${cell.getValue()}</span>`
    },
    { title: 'Min. Cart', field: 'min_amount', minWidth: 110, hozAlign: 'center' },
    {
      title: 'Status', field: 'status', minWidth: 100, hozAlign: 'center',
      formatter: (cell) => `<span class="status-pill ${cell.getValue() === 'active' ? 'pill-active' : 'pill-inactive'}">${cell.getValue()}</span>`
    },
    {
      title: 'Actions', headerSort: false, hozAlign: 'right', minWidth: 90,
      formatter: () => `<div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="btn-icon btn-icon-delete" title="Delete"><i class="fas fa-trash-alt"></i></button>
      </div>`,
      cellClick: (e, cell) => {
        if (e.target.closest('.btn-icon-delete')) {
          if (window.confirm('Delete this method?')) deleteRecord('shippingMethods', cell.getRow().getData().id);
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2>Shipping Methods</h2>
          <p>Configure delivery zones, rates, and conditions</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}><i className="fas fa-plus mr-2"></i>Add Method</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>All Methods</h3>
          <span style={{ fontSize: 12, color: '#8a96b0', fontWeight: 600 }}>{methods.length} configured</span>
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: 660 }}>
            <ReactTabulator
              ref={tableRef}
              data={methods}
              columns={columns}
              layout="fitColumns"
              pagination
              paginationSize={10}
              options={{ responsiveLayout: false }}
            />
          </div>
        </div>
      </div>

      {/* Add Shipping Method Modal */}
      <AdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Shipping Method"
        maxWidth={600}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}><i className="fas fa-save mr-2"></i>Save Method</button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group sm:col-span-2"><label>Method Name</label><input type="text" className="form-control" placeholder="e.g. Next Day Delivery" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group">
            <label>Shipping Provider</label>
            <select className="form-control" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })}>
              <option>BlueDart</option><option>Delhivery</option><option>FedEx</option><option>Custom / In-house</option>
            </select>
          </div>
          <div className="form-group">
            <label>Shipping Zone</label>
            <select className="form-control"><option>Domestic (India)</option><option>International</option><option>Specific States Only</option></select>
          </div>
          <div className="form-group sm:col-span-2">
            <label>Calculate Rate By</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px', marginTop: 4 }}>
              {['Flat Rate', 'Total Weight', 'Cart Value'].map((opt, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="radio" name="rate_type" defaultChecked={i === 0} /> {opt}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group"><label>Shipping Fee (₹)</label><input type="number" className="form-control" placeholder="e.g. 150" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} /></div>
          <div className="form-group"><label>Min. Cart Value (Optional)</label><input type="number" className="form-control" placeholder="e.g. 999" value={form.min_amount} onChange={e => setForm({ ...form, min_amount: e.target.value })} /></div>
        </div>
      </AdminModal>
    </div>
  );
};

export default ShippingList;
