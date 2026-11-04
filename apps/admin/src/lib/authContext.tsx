'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'kasir';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  title?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  quickSwitch: (role: UserRole | string) => void;
  logout: () => void;
}

// Kredensial Resmi Staf Operasional Restoran Bumi Upi Garut (HANYA OWNER & KASIR)
export const STAFF_CREDENTIALS = {
  admin: {
    id: 'usr-admin-01',
    email: 'owner@bumiupi.id',
    password: 'BumiUpiAdmin2026!',
    role: 'admin' as UserRole,
    name: 'Owner',
    title: 'Owner & Pemilik Restoran'
  },
  kasir: {
    id: 'usr-kasir-01',
    email: 'kasir@bumiupi.id',
    password: 'kasir2026',
    role: 'kasir' as UserRole,
    name: 'Kang Asep Supriatna',
    title: 'Kasir POS & Front-Of-House'
  }
};

// Alias kompatibilitas
export const DEMO_CREDENTIALS = STAFF_CREDENTIALS;

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: () => ({ success: false }),
  quickSwitch: () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Periksa sesi tersimpan di browser
    try {
      const saved = localStorage.getItem('bumi_upi_admin_active_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validasi agar peran pelanggan lama tidak tersisa
        if (parsed.role === 'customer') {
          throw new Error('Customer role not allowed in admin portal');
        }
        setUser(parsed);
      } else {
        // Standar masuk sebagai Admin Owner
        const defaultAdmin = STAFF_CREDENTIALS.admin;
        const initialUser: AuthUser = {
          id: defaultAdmin.id,
          name: defaultAdmin.name,
          email: defaultAdmin.email,
          role: defaultAdmin.role,
          title: defaultAdmin.title
        };
        setUser(initialUser);
        localStorage.setItem('bumi_upi_admin_active_user', JSON.stringify(initialUser));
      }
    } catch {
      // Fallback Admin
      const fallbackUser: AuthUser = {
        id: STAFF_CREDENTIALS.admin.id,
        name: STAFF_CREDENTIALS.admin.name,
        email: STAFF_CREDENTIALS.admin.email,
        role: STAFF_CREDENTIALS.admin.role,
        title: STAFF_CREDENTIALS.admin.title
      };
      setUser(fallbackUser);
      try {
        localStorage.setItem('bumi_upi_admin_active_user', JSON.stringify(fallbackUser));
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  const quickSwitch = (role: UserRole | string) => {
    const targetRole: UserRole = role === 'admin' ? 'admin' : 'kasir';
    const cred = STAFF_CREDENTIALS[targetRole];
    if (cred) {
      const newUser: AuthUser = {
        id: cred.id,
        name: cred.name,
        email: cred.email,
        phone: (cred as any).phone,
        role: cred.role,
        title: cred.title
      };
      setUser(newUser);
      try {
        localStorage.setItem('bumi_upi_admin_active_user', JSON.stringify(newUser));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const login = (emailOrId: string, pass: string) => {
    const cleanId = emailOrId.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Validasi Admin Owner
    if (
      (cleanId === STAFF_CREDENTIALS.admin.email.toLowerCase() || cleanId === 'owner@bumiupi.id' || cleanId === 'admin@bumiupi.id' || cleanId === 'putriayusagita02@gmail.com' || cleanId === 'admin') &&
      (cleanPass === STAFF_CREDENTIALS.admin.password || cleanPass === 'bumiupi2026' || cleanPass === 'BumiUpiAdmin2026!')
    ) {
      quickSwitch('admin');
      return { success: true };
    }

    // 2. Validasi Kasir POS (atau alias dapur diarahkan ke kasir)
    if (
      (cleanId === STAFF_CREDENTIALS.kasir.email.toLowerCase() || cleanId === 'kasir' || cleanId === 'dapur@bumiupi.id' || cleanId === 'dapur') &&
      (cleanPass === STAFF_CREDENTIALS.kasir.password || cleanPass === 'kasir2026!' || cleanPass === 'BumiUpiKasir2026!' || cleanPass === 'dapur2026!')
    ) {
      quickSwitch('kasir');
      return { success: true };
    }

    // Cegah login akun pelanggan di portal admin
    if (cleanId.includes('customer') || cleanId.includes('dimas') || cleanId.startsWith('0812')) {
      return {
        success: false,
        error: 'Akses Ditolak: Akun pelanggan hanya dapat digunakan pada Portal Pelanggan di Port 3000.'
      };
    }

    return {
      success: false,
      error: 'Email staf atau kata sandi tidak cocok. Silakan periksa kembali kredensial Anda.'
    };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('bumi_upi_admin_active_user');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, quickSwitch, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
