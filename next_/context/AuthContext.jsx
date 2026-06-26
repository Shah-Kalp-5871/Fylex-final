"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { signupApi, loginApi, loginOtpApi, fetchCurrentUserApi } from '@/lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [guestId, setGuestId] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    console.log('[auth] clearing session');
    setUser(null);
    localStorage.removeItem('fylexx_user');
    localStorage.removeItem('fylexx_token');
  }, []);

  const persistSession = useCallback((token, userData) => {
    console.log('[auth] persisting session', { email: userData?.email, userId: userData?.id });
    setUser(userData);
    localStorage.setItem('fylexx_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('fylexx_token', token);
    }
    return userData;
  }, []);

  const verifySession = useCallback(async () => {
    const token = localStorage.getItem('fylexx_token');
    if (!token) {
      clearSession();
      return null;
    }

    console.log('[auth] verifying stored session');
    const result = await fetchCurrentUserApi();
    console.log('[auth] verifySession response', result);

    if (!result?.success || !result?.data?.user) {
      clearSession();
      return null;
    }

    return persistSession(token, result.data.user);
  }, [clearSession, persistSession]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const verifiedUser = await verifySession();
      if (mounted) {
        setUser(verifiedUser);
        setLoading(false);
      }
    };

    void bootstrap();

    // Initialize or retrieve Guest ID
    let gid = localStorage.getItem('fylexx_guest_id');
    if (!gid) {
      gid = `gst_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      localStorage.setItem('fylexx_guest_id', gid);
    }
    setGuestId(gid);

    return () => {
      mounted = false;
    };
  }, [verifySession]);

  const login = async (credentials) => {
    console.log('[auth] login request payload', { email: credentials?.email, passwordLength: credentials?.password?.length || 0 });
    const result = await loginApi(credentials);
    console.log('[auth] login response', result);

    if (!result?.success) {
      clearSession();
      throw new Error(result?.error || 'Something went wrong');
    }

    const payload = result.data;
    const loginSucceeded = result?.success === true;
    if (!loginSucceeded || !payload?.access_token || !payload?.user) {
      clearSession();
      throw new Error('Invalid login response from server');
    }

    return persistSession(payload.access_token, payload.user);
  };

  const loginOtp = async (credentials) => {
    console.log('[auth] login-otp request payload', { mobile: credentials?.mobile });
    const result = await loginOtpApi(credentials);
    console.log('[auth] login-otp response', result);

    if (!result?.success) {
      clearSession();
      throw new Error(result?.error || 'Something went wrong');
    }

    const payload = result.data;
    if (!payload?.access_token || !payload?.user) {
      clearSession();
      throw new Error('Invalid login response from server');
    }

    return persistSession(payload.access_token, payload.user);
  };

  const logout = () => {
    clearSession();
  };

  const signup = async (userData) => {
    console.log('[auth] signup request payload', { email: userData?.email, mobile: userData?.mobile || null });
    const result = await signupApi(userData);
    console.log('[auth] signup response', result);

    if (!result?.success) {
      throw new Error(result?.error || 'Something went wrong');
    }

    const payload = result.data;
    if (payload?.access_token && payload?.user) {
      persistSession(payload.access_token, payload.user);
    }

    return result.data;
  };

  return (
    <AuthContext.Provider value={{ user, guestId, login, loginOtp, logout, signup, loading, verifySession, setSession: persistSession, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
