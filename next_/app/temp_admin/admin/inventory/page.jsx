"use client";
import React, { useEffect, useRef, useState } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import AdminModal from '@/components/admin/AdminModal';

const tableWrapStyle = {
  width: '100%',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
};

const InventoryList = () => {
  const { data, updateRecord } = useAdminData();
  const inventory = data.inventory || [];

  const tableRef = useRef(null);
  const [table, setTable] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const selectedItem = inventory.find(i => i.id === selectedItemId);

  const [adjustForm, setAdjustForm] = useState({ type: 'Add', qty: '', note: '' });

  const mockHistory = [
    { date: '2023-10-01 10:00', user: 'Admin User', action: 'Set', qty: 20, note: 'Initial Stock' },
    { date: '2023-10-15 14:30', user: 'System', action: 'Subtract', qty: 5, note: 'Order #1024' },
  ];

  const modalActionsRef = useRef({ setSelectedItemId, setShowAdjustModal });
  useEffect(() => { modalActionsRef.current = { setSelectedItemId, setShowAdjustModal }; }, []);

  useEffect(() => {
    if (tableRef.current) {
      const tabulator = new Tabulator(tableRef.current, {
        data: inventory,
        layout: "fitDataFill",
        responsiveLayout: false,
        pagination: "local",
        paginationSize: 10,
        columns: [
          { 
            title: "PRODUCT", field: "product_name", width: 320,
            formatter: (cell) => {
              const d = cell.getRow().getData();
              const letter = d.product_name.charAt(0);
              return `
                <div style="display:flex;align-items:center;gap:14px;padding:4px 0">
                  <div style="width:40px;height:40px;background:#f1f5f9;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#64748b;font-size:14px;flex-shrink:0;border:1px solid #e2e8f0">${letter}</div>
                  <div style="display:flex;flex-direction:column;gap:2px">
                    <div style="font-weight:700;color:#1e293b;font-size:14px">${d.product_name}</div>
                    <div style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.02em">SKU: ${d.sku}</div>
                  </div>
                </div>
              `;
            }
          },
          { 
            title: "STOCK", field: "stock", width: 100, hozAlign: "center",
            formatter: (cell) => `<span style="font-weight:700;color:#1e293b">${cell.getValue()}</span>`
          },
          { 
            title: "RESERVED", field: "reserved", width: 110, hozAlign: "center",
            formatter: (cell) => `<span style="font-weight:600;color:#94a3b8">${cell.getValue()}</span>`
          },
          {
            title: "AVAILABLE", field: "available", width: 140, hozAlign: "center",
            formatter: (cell) => {
              const v = cell.getValue();
              const bg = v > 0 ? '#f0fdf4' : '#fef2f2';
              const color = v > 0 ? '#15803d' : '#dc2626';
              return `<span class="status-pill" style="background:${bg};color:${color};border-radius:8px;padding:4px 12px;font-weight:700">${v} IN STOCK</span>`;
            }
          },
          { 
            title: "MIN STOCK", field: "min_stock", width: 110, hozAlign: "center",
            formatter: (cell) => `<span style="font-weight:600;color:#64748b;padding:2px 8px;background:#f8fafc;border-radius:4px">${cell.getValue()}</span>`
          },
          { 
            title: "WAREHOUSE", field: "warehouse", width: 140,
            formatter: (cell) => `<span style="text-transform:uppercase;font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.03em">${cell.getValue()}</span>`
          },
          {
            title: "ACTIONS", headerSort: false, hozAlign: "right", width: 140,
            formatter: () => `
              <div style="display:flex;gap:12px;justify-content:flex-end">
                <button class="btn-filter-dark" style="padding:6px 12px;font-size:11px;height:auto;border-radius:6px">ADJUST</button>
              </div>
            `,
            cellClick: (e, cell) => {
              modalActionsRef.current.setSelectedItemId(cell.getRow().getData().id);
              modalActionsRef.current.setShowAdjustModal(true);
            }
          }
        ],
      });
      setTable(tabulator);
    }
  }, []);

  useEffect(() => {
    if (table) table.replaceData(inventory);
  }, [inventory, table]);

  const handleApplyAdjustment = () => {
    if (!selectedItem || !adjustForm.qty) return;
    const amount = parseInt(adjustForm.qty);
    let newStock = selectedItem.stock;
    if (adjustForm.type === 'Add') newStock += amount;
    else if (adjustForm.type === 'Subtract') newStock = Math.max(0, newStock - amount);
    else if (adjustForm.type === 'Set') newStock = amount;

    updateRecord('inventory', selectedItem.id, {
      stock: newStock,
      available: newStock - selectedItem.reserved
    });

    setAdjustForm({ type: 'Add', qty: '', note: '' });
    setShowAdjustModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Inventory</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4, fontWeight: 500 }}>Monitor stock levels and manage warehouse movements</p>
        </div>
        <button className="btn-indigo-gradient">
          <i className="fas fa-plus mr-2" style={{ fontSize: 12 }}></i>Add Stock
        </button>
      </div>

      <div className="admin-card" style={{ padding: '20px 24px', borderRadius: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-search" style={{ flex: 2, minWidth: 300 }}>
            <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder="Search by product, SKU, warehouse..." 
              style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '11px 16px 11px 42px' }} 
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <select style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#4b5a7a', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
              <option>All Warehouses</option>
              <option>Main Warehouse</option>
              <option>Secondary</option>
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

      {/* Adjust Stock Modal */}
      <AdminModal
        isOpen={showAdjustModal && !!selectedItem}
        onClose={() => setShowAdjustModal(false)}
        title="Adjust Stock"
        maxWidth={700}
      >
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{selectedItem?.product_name} ({selectedItem?.sku})</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#0e1726' }}>Manual Adjustment</h4>
            <div className="form-group mb-4">
              <label>Adjustment Type</label>
              <select className="form-control" value={adjustForm.type} onChange={e => setAdjustForm({ ...adjustForm, type: e.target.value })}>
                <option value="Add">Add (+)</option>
                <option value="Subtract">Subtract (-)</option>
                <option value="Set">Set (=)</option>
              </select>
            </div>
            <div className="form-group mb-4">
              <label>Quantity</label>
              <input type="number" className="form-control" placeholder="e.g. 10" value={adjustForm.qty} onChange={e => setAdjustForm({ ...adjustForm, qty: e.target.value })} />
            </div>
            <div className="form-group mb-4">
              <label>Note / Reason</label>
              <input type="text" className="form-control" placeholder="e.g. Restocked from supplier" value={adjustForm.note} onChange={e => setAdjustForm({ ...adjustForm, note: e.target.value })} />
            </div>
            <button className="btn-primary w-full" onClick={handleApplyAdjustment}>Apply Adjustment</button>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#0e1726' }}>Stock History Log</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', minHeight: 200 }}>
              {mockHistory.map((log, idx) => (
                <div key={idx} style={{ padding: '8px 12px', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: log.action === 'Add' || log.action === 'Set' ? '#059669' : '#dc2626' }}>
                      {log.action} {log.qty}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{log.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{log.note}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>by {log.user}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default InventoryList;
