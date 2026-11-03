'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { MOCK_VOUCHERS } from '../../lib/catalogData';
import { MemberCard } from '../../components/ui/MemberCard';
import { SuratRinduModal } from '../../components/SuratRinduModal';
import { Ticket, Clock, CheckCircle2, ShoppingBag, ArrowRight, User } from '../../components/icons';

export default function MemberPage() {
  const { customer, isLoggedIn, logout, updateProfile, switchCustomer, demoUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<'vouchers' | 'history' | 'profile' | 'switch'>('vouchers');
  const [isSuratModalOpen, setIsSuratModalOpen] = useState(false);

  // Form states for profile editing
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [favoritePreferences, setFavoritePreferences] = useState('');
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);
  const [switchSuccessMsg, setSwitchSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setBirthDate(customer.birthDate || '1995-10-15');
      setFavoritePreferences(customer.favoritePreferences || 'Nasi Goreng Kecombrang, Es Cincau Jadoel, Suka Pedas Sedang');
    }
  }, [customer]);

  // Jika pengunjung belum login, tampilkan layar masuk ramah
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#FBF7EE] border border-[#E8DCC2] shadow-md text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#3E4F30] p-2 border border-[#D4A24C] shadow-sm flex items-center justify-center">
          <img src="/brand/Logo_bumi_upi.svg" alt="Bumi Upi" className="w-full h-full object-contain" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A24C] px-2 py-0.5 rounded bg-[#FDF7EE] border border-[#D4A24C]">
            👑 Area Khusus Member
          </span>
          <h2 className="font-serif text-xl font-bold text-[#2B2625] pt-1">
            Kartu Member Digital Bumi Upi
          </h2>
          <p className="text-xs text-[#634E3F] leading-relaxed">
            Silakan masuk atau daftarkan nomor WhatsApp Anda untuk melihat kartu member digital, mengecek saldo poin, dan menukarkan voucher traktiran.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/auth"
            className="w-full py-3 px-4 rounded-xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold shadow-md hover:brightness-110 transition active:scale-95"
          >
            Masuk / Daftar via WhatsApp OTP →
          </Link>
          <Link
            href="/"
            className="text-xs text-[#634E3F] hover:underline pt-1"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    const success = updateProfile({
      name,
      email,
      phone,
      birthDate,
      favoritePreferences,
    });
    if (success) {
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 4000);
    }
  };

  // Dynamic transaction history state
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      let serverOrders: any[] = [];
      try {
        const res = await fetch(`/api/orders?customerId=${customer?.id || ''}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          serverOrders = data.orders;
        }
      } catch (e) {
        console.warn('Failed to fetch history from server', e);
      }

      // Ambil juga pesanan tersimpan di browser localStorage agar transaksi terkini langsung tampil
      let localOrders: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('bumi_upi_client_orders');
          if (raw) localOrders = JSON.parse(raw);
        } catch {}
      }

      const mergedMap = new Map();
      for (const ord of serverOrders) {
        mergedMap.set(ord.id, ord);
      }
      for (const ord of localOrders) {
        if (!mergedMap.has(ord.id)) {
          mergedMap.set(ord.id, ord);
        } else {
          // Gunakan status terbaru dari lokal jika ada pembaruan simulasi
          const prev = mergedMap.get(ord.id);
          mergedMap.set(ord.id, { ...prev, ...ord });
        }
      }

      const list = Array.from(mergedMap.values()).sort(
        (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      setHistoryOrders(list);
    } catch (e) {
      console.warn('Failed to compile history', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Auto-refresh riwayat setiap 5 detik agar otomatis terbarui saat status berubah
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [customer?.id, activeTab]);

  const vouchers = MOCK_VOUCHERS;

  // Fallback initial transaction history
  const history = [
    {
      id: 'tx-001',
      date: '28 Oktober 2026',
      items: 'Nasi Goreng Kecombrang, Es Cincau Jadoel (L)',
      amount: 43000,
      points: 4,
    },
    {
      id: 'tx-002',
      date: '20 Oktober 2026',
      items: 'Lidah Sambel Hejo, Kopi Susu Santan, Ulen Upi',
      amount: 92000,
      points: 9,
    },
    {
      id: 'tx-003',
      date: '12 Oktober 2026',
      items: 'Pepes Ayam Kampung, Teh Lemon (Panas)',
      amount: 68000,
      points: 6,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {switchSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <span>✅ {switchSuccessMsg}</span>
          <button onClick={() => setSwitchSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DCC2]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A24C] px-2 py-0.5 rounded bg-[#FDF7EE] border border-[#D4A24C]">
            👑 Program Loyalitas Keluarga Bumi
          </span>
          <h1
            className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2625] mt-1"
            style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
          >
            Kartu Member Digital
          </h1>
          <p className="text-xs text-[#634E3F]">
            Pindai kartu ini di meja kasir POS untuk mengumpulkan poin dan menukarkan voucher istimewa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSuratModalOpen(true)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#B4532A] text-[#B4532A] font-semibold hover:bg-[#B4532A]/10 transition flex items-center gap-1.5"
          >
            <span>💌</span>
            <span>Surat Rindu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#3E4F30] text-[#3E4F30] font-semibold hover:bg-[#3E4F30]/10 transition"
          >
            🔄 Ganti Pengguna
          </button>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={logout}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#B4532A]/10 text-[#B4532A] font-semibold hover:bg-[#B4532A]/20 transition"
            >
              Keluar Akun
            </button>
          ) : (
            <Link
              href="/auth"
              className="py-1.5 px-4 rounded-lg bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold hover:brightness-110"
            >
              Masuk Anggota
            </Link>
          )}
        </div>
      </div>

      {/* Digital Member Card Showcase */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-[#FBF7EE] p-6 sm:p-8 rounded-[2rem] border border-[#E8DCC2] shadow-sm">
        <div className="w-full md:w-auto flex justify-center">
          <MemberCard
            name={customer?.name || 'Tamu Setia'}
            memberId={customer?.memberId || 'BUMI-CUST-8899'}
            phone={customer?.phone || '0812-3456-7890'}
            tier={customer?.tier || 'Sahabat'}
            points={customer?.pointsBalance ?? 142}
            className="shadow-2xl"
          />
        </div>

        {/* Tier Benefits & Rules Box */}
        <div className="flex-1 space-y-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#2B2625]">
                Tingkatan Keanggotaan: {customer?.tier || 'Sahabat'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="text-xs font-bold text-[#B4532A] hover:underline"
              >
                ✏️ Ubah Profil Saya
              </button>
            </div>
            <p className="text-[#634E3F] leading-relaxed">
              Aturan Poin Bumi Upi: Setiap transaksi <strong>Rp 10.000 bernilai 1 Poin</strong>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div
              className={`p-2.5 rounded-xl border ${
                customer?.tier === 'Tamu'
                  ? 'border-[#3E4F30] bg-[#E4EADF] font-bold text-[#3E4F30]'
                  : 'border-[#E8DCC2] bg-white text-[#634E3F]'
              }`}
            >
              <p className="font-serif text-xs font-bold">Tamu</p>
              <p className="text-[10px]">0 - 99 poin</p>
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                customer?.tier === 'Sahabat'
                  ? 'border-[#B4532A] bg-[#FCE7DF] font-bold text-[#B4532A]'
                  : 'border-[#E8DCC2] bg-white text-[#634E3F]'
              }`}
            >
              <p className="font-serif text-xs font-bold">Sahabat</p>
              <p className="text-[10px]">100 - 299 poin</p>
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                customer?.tier === 'Keluarga'
                  ? 'border-[#D4A24C] bg-[#FDF7EE] font-bold text-[#946618]'
                  : 'border-[#E8DCC2] bg-white text-[#634E3F]'
              }`}
            >
              <p className="font-serif text-xs font-bold">Keluarga</p>
              <p className="text-[10px]">≥ 300 poin</p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/menu"
              className="py-2.5 px-4 rounded-xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold shadow-xs hover:brightness-110"
            >
              Pesan Menu Sekarang
            </Link>
            <Link
              href="/cart"
              className="py-2.5 px-4 rounded-xl border border-[#B4532A] text-[#B4532A] text-xs font-bold hover:bg-[#FCE7DF]"
            >
              Cek Keranjang
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="space-y-6">
        <div className="flex border-b border-[#E8DCC2] gap-4 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('vouchers')}
            className={`pb-3 text-xs font-bold tracking-wide whitespace-nowrap transition-colors ${
              activeTab === 'vouchers'
                ? 'border-b-2 border-[#B4532A] text-[#B4532A]'
                : 'text-[#634E3F] hover:text-[#2B2625]'
            }`}
          >
            Dompet Voucher ({vouchers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-bold tracking-wide whitespace-nowrap transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-[#B4532A] text-[#B4532A]'
                : 'text-[#634E3F] hover:text-[#2B2625]'
            }`}
          >
            Riwayat Poin & Transaksi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs font-bold tracking-wide whitespace-nowrap transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-[#B4532A] text-[#B4532A]'
                : 'text-[#634E3F] hover:text-[#2B2625]'
            }`}
          >
            ✏️ Ubah Profil Saya
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`pb-3 text-xs font-bold tracking-wide whitespace-nowrap transition-colors ${
              activeTab === 'switch'
                ? 'border-b-2 border-[#B4532A] text-[#B4532A]'
                : 'text-[#634E3F] hover:text-[#2B2625]'
            }`}
          >
            👥 Login sebagai Pengguna Lain
          </button>
        </div>

        {/* Tab 1: Vouchers */}
        {activeTab === 'vouchers' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vouchers.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-[#FBF7EE] border-2 border-dashed border-[#D4A24C] shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#D4A24C] text-[#2B2625]">
                      {v.code}
                    </span>
                    <span className="text-[10px] text-[#8C7767]">
                      Exp: {new Date(v.expiresAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-[#2B2625] pt-1">
                    {v.title}
                  </h4>
                  <p className="text-[11px] text-[#634E3F] leading-relaxed">
                    {v.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8DCC2]/60 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#3E4F30]">
                    Min. belanja Rp {v.minSpend.toLocaleString('id-ID')}
                  </span>
                  <Link
                    href="/cart"
                    className="text-[11px] font-bold text-[#B4532A] hover:underline"
                  >
                    Pakai →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: History */}
        {activeTab === 'history' && (
          <div className="bg-[#FBF7EE] border border-[#E8DCC2] rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-3 bg-[#EFE7D5]/70 border-b border-[#E8DCC2] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#634E3F]">
                Total: {historyOrders.length > 0 ? historyOrders.length : history.length} Transaksi Tercatat
              </span>
              <button
                type="button"
                onClick={fetchHistory}
                disabled={historyLoading}
                className="text-[11px] font-bold text-[#B4532A] hover:underline flex items-center gap-1"
              >
                <span>🔄</span>
                <span>{historyLoading ? 'Memuat...' : 'Segarkan Riwayat'}</span>
              </button>
            </div>

            <div className="divide-y divide-[#E8DCC2]/60">
              {historyOrders.length > 0 ? (
                historyOrders.map((ord) => {
                  const itemsSummary = Array.isArray(ord.items)
                    ? ord.items.map((it: any) => `${it.quantity}x ${it.itemName || it.name}`).join(', ')
                    : 'Pesanan Meja';
                  const dateStr = ord.createdAt
                    ? new Date(ord.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) + ' WIB'
                    : 'Baru saja';

                  const statusBadge: Record<string, { label: string; color: string }> = {
                    confirmed: { label: 'Terkonfirmasi', color: 'bg-blue-100 text-blue-800' },
                    preparing: { label: 'Sedang Dimasak', color: 'bg-amber-100 text-amber-800' },
                    ready: { label: 'Siap Diantar', color: 'bg-emerald-100 text-emerald-800' },
                    completed: { label: 'Selesai', color: 'bg-[#E4EADF] text-[#3E4F30]' },
                  };
                  const currentBadge = statusBadge[ord.status] || { label: ord.status, color: 'bg-gray-100 text-gray-800' };

                  return (
                    <div
                      key={ord.id}
                      className="p-4 flex items-center justify-between text-xs hover:bg-[#F5EEDC]/40 transition-colors"
                    >
                      <div className="space-y-1 max-w-[65%]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[11px] text-[#3E4F30]">
                            {ord.orderNumber || ord.id}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${currentBadge.color}`}>
                            {currentBadge.label}
                          </span>
                        </div>
                        <p className="font-semibold text-[#2B2625] truncate">{itemsSummary}</p>
                        <p className="text-[10px] text-[#8C7767]">
                          {dateStr} • {ord.tableNumber || 'Meja'} • {ord.paymentMethod?.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-[#2B2625]">
                          Rp {(ord.finalAmount || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] font-bold text-[#3E4F30]">
                          +{ord.pointsEarned || 0} Poin
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                history.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 flex items-center justify-between text-xs hover:bg-[#F5EEDC]/40 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[#2B2625]">{tx.items}</p>
                      <p className="text-[11px] text-[#8C7767]">{tx.date} • Kasir Bale Garut</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-[#2B2625]">
                        Rp {tx.amount.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[11px] font-bold text-[#3E4F30]">+{tx.points} Poin</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Ubah Profil Saya */}
        {activeTab === 'profile' && (
          <div className="bg-[#FBF7EE] border border-[#E8DCC2] rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl">
            <div className="mb-6 pb-4 border-b border-[#E8DCC2]">
              <h3 className="font-serif text-lg font-bold text-[#2B2625]">
                Informasi & Preferensi Akun
              </h3>
              <p className="text-xs text-[#634E3F]">
                Perbarui data pribadi Anda untuk menerima voucher ulang tahun dan rekomendasi menu istimewa.
              </p>
            </div>

            {profileSavedMsg && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <span>✅</span>
                <span>Hatur nuhun! Profil Anda berhasil diperbarui dan tersimpan ke sistem.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2B2625] mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C7B0] bg-white text-xs text-[#2B2625] focus:outline-none focus:border-[#3E4F30] focus:ring-1 focus:ring-[#3E4F30]"
                  placeholder="Contoh: Dimas Kurniawan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B2625] mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C7B0] bg-white text-xs text-[#2B2625] focus:outline-none focus:border-[#3E4F30] focus:ring-1 focus:ring-[#3E4F30]"
                    placeholder="nama@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2B2625] mb-1">
                    Nomor WhatsApp (+62)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C7B0] bg-white text-xs text-[#2B2625] focus:outline-none focus:border-[#3E4F30] focus:ring-1 focus:ring-[#3E4F30]"
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2625] mb-1">
                  Tanggal Lahir (Untuk Voucher Ulang Tahun Spesial)
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C7B0] bg-white text-xs text-[#2B2625] focus:outline-none focus:border-[#3E4F30] focus:ring-1 focus:ring-[#3E4F30]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2625] mb-1">
                  Preferensi Menu & Catatan Selera
                </label>
                <textarea
                  rows={2}
                  value={favoritePreferences}
                  onChange={(e) => setFavoritePreferences(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C7B0] bg-white text-xs text-[#2B2625] focus:outline-none focus:border-[#3E4F30] focus:ring-1 focus:ring-[#3E4F30]"
                  placeholder="Contoh: Suka pedas, kopi manis legit, suka gorengan renyah..."
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold shadow-md hover:brightness-110 transition active:scale-95"
                >
                  Simpan Perubahan Profil
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('vouchers')}
                  className="px-4 py-2.5 rounded-xl border border-[#D5C7B0] text-[#634E3F] text-xs font-medium hover:bg-white transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Login sebagai Pengguna Lain */}
        {activeTab === 'switch' && (
          <div className="bg-[#FBF7EE] border border-[#E8DCC2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="pb-4 border-b border-[#E8DCC2]">
              <h3 className="font-serif text-lg font-bold text-[#2B2625]">
                Pilih Akun Pengguna / Pelanggan Lain
              </h3>
              <p className="text-xs text-[#634E3F]">
                Klik profil di bawah untuk beralih instan antar level keanggotaan, atau masuk dengan nomor baru.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {demoUsers.map((u) => {
                const isCurrent = customer?.id === u.id || customer?.phone === u.phone;
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      switchCustomer(u);
                      setSwitchSuccessMsg(`Berhasil beralih akun ke ${u.name} (Tier ${u.tier})!`);
                      setTimeout(() => setSwitchSuccessMsg(null), 4000);
                      setActiveTab('vouchers');
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-[#3E4F30] bg-[#E4EADF]/60 ring-2 ring-[#3E4F30]'
                        : 'border-[#E8DCC2] bg-white hover:border-[#B4532A] hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif font-bold text-sm text-[#2B2625]">
                        {u.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          u.tier === 'Keluarga'
                            ? 'bg-[#D4A24C] text-[#2B2625]'
                            : u.tier === 'Sahabat'
                            ? 'bg-[#B4532A] text-white'
                            : 'bg-[#3E4F30] text-[#F5EEDC]'
                        }`}
                      >
                        Tier {u.tier}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-[11px] text-[#634E3F]">
                      <p>📱 WhatsApp: <span className="font-mono font-semibold text-[#2B2625]">{u.phone}</span></p>
                      <p>⭐ Saldo: <span className="font-bold text-[#3E4F30]">{u.pointsBalance} Poin</span> (Member {u.memberId})</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#E8DCC2]/60 flex items-center justify-between text-[11px]">
                      <span className="text-[#8C7767] italic truncate">{u.favoritePreferences?.slice(0, 32)}...</span>
                      <span className="font-bold text-[#B4532A]">{isCurrent ? 'Aktif Saat Ini ✓' : 'Ganti ke Akun Ini →'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#E8DCC2] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#634E3F]">
                Ingin mendaftarkan nomor telepon baru lewat verifikasi WhatsApp OTP?
              </span>
              <Link
                href="/auth"
                className="py-2 px-4 rounded-xl bg-[#B4532A] text-white text-xs font-bold hover:brightness-110 shadow-xs"
              >
                Masuk / Daftar Nomor Baru →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Surat Rindu Modal */}
      <SuratRinduModal
        isOpen={isSuratModalOpen}
        onClose={() => setIsSuratModalOpen(false)}
      />
    </div>
  );
}
