"use client";
import React, { useEffect, useRef, useState } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '../../css/datatable.css';
import '../../css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import { useToast } from '@/context/ToastContext';
import AdminModal from '@/components/admin/AdminModal';

const tableWrapStyle = {
  width: '100%',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
};

const AdminProductVariants = () => {
  const { data, addRecord, updateRecord, deleteRecord } = useAdminData();
  const variantsUrlData = data.variants || [];
  const toast = useToast();

  const tableRef = useRef(null);
  const [table, setTable] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  const [bulkConfig, setBulkConfig] = useState({
    priceAction: 'Set to', priceValue: '',
    stockAction: 'Set to', stockValue: ''
  });

  const actionsRef = useRef({ updateRecord, deleteRecord });
  useEffect(() => { actionsRef.current = { updateRecord, deleteRecord }; }, [updateRecord, deleteRecord]);

  useEffect(() => {
    if (tableRef.current) {
      const tabulator = new Tabulator(tableRef.current, {
        data: variantsUrlData,
        layout: "fitDataFill",
        pagination: "local",
        paginationSize: 15,
        selectable: true,
        columns: [
          { formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 40 },
          { title: "SKU", field: "sku", width: 150, hozAlign: "left", headerFilter: "input" },
          { title: "Product", field: "productName", minWidth: 160, widthGrow: 2, headerFilter: "input" },
          { title: "Color", field: "color", width: 100, headerFilter: "input" },
          { title: "Strap", field: "strap", width: 100, headerFilter: "input" },
          { title: "Size", field: "size", width: 90 },
          {
            title: "Price", field: "price", width: 110,
            formatter: (cell) => `<span style="font-weight:600">₹${Number(cell.getValue()).toLocaleString()}</span>`,
            editor: "number",
            cellEdited: (cell) => {
              actionsRef.current.updateRecord('variants', cell.getRow().getData().id, { price: cell.getValue() });
            }
          },
          {
            title: "Stock", field: "stock", width: 90, hozAlign: "center",
            formatter: (cell) => {
              const v = cell.getValue();
              const bg = v > 0 ? '#ecfdf5' : '#fef2f2';
              const color = v > 0 ? '#059669' : '#dc2626';
              return `<span style="background:${bg};color:${color};padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700">${v}</span>`;
            },
            editor: "number",
            cellEdited: (cell) => {
              actionsRef.current.updateRecord('variants', cell.getRow().getData().id, { stock: cell.getValue() });
            }
          },
          {
            title: "Actions", headerSort: false, hozAlign: "right", width: 100,
            formatter: () => `<div style="display:flex;gap:6px;justify-content:flex-end">
              <button class="btn-icon btn-icon-edit"><i class="fas fa-edit"></i></button>
              <button class="btn-icon btn-icon-delete"><i class="fas fa-trash"></i></button>
            </div>`,
            cellClick: (e, cell) => {
              if (e.target.closest('.btn-icon-delete')) {
                if (window.confirm("Delete this variant?")) {
                  actionsRef.current.deleteRecord('variants', cell.getRow().getData().id);
                }
              }
            }
          }
        ],
      });
      setTable(tabulator);
      setTimeout(() => tabulator.redraw(true), 100);
    }
  }, []);

  useEffect(() => {
    if (table) table.replaceData(variantsUrlData);
  }, [variantsUrlData, table]);

  const handleGenerate = () => {
    const newVariant = {
      product_id: 1, sku: `GEN-${Math.floor(Math.random() * 1000)}`, name: 'Auto Generated Variant',
      color: 'Custom', size: '40mm', price: 999, stock: 10, status: 'active'
    };
    addRecord('variants', newVariant);
    setShowGenerateModal(false);
  };

  const handleApplyBulkEdit = () => {
    if (!table) return;
    const selected = table.getSelectedData();
    if (selected.length === 0) return toast.error("Please select at least one variant to edit.");

    selected.forEach(v => {
      let updates = {};
      if (bulkConfig.priceValue) {
        let pVal = parseFloat(bulkConfig.priceValue);
        let currentPrice = parseFloat(v.price) || 0;
        if (bulkConfig.priceAction === 'Set to') updates.price = pVal;
        else if (bulkConfig.priceAction === 'Increase by %') updates.price = currentPrice + (currentPrice * (pVal / 100));
        else if (bulkConfig.priceAction === 'Decrease by %') updates.price = currentPrice - (currentPrice * (pVal / 100));
      }
      if (bulkConfig.stockValue) {
        let sVal = parseInt(bulkConfig.stockValue);
        let currentStock = parseInt(v.stock) || 0;
        if (bulkConfig.stockAction === 'Set to') updates.stock = sVal;
        else if (bulkConfig.stockAction === 'Add') updates.stock = currentStock + sVal;
        else if (bulkConfig.stockAction === 'Subtract') updates.stock = Math.max(0, currentStock - sVal);
      }
      if (Object.keys(updates).length > 0) {
        updateRecord('variants', v.id, updates);
      }
    });

    table.deselectRow();
    setBulkConfig({ priceAction: 'Set to', priceValue: '', stockAction: 'Set to', stockValue: '' });
    setShowBulkEditModal(false);
  };

  const handleExportCSV = () => {
    if (table) table.download("csv", "variants_export.csv");
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2>Variant Management</h2>
          <p>Manage pricing, stock, and attributes for 600+ product variants.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <i className="fas fa-file-export mr-2"></i>Export CSV
          </button>
          <button className="btn-secondary" onClick={() => setShowBulkEditModal(true)}>
            <i className="fas fa-layer-group mr-2"></i>Bulk Edit
          </button>
          <button className="btn-primary" onClick={() => setShowGenerateModal(true)}>
            <i className="fas fa-magic mr-2"></i>Auto-Generate
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="admin-search" style={{ flex: '1 1 220px', minWidth: 0 }}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search variants by SKU, Product..." onChange={(e) => {
              if (table) table.setFilter("sku", "like", e.target.value);
            }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }}
              onChange={(e) => {
                if (table) {
                  if (e.target.value === 'instock') table.setFilter("stock", ">", 0);
                  else if (e.target.value === 'outofstock') table.setFilter("stock", "<=", 0);
                  else table.removeFilter("stock", ">", 0);
                }
              }}>
              <option value="">All Stock Status</option>
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div style={{ padding: 8 }}>
          <div style={tableWrapStyle}>
            <div ref={tableRef} style={{ borderRadius: 8, overflow: 'hidden', minWidth: 780 }}></div>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 10 }}>Tip: You can double-click on Price or Stock cells to edit them directly.</p>
        </div>
      </div>

      {/* Generate Combinations Modal */}
      <AdminModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Auto-Generate Variants"
        maxWidth={600}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowGenerateModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleGenerate}>Generate Combinations</button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Select attributes to automatically generate all possible SKUs and variant combinations for a product.</p>
        <div className="form-group mb-4">
          <label>Select Product</label>
          <select className="form-control">
            <option>Luxury Watch Alpha</option>
            <option>Classic Gold Edition</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="form-group">
            <label>Colors</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              <label style={{ fontSize: 13 }}><input type="checkbox" className="mr-2" /> Black</label>
              <label style={{ fontSize: 13 }}><input type="checkbox" className="mr-2" /> Silver</label>
              <label style={{ fontSize: 13 }}><input type="checkbox" className="mr-2" /> Gold</label>
            </div>
          </div>
          <div className="form-group">
            <label>Straps</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              <label style={{ fontSize: 13 }}><input type="checkbox" className="mr-2" /> Leather</label>
              <label style={{ fontSize: 13 }}><input type="checkbox" className="mr-2" /> Metal</label>
              <label style={{ fontSize: 13 }}><input type="checkbox" className="mr-2" /> Silicone</label>
            </div>
          </div>
          <div className="form-group">
            <label>Sizes</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              <label style={{ fontSize: 13 }}><input type="checkbox" className="mr-2" /> 40mm</label>
              <label style={{ fontSize: 13 }}><input type="checkbox" className="mr-2" /> 42mm</label>
              <label style={{ fontSize: 13 }}><input type="checkbox" className="mr-2" /> 44mm</label>
            </div>
          </div>
        </div>
      </AdminModal>

      {/* Bulk Edit Modal */}
      <AdminModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        title="Bulk Edit Selected Variants"
        maxWidth={500}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowBulkEditModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleApplyBulkEdit}>Apply Bulk Edit</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Update Price For Selected</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <select className="form-control" style={{ width: 140, flexShrink: 0 }} value={bulkConfig.priceAction} onChange={e => setBulkConfig({ ...bulkConfig, priceAction: e.target.value })}>
                <option>Set to</option>
                <option>Increase by %</option>
                <option>Decrease by %</option>
              </select>
              <input type="number" className="form-control" placeholder="Value" value={bulkConfig.priceValue} onChange={e => setBulkConfig({ ...bulkConfig, priceValue: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Update Stock For Selected</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <select className="form-control" style={{ width: 140, flexShrink: 0 }} value={bulkConfig.stockAction} onChange={e => setBulkConfig({ ...bulkConfig, stockAction: e.target.value })}>
                <option>Set to</option>
                <option>Add</option>
                <option>Subtract</option>
              </select>
              <input type="number" className="form-control" placeholder="Value" value={bulkConfig.stockValue} onChange={e => setBulkConfig({ ...bulkConfig, stockValue: e.target.value })} />
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default AdminProductVariants;
