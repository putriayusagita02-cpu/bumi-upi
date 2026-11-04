'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  HeartHandshake,
  AlertTriangle,
  Moon,
  Sparkles,
  Send,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { INITIAL_CUSTOMERS, CustomerProfile, RfmSegment, SEGMENT_DEFINITIONS } from '../../lib/crmData';
import { adminStore } from '../../lib/adminStore';

const ALL_SEGMENTS: RfmSegment[] = [
  'Juara',
  'Setia',
  'Potensial',
  'Butuh Perhatian',
  'Hampir Lepas',
  'Berisiko',
  'Tertidur'
];

export default function CrmPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'monetary' | 'recency' | 'frequency' | 'points' | 'clv'>('monetary');

  useEffect(() => {
    adminStore.loadFromStorage();
    if (adminStore.customers && adminStore.customers.length > 0) {
      setCustomers([...adminStore.customers]);
    }

    const fetchCustomers = async () => {
      try {
        await adminStore.syncLiveCustomersFromApi();
        if (adminStore.customers && adminStore.customers.length > 0) {
          setCustomers([...adminStore.customers]);
        }
      } catch (e) {
        console.warn('Failed to sync live customers', e);
      }
    };

    fetchCustomers();
    const interval = setInterval(fetchCustomers, 3000);
    return () => clearInterval(interval);
  }, []);

  // Summary Metrics
  const totalCustomers = customers.length;
  const totalMonetary = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.monetaryTotal, 0);
  }, [customers]);
  const aov = useMemo(() => {
    const totalVisits = customers.reduce((sum, c) => sum + c.frequencyCount, 0);
    return Math.round(totalMonetary / Math.max(1, totalVisits));
  }, [customers, totalMonetary]);

  // Segment distribution
  const segmentStats = useMemo(() => {
    const stats: Record<RfmSegment, { count: number; spend: number }> = {
      Juara: { count: 0, spend: 0 },
      Setia: { count: 0, spend: 0 },
      Potensial: { count: 0, spend: 0 },
      'Butuh Perhatian': { count: 0, spend: 0 },
      'Hampir Lepas': { count: 0, spend: 0 },
      Berisiko: { count: 0, spend: 0 },
      Tertidur: { count: 0, spend: 0 }
    };

    for (const c of customers) {
      if (stats[c.segment]) {
        stats[c.segment].count += 1;
        stats[c.segment].spend += c.monetaryTotal;
      }
    }
    return stats;
  }, [customers]);

  // Filtered and sorted customer list
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const matchSeg = selectedSegment === 'all' || c.segment === selectedSegment;
        const matchTier = tierFilter === 'all' || c.tier === tierFilter;
        const matchSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.qrCode.toLowerCase().includes(searchQuery.toLowerCase());
        return matchSeg && matchTier && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'monetary') return b.monetaryTotal - a.monetaryTotal;
        if (sortBy === 'recency') return a.recencyDays - b.recencyDays; // lowest days = most recent
        if (sortBy === 'frequency') return b.frequencyCount - a.frequencyCount;
        if (sortBy === 'points') return b.pointsBalance - a.pointsBalance;
        if (sortBy === 'clv') return b.clvEstimate - a.clvEstimate;
        return 0;
      });
  }, [customers, selectedSegment, tierFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Description */}
      <div className="bg-white p-5 rounded-2xl border border-krem-border shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="font-serif font-bold text-xl text-olive-900">
              CRM Pelanggan & Analitik RFM 7 Segmen
            </h2>
          </div>
          <p className="text-xs text-kopi-muted font-sans mt-1">
            Segmentasi otomatis kuintil Recency (Kunjungan Terakhir), Frequency (Frekuensi Kunjungan), dan Monetary (Total Belanja)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Daftar 200 pelanggan diekspor dalam format CSV/Excel untuk kampanye CRM!')}
            className="px-3.5 py-1.5 rounded-xl border border-krem-border bg-krem-surface hover:bg-krem text-xs font-semibold text-kopi flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-terakota" />
            <span>Ekspor Data Member</span>
          </button>
        </div>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-krem-border shadow-xs">
          <div className="flex items-center justify-between text-kopi-muted text-xs font-medium mb-1">
            <span>Total Pelanggan Terdaftar</span>
            <Users className="w-4 h-4 text-olive" />
          </div>
          <div className="font-serif text-3xl font-bold text-olive-900">
            {totalCustomers} Member
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            200 Profil Terverifikasi WhatsApp OTP & Kartu Digital
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-krem-border shadow-xs">
          <div className="flex items-center justify-between text-kopi-muted text-xs font-medium mb-1">
            <span>Total Omzet Kumulatif Pelanggan</span>
            <TrendingUp className="w-4 h-4 text-terakota" />
          </div>
          <div className="font-serif text-3xl font-bold text-kopi">
            Rp {totalMonetary.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-kopi-muted mt-1">
            Berdasarkan 2.140 transaksi historis 6 bulan
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-krem-border shadow-xs">
          <div className="flex items-center justify-between text-kopi-muted text-xs font-medium mb-1">
            <span>Average Order Value (AOV)</span>
            <DollarSign className="w-4 h-4 text-mustard" />
          </div>
          <div className="font-serif text-3xl font-bold text-terakota-dark">
            Rp {aov.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-kopi-muted mt-1">
            Rata-rata pengeluaran per struk meja kasir
          </p>
        </div>
      </div>

      {/* 7 RFM Segment Distribution Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-bold text-base text-olive-900">
            Distribusi 7 Segmen Loyalitas Pelanggan
          </h3>
          <span className="text-xs text-kopi-muted">Klik kartu untuk menyaring tabel</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {ALL_SEGMENTS.map((seg) => {
            const stat = segmentStats[seg] || { count: 0, spend: 0 };
            const pct = Math.round((stat.count / totalCustomers) * 100);
            const isSelected = selectedSegment === seg;
            const def = SEGMENT_DEFINITIONS[seg];

            return (
              <button
                key={seg}
                onClick={() => setSelectedSegment(isSelected ? 'all' : seg)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-olive text-white border-olive shadow-md ring-2 ring-olive/30'
                    : 'bg-white border-krem-border hover:border-olive-400 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-white/20 text-white' : def.badgeBg
                      }`}
                    >
                      {seg}
                    </span>
                    <span className={`text-[11px] font-mono ${isSelected ? 'text-white' : 'text-kopi-muted'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="font-serif text-xl font-bold my-1">
                    {stat.count}
                  </div>
                </div>
                <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-kopi-subtle'} font-mono truncate`}>
                  Rp {(stat.spend / 1000000).toFixed(1)} jt
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Segment Action Recommendation Banner if filtered */}
      {selectedSegment !== 'all' && SEGMENT_DEFINITIONS[selectedSegment as RfmSegment] && (
        <div className="bg-olive-50 border border-olive-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-olive-900 text-sm">
              💡 Rekomendasi Aksi untuk Segmen &quot;{selectedSegment}&quot;:
            </span>
            <p className="text-olive-800 mt-1">
              {SEGMENT_DEFINITIONS[selectedSegment as RfmSegment].action}
            </p>
          </div>
          <button
            onClick={() => alert(`Siaran kampanye Telegram & WhatsApp untuk segmen ${selectedSegment} berhasil dijadwalkan!`)}
            className="px-4 py-2 rounded-xl bg-olive hover:bg-olive-600 text-white font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Broadcast Segmen</span>
          </button>
        </div>
      )}

      {/* Customers Table Section */}
      <div className="bg-white p-4 rounded-2xl border border-krem-border shadow-xs space-y-3">
        {/* Table Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-kopi-subtle absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari pelanggan (nama, HP, email, QR)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-krem-surface border border-krem-border rounded-xl text-kopi focus:outline-none focus:ring-1 focus:ring-olive"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-krem-surface border border-krem-border rounded-xl px-2.5 py-1.5 text-kopi"
            >
              <option value="all">Semua Tier</option>
              <option value="Tamu">Tamu (&lt; 100 Poin)</option>
              <option value="Sahabat">Sahabat (&gt;= 100 Poin)</option>
              <option value="Keluarga">Keluarga (&gt;= 300 Poin)</option>
            </select>

            {/* Sort Order */}
            <div className="flex items-center gap-1 text-kopi-muted">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-krem-surface border border-krem-border rounded-xl px-2.5 py-1.5 text-kopi"
              >
                <option value="monetary">Urut Belanja Tertinggi</option>
                <option value="recency">Urut Kunjungan Terbaru</option>
                <option value="frequency">Urut Frekuensi Kunjungan</option>
                <option value="points">Urut Saldo Poin</option>
                <option value="clv">Urut Estimasi CLV</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-krem-surface border-b border-krem-border text-kopi-muted font-serif">
                <th className="py-2.5 px-3 font-bold">Pelanggan</th>
                <th className="py-2.5 px-3 font-bold">Tier & Poin</th>
                <th className="py-2.5 px-3 font-bold">Skor RFM</th>
                <th className="py-2.5 px-3 font-bold">Segmen</th>
                <th className="py-2.5 px-3 font-bold text-right">Frekuensi</th>
                <th className="py-2.5 px-3 font-bold text-right">Total Belanja</th>
                <th className="py-2.5 px-3 font-bold text-right">Estimasi CLV</th>
                <th className="py-2.5 px-3 font-bold">Kunjungan Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-krem-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-kopi-subtle">
                    Tidak ditemukan pelanggan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredCustomers.slice(0, 50).map((c) => (
                  <tr key={c.id} className="hover:bg-krem-surface/60 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-kopi">{c.name}</div>
                      <div className="text-[11px] text-kopi-muted font-mono">{c.phone}</div>
                      <div className="text-[10px] text-kopi-subtle">{c.qrCode}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          c.tier === 'Keluarga'
                            ? 'bg-olive text-krem'
                            : c.tier === 'Sahabat'
                            ? 'bg-mustard text-kopi-dark'
                            : 'bg-krem text-kopi border border-krem-border'
                        }`}
                      >
                        {c.tier}
                      </span>
                      <div className="font-mono text-terakota-dark font-bold text-[11px] mt-0.5">
                        {c.pointsBalance} Poin
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="bg-krem-surface px-1.5 py-0.5 rounded border border-krem-border font-bold text-olive-900">
                        {c.rfmScore}
                      </span>
                      <div className="text-[10px] text-kopi-subtle mt-0.5">
                        R{c.rScore} • F{c.fScore} • M{c.mScore}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          SEGMENT_DEFINITIONS[c.segment]?.badgeBg || 'bg-gray-100'
                        }`}
                      >
                        {c.segment}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {c.frequencyCount}x
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-kopi">
                      Rp {c.monetaryTotal.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-terakota-dark font-bold">
                      Rp {c.clvEstimate.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-kopi-muted text-[11px]">
                      <div>{c.lastVisitWib}</div>
                      <div className="text-[10px] text-kopi-subtle">({c.recencyDays} hari lalu)</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length > 50 && (
          <div className="text-center py-2 text-xs text-kopi-muted border-t border-krem-border">
            Menampilkan 50 dari {filteredCustomers.length} pelanggan. Gunakan pencarian untuk menyaring lebih spesifik.
          </div>
        )}
      </div>
    </div>
  );
}
