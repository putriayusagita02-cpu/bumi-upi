import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/authContext';
import { AdminNavbar } from '../components/AdminNavbar';
import { AdminSidebar } from '../components/AdminSidebar';

export const metadata: Metadata = {
  title: 'Rumah Tamah Bumi Upi — Dashboard Admin & Kasir POS',
  description: 'Sistem Kasir POS Cepat, Live Kitchen Display System (KDS), RFM CRM Analytics, dan Integrasi Telegram Bot @BumiUpiBot Garut'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-krem text-kopi antialiased">
        <AuthProvider>
          <div className="flex min-h-screen">
            {/* Sidebar navigation */}
            <AdminSidebar />

            {/* Main view container */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <AdminNavbar />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 paper-pattern">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
