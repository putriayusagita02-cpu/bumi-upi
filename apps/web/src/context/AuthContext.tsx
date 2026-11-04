'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerProfile, MembershipTier } from '../lib/types';
import { DEMO_CUSTOMER, DEMO_CUSTOMERS_LIST } from '../lib/catalogData';

interface AuthContextType {
  customer: CustomerProfile | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  loginDemo: (cust?: CustomerProfile) => void;
  switchCustomer: (newCustomer: CustomerProfile) => void;
  updateProfile: (updated: Partial<CustomerProfile>) => boolean;
  logout: () => void;
  requestOtp: (
    phone: string,
    meta?: { mode?: 'login' | 'register'; name?: string; email?: string }
  ) => Promise<{
    success: boolean;
    phone?: string;
    formattedPhone?: string;
    demoOtp?: string;
    whatsappUrl?: string;
    whatsappWebUrl?: string;
    whatsappCsUrl?: string;
    waMessage?: string;
    banner?: string;
    error?: string;
  }>;
  verifyOtp: (
    phone: string,
    code: string,
    registerData?: { name?: string; email?: string }
  ) => Promise<{
    success: boolean;
    customer?: CustomerProfile;
    error?: string;
  }>;
  activeOtpState: { phone: string; otpCode: string; visible: boolean } | null;
  dismissOtpHelper: () => void;
  addPoints: (pointsEarned: number) => void;
  demoUsers: CustomerProfile[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pengunjung awal adalah GUEST (null) sampai mereka login / daftar
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [activeOtpState, setActiveOtpState] = useState<{ phone: string; otpCode: string; visible: boolean } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bumi_auth_customer');
      if (saved) {
        setCustomer(JSON.parse(saved));
      }
    } catch {}
    setIsInitialized(true);
  }, []);

  const loginDemo = (targetCust?: CustomerProfile) => {
    const chosen = targetCust || DEMO_CUSTOMER;
    setCustomer(chosen);
    try {
      localStorage.setItem('bumi_auth_customer', JSON.stringify(chosen));
    } catch {}
  };

  const switchCustomer = (newCustomer: CustomerProfile) => {
    setCustomer(newCustomer);
    try {
      localStorage.setItem('bumi_auth_customer', JSON.stringify(newCustomer));
    } catch {}
  };

  const updateProfile = (updatedFields: Partial<CustomerProfile>): boolean => {
    if (!customer) return false;
    const merged: CustomerProfile = {
      ...customer,
      ...updatedFields,
    };
    setCustomer(merged);
    try {
      localStorage.setItem('bumi_auth_customer', JSON.stringify(merged));
    } catch {}
    return true;
  };

  const logout = () => {
    setCustomer(null);
    try {
      localStorage.removeItem('bumi_auth_customer');
    } catch {}
  };

  const requestOtp = async (
    phone: string,
    meta?: { mode?: 'login' | 'register'; name?: string; email?: string }
  ) => {
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          phone,
          mode: meta?.mode || 'login',
          name: meta?.name,
          email: meta?.email,
        }),
      });
      const data = await res.json();
      if (data.success && data.demoOtp) {
        setActiveOtpState({
          phone,
          otpCode: data.demoOtp,
          visible: true,
        });
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal mengirim OTP' };
    }
  };

  const verifyOtp = async (
    phone: string,
    code: string,
    registerData?: { name?: string; email?: string }
  ) => {
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          phone,
          code,
          name: registerData?.name,
          email: registerData?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Customer profile from real registration / auth
        const authenticatedCustomer: CustomerProfile = data.customer || {
          ...DEMO_CUSTOMER,
          id: `cust-${Date.now()}`,
          phone,
          name:
            registerData?.name?.trim() ||
            (phone === DEMO_CUSTOMER.phone ? DEMO_CUSTOMER.name : `Member ${phone.slice(-4)}`),
          email: registerData?.email?.trim() || `${phone.replace(/\D/g, '')}@bumiupi.id`,
          tier: 'Tamu',
          pointsBalance: 50,
          cumulativePoints: 50,
          memberId: `BU-${Date.now().toString().slice(-6)}`,
          qrValue: `BUMI-UPI-MEMBER-${phone}`,
        };

        setCustomer(authenticatedCustomer);
        try {
          localStorage.setItem('bumi_auth_customer', JSON.stringify(authenticatedCustomer));
        } catch {}

        // Sinkronkan data pendaftaran member baru langsung ke CRM Admin
        try {
          const adminCandidates = [
            process.env.NEXT_PUBLIC_ADMIN_URL,
            'https://bumi-upi-admin.vercel.app',
            'http://127.0.0.1:3001'
          ].filter(Boolean) as string[];

          for (const aUrl of adminCandidates) {
            fetch(`${aUrl}/api/crm/customers`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(authenticatedCustomer),
              mode: 'cors'
            }).catch(() => {});
          }
        } catch {}

        setActiveOtpState(null);
        return { success: true, customer: authenticatedCustomer };
      }
      return { success: false, error: data.error || 'Verifikasi gagal' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal memverifikasi OTP' };
    }
  };

  const dismissOtpHelper = () => {
    setActiveOtpState(null);
  };

  const addPoints = (pointsEarned: number) => {
    if (!customer) return;
    const newBal = customer.pointsBalance + pointsEarned;
    const newCum = customer.cumulativePoints + pointsEarned;
    let newTier: MembershipTier = 'Tamu';
    if (newCum >= 300) newTier = 'Keluarga';
    else if (newCum >= 100) newTier = 'Sahabat';

    const updated: CustomerProfile = {
      ...customer,
      pointsBalance: newBal,
      cumulativePoints: newCum,
      tier: newTier,
    };
    setCustomer(updated);
    try {
      localStorage.setItem('bumi_auth_customer', JSON.stringify(updated));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        isInitialized,
        loginDemo,
        switchCustomer,
        updateProfile,
        logout,
        requestOtp,
        verifyOtp,
        activeOtpState,
        dismissOtpHelper,
        addPoints,
        demoUsers: DEMO_CUSTOMERS_LIST,
      }}
    >
      {children}
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
