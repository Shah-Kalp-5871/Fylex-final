"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import '@/app/admin/css/custom.css';
import { orderService } from '@/services';
import PageHeader from '@/components/admin/ui/PageHeader';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

const statusColors = {
  pending:    { bg: '#fef3c7', color: '#92400e' },
  confirmed:  { bg: '#dbeafe', color: '#1e40af' },
  processing: { bg: '#e0e7ff', color: '#3730a3' },
  shipped:    { bg: '#f0f9ff', color: '#0369a1' },
  delivered:  { bg: '#f0fdf4', color: '#166534' },
  cancelled:  { bg: '#fef2f2', color: '#991b1b' },
  refunded:   { bg: '#f5f3ff', color: '#5b21b6' },
};

const paymentStatusColors = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  paid:    { bg: '#f0fdf4', color: '#166534' },
  failed:  { bg: '#fef2f2', color: '#991b1b' },
  refunded:{ bg: '#f5f3ff', color: '#5b21b6' },
};

const infoRow = (label, value) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px dashed var(--admin-border-light)' }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-muted)', minWidth: 120 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', textAlign: 'right' }}>{value || '—'}</span>
  </div>
);

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);
  
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [updatingTracking, setUpdatingTracking] = useState(false);
  
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await orderService.getOrderById(orderId);
    if (err) { setError(err); }
    else {
      const o = data?.data ?? data;
      setOrder(o);
      setNewStatus(o?.status || '');
      setNewPaymentStatus(o?.paymentStatus || '');
      setCarrier(o?.shipments?.[0]?.carrier || '');
      setTrackingNumber(o?.shipments?.[0]?.trackingNumber || '');
      setTrackingUrl(o?.shipments?.[0]?.trackingUrl || '');
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => { if (orderId) fetchOrder(); }, [orderId, fetchOrder]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order?.status) return;
    setUpdatingStatus(true);
    const { error: err } = await orderService.updateOrderStatus(orderId, newStatus, overrideReason);
    setUpdatingStatus(false);
    if (err) { toast?.error?.(err); }
    else {
      toast?.success?.('Order status updated!');
      setOrder(prev => ({ ...prev, status: newStatus }));
      setOverrideReason('');
      fetchOrder(); // refresh audit logs
    }
  };

  const handlePaymentStatusUpdate = async () => {
    if (!newPaymentStatus || newPaymentStatus === order?.paymentStatus) return;
    setUpdatingPaymentStatus(true);
    const { error: err } = await orderService.updateOrderPaymentStatus(orderId, newPaymentStatus);
    setUpdatingPaymentStatus(false);
    if (err) { toast?.error?.(err); }
    else {
      toast?.success?.('Payment status updated!');
      setOrder(prev => ({ ...prev, paymentStatus: newPaymentStatus }));
      fetchOrder();
    }
  };

  const handleTrackingUpdate = async () => {
    if (!carrier && !trackingNumber) return;
    setUpdatingTracking(true);
    const { error: err } = await orderService.updateOrderTracking(orderId, { carrier, trackingNumber, trackingUrl });
    setUpdatingTracking(false);
    if (err) { toast?.error?.(err); }
    else {
      toast?.success?.('Tracking information saved!');
      fetchOrder();
    }
  };

  const handleRefund = async () => {
    if (!refundAmount || isNaN(refundAmount) || Number(refundAmount) <= 0) return toast?.error?.('Invalid refund amount');
    setProcessingRefund(true);
    const { error: err } = await orderService.processOrderRefund(orderId, { amount: Number(refundAmount), reason: refundReason });
    setProcessingRefund(false);
    if (err) { toast?.error?.(err); }
    else {
      toast?.success?.('Refund processed!');
      setRefundAmount('');
      setRefundReason('');
      fetchOrder();
    }
  };

  if (loading) return <Loader message="Loading order details..." />;
  if (error)   return <ErrorBanner message={error} onRetry={fetchOrder} />;
  if (!order)  return <ErrorBanner message="Order not found" />;

  const statusStyle = statusColors[order.status?.toLowerCase()] || { bg: '#f1f5f9', color: '#475569' };
  const paymentStyle = paymentStatusColors[order.paymentStatus?.toLowerCase()] || { bg: '#f1f5f9', color: '#475569' };
  const items = order.items || order.orderItems || [];
  const customer = order.customer || {};

  return (
    <div className="animate-fade-in">
      <PageHeader title={`Order ${order.orderNumber || order.id}`} subtitle={`Placed on ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}`}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => orderService.downloadInvoice(orderId, false)}
            title="View Invoice"
          >
            <i className="fas fa-file-invoice" style={{ fontSize: 12 }}></i>
            Invoice
          </button>
          <Link href="/admin/orders" className="btn-secondary">
            <i className="fas fa-arrow-left" style={{ fontSize: 12 }}></i>
            Back to Orders
          </Link>
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* Left — Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Order Items */}
          <div className="admin-card" style={{ borderRadius: 16 }}>
            <div className="admin-card-header">
              <h3>Items Ordered</h3>
              <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', fontWeight: 600 }}>
                {items.reduce((acc, item) => acc + (item.quantity || item.qty || 1), 0)} unit{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="admin-card-body">
              {items.length === 0 ? (
                <p style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: '20px 0', fontSize: 13 }}>
                  No items data available
                </p>
              ) : (
                items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < items.length - 1 ? '1px dashed var(--admin-border-light)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f1f5f9', border: '1px solid var(--admin-border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.image ? (
                          <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <i className="fas fa-box" style={{ color: '#cbd5e1', fontSize: 16 }}></i>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.productName || item.name || item.product?.name || 'Product'}
                        </div>
                        {item.sku && <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>SKU: {item.sku}</div>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        ₹{Math.round(Number(item.unitPrice || item.price || 0)).toLocaleString('en-IN')} × {item.quantity || item.qty || 1}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--admin-success)', fontWeight: 700 }}>
                        = ₹{Math.round(Number((item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1))).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Order totals */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px solid var(--admin-border)' }}>
                {order.subtotal && infoRow('Subtotal', `₹${Math.round(Number(order.subtotal)).toLocaleString('en-IN')}`)}
                {order.taxTotal != null && infoRow('Tax', `₹${Math.round(Number(order.taxTotal)).toLocaleString('en-IN')}`)}
                {order.shippingTotal != null && infoRow('Shipping', `₹${Math.round(Number(order.shippingTotal)).toLocaleString('en-IN')}`)}
                {order.discountTotal != null && Number(order.discountTotal) > 0 && infoRow('Discount', `-₹${Math.round(Number(order.discountTotal)).toLocaleString('en-IN')}`)}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)' }}>Grand Total</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--admin-primary)' }}>
                    ₹{Math.round(Number(order.grandTotal || order.total || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {(order.shipping_address || order.shippingAddress) && (
            <div className="admin-card" style={{ borderRadius: 16 }}>
              <div className="admin-card-header"><h3>Shipping Address</h3></div>
              <div className="admin-card-body">
                {(() => {
                  const addr = order.shipping_address || order.shippingAddress;
                  return (
                    <div style={{ fontSize: 13, color: 'var(--admin-text-secondary)', lineHeight: 1.8 }}>
                      {addr.full_name || addr.name && <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{addr.full_name || addr.name}</div>}
                      <div>{addr.address || addr.line1}</div>
                      {addr.city && <div>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip || addr.pincode || ''}</div>}
                      {addr.country && <div>{addr.country}</div>}
                      {addr.phone && <div style={{ marginTop: 6 }}><i className="fas fa-phone" style={{ marginRight: 6, fontSize: 11 }}></i>{addr.phone}</div>}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Right — Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Order Status */}
          <div className="admin-card" style={{ borderRadius: 16 }}>
            <div className="admin-card-header"><h3>Order Status</h3></div>
            <div className="admin-card-body">
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Status</p>
                <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'capitalize', ...statusStyle }}>
                  {order.status || '—'}
                </span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Update Status
                </label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', outline: 'none', marginBottom: 10 }}
                >
                  {['pending','processing','confirmed','shipped','delivered','cancelled','refunded'].map(s => (
                    <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Override Reason (Optional)"
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 10, fontSize: 13, outline: 'none', marginBottom: 10 }}
                />
                <button
                  onClick={handleStatusUpdate}
                  className="btn-primary"
                  disabled={updatingStatus || newStatus === order.status}
                  style={{ width: '100%', justifyContent: 'center', opacity: (updatingStatus || newStatus === order.status) ? 0.6 : 1 }}
                >
                  {updatingStatus ? <><i className="fas fa-spinner fa-spin"></i> Updating...</> : 'Update Status'}
                </button>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="admin-card" style={{ borderRadius: 16 }}>
            <div className="admin-card-header"><h3>Payment Status</h3></div>
            <div className="admin-card-body">
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Payment Status</p>
                <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'capitalize', background: paymentStyle.bg, color: paymentStyle.color }}>
                  {order.paymentStatus || '—'}
                </span>
              </div>
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: 4 }}>
                  <i className="fas fa-credit-card" style={{ marginRight: 6, fontSize: 11 }}></i>
                  Method: <strong style={{ color: 'var(--admin-text)' }}>{order.paymentMethod || '—'}</strong>
                </p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--admin-text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Update Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={e => setNewPaymentStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', outline: 'none', marginBottom: 10 }}
                >
                  {['pending','paid','failed','refunded'].map(s => (
                    <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={handlePaymentStatusUpdate}
                  className="btn-primary"
                  disabled={updatingPaymentStatus || newPaymentStatus === order.paymentStatus}
                  style={{ width: '100%', justifyContent: 'center', opacity: (updatingPaymentStatus || newPaymentStatus === order.paymentStatus) ? 0.6 : 1 }}
                >
                  {updatingPaymentStatus ? <><i className="fas fa-spinner fa-spin"></i> Updating...</> : 'Update Payment'}
                </button>
              </div>
            </div>
          </div>

          {/* Shipping & Tracking */}
          <div className="admin-card" style={{ borderRadius: 16 }}>
            <div className="admin-card-header"><h3>Shipping & Tracking</h3></div>
            <div className="admin-card-body">
              {order.shipments && order.shipments.length > 0 && (
                <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px dashed var(--admin-border-light)' }}>
                  {order.shipments.map(s => (
                    <div key={s.id} style={{ fontSize: 13, marginBottom: 8 }}>
                      <strong>{s.carrier || 'Carrier'}</strong>: {s.trackingNumber || 'N/A'}
                      {s.trackingUrl && <div style={{ marginTop: 4 }}><a href={s.trackingUrl} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', fontSize: 12, fontWeight: 600 }}><i className="fas fa-external-link-alt" style={{ marginRight: 4 }}></i>Track Package</a></div>}
                    </div>
                  ))}
                </div>
              )}
              <input type="text" placeholder="Carrier (e.g. BlueDart)" value={carrier} onChange={e => setCarrier(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 10, fontSize: 13, outline: 'none', marginBottom: 10 }} />
              <input type="text" placeholder="Tracking Number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 10, fontSize: 13, outline: 'none', marginBottom: 10 }} />
              <input type="text" placeholder="Tracking URL (Optional)" value={trackingUrl} onChange={e => setTrackingUrl(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 10, fontSize: 13, outline: 'none', marginBottom: 10 }} />
              <button onClick={handleTrackingUpdate} className="btn-secondary" disabled={updatingTracking} style={{ width: '100%', justifyContent: 'center' }}>
                {updatingTracking ? 'Saving...' : 'Save Tracking'}
              </button>
            </div>
          </div>

          {/* Refunds & Adjustments */}
          <div className="admin-card" style={{ borderRadius: 16 }}>
            <div className="admin-card-header"><h3>Refunds & Adjustments</h3></div>
            <div className="admin-card-body">
              {order.returns && order.returns.length > 0 && (
                <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px dashed var(--admin-border-light)' }}>
                  {order.returns.map(r => (
                    <div key={r.id} style={{ fontSize: 13, marginBottom: 8 }}>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>-₹{r.refundAmount}</span> ({r.reason || 'No reason'})
                    </div>
                  ))}
                </div>
              )}
              <input type="number" placeholder="Refund Amount (₹)" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 10, fontSize: 13, outline: 'none', marginBottom: 10 }} />
              <input type="text" placeholder="Reason (e.g. Damaged item)" value={refundReason} onChange={e => setRefundReason(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--admin-border)', borderRadius: 10, fontSize: 13, outline: 'none', marginBottom: 10 }} />
              <button onClick={handleRefund} className="btn-primary" disabled={processingRefund || order.paymentStatus !== 'paid'} style={{ width: '100%', justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444' }}>
                {processingRefund ? 'Processing...' : 'Issue Refund'}
              </button>
            </div>
          </div>

          {/* Audit Log */}
          <div className="admin-card" style={{ borderRadius: 16 }}>
            <div className="admin-card-header"><h3>Audit Log</h3></div>
            <div className="admin-card-body" style={{ maxHeight: 250, overflowY: 'auto' }}>
              {order.statusHistory && order.statusHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {order.statusHistory.map(h => (
                    <div key={h.id} style={{ fontSize: 12, borderLeft: '2px solid var(--admin-border)', paddingLeft: 10 }}>
                      <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{h.status?.toUpperCase() || 'UPDATE'}</div>
                      <div style={{ color: 'var(--admin-text-muted)', fontSize: 11 }}>{new Date(h.createdAt).toLocaleString()}</div>
                      {h.notes && <div style={{ marginTop: 4, color: 'var(--admin-text-secondary)', fontStyle: 'italic' }}>"{h.notes}"</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>No logs available</p>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="admin-card" style={{ borderRadius: 16 }}>
            <div className="admin-card-header"><h3>Customer Details</h3></div>
            <div className="admin-card-body">
              {infoRow('Name', order.customer_name || (order.customerFirstName ? `${order.customerFirstName} ${order.customerLastName || ''}` : customer.name))}
              {infoRow('Email', order.customer_email || order.customerEmail || customer.email || (order.addresses?.[0]?.email))}
              {infoRow('Phone', order.customer_phone || order.customerMobile || customer.phone || customer.mobile || (order.addresses?.[0]?.phone))}
              {infoRow('Payment', order.paymentMethod)}
            </div>
          </div>

          {/* Order Meta */}
          <div className="admin-card" style={{ borderRadius: 16 }}>
            <div className="admin-card-header"><h3>Order Info</h3></div>
            <div className="admin-card-body">
              {infoRow('Order #', order.orderNumber || order.id)}
              {infoRow('Placed on', order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')}
              {infoRow('Items', items.reduce((acc, item) => acc + (item.quantity || item.qty || 1), 0))}
              {order.couponCode && infoRow('Coupon', order.couponCode)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

