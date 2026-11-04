import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-[#2B2625] text-[#F5EEDC] pt-12 pb-8 border-t-4 border-[#B4532A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#F5EEDC]/10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3E4F30] p-0.5 border border-[#D4A24C] overflow-hidden flex-shrink-0">
                <img src="/brand/Logo_bumi_upi.svg" alt="Bumi Upi" className="w-full h-full object-contain" />
              </div>
              <span
                className="font-serif text-xl font-bold tracking-tight text-[#F5EEDC]"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                Rumah Tamah Bumi Upi
              </span>
            </div>
            <p className="text-xs text-[#E0D4BA] leading-relaxed max-w-md">
              Kisah rasa dan kehangatan rumah nenek di Priangan Timur. Menyajikan aneka santapan dan seduhan otentik khas Garut dalam nuansa bale kayu yang teduh dan bersahaja.
            </p>
            <p
              className="text-sm text-[#D4A24C] italic font-serif"
              style={{ fontFamily: 'var(--font-caveat, "Caveat", cursive)' }}
            >
              &quot;Hatur nuhun parantos sumping, mugia sing genah tur betah.&quot;
            </p>
          </div>

          {/* Jam Operasional */}
          <div className="space-y-2">
            <h5 className="font-serif text-xs font-bold uppercase tracking-wider text-[#D4A24C]">
              Jam Operasional
            </h5>
            <div className="text-xs space-y-1 text-[#E0D4BA]">
              <p className="font-semibold text-white">Buka Setiap Hari</p>
              <p>Pukul 07:00 – 23:00 WIB</p>
              <p className="text-[11px] text-[#A4BC98] pt-1">
                Sarapan Pagi, Makan Siang & Santai Sore
              </p>
            </div>
          </div>

          {/* Lokasi & Kontak */}
          <div className="space-y-2">
            <h5 className="font-serif text-xs font-bold uppercase tracking-wider text-[#D4A24C]">
              Alamat & Bantuan
            </h5>
            <div className="text-xs space-y-1 text-[#E0D4BA]">
              <p className="font-medium text-white">Jl. Cimanuk No. 312</p>
              <p>(Depan Fave Hotel Garut), Jawa Barat</p>
              <p className="pt-1 text-[#D4A24C] font-mono">WhatsApp: 0895-4120-55152</p>
              <p className="text-[11px] text-[#A4BC98]">Instagram: @bumiupi</p>
            </div>
          </div>
        </div>

        {/* Academic CRM Disclaimer Box */}
        <div className="mt-6 p-3.5 rounded-xl bg-black/30 border border-white/10 text-[11px] text-[#A4BC98] leading-relaxed text-center sm:text-left">
          <p className="font-semibold text-white mb-0.5">⚠️ Catatan Penafian Akademik (Disclaimer):</p>
          <p>
            Aplikasi web ini adalah proyek studi kasus mata kuliah <strong>Customer Relationship Management (CRM)</strong>, <strong>BUKAN</strong> situs web atau aplikasi resmi komersial Rumah Tamah Bumi Upi. Seluruh data transaksi, pelanggan sintetis, dan kalkulasi skor RFM yang disajikan digunakan semata-mata untuk keperluan perancangan sistem dan evaluasi akademik.
          </p>
        </div>

        {/* Bottom Credits */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C7767] gap-3">
          <p>© 2026 Rumah Tamah Bumi Upi Garut — Sistem CRM & Pemesanan Mandiri.</p>
          <div className="flex items-center gap-4">
            <Link href="/menu" className="hover:text-[#F5EEDC] transition-colors">
              Katalog Menu
            </Link>
            <Link href="/member" className="hover:text-[#F5EEDC] transition-colors">
              Loyalitas Anggota
            </Link>
            <Link href="/auth" className="hover:text-[#F5EEDC] transition-colors">
              Login Tamu
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
