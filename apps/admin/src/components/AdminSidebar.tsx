'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CreditCard,
  ChefHat,
  Users,
  UtensilsCrossed,
  ScrollText,
  ExternalLink,
  Bot,
  BarChart3,
  Crown
} from 'lucide-react';
import { useAuth, UserRole } from '../lib/authContext';
import { adminStore } from '../lib/adminStore';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Executive Owner Dashboard',
    href: '/',
    icon: BarChart3,
    badge: '👑 Owner',
    roles: ['admin']
  },
  {
    name: 'CRM Pelanggan RFM',
    href: '/crm',
    icon: Users,
    badge: '7 Segmen',
    roles: ['admin']
  },
  {
    name: 'Audit Finansial & Void',
    href: '/audit',
    icon: ScrollText,
    badge: 'Aman',
    roles: ['admin']
  },
  {
    name: 'POS Kasir Cepat',
    href: '/pos',
    icon: CreditCard,
    badge: '105 Menu',
    roles: ['admin', 'kasir']
  },
  {
    name: 'Dapur Live KDS',
    href: '/kitchen',
    icon: ChefHat,
    badge: 'Live',
    roles: ['admin', 'kasir']
  },
  {
    name: 'Inventaris Stok',
    href: '/inventory',
    icon: UtensilsCrossed,
    badge: '105 Item',
    roles: ['admin', 'kasir']
  }
];

function SidebarInner({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [kdsCount, setKdsCount] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      const active = adminStore.orders.filter(
        (o) => o.status === 'confirmed' || o.status === 'preparing'
      );
      setKdsCount(active.length);
    };
    update();
    const interval = setInterval(update, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-between h-full overflow-y-auto">
      <div>
        {/* Brand header with Official Logo */}
        <div className="p-4 border-b border-olive-600 bg-olive-800/80">
          <Link href="/pos" onClick={onItemClick} className="block group">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-[#3E4F30] p-1 flex items-center justify-center shadow-md border border-[#D4A24C]/60 flex-shrink-0 overflow-hidden">
                <img
                  src="/brand/Logo_bumi_upi.svg"
                  alt="Logo Resmi Bumi Upi"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <div className="min-w-0">
                <span className="font-serif font-bold text-krem text-base sm:text-lg tracking-wide block truncate group-hover:text-mustard-light transition">
                  Bumi Upi
                </span>
                <span className="text-[10px] text-krem/80 font-sans block tracking-wider uppercase truncate">
                  Portal Manajemen Staf
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-krem/70 font-sans border-b border-olive-700/60 pb-1.5 mb-2">
            <span>{user?.role === 'admin' ? '👑 Menu Eksekutif Owner' : '💼 Menu Kasir Operasional'}</span>
            <span className="px-1.5 py-0.2 rounded bg-olive-700 text-mustard-light font-mono text-[9px]">
              {user?.role === 'admin' ? 'Owner' : 'Kasir'}
            </span>
          </div>

          {NAV_ITEMS.filter((item) => {
            if (!user) return true;
            return !item.roles || item.roles.includes(user.role);
          }).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            const badgeText = item.href === '/kitchen' && kdsCount > 0
              ? `${kdsCount} Tiket`
              : item.badge;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-krem text-olive-900 font-bold shadow-md'
                    : 'text-krem hover:bg-olive-600/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-terakota' : 'text-mustard-light'}`} />
                  <span>{item.name}</span>
                </div>
                {badgeText && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      item.href === '/kitchen' && kdsCount > 0
                        ? 'bg-red-600 text-white animate-pulse'
                        : isActive
                        ? 'bg-olive text-krem'
                        : 'bg-olive-800 text-krem/70 border border-olive-600'
                    }`}
                  >
                    {badgeText}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & External Link to Customer App */}
      <div className="p-3 m-3 space-y-3">
        {/* External Customer Portal Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-olive-700/60 hover:bg-olive-600 border border-olive-600/60 text-xs text-krem transition group"
        >
          <div className="flex items-center gap-2 font-medium">
            <ExternalLink className="w-3.5 h-3.5 text-mustard" />
            <span>Portal Pelanggan</span>
          </div>
          <span className="text-[10px] text-krem/70 font-mono group-hover:text-white">Buka ↗</span>
        </a>

        {/* Telegram Live Struk Info */}
        <div className="p-3 bg-olive-800/80 rounded-xl border border-olive-700/80 text-xs text-krem/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-krem">
              <Bot className="w-3.5 h-3.5 text-mustard" />
              <span>@BumiUpiBot</span>
            </div>
            <span className="text-[10px] bg-emerald-700 text-emerald-100 px-1.5 py-0.5 rounded font-mono">
              LIVE WIB
            </span>
          </div>
          <p className="text-[11px] text-krem/70 leading-relaxed font-sans">
            Struk kasir otomatis disiarkan dalam format WIB ke Telegram.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({
  isOpen = false,
  onClose
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      {/* 1. Desktop Persistent Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-olive text-krem-light flex-shrink-0 flex-col justify-between min-h-screen border-r border-olive-700 shadow-lg">
        <SidebarInner />
      </aside>

      {/* 2. Mobile Drawer Overlay (Active when isOpen on mobile) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <aside className="relative z-10 w-72 max-w-[80vw] bg-olive text-krem-light flex flex-col justify-between min-h-screen shadow-2xl">
            <div className="flex items-center justify-between p-3.5 border-b border-olive-600 bg-olive-900/90">
              <span className="font-serif font-bold text-sm text-krem">Navigasi Manajemen Staf</span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 text-krem flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <SidebarInner onItemClick={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
