"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useOrder } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { addAddressApi, initiatePaymentApi, verifyPaymentApi, calculateTotalApi } from '@/lib/api';
import Swal from 'sweetalert2';

const Checkout = () => {
  const navigate = useRouter();
  const { items, totals: cartTotals, clearCart } = useCart();
  const { addOrder } = useOrder();
  const { user, guestId } = useAuth();
  const currentUserId = user?.id || guestId;

  const [activeStep, setActiveStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // SERVER-SIDE TRUTH
  const [totals, setTotals] = useState({
      subtotal: cartTotals.subtotal || 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: cartTotals.subtotal || 0
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [isServiceable, setIsServiceable] = useState(true);
  const [isCodAvailable, setIsCodAvailable] = useState(true);
  const [shippingMessage, setShippingMessage] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    phone: '',
    email: user?.email || '',
    paymentMethod: 'razorpay',
    couponCode: '',
    area: '',
    state: '',
  });

  const [couponInput, setCouponInput] = useState('');
  const [couponErrorMsg, setCouponErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate.push('/login');
      return;
    }
    setIsLoaded(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    if (user?.name) {
      const names = user.name.split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: user.email || prev.email,
        phone: user.mobile || prev.phone,
      }));
    }

    return () => { 
        if (document.body.contains(script)) {
            document.body.removeChild(script); 
        }
    };
  }, [user]);

  useEffect(() => {
    const fetchPincodeDetails = async () => {
      if (formData.postalCode.length === 6) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.postalCode}`);
          const result = await res.json();
          if (result[0]?.Status === 'Success') {
            const postOffice = result[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: postOffice.District,
              area: postOffice.Name,
              state: postOffice.State
            }));
            setValidationErrors(prev => {
              const next = { ...prev };
              delete next.city;
              delete next.postalCode;
              return next;
            });
          } else {
             Swal.fire({
              icon: 'error',
              title: 'Invalid Pincode',
              text: 'Please enter valid pincode',
              confirmButtonColor: '#1C2E4A'
            });
            setFormData(prev => ({ ...prev, city: '', area: '', state: '' }));
          }
        } catch (err) {
          console.error('Failed to fetch pincode', err);
        }
      } else {
        setFormData(prev => ({ ...prev, area: '', state: '' }));
      }
    };
    fetchPincodeDetails();
  }, [formData.postalCode]);

  // REFRESH TOTALS FROM BACKEND
  useEffect(() => {
    const refreshTotals = async () => {
        if (!currentUserId || items.length === 0) return;
        
        setIsCalculating(true);
        // Call API even with incomplete pincode to get latest subtotal/tax/discount
        const res = await calculateTotalApi(currentUserId, formData.postalCode.length === 6 ? formData.postalCode : null, formData.couponCode);
        
        if (res.success) {
            setTotals(res.data);
            setIsServiceable(res.data.serviceable !== false);
            setIsCodAvailable(res.data.codAvailable !== false);
            setShippingMessage(res.data.message || '');
            if (res.data.couponError) {
                setCouponErrorMsg(res.data.couponError);
            } else {
                setCouponErrorMsg('');
            }
            setError(null);

            if (res.data.codAvailable === false && formData.paymentMethod === 'cod') {
                setFormData(prev => ({ ...prev, paymentMethod: 'razorpay' }));
            }
        } else {
            // Fallback to cart totals if API fails
            setTotals(prev => ({
                ...prev,
                subtotal: cartTotals.subtotal,
                total: cartTotals.subtotal + prev.shipping
            }));
        }
        setIsCalculating(false);
    };
    refreshTotals();
  }, [items, formData.postalCode, formData.couponCode, currentUserId, cartTotals.subtotal]);

  const steps = [
    { id: 1, name: 'Shipping' },
    { id: 2, name: 'Payment' },
    { id: 3, name: 'Review' },
  ];

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = 'Required';
      if (!formData.lastName.trim()) errors.lastName = 'Required';
      if (!formData.address.trim()) errors.address = 'Required';
      if (!formData.city.trim()) errors.city = 'Required';

      const postalRegex = /^[1-9][0-9]{5}$/;
      if (!formData.postalCode) errors.postalCode = 'Required';
      else if (!postalRegex.test(formData.postalCode)) errors.postalCode = 'Invalid PIN (6 digits)';

      const phoneRegex = /^[6-9][0-9]{9}$/;
      if (!formData.phone) errors.phone = 'Required';
      else if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) errors.phone = 'Invalid 10-digit number';

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) errors.email = 'Required';
      else if (!emailRegex.test(formData.email)) errors.email = 'Invalid email';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async (e) => {
    if (e && e.currentTarget) e.currentTarget.blur();
    if (!validateStep(activeStep)) return;
    if (!isServiceable) return;

    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    } else {
      await handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const addrRes = await addAddressApi(currentUserId, {
        name: `${formData.firstName} ${formData.lastName}`,
        mobile: formData.phone,
        address: `${formData.address}${formData.area ? `, ${formData.area}` : ''}${formData.state ? `, ${formData.state}` : ''}`,
        city: formData.city,
        pincode: formData.postalCode,
        country: 'India',
        type: 'home',
        isDefault: true,
      });

      if (!addrRes.success) throw new Error(addrRes.error);

      if (formData.paymentMethod === 'razorpay') {
        await handleRazorpayPayment(addrRes.data.id);
      } else {
        await handleCODOrder(addrRes.data.id);
      }
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async (addressId) => {
    const activeCoupon = (!couponErrorMsg && formData.couponCode === couponInput.trim()) ? formData.couponCode : '';
    const payRes = await initiatePaymentApi(currentUserId, formData.postalCode, `rcpt_${Date.now()}`, activeCoupon);
    if (!payRes.success) throw new Error(payRes.error);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: payRes.data.amount,
      currency: payRes.data.currency,
      order_id: payRes.data.id,
      handler: async (response) => {
        const verRes = await verifyPaymentApi({
          orderId: payRes.data.id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });

        if (verRes.success) {
          await finalizeOrder(addressId, 'online', response.razorpay_payment_id);
        } else {
          setError('Payment verification failed');
          setIsProcessing(false);
        }
      },
      prefill: { email: formData.email, contact: formData.phone },
      theme: { color: '#1e293b' },
      modal: { ondismiss: () => setIsProcessing(false) }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleCODOrder = async (addressId) => {
    await finalizeOrder(addressId, 'cod');
  };

  const finalizeOrder = async (addressId, method, paymentId = null) => {
    const orderRes = await addOrder({
      customerId: String(currentUserId),
      shippingAddressId: String(addressId),
      billingAddressId: String(addressId),
      paymentMethod: method,
      paymentId: paymentId,
      couponCode: (!couponErrorMsg && formData.couponCode === couponInput.trim()) ? formData.couponCode : '',
      items: items.map(i => ({ variantId: i.variantId, quantity: i.qty })),
    });

    if (orderRes.success) {
      clearCart();
      navigate.push('/thank-you');
    } else {
      setError(orderRes.error);
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
    else navigate.push('/cart');
  };

  const updateFormData = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === 'phone' || name === 'postalCode') {
      sanitizedValue = value.replace(/\D/g, '');
      if (name === 'phone') sanitizedValue = sanitizedValue.slice(0, 10);
      if (name === 'postalCode') sanitizedValue = sanitizedValue.slice(0, 6);
    } else if (name === 'firstName' || name === 'lastName' || name === 'city') {
      sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <div className={`checkout-page ${isLoaded ? 'loaded' : ''}`}>
      <div className="checkout-container">
        <header className="checkout-header">
          <div className="checkout-back-nav" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </div>
          <h1 className="checkout-title">Secure Checkout</h1>
          <div className="checkout-progress">
            {steps.map((step) => (
              <div key={step.id} className={`step-item ${activeStep >= step.id ? 'active' : ''}`}>
                <div className="step-dot" />
                <span className="step-name">{step.name}</span>
              </div>
            ))}
          </div>
        </header>

        <div className="checkout-layout">
          <main className="checkout-main">
            <div className="checkout-card glassmorphism">
              {activeStep === 1 && (
                <div className="checkout-section fade-in">
                  <h2 className="section-title">Shipping Information</h2>
                  <div className="form-grid">
                    <div className={`form-group ${validationErrors.firstName ? 'error' : ''}`}>
                      <label>First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={updateFormData} placeholder="John" maxLength={50} />
                      {validationErrors.firstName && <span className="error-msg">{validationErrors.firstName}</span>}
                    </div>
                    <div className={`form-group ${validationErrors.lastName ? 'error' : ''}`}>
                      <label>Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={updateFormData} placeholder="Doe" maxLength={50} />
                      {validationErrors.lastName && <span className="error-msg">{validationErrors.lastName}</span>}
                    </div>
                    <div className={`form-group full ${validationErrors.email ? 'error' : ''}`}>
                      <label>Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={updateFormData} placeholder="john@example.com" />
                      {validationErrors.email && <span className="error-msg">{validationErrors.email}</span>}
                    </div>
                    <div className={`form-group full ${validationErrors.address ? 'error' : ''}`}>
                      <label>Address Line 1</label>
                      <input type="text" name="address" value={formData.address} onChange={updateFormData} placeholder="123 Luxury Lane" maxLength={200} />
                      {validationErrors.address && <span className="error-msg">{validationErrors.address}</span>}
                    </div>
                    <div className="form-group full">
                      <label>Apartment, suite, etc. (optional)</label>
                      <input type="text" name="apartment" value={formData.apartment} onChange={updateFormData} placeholder="Apt 4B" maxLength={100} />
                    </div>
                    <div className={`form-group ${validationErrors.city ? 'error' : ''}`}>
                      <label>City</label>
                      <input type="text" name="city" value={formData.city} onChange={updateFormData} placeholder="New York" maxLength={50} />
                      {validationErrors.city && <span className="error-msg">{validationErrors.city}</span>}
                    </div>
                    <div className={`form-group ${validationErrors.postalCode ? 'error' : ''}`}>
                      <label>Postal Code</label>
                      <input type="text" name="postalCode" value={formData.postalCode} onChange={updateFormData} placeholder="100001" maxLength={6} />
                      {validationErrors.postalCode && <span className="error-msg">{validationErrors.postalCode}</span>}
                      {formData.area && formData.state && <span style={{ color: '#1C2E4A', fontWeight: 600, fontSize: '11px', marginTop: '6px', display: 'block' }}>Area: {formData.area}, {formData.state}</span>}
                    </div>
                    <div className={`form-group full ${validationErrors.phone ? 'error' : ''}`}>
                      <label>Phone Number</label>
                      <input type="text" name="phone" value={formData.phone} onChange={updateFormData} placeholder="9876543210" maxLength={10} />
                      {validationErrors.phone && <span className="error-msg">{validationErrors.phone}</span>}
                    </div>
                  </div>

                  {/* {!isServiceable && !isCalculating && formData.postalCode.length === 6 && (
                    <div className="shipping-error-notice">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span><b>Delivery Unavailable:</b> Sorry, we cannot deliver to pincode <b>{formData.postalCode}</b> at this time.</span>
                    </div>
                  )} */}

                  {/* {shippingMessage && !isCalculating && formData.postalCode.length === 6 && (
                    <div className="shipping-warning-notice">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>{shippingMessage}</span>
                    </div>
                  )} */}
                </div>
              )}

              {activeStep === 2 && (
                <div className="checkout-section fade-in">
                  <h2 className="section-title">Payment Method</h2>
                  <div className="payment-options">
                    <div
                      className={`payment-card ${formData.paymentMethod === 'razorpay' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'razorpay' }))}
                    >
                      <div className="card-info">
                        <div className="card-icon">💳</div>
                        <div>
                          <div className="card-type">Razorpay (Cards/UPI/Netbanking)</div>
                          <div className="card-desc">Secure live payment gateway</div>
                        </div>
                      </div>
                      <div className="card-radio" />
                    </div>
                    {isCodAvailable && (
                      <div
                        className={`payment-card ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                      >
                        <div className="card-info">
                          <div className="card-icon">🚚</div>
                          <div>
                            <div className="card-type">Cash on Delivery</div>
                            <div className="card-desc">Pay when you receive the product</div>
                          </div>
                        </div>
                        <div className="card-radio" />
                      </div>
                    )}
                  </div>

                  {!isCodAvailable && formData.postalCode.length === 6 && (
                    <div className="cod-unavailable-hint">
                       Note: Cash on Delivery is not available for your location (<b>{formData.postalCode}</b>).
                    </div>
                  )}

                  {formData.paymentMethod === 'razorpay' && (
                    <div className="payment-notice">
                      <p>You will be redirected to Razorpay secure checkout to complete your purchase.</p>
                    </div>
                  )}
                </div>
              )}

              {activeStep === 3 && (
                <div className="checkout-section fade-in">
                  <h2 className="section-title">Review Order</h2>
                  <p className="review-text">Please review your shipping and payment details before completing the purchase.</p>
                  <div className="review-summary-box">
                    <div className="review-item">
                      <span className="review-label">Shipping To:</span>
                      <span className="value">{formData.firstName} {formData.lastName}, {formData.address}, {formData.city}, {formData.postalCode}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Contact:</span>
                      <span className="value">{formData.phone} | {formData.email}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Payment:</span>
                      <span className="value">{formData.paymentMethod === 'razorpay' ? 'Razorpay Secure' : 'Cash on Delivery'}</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="shipping-error-notice" style={{marginTop: '20px'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink: 0}}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="checkout-footer-actions">
                {isProcessing ? (
                  <div className="processing-state" style={{ color: '#fff', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                     </svg>
                     Processing your order...
                     <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : (
                  <button
                    key={`step-${activeStep}`}
                    className={`primary-btn ${isCalculating || (isServiceable === false) || totals.total <= 0 ? 'disabled' : ''}`}
                    onClick={(e) => handleNext(e)}
                    disabled={isCalculating || (isServiceable === false) || totals.total <= 0}
                  >
                    {activeStep === 3 ? 'Place Order' : 'Continue'}
                  </button>
                )}
              </div>
            </div>
          </main>

          <aside className="checkout-sidebar">
            <div className="order-summary-card glassmorphism">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-items">
                {items.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="item-thumbnail rose-bg">
                      <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div className="item-info">
                      <div className="item-name">{item.title}</div>
                      <div className="item-variant" style={{ fontSize: '10px', color: '#ccc', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {item.subtitle}
                      </div>
                      <div className="item-meta">{item.qty} item{item.qty !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="item-price">₹{Math.round(Number(item.unitPrice) * item.qty).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              
              <div className="summary-divider" />
              <div className="coupon-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                 <div style={{ display: 'flex', gap: '8px' }}>
                   <input 
                     type="text" 
                     value={couponInput} 
                     onChange={(e) => {
                         setCouponInput(e.target.value);
                         if (e.target.value.trim() === '') {
                             setFormData(prev => ({ ...prev, couponCode: '' }));
                         }
                     }} 
                     placeholder="Gift card or discount code" 
                     style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff', fontSize: '13px' }}
                   />
                   <button 
                     type="button" 
                     style={{ padding: '0 20px', borderRadius: '8px', background: formData.couponCode && formData.couponCode === couponInput.trim() && !couponErrorMsg && totals.discount > 0 ? '#ef4444' : '#333', color: 'white', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none', transition: 'background 0.3s' }}
                     onClick={() => {
                         const isValidAndApplied = formData.couponCode && formData.couponCode === couponInput.trim() && !couponErrorMsg && totals.discount > 0;
                         if (isValidAndApplied) {
                             setCouponInput('');
                             setFormData(prev => ({ ...prev, couponCode: '' }));
                         } else {
                             setFormData(prev => ({ ...prev, couponCode: couponInput.trim() }));
                         }
                     }}
                   >
                     {isCalculating ? 'Wait...' : (formData.couponCode && formData.couponCode === couponInput.trim() && !couponErrorMsg && totals.discount > 0 ? 'Remove' : 'Apply')}
                   </button>
                 </div>
                 {couponErrorMsg && (
                   <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 500, paddingLeft: '4px' }}>
                     {couponErrorMsg}
                   </span>
                 )}
              </div>

              <div className="summary-lines">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>₹{Math.round(totals.subtotal).toLocaleString()}</span>
                </div>
                <div className="summary-line">
                  <span>Shipping</span>
                  <span className={totals.shipping === 0 ? 'free-tag' : ''}>
                    {isCalculating ? 'Calculating...' : (totals.shipping === 0 ? 'Free' : `₹${Math.round(totals.shipping).toLocaleString()}`)}
                  </span>
                </div>
                {totals.tax > 0 && (
                  <div className="summary-line">
                    <span>Tax (GST)</span>
                    <span>₹{Math.round(totals.tax).toLocaleString()}</span>
                  </div>
                )}
                {totals.discount > 0 && (
                  <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px dashed #10b981', marginTop: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ color: '#047857', fontWeight: 600, fontSize: '13px' }}>
                        <i className="fas fa-tag mr-2"></i> Coupon Applied: {formData.couponCode}
                      </span>
                      <span style={{ color: '#047857', fontWeight: 700, fontSize: '14px' }}>
                        -₹{Math.round(totals.discount).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ color: '#059669', fontSize: '11px', fontWeight: 500 }}>
                      You Saved ₹{Math.round(totals.discount).toLocaleString()}!
                    </div>
                  </div>
                )}
                <div className="summary-line total">
                  <span>Total</span>
                  <span>₹{Math.round(totals.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="trust-badge-mini">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span>Encrypted SSL Secure Checkout</span>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .checkout-page {
          min-height: 100vh;
          background: #000000;
          padding: 80px 24px 80px;
          font-family: 'Inter', sans-serif;
          position: relative;
          opacity: 0;
          transition: opacity 0.8s ease;
        }
        .checkout-page.loaded { opacity: 1; }

        .checkout-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .checkout-header {
          text-align: center;
          margin: 20px 0 48px;
        }

        .checkout-back-nav {
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; color: #ffffff; font-size: 13px;
          margin-bottom: 24px; transition: transform 0.3s;
          width: fit-content;
        }
        .checkout-back-nav:hover { transform: translateX(-4px); }

        .checkout-title {
          font-size: 2rem; color: #ffffff; font-weight: 700;
          margin-bottom: 10px; letter-spacing: -0.02em;
        }


        .review-text{
        font-size:12px;
        color: #a0a0a0;}

        .checkout-progress {
          display: flex; justify-content: center; gap: 40px;
        }
        .step-item {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          opacity: 0.3; transition: opacity 0.4s; color: #ffffff;
        }
        .step-item.active { opacity: 1; }
        .step-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #ffffff;
        }
        .step-name { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }

        .checkout-layout {
          display: grid; grid-template-columns: 1fr 340px; gap: 32px;
        }

        .glassmorphism {
          background: #111111;
          border-radius: 24px;
          border: 1px solid #333333;
        }

        .checkout-card { padding: 40px; }

        .section-title {
          font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 24px;
        }

        .form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
        }
        .form-group.full { grid-column: span 2; }
        .form-group label {
          display: block; font-size: 11px; text-transform: uppercase;
          letter-spacing: 0.05em; color: #ffffff; margin-bottom: 8px;
          font-weight: 600;
        }
        .form-group input {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 1px solid #333333; background: #000000; color: #ffffff;
          font-size: 14px; transition: border-color 0.3s;
        }
        .form-group input:focus { border-color: #ffffff; outline: none; }
        .form-group.error input { border-color: #ef4444; }
        .error-msg { color: #ef4444; font-size: 10px; margin-top: 4px; display: block; font-weight: 500; }

        .payment-options {
          display: grid; gap: 12px;
        }
        .payment-card {
          padding: 16px; border-radius: 16px; border: 2px solid #333333;
          display: flex; justify-content: space-between; align-items: center;
          cursor: pointer; transition: all 0.3s;
        }
        .payment-card.selected { border-color: #ffffff; background: rgba(255, 255, 255, 0.05); }
        .card-info { display: flex; align-items: center; gap: 16px; }
        .card-icon { font-size: 24px; }
        .card-type { font-size: 14px; font-weight: 600; color: #ffffff; }
        .card-desc { font-size: 11px; color: #a0a0a0; }
        .card-radio { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #333333; }
        .selected .card-radio { background: #ffffff; border-color: #ffffff; }

        .payment-notice {
          margin-top: 24px; padding: 16px; border-radius: 12px;
          background: rgba(255, 255, 255, 0.05); border: 1px solid #333333; color: #ffffff;
          font-size: 13px; line-height: 1.5;
        }

        .review-summary-box {
          background: rgba(255, 255, 255, 0.05); padding: 24px; border-radius: 16px; border: 1px solid #333333;
          display: grid; gap: 16px;
        }
        .review-item { display: grid; gap: 4px; }
        .review-item .review-label { font-size: 11px; text-transform: uppercase; color: #a0a0a0; font-weight: 600; }
        .review-item .value { font-size: 14px; color: #ffffff; font-weight: 500; }

        .checkout-footer-actions {
          margin-top: 40px; padding-top: 32px; border-top: 1px solid #333333;
          display: flex; justify-content: center;
        }
        .primary-btn {
          padding: 8px 16px; border-radius: 999px; border: 1px solid #ffffff;
          background: #ffffff; color: #000000; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.15em;
          font-size: 10px; cursor: pointer; transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
        }
        .primary-btn:hover:not(:disabled), .primary-btn:active:not(:disabled) { 
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #ffffff;
          transform: translateY(-2px); 
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2); 
        }
        .primary-btn:focus { outline: none; }
        .primary-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .order-summary-card { padding: 24px; position: sticky; top: 40px; }
        .summary-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 20px; color: #ffffff; }
        .summary-item { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
        .item-thumbnail { width: 48px; height: 48px; flex-shrink: 0; }
        .rose-bg { background: transparent; }
        .item-name { font-size: 13px; font-weight: 700; color: #ffffff; }
        .item-meta { font-size: 11px; color: #a0a0a0; }
        .item-price { margin-left: auto; font-size: 13px; font-weight: 600; color: #ffffff; }
        
        .summary-divider { height: 1px; background: #333333; margin: 20px 0; }
        .summary-line { display: flex; justify-content: space-between; font-size: 13px; color: #ffffff; margin-bottom: 12px; }
        .summary-line.total { font-weight: 700; font-size: 16px; color: #ffffff; margin-top: 8px; }
        .free-tag { color: #ffffff; font-weight: 700; }

        .trust-badge-mini {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 24px; color: #ffffff; font-size: 10px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.05em;
        }

        .fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .pulse { animation: pulseBtn 2s infinite; }
        @keyframes pulseBtn { 
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); } 
          70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); } 
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } 
        }

        .shipping-error-notice {
          margin-top: 24px; padding: 16px; border-radius: 12px; border: 1px solid #fee2e2;
          background: #fef2f2; color: #b91c1c;
          display: flex; align-items: center; gap: 12px; font-size: 13px;
        }
        .shipping-warning-notice {
          margin-top: 24px; padding: 16px; border-radius: 12px; border: 1px solid #fef3c7;
          background: #fffbeb; color: #92400e;
          display: flex; align-items: center; gap: 12px; font-size: 13px;
        }
        .cod-unavailable-hint {
          margin-top: 12px; font-size: 11px; color: #ffffff; font-weight: 500;
        }

        @media (max-width: 860px) {
          .checkout-layout { grid-template-columns: 1fr; }
          .checkout-sidebar { order: -1; }
          .checkout-card { padding: 24px; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
