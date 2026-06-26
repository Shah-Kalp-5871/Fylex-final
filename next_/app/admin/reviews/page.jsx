"use client";
import React, { useState, useEffect, useRef } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import * as api from '@/services/adminApi';
import { useAdminData } from '@/context/AdminDataContext';
import PageHeader from '@/components/admin/ui/PageHeader';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import AdminModal from '@/components/admin/AdminModal';
import { useToast } from '@/context/ToastContext';

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <i key={n} className={n <= rating ? 'fas fa-star' : 'far fa-star'}
        style={{ fontSize: 13, color: n <= rating ? '#f59e0b' : '#e2e8f0' }}></i>
    ))}
  </div>
);

const ReviewsPage = () => {
    const toast = useToast();
    const { data, loading, errors, refetch, updateRecord, deleteRecord } = useAdminData();
    const reviews = data.reviews || [];

    const tableRef = useRef(null);
    const tabulatorRef = useRef(null);
    const actionsRef = useRef({});

    const [selectedReview, setSelectedReview] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (!tableRef.current || loading.reviews) return;
        tabulatorRef.current?.destroy();

        actionsRef.current = {
            onView: (r) => { setSelectedReview(r); setShowDetail(true); },
            onDelete: (id, name) => setDeleteTarget({ id, name }),
        };

        tabulatorRef.current = new Tabulator(tableRef.current, {
            data: reviews,
            layout: 'fitColumns',
            responsiveLayout: 'collapse',
            pagination: 'local',
            paginationSize: 10,
            placeholder: 'No reviews found',
            columns: [
                {
                    title: 'ID', field: 'id', width: 70, hozAlign: 'center',
                    formatter: (cell) => `<span style="font-weight:600;color:#94a3b8">#${cell.getValue()}</span>`
                },
                {
                    title: 'CUSTOMER/PRODUCT', field: 'customer.name', minWidth: 260,
                    formatter: (cell) => {
                        const d = cell.getRow().getData();
                        const cName = d.customer?.name || 'Guest User';
                        const pName = d.product?.name || 'Unknown Product';
                        return `
                <div style="line-height:1.4;padding:4px 0">
                  <div style="font-weight:800;color:#1e293b;font-size:14px">${cName}</div>
                  <div style="font-size:11px;color:#94a3b8;font-weight:600;margin-top:2px">${pName}</div>
                </div>`;
                    }
                },
                {
                    title: 'RATING', field: 'rating', width: 130, hozAlign: 'center',
                    formatter: (cell) => {
                        const r = cell.getValue() || 0;
                        const stars = [1, 2, 3, 4, 5].map(n =>
                            `<i class="${n <= r ? 'fas' : 'far'} fa-star" style="font-size:11px;color:${n <= r ? '#f59e0b' : '#e2e8f0'};margin:0 1px"></i>`
                        ).join('');
                        return `<div style="text-align:center"><div style="font-weight:800;color:#1e293b;font-size:14px">${r}.0</div><div style="display:flex;justify-content:center">${stars}</div></div>`;
                    }
                },
                {
                    title: 'COMMENT', field: 'comment', minWidth: 300,
                    formatter: (cell) => `<div style="font-size:12px;color:#475569;line-height:1.5;max-height:36px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;white-space:normal">${cell.getValue() || 'No comment'}</div>`
                },
                {
                    title: 'STATUS', field: 'isActive', width: 130, hozAlign: 'center',
                    formatter: (cell) => {
                        const active = cell.getValue() === true;
                        return `<div class="status-badge" style="display:inline-flex;padding:5px 14px;border-radius:10px;font-size:11px;font-weight:700;background:${active ? '#ecfdf5' : '#fffbeb'};color:${active ? '#10b981' : '#f59e0b'};border:1px solid ${active ? '#d1fae5' : '#fde68a'}">${active ? 'PUBLISHED' : 'PENDING'}</div>`;
                    }
                },
                {
                    title: 'ACTIONS', width: 100, headerSort: false, hozAlign: "right",
                    formatter: () => `<div style="display:flex;gap:8px;justify-content:flex-end">
                <button class="btn-icon btn-icon-edit" style="background:#f5f3ff;color:#6366f1"><i class="fas fa-eye"></i></button>
                <button class="btn-icon btn-icon-delete" style="background:#fef2f2;color:#ef4444"><i class="fas fa-trash-alt"></i></button>
              </div>`,
                    cellClick: (e, cell) => {
                        const d = cell.getRow().getData();
                        if (e.target.closest('.btn-icon-edit')) actionsRef.current.onView(d);
                        if (e.target.closest('.btn-icon-delete')) actionsRef.current.onDelete(d.id, d.customer?.name);
                    }
                }
            ],
        });

        return () => { tabulatorRef.current?.destroy(); tabulatorRef.current = null; };
    }, [reviews, loading.reviews]);

    const handleApprovalToggle = async (id, currentStatus) => {
        setUpdatingStatus(true);
        const newStatus = !currentStatus;
        const success = await updateRecord('reviews', id, { isActive: newStatus }, api.updateReviewStatus);
        setUpdatingStatus(false);
        if (success) {
            if (selectedReview?.id === id) setSelectedReview(prev => ({ ...prev, isActive: newStatus }));
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        const success = await deleteRecord('reviews', deleteTarget.id, api.deleteReview);
        setDeleting(false);
        if (success) {
            setShowDetail(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Reviews & Moderation" subtitle="Approve or manage customer product feedback" />

            <div className="admin-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
                {loading.reviews ? <Loader message="Loading reviews..." /> :
                    errors.reviews ? <ErrorBanner message={errors.reviews} onRetry={() => refetch.reviews()} /> :
                        <div ref={tableRef}></div>}
            </div>

            <AdminModal isOpen={showDetail && !!selectedReview} onClose={() => setShowDetail(false)} title="Review Content" maxWidth={500}>
                {selectedReview && (
                    <div className="space-y-6">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <StarRating rating={selectedReview.rating} />
                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>
                                    {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleDateString() : 'N/A'} · {selectedReview.customer?.name}
                                </div>
                            </div>
                            <div className={`status-pill ${selectedReview.isActive ? 'pill-active' : 'pill-inactive'}`}>
                                {selectedReview.isActive ? 'Published' : 'Under Review'}
                            </div>
                        </div>

                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', position: 'relative' }}>
                            <i className="fas fa-quote-left" style={{ position: 'absolute', top: 12, left: 12, fontSize: 16, color: '#e2e8f0' }}></i>
                            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, margin: 0, fontWeight: 500, fontStyle: 'italic' }}>
                                "{selectedReview.comment}"
                            </p>
                        </div>

                        <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                <i className="fas fa-box" style={{ color: '#6366f1' }}></i>
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>PRODUCT</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedReview.product?.name}</div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => handleApprovalToggle(selectedReview.id, selectedReview.isActive)}
                                className={selectedReview.isActive ? 'btn-secondary flex-1' : 'btn-primary flex-1'}
                                disabled={updatingStatus}
                            >
                                {updatingStatus ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
                                {selectedReview.isActive ? 'Unpublish Review' : 'Approve & Publish'}
                            </button>
                            <button onClick={() => setDeleteTarget({ id: selectedReview.id, name: selectedReview.product?.name })} className="btn-secondary" style={{ color: '#ef4444' }}>
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                )}
            </AdminModal>

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Review"
                message={`Permanently delete this review for "${deleteTarget?.name}"?`}
                confirmLabel="Delete Review"
                loading={deleting}
                danger
            />
        </div>
    );
};

export default ReviewsPage;
