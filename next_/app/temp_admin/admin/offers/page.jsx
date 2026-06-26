"use client";
import React, { useState, useRef } from 'react';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import AdminModal from '@/components/admin/AdminModal';

const OfferList = () => {
  const { data, addRecord, deleteRecord } = useAdminData();
  const offers = data.offers || [];
  const tableRef = useRef(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [offerType, setOfferType] = useState('coupon');
  const [offerForm, setOfferForm] = useState({ name: '', code: '', target: 'Cart', type: 'percentage', value: '', starts_at: '', ends_at: '' });

  const handleSaveOffer = () => {
    if (!offerForm.name) return;
    addRecord('offers', {
      ...offerForm,
      status: 'active',
      uses: 0,
      type: offerForm.type.includes('%') ? 'percentage' : 'fixed',
      value: offerForm.type.includes('%') ? offerForm.value + '%' : '₹' + offerForm.value
    });
    setOfferForm({ name: '', code: '', target: 'Cart', type: 'percentage', value: '', starts_at: '', ends_at: '' });
    setShowAddModal(false);
  };

  const columns = [
    {
      title: 'Offer', field: 'name', minWidth: 160,
      formatter: (cell) => `<span style="font-weight:600;color:#0e1726;font-size:13px">${cell.getValue()}</span>`
    },
    {
      title: 'Code / Rule', field: 'code', minWidth: 140,
      formatter: (cell) => {
        const val = cell.getValue() || cell.getRow().getData().type;
        return `<span style="font-family:'SF Mono','Fira Code',monospace;font-size:12px;font-weight:600;color:#4f46e5;background:#eef0ff;padding:4px 10px;border-radius:6px">${val}</span>`;
      }
    },
    { title: 'Target', field: 'target', minWidth: 110 },
    {
      title: 'Value', field: 'value', minWidth: 90, hozAlign: 'center',
      formatter: (cell) => `<span style="font-weight:700;color:#059669">${cell.getValue()}</span>`
    },
    {
      title: 'Validity', field: 'starts_at', minWidth: 160, hozAlign: 'center',
      formatter: (cell) => {
        const d = cell.getRow().getData();
        return `<div style="font-size:12px;color:#4b5a7a">${d.starts_at}<br><span style="color:#8a96b0">to ${d.ends_at}</span></div>`;
      }
    },
    {
      title: 'Uses', field: 'uses', minWidth: 70, hozAlign: 'center',
      formatter: (cell) => `<span style="font-weight:700">${cell.getValue()}</span>`
    },
    {
      title: 'Status', field: 'status', minWidth: 100, hozAlign: 'center',
      formatter: (cell) => `<span class="status-pill ${cell.getValue() === 'active' ? 'pill-active' : 'pill-inactive'}">${cell.getValue()}</span>`
    },
    {
      title: 'Actions', headerSort: false, hozAlign: 'right', minWidth: 80,
      formatter: () => `<div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="btn-icon btn-icon-delete"><i class="fas fa-trash-alt"></i></button>
      </div>`,
      cellClick: (e, cell) => {
        if (e.target.closest('.btn-icon-delete')) {
          if (window.confirm('Delete offer?')) deleteRecord('offers', cell.getRow().getData().id);
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2>Offers & Promotions</h2>
          <p>Manage discount codes and seasonal pricing rules</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}><i className="fas fa-plus mr-2"></i>Create Offer</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card"><div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}><i className="fas fa-tags"></i></div><div><div className="stat-label">Total Offers</div><div className="stat-value">{offers.length}</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}><i className="fas fa-check-circle"></i></div><div><div className="stat-label">Active</div><div className="stat-value">{offers.filter(o => o.status === 'active').length}</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}><i className="fas fa-clock"></i></div><div><div className="stat-label">Expired</div><div className="stat-value">{offers.filter(o => o.status === 'expired').length}</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><i className="fas fa-chart-line"></i></div><div><div className="stat-label">Total Uses</div><div className="stat-value">{offers.reduce((a, c) => a + c.uses, 0)}</div></div></div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Coupon Directory</h3>
          <div className="admin-search" style={{ width: 240 }}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search codes..." onChange={e => {
              tableRef.current?.table && tableRef.current.table.setFilter('name', 'like', e.target.value);
            }} />
          </div>
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: 820 }}>
            <ReactTabulator
              ref={tableRef}
              data={offers}
              columns={columns}
              layout="fitColumns"
              pagination
              paginationSize={10}
              options={{ responsiveLayout: false }}
            />
          </div>
        </div>
      </div>

      {/* Create Offer Modal */}
      <AdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Offer"
        maxWidth={600}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveOffer}><i className="fas fa-save mr-2"></i>Save Offer</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group col-span-2">
            <label>Offer Mode</label>
            <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="offer_mode" checked={offerType === 'coupon'} onChange={() => setOfferType('coupon')} /> Coupon Code
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="offer_mode" checked={offerType === 'variant_rule'} onChange={() => setOfferType('variant_rule')} /> Variant Pricing Rule
              </label>
            </div>
          </div>
          <div className="form-group col-span-2"><label>Offer Name</label><input type="text" className="form-control" placeholder="e.g. Summer Sale 2024" value={offerForm.name} onChange={e => setOfferForm({ ...offerForm, name: e.target.value })} /></div>
          {offerType === 'coupon' ? (
            <div className="form-group col-span-2">
              <label>Coupon Code</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" className="form-control" placeholder="e.g. SUMMER20" style={{ textTransform: 'uppercase' }} value={offerForm.code} onChange={e => setOfferForm({ ...offerForm, code: e.target.value })} />
                <button className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>Generate</button>
              </div>
            </div>
          ) : (
            <div className="form-group col-span-2">
              <label>Apply Rule To</label>
              <select className="form-control" value={offerForm.target} onChange={e => setOfferForm({ ...offerForm, target: e.target.value })}>
                <option>Specific Product Variants</option><option>Specific Categories</option>
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Discount Type</label>
            <select className="form-control" value={offerForm.type} onChange={e => setOfferForm({ ...offerForm, type: e.target.value })}>
              <option>Percentage (%)</option><option>Fixed Amount (₹)</option>
            </select>
          </div>
          <div className="form-group"><label>Discount Value</label><input type="number" className="form-control" placeholder="e.g. 20" value={offerForm.value} onChange={e => setOfferForm({ ...offerForm, value: e.target.value })} /></div>
          <div className="form-group"><label>Starts At</label><input type="date" className="form-control" value={offerForm.starts_at} onChange={e => setOfferForm({ ...offerForm, starts_at: e.target.value })} /></div>
          <div className="form-group"><label>Ends At</label><input type="date" className="form-control" value={offerForm.ends_at} onChange={e => setOfferForm({ ...offerForm, ends_at: e.target.value })} /></div>
        </div>
      </AdminModal>
    </div>
  );
};

export default OfferList;
