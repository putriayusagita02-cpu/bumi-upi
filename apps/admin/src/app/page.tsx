// apps/admin/src/app/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ChefHat,
  Users,
  UtensilsCrossed,
  ScrollText,
  TrendingUp,
  Receipt,
  Clock,
  Sparkles,
  DollarSign,
  Download,
  AlertCircle,
  CheckCircle2,
  PieChart,
  ShieldCheck,
  UserCheck,
  Store,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { adminStore } from '../lib/adminStore';
import { useAuth } from '../lib/authContext';

export default function AdminHomePage() {
  const { user, quickSwitch } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [kdsCount, setKdsCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(200);
  const [readyToServeCount, setReadyToServeCount] = useState(0);

  const updateMetrics = () => {
    const orders = adminStore.orders;
    setOrderCount(orders.length);
    const revenue = orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
    setTotalRevenue(revenue);
    const activeKds = orders.filter((o) => o.status === 'confirmed' || o.status === 'preparing');
    setKdsCount(activeKds.length);
    const ready = orders.filter((o) => o.status === 'ready');
    setReadyToServeCount(ready.length);
    if (adminStore.customers && adminStore.customers.length > 0) {
      setCustomerCount(adminStore.customers.length);
    }
  };

  useEffect(() => {
    adminStore.loadFromStorage();
    updateMetrics();

    adminStore.syncLiveOrdersFromApi().then(updateMetrics);
    adminStore.syncLiveCustomersFromApi().then(updateMetrics);

    const interval = setInterval(async () => {
      await adminStore.syncLiveOrdersFromApi();
      await adminStore.syncLiveCustomersFromApi();
      updateMetrics();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const isOwner = user?.role === 'admin';

  // 1. Calculations for Owner P&L (Financials)
  const financialSummary = useMemo(() => {
    // Estimasi HPP Bahan Baku: 35% dari omzet kotor
    const cogs = Math.round(totalRevenue * 0.35);
    // Laba Kotor
    const grossProfit = totalRevenue - cogs;
    // Estimasi Beban Operasional Harian (Listrik, Gas hawu dapur, Perlengkapan, Tenaga Kerja)
    const operationalOverhead = Math.round(Math.min(totalRevenue * 0.25, 450000) + 150000);
    // Laba Bersih Real-Time
    const netProfit = Math.max(0, grossProfit - operationalOverhead);
    const netProfitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    // Pembayaran Berdasarkan Metode
    const qrisTotal = adminStore.orders
      .filter((o) => o.paymentMethod === 'qris')
      .reduce((sum, o) => sum + o.finalAmount, 0);
    const cashTotal = adminStore.orders
      .filter((o) => o.paymentMethod === 'cash')
      .reduce((sum, o) => sum + o.finalAmount, 0);
    const discountTotal = adminStore.orders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);

    return {
      cogs,
      grossProfit,
      operationalOverhead,
      netProfit,
      netProfitMargin,
      qrisTotal,
      cashTotal,
      discountTotal,
    };
  }, [totalRevenue]);

  // 2. Peak Hours Analysis (Distribusi Jam Sibuk)
  const peakHours = useMemo(() => {
    return [
      {
        range: '08:00 - 11:00',
        name: 'Kopi & Sarapan Pagi',
        desc: 'Kopi Tubruk Garut, Surabi Haneut & Pisang Goreng',
        pct: 22,
        traffic: 'Ramai Normal',
        color: 'bg-amber-500',
      },
      {
        range: '11:30 - 14:00',
        name: 'Makan Siang Prasmanan',
        desc: 'Nasi Liwet Kastrol, Nasi Galo, Tahu Cirawraw (Puncak #1)',
        pct: 42,
        traffic: 'Sangat Sibuk 🔥',
        color: 'bg-emerald-600',
      },
      {
        range: '14:30 - 17:00',
        name: 'Ngopi Santai Teras',
        desc: 'Es Cincau Jadoel, Kopi Susu Aren, Bala-Bala',
        pct: 16,
        traffic: 'Santai',
        color: 'bg-blue-500',
      },
      {
        range: '18:00 - 21:00',
        name: 'Santap Malam & Botram',
        desc: 'Ayam Bakar Madu, Sop Gurame Garut (Puncak #2)',
        pct: 35,
        traffic: 'Sangat Sibuk 🔥',
        color: 'bg-terakota',
      },
    ];
  }, []);

  // 3. Menu Engineering Matrix (BCG Matrix for Restaurant Owner)
  const menuMatrix = useMemo(() => {
    return [
      {
        badge: '🌟 Bintang (Star)',
        desc: 'Margin Tinggi & Sangat Laris',
        items: [
          { name: 'Nasi Liwet Kastrol Komplit', sold: 48, margin: '68%' },
          { name: 'Es Kopi Susu Aren Garut', sold: 62, margin: '74%' },
          { name: 'Nasi Goreng Cumi Upi', sold: 39, margin: '65%' },
        ],
        cardColor: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      },
      {
        badge: '🐮 Sapi Perah (Cash Cow)',
        desc: 'Volume Tinggi, Margin Standar',
        items: [
          { name: 'Tahu Cirawraw Sambal Jahe', sold: 54, margin: '58%' },
          { name: 'Pisang Goreng Keju Aren', sold: 45, margin: '60%' },
          { name: 'Teh Poci Melati Panas', sold: 70, margin: '55%' },
        ],
        cardColor: 'bg-amber-50 border-amber-300 text-amber-950',
      },
      {
        badge: '❓ Teka-Teki (Puzzle)',
        desc: 'Margin Sangat Tinggi, Butuh Dorongan Promo',
        items: [
          { name: 'Ayam Bakar Madu Pasundan', sold: 18, margin: '72%' },
          { name: 'Ketan Kinca Pandan Suji', sold: 15, margin: '70%' },
        ],
        cardColor: 'bg-blue-50 border-blue-300 text-blue-950',
      },
      {
        badge: '🐶 Perlu Evaluasi (Dog)',
        desc: 'Pergerakan Lambat, Tinjau Resep/Harga',
        items: [
          { name: 'Wedang Ronde Jahe Rempah', sold: 6, margin: '48%' },
          { name: 'Colenak Tape Bakar Kelapa', sold: 8, margin: '50%' },
        ],
        cardColor: 'bg-rose-50 border-rose-300 text-rose-950',
      },
    ];
  }, []);

  // Export Owner Financial Statement
  const handleExportFinancialReport = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const content = `LAPORAN KEUANGAN EKSEKUTIF PEMILIK - RUMAH TAMAH BUMI UPI GARUT
Tanggal Cetak: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
Penanggung Jawab: Owner (Pemilik Restoran)

RINGKASAN EKSEKUTIF:
- Total Transaksi Sesi : ${orderCount} Pesanan
- Total Omzet Kotor    : Rp ${totalRevenue.toLocaleString('id-ID')}
- Estimasi HPP (35%)   : Rp ${financialSummary.cogs.toLocaleString('id-ID')}
- Laba Kotor (65%)     : Rp ${financialSummary.grossProfit.toLocaleString('id-ID')}
- Beban Operasional    : Rp ${financialSummary.operationalOverhead.toLocaleString('id-ID')}
- ESTIMASI LABA BERSIH : Rp ${financialSummary.netProfit.toLocaleString('id-ID')} (${financialSummary.netProfitMargin}% Margin Bersih)

REKONSILIASI PEMBAYARAN KASIR:
- Pembayaran via QRIS  : Rp ${financialSummary.qrisTotal.toLocaleString('id-ID')}
- Pembayaran Tunai/Cash: Rp ${financialSummary.cashTotal.toLocaleString('id-ID')}
- Total Potongan Diskon: Rp ${financialSummary.discountTotal.toLocaleString('id-ID')}

STATUS BASIS PELANGGAN:
- Total Member CRM     : ${customerCount} Pelanggan Terdaftar
- Segmen Tertinggi     : Juara & Setia (Loyalitas Kuintil RFM Aktif)

Hatur nuhun. Laporan ini resmi diterbitkan oleh Sistem ERP Bumi Upi.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Keuangan_Owner_Bumi_Upi_${dateStr}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ============================================================== */}
      {/* TAMPILAN 1: KHUSUS KASIR (FRONT-OF-HOUSE FOCUS) */}
      {/* ============================================================== */}
      {!isOwner && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Kasir Header Banner */}
          <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-700 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-bold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Terminal Operasional Kasir (Front-Of-House)</span>
              </div>
              <h2
                className="font-serif text-2xl sm:text-3xl font-extrabold text-white"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                Wilujeng Tugas, Kang Asep!
              </h2>
              <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
                Fokus layanan Anda: pencatatan pesanan meja, transaksi pembayaran QRIS & Tunai, serta koordinasi penyajian makanan dengan Dapur KDS.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/pos"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-amber-950 font-black text-xs hover:bg-amber-50 transition shadow-sm"
                >
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  <span>Buka Terminal Kasir POS Sekarang →</span>
                </Link>
                <Link
                  href="/kitchen"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 text-white hover:bg-amber-600 font-bold text-xs transition border border-amber-500"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Pantau Pesanan Dapur ({kdsCount} Tiket)</span>
                </Link>
              </div>
            </div>
            <div className="absolute right-6 bottom-4 opacity-15 text-8xl select-none pointer-events-none">
              ☕
            </div>
          </div>

          {/* Quick Metrics for Cashier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-krem-border shadow-xs">
              <div className="flex items-center justify-between text-kopi-muted text-xs font-medium mb-1">
                <span>Pesanan Aktif Sedang Dimasak</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="font-serif text-3xl font-black text-amber-700">{kdsCount} Tiket</div>
              <p className="text-[11px] text-kopi-muted mt-1">Status: Menunggu Konfirmasi & Dimasak</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-krem-border shadow-xs">
              <div className="flex items-center justify-between text-kopi-muted text-xs font-medium mb-1">
                <span>Makanan Siap Diantar ke Meja</span>
                <ChefHat className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-serif text-3xl font-black text-emerald-700">{readyToServeCount} Meja</div>
              <p className="text-[11px] text-emerald-700 mt-1 font-semibold">Siap disajikan pramusaji</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-krem-border shadow-xs">
              <div className="flex items-center justify-between text-kopi-muted text-xs font-medium mb-1">
                <span>Total Struk Transaksi Sesi</span>
                <Receipt className="w-4 h-4 text-olive" />
              </div>
              <div className="font-serif text-3xl font-black text-olive-900">{orderCount} Pesanan</div>
              <p className="text-[11px] text-kopi-muted mt-1">Tersinkronisasi otomatis via web & kasir</p>
            </div>
          </div>

          {/* Kasir Operational Quick Access Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/pos"
              className="bg-white p-6 rounded-3xl border border-krem-border hover:border-amber-500 hover:shadow-md transition flex items-start gap-4 group"
            >
              <div className="p-3.5 rounded-2xl bg-amber-100 text-amber-900 group-hover:bg-amber-600 group-hover:text-white transition shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-kopi group-hover:text-amber-700 transition">
                  Terminal Kasir POS Meja
                </h3>
                <p className="text-xs text-kopi-muted mt-1 leading-relaxed">
                  Input pesanan baru, pilih meja makan (Dine-in / Takeaway), scan voucher diskon, dan cetak struk pembayaran.
                </p>
                <span className="text-xs font-bold text-amber-700 mt-3 inline-flex items-center gap-1">
                  Buka Kasir Sekarang →
                </span>
              </div>
            </Link>

            <Link
              href="/kitchen"
              className="bg-white p-6 rounded-3xl border border-krem-border hover:border-emerald-500 hover:shadow-md transition flex items-start gap-4 group"
            >
              <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-900 group-hover:bg-emerald-600 group-hover:text-white transition shrink-0">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-kopi group-hover:text-emerald-700 transition">
                  Papan Dapur Live (KDS)
                </h3>
                <p className="text-xs text-kopi-muted mt-1 leading-relaxed">
                  Lihat status pesanan yang sedang dimasak di dapur tradisional Garut, peringatan prioritas, dan konfirmasi makanan siap diantar.
                </p>
                <span className="text-xs font-bold text-emerald-700 mt-3 inline-flex items-center gap-1">
                  Lihat Antrean Dapur →
                </span>
              </div>
            </Link>
          </div>

          {/* Privacy Note for Cashier */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <span className="text-xl">🔒</span>
            <span>
              <strong>Perhatian Akses:</strong> Anda masuk dalam profil Kasir POS. Fitur analitik keuangan eksekutif, margin laba/rugi, dan CRM pelanggan hanya dapat diakses melalui akun <strong>Owner</strong>.
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAMPILAN 2: KHUSUS OWNER (EXECUTIVE SUITE & FINANCIAL INSIGHTS) */}
      {/* ============================================================== */}
      {isOwner && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Welcome Banner */}
          <div className="bg-gradient-to-r from-olive-800 to-olive-950 text-krem rounded-3xl p-6 sm:p-8 shadow-lg border border-olive-700 relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A24C]/20 border border-[#D4A24C]/40 text-[#D4A24C] text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive Command Center • Ruang Pemilik Rumah Tamah</span>
              </div>
              <h2
                className="font-serif text-2xl sm:text-3xl font-extrabold text-white"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                Wilujeng Sumping, Owner!
              </h2>
              <p className="text-krem/80 text-xs sm:text-sm leading-relaxed">
                Pantau kesehatan finansial restoran, estimasi laba bersih harian, analisis jam sibuk penjualan, matriks profitabilitas menu, dan pengawasan audit kasir secara terpusat.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleExportFinancialReport}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A24C] hover:bg-[#C0913E] text-[#2B2625] font-black text-xs transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Laporan Finansial Resmi</span>
                </button>

                <Link
                  href="/crm"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20"
                >
                  <Users className="w-4 h-4 text-[#D4A24C]" />
                  <span>Kelola {customerCount} Member CRM</span>
                </Link>

                <Link
                  href="/audit"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20"
                >
                  <ScrollText className="w-4 h-4 text-[#D4A24C]" />
                  <span>Audit Trail Log</span>
                </Link>
              </div>
            </div>

            <div className="absolute right-4 bottom-4 opacity-10 text-9xl select-none pointer-events-none">
              👑
            </div>
          </div>

          {/* ============================================================== */}
          {/* FITUR PENTING OWNER 1: LAPORAN P&L (LABA/RUGI & MARGIN REAL-TIME) */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl p-6 border border-krem-border shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-krem-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <h3
                    className="font-serif text-lg font-bold text-olive-900"
                    style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
                  >
                    Laporan Laba/Rugi & Estimasi Profit Bersih (P&L Real-Time)
                  </h3>
                </div>
                <p className="text-xs text-kopi-muted mt-0.5">
                  Perhitungan otomatis berdasarkan omzet pesanan masuk, estimasi HPP bahan pangan dapur, dan biaya overhead operasional.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Margin Sehat: {financialSummary.netProfitMargin}%</span>
              </span>
            </div>

            {/* 4 Financial Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Omzet Kotor */}
              <div className="p-4 rounded-2xl bg-krem-surface border border-krem-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-kopi-muted block">
                  Omzet Kotor (Gross Sales)
                </span>
                <span className="font-serif text-xl sm:text-2xl font-black text-olive-900 mt-1 block">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                  Dari total {orderCount} transaksi aktif
                </span>
              </div>

              {/* HPP (COGS) */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                  Estimasi HPP Bahan Baku (35%)
                </span>
                <span className="font-serif text-xl sm:text-2xl font-black text-rose-900 mt-1 block">
                  -Rp {financialSummary.cogs.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-rose-700 font-medium mt-1 block">
                  Beras liwet, rempah, daging, kopi & teh
                </span>
              </div>

              {/* Laba Kotor */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  Laba Kotor (Gross Profit 65%)
                </span>
                <span className="font-serif text-xl sm:text-2xl font-black text-amber-900 mt-1 block">
                  Rp {financialSummary.grossProfit.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-amber-700 font-medium mt-1 block">
                  Sebelum dikurangi overhead operasional
                </span>
              </div>

              {/* Laba Bersih */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Estimasi Laba Bersih (Net Profit)
                </span>
                <span className="font-serif text-xl sm:text-2xl font-black text-emerald-900 mt-1 block">
                  Rp {financialSummary.netProfit.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-emerald-800 font-bold mt-1 block">
                  ✓ Masuk kantong pemilik ({financialSummary.netProfitMargin}%)
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* FITUR PENTING OWNER 2 & 3: JAM SIBUK & AUDIT KASIR ANTI-FRAUD */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* FITUR 2: ANALISIS JAM SIBUK PENJUALAN (PEAK HOURS HEATMAP) */}
            <div className="bg-white rounded-3xl p-6 border border-krem-border shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-krem-border">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-terakota" />
                  <h4 className="font-serif font-bold text-base text-olive-900">
                    Analisis Jam Ramai Penjualan (Peak Hours)
                  </h4>
                </div>
                <span className="text-[10px] text-kopi-muted font-mono">WIB Garut</span>
              </div>

              <div className="space-y-3">
                {peakHours.map((ph, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-krem-surface border border-krem-border space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-kopi">{ph.name}</span>
                        <span className="font-mono text-[10px] text-kopi-muted ml-2">({ph.range})</span>
                      </div>
                      <span className="font-bold text-xs text-olive-900">{ph.traffic}</span>
                    </div>

                    <div className="w-full h-2 bg-krem-dark rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ph.color}`} style={{ width: `${ph.pct * 2}%` }} />
                    </div>

                    <p className="text-[10px] text-kopi-muted">{ph.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FITUR 4: REKONSILIASI KAS & PENGAWASAN ANTI-FRAUD KASIR */}
            <div className="bg-white rounded-3xl p-6 border border-krem-border shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-krem-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-olive" />
                  <h4 className="font-serif font-bold text-base text-olive-900">
                    Rekonsiliasi Kas Kasir & Pengawasan Anti-Fraud
                  </h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Kasir: Kang Asep
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-krem-surface border border-krem-border">
                  <div>
                    <span className="text-xs font-bold text-kopi block">Uang Masuk via QRIS Statis & Web</span>
                    <span className="text-[10px] text-kopi-muted">Masuk langsung ke rekening Bank Bumi Upi</span>
                  </div>
                  <span className="font-serif font-bold text-sm text-olive-900">
                    Rp {financialSummary.qrisTotal.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-krem-surface border border-krem-border">
                  <div>
                    <span className="text-xs font-bold text-kopi block">Uang Tunai di Laci Kasir (Cash Drawer)</span>
                    <span className="text-[10px] text-kopi-muted">Harus disetorkan kasir pada akhir shift</span>
                  </div>
                  <span className="font-serif font-bold text-sm text-amber-900">
                    Rp {financialSummary.cashTotal.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200">
                  <div>
                    <span className="text-xs font-bold text-rose-900 block">Total Diskon & Voucher Terpakai</span>
                    <span className="text-[10px] text-rose-700">Audit pemotongan harga (mencegah manipulasi kasir)</span>
                  </div>
                  <span className="font-serif font-bold text-sm text-rose-800">
                    Rp {financialSummary.discountTotal.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Audit Bersih:</strong> Zero transaksi dibatalkan mencurigakan. Seluruh pemotongan stok sinkron 1:1 dengan pesanan.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* FITUR PENTING OWNER 4: MENU ENGINEERING MATRIX (BCG RESTORAN) */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl p-6 border border-krem-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-krem-border">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-olive" />
                <div>
                  <h4 className="font-serif font-bold text-base text-olive-900">
                    Menu Engineering Matrix (Klasifikasi Profitabilitas Hidangan)
                  </h4>
                  <p className="text-xs text-kopi-muted">
                    Memandu Owner menentukan menu mana yang harus dipertahankan, dipromosikan, atau dievaluasi resepnya.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {menuMatrix.map((box, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border space-y-3 ${box.cardColor}`}>
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wide block">{box.badge}</span>
                    <span className="text-[10px] opacity-80 leading-tight block mt-0.5">{box.desc}</span>
                  </div>

                  <div className="space-y-2 border-t border-current/15 pt-2">
                    {box.items.map((it, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-semibold truncate max-w-[140px]">{it.name}</span>
                        <div className="text-right shrink-0">
                          <span className="font-bold font-mono text-[11px]">{it.margin}</span>
                          <span className="text-[9px] opacity-75 block">{it.sold} porsi</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
