'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Utensils, User } from './icons';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { totalItemsCount } = useCart();
  const { isLoggedIn, customer } = useAuth();

  const navItems = [
    {
      href: '/',
      label: 'Beranda',
      icon: (active: boolean) => (
        <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`}>
          🏡
        </span>
      ),
      active: pathname === '/',
    },
    {
      href: '/menu',
      label: 'Menu',
      icon: (active: boolean) => (
        <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`}>
          🍲
        </span>
      ),
      active: pathname === '/menu',
    },
    {
      href: isLoggedIn ? '/photobooth' : '/auth?mode=login&redirect=/photobooth',
      label: 'Photobox',
      icon: (active: boolean) => (
        <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`}>
          📸
        </span>
      ),
      active: pathname === '/photobooth',
    },
    {
      href: '/cart',
      label: 'Keranjang',
      icon: (active: boolean) => (
        <div className="relative">
          <ShoppingBag className={`w-5 h-5 transition-transform ${active ? 'scale-110 text-[#B4532A]' : ''}`} />
          {totalItemsCount > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#B4532A] text-white text-[9px] font-bold shadow-xs">
              {totalItemsCount > 9 ? '9+' : totalItemsCount}
            </span>
          )}
        </div>
      ),
      active: pathname === '/cart',
    },
    {
      href: isLoggedIn ? '/member' : '/auth',
      label: isLoggedIn ? 'Member' : 'Masuk',
      icon: (active: boolean) => (
        <div className="relative">
          <User className={`w-5 h-5 transition-transform ${active ? 'scale-110 text-[#B4532A]' : ''}`} />
          {isLoggedIn && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-[#D4A24C]" />
          )}
        </div>
      ),
      active: pathname === '/member' || pathname === '/auth',
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Seluler"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F5EEDC]/95 backdrop-blur-md border-t border-[#E8DCC2] shadow-[0_-4px_16px_rgba(43,38,37,0.08)] px-2 py-1.5"
      style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.active;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all select-none active:scale-95 ${
                isActive
                  ? 'text-[#B4532A] font-extrabold'
                  : 'text-[#634E3F] hover:text-[#2B2625] font-medium'
              }`}
            >
              <div className="flex items-center justify-center h-6 mb-0.5">
                {item.icon(isActive)}
              </div>
              <span
                className={`text-[10px] leading-tight tracking-tight ${
                  isActive ? 'text-[#B4532A] font-bold' : 'text-[#634E3F]'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-3.5 h-1 rounded-full bg-[#B4532A] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
