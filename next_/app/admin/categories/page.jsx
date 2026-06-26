"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import { useAdminData } from '@/context/AdminDataContext';
import * as api from '@/services/adminApi';
import PageHeader from '@/components/admin/ui/PageHeader';
import FormField from '@/components/admin/ui/FormField';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/AdminModal';
import { useToast } from '@/context/ToastContext';

const CategoriesPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { data, loading, errors, refetch, addRecord, updateRecord, deleteRecord } = useAdminData();
  const categories = data.categories || [];

  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const actionsRef = useRef({});

  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!tableRef.current || loading.categories) return;
    tabulatorRef.current?.destroy();

    actionsRef.current = {
      onEdit: (rec) => {
        router.push(`/admin/categories/edit/${rec.id}`);
      },
      onDelete: (id, name) => setDeleteTarget({ id, name })
    };

    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: categories,
      layout: 'fitColumns',
      responsiveLayout: 'collapse',
      pagination: 'local',
      paginationSize: 15,
      placeholder: 'No categories found',
      columnHeaderVertAlign: 'bottom',
      columns: [
        {
          title: 'ID', field: 'id', width: 80, hozAlign: 'center', headerSort: true,
          formatter: (cell) => `<span style="font-weight:600;color:#94a3b8;font-size:12px">#${cell.getValue()}</span>`,
        },
        {
          title: 'CATEGORY INFO', field: 'name', minWidth: 300,
          formatter: (cell) => {
            const d = cell.getRow().getData();
            const img = d.image || d.image_url;
            return `
              <div style="display:flex;align-items:center;gap:14px;padding:8px 0">
                <div style="width:44px;height:44px;background:#f8fafc;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;flex-shrink:0;box-shadow:0 2px 4px rgba(0,0,0,0.02)">
                  ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover" />` : `<i class="fas fa-folder" style="color:#6366f1;font-size:18px;opacity:0.8"></i>`}
                </div>
                <div style="min-width:0">
                  <div style="font-weight:800;color:#1e293b;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.01em">${d.name}</div>
                  <div style="font-size:11px;color:#6366f1;font-weight:700;margin-top:2px;text-transform:lowercase;font-family:'SF Mono',monospace">/${d.slug}</div>
                </div>
              </div>
            `;
          },
        },
        {
          title: 'PARENT', field: 'parent.name', width: 160,
          formatter: (cell) => {
            const val = cell.getValue();
            if (!val) return '<span style="color:#cbd5e1;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Root</span>';
            return `<span style="font-size:11px;font-weight:800;color:#6366f1;background:#f5f3ff;padding:4px 12px;border-radius:8px;border:1px solid rgba(99,102,241,0.1);text-transform:uppercase">${val}</span>`;
          }
        },
        {
          title: 'PRODUCTS', field: '_count.products', width: 110, hozAlign: 'center',
          formatter: (cell) => `<div style="text-align:center"><span style="font-weight:800;color:#1e293b;font-size:15px">${cell.getValue() ?? 0}</span><div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;font-weight:700">Items</div></div>`,
        },
        {
          title: 'STATUS', field: 'isActive', width: 120, hozAlign: 'center',
          formatter: (cell) => {
            const active = cell.getValue() === true || cell.getValue() === 1;
            return `<div class="status-badge" style="display:inline-flex;padding:5px 14px;border-radius:10px;font-size:10px;font-weight:800;background:${active ? '#ecfdf5' : '#fef2f2'};color:${active ? '#10b981' : '#ef4444'};border:1px solid ${active ? '#d1fae5' : '#fee2e2'};text-transform:uppercase;letter-spacing:0.04em">${active ? 'active' : 'hidden'}</div>`;
          },
        },
        {
          title: 'ACTIONS', headerSort: false, hozAlign: 'right', width: 110,
          formatter: () => `<div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn-icon btn-icon-edit" style="background:#f5f3ff;color:#6366f1;width:32px;height:32px;border-radius:8px" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn-icon btn-icon-delete" style="background:#fef2f2;color:#ef4444;width:32px;height:32px;border-radius:8px" title="Delete"><i class="fas fa-trash-alt"></i></button>
          </div>`,
          cellClick: (e, cell) => {
            const d = cell.getRow().getData();
            if (e.target.closest('.btn-icon-edit')) actionsRef.current.onEdit(d);
            if (e.target.closest('.btn-icon-delete')) actionsRef.current.onDelete(d.id, d.name);
          },
        },
      ],
    });

    return () => { tabulatorRef.current?.destroy(); tabulatorRef.current = null; };
  }, [categories, loading.categories, router]);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      router.push('/admin/categories/create');
    }
  }, [searchParams, router]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const success = await deleteRecord('categories', deleteTarget.id, api.deleteCategory);
    setDeleting(false);
    if (success) setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Categories"
        subtitle="Manage product hierarchy and organization"
        action={{ label: 'Add Category', icon: 'fas fa-plus', onClick: () => router.push('/admin/categories/create') }}
      />

      <div className="admin-card" style={{ borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--admin-shadow-sm)', border: '1px solid var(--admin-border-light)' }}>
        {loading.categories ? <Loader message="Loading categories..." /> :
          errors.categories ? <ErrorBanner message={errors.categories} onRetry={() => refetch.categories()} /> :
            <div style={{ overflowX: 'auto' }}><div style={{ minWidth: 850 }}><div ref={tableRef}></div></div></div>
        }
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`This will permanently delete the category "${deleteTarget?.name}". All associated sub-categories will be unlinked. Continue?`}
        confirmLabel="Confirm Delete"
        loading={deleting}
        danger
      />
    </div>
  );
};

export default CategoriesPage;
