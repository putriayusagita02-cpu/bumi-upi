'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ChefHat,
  Users,
  UtensilsCrossed,
  ScrollText,
  KeyRound,
  TrendingUp,
  Receipt,
  Clock,
  Sparkles
} from 'lucide-react';
import { adminStore } from '../lib/adminStore';
import { useAuth } from '../lib/authContext';

export default function AdminHomePage() {
  const { user } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [kdsCount, setKdsCount] = useState(0);

  useEffect(() => {
    const updateMetrics = () => {
      const orders = adminStore.orders;
      setOrderCount(orders.length);
      const revenue = orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
      setTotalRevenue(revenue);
      const activeKds = orders.filter((o) => o.status === 'confirmed' || o.status === 'preparing');
      setKdsCount(activeKds.length);
    };

    updateMetrics();
    adminStore.syncLiveOrdersFromApi().then(updateMetrics);

    const interval = setInterval(async () => {
      await adminStore.syncLiveOrdersFromApi();
      updateMetrics();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-olive-800 to-olive-900 text-krem rounded-2xl p-6 shadow-md border border-olive-700 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mustard/20 border border-mustard/40 text-mustard-light text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem POS & CRM Terintegrasi Rumah Nenek Garut</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2 text-white">
            Wilujeng Sumping, {user ? user.name : 'Teh Upi'}!
          </h2>
          <p className="text-krem/80 text-sm leading-relaxed mb-4">
            Kelola transaksi kasir meja, pantau antrean pesanan dapur secara real-time, pantau 7 segmen loyalitas pelanggan (RFM), dan verifikasi struk otomatis via Telegram Bot @BumiUpiBot.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/pos"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-terakota hover:bg-terakota-light text-white font-semibold text-sm transition shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Buka Terminal POS Kasir</span>
            </Link>
            <Link
              href="/kitchen"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-krem text-olive-900 hover:bg-white font-semibold text-sm transition shadow-sm"
            >
              <ChefHat className="w-4 h-4 text-terakota" />
              <span>Lihat Antrean Dapur ({kdsCount} Pesanan)</span>
            </Link>
          </div>
        </div>

        {/* Decorative badge */}
        <div className="absolute right-4 bottom-4 opacity-10 text-9xl select-none pointer-events-none">
          🌿
        </div>
      </div>

      {/* Quick Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-krem-border shadow-xs">
          <div className="flex items-center justify-between text-kopi-muted text-xs font-medium mb-1">
            <span>Total Transaksi Sesi</span>
            <Receipt className="w-4 h-4 text-olive" />
          </div>
          <div className="font-serif text-2xl font-bold text-olive-900">
            {orderCount} Pesanan
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Termasuk sinkronisasi meja & takeaway
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-krem-border shadow-xs">
          <div className="flex items-center justify-between text-kopi-muted text-xs font-medium mb-1">
            <span>Total Omzet Terkumpul</span>
            <span className="text-terakota font-bold">Rp</span>
          </div>
          <div className="font-serif text-2xl font-bold text-kopi">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-kopi-muted mt-1">
            Metode: QRIS, Tunai, Kartu Debit
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-krem-border shadow-xs">
          <div className="flex items-center justify-between text-kopi-muted text-xs font-medium mb-1">
            <span>Pesanan Aktif Dapur (KDS)</span>
            <Clock className="w-4 h-4 text-mustard" />
          </div>
          <div className="font-serif text-2xl font-bold text-terakota">
            {kdsCount} Tiket
          </div>
          <p className="text-[11px] text-kopi-muted mt-1">
            Status Masuk & Sedang Dimasak
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-krem-border shadow-xs">
          <div className="flex items-center justify-between text-kopi-muted text-xs font-medium mb-1">
            <span>Basis Data Pelanggan</span>
            <Users className="w-4 h-4 text-olive" />
          </div>
          <div className="font-serif text-2xl font-bold text-olive-900">
            200 Member
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            7 Segmen Kuintil RFM Terkalkulasi
          </p>
        </div>
      </div>

      {/* Operational Modules Navigation Cards */}
      <div>
        <h3 className="font-serif text-lg font-bold text-olive-900 mb-3">
          Modul Operasional Restoran
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/pos"
            className="group bg-white p-5 rounded-2xl border border-krem-border hover:border-olive-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-olive-50 text-olive flex items-center justify-center mb-3 group-hover:bg-olive group-hover:text-white transition">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-kopi group-hover:text-olive transition">
                Terminal Kasir POS Cepat
              </h4>
              <p className="text-xs text-kopi-muted mt-1 leading-relaxed">
                Pemilihan meja cepat, katalog 105 menu Garut, kustomisasi varian suhu & porsi, scan member QR, dan cetak struk berformat WIB.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-krem-border flex items-center justify-between text-xs font-semibold text-olive">
              <span>Buka Terminal Kasir</span>
              <span className="text-terakota">→</span>
            </div>
          </Link>

          <Link
            href="/kitchen"
            className="group bg-white p-5 rounded-2xl border border-krem-border hover:border-olive-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition">
                <ChefHat className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-kopi group-hover:text-olive transition">
                Live Kitchen Display (KDS)
              </h4>
              <p className="text-xs text-kopi-muted mt-1 leading-relaxed">
                Papan kanban live antrean dapur 4 tahap: Masuk → Dimasak → Siap Diambil → Selesai dengan timer dan notifikasi suara.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-krem-border flex items-center justify-between text-xs font-semibold text-olive">
              <span>Buka Layar Dapur</span>
              <span className="text-terakota">→</span>
            </div>
          </Link>

          <Link
            href="/crm"
            className="group bg-white p-5 rounded-2xl border border-krem-border hover:border-olive-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-700 group-hover:text-white transition">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-kopi group-hover:text-olive transition">
                CRM Pelanggan & Analitik RFM
              </h4>
              <p className="text-xs text-kopi-muted mt-1 leading-relaxed">
                Segmentasi otomatis 7 kelompok pelanggan (Juara, Setia, Potensial, Butuh Perhatian, Hampir Lepas, Berisiko, Tertidur) & CLV.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-krem-border flex items-center justify-between text-xs font-semibold text-olive">
              <span>Analisis Loyalitas Pelanggan</span>
              <span className="text-terakota">→</span>
            </div>
          </Link>

          <Link
            href="/inventory"
            className="group bg-white p-5 rounded-2xl border border-krem-border hover:border-olive-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center mb-3 group-hover:bg-orange-600 group-hover:text-white transition">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-kopi group-hover:text-olive transition">
                Katalog Menu 105 & Stok
              </h4>
              <p className="text-xs text-kopi-muted mt-1 leading-relaxed">
                Pelacak status stok (Tersedia, Terbatas, Habis) untuk seluruh 105 menu dalam 16 kategori otentik MENU-REGULER.pdf.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-krem-border flex items-center justify-between text-xs font-semibold text-olive">
              <span>Kelola Stok Inventaris</span>
              <span className="text-terakota">→</span>
            </div>
          </Link>

          <Link
            href="/audit"
            className="group bg-white p-5 rounded-2xl border border-krem-border hover:border-olive-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
                <ScrollText className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-kopi group-hover:text-olive transition">
                Buku Besar Audit Log
              </h4>
              <p className="text-xs text-kopi-muted mt-1 leading-relaxed">
                Pencatatan kronologis aktivitas kasir, pemotongan stok otomatis, pemakaian voucher diskon, dan perubahan status operasional.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-krem-border flex items-center justify-between text-xs font-semibold text-olive">
              <span>Lihat Jejak Audit Sistem</span>
              <span className="text-terakota">→</span>
            </div>
          </Link>

          <Link
            href="/login"
            className="group bg-white p-5 rounded-2xl border border-krem-border hover:border-olive-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-kopi group-hover:text-olive transition">
                Demo Login & Akun Evaluator
              </h4>
              <p className="text-xs text-kopi-muted mt-1 leading-relaxed">
                Kredensial instan dengan tombol sekali klik: Admin (Putri Ayu Sagita), Kasir (Kang Asep), dan Pelanggan (Dimas Kurniawan).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-krem-border flex items-center justify-between text-xs font-semibold text-olive">
              <span>Ganti Akun Demo</span>
              <span className="text-terakota">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
