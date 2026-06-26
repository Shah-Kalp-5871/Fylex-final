"use client";
import React from 'react';
import AdminModal from '@/components/admin/AdminModal';

/**
 * ConfirmModal — Delete/action confirmation dialog.
 * Usage:
 *   <ConfirmModal
 *     isOpen={show}
 *     onClose={() => setShow(false)}
 *     onConfirm={handleDelete}
 *     title="Delete Product"
 *     message="Are you sure you want to delete this product? This action cannot be undone."
 *     confirmLabel="Delete"
 *     loading={deleting}
 *     danger
 *   />
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  danger = false,
}) => {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} maxWidth={440}>
      <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: danger ? 'var(--admin-danger-light)' : 'var(--admin-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <i
            className={danger ? 'fas fa-trash-alt' : 'fas fa-question-circle'}
            style={{
              fontSize: 24,
              color: danger ? 'var(--admin-danger)' : 'var(--admin-primary)',
            }}
          ></i>
        </div>
        <p style={{
          fontSize: 14,
          color: 'var(--admin-text-secondary)',
          lineHeight: 1.6,
          maxWidth: 320,
          margin: '0 auto 28px',
        }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
            style={{ minWidth: 100 }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary"
            style={{
              minWidth: 100,
              background: danger
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : undefined,
              boxShadow: danger
                ? 'var(--admin-shadow-danger)'
                : undefined,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 6 }}></i>Processing...</>
              : confirmLabel
            }
          </button>
        </div>
      </div>
    </AdminModal>
  );
};

export default ConfirmModal;
