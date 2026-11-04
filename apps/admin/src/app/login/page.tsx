'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  UserCheck,
  ChefHat,
  ArrowRight,
  Lock,
  Mail,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useAuth, STAFF_CREDENTIALS, UserRole } from '../../lib/authContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickSwitch } = useAuth();

  const [identifier, setIdentifier] = useState('owner@bumiupi.id');
  const [password, setPassword] = useState('BumiUpiAdmin2026!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = login(identifier, password);
    setLoading(false);

    if (res.success) {
      if (identifier.toLowerCase().includes('kasir')) {
        router.push('/pos');
      } else {
        router.push('/');
      }
    } else {
      setErrorMsg(res.error || 'Autentikasi staf gagal. Periksa kembali email dan kata sandi.');
    }
  };

  const handleSelectStaff = (role: UserRole) => {
    const cred = STAFF_CREDENTIALS[role];
    if (cred) {
      setIdentifier(cred.email);
      setPassword(cred.password);
      setErrorMsg(null);
    }
  };

  const handleDirectLogin = (role: UserRole) => {
    quickSwitch(role);
    if (role === 'kasir') {
      router.push('/pos');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
      {/* Brand Card & Login Form */}
      <div className="bg-[#FBF7EE] rounded-3xl border border-[#E8DCC2] p-6 sm:p-10 shadow-lg space-y-6 text-center">
        {/* Logo and Header */}
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#3E4F30] p-2 border border-[#D4A24C]/60 shadow-md flex items-center justify-center">
            <img
              src="/brand/Logo_bumi_upi.svg"
              alt="Logo Resmi Bumi Upi"
              className="w-full h-full object-contain filter drop-shadow-xs"
            />
          </div>

          <div>
            <h1
              className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2625]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Portal Masuk Staf & Kasir
            </h1>
            <p className="text-xs text-[#634E3F] mt-1 max-w-md mx-auto leading-relaxed">
              Sistem Operasional Rumah Tamah Bumi Upi, Garut. Khusus manajemen restoran, kasir POS meja, dan dapur KDS.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-left">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#2B2625] block mb-1.5">
              Email / ID Staf Operasional:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C7767] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="nama.staf@bumiupi.id"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8DCC2] rounded-xl text-xs font-medium text-[#2B2625] focus:outline-none focus:ring-2 focus:ring-[#3E4F30]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#2B2625] block mb-1.5">
              Kata Sandi Staf:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C7767] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8DCC2] rounded-xl text-xs font-medium text-[#2B2625] focus:outline-none focus:ring-2 focus:ring-[#3E4F30]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#3E4F30] hover:brightness-110 text-[#F5EEDC] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Memverifikasi Akses...</span>
            ) : (
              <>
                <span>Masuk ke Sistem Operasional</span>
                <ArrowRight className="w-4 h-4 text-[#D4A24C]" />
              </>
            )}
          </button>
        </form>

        {/* Quick Staff Account Switcher (Khusus Staf Internal, Tidak Ada Pelanggan) */}
        <div className="pt-4 border-t border-[#E8DCC2] space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#634E3F] uppercase tracking-wider">
              Pilihan Akun Staf Operasional:
            </span>
            <span className="text-[10px] text-[#8C7767]">Klik untuk isi otomatis</span>
          </div>

          <div className="space-y-2">
            {/* Owner / Admin */}
            <div className="p-3 rounded-2xl border border-[#3E4F30]/40 bg-[#E4EADF]/60 flex items-center justify-between hover:bg-[#E4EADF] transition">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#3E4F30]" />
                  <span className="font-bold text-xs text-[#2B2625]">Owner (Admin)</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#3E4F30] text-white font-bold">Akses Penuh</span>
                </div>
                <p className="text-[10px] text-[#634E3F] font-mono">owner@bumiupi.id</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectStaff('admin')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#3E4F30]/30 text-[#3E4F30] text-[11px] font-bold hover:bg-[#3E4F30] hover:text-white transition"
                >
                  Pilih
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectLogin('admin')}
                  className="px-2.5 py-1 rounded-lg bg-[#3E4F30] text-white text-[11px] font-bold hover:brightness-110 transition"
                >
                  Masuk Langsung
                </button>
              </div>
            </div>

            {/* Kasir POS */}
            <div className="p-3 rounded-2xl border border-amber-300 bg-amber-50/70 flex items-center justify-between hover:bg-amber-100/70 transition">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-xs text-[#2B2625]">Kang Asep (Kasir POS Meja)</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-700 text-white font-bold">POS & KDS</span>
                </div>
                <p className="text-[10px] text-[#634E3F] font-mono">kasir@bumiupi.id</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectStaff('kasir')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 text-[11px] font-bold hover:bg-amber-700 hover:text-white transition"
                >
                  Pilih
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectLogin('kasir')}
                  className="px-2.5 py-1 rounded-lg bg-amber-700 text-white text-[11px] font-bold hover:brightness-110 transition"
                >
                  Masuk Langsung
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Pemisahan Portal Pelanggan */}
        <div className="pt-3 border-t border-[#E8DCC2]/60 text-center">
          <p className="text-xs text-[#634E3F] leading-relaxed">
            Mencari halaman pemesanan makanan atau kartu loyalitas pelanggan?
          </p>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B4532A] hover:underline mt-1"
          >
            <span>Buka Portal Pelanggan Bumi Upi (Port 3000)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
