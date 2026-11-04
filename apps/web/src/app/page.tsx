'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MENU_ITEMS, MOCK_VOUCHERS } from '../lib/catalogData';
import { TableSelectorModal } from '../components/TableSelectorModal';
import { BotramPlanner } from '../components/BotramPlanner';
import { DailySpin } from '../components/DailySpin';
import { SuratRinduModal } from '../components/SuratRinduModal';
import { PersibNobarBanner } from '../components/PersibNobarBanner';
import { KamusRasaModal } from '../components/KamusRasaModal';
import { TerasModal } from '../components/TerasModal';
import {
  Utensils,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Flame,
  Heart,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Coffee,
  Ticket,
  WhatsApp,
  Check,
  Plus
} from '../components/icons';

// ============================================================================
// 1. TAMPILAN BERANDA MEMBER (SETELAH MASUK)
// ============================================================================
function MemberDashboard({ customer }: { customer: any }) {
  const { totalItemsCount, subtotal, tableNumber, orderType, addItem } = useCart();
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isSuratModalOpen, setIsSuratModalOpen] = useState(false);
  const [isKamusModalOpen, setIsKamusModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 4 Menu Rekomendasi Pribadi Berdasarkan Preferensi Customer
  const recommendedItemIds = [30, 42, 10, 74]; // Nasi Goreng Upiwati, Lidah Sambel Hejo, Ulen Upi, Kopi Hitam
  const recommendedItems = MENU_ITEMS.filter((item) => recommendedItemIds.includes(item.id));

  const handleAddDirect = (item: any) => {
    addItem(item, {}, 1);
    setToastMessage(`✓ ${item.name} berhasil ditambahkan ke keranjang belanja!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-12 pb-16 text-[#2B2625]">
      {/* Toast Notifikasi Penambahan Item */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 py-3 px-5 rounded-2xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold shadow-xl border border-[#D4A24C]/60 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[#D4A24C]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PERSONALIZED MEMBER HERO BANNER */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#3E4F30] via-[#334227] to-[#25301D] text-[#F5EEDC] p-6 sm:p-10 lg:p-12 shadow-2xl border-2 border-[#D4A24C]/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A24C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#B4532A]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Sapaan Nama & Status Tier */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4A24C]/25 border border-[#D4A24C]/50 text-[#F5EEDC] text-xs font-bold tracking-wide">
              <span>👑</span>
              <span>MEMBER KELUARGA BUMI • TIER {customer.tier.toUpperCase()}</span>
            </div>

            <h1
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5EEDC] leading-[1.2]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Sampurasun, {customer.name}!
            </h1>

            <p className="text-sm sm:text-base text-[#E5EADF] leading-relaxed font-sans">
              Selamat datang kembali di rumah nenek. Seluruh menu prasmanan, kopi garut, dan traktiran poin sudah siap untuk hari istimewa Anda.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/menu"
                className="py-3 px-6 rounded-xl bg-[#B4532A] text-white font-bold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition flex items-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                <span>Pesan Menu Sekarang</span>
              </Link>
              <Link
                href="/member"
                className="py-3 px-5 rounded-xl bg-[#F5EEDC] text-[#2B2625] font-bold text-xs sm:text-sm shadow-md hover:bg-white active:scale-95 transition flex items-center gap-2"
              >
                <span>Kartu Member & QR</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Member Loyalty Mini Card Snapshot */}
          <div className="bg-[#FBF7EE] text-[#2B2625] p-6 rounded-3xl border-2 border-[#D4A24C] shadow-xl w-full md:w-80 flex-shrink-0 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DCC2] pb-3">
              <span className="text-xs font-bold text-[#634E3F] uppercase tracking-wider">
                Kartu Digital
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3E4F30] text-[#F5EEDC]">
                {customer.memberId || 'BU-MEMBER'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-[#634E3F] block">Saldo Poin Loyalitas:</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold text-[#3E4F30]">
                  {customer.pointsBalance}
                </span>
                <span className="text-xs font-bold text-[#D4A24C]">Poin Aktif</span>
              </div>
              <p className="text-[10px] text-[#8C7767]">
                Setiap transaksi Rp 10.000 bernilai 1 poin loyalitas di kasir.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E8DCC2] flex items-center justify-between text-xs font-semibold">
              <span className="text-[#634E3F]">Voucher Siap Pakai:</span>
              <span className="text-[#B4532A] font-bold">3 Voucher</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ORDERING STATUS & ACTIVE TABLE BAR */}
      <section className="bg-[#FBF7EE] p-5 sm:p-6 rounded-3xl border border-[#E8DCC2] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E4EADF] text-[#3E4F30] flex items-center justify-center flex-shrink-0 shadow-xs border border-[#3E4F30]/30">
            {orderType === 'dine_in' ? (
              <Utensils className="w-6 h-6" />
            ) : (
              <ShoppingBag className="w-6 h-6 text-[#B4532A]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#2B2625]">
                {orderType === 'dine_in' ? `Makan di Tempat — ${tableNumber}` : 'Bawa Pulang (Takeaway)'}
              </h2>
              <button
                type="button"
                onClick={() => setIsTableModalOpen(true)}
                className="text-[11px] font-bold text-[#B4532A] hover:underline"
              >
                (Ubah Meja / Layanan)
              </button>
            </div>
            <p className="text-xs text-[#634E3F] mt-0.5">
              {totalItemsCount > 0
                ? `${totalItemsCount} menu sudah ada di keranjang (Rp ${subtotal.toLocaleString('id-ID')})`
                : 'Keranjang belanja masih kosong. Siap memilih hidangan favorit?'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalItemsCount > 0 ? (
            <Link
              href="/cart"
              className="w-full md:w-auto py-2.5 px-5 rounded-xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold hover:brightness-110 shadow-sm flex items-center justify-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buka Keranjang ({totalItemsCount}) →</span>
            </Link>
          ) : (
            <Link
              href="/menu"
              className="w-full md:w-auto py-2.5 px-5 rounded-xl bg-[#B4532A] text-white text-xs font-bold hover:brightness-110 shadow-sm flex items-center justify-center gap-2 transition"
            >
              <span>Buka Buku Menu →</span>
            </Link>
          )}
        </div>
      </section>

      {/* 3. 4 QUICK ACTION SHORTCUTS FOR MEMBERS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Shortcut 1: Menu */}
        <Link
          href="/menu"
          className="p-5 rounded-3xl bg-[#FBF7EE] border border-[#E8DCC2] hover:border-[#3E4F30] hover:shadow-md transition-all group space-y-2 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#3E4F30]/10 text-[#3E4F30] flex items-center justify-center group-hover:bg-[#3E4F30] group-hover:text-white transition-colors">
            <Utensils className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#2B2625] group-hover:text-[#3E4F30]">
            Menu Masakan
          </h3>
          <p className="text-[11px] text-[#634E3F] leading-tight">
            Prasmanan, pepes, gorengan arang, dan seduhan rempah.
          </p>
        </Link>

        {/* Shortcut 2: Member Card */}
        <Link
          href="/member"
          className="p-5 rounded-3xl bg-[#FBF7EE] border border-[#E8DCC2] hover:border-[#D4A24C] hover:shadow-md transition-all group space-y-2 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#D4A24C]/20 text-[#B4532A] flex items-center justify-center group-hover:bg-[#D4A24C] group-hover:text-[#2B2625] transition-colors">
            <Ticket className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#2B2625] group-hover:text-[#B4532A]">
            Kartu Member & QR
          </h3>
          <p className="text-[11px] text-[#634E3F] leading-tight">
            Pindai QR di kasir untuk klaim poin dan diskon makan.
          </p>
        </Link>

        {/* Shortcut 3: Vouchers */}
        <Link
          href="/member"
          className="p-5 rounded-3xl bg-[#FBF7EE] border border-[#E8DCC2] hover:border-[#B4532A] hover:shadow-md transition-all group space-y-2 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#B4532A]/10 text-[#B4532A] flex items-center justify-center group-hover:bg-[#B4532A] group-hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#2B2625] group-hover:text-[#B4532A]">
            Dompet Voucher
          </h3>
          <p className="text-[11px] text-[#634E3F] leading-tight">
            3 voucher potongan harga aktif siap ditukarkan.
          </p>
        </Link>

        {/* Shortcut 4: Persib / Bale Nobar */}
        <Link
          href="/menu?category=cat-cemilan"
          className="p-5 rounded-3xl bg-[#FBF7EE] border border-[#E8DCC2] hover:border-[#3E4F30] hover:shadow-md transition-all group space-y-2 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#185324] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors">
            <Coffee className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#2B2625] group-hover:text-[#185324]">
            Cemilan & Kopi Nobar
          </h3>
          <p className="text-[11px] text-[#634E3F] leading-tight">
            Ulen upi, pisang bakar, & kopi garut untuk nobar Persib.
          </p>
        </Link>
      </section>

      {/* BANNER KHUSUS: PHOTOBOX VINTAGE & RENCANA PERNIKAHAN INTIMATE DI BUMI UPI */}
      <section className="bg-gradient-to-r from-[#2B3A21] via-[#3E4F30] to-[#1F2B17] text-[#F5EEDC] p-6 sm:p-8 rounded-[2rem] border-2 border-[#D4A24C]/60 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4A24C]/20 border border-[#D4A24C]/40 text-[#D4A24C] text-[11px] font-bold uppercase tracking-wider">
            <span>💍</span>
            <span>Intimate Wedding & Photobox Bumi Upi</span>
          </div>
          <h2
            className="font-serif text-xl sm:text-2xl font-bold leading-snug"
            style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
          >
            Pernikahan Impian & Spot Photobox Estetik di Rumah Nenek
          </h2>
          <p className="text-xs text-[#E0D4BA] leading-relaxed">
            Abadikan momen sakral dan kencan hangat di Jl. Cimanuk 312 Garut. Nikmati paket intimate wedding mulai Rp 14,5 Juta, prasmanan Dapur Nenek, serta fasilitas Photobox Vintage cetak instan!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full md:w-auto">
          <Link
            href="/photobooth"
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 transition text-center flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>📸 Coba Photobox Sekarang</span>
          </Link>
          <Link
            href="/wedding"
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#D4A24C] hover:bg-[#c2913e] text-[#2B2625] font-bold text-xs shadow-md transition text-center flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>Pricelist Wedding & Event →</span>
          </Link>
        </div>
      </section>

      {/* 4. POJOK HOKI & TRAKTIRAN HARIAN MEMBER */}
      <section>
        <DailySpin />
      </section>

      {/* 5. REKOMENDASI MENU KHUSUS PELANGGAN (PERSONALIZED MENU) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E8DCC2] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A24C] px-2.5 py-0.5 rounded bg-[#FDF7EE] border border-[#D4A24C]">
              ⭐ Menu Rekomendasi Khusus Anda
            </span>
            <h2
              className="font-serif text-2xl font-bold text-[#2B2625] mt-1.5"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Paling Pas dengan Selera Anda
            </h2>
            <p className="text-xs text-[#634E3F] mt-0.5">
              Dipilihkan dari aneka resep masakan dapur nenek yang paling sering dicari.
            </p>
          </div>
          <Link
            href="/menu"
            className="text-xs font-bold text-[#3E4F30] hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Menu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#FBF7EE] rounded-3xl border border-[#E8DCC2] p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#3E4F30] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E4EADF] text-[#3E4F30]">
                    {item.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#B4532A]">
                    Rp {item.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-[#2B2625]">
                  {item.name}
                </h3>
                <p className="text-xs text-[#634E3F] line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8DCC2]/60 mt-4 flex items-center justify-between gap-2">
                <span className="text-[10px] text-[#8C7767]">Dapur Arang Garut</span>
                <button
                  type="button"
                  onClick={() => handleAddDirect(item)}
                  className="py-1.5 px-3 rounded-xl bg-[#3E4F30] text-[#F5EEDC] hover:brightness-110 active:scale-95 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. VOUCHER TRAKTIRAN ANDA (ACTIVE VOUCHERS BANNER) */}
      <section className="bg-gradient-to-br from-[#FBF7EE] to-[#F5EEDC] p-6 sm:p-8 rounded-[2.5rem] border border-[#E8DCC2] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B4532A] px-2.5 py-0.5 rounded bg-[#FBE8E3] border border-[#B4532A]">
              🎟️ Dompet Voucher Aktif
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2625] mt-1">
              Voucher Traktiran untuk Kunjungan Hari Ini
            </h2>
          </div>
          <Link
            href="/member"
            className="text-xs font-bold text-[#B4532A] hover:underline flex items-center gap-1"
          >
            <span>Buka Semua di Kartu Member →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_VOUCHERS.map((v) => (
            <div
              key={v.id}
              className="p-4 rounded-2xl bg-white border border-[#D4A24C] shadow-xs space-y-2 relative overflow-hidden text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FDF7EE] text-[#B4532A] border border-[#D4A24C]">
                  {v.code}
                </span>
                <span className="text-[10px] font-bold text-[#3E4F30]">Siap Pakai</span>
              </div>
              <h4 className="font-bold text-xs text-[#2B2625]">{v.title}</h4>
              <p className="text-[11px] text-[#634E3F] leading-relaxed">{v.description}</p>
              <div className="pt-2 border-t border-[#E8DCC2] flex items-center justify-between text-[10px] text-[#8C7767]">
                <span>Min. Belanja: Rp {v.minSpend.toLocaleString('id-ID')}</span>
                <Link href="/menu" className="font-bold text-[#3E4F30] hover:underline">
                  Pakai di Menu →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. MODE NOBAR PERSIB BALE UTAMA */}
      <section>
        <PersibNobarBanner />
      </section>

      {/* 6B. CIRI KHAS SUNDA: SURAT RINDU & KAMUS RASA */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Surat Rindu Card */}
        <div className="p-6 rounded-[2rem] bg-[#FBF7EE] border-2 border-[#D4A24C] shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B4532A] px-2.5 py-0.5 rounded-full bg-[#FCE7DF] border border-[#B4532A]/30">
                💌 Pojok Nostalgia
              </span>
              <span className="text-2xl">👵🏼</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2B2625]">
              Pojok Surat Rindu untuk Nenek Upi
            </h3>
            <p className="text-xs text-[#634E3F] leading-relaxed">
              Titipkan sepucuk surat, curhat perantauan, kenangan masakan masa kecil, dan terima balasan doa restu serta kartu pos digital tempo doeloe ber-segel lilin resmi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSuratModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#B4532A] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-xs flex items-center justify-center gap-2"
          >
            <span>Tulis Surat & Baca Dinding Rindu →</span>
          </button>
        </div>

        {/* Kamus Rasa Card */}
        <div className="p-6 rounded-[2rem] bg-[#FBF7EE] border-2 border-[#3E4F30] shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E4F30] px-2.5 py-0.5 rounded-full bg-[#E4EADF] border border-[#3E4F30]/30">
                🌿 Ensiklopedi Kuliner Priangan
              </span>
              <span className="text-2xl">📖</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2B2625]">
              Kamus Rasa Dapur Nenek Garut
            </h3>
            <p className="text-xs text-[#634E3F] leading-relaxed">
              Kupas tuntas filosofi ulen bakar arang, sambel cibiuk, kecombrang, kopi Gunung Papandayan, dan rahasia tradisi botram liwet Sunda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsKamusModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-xs flex items-center justify-center gap-2"
          >
            <span>Buka Kamus Rasa & Filosofi Resep →</span>
          </button>
        </div>
      </section>

      {/* 7. KALKULATOR PAKET BOTRAM & LIWETAN KELUARGA */}
      <section>
        <BotramPlanner />
      </section>

      {/* Table Selector Modal */}
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />

      {/* Surat Rindu Modal */}
      <SuratRinduModal
        isOpen={isSuratModalOpen}
        onClose={() => setIsSuratModalOpen(false)}
      />

      {/* Kamus Rasa Modal */}
      <KamusRasaModal
        isOpen={isKamusModalOpen}
        onClose={() => setIsKamusModalOpen(false)}
      />
    </div>
  );
}

// ============================================================================
// 2. TAMPILAN BERANDA TAMU / GUEST (SEBELUM MASUK)
// ============================================================================
function GuestLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSuratModalOpen, setIsSuratModalOpen] = useState(false);
  const [isKamusModalOpen, setIsKamusModalOpen] = useState(false);
  const [isTerasModalOpen, setIsTerasModalOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Bagaimana cara mendaftar menjadi anggota Keluarga Bumi?',
      a: 'Sangat mudah! Cukup klik tombol "Mari Bertamu", masukkan nama dan nomor WhatsApp aktif Anda. Sistem akan menyiapkan kode verifikasi OTP 6 digit. Setelah terverifikasi, kartu digital Anda langsung aktif dengan bonus 50 Poin.'
    },
    {
      q: 'Apakah poin loyalitas Bumi Upi memiliki masa kedaluwarsa?',
      a: 'Poin loyalitas Anda aktif selama 12 bulan sejak transaksi terakhir. Setiap kali Anda mampir makan dan memindai kartu di kasir, masa aktif seluruh saldo poin Anda otomatis diperpanjang.'
    },
    {
      q: 'Bagaimana cara menukarkan voucher saat bertransaksi di kasir?',
      a: 'Buka menu "Kartu Member" di aplikasi ponsel Anda, pilih voucher yang ingin digunakan di tab Dompet Voucher, lalu tunjukkan kode unik atau QR voucher tersebut ke kasir saat memesan di kasir POS.'
    },
    {
      q: 'Apakah bisa melakukan reservasi meja untuk rombongan keluarga atau nobar?',
      a: 'Tentu bisa! Kami menyediakan area Bale Utama dan Lesehan yang nyaman untuk rombongan keluarga maupun nobar Persib. Silakan hubungi tim kami via WhatsApp reservasi.'
    },
    {
      q: 'Bagaimana jaminan keamanan nomor telepon dan data pribadi saya?',
      a: 'Data Anda dilindungi dengan standar keamanan tinggi dan Row Level Security (RLS). Nomor WhatsApp Anda hanya digunakan untuk pengiriman OTP verifikasi dan struk digital.'
    },
    {
      q: 'Apakah sistem ini terhubung dengan Telegram Bot Bumi Upi?',
      a: 'Ya! Bumi Upi memiliki bot resmi @BumiUpiBot. Setiap transaksi kasir akan mengirimkan struk berformat WIB lengkap dengan rincian poin masuk dan progres level tier Anda secara otomatis.'
    },
    {
      q: 'Bagaimana jika saya ingin berganti akun atau nomor telepon?',
      a: 'Anda dapat masuk ke menu Kartu Member, lalu pilih tab "👥 Login sebagai Pengguna Lain" untuk beralih instan antar akun demo atau menekan "Keluar Akun" untuk mendaftarkan nomor telepon baru.'
    }
  ];

  return (
    <div className="space-y-20 pb-16 text-[#2B2625]">
      {/* HERO SECTION ASIMETRIS EDITORIAL */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#3E4F30] via-[#334227] to-[#25301D] text-[#F5EEDC] p-6 sm:p-12 lg:p-16 shadow-2xl border-2 border-[#D4A24C]/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A24C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#B4532A]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4A24C]/25 border border-[#D4A24C]/50 text-[#F5EEDC] text-xs font-bold tracking-wide">
              <span>🏡</span>
              <span>RUMAH TAMAH PRIANGAN TIMUR • GARUT</span>
            </div>

            <h1
              className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F5EEDC] leading-[1.15] tracking-tight"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Sejauh apapun pergi, rumah tempatnya pulang.
            </h1>

            <p className="text-sm sm:text-base text-[#E5EADF] leading-relaxed max-w-xl font-sans">
              Selamat datang di Rumah Tamah Bumi Upi. Menikmati aneka resep masakan Sunda dan Nusantara bergaya prasmanan, seduhan rempah hangat, dan gorengan arang tempo doeloe dalam pelukan hangat rumah nenek di Garut.
            </p>

            <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 w-fit text-xs text-[#F5EEDC]">
              <Clock className="w-4 h-4 text-[#D4A24C]" />
              <span>Buka Setiap Hari: <strong>07.00 – 23.00 WIB</strong></span>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/auth?mode=register"
                className="py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-xl hover:brightness-110 active:scale-95 transition flex items-center gap-3 border border-[#D4A24C]/40 group"
                style={{ backgroundColor: '#B4532A' }}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🏡</span>
                <div className="text-left">
                  <span className="block leading-tight font-extrabold text-white text-xs sm:text-sm">Mari Mampir Bertamu</span>
                  <span className="text-[10px] text-[#FBE8E3] font-normal block">Dapatkan 50 Poin & Traktiran</span>
                </div>
              </Link>

              <Link
                href="/auth?mode=login"
                className="py-3 px-5 rounded-2xl bg-[#F5EEDC] text-[#2B2625] font-bold text-xs sm:text-sm shadow-md hover:bg-white active:scale-95 transition flex items-center gap-2.5 border border-[#D5C7B0] group"
              >
                <span className="text-xl group-hover:rotate-12 transition-transform">🔑</span>
                <div className="text-left">
                  <span className="block leading-tight font-extrabold text-[#2B2625] text-xs sm:text-sm">Pulang ke Rumah</span>
                  <span className="text-[10px] text-[#634E3F] font-normal block">Sudah Jadi Baraya? Masuk</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl bg-[#FBF7EE] p-5 shadow-2xl border-4 border-[#D4A24C]/40 text-[#2B2625] space-y-3.5">
              {/* Plang Kayu Jati Asli Bumi Upi 312 */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#50361F] via-[#6D492B] to-[#50361F] text-[#F5EEDC] border border-[#D4A24C] shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#D4A24C] text-sm">✤</span>
                  <span
                    className="font-serif text-sm font-bold tracking-wide text-white"
                    style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
                  >
                    bumi upi
                  </span>
                  <span className="text-[#D4A24C] text-sm">✤</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold tracking-widest text-[#FDF7EE] border border-white/30">
                  <span>NO.</span>
                  <span>312</span>
                </div>
              </div>

              {/* Foto Fasad Teras Asli */}
              <div
                onClick={() => setIsTerasModalOpen(true)}
                className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden bg-[#2B2625] border border-[#E8DCC2] shadow-inner group cursor-pointer"
                title="Klik untuk melihat detail sudut teras tempo doeloe"
              >
                <img
                  src="/brand/bumi-upi-teras.jpg"
                  alt="Rumah Tamah Bumi Upi Garut - Tampak Depan Jl. Cimanuk 312"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 bg-[#B4532A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow flex items-center gap-1.5">
                  <span>📍</span>
                  <span>Jl. Cimanuk 312, Garut</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-[#3E4F30]/90 backdrop-blur-xs text-[#F5EEDC] text-[10px] font-bold px-3 py-1.5 rounded-full shadow border border-[#D4A24C]/40 group-hover:bg-[#B4532A] transition-colors flex items-center gap-1.5">
                  <span>🔍</span>
                  <span>Jelajahi Sudut Teras</span>
                </div>
              </div>

              {/* Tag Ornamen Nostalgia Sesuai Foto Nyata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-semibold text-center">
                <span className="py-1 px-1.5 rounded-lg bg-[#E4EADF] text-[#3E4F30] border border-[#3E4F30]/20 truncate">🚲 Sepeda Onthel</span>
                <span className="py-1 px-1.5 rounded-lg bg-[#FCE7DF] text-[#B4532A] border border-[#B4532A]/20 truncate">🪑 Kursi Vintage</span>
                <span className="py-1 px-1.5 rounded-lg bg-[#EFE7D5] text-[#2B2625] border border-[#D5C7B0] truncate">🧱 Tegel Priangan</span>
                <span className="py-1 px-1.5 rounded-lg bg-[#E4EADF] text-[#3E4F30] border border-[#3E4F30]/20 truncate">🌿 Kusen Kolonial</span>
              </div>

              <div className="space-y-1 pt-1">
                <p
                  className="text-lg font-serif italic text-[#3E4F30]"
                  style={{ fontFamily: 'var(--font-caveat, "Caveat", cursive)' }}
                >
                  &quot;Haneut keneh, mangga cobian sangu liwet sareng sambel hejo dapur nenek.&quot;
                </p>
                <div className="flex items-center justify-between text-xs text-[#634E3F] pt-2 border-t border-[#E8DCC2]">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#B4532A]" />
                    Tarogong Kidul, Garut
                  </span>
                  <span className="font-bold text-[#3E4F30]">Dapur Tradisi Priangan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CERITA BUMI UPI */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#FBF7EE] p-8 sm:p-12 rounded-[2.5rem] border border-[#E8DCC2] shadow-sm">
        <div className="md:col-span-5 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B4532A] px-2.5 py-0.5 rounded bg-[#FDF7EE] border border-[#B4532A]">
            DAPUR NENEK & TRADISI GARUT
          </span>
          <h2
            className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2625] leading-snug"
            style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
          >
            Hangatnya Sambutan, Gurihnya Tradisi Priangan.
          </h2>
          <p className="text-xs sm:text-sm text-[#634E3F] leading-relaxed">
            Bumi Upi lahir dari kerinduan akan suasana rumah nenek: aroma nasi liwet kastrol yang baru matang di atas tungku arang, wangi daun kemangi pepes ayam kampung, dan cangkir kopi hitam Garut yang mengepul hangat.
          </p>
        </div>

        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E8DCC2] shadow-xs space-y-2">
            <span className="text-2xl">🥘</span>
            <h3 className="font-serif font-bold text-sm text-[#2B2625]">Prasmanan Bebas</h3>
            <p className="text-[11px] text-[#634E3F]">Pilih lauk sesuka hati, ditimbang dan digoreng dadakan saat Anda datang.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E8DCC2] shadow-xs space-y-2">
            <span className="text-2xl">🪵</span>
            <h3 className="font-serif font-bold text-sm text-[#2B2625]">Gorengan Arang</h3>
            <p className="text-[11px] text-[#634E3F]">Ulen ketan bakar arang, cireng rujak, dan pisang kepok legit khas dapur Sunda.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E8DCC2] shadow-xs space-y-2">
            <span className="text-2xl">☕</span>
            <h3 className="font-serif font-bold text-sm text-[#2B2625]">Kopi & Seduhan Rempah</h3>
            <p className="text-[11px] text-[#634E3F]">Kopi Garut lereng Gunung Papandayan, es cincau jadoel, dan bir kotjok Bogor.</p>
          </div>
        </div>
      </section>

      {/* NOBAR PERSIB BALE UTAMA (SHOWCASE MODE) */}
      <section>
        <PersibNobarBanner previewMode={true} />
      </section>

      {/* DUA CIRI KHAS SUNDA: SURAT RINDU & KAMUS RASA (SHOWCASE MODE) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Surat Rindu Card */}
        <div className="p-6 rounded-[2rem] bg-[#FBF7EE] border-2 border-[#D4A24C] shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B4532A] px-2.5 py-0.5 rounded-full bg-[#FCE7DF] border border-[#B4532A]/30">
                💌 Pojok Nostalgia
              </span>
              <span className="text-2xl">👵🏼</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2B2625]">
              Pojok Surat Rindu untuk Nenek Upi
            </h3>
            <p className="text-xs text-[#634E3F] leading-relaxed">
              Titipkan sepucuk surat rindu, curahan kenangan masakan masa kecil, dan terima balasan doa restu khas Priangan lengkap dengan kartu pos digital ber-segel lilin resmi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSuratModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#B4532A] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-xs flex items-center justify-center gap-2"
          >
            <span>Baca Dinding Surat Pengunjung →</span>
          </button>
        </div>

        {/* Kamus Rasa Card */}
        <div className="p-6 rounded-[2rem] bg-[#FBF7EE] border-2 border-[#3E4F30] shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E4F30] px-2.5 py-0.5 rounded-full bg-[#E4EADF] border border-[#3E4F30]/30">
                🌿 Ensiklopedi Kuliner Priangan
              </span>
              <span className="text-2xl">📖</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2B2625]">
              Kamus Rasa Dapur Nenek Garut
            </h3>
            <p className="text-xs text-[#634E3F] leading-relaxed">
              Kupas tuntas filosofi ulen bakar arang, sambel cibiuk, kecombrang hutan, kopi Papandayan, dan filosofi botram liwet Sunda tempo doeloe.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsKamusModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-xs flex items-center justify-center gap-2"
          >
            <span>Buka Kamus Rasa & Kisah Resep →</span>
          </button>
        </div>
      </section>

      {/* KALKULATOR PAKET BOTRAM & LIWETAN KELUARGA (SHOWCASE MODE) */}
      <section>
        <BotramPlanner previewMode={true} />
      </section>

      {/* POJOK HOKI & TRAKTIRAN HARIAN NENEK (SHOWCASE MODE) */}
      <section>
        <DailySpin previewMode={true} />
      </section>

      {/* Surat Rindu Modal */}
      <SuratRinduModal
        isOpen={isSuratModalOpen}
        onClose={() => setIsSuratModalOpen(false)}
        previewMode={true}
      />

      {/* Kamus Rasa Modal */}
      <KamusRasaModal
        isOpen={isKamusModalOpen}
        onClose={() => setIsKamusModalOpen(false)}
      />

      {/* Teras Heritage Modal */}
      <TerasModal
        isOpen={isTerasModalOpen}
        onClose={() => setIsTerasModalOpen(false)}
      />

      {/* LOYALTY CARD HIGHLIGHT */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#FDF7EE] border-2 border-[#D4A24C] p-8 sm:p-12 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E4F30] px-2.5 py-0.5 rounded bg-[#E4EADF] border border-[#3E4F30]">
              PROGRAM LOYALITAS KELUARGA BUMI
            </span>
            <h2
              className="font-serif text-2xl sm:text-4xl font-bold text-[#2B2625]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Setiap Kunjungan, Makin Dekat Seperti Keluarga.
            </h2>
            <p className="text-xs sm:text-sm text-[#634E3F] leading-relaxed">
              Daftarkan nomor WhatsApp Anda untuk mengumpulkan poin makan di kasir POS. Dapatkan traktiran es cincau, diskon nobar, dan voucher ulang tahun spesial.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/auth?mode=register"
                className="py-3 px-5 rounded-xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1.5"
              >
                <span>🌿</span>
                <span>Ambil Kartu Baraya Bumi</span>
              </Link>
              <Link
                href="/auth?mode=login"
                className="py-3 px-4 rounded-xl border border-[#D5C7B0] text-xs font-bold text-[#2B2625] hover:bg-white flex items-center gap-1.5"
              >
                <span>🔑</span>
                <span>Sudah Jadi Baraya? Ketuk Pintu</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#3E4F30] to-[#25301D] text-[#F5EEDC] border-2 border-[#D4A24C] shadow-2xl w-full max-w-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-lg">Bumi Upi</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4A24C] text-[#2B2625] font-bold">
                  Tier Keluarga
                </span>
              </div>
              <div className="py-2">
                <span className="text-[10px] text-[#D5C7B0] block">Kartu Anggota Digital</span>
                <span className="font-serif font-bold text-lg">Dimas Kurniawan</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
                <span>Saldo Poin</span>
                <span className="font-mono font-bold text-[#D4A24C] text-sm">142 Pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B4532A] px-2.5 py-0.5 rounded bg-[#FBE8E3] border border-[#B4532A]">
            TANYA JAWAB
          </span>
          <h2
            className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2625]"
            style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
          >
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#FBF7EE] border border-[#E8DCC2] overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-[#2B2625] hover:text-[#3E4F30]"
              >
                <span>{faq.q}</span>
                <span className="text-lg text-[#B4532A] flex-shrink-0">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#634E3F] leading-relaxed border-t border-[#E8DCC2]/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// 3. KOMPONEN UTAMA (MEMBEDAKAN TAMBAHAN BERANDA MEMBER VS GUEST)
// ============================================================================
export default function HomePage() {
  const { customer, isLoggedIn, isInitialized } = useAuth();

  // Selama inisialisasi localStorage, tampilkan kerangka ringan
  if (!isInitialized) {
    return (
      <div className="py-24 text-center text-xs text-[#634E3F]">
        Sedang memuat beranda Rumah Tamah Bumi Upi...
      </div>
    );
  }

  // JIKA SUDAH MASUK (LOGGED IN): Tampilkan Dasbor Beranda Khusus Member
  if (isLoggedIn && customer) {
    return <MemberDashboard customer={customer} />;
  }

  // JIKA BELUM MASUK (GUEST): Tampilkan Landing Page Editorial Pengenalan
  return <GuestLanding />;
}
