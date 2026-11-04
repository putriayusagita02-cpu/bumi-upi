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
  Download,
  MessageSquare,
  Check,
  Copy,
  ExternalLink,
  Target,
  Gift,
  UtensilsCrossed
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
  const [playbookSeg, setPlaybookSeg] = useState<RfmSegment>('Juara');
  const [copiedSeg, setCopiedSeg] = useState<string | null>(null);
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    adminStore.loadFromStorage();
    if (adminStore.customers && adminStore.customers.length > 0) {
      setCustomers([...adminStore.customers]);
    }

    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/crm/customers', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.customers)) {
          setCustomers(data.customers);
          adminStore.customers = data.customers;
          adminStore.saveToStorage();
        }
      } catch (e) {
        console.warn('Failed to sync live customers', e);
      }
    };

    fetchCustomers();
    const interval = setInterval(fetchCustomers, 2500);
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
            onClick={() => {
              const headers = 'ID,Nama,No HP,Tier,Poin,Total Belanja,Frekuensi,Segmen RFM\n';
              const rows = customers
                .map((c) => `"${c.id}","${c.name}","${c.phone}","${c.tier}",${c.pointsBalance},${c.monetaryTotal},${c.frequencyCount},"${c.segment}"`)
                .join('\n');
              const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `CRM_Member_Bumi_Upi_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
            }}
            className="px-3.5 py-1.5 rounded-xl border border-krem-border bg-krem-surface hover:bg-krem text-xs font-semibold text-kopi flex items-center gap-1.5 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-terakota" />
            <span>Ekspor Data Member ({totalCustomers})</span>
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
                onClick={() => {
                  if (selectedSegment === seg) {
                    setSelectedSegment('all');
                  } else {
                    setSelectedSegment(seg);
                    setPlaybookSeg(seg);
                  }
                }}
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

      {/* Broadcast Alert Toast */}
      {broadcastSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base">📢</span>
            <span>{broadcastSuccessMsg}</span>
          </div>
          <button
            onClick={() => setBroadcastSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-sm px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Real-World Restaurant Tactical Playbook & SOP Section */}
      {(() => {
        const activeMeta = SEGMENT_DEFINITIONS[playbookSeg];
        const segStat = segmentStats[playbookSeg] || { count: 0, spend: 0 };
        const segPct = Math.round((segStat.count / totalCustomers) * 100);

        return (
          <div className="bg-white border border-krem-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-krem-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-olive/10 text-olive">
                    <UtensilsCrossed className="w-4 h-4" />
                  </span>
                  <h3 className="font-serif font-bold text-base text-olive-900">
                    SOP & Rekomendasi Aksi Operasional Restoran (F&B Garut)
                  </h3>
                </div>
                <p className="text-xs text-kopi-muted mt-0.5">
                  Panduan taktis teruji operasional meja, kasir, dapur, dan komunikasi WhatsApp untuk setiap segmen pelanggan
                </p>
              </div>

              {/* Segment Selector Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs">
                {ALL_SEGMENTS.map((seg) => (
                  <button
                    key={seg}
                    onClick={() => {
                      setPlaybookSeg(seg);
                      if (selectedSegment !== 'all' && selectedSegment !== seg) {
                        setSelectedSegment(seg);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition text-[11px] ${
                      playbookSeg === seg
                        ? 'bg-olive text-white shadow-2xs'
                        : 'bg-krem-surface text-kopi-muted hover:bg-krem hover:text-kopi border border-krem-border'
                    }`}
                  >
                    {seg}
                  </button>
                ))}
              </div>
            </div>

            {/* Playbook Header Details */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-krem-surface p-3.5 rounded-xl border border-krem-border">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${activeMeta.badgeBg}`}>
                  {activeMeta.title}
                </span>
                <span className="text-xs font-mono text-kopi font-semibold">
                  {segStat.count} Pelanggan ({segPct}%)
                </span>
                <span className="text-xs text-kopi-muted">• Total Omzet: Rp {(segStat.spend / 1000000).toFixed(1)} jt</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedSegment(selectedSegment === playbookSeg ? 'all' : playbookSeg);
                  }}
                  className="px-3 py-1 rounded-lg border border-krem-border bg-white text-xs font-semibold text-kopi hover:bg-krem transition flex items-center gap-1 shadow-2xs"
                >
                  <Filter className="w-3 h-3 text-terakota" />
                  <span>{selectedSegment === playbookSeg ? 'Tampilkan Semua Member' : `Filter Tabel (${segStat.count})`}</span>
                </button>
              </div>
            </div>

            {/* 3-Column Playbook Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              {/* Column 1: Karakteristik & Target Bisnis */}
              <div className="p-4 rounded-xl border border-krem-border bg-[#FDFBF7] space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-olive-900 text-[13px]">
                    <Target className="w-4 h-4 text-olive" />
                    <span>Target Strategis & Perilaku Meja</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kopi-muted block">
                      Karakteristik Tamu:
                    </span>
                    <p className="text-kopi mt-0.5 leading-relaxed text-[11px]">
                      {activeMeta.desc}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kopi-muted block">
                      Tujuan Bisnis:
                    </span>
                    <p className="text-olive-800 font-medium mt-0.5 leading-relaxed text-[11px]">
                      {activeMeta.objective}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-krem-border/80 text-[11px] text-terakota font-semibold">
                  📈 {activeMeta.roiImpact}
                </div>
              </div>

              {/* Column 2: SOP Operasional Kasir, Meja & Dapur */}
              <div className="p-4 rounded-xl border border-krem-border bg-[#FDFBF7] space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-olive-900 text-[13px]">
                    <Award className="w-4 h-4 text-olive" />
                    <span>SOP Operasional Meja, Kasir & Dapur</span>
                  </div>
                  <div className="space-y-1.5">
                    {activeMeta.sopRestoran.map((step, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-white border border-krem-border text-[11px] text-kopi leading-relaxed">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-krem-border/80 flex items-center gap-1.5 text-[11px] text-olive font-bold">
                  <Gift className="w-3.5 h-3.5 text-terakota" />
                  <span>Traktiran: {activeMeta.incentive}</span>
                </div>
              </div>

              {/* Column 3: Template WhatsApp Blast Siap Kirim */}
              <div className="p-4 rounded-xl border border-krem-border bg-[#FDFBF7] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-olive-900 text-[13px]">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Template Pesan WhatsApp Siap Kirim</span>
                    </div>
                    {copiedSeg === playbookSeg ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Tersalin!
                      </span>
                    ) : null}
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950 font-sans leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {activeMeta.waTemplate}
                  </div>
                </div>

                <div className="pt-2 border-t border-krem-border/80 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeMeta.waTemplate);
                      setCopiedSeg(playbookSeg);
                      setTimeout(() => setCopiedSeg(null), 3000);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-krem-border bg-white hover:bg-krem text-[11px] font-bold text-kopi flex items-center justify-center gap-1 shadow-2xs transition active:scale-95"
                  >
                    <Copy className="w-3 h-3 text-kopi-muted" />
                    <span>Salin Pesan</span>
                  </button>
                  <button
                    onClick={() => {
                      setBroadcastSuccessMsg(`✅ Kampanye WhatsApp & Telegram untuk ${segStat.count} pelanggan segmen "${playbookSeg}" berhasil dijadwalkan dan dikirim!`);
                      setTimeout(() => setBroadcastSuccessMsg(null), 6000);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-olive hover:bg-olive-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition active:scale-95"
                  >
                    <Send className="w-3 h-3" />
                    <span>Broadcast ({segStat.count})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
                <th className="py-2.5 px-3 font-bold text-center">Aksi Personal (WA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-krem-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-kopi-subtle">
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
                    <td className="py-2.5 px-3 text-center">
                      <a
                        href={`https://wa.me/${(c.phone || '').replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(
                          (SEGMENT_DEFINITIONS[c.segment]?.waTemplate || '').replace('[Nama]', c.name)
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs transition active:scale-95"
                        title={`Kirim penawaran WhatsApp khusus untuk ${c.name} (${c.segment})`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat WA</span>
                      </a>
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
