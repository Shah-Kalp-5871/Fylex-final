"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/styles.css';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import AdminModal from '@/components/admin/AdminModal';

const mockAddresses = [
  { type: 'Home', isDefault: true, address: '123 Fashion Street', city: 'Mumbai', state: 'Maharashtra', zip: '400001' },
  { type: 'Office', isDefault: false, address: '456 Business Hub', city: 'Mumbai', state: 'Maharashtra', zip: '400013' },
];

const mockOrderHistory = [
  { id: '#ORD-9921', date: 'Oct 24, 2023', items: 3, total: 4500, status: 'Delivered' },
  { id: '#ORD-9845', date: 'Oct 12, 2023', items: 1, total: 1250, status: 'Processing' },
];

const UserList = () => {
  const router = useRouter();
  const { data, updateRecord, deleteRecord } = useAdminData();
  const users = data.users || [];

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const selectedUser = users.find(u => u.id === selectedUserId);
  const tableRef = useRef(null);

  const getStatus = (u) => u.is_block ? { text: 'Blocked', cls: 'pill-inactive' } : u.status ? { text: 'Active', cls: 'pill-active' } : { text: 'Inactive', cls: 'pill-warning' };

  const columns = [
    {
      title: 'CUSTOMER INFO', field: 'name', width: 280,
      formatter: (cell) => {
        const d = cell.getRow().getData();
        const letter = (d.name || '?')[0].toUpperCase();
        return `
          <div style="display:flex;align-items:center;gap:14px;padding:4px 0">
            <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#a855f7);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:14px;flex-shrink:0;box-shadow:0 4px 12px rgba(99, 102, 241, 0.2)">${letter}</div>
            <div style="display:flex;flex-direction:column;gap:2px">
              <div style="font-weight:700;color:#1e293b;font-size:14px">${d.name}</div>
              <div style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.02em">Joined: ${d.created_at}</div>
            </div>
          </div>
        `;
      }
    },
    {
      title: 'EMAIL', field: 'email', width: 220,
      formatter: (cell) => `<span style="color:#64748b;font-weight:500;font-size:13px">${cell.getValue()}</span>`
    },
    { 
      title: 'PHONE', field: 'mobile', width: 140,
      formatter: (cell) => `<span style="color:#64748b;font-weight:500">${cell.getValue()}</span>`
    },
    {
      title: 'ORDERS', field: 'orders_count', width: 100, hozAlign: 'center',
      formatter: (cell) => `<div class="pill-stock" style="margin-top:4px"><span style="margin-right:2px">${cell.getValue()}</span> orders</div>`
    },
    {
      title: 'TOTAL SPENT', field: 'total_spent', width: 140,
      formatter: (cell) => `<span style="font-weight:800;color:#1e293b;font-size:14px">₹${Number(cell.getValue()).toLocaleString()}</span>`
    },
    {
      title: 'STATUS', field: 'status', width: 110, hozAlign: 'center',
      formatter: (cell) => {
        const u = cell.getRow().getData();
        const s = getStatus(u);
        const cls = u.is_block ? 'pill-inactive' : (u.status ? 'pill-info' : 'pill-warning');
        return `<span class="status-pill ${cls}" style="border-radius:8px;padding:4px 12px;text-transform:uppercase">${s.text}</span>`;
      }
    },
    {
      title: 'ACTIONS', headerSort: false, hozAlign: 'right', width: 110,
      formatter: (cell) => {
        const u = cell.getRow().getData();
        const blockIcon = u.is_block ? 'fa-unlock' : 'fa-ban';
        return `
          <div style="display:flex;gap:12px;justify-content:flex-end">
            <button class="btn-icon-edit" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="btn-icon-delete" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px" title="Block/Unblock"><i class="fas ${blockIcon}"></i></button>
          </div>
        `;
      },
      cellClick: (e, cell) => {
        const u = cell.getRow().getData();
        if (e.target.closest('.btn-icon-edit')) { setSelectedUserId(u.id); setShowDetailsModal(true); }
        if (e.target.closest('.btn-icon-delete')) {
          const newBlock = !u.is_block;
          if (window.confirm(newBlock ? 'Block this user?' : 'Unblock this user?')) {
            updateRecord('users', u.id, { is_block: newBlock, status: !newBlock });
          }
        }
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Customers</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4, fontWeight: 500 }}>Manage your customer database and orders</p>
        </div>
        <button className="btn-indigo-gradient">
          <i className="fas fa-plus mr-2" style={{ fontSize: 12 }}></i>Add Customer
        </button>
      </div>

      <div className="admin-card" style={{ padding: '20px 24px', borderRadius: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-search" style={{ flex: 2, minWidth: 300 }}>
            <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder="Search by name, email..." 
              style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '11px 16px 11px 42px' }} 
              onChange={e => {
                const val = e.target.value;
                tableRef.current?.table && tableRef.current.table.setFilter([
                  { field: 'name', type: 'like', value: val },
                  { field: 'email', type: 'like', value: val }
                ], 'or');
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <select style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#4b5a7a', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
              <option>All Statuses</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Blocked</option>
            </select>
          </div>
          <button className="btn-filter-dark">
            <i className="fas fa-filter mr-2"></i> Filter
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 900 }}>
            <ReactTabulator
              ref={tableRef}
              data={users}
              columns={columns}
              layout="fitDataFill"
              pagination
              paginationSize={10}
              options={{
                responsiveLayout: false,
                movableColumns: false,
              }}
            />
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      <AdminModal
        isOpen={showDetailsModal && !!selectedUser}
        onClose={() => setShowDetailsModal(false)}
        title="Customer Details"
        maxWidth={800}
      >
        <div style={{ padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f1f4f9' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', border: '1px solid #e4e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4f46e5', fontSize: 18, flexShrink: 0 }}>{selectedUser?.name[0]}</div>
            <div>
              <h3 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{selectedUser?.name}</h3>
              <p style={{ fontSize: 12, color: '#8a96b0', margin: 0 }}>{selectedUser?.email} · {selectedUser?.mobile}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <div>
              <div style={{ padding: 18, border: '1px solid #e4e8f0', borderRadius: 12, background: '#fafbff' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f1f4f9', color: '#0e1726' }}>Saved Addresses</h4>
                {mockAddresses.map((addr, idx) => (
                  <div key={idx} style={{ padding: 14, borderRadius: 10, background: '#fff', border: '1px solid #e4e8f0', marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0e1726' }}>{addr.type} Address</span>
                      {addr.isDefault && <span style={{ fontSize: 10, background: '#eef0ff', color: '#4f46e5', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Default</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#4b5a7a', lineHeight: 1.6 }}>
                      {addr.address}<br />{addr.city}, {addr.state} – {addr.zip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ padding: 18, border: '1px solid #e4e8f0', borderRadius: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f1f4f9', color: '#0e1726' }}>Order History ({selectedUser?.orders_count})</h4>
                {mockOrderHistory.map((order, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx < mockOrderHistory.length - 1 ? '1px dashed #f1f4f9' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0e1726' }}>{order.id}</div>
                      <div style={{ fontSize: 11, color: '#8a96b0' }}>{order.date} · {order.items} items</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0e1726' }}>₹{order.total.toLocaleString()}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: order.status === 'Delivered' ? '#059669' : '#4f46e5' }}>{order.status}</div>
                    </div>
                  </div>
                ))}
                <button className="btn-secondary" style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}>View All Orders</button>
              </div>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default UserList;
