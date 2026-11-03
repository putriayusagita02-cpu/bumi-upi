import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/authContext';
import { AdminLayoutShell } from '../components/AdminLayoutShell';

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
          <AdminLayoutShell>{children}</AdminLayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
