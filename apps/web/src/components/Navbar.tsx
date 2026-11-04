'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { TableSelectorModal } from './TableSelectorModal';
import { ShoppingBag, Utensils, User, Ticket } from './icons';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { totalItemsCount, tableNumber, orderType } = useCart();
  const { customer, isLoggedIn } = useAuth();
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Link navigasi:
  const navLinks = isLoggedIn
    ? [
        { href: '/', label: 'Beranda' },
        { href: '/menu', label: 'Menu' },
        { href: '/wedding', label: 'Pernikahan & Event' },
        { href: '/member', label: 'Kartu Member' },
        { href: '/cart', label: 'Keranjang' },
      ]
    : [
        { href: '/', label: 'Beranda' },
        { href: '/wedding', label: 'Pernikahan & Event' },
      ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#F5EEDC]/95 backdrop-blur-md border-b border-[#E8DCC2] shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo with Real SVG */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E4F30] p-1 border border-[#D4A24C]/60 shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/brand/Logo_bumi_upi.svg"
                alt="Logo Bumi Upi"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div>
              <span
                className="font-serif text-lg font-bold tracking-tight text-[#2B2625] group-hover:text-[#3E4F30] transition-colors"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                Bumi Upi
              </span>
              <p className="text-[10px] text-[#634E3F] leading-tight font-medium hidden sm:block">
                Rumah Tamah & Kopi Garut
              </p>
            </div>
          </Link>

          {/* Table Selector Pill — HANYA TAMPIL KETIKA SUDAH MASUK */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setIsTableModalOpen(true)}
              className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-[#D4A24C] bg-[#FDF7EE] hover:bg-[#F8EECF] transition-all shadow-2xs text-[#2B2625]"
              title="Klik untuk mengganti meja atau takeaway"
            >
              {orderType === 'dine_in' ? (
                <Utensils className="w-3.5 h-3.5 text-[#3E4F30]" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5 text-[#B4532A]" />
              )}
              <span className="text-xs font-bold text-[#2B2625]">
                {orderType === 'dine_in' ? tableNumber : 'Bawa Pulang'}
              </span>
              <span className="text-[10px] text-[#B4532A] font-medium hidden md:inline">
                (Ubah)
              </span>
            </button>
          )}

          {/* Navigation Links (Bersih, Tidak Ada Ganti Akun di Heading) */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'text-[#B4532A] border-b-2 border-[#B4532A] pb-1'
                      : 'text-[#634E3F] hover:text-[#2B2625]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Belum Login -> Masuk & Daftar saja. Sudah Login -> Profil Member & Keranjang */}
          <div className="flex items-center gap-2.5">
            {isLoggedIn ? (
              <>
                {/* Member Profile Pill */}
                <Link
                  href="/member"
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-[#3E4F30] bg-[#E4EADF]/60 hover:bg-[#E4EADF] transition-colors text-xs font-bold text-[#3E4F30]"
                >
                  <User className="w-3.5 h-3.5 text-[#3E4F30]" />
                  <span>{customer?.name?.split(' ')[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#D4A24C] text-[#2B2625] font-bold">
                    {customer?.pointsBalance ?? 0}p
                  </span>
                </Link>

                {/* Cart Button */}
                <Link
                  href="/cart"
                  className="relative flex items-center justify-center p-2 rounded-xl bg-[#3E4F30] text-[#F5EEDC] hover:brightness-110 active:scale-95 transition-all shadow-sm"
                  aria-label="Keranjang Belanja"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#B4532A] text-white text-[10px] font-bold shadow-xs">
                      {totalItemsCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              /* Belum Login: Nuansa Ramah Sunda "Ketuk Pintu" & "Mari Bertamu" */
              <div className="flex items-center gap-2">
                <Link
                  href="/auth?mode=login"
                  className="py-2 px-3.5 rounded-xl border border-[#3E4F30] text-[#3E4F30] text-xs font-bold hover:bg-[#3E4F30]/10 transition flex items-center gap-1.5"
                  title="Sudah jadi baraya? Ketuk pintu masuk"
                >
                  <span className="text-xs">🔑</span>
                  <span>Ketuk Pintu</span>
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="py-2 px-3.5 rounded-xl bg-[#B4532A] text-white text-xs font-bold hover:brightness-110 shadow-xs transition flex items-center gap-1.5"
                  title="Mari bertamu & dapatkan kartu baraya"
                >
                  <span className="text-xs">🏡</span>
                  <span>Mari Bertamu</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Table Selector Modal */}
      {isLoggedIn && (
        <TableSelectorModal
          isOpen={isTableModalOpen}
          onClose={() => setIsTableModalOpen(false)}
        />
      )}
    </>
  );
};
