"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

function InputField({ label, type = 'text', id, value, onChange, placeholder, hint, prefix, maxLength, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="auth-field-group">
      <label className="auth-label" htmlFor={id}>{label}</label>
      <div className={`auth-input-row ${focused ? 'auth-input-focused' : ''} ${disabled ? 'auth-input-disabled' : ''}`}>
        {prefix && <span className="auth-country-code">{prefix} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg></span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="auth-input"
          autoComplete="off"
          maxLength={maxLength}
          disabled={disabled}
        />
      </div>
      {hint && <span className="auth-field-hint">{hint}</span>}
    </div>
  );
}

export default function Signup() {
  const searchParams = useSearchParams();
  const mobileFromLogin = searchParams.get('mobile') || '';

  const [data, setData] = useState({
    name: '', email: '',
    mobile: mobileFromLogin,
    otp: '', address: '', pincode: '', area: ''
  });
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const { signup } = useAuth();
  const navigate = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setData(p => ({ ...p, pincode: val }));

    if (val.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const result = await res.json();
        if (result[0]?.Status === 'Success') {
          const postOffice = result[0].PostOffice[0];
          const area = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`;
          setData(p => ({ ...p, area }));
        } else {
          setData(p => ({ ...p, area: '' }));
          Swal.fire({
            icon: 'error',
            title: 'Invalid Pincode',
            text: 'Please enter valid pincode',
            confirmButtonColor: '#1a3a2a',
            background: '#0d1b12',
            color: '#ffffff',
          });
        }
      } catch (err) {
        console.error('Failed to fetch pincode', err);
      }
    } else {
      setData(p => ({ ...p, area: '' }));
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!data.name.trim()) return setError('Please enter your full name');
    if (!data.mobile.trim() || !/^\d{10}$/.test(data.mobile.trim())) return setError('Please enter a valid 10-digit mobile number');
    if (!data.email.trim()) return setError('Please enter your email address');
    if (!validateEmail(data.email)) return setError('Please enter a valid email address');

    const termsCheck = document.getElementById('sp-terms-check');
    if (termsCheck && !termsCheck.checked) {
      return setError('You must agree to the Terms and Conditions');
    }

    setSubmitting(true);
    try {
      await signup({
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        address: `${data.address}${data.area ? `, ${data.area}` : ''}${data.pincode ? ` - ${data.pincode}` : ''}`,
        otp: '1234', // Default OTP since already verified in login flow
      });
      setDone(true);
      setTimeout(() => navigate.push('/'), 2000);
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">


      {/* ─── Main Content ─── */}
      <main className="auth-main">
        {/* Image Panel */}
        <div className={`auth-image-panel ${loaded ? 'auth-loaded' : ''}`}>
          <img
            src="/assets/auth-hero.png"
            alt="Luxury timepiece"
            className="auth-hero-img"
          />
          <div className="auth-image-overlay" />
        </div>

        {/* Form Panel */}
        <div className={`auth-form-panel auth-form-panel-signup ${loaded ? 'auth-loaded' : ''}`}>
          <div className="auth-form-inner auth-form-inner-signup">
            {done ? (
              <div className="auth-success">
                <div className="auth-success-icon">
                  <svg width="52" height="52" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="24" fill="none" stroke="#1a3a2a" strokeWidth="2">
                      <animate attributeName="stroke-dasharray" from="0 151" to="151 151" dur="0.8s" fill="freeze" />
                    </circle>
                    <path d="M16 27l7 7 13-14" stroke="#5ec49e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <animate attributeName="stroke-dasharray" from="0 60" to="60 60" dur="0.5s" begin="0.6s" fill="freeze" />
                    </path>
                  </svg>
                </div>
                <h3 className="auth-success-title">Account Created!</h3>
                <p className="auth-success-sub">Welcome to Fylex, {data.name.split(' ')[0] || 'Friend'}. Your journey begins now.</p>
                <Link href="/" className="auth-submit-btn" style={{ maxWidth: '260px', textDecoration: 'none', marginTop: '8px' }}>Continue to Store</Link>
              </div>
            ) : (
              <>
                <h1 className="auth-title">Create your Fylex</h1>
                <p className="auth-subtitle">
                  Complete your profile to get started with Fylex.
                </p>

                <div className="auth-step-content" style={{ animation: 'authSlideIn 0.45s ease both' }}>
                  <InputField
                    label="Full Name"
                    id="sp-name"
                    value={data.name}
                    onChange={e => setData(p => ({ ...p, name: e.target.value }))}
                    placeholder="John Marlowe"
                  />
                  <InputField
                    label="Mobile Number"
                    type="tel"
                    id="sp-mobile"
                    value={data.mobile}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setData(p => ({ ...p, mobile: val }));
                    }}
                    placeholder="Enter 10-digit number"
                    prefix="+91"
                    maxLength={10}
                    disabled={!!mobileFromLogin}
                  />
                  <InputField
                    label="Email Address"
                    type="email"
                    id="sp-email"
                    value={data.email}
                    onChange={e => setData(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                  <InputField
                    label="Pincode"
                    id="sp-pincode"
                    value={data.pincode}
                    onChange={handlePincodeChange}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    hint={data.area ? <span style={{ color: '#5ec49e', fontWeight: 500 }}>Area: {data.area}</span> : null}
                  />
                  <InputField
                    label="Full Address"
                    id="sp-address"
                    value={data.address}
                    onChange={e => setData(p => ({ ...p, address: e.target.value }))}
                    placeholder="123 Luxury Lane, City"
                  />
                  <label className="auth-terms-label" htmlFor="sp-terms-check">
                    <input type="checkbox" className="auth-terms-check" id="sp-terms-check" />
                    <span className="auth-terms-custom" />
                    <span>
                      I agree to Fylex&apos;s{' '}
                      <a href="#" className="auth-terms-link">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="auth-terms-link">Privacy Policy</a>
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="auth-error" style={{ marginTop: '20px' }}>
                    {error}
                  </div>
                )}

                <div className="auth-btn-row">
                  <button
                    className={`auth-submit-btn ${submitting ? 'auth-submitting' : ''}`}
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? <span className="auth-spinner" /> : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <style>{`
        /* ══════════════════════════════════════
           AUTH PAGE — DARK LUXURY THEME
        ══════════════════════════════════════ */

        .auth-page {
          min-height: 100vh;
          background: #000000;
          font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
          color: #ffffff;
          display: flex;
          flex-direction: column;
        }

        /* ─── Header ─── */
        .auth-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          background: linear-gradient(180deg, rgba(12,26,16,0.95) 0%, rgba(12,26,16,0.6) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .auth-header-menu {
          background: none; border: none;
          color: #ffffff; cursor: pointer;
          padding: 4px; display: flex; align-items: center;
          transition: opacity 0.2s;
        }
        .auth-header-menu:hover { opacity: 0.7; }
        .auth-header-logo {
          font-size: 16px; font-weight: 400;
          letter-spacing: 0.35em; color: #ffffff;
          text-decoration: none; text-transform: uppercase;
          position: absolute; left: 50%; transform: translateX(-50%);
        }
        .auth-header-icons {
          display: flex; align-items: center; gap: 18px;
        }
        .auth-header-icons a {
          color: #ffffff; text-decoration: none;
          display: flex; align-items: center;
          transition: opacity 0.2s;
        }
        .auth-header-icons a:hover { opacity: 0.7; }

        /* ─── Main Layout ─── */
        .auth-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }

        /* ─── Image Panel ─── */
        .auth-image-panel {
          position: relative; overflow: hidden;
          opacity: 0; transform: scale(1.02);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .auth-image-panel.auth-loaded {
          opacity: 1; transform: scale(1);
        }
        .auth-hero-img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .auth-image-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to right, transparent 60%, #000000 100%);
          pointer-events: none;
        }

        /* ─── Form Panel ─── */
        .auth-form-panel {
          display: flex; align-items: center; justify-content: center;
          padding: 100px 60px 60px;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s;
        }
        .auth-form-panel.auth-loaded {
          opacity: 1; transform: translateY(0);
        }
        .auth-form-panel-signup {
          align-items: flex-start;
          padding-top: 80px;
          overflow-y: auto;
        }
        .auth-form-inner {
          width: 100%; max-width: 440px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 40px;
        }
        .auth-form-inner-signup {
          max-width: 460px;
        }

        /* ─── Typography ─── */
        .auth-title {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 28px; font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.01em; line-height: 1.2;
          margin-bottom: 14px;
        }
        .auth-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.7;
          margin-bottom: 32px;
          max-width: 340px;
        }

        /* ─── Step Content ─── */
        .auth-step-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @keyframes authSlideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* ─── Form Fields ─── */
        .auth-field-group {
          display: flex; flex-direction: column; gap: 10px;
        }
        .auth-label {
          font-size: 13px; font-weight: 400;
          color: rgba(255, 255, 255, 0.65);
          letter-spacing: 0.02em;
        }
        .auth-input-row {
          display: flex; align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          padding-bottom: 12px;
          transition: border-color 0.3s ease;
        }
        .auth-input-row.auth-input-focused {
          border-color: rgba(255, 255, 255, 0.4);
        }
        .auth-input-row.auth-input-disabled {
          opacity: 0.5;
        }
        .auth-country-code {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          display: flex; align-items: center; gap: 4px;
          margin-right: 12px; flex-shrink: 0; user-select: none;
        }
        .auth-country-code svg { opacity: 0.5; }
        .auth-input {
          flex: 1; background: transparent;
          border: none; outline: none;
          font-size: 14px; color: #ffffff;
          font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
          letter-spacing: 0.02em;
        }
        .auth-input::placeholder {
          color: rgba(255, 255, 255, 0.22);
        }
        .auth-input:disabled {
          color: rgba(255, 255, 255, 0.5);
          cursor: not-allowed;
        }
        .auth-field-hint {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.35);
        }

        /* ─── Terms ─── */
        .auth-terms-label {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer; user-select: none; margin-top: 8px;
        }
        .auth-terms-check { display: none; }
        .auth-terms-custom {
          width: 16px; height: 16px; min-width: 16px;
          border-radius: 4px;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
          display: inline-block; margin-top: 1px;
          transition: all 0.2s;
        }
        .auth-terms-check:checked + .auth-terms-custom {
          background: #1a3a2a;
          border-color: rgba(94, 196, 158, 0.4);
        }
        .auth-terms-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }
        .auth-terms-link:hover { color: #ffffff; }

        /* ─── Error ─── */
        .auth-error {
          padding: 10px 14px;
          background: rgba(220, 50, 50, 0.1);
          border: 1px solid rgba(220, 50, 50, 0.25);
          border-radius: 8px;
          color: #ff9999;
          font-size: 13px;
          animation: authFadeIn 0.3s ease;
        }
        @keyframes authFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── Buttons ─── */
        .auth-btn-row {
          display: flex; align-items: center; gap: 12px;
          margin-top: 28px;
        }
        .auth-submit-btn {
          width: 100%; padding: 16px 24px;
          background: #1a3a2a; color: #ffffff;
          border: none; border-radius: 999px;
          font-size: 14px; font-weight: 500;
          letter-spacing: 0.04em;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          display: flex; align-items: center; justify-content: center;
          min-height: 52px; position: relative; overflow: hidden;
        }
        .auth-submit-btn:hover {
          background: #234d38;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(26, 58, 42, 0.5);
        }
        .auth-submit-btn:active { transform: translateY(0); }
        .auth-submit-btn:disabled {
          opacity: 0.6; cursor: not-allowed; transform: none;
        }

        /* ─── Spinner ─── */
        .auth-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #ffffff;
          animation: authSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes authSpin { to { transform: rotate(360deg); } }

        /* ─── Success ─── */
        .auth-success {
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          gap: 16px; padding: 60px 0;
        }
        .auth-success-icon {
          animation: authPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes authPopIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .auth-success-title {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 26px; color: #ffffff;
        }
        .auth-success-sub {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          max-width: 280px;
        }

        /* ══════════════════════════════════════
           RESPONSIVE — MOBILE
        ══════════════════════════════════════ */

        @media (max-width: 900px) {
          .auth-main {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }
          .auth-image-panel {
            height: 38vh; min-height: 240px; max-height: 360px;
          }
          .auth-image-overlay {
            background: linear-gradient(to bottom, transparent 40%, #000000 100%);
          }
          .auth-form-panel {
            padding: 24px 24px 48px;
            align-items: flex-start;
          }
          .auth-form-panel-signup { padding-top: 24px; }
          .auth-form-inner,
          .auth-form-inner-signup { max-width: 100%; }
          .auth-title {
            font-size: 24px; text-align: center;
          }
          .auth-subtitle {
            text-align: center; max-width: 100%;
            margin-left: auto; margin-right: auto;
          }
          .auth-header-icon-hide-mobile { display: none; }
        }

        @media (max-width: 480px) {
          .auth-header { padding: 14px 20px; }
          .auth-header-logo { font-size: 14px; }
          .auth-image-panel {
            height: 32vh; min-height: 200px;
          }
          .auth-form-panel { padding: 20px 20px 40px; }
          .auth-title { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}
