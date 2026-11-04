import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import { Navbar } from '../components/Navbar';
import { MobileNav } from '../components/MobileNav';
import { Footer } from '../components/Footer';
import { UpiChatDrawer } from '../components/UpiChatDrawer';
import { OtpHelperToastContainer } from '../components/OtpHelperToastContainer';
import { AsmrAmbientPlayer } from '../components/AsmrAmbientPlayer';

export const metadata: Metadata = {
  title: 'Rumah Tamah Bumi Upi — F&B & Ordering Garut Heritage',
  description:
    'Portal Pemesanan Mandiri & Program Loyalitas Anggota Rumah Tamah Bumi Upi, Garut, Jawa Barat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#F5EEDC] text-[#2B2625] min-h-screen flex flex-col font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
            {children}
          </main>
          <Footer />
          <MobileNav />
          <UpiChatDrawer />
          <AsmrAmbientPlayer />
          <OtpHelperToastContainer />
        </Providers>
      </body>
    </html>
  );
}
