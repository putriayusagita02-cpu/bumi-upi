'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';
import { MobileBottomNav } from './MobileBottomNav';

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-krem text-kopi">
      {/* Sidebar navigation (Desktop persistent + Mobile drawer) */}
      <AdminSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main view container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6 paper-pattern">
          {children}
        </main>
      </div>

      {/* Fixed bottom navigation on mobile phones */}
      <MobileBottomNav />
    </div>
  );
}
