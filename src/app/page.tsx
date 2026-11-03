'use client';

import React, { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // If opened via Next.js dev server, seamlessly render public SPA
    if (typeof window !== 'undefined' && !window.location.search.includes('no-redirect')) {
      window.location.href = '/index.html';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="bg-krem-surface p-8 rounded-2xl border border-krem-border shadow-warm max-w-md space-y-4">
        <img src="/brand/Logo_bumi_upi.svg" alt="Bumi Upi" className="h-14 mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-cokelat">Bumi Upi — Rumah Tamah Garut</h1>
        <p className="text-xs text-cokelat-muted">
          Sejauh apapun pergi, rumah tempatnya pulang. Sedang memuat sistem CRM...
        </p>
        <a href="/index.html" className="inline-block bg-terakota text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow hover:bg-terakota-hover transition">
          Buka Aplikasi Sekarang
        </a>
      </div>
    </div>
  );
}
