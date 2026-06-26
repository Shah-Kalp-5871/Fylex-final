"use client";
import React, { useState, useRef, useEffect } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import AdminModal from '@/components/admin/AdminModal';

const AdminUsers = () => {
  const { data, addRecord, deleteRecord } = useAdminData();
  const staff = data.staff || [];
  const tableRef = useRef(null);
  const [table, setTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Manager' });
  const handleSave = () => {
    if (!form.name) return;
    addRecord('staff', { ...form, status: 'active', last_login: 'Never' });
    setForm({ name: '', email: '', role: 'Manager' });
    setShowModal(false);
  };

  useEffect(() => {
    if (tableRef.current) {
      const tabulator = new Tabulator(tableRef.current, {
        data: staff,
        layout: "fitDataFill",
        responsiveLayout: false,
        pagination: "local",
        paginationSize: 10,
        columns: [
          {
            title: "STAFF MEMBER", field: "name", width: 320,
            formatter: (cell) => {
              const d = cell.getRow().getData();
              const letter = d.name.charAt(0);
              return `
                <div style="display:flex;align-items:center;gap:14px;padding:4px 0">
                  <div style="width:40px;height:40px;background:#f5f3ff;border:1px solid rgba(99,102,241,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#6366f1;font-size:14px;flex-shrink:0">${letter}</div>
                  <div style="display:flex;flex-direction:column;gap:2px">
                    <div style="font-weight:700;color:#1e293b;font-size:14px">${d.name}</div>
                    <div style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:lowercase">${d.email}</div>
                  </div>
                </div>
              `;
            }
          },
          {
            title: "ROLE", field: "role", width: 150, hozAlign: "center",
            formatter: (cell) => {
              const role = cell.getValue();
              const colors = {
                'Super Admin': { bg: '#fef2f2', text: '#dc2626' },
                'Manager': { bg: '#eff6ff', text: '#2563eb' },
                'Support': { bg: '#ecfdf5', text: '#059669' }
              }[role] || { bg: '#f8fafc', text: '#64748b' };
              return `<span style="font-size:11px;font-weight:800;color:${colors.text};background:${colors.bg};padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.03em">${role}</span>`;
            }
          },
          {
            title: "LAST LOGIN", field: "last_login", width: 140, hozAlign: "center",
            formatter: (cell) => `<span style="font-size:12px;color:#64748b;font-weight:500">${cell.getValue()}</span>`
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
                <button class="btn-icon-delete" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px"><i class="fas fa-trash-alt"></i></button>
              </div>
            `,
            cellClick: (e, cell) => {
              if (e.target.closest('.btn-icon-delete')) {
                if (window.confirm('Remove this staff member?')) deleteRecord('staff', cell.getRow().getData().id);
              }
            }
          }
        ],
      });
      setTable(tabulator);
    }
  }, []);

  useEffect(() => {
    if (table) table.replaceData(staff);
  }, [staff, table]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header" style={{ alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Staff Management</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4, fontWeight: 500 }}>Manage admin users, team roles, and internal system permissions</p>
        </div>
        <button className="btn-indigo-gradient" onClick={() => setShowModal(true)}>
          <i className="fas fa-user-plus mr-2" style={{ fontSize: 12 }}></i>Add Staff
        </button>
      </div>

      <div className="admin-card" style={{ padding: '20px 24px', borderRadius: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-search" style={{ flex: 2, minWidth: 300 }}>
            <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder="Search by name, email or role..." 
              style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '11px 16px 11px 42px' }} 
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <select style={{ width: '100%', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#4b5a7a', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
              <option>All Roles</option>
              <option>Super Admin</option>
              <option>Manager</option>
              <option>Support</option>
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

      {/* Add Staff Member Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Staff Member"
        maxWidth={420}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Discard</button>
            <button className="btn-indigo-gradient" onClick={handleSave}><i className="fas fa-user-plus mr-2" style={{ fontSize: 12 }}></i>Add User</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Full Name</label><input type="text" className="form-control" placeholder="e.g. Jane Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Email Address</label><input type="email" className="form-control" placeholder="admin@domain.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group">
            <label>Role / Permissions</label>
            <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="Super Admin">Super Admin</option>
              <option value="Manager">Manager (Can edit products, process orders)</option>
              <option value="Support">Support (Can view orders, moderate reviews)</option>
            </select>
          </div>
          <div className="form-group"><label>Temporary Password</label><input type="password" className="form-control" placeholder="••••••••" /></div>
        </div>
      </AdminModal>
    </div>
  );
};

export default AdminUsers;
