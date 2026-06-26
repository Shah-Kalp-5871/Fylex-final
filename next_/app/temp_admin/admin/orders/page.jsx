"use client";
import React, { useState, useRef, useEffect } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import AdminModal from '@/components/admin/AdminModal';

const mockOrderItems = [
  { name: 'Luxury Watch Alpha', sku: 'LWA-001', price: 1250, qty: 1 },
  { name: 'Classic Gold Edition', sku: 'CGE-99', price: 1500, qty: 2 },
];

const OrderList = () => {
  const { data, updateRecord, deleteRecord } = useAdminData();
  const orders = data.orders || [];

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const tableRef = useRef(null);
  const [table, setTable] = useState(null);

  const actionsRef = useRef({ deleteRecord });
  useEffect(() => { actionsRef.current = { deleteRecord }; }, [deleteRecord]);

  const statusClass = (s) => ({ pending: 'pill-warning', confirmed: 'pill-active', processing: 'pill-info', shipped: 'pill-info', delivered: 'pill-info', cancelled: 'pill-inactive' }[s?.toLowerCase()] || 'pill-inactive');
  const payClass = (s) => ({ paid: 'pill-active', pending: 'pill-warning', failed: 'pill-inactive' }[s?.toLowerCase()] || 'pill-inactive');

  useEffect(() => {
    if (tableRef.current) {
      const tabulator = new Tabulator(tableRef.current, {
        data: orders,
        layout: "fitDataFill",
        responsiveLayout: false,
        pagination: "local",
        paginationSize: 10,
        columns: [
          {
            title: "ORDER #", field: "order_number", width: 140,
            formatter: (cell) => `<span style="font-family:'SF Mono',monospace;font-size:11px;font-weight:700;color:#4f46e5;background:#f5f3ff;padding:4px 10px;border-radius:6px;border:1px solid rgba(99,102,241,0.1)">${cell.getValue()}</span>`
          },
          {
            title: "CUSTOMER", field: "customer_name", width: 280,
            formatter: (cell) => {
              const d = cell.getRow().getData();
              const letter = (d.customer_name || '?')[0].toUpperCase();
              return `
                <div style="display:flex;align-items:center;gap:12px;padding:4px 0">
                  <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:12px">${letter}</div>
                  <div style="display:flex;flex-direction:column;gap:1px">
                    <div style="font-weight:700;color:#1e293b;font-size:13px">${d.customer_name}</div>
                    <div style="font-size:11px;color:#94a3b8;font-weight:600">${d.customer_email}</div>
                  </div>
                </div>
              `;
            }
          },
          { 
            title: "DATE", field: "created_at", width: 120,
            formatter: (cell) => `<span style="color:#64748b;font-weight:500;font-size:12px">${cell.getValue()}</span>`
          },
          { 
            title: "TOTAL", field: "grand_total", width: 120,
            formatter: (cell) => `<span style="font-weight:800;color:#1e293b;font-size:14px">₹${Number(cell.getValue()).toLocaleString()}</span>`
          },
          {
            title: "ORDER STATUS", field: "status", width: 130, hozAlign: "center",
            formatter: (cell) => {
              const v = cell.getValue();
              return `<span class="status-pill pill-info" style="border-radius:8px;padding:4px 12px">${v?.toUpperCase()}</span>`;
            }
          },
          {
            title: "PAYMENT", field: "payment_status", width: 120, hozAlign: "center",
            formatter: (cell) => {
              const v = cell.getValue();
              return `<span class="status-pill ${payClass(v)}" style="border-radius:8px;padding:4px 12px">${v?.toUpperCase()}</span>`;
            }
          },
          {
            title: "ACTIONS", headerSort: false, hozAlign: "right", width: 120,
            formatter: () => `<div style="display:flex;gap:12px;justify-content:flex-end">
              <button class="btn-icon-edit" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px" title="View"><i class="fas fa-eye"></i></button>
              <button class="btn-icon-delete" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>`,
            cellClick: (e, cell) => {
              const d = cell.getRow().getData();
              if (e.target.closest('.btn-icon-edit')) { setSelectedOrderId(d.id); setShowDetailsModal(true); }
              if (e.target.closest('.btn-icon-delete')) {
                if (window.confirm('Delete this order?')) actionsRef.current.deleteRecord('orders', d.id);
              }
            }
          }
        ],
      });
      setTable(tabulator);
    }
  }, []);

  useEffect(() => {
    if (table) table.replaceData(orders);
  }, [orders, table]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Orders</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4, fontWeight: 500 }}>Track and process customer shipments</p>
        </div>
        <button className="btn-indigo-gradient">
          <i className="fas fa-file-export mr-2" style={{ fontSize: 12 }}></i>Export Orders
        </button>
      </div>

      <div className="admin-card" style={{ padding: '20px 24px', borderRadius: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-search" style={{ flex: 2, minWidth: 280 }}>
            <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder="Search by order #, customer..." 
              style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '11px 16px 11px 42px' }} 
            />
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <input type="date" style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#4b5a7a', fontSize: 13, fontWeight: 600, outline: 'none' }} />
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <select style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#4b5a7a', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
              <option>Status</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Shipped</option>
              <option>Delivered</option>
            </select>
          </div>
          <button className="btn-filter-dark">
            <i className="fas fa-filter mr-2"></i> Filter
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div style={{ overflowX: 'auto', padding: '0 8px 8px' }}>
          <div style={{ minWidth: 900 }}>
            <div ref={tableRef}></div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <AdminModal
        isOpen={showDetailsModal && !!selectedOrder}
        onClose={() => setShowDetailsModal(false)}
        title={`Order ${selectedOrder?.order_number}`}
        maxWidth={800}
      >
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: '#8a96b0', margin: 0 }}>Placed on {selectedOrder?.created_at}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* Items */}
          <div style={{ minWidth: 0 }}>
            <div style={{ padding: 18, border: '1px solid #e4e8f0', borderRadius: 12, background: '#fafbff' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, borderBottom: '1px solid #f1f4f9', paddingBottom: 10, color: '#0e1726' }}>Items Ordered</h4>
              {mockOrderItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: idx < mockOrderItems.length - 1 ? '1px dashed #f1f4f9' : 'none' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0e1726', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#8a96b0' }}>SKU: {item.sku}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>₹{item.price.toLocaleString()} × {item.qty}</div>
                    <div style={{ fontSize: 11, color: '#8a96b0' }}>= ₹{(item.price * item.qty).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0e1726' }}>Grand Total: <span style={{ color: '#4f46e5' }}>₹{selectedOrder?.grand_total?.toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <div style={{ padding: 18, border: '1px solid #e4e8f0', borderRadius: 12, background: '#f6f8fc' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#0e1726' }}>Customer Details</h4>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedOrder?.customer_name}</div>
              <div style={{ fontSize: 12, color: '#4f46e5', marginBottom: 10, fontWeight: 500 }}>{selectedOrder?.customer_email}</div>
              <div style={{ fontSize: 12, color: '#4b5a7a', lineHeight: 1.6 }}>123 Fashion Street,<br />Mumbai, Maharashtra 400001<br />India</div>
            </div>

            <div style={{ padding: 18, border: '1px solid #e4e8f0', borderRadius: 12 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#0e1726' }}>Status Management</h4>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Payment Status</label>
                <span className={`status-pill ${payClass(selectedOrder?.payment_status)}`} style={{ display: 'inline-block', marginTop: 4 }}>{selectedOrder?.payment_status?.toUpperCase()}</span>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Order Status</label>
                <select className="form-control" value={selectedOrder?.status} onChange={e => updateRecord('orders', selectedOrder.id, { status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowDetailsModal(false)}>Close Details</button>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default OrderList;
