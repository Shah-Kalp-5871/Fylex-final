"use client";
import React, { useEffect, useRef, useState } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import AdminModal from '@/components/admin/AdminModal';

const CategoryList = () => {
  const { data, addRecord, deleteRecord } = useAdminData();
  const categoriesUrlData = data.categories || [];

  const tableRef = useRef(null);
  const [table, setTable] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [itemType, setItemType] = useState('category');
  const [formData, setFormData] = useState({ name: '', slug: '' });

  const actionsRef = useRef({ deleteRecord });
  useEffect(() => { actionsRef.current = { deleteRecord }; }, [deleteRecord]);

  useEffect(() => {
    if (tableRef.current) {
      const tabulator = new Tabulator(tableRef.current, {
        data: categoriesUrlData,
        layout: "fitDataFill",
        responsiveLayout: false,
        pagination: "local",
        paginationSize: 10,
        columns: [
          { 
            title: "NAME", field: "name", width: 320,
            formatter: (cell) => {
              const d = cell.getRow().getData();
              const icon = d.type === 'collection' ? 'fa-layer-group' : 'fa-folder';
              const color = d.type === 'collection' ? '#a855f7' : '#6366f1';
              const bg = d.type === 'collection' ? '#f5f3ff' : '#eef2ff';
              return `
                <div style="display:flex;align-items:center;gap:14px;padding:4px 0">
                  <div style="width:40px;height:40px;background:${bg};border:1px solid rgba(0,0,0,0.05);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <i class="fas ${icon}" style="color:${color};font-size:14px"></i>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:2px">
                    <div style="font-weight:700;color:#1e293b;font-size:14px">${d.name}</div>
                    <div style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.02em">/${d.slug}</div>
                  </div>
                </div>
              `;
            }
          },
          { 
            title: "TYPE", field: "type", width: 140,
            formatter: (c) => `<span style="text-transform:uppercase;font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.03em">${c.getValue() || 'Category'}</span>`
          },
          { 
            title: "PRODUCTS", field: "products_count", width: 130, hozAlign: "center",
            formatter: (cell) => `<div class="pill-stock" style="margin-top:4px"><span style="margin-right:2px">${cell.getValue()}</span> items</div>`
          },
          { 
            title: "STATUS", field: "status", width: 120, hozAlign: "center",
            formatter: (cell) => {
              const v = cell.getValue();
              return `<span class="status-pill ${v ? 'pill-info' : 'pill-inactive'}" style="border-radius:8px;padding:4px 12px">${v ? 'ACTIVE' : 'INACTIVE'}</span>`;
            }
          },
          { 
            title: "ORDER", field: "sort_order", width: 90, hozAlign: "center",
            formatter: (cell) => `<span style="font-weight:600;color:#64748b">#${cell.getValue() || 0}</span>`
          },
          {
            title: "ACTIONS", headerSort: false, hozAlign: "right", width: 120,
            formatter: () => `<div style="display:flex;gap:12px;justify-content:flex-end">
              <button class="btn-icon-edit" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="btn-icon-delete" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>`,
            cellClick: (e, cell) => {
              if (e.target.closest('.btn-icon-delete')) {
                if (window.confirm("Delete this item?")) {
                  actionsRef.current.deleteRecord('categories', cell.getRow().getData().id);
                }
              }
            }
          }
        ],
      });
      setTable(tabulator);
    }
  }, []);

  useEffect(() => {
    if (table) table.replaceData(categoriesUrlData);
  }, [categoriesUrlData, table]);

  const handleSave = () => {
    if (!formData.name) return;
    addRecord('categories', {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
      type: itemType,
      products_count: 0,
      status: true,
      created_at_formatted: new Date().toISOString().split('T')[0]
    });
    setFormData({ name: '', slug: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Categories & Collections</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4, fontWeight: 500 }}>Organize your products, hierarchies, and seasonal drops</p>
        </div>
        <button className="btn-indigo-gradient" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus mr-2" style={{ fontSize: 12 }}></i>New Taxon
        </button>
      </div>

      <div className="admin-card" style={{ padding: '20px 24px', borderRadius: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-search" style={{ flex: 2, minWidth: 300 }}>
            <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder="Search by name, slug..." 
              style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '11px 16px 11px 42px' }} 
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <select style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#4b5a7a', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
              <option>All Types</option>
              <option>Category</option>
              <option>Collection</option>
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

      {/* Add Modal */}
      <AdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Category or Collection"
        maxWidth={500}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>Save {itemType === 'category' ? 'Category' : 'Collection'}</button>
          </>
        }
      >
        <div className="form-group mb-4">
          <label>Type</label>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="radio" name="taxon_type" checked={itemType === 'category'} onChange={() => setItemType('category')} /> Category
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="radio" name="taxon_type" checked={itemType === 'collection'} onChange={() => setItemType('collection')} /> Collection
            </label>
          </div>
        </div>

        <div className="form-group mb-4">
          <label>Name</label>
          <input type="text" className="form-control" placeholder={itemType === 'category' ? "e.g. Smartwatches" : "e.g. New Arrivals"} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>

        {itemType === 'category' && (
          <div className="form-group mb-4">
            <label>Parent Category (Optional)</label>
            <select className="form-control">
              <option value="">None (Top Level)</option>
              <option value="1">Watches</option>
              <option value="2">Accessories</option>
            </select>
          </div>
        )}

        <div className="form-group mb-4">
          <label>Slug / URL</label>
          <input type="text" className="form-control" placeholder="e.g. smartwatches" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
        </div>

        <div className="form-group">
          <label>Banner Image</label>
          <div style={{ border: '1px dashed #cbd5e1', padding: 16, textAlign: 'center', borderRadius: 8, background: '#f8fafc', cursor: 'pointer', color: '#64748b', fontSize: 13 }}>
            <i className="fas fa-cloud-upload-alt mb-2" style={{ fontSize: 20 }}></i>
            <div>Click to browse or drop an image</div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default CategoryList;
