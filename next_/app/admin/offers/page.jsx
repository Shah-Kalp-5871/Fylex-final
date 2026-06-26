"use client";
import React, { useState, useEffect, useRef } from 'react';
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

const OffersPage = () => {
  const toast = useToast();
  const { data, loading, errors, refetch, addRecord, updateRecord, deleteRecord } = useAdminData();
  const offers = data.offers || [];
  const categories = data.categories || [];

  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await api.getOfferAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      }
    };
    fetchAnalytics();
  }, [offers]);

  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const actionsRef = useRef({});

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingAnalytics, setViewingAnalytics] = useState(null);

  const [form, setForm] = useState({
    name: '', code: '', offerType: 'percentage', couponType: 'public', discountValue: '',
    startsAt: '', endsAt: '', description: '',
    isActive: true, maxUses: '', categoryIds: []
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!tableRef.current || loading.offers) return;
    tabulatorRef.current?.destroy();
    actionsRef.current = {
      onAnalytics: (rec) => setViewingAnalytics(rec),
      onEdit: (rec) => {
        setEditingRecord(rec);
        setForm({
          name: rec.name || '',
          code: rec.code || '',
          offerType: rec.offerType || 'percentage',
          couponType: rec.couponType || 'public',
          discountValue: rec.discountValue?.toString() || '',
          startsAt: rec.startsAt ? new Date(rec.startsAt).toISOString().split('T')[0] : '',
          endsAt: rec.endsAt ? new Date(rec.endsAt).toISOString().split('T')[0] : '',
          description: rec.description || '',
          isActive: rec.status === 1 || rec.isActive === true,
          maxUses: rec.maxUses?.toString() || '',
          categoryIds: rec.categories?.map(c => c.categoryId.toString()) || []
        });
        setShowForm(true);
      },
      onDelete: (id, name) => setDeleteTarget({ id, name })
    };

    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: offers,
      layout: 'fitColumns',
      responsiveLayout: 'collapse',
      pagination: 'local',
      paginationSize: 10,
      placeholder: 'No offers found',
      columns: [
        {
          title: 'ID', field: 'id', width: 70, hozAlign: 'center', headerSort: true,
          formatter: (cell) => `<span style="font-weight:600;color:#94a3b8">#${cell.getValue()}</span>`,
        },
        {
          title: 'OFFER / CODE', field: 'name', minWidth: 240,
          formatter: (cell) => {
            const d = cell.getRow().getData();
            const badgeBg = d.couponType === 'one_time' ? '#fef3c7' : (d.couponType === 'user_specific' ? '#dbeafe' : '#f1f5f9');
            const badgeText = d.couponType === 'one_time' ? '#92400e' : (d.couponType === 'user_specific' ? '#1e40af' : '#475569');
            const badgeLabel = (d.couponType || 'public').replace('_', ' ').toUpperCase();
            
            return `<div style="padding:4px 0">
              <div style="font-weight:800;color:#1e293b;font-size:14px">${d.name || '—'}</div>
              <div style="font-family:'SF Mono',monospace;font-size:11px;font-weight:700;color:#6366f1;margin-top:2px">${d.code || 'NO CODE'} <span style="margin-left:6px;padding:2px 6px;border-radius:4px;background:${badgeBg};color:${badgeText};font-size:9px;">${badgeLabel}</span></div>
            </div>`;
          },
        },
        {
          title: 'DISCOUNT', field: 'discountValue', width: 140, hozAlign: 'center',
          formatter: (cell) => {
            const d = cell.getRow().getData();
            const isPerc = d.offerType === 'percentage';
            return `<div style="text-align:center"><div style="font-weight:800;color:#10b981;font-size:15px">${!isPerc ? '₹' : ''}${cell.getValue()}${isPerc ? '%' : ''}</div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase">${d.offerType}</div></div>`;
          },
        },
        {
          title: 'USAGE', field: 'usedCount', width: 100, hozAlign: 'center',
          formatter: (cell) => {
            const d = cell.getRow().getData();
            return `<div style="text-align:center"><div style="font-weight:800;color:#1e293b">${cell.getValue() ?? 0}</div><div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase">${d.maxUses ? `/ ${d.maxUses}` : 'Uses'}</div></div>`;
          }
        },
        {
          title: 'REVENUE', field: 'analytics.revenueSum', width: 130, hozAlign: 'right',
          formatter: (cell) => {
            const val = cell.getValue() || 0;
            return `<div style="font-weight:700;color:#10b981">₹${val.toLocaleString()}</div>`;
          }
        },
        {
          title: 'DISC GIVEN', field: 'analytics.discountSum', width: 130, hozAlign: 'right',
          formatter: (cell) => {
            const val = cell.getValue() || 0;
            return `<div style="font-weight:700;color:#ef4444">-₹${val.toLocaleString()}</div>`;
          }
        },
        {
          title: 'VALID THRU', field: 'endsAt', width: 140,
          formatter: (cell) => {
            const val = cell.getValue();
            if (!val) return `<span style="font-size:11px;color:#94a3b8;font-weight:600">Forever</span>`;
            const d = new Date(val);
            const expired = d < new Date();
            return `<div style="font-size:12px;font-weight:600;color:${expired ? '#ef4444' : '#64748b'}">${d.toLocaleDateString('en-GB')}</div>`;
          }
        },
        {
          title: 'STATUS', field: 'isActive', width: 120, hozAlign: 'center',
          formatter: (cell) => {
            const active = cell.getValue() === true;
            return `<div class="status-badge" style="display:inline-flex;padding:5px 14px;border-radius:10px;font-size:11px;font-weight:700;background:${active ? '#ecfdf5' : '#fef2f2'};color:${active ? '#10b981' : '#ef4444'};border:1px solid ${active ? '#d1fae5' : '#fee2e2'};text-transform:uppercase;letter-spacing:0.02em">${active ? 'active' : 'inactive'}</div>`;
          },
        },
        {
          title: 'ACTIONS', headerSort: false, hozAlign: 'right', width: 140,
          formatter: () => `<div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn-icon btn-icon-analytics" style="background:#ecfeff;color:#06b6d4" title="View Usage"><i class="fas fa-chart-line"></i></button>
            <button class="btn-icon btn-icon-edit" style="background:#f5f3ff;color:#6366f1" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="btn-icon btn-icon-delete" style="background:#fef2f2;color:#ef4444" title="Delete"><i class="fas fa-trash-alt"></i></button>
          </div>`,
          cellClick: (e, cell) => {
            const d = cell.getRow().getData();
            if (e.target.closest('.btn-icon-analytics')) actionsRef.current.onAnalytics(d);
            if (e.target.closest('.btn-icon-edit')) actionsRef.current.onEdit(d);
            if (e.target.closest('.btn-icon-delete')) actionsRef.current.onDelete(d.id, d.name);
          },
        },
      ],
    });

    return () => { tabulatorRef.current?.destroy(); tabulatorRef.current = null; };
  }, [offers, loading.offers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Special validation for discountValue if percentage
    if (name === 'discountValue' && form.offerType === 'percentage') {
      if (value !== '' && (!/^\d+$/.test(value) || value.length > 2)) return;
      if (parseInt(value) > 99) return;
    }

    setForm(prev => ({
      ...prev,
      [name]: name === 'isActive' ? value === 'active' : value
    }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const generateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setForm(prev => ({ ...prev, code: randomCode, maxUses: '1', couponType: 'one_time' }));
    if (formErrors.code) setFormErrors(prev => ({ ...prev, code: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Offer name is required';
    if (!form.code.trim()) errs.code = 'Coupon code is required';
    if (!form.discountValue || isNaN(form.discountValue)) errs.discountValue = 'Valid discount value is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSubmitting(true);
    const payload = {
      ...form,
      discountValue: parseFloat(form.discountValue || 0),
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      status: form.isActive ? 1 : 0
    };

    let success;
    if (editingRecord) {
      success = await updateRecord('offers', editingRecord.id, payload, api.updateOffer);
    } else {
      success = await addRecord('offers', payload, api.createOffer);
    }

    setSubmitting(false);

    if (success) {
      closeModal();
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingRecord(null);
    setForm({
      name: '', code: '', offerType: 'percentage', couponType: 'public', discountValue: '',
      startsAt: '', endsAt: '', description: '',
      isActive: true, maxUses: '', categoryIds: []
    });
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const success = await deleteRecord('offers', deleteTarget.id, api.deleteOffer);
    setDeleting(false);
    if (success) setDeleteTarget(null);
  };

  const handleCategoryToggle = (catId) => {
    const id = catId.toString();
    setForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter(x => x !== id)
        : [...prev.categoryIds, id]
    }));
  };

  return (
    <div className="w-full px-6 lg:px-10 xl:px-16 py-6">
      <div className="max-w-[1600px] mx-auto">
        <PageHeader
          title="Promotional Offers"
          subtitle="Manage discounts, coupons and campaign validity."
          action={{ label: 'Add New Offer', icon: 'fas fa-plus', onClick: () => setShowForm(true) }}
        />

        {analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '24px' }}>
            <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px', gap: '8px' }}>
              <div className="stat-label">Total Coupons</div>
              <div className="stat-value">{analytics.totalCoupons}</div>
            </div>
            <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px', gap: '8px' }}>
              <div className="stat-label">Active Coupons</div>
              <div className="stat-value" style={{ color: 'var(--admin-primary)' }}>{analytics.activeCoupons}</div>
            </div>
            <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px', gap: '8px' }}>
              <div className="stat-label">Total Uses</div>
              <div className="stat-value">{analytics.totalUses.toLocaleString()}</div>
            </div>
            <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px', gap: '8px' }}>
              <div className="stat-label">Discount Given</div>
              <div className="stat-value" style={{ color: 'var(--admin-danger)' }}>-₹{analytics.totalDiscountGiven.toLocaleString()}</div>
            </div>
            <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px', gap: '8px' }}>
              <div className="stat-label">Revenue Gen.</div>
              <div className="stat-value" style={{ color: 'var(--admin-success)' }}>₹{analytics.totalRevenueGenerated.toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="admin-section" style={{ marginTop: '32px' }}>
          <div className="admin-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3>Active Campaigns</h3>
            <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--admin-text-muted)' }}>
              <i className="fas fa-info-circle mr-1"></i> Total {offers.length} offers
            </div>
          </div>
          <div className="admin-section-body" style={{ padding: '4px' }}>
            {loading.offers ? (
              <div className="py-24"><Loader message="Loading offers..." /></div>
            ) : errors.offers ? (
              <div className="p-8"><ErrorBanner message={errors.offers} onRetry={() => refetch.offers()} /></div>
            ) : (
              <div className="overflow-x-auto">
                <div style={{ minWidth: '900px' }}><div ref={tableRef}></div></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Modal (Create/Edit) */}
      <AdminModal isOpen={showForm} onClose={closeModal} title={editingRecord ? "Edit Promotional Offer" : "Create New Offer"} maxWidth={680}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Campaign/Offer Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Festive Flash Sale" required error={formErrors.name} />
            </div>

            <div>
              <FormField label="Coupon Code" name="code" value={form.code} onChange={handleChange} placeholder="e.g. FLASH30" required error={formErrors.code} />
              <button
                type="button"
                onClick={generateCode}
                className="mt-2 text-xs text-indigo-600 font-medium flex items-center gap-1"
              >
                <i className="fas fa-magic"></i> Auto-Generate One-Time Code
              </button>
            </div>

            <FormField
              label="Availability Status"
              name="isActive"
              type="select"
              value={form.isActive ? 'active' : 'inactive'}
              onChange={handleChange}
              options={[{ value: 'active', label: 'Active (Live)' }, { value: 'inactive', label: 'Inactive (Hidden)' }]}
            />

            <FormField
              label="Discount Type"
              name="offerType"
              type="select"
              value={form.offerType}
              onChange={handleChange}
              options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed Amount (₹)' }]}
            />
            
            <FormField
              label="Coupon Type"
              name="couponType"
              type="select"
              value={form.couponType}
              onChange={handleChange}
              options={[
                { value: 'public', label: 'Public Coupon (Multi-use)' }, 
                { value: 'one_time', label: 'One-Time Coupon (Single use total)' },
                { value: 'user_specific', label: 'User-Specific Coupon' }
              ]}
            />

            <FormField
              label={form.offerType === 'percentage' ? 'Discount Percentage (%)' : 'Fixed Amount (₹)'}
              name="discountValue"
              type="text"
              value={form.discountValue}
              onChange={handleChange}
              placeholder={form.offerType === 'percentage' ? 'Max 99' : 'e.g. 1000'}
              hint={form.offerType === 'percentage' ? "Max 2 digits (e.g., 30)" : ""}
              required
              error={formErrors.discountValue}
            />

            <FormField label="Usage Limit (Expires after X uses)" name="maxUses" type="number" value={form.maxUses} onChange={handleChange} placeholder="Unlimited if empty" />

            <div className="form-group">
              <label className="admin-label">Applicable Categories (Optional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, maxHeight: 120, overflowY: 'auto', padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                {categories.length === 0 ? <span style={{ fontSize: 12, color: '#94a3b8' }}>No categories available</span> : categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.id)}
                    style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: form.categoryIds.includes(cat.id.toString()) ? '#6366f1' : '#fff',
                      color: form.categoryIds.includes(cat.id.toString()) ? '#fff' : '#475569',
                      border: '1px solid ' + (form.categoryIds.includes(cat.id.toString()) ? '#6366f1' : '#e2e8f0'),
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <FormField label="Launch Date" name="startsAt" type="date" value={form.startsAt} onChange={handleChange} />
            <FormField label="Expiry Date" name="endsAt" type="date" value={form.endsAt} onChange={handleChange} />

            <div style={{ gridColumn: '1 / -1' }}>
              <FormField label="Offer Description / Details" name="description" type="textarea" value={form.description} onChange={handleChange} placeholder="Explain the terms of this offer..." rows={3} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</> : <><i className="fas fa-save mr-2"></i> {editingRecord ? 'Update Offer' : 'Create Offer'}</>}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`This will permanently remove the coupon "${deleteTarget?.name}". Continue?`}
        confirmLabel="Confirm Delete"
        loading={deleting}
        danger
      />

      <AdminModal isOpen={!!viewingAnalytics} onClose={() => setViewingAnalytics(null)} title={`Analytics: ${viewingAnalytics?.code}`} maxWidth={800}>
        {viewingAnalytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase">Total Uses</div>
                <div className="text-xl font-bold text-gray-900">{viewingAnalytics.analytics?.totalUses || 0}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase">Discount Given</div>
                <div className="text-xl font-bold text-red-500">-₹{viewingAnalytics.analytics?.discountSum?.toLocaleString() || 0}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase">Revenue Gen.</div>
                <div className="text-xl font-bold text-emerald-500">₹{viewingAnalytics.analytics?.revenueSum?.toLocaleString() || 0}</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-3 text-sm border-b pb-2">Usage History</h4>
              {viewingAnalytics.usages && viewingAnalytics.usages.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">User ID</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Order ID</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 text-right">Discount</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 text-right">Order Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {viewingAnalytics.usages.map((u, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-500">{new Date(u.usedAt).toLocaleDateString()} {new Date(u.usedAt).toLocaleTimeString()}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{u.customerId || 'Guest'}</td>
                          <td className="px-4 py-3 text-indigo-600 font-medium">#{u.orderId}</td>
                          <td className="px-4 py-3 text-right text-red-500 font-medium">-₹{u.discountAmount}</td>
                          <td className="px-4 py-3 text-right text-emerald-600 font-medium">₹{u.order?.grandTotal || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                  <i className="fas fa-ghost text-gray-300 text-3xl mb-3"></i>
                  <p className="text-gray-500 text-sm font-medium">No usage history yet</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4">
              <button type="button" className="btn-secondary" onClick={() => setViewingAnalytics(null)}>Close Analytics</button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default OffersPage;
