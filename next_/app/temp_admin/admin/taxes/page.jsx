"use client";
import React, { useState, useRef, useEffect } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import AdminModal from '@/components/admin/AdminModal';

const TaxList = () => {
  const tableRef = useRef(null);
  const [table, setTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [taxes, setTaxes] = useState([
    { id: 1, name: 'GST 18%', rate: '18%', type: 'Percentage', scope: 'National', status: 'active' },
    { id: 2, name: 'SGST 9%', rate: '9%', type: 'Percentage', scope: 'State', status: 'active' },
    { id: 3, name: 'CGST 9%', rate: '9%', type: 'Percentage', scope: 'Central', status: 'active' },
    { id: 4, name: 'IGST 18%', rate: '18%', type: 'Percentage', scope: 'Inter-State', status: 'active' },
  ]);

  useEffect(() => {
    if (tableRef.current) {
      const tabulator = new Tabulator(tableRef.current, {
        data: taxes,
        layout: "fitDataFill",
        responsiveLayout: false,
        pagination: "local",
        paginationSize: 10,
        columns: [
          {
            title: "TAX NAME", field: "name", width: 280,
            formatter: (cell) => `<span style="font-weight:700;color:#1e293b;font-size:14px">${cell.getValue()}</span>`
          },
          {
            title: "RATE", field: "rate", width: 120, hozAlign: "center",
            formatter: (cell) => `<span style="font-family:'SF Mono',monospace;font-size:11px;font-weight:700;color:#6366f1;background:#f5f3ff;padding:4px 12px;border-radius:8px;border:1px solid rgba(99,102,241,0.1)">${cell.getValue()}</span>`
          },
          { 
            title: "TYPE", field: "type", width: 140,
            formatter: (cell) => `<span style="text-transform:uppercase;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.03em">${cell.getValue()}</span>`
          },
          {
            title: "SCOPE", field: "scope", width: 160,
            formatter: (cell) => `<span style="font-size:11px;font-weight:700;color:#64748b;background:#f8fafc;padding:4px 12px;border-radius:8px;border:1px solid #e2e8f0;text-transform:uppercase">${cell.getValue()}</span>`
          },
          {
            title: "STATUS", field: "status", width: 120, hozAlign: "center",
            formatter: (cell) => {
              const v = cell.getValue();
              return `<span class="status-pill ${v === 'active' ? 'pill-info' : 'pill-inactive'}" style="border-radius:8px;padding:4px 12px">${v?.toUpperCase()}</span>`;
            }
          },
          {
            title: "ACTIONS", headerSort: false, hozAlign: "right", width: 120,
            formatter: () => `
              <div style="display:flex;gap:12px;justify-content:flex-end">
                <button class="btn-icon-edit" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px"><i class="fas fa-edit"></i></button>
                <button class="btn-icon-delete" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px"><i class="fas fa-trash-alt"></i></button>
              </div>
            `,
            cellClick: (e, cell) => {
              if (e.target.closest('.btn-icon-delete')) {
                if (window.confirm('Delete this tax rate?')) {
                  const id = cell.getRow().getData().id;
                  setTaxes(prev => prev.filter(t => t.id !== id));
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
    if (table) table.replaceData(taxes);
  }, [taxes, table]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Tax Management</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4, fontWeight: 500 }}>Configure India GST rates and classes</p>
        </div>
        <button className="btn-indigo-gradient" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus mr-2" style={{ fontSize: 12 }}></i>Add GST Rate
        </button>
      </div>

      <div className="admin-card" style={{ padding: '20px 24px', borderRadius: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-search" style={{ flex: 2, minWidth: 300 }}>
            <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder="Search by tax name, scope..." 
              style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '11px 16px 11px 42px' }} 
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <select style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#4b5a7a', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
              <option>All Scopes</option>
              <option>National</option>
              <option>State</option>
              <option>Central</option>
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

      {/* Add Tax Rate Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Tax Rate"
        maxWidth={400}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => setShowModal(false)}><i className="fas fa-save mr-2"></i>Save Tax Rate</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Tax Name (e.g. IGST 18%)</label><input type="text" className="form-control" placeholder="IGST 18%" /></div>
          <div className="form-group"><label>Tax Rate (%)</label><input type="number" className="form-control" placeholder="18" /></div>
          <div className="form-group">
            <label>Tax Scope</label>
            <select className="form-control">
              <option>Central (CGST)</option><option>State (SGST)</option><option>Inter-State (IGST)</option><option>Union Territory (UTGST)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label className="switch" style={{ margin: 0 }}>
              <input type="checkbox" defaultChecked />
              <span className="slider round"></span>
            </label>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#4b5a7a' }}>Active</span>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default TaxList;
