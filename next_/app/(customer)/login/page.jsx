"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { checkMobileApi, fetchSettings } from '@/lib/api';

/* ─── OTP Input Boxes ─── */
function OtpBoxes({ value, onChange, length = 4 }) {
  const refs = useRef([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = (idx, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = [...digits];
    arr[idx] = char;
    const next = arr.join('');
    onChange(next);
    if (char && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, length - 1);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="otp-boxes">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`otp-box ${d ? 'otp-box-filled' : ''}`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

/* ─── Mask phone: 97****67 ─── */
function maskPhone(num) {
  if (!num || num.length < 4) return num;
  return num.slice(0, 2) + '*'.repeat(num.length - 4) + num.slice(-2);
}

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [isRegistered, setIsRegistered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [loginPageImage, setLoginPageImage] = useState('/assets/auth-hero.png');
  const [loginBtnColor, setLoginBtnColor] = useState('#1a3a2a');
  const [loginBtnTextColor, setLoginBtnTextColor] = useState('#ffffff');
  const { loginOtp } = useAuth();
  const navigate = useRouter();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetchSettings();
        if (res?.success && Array.isArray(res.data)) {
          const settingsObj = {};
          res.data.forEach(item => { settingsObj[item.key] = item.value; });
          
          if (settingsObj.loginPageImage) setLoginPageImage(settingsObj.loginPageImage);
          if (settingsObj.loginButtonColor) setLoginBtnColor(settingsObj.loginButtonColor);
          if (settingsObj.loginButtonTextColor) setLoginBtnTextColor(settingsObj.loginButtonTextColor);
        }
      } catch (err) {
        console.error('Failed to load login settings', err);
      }
    };
    loadSettings();
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  /* Step 1 — Send OTP */
  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!mobile || !/^\d{10}$/.test(mobile.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setSubmitting(true);
    try {
      const result = await checkMobileApi({ mobile });
      // Store registration status — proceed to OTP regardless
      setIsRegistered(!!result?.success);
      setStep(2);
    } catch (err) {
      // Even on error, allow OTP step (backend might still send OTP)
      setIsRegistered(false);
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  };

  /* Step 2 — Verify OTP */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 4) {
      setError('Please enter the 4-digit OTP.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setSubmitting(true);
    try {
      if (isRegistered) {
        // User exists → log them in → go home
        await loginOtp({ mobile, otp });
        navigate.push('/');
      } else {
        // User is NOT registered → verify OTP locally, then go to signup
        if (otp !== '1234') {
          setError('Invalid OTP. Please try again.');
          setShake(true);
          setTimeout(() => setShake(false), 600);
          return;
        }
        navigate.push(`/signup?mobile=${mobile}`);
      }
    } catch (err) {
      setError(err?.message || 'Invalid OTP. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
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
            src={loginPageImage}
            alt="Luxury timepiece"
            className="auth-hero-img"
          />
          <div className="auth-image-overlay" />
        </div>

        {/* Form Panel */}
        <div className={`auth-form-panel ${loaded ? 'auth-loaded' : ''}`}>
          <div className={`auth-form-inner ${shake ? 'auth-shake' : ''}`}>

            {/* ══════ STEP 1: Phone Number ══════ */}
            {step === 1 && (
              <>
                <h1 className="auth-title">Access your Fylex</h1>
                <p className="auth-subtitle">
                  Access your profile, application status, and timepieces.
                </p>

                <form onSubmit={handleMobileSubmit} className="auth-form" noValidate>
                  <div className="auth-field-group">
                    <label className="auth-label" htmlFor="login-phone">Phone</label>
                    <div className={`auth-input-row ${focused ? 'auth-input-focused' : ''}`}>
                      <span className="auth-country-code">+91 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg></span>
                      <input
                        id="login-phone"
                        type="tel"
                        value={mobile}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setMobile(val);
                        }}
                        placeholder="Enter your phone number"
                        className="auth-input"
                        autoComplete="tel"
                        maxLength={10}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                      />
                    </div>
                  </div>

                  {error && <div className="auth-error">{error}</div>}

                  <button
                    type="submit"
                    className={`auth-submit-btn ${submitting ? 'auth-submitting' : ''}`}
                    disabled={submitting}
                    style={{ backgroundColor: loginBtnColor, color: loginBtnTextColor }}
                  >
                    {submitting ? <span className="auth-spinner" /> : 'Send OTP'}
                  </button>

                  <p className="auth-whatsapp-note">
                    Your OTP will also be delivered on WhatsApp for faster access.
                  </p>
                </form>
              </>
            )}

            {/* ══════ STEP 2: OTP Verification (Rotoris-style) ══════ */}
            {step === 2 && (
              <>
                <h1 className="auth-title">Verify your access</h1>
                <p className="auth-subtitle">
                  Enter the 4-digit code sent to <span className="auth-phone-highlight">+91 {maskPhone(mobile)}</span> phone and WhatsApp.
                </p>

                <form onSubmit={handleOtpSubmit} className="auth-form" noValidate>
                  <OtpBoxes value={otp} onChange={setOtp} length={4} />

                  <button type="button" className="auth-resend-link" onClick={() => { /* resend logic */ }}>
                    Didn&apos;t receive it? <span className="auth-resend-action">Resend code</span>
                  </button>

                  {error && <div className="auth-error">{error}</div>}

                  <button
                    type="submit"
                    className={`auth-submit-btn ${submitting ? 'auth-submitting' : ''}`}
                    disabled={submitting}
                    style={{ backgroundColor: loginBtnColor, color: loginBtnTextColor }}
                  >
                    {submitting ? <span className="auth-spinner" /> : 'Continue'}
                  </button>

                  <p className="auth-whatsapp-note">
                    Your details are secure and used only for your Fylex experience.
                  </p>

                  <button
                    type="button"
                    className="auth-change-number"
                    onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  >
                    — Change phone number
                  </button>
                </form>
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
          background: #000000;
        }

        /* ─── Image Panel ─── */
        .auth-image-panel {
          position: relative; overflow: hidden;
          opacity: 0; transform: scale(1.02);
          transition: opacity 0.9s ease, transform 0.9s ease;
          height: 100%;
        }
        .auth-image-panel.auth-loaded {
          opacity: 1; transform: scale(1);
        }
        .auth-hero-img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          object-position: center;
        }
        .auth-image-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to right, transparent 70%, #000000 100%);
          pointer-events: none;
        }

        /* ─── Form Panel ─── */
        .auth-form-panel {
          display: flex; align-items: center; justify-content: center;
          padding: 80px 60px 60px;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s;
          background: #000000;
        }
        .auth-form-panel.auth-loaded {
          opacity: 1; transform: translateY(0);
        }
        .auth-form-inner {
          width: 100%; max-width: 440px;
          padding: 40px;
        }

        /* Shake */
        .auth-shake { animation: authShake 0.55s ease; }
        @keyframes authShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
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
          margin-bottom: 36px;
          max-width: 340px;
        }
        .auth-phone-highlight {
          color: #5ec49e;
          font-weight: 500;
        }

        /* ─── Form ─── */
        .auth-form {
          display: flex; flex-direction: column; gap: 24px;
        }
        .auth-field-group {
          display: flex; flex-direction: column; gap: 12px;
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

        /* ─── OTP Boxes (Rotoris-style) ─── */
        .otp-boxes {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .otp-box {
          width: 56px; height: 60px;
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          text-align: center;
          font-size: 22px;
          font-weight: 500;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
          caret-color: #5ec49e;
        }
        .otp-box:focus {
          border-color: #2a6b4a;
          background: rgba(42, 107, 74, 0.08);
          box-shadow: 0 0 0 3px rgba(42, 107, 74, 0.15);
        }
        .otp-box-filled {
          border-color: rgba(255, 255, 255, 0.25);
        }

        /* ─── Resend Link ─── */
        .auth-resend-link {
          background: none; border: none;
          color: rgba(255, 255, 255, 0.35);
          font-size: 13px; cursor: pointer;
          text-align: center; padding: 0;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }
        .auth-resend-action {
          color: #5ec49e;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .auth-resend-link:hover {
          color: rgba(255, 255, 255, 0.55);
        }

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

        /* ─── Change Number ─── */
        .auth-change-number {
          background: none; border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 13px; cursor: pointer;
          text-align: center; padding: 0;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }
        .auth-change-number:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        /* ─── Submit Button ─── */
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
        .auth-submit-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
          opacity: 0; transition: opacity 0.3s;
        }
        .auth-submit-btn:hover::before { opacity: 1; }
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

        /* ─── Notes ─── */
        .auth-whatsapp-note {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.3);
          text-align: center;
          line-height: 1.5;
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
            height: 45vh; min-height: 280px; max-height: 420px;
          }
          .auth-image-overlay {
            background: linear-gradient(to bottom, transparent 40%, #000000 100%);
          }
          .auth-form-panel {
            padding: 32px 24px 48px;
            align-items: flex-start;
          }
          .auth-form-inner { 
            max-width: 100%;
            padding: 0;
          }
          .auth-title {
            font-size: 26px; text-align: center;
          }
          .auth-subtitle {
            text-align: center; max-width: 100%;
            margin-left: auto; margin-right: auto;
          }
          .auth-header-icon-hide-mobile { display: none; }
          .otp-box { width: 50px; height: 54px; font-size: 20px; }
        }

        @media (max-width: 480px) {
          .auth-header { padding: 14px 20px; }
          .auth-header-logo { font-size: 14px; }
          .auth-image-panel {
            height: 38vh; min-height: 220px;
          }
          .auth-form-panel { padding: 32px 20px 40px; }
          .auth-title { font-size: 24px; }
          .otp-box { width: 46px; height: 50px; font-size: 18px; gap: 8px; }
          .otp-boxes { gap: 8px; }
        }
      `}</style>
    </div>
  );
}
