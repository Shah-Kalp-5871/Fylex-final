"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import PageHeader from '@/components/admin/ui/PageHeader';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import { useToast } from '@/context/ToastContext';
import { deleteOrderApi } from '@/lib/api';
import Swal from 'sweetalert2';

const OrdersPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { data, loading, errors, refetch } = useAdminData();
  const orders = data.orders || [];

  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tableBuilt, setTableBuilt] = useState(false);

  const actionsRef = useRef({});

  useEffect(() => {
    if (!tableRef.current || loading.orders) return;
    tabulatorRef.current?.destroy();

    actionsRef.current = {
      onView: (id) => router.push(`/admin/orders/${id}`),
      onDelete: async (id) => {
        const result = await Swal.fire({
          title: 'Delete this order?',
          text: "Are you sure you want to delete this order?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it'
        });
        if (!result.isConfirmed) return;
        try {
          const res = await deleteOrderApi(id);
          if (res.success) {
            toast.success('Order deleted successfully');
            refetch.orders();
          } else {
            toast.error(res.error || 'Failed to delete order');
          }
        } catch (error) {
          toast.error('Failed to delete order');
        }
      }
    };

    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: orders,
      layout: 'fitDataFill',
      responsiveLayout: false,
      pagination: 'local',
      paginationSize: 10,
      placeholder: 'No orders found',
      columns: [
        {
          title: 'ORDER #', field: 'orderNumber', width: 140,
          formatter: (cell) => {
            const v = cell.getValue() || cell.getRow().getData().id;
            return `<span style="font-family:'SF Mono',monospace;font-size:12px;font-weight:800;color:#6366f1;background:#f5f3ff;padding:5px 12px;border-radius:8px;border:1px solid rgba(99,102,241,0.15)">#${v}</span>`;
          },
        },
        {
          title: 'CUSTOMER', field: 'customer.name', width: 300,
          formatter: (cell) => {
            const d = cell.getRow().getData();
            const name = d.customer?.name || d.customerName || 'Guest User';
            const email = d.customer?.email || d.customerEmail || 'no-email@provided.com';
            const mobile = d.customer?.mobile || d.customerMobile || '';
            const letter = (name[0] || 'G').toUpperCase();
            return `<div style="display:flex;align-items:center;gap:12px;padding:6px 0">
              <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#38bdf8,#0284c7);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:14px;flex-shrink:0;box-shadow:0 2px 4px rgba(2,132,199,0.2)">${letter}</div>
              <div style="min-width:0">
                <div style="font-weight:800;color:#1e293b;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
                <div style="font-size:11px;color:#64748b;font-weight:600">${mobile ? `<i class="fas fa-phone" style="margin-right:4px;opacity:0.6"></i>${mobile}` : email}</div>
              </div>
            </div>`;
          },
        },
        {
          title: 'ITEMS', field: 'itemsCount', width: 100, hozAlign: 'center',
          formatter: (cell) => {
            const d = cell.getRow().getData();
            const items = d.items || [];
            const totalUnits = items.reduce((acc, item) => acc + (item.quantity || item.qty || 1), 0);
            return `<div style="text-align:center"><span style="font-weight:700;color:#1e293b">${totalUnits}</span><div style="font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:700">Units</div></div>`;
          },
        },
        {
          title: 'DATE', field: 'createdAt', width: 140,
          formatter: (cell) => {
            const val = cell.getValue();
            if (!val) return '—';
            const d = new Date(val);
            if (isNaN(d.getTime())) return 'Invalid Date';
            return `<div style="line-height:1.4"><div style="font-weight:700;color:#1e293b;font-size:13px">${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div><div style="font-size:11px;color:#94a3b8;font-weight:600">${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>`;
          },
        },
        {
          title: 'AMOUNT', field: 'grandTotal', width: 140,
          formatter: (cell) => {
            const val = cell.getValue() || cell.getRow().getData().amount || 0;
            return `<div style="font-weight:800;color:#1e293b;font-size:15px">₹${Math.round(Number(val)).toLocaleString('en-IN')}</div>`;
          },
        },
        {
          title: 'STATUS', field: 'status', width: 130, hozAlign: 'center',
          formatter: (cell) => {
            const v = (cell.getValue() || '').toLowerCase();
            const colors = {
              pending: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
              confirmed: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
              processing: { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
              shipped: { bg: '#ecfeff', text: '#155e75', border: '#a5f3fc' },
              delivered: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
              cancelled: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
              refunded: { bg: '#fafafa', text: '#171717', border: '#e5e5e5' },
            }[v] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
            return `<div style="display:inline-flex;padding:5px 12px;border-radius:10px;font-size:11px;font-weight:700;background:${colors.bg};color:${colors.text};border:1px solid ${colors.border};text-transform:uppercase;letter-spacing:0.02em">${v}</div>`;
          },
        },
        {
          title: 'PAYMENT', field: 'paymentStatus', width: 120, hozAlign: 'center',
          formatter: (cell) => {
            const v = (cell.getValue() || '').toLowerCase();
            const active = v === 'paid';
            const pending = v === 'pending';
            return `<div style="display:inline-flex;padding:5px 12px;border-radius:10px;font-size:11px;font-weight:700;background:${active ? '#f0fdf4' : pending ? '#fffbeb' : '#fef2f2'};color:${active ? '#166534' : pending ? '#92400e' : '#991b1b'};border:1px solid ${active ? '#bbf7d0' : pending ? '#fde68a' : '#fecaca'};text-transform:uppercase">${v}</div>`;
          },
        },
        {
          title: 'ACTIONS', headerSort: false, hozAlign: 'right', width: 100,
          formatter: () => `<div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn-icon btn-icon-edit" title="View Details"><i class="fas fa-eye"></i></button>
            <button class="btn-icon btn-icon-delete" title="Delete Order"><i class="fas fa-trash"></i></button>
          </div>`,
          cellClick: (e, cell) => {
            const d = cell.getRow().getData();
            if (e.target.closest('.btn-icon-edit')) actionsRef.current.onView(d.id);
            if (e.target.closest('.btn-icon-delete')) actionsRef.current.onDelete(d.id);
          },
        },
      ],
    });

    tabulatorRef.current.on("tableBuilt", () => setTableBuilt(true));

    return () => { tabulatorRef.current?.destroy(); tabulatorRef.current = null; setTableBuilt(false); };
  }, [orders, loading.orders, router]);

  // Live filters
  useEffect(() => {
    if (!tabulatorRef.current || !tableBuilt) return;
    const filters = [];
    if (search) {
      filters.push([
        { field: 'orderNumber', type: 'like', value: search },
        { field: 'customer.name', type: 'like', value: search },
      ]);
    }
    if (statusFilter) filters.push({ field: 'status', type: '=', value: statusFilter });
    tabulatorRef.current.setFilter(filters.length ? filters : []);
  }, [search, statusFilter, tableBuilt]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Orders" subtitle="Track and process customer orders" />

      {/* Filter Bar */}
      <div className="admin-card" style={{ padding: '16px 20px', borderRadius: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 260, position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}></i>
            <input
              type="text"
              placeholder="Search by order #, customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 40px', background: '#f8fafc', borderRadius: 10, border: '1px solid var(--admin-border)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid var(--admin-border)', borderRadius: 10, background: '#fff', color: 'var(--admin-text-secondary)', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer', minWidth: 160 }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="btn-secondary">
            <i className="fas fa-times" style={{ fontSize: 11 }}></i> Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
        {loading.orders ? <Loader message="Loading orders..." /> :
          errors.orders ? <ErrorBanner message={errors.orders} onRetry={() => refetch.orders()} /> :
            <div style={{ overflowX: 'auto' }}><div style={{ minWidth: 900 }}><div ref={tableRef}></div></div></div>
        }
      </div>
    </div>
  );
};

export default OrdersPage;
