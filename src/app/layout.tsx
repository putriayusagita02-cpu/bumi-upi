import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bumi Upi — Rumah Tamah Garut (CRM)',
  description: 'Sejauh apapun pergi, rumah tempatnya pulang. Sistem CRM & Loyalitas Pelanggan Rumah Tamah Bumi Upi Garut.',
  manifest: '/manifest.json',
  themeColor: '#3E4F30',
  icons: {
    icon: '/brand/Logo_bumi_upi.svg',
    apple: '/brand/Logo_bumi_upi.svg'
  }
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
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body class="bg-krem text-cokelat min-h-screen antialiased selection:bg-terakota selection:text-white">
        {children}
      </body>
    </html>
  );
}
