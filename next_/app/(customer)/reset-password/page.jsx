"use client";
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordApi } from '@/lib/api';

function InputField({ label, type, id, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="fp-field-wrapper">
      <label className="fp-field-label" htmlFor={id}>{label}</label>
      <div className={`fp-field-box ${focused ? 'fp-field-focused' : ''}`}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="fp-input"
          autoComplete={type === 'password' ? 'new-password' : 'email'}
        />
      </div>
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or missing password reset token.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token || !email) {
      setError('Invalid or missing password reset token.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please enter your new password and confirmation.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('[auth-ui] reset password submit', { email, passwordLength: password.length });
      const result = await resetPasswordApi({ email: email.trim(), password, token });
      console.log('[auth-ui] reset password response', result);

      if (!result?.success) {
        throw new Error(result?.error || 'Something went wrong');
      }

      setSuccess('Password updated successfully. Redirecting to login.');
      console.log('[auth-ui] navigation trigger', { target: '/login', reason: 'password reset success' });
      setTimeout(() => router.push('/login'), 1200);
    } catch (err) {
      setError(err?.message || 'Unable to update password right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="fp-form" noValidate>
        <InputField
          label="New Password"
          type="password"
          id="fp-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
        />
        <InputField
          label="Confirm Password"
          type="password"
          id="fp-confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your new password"
        />

        {error && <div className="fp-error-box">{error}</div>}
        {success && <div className="fp-success-box">{success}</div>}

        <button type="submit" className="fp-submit-btn" disabled={submitting || !token || !email}>
          {submitting ? <span className="fp-spinner" /> : <span>Update Password</span>}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="fp-page">
      <div className="fp-card">
        <div className="fp-header">
          <p className="fp-eyebrow">Password Reset</p>
          <h1 className="fp-title">Set a New Password</h1>
          <p className="fp-subtitle">Enter the new password you want to use.</p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="fp-footer">
          Back to <Link href="/login" className="fp-footer-link">Sign In</Link>
        </p>
      </div>

      <style>{`
        .fp-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 20px 40px;
          background: linear-gradient(135deg, #e3e8f0 0%, #f4f7f9 50%, #e9edf4 100%);
        }
        .fp-card {
          width: 100%;
          max-width: 460px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(99,130,201,0.18);
          border-radius: 28px;
          padding: 40px 32px;
          box-shadow: 0 12px 60px rgba(28,46,74,0.1);
        }
        .fp-header { text-align: center; margin-bottom: 28px; }
        .fp-eyebrow {
          font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase;
          color: #4a6fa5; font-weight: 600; margin-bottom: 10px;
        }
        .fp-title {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 32px; color: #1C2E4A; margin-bottom: 8px;
        }
        .fp-subtitle { font-size: 13px; color: #7a8aa0; }
        .fp-form { display: flex; flex-direction: column; gap: 18px; }
        .fp-field-wrapper { display: flex; flex-direction: column; gap: 7px; }
        .fp-field-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          color: #4a5a70; text-transform: uppercase;
        }
        .fp-field-box {
          display: flex; align-items: center;
          background: rgba(240,244,252,0.7);
          border: 1.5px solid rgba(99,130,201,0.18);
          border-radius: 12px; padding: 13px 16px;
          transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
        }
        .fp-field-focused {
          border-color: #4a6fa5;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 0 0 3px rgba(74,111,165,0.12);
        }
        .fp-input {
          width: 100%; border: none; background: transparent; outline: none;
          font-size: 14px; color: #1C2E4A; font-family: 'Montserrat', sans-serif;
        }
        .fp-input::placeholder { color: #b0bdd0; }
        .fp-error-box, .fp-success-box {
          border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 500;
        }
        .fp-error-box {
          border: 1px solid rgba(239,68,68,0.2);
          background: rgba(239,68,68,0.06);
          color: #b91c1c;
        }
        .fp-success-box {
          border: 1px solid rgba(22,163,74,0.2);
          background: rgba(22,163,74,0.08);
          color: #166534;
        }
        .fp-submit-btn {
          width: 100%; padding: 8px 16px; border-radius: 999px;
          background: #1a1a1a; color: white; border: 1px solid #1a1a1a;
          font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); min-height: 38px;
        }
        .fp-submit-btn:disabled { opacity: 0.75; cursor: not-allowed; }
        .fp-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: white; animation: spin 0.7s linear infinite;
        }
        .fp-footer {
          text-align: center; font-size: 13px; color: #7a8aa0; margin-top: 20px;
        }
        .fp-footer-link {
          color: #4a6fa5; font-weight: 600; text-decoration: none;
        }
        .fp-footer-link:hover { color: #1C2E4A; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
