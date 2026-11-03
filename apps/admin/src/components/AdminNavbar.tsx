'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { ShieldCheck, UserCheck, ChefHat, Send, Clock, LogOut, ExternalLink, Menu } from 'lucide-react';

export interface AdminNavbarProps {
  onToggleMobileMenu?: () => void;
}

export function AdminNavbar({ onToggleMobileMenu }: AdminNavbarProps = {}) {
  const { user, quickSwitch, logout } = useAuth();
  const [timeWib, setTimeWib] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeWib(
        now.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-krem-border shadow-xs sticky top-0 z-30 px-3 sm:px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Left: Store identity & WIB Clock */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-krem-surface text-olive-900 hover:bg-olive-100 border border-krem-border transition flex items-center justify-center flex-shrink-0"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5 text-olive-900" />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#3E4F30] p-0.5 border border-[#D4A24C]/40 flex items-center justify-center flex-shrink-0 shadow-xs">
              <img src="/brand/Logo_bumi_upi.svg" alt="Bumi Upi" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-olive-900 leading-tight text-sm sm:text-base lg:text-lg">
                Rumah Tamah Bumi Upi
              </h1>
              <p className="text-[11px] sm:text-xs text-kopi-muted font-sans flex items-center gap-1 sm:gap-1.5 flex-wrap">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Garut, Jabar</span>
                <span className="hidden sm:inline">•</span>
                <span className="font-mono text-terakota-dark font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 inline" /> {timeWib || '08:00:00 WIB'}
                </span>
              </p>
            </div>
          </div>

          {/* Telegram bot status badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-olive-50 border border-olive-200 text-xs text-olive-800">
            <Send className="w-3 h-3 text-olive-600" />
            <span className="font-semibold">@BumiUpiBot</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1 rounded font-mono">LIVE WIB</span>
          </div>
        </div>

        {/* Right: Operational Staff Role & Shortcut */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tautan Cepat ke Portal Pelanggan */}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 py-1 px-3 rounded-xl border border-krem-border bg-krem-surface hover:bg-[#EFE7D5] text-xs font-semibold text-kopi transition-colors"
            title="Buka portal pemesanan mandiri & kartu pelanggan di tab baru"
          >
            <span>Buka Portal Pelanggan (Port 3000)</span>
            <ExternalLink className="w-3.5 h-3.5 text-terakota" />
          </a>

          {/* Pengalih Peran Staf Operasional (Hanya Admin, Kasir, Dapur) */}
          <div className="hidden sm:flex items-center gap-1 bg-krem-surface border border-krem-border p-1 rounded-xl text-xs">
            <button
              onClick={() => quickSwitch('admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                user?.role === 'admin'
                  ? 'bg-olive text-white shadow-xs'
                  : 'text-olive-800 hover:bg-olive-100'
              }`}
              title="Masuk sebagai Owner / Administrator"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin (Teh Upi)</span>
            </button>
            <button
              onClick={() => quickSwitch('kasir')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                user?.role === 'kasir'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
              title="Masuk sebagai Kasir POS Meja"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Kasir (Kang Asep)</span>
            </button>
            <button
              onClick={() => quickSwitch('kitchen')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                user?.role === 'kitchen'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-100'
              }`}
              title="Masuk sebagai Kepala Dapur KDS"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Dapur (Kang Dadang)</span>
            </button>
          </div>

          {/* Current Active Staff Badge & Logout */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-krem-border">
              <div className="text-right">
                <div className="text-xs font-bold text-kopi leading-none">{user.name}</div>
                <div className="text-[10px] text-kopi-muted flex items-center justify-end gap-1 pt-0.5">
                  {user.role === 'admin' && <ShieldCheck className="w-3 h-3 text-olive-600" />}
                  {user.role === 'kasir' && <UserCheck className="w-3 h-3 text-amber-600" />}
                  {user.role === 'kitchen' && <ChefHat className="w-3 h-3 text-emerald-600" />}
                  <span className="font-bold uppercase tracking-wider text-terakota-dark">
                    {user.role === 'admin' ? 'Owner / Admin' : user.role === 'kasir' ? 'Kasir POS' : 'Dapur KDS'}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Keluar Akun Staf"
                className="p-1.5 rounded-lg text-kopi-subtle hover:text-terakota hover:bg-terakota-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs bg-olive text-white px-3 py-1.5 rounded-xl font-bold hover:bg-olive-600 transition"
            >
              Masuk Staf
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
