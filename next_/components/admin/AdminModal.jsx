"use client";
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * AdminModal Component
 * Uses React Portal to render modals at the end of document.body
 * to bypass any CSS stacking context issues (e.g. sidebar overlapping).
 */
const AdminModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 600,
  footer 
}) => {
  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div 
        className="admin-modal-content animate-fade-in" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth }}
      >
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button className="admin-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="admin-modal-body">
          {children}
        </div>
        {footer && (
          <div className="admin-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AdminModal;
