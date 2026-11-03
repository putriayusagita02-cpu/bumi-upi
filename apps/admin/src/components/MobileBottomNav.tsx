'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, ChefHat, Users, UtensilsCrossed, ScrollText } from 'lucide-react';
import { adminStore } from '../lib/adminStore';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [activeKdsCount, setActiveKdsCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const active = adminStore.orders.filter(
        (o) => o.status === 'confirmed' || o.status === 'preparing'
      );
      setActiveKdsCount(active.length);
    };

    updateCount();
    const interval = setInterval(updateCount, 3000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { name: 'POS', href: '/pos', icon: CreditCard },
    { name: 'Dapur', href: '/kitchen', icon: ChefHat, badge: activeKdsCount },
    { name: 'CRM', href: '/crm', icon: Users },
    { name: 'Stok', href: '/inventory', icon: UtensilsCrossed },
    { name: 'Log', href: '/audit', icon: ScrollText },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#25301D] text-[#F5EEDC] border-t border-[#D4A24C]/40 px-2 py-1.5 shadow-2xl flex items-center justify-around">
      {items.map((it) => {
        const isActive = pathname === it.href;
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'bg-[#B4532A] text-white font-bold shadow-sm scale-105'
                : 'text-[#E0D4BA] hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {it.badge !== undefined && it.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black rounded-full h-4 min-w-[1rem] px-1 flex items-center justify-center ring-2 ring-[#25301D] animate-pulse">
                  {it.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-sans">
              {it.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
