"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';

const AdminProducts = () => {
  const router = useRouter();
  const { data, deleteRecord } = useAdminData();
  const productsUrlData = data.products || [];

  const tableRef = useRef(null);
  const [table, setTable] = useState(null);

  const actionsRef = useRef({ deleteRecord });
  useEffect(() => { actionsRef.current = { deleteRecord }; }, [deleteRecord]);

  useEffect(() => {
    if (tableRef.current) {
      const tabulator = new Tabulator(tableRef.current, {
        data: productsUrlData,
        layout: "fitDataFill",
        responsiveLayout: false,
        pagination: "local",
        paginationSize: 10,
        selectable: true,
        columns: [
          { 
            title: "PRODUCT INFO", field: "name", width: 320,
            formatter: (cell) => {
              const d = cell.getRow().getData();
              const isFeatured = d.id <= 3; // Mocking featured for first 3 items
              return `
                <div style="display:flex;align-items:center;gap:14px;padding:4px 0">
                  <div style="width:48px;height:48px;background:#f1f5f9;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid #e2e8f0">
                    <img src="${d.images?.split('\n')[0] || 'https://via.placeholder.com/48'}" alt="" style="width:100%;height:100%;object-fit:cover" />
                  </div>
                  <div style="display:flex;flex-direction:column;gap:2px">
                    <div style="font-weight:700;color:#1e293b;font-size:14px">${d.name}</div>
                    <div style="display:flex;align-items:center;gap:8px">
                      <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.02em">SIMPLE</span>
                      ${isFeatured ? '<span class="pill-featured">FEATURED</span>' : ''}
                    </div>
                  </div>
                </div>
              `;
            }
          },
          { 
            title: "SKU", field: "sku", width: 160,
            formatter: (cell) => `<span style="color:#64748b;font-weight:500">${cell.getValue()}</span>`
          },
          { 
            title: "PRICE", field: "price", width: 120,
            formatter: (cell) => `<span style="font-weight:800;color:#1e293b;font-size:14px">₹${cell.getValue().toFixed(2)}</span>`
          },
          { 
            title: "INVENTORY", field: "stock", width: 150,
            formatter: (cell) => `
              <div class="pill-stock">
                <span style="margin-right:4px">${cell.getValue()}</span> in stock
              </div>
            `
          },
          { 
            title: "STATUS", field: "status", width: 120,
            formatter: (cell) => {
              const v = cell.getValue()?.toUpperCase();
              return `<span class="status-pill pill-info" style="border-radius:8px;padding:4px 12px">${v}</span>`;
            }
          },
          {
            title: "ACTIONS", headerSort: false, hozAlign: "right", width: 120,
            formatter: (cell) => {
              return `
                <div style="display:flex;gap:12px;justify-content:flex-end">
                  <button class="btn-icon-edit" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px" title="Edit"><i class="fas fa-edit"></i></button>
                  <button class="btn-icon-delete" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </div>
              `;
            },
            cellClick: (e, cell) => {
              const rowData = cell.getRow().getData();
              if (e.target.closest('.btn-icon-edit')) {
                router.push(`/admin/products/edit?id=${rowData.id}`);
              }
              if (e.target.closest('.btn-icon-delete')) {
                if (window.confirm("Delete this product?")) {
                  actionsRef.current.deleteRecord('products', rowData.id);
                }
              }
            }
          }
        ],
      });
      setTable(tabulator);
    }
  }, [router]);

  useEffect(() => {
    if (table) table.replaceData(productsUrlData);
  }, [productsUrlData, table]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section matching screenshot */}
      <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Products</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4, fontWeight: 500 }}>Manage your store inventory and variants</p>
        </div>
        <button className="btn-indigo-gradient" onClick={() => router.push('/admin/products/edit')}>
          <i className="fas fa-plus mr-2" style={{ fontSize: 12 }}></i>Add Product
        </button>
      </div>

      {/* Filter Bar matching screenshot */}
      <div className="admin-card" style={{ padding: '20px 24px', borderRadius: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-search" style={{ flex: 2, minWidth: 300 }}>
            <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder="Search by name, SKU..." 
              style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '11px 16px 11px 42px' }} 
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <select style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#4b5a7a', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
              <option>All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
            <div ref={tableRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
