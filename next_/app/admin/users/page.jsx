"use client";
import React, { useState, useEffect, useRef } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import * as api from '@/services/adminApi';
import PageHeader from '@/components/admin/ui/PageHeader';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/AdminModal';
import { useToast } from '@/context/ToastContext';

const UsersPage = () => {
  const toast = useToast();
  const { data, loading, errors, refetch, updateRecord } = useAdminData();
  const users = data.users || [];

  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);

  const [search, setSearch] = useState('');
  const [tableBuilt, setTableBuilt] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null); // { id, name, isBlocked }
  const [blocking, setBlocking] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  const actionsRef = useRef({});

  useEffect(() => {
    if (!tableRef.current || loading.users) return;
    tabulatorRef.current?.destroy();

    actionsRef.current = {
      onView: async (u) => { 
        setSelectedUser(u); 
        setShowDetails(true); 
        setFetchingProfile(true);
        const res = await api.getUser(u.id);
        if (res.success) {
          setSelectedUser(res.data);
        } else {
          toast.error("Failed to fetch full profile");
        }
        setFetchingProfile(false);
      },
      onBlock: (u) => setBlockTarget({ id: u.id, name: u.name, isBlocked: u.isBlocked }),
      onDelete: (u) => setDeleteTarget({ id: u.id, name: u.name }),
    };

    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: users,
      layout: 'fitColumns',
      responsiveLayout: 'collapse',
      pagination: 'local',
      paginationSize: 10,
      placeholder: 'No customers found',
      columns: [
        {
          title: 'CUSTOMER', field: 'name', minWidth: 280,
          formatter: (cell) => {
            const d = cell.getRow().getData();
            const letter = (d.name || '?')[0].toUpperCase();
            return `<div style="display:flex;align-items:center;gap:14px;padding:6px 0">
              <div style="width:40px;height:40px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;font-weight:800;color:#6366f1;font-size:14px;flex-shrink:0">${letter}</div>
              <div style="min-width:0">
                <div style="font-weight:800;color:#1e293b;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.name || '—'}</div>
                <div style="font-size:11px;font-weight:600;color:#94a3b8">${d.email || d.mobile || 'No contact'}</div>
              </div>
            </div>`;
          },
        },
        {
          title: 'ORDERS', field: '_count.orders', width: 100, hozAlign: 'center',
          formatter: (cell) => `<div style="text-align:center"><span style="font-weight:800;color:#1e293b">${cell.getValue() ?? 0}</span><div style="font-size:9px;color:#94a3b8;text-transform:uppercase;font-weight:700;letter-spacing:0.02em">Orders</div></div>`,
        },
        {
          title: 'TOTAL SPENT', field: 'totalSpent', width: 140, hozAlign: 'center',
          formatter: (cell) => `<div style="font-weight:800;color:#1e293b;font-size:14px">₹${Number(cell.getValue() || 0).toLocaleString('en-IN')}</div>`,
        },
        {
          title: 'STATUS', field: 'isActive', width: 120, hozAlign: 'center',
          formatter: (cell) => {
            const u = cell.getRow().getData();
            const blocked = u.isBlocked === true;
            const active = u.isActive === true;
            return `<div class="status-badge" style="display:inline-flex;padding:5px 14px;border-radius:10px;font-size:11px;font-weight:700;background:${blocked ? '#fef2f2' : active ? '#ecfdf5' : '#f8fafc'};color:${blocked ? '#ef4444' : active ? '#10b981' : '#64748b'};border:1px solid ${blocked ? '#fee2e2' : active ? '#d1fae5' : '#e2e8f0'}">
                ${blocked ? 'BLOCKED' : active ? 'ACTIVE' : 'INACTIVE'}
            </div>`;
          },
        },
        {
          title: 'ACTIONS', headerSort: false, hozAlign: 'right', width: 150,
          formatter: (cell) => {
            const u = cell.getRow().getData();
            const blockIcon = u.isBlocked ? 'fa-unlock' : 'fa-ban';
            return `<div style="display:flex;gap:8px;justify-content:flex-end">
              <button class="btn-icon btn-icon-edit" style="background:#f5f3ff;color:#6366f1" title="View Details"><i class="fas fa-eye"></i></button>
              <button class="btn-icon btn-icon-block" style="background:#fef2f2;color:#ef4444" title="${u.isBlocked ? 'Unblock' : 'Block'} User"><i class="fas ${blockIcon}"></i></button>
              <button class="btn-icon btn-icon-delete" style="background:#fef2f2;color:#ef4444" title="Delete User"><i class="fas fa-trash"></i></button>
            </div>`;
          },
          cellClick: (e, cell) => {
            const u = cell.getRow().getData();
            if (e.target.closest('.btn-icon-edit')) actionsRef.current.onView(u);
            if (e.target.closest('.btn-icon-block')) actionsRef.current.onBlock(u);
            if (e.target.closest('.btn-icon-delete')) actionsRef.current.onDelete(u);
          },
        },
      ],
    });

    tabulatorRef.current.on("tableBuilt", () => setTableBuilt(true));

    return () => { tabulatorRef.current?.destroy(); tabulatorRef.current = null; setTableBuilt(false); };
  }, [users, loading.users]);

  useEffect(() => {
    if (!tabulatorRef.current || !tableBuilt) return;
    if (search) {
      tabulatorRef.current.setFilter([
        { field: 'name', type: 'like', value: search },
        { field: 'email', type: 'like', value: search },
      ], 'or');
    } else {
      tabulatorRef.current.clearFilter();
    }
  }, [search, tableBuilt]);

  const handleBlockToggle = async () => {
    if (!blockTarget) return;
    setBlocking(true);
    const newBlockValue = !blockTarget.isBlocked;
    const success = await updateRecord('users', blockTarget.id, { isBlocked: newBlockValue, isActive: !newBlockValue }, api.updateUser);
    setBlocking(false);
    if (success) {
      setBlockTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await api.deleteUser(deleteTarget.id);
    setDeleting(false);
    if (res.success) {
      toast.success(res.message || 'User deleted successfully');
      setDeleteTarget(null);
      refetch.users();
    } else {
      toast.error(res.error || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Customer Management" subtitle="View and manage user accounts" />

      <div className="admin-card" style={{ padding: '16px 20px', borderRadius: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300, position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}></i>
            <input
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: 42 }}
            />
          </div>
          <button onClick={() => refetch.users()} className="btn-secondary">
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
        {loading.users ? <Loader message="Loading customers..." /> :
          errors.users ? <ErrorBanner message={errors.users} onRetry={() => refetch.users()} /> :
            <div style={{ overflowX: 'auto' }}><div style={{ minWidth: 900 }}><div ref={tableRef}></div></div></div>
        }
      </div>

      <AdminModal isOpen={showDetails && !!selectedUser} onClose={() => setShowDetails(false)} title="Customer Profile" maxWidth={800}>
        {fetchingProfile ? <Loader message="Fetching detailed profile..." /> : selectedUser && (
          <div className="space-y-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 24, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#6366f1', fontSize: 28 }}>
                {(selectedUser.name || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>{selectedUser.name}</h3>
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0, fontWeight: 600 }}><i className="fas fa-envelope" style={{ marginRight: 6 }}></i>{selectedUser.email}</p>
                  {selectedUser.mobile && <p style={{ fontSize: 13, color: '#64748b', margin: 0, fontWeight: 600 }}><i className="fas fa-phone" style={{ marginRight: 6 }}></i>{selectedUser.mobile}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Orders', value: selectedUser._count?.orders ?? 0, icon: 'fa-shopping-bag', color: '#6366f1' },
                { label: 'Total Spent', value: `₹${Number(selectedUser.totalSpent || 0).toLocaleString('en-IN')}`, icon: 'fa-wallet', color: '#10b981' },
                { label: 'Joined', value: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—', icon: 'fa-calendar', color: '#f59e0b' },
              ].map((stat, i) => (
                <div key={i} className="admin-card" style={{ padding: '20px', borderRadius: 16, textAlign: 'center', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div style={{ color: stat.color, fontSize: 16, marginBottom: 10 }}><i className={`fas ${stat.icon}`}></i></div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{stat.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginTop: 4, letterSpacing: '0.02em' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Profile Info */}
              <div className="space-y-4">
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '4px solid #6366f1', margin: "10px 0px", padding: "10px 12px"}}>Signup Information</h4>
                <div className="admin-card" style={{ padding: 20, borderRadius: 16, background: '#fff' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Address</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{selectedUser.address ? selectedUser.address : 'Not provided'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Account Status</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: selectedUser.isBlocked ? '#ef4444' : '#10b981', textTransform: 'uppercase' }}>{selectedUser.isBlocked ? 'Blocked' : 'Active'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Last Login Activity</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never recorded'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order placed info */}
            <div className="space-y-4">
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '4px solid #f59e0b', margin: "10px 0px", padding: "10px 12px" }}>Order-Specific Information</h4>
              <div className="space-y-4">
                {selectedUser.orders?.length > 0 ? selectedUser.orders.map((order, idx) => (
                  <div key={idx} className="admin-card" style={{ padding: 20, borderRadius: 16, border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f8fafc' }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>Order #{order.orderNumber}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 12 }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 8, background: '#f8fafc', color: '#64748b', textTransform: 'uppercase' }}>{order.status}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {order.addresses?.map((addr, aidx) => (
                        <div key={aidx}>
                          <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>{addr.type} ADDRESS</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 2px 0' }}>{addr.firstName} {addr.lastName}</p>
                          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 2px 0' }}>{addr.phone}</p>
                          <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.4 }}>{addr.address1}, {addr.city}, {addr.state} - {addr.postcode}</p>
                        </div>
                      ))}
                      {!order.addresses?.length && <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No address info for this order.</p>}
                    </div>
                  </div>
                )) : <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', padding: 10 }}>No purchase history found.</p>}
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      <ConfirmModal
        isOpen={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        onConfirm={handleBlockToggle}
        title={blockTarget?.isBlocked ? 'Unlock Customer' : 'Block Customer'}
        message={blockTarget?.isBlocked
          ? `Are you sure you want to unlock "${blockTarget?.name}"?`
          : `Block "${blockTarget?.name}"? This will prevent them from making new orders.`}
        confirmLabel={blockTarget?.isBlocked ? 'Unblock Account' : 'Block Account'}
        loading={blocking}
        danger={!blockTarget?.isBlocked}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone and may fail if the user has existing orders.`}
        confirmLabel="Delete Account"
        loading={deleting}
        danger={true}
      />
    </div>
  );
};

export default UsersPage;
