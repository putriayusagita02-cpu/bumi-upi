'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UtensilsCrossed,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  Edit2,
  Save,
  RotateCcw,
  RefreshCw,
  Zap,
  TrendingDown,
  Sparkles,
  Package,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { adminStore } from '../../lib/adminStore';
import { MENU_CATEGORIES, MenuItem } from '../../lib/catalogData';
import { useAuth } from '../../lib/authContext';

const NENEK_QUOTES = [
  {
    sunda: "Tong poho ngopi hideung, ameh teu kukurubukan mikiran cicilan!",
    arti: "Jangan lupa ngopi hitam, biar perut nggak keroncongan mikirin cicilan!"
  },
  {
    sunda: "Tuang ulen haneut cocol sambel, matak tentrem kana hate!",
    arti: "Makan ulen hangat cocol sambel, bikin hati adem tentram sentosa!"
  },
  {
    sunda: "Lamun salatri barbar, gancang serbu Liwet Kastrol Garut samemeh ludes!",
    arti: "Kalau lapar melanda membabi buta, buruan santap Liwet Garut sebelum kehabisan!"
  },
  {
    sunda: "Hirup mah ibarat cengek, lada saeutik mah wajar ameh aya sumanget!",
    arti: "Hidup itu ibarat cabe rawit, pedas sedikit wajar biar tetap ada semangat hidup!"
  },
  {
    sunda: "Ulah waka baper lamun can dahar, bisi lain sedih tapi saukur salatri!",
    arti: "Jangan baper dulu kalau belum makan, bisa jadi kamu bukan galau tapi cuma lapar!"
  }
];

export default function InventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'tersedia' | 'terbatas' | 'habis'>('all');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncWib, setLastSyncWib] = useState<string>('Baru saja');
  const [simulatingId, setSimulatingId] = useState<number | null>(null);
  const [totalPhysicalUnits, setTotalPhysicalUnits] = useState<number>(4700);
  const [totalSoldToday, setTotalSoldToday] = useState<number>(148);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [quoteIdx, setQuoteIdx] = useState<number>(0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchLiveInventory = useCallback(async (showIndicator = false) => {
    try {
      if (showIndicator) setIsSyncing(true);
      const res = await fetch('/api/inventory', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
        if (typeof data.totalPhysicalUnits === 'number') setTotalPhysicalUnits(data.totalPhysicalUnits);
        if (typeof data.totalSoldToday === 'number') setTotalSoldToday(data.totalSoldToday);
        if (Array.isArray(data.activityLogs)) setActivityLogs(data.activityLogs);
        adminStore.items = data.items;
        adminStore.saveToStorage();
        const now = new Date();
        setLastSyncWib(
          now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
        );
      }
    } catch (e) {
      console.warn('Live inventory sync error', e);
      // fallback to adminStore in-memory
      setItems([...adminStore.items]);
    } finally {
      if (showIndicator) {
        setTimeout(() => setIsSyncing(false), 400);
      }
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchLiveInventory(true);

    // Real-Time Polling: sinkronkan data stok live setiap 2.5 detik
    const interval = setInterval(() => {
      fetchLiveInventory(false);
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchLiveInventory]);

  // Handle Quick Delta (+ / -)
  const handleQuickDelta = async (itemId: number, delta: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const current = item.stock || 0;
    const nextVal = Math.max(0, current + delta);
    const staffName = user?.name || 'Owner';
    const staffId = user?.id || 'usr-admin-01';

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, stock: nextVal, isAvailable: nextVal > 0 } : i))
    );

    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quick_delta',
          itemId,
          delta,
          staffId,
          staffName
        })
      });
      showToast(`⚡ Stok ${item.name} berhasil disesuaikan: ${nextVal} unit`);
    } catch {
      adminStore.updateStock(itemId, nextVal, staffId, staffName);
    }
    fetchLiveInventory(false);
  };

  // Quick 86 (Tandai Habis / Out-of-Stock)
  const handleMarkOutOfStock = async (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const staffName = user?.name || 'Owner';
    const staffId = user?.id || 'usr-admin-01';

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, stock: 0, isAvailable: false } : i))
    );

    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_out_of_stock',
          itemId,
          staffId,
          staffName
        })
      });
      showToast(`⛔ Menu "${item.name}" berhasil ditandai HABIS (0 unit) & terkunci di POS/Web!`);
    } catch {
      adminStore.updateStock(itemId, 0, staffId, staffName);
    }
    fetchLiveInventory(false);
  };

  const handleStartEdit = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditStockValue(item.stock || 0);
  };

  const handleSaveEdit = async (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const staffName = user?.name || 'Owner';
    const staffId = user?.id || 'usr-admin-01';
    const targetVal = Math.max(0, editStockValue);

    setEditingItemId(null);
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, stock: targetVal, isAvailable: targetVal > 0 } : i))
    );

    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_stock',
          itemId,
          newStock: targetVal,
          staffId,
          staffName
        })
      });
      showToast(`✅ Stok "${item.name}" disimpan: ${targetVal} unit`);
    } catch {
      adminStore.updateStock(itemId, targetVal, staffId, staffName);
    }
    fetchLiveInventory(false);
  };

  // Bulk Restock Handlers
  const handleBulkRestock = async (options: { resetToFifty?: boolean; category?: string; delta?: number }) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_restock',
          ...options
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
      showToast(options.resetToFifty ? '📦 Seluruh 105 menu berhasil dipulihkan ke 50 unit!' : `✅ Restock massal berhasil diterapkan!`);
    } catch (e) {
      console.warn('Bulk restock failed', e);
    } finally {
      setIsSyncing(false);
      fetchLiveInventory(false);
    }
  };

  // Simulate Live Order Sale (Decrements stock in real time)
  const handleSimulateSale = async (itemId: number, quantity = 2) => {
    setSimulatingId(itemId);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_sale',
          itemId,
          quantity
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
        if (typeof data.totalPhysicalUnits === 'number') setTotalPhysicalUnits(data.totalPhysicalUnits);
        if (typeof data.totalSoldToday === 'number') setTotalSoldToday(data.totalSoldToday);
        if (Array.isArray(data.activityLogs)) setActivityLogs(data.activityLogs);
      }
      const item = items.find((i) => i.id === itemId);
      showToast(`🔥 Transaksi Meja Kasir: Terjual ${quantity}x ${item?.name || 'Menu'} (-${quantity} Unit)!`);
    } catch (e) {
      console.warn('Simulation failed', e);
    } finally {
      setTimeout(() => setSimulatingId(null), 600);
      fetchLiveInventory(false);
    }
  };

  // Status helper
  const getStockStatus = (stock?: number): { label: string; badgeClass: string; icon: any } => {
    if (stock === undefined || stock <= 0) {
      return { label: 'Habis', badgeClass: 'bg-red-100 text-red-800 border-red-300', icon: XCircle };
    }
    if (stock <= 10) {
      return { label: 'Terbatas', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300', icon: AlertTriangle };
    }
    return { label: 'Tersedia', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const status = getStockStatus(item.stock).label.toLowerCase();
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'tersedia' && status === 'tersedia') ||
        (statusFilter === 'terbatas' && status === 'terbatas') ||
        (statusFilter === 'habis' && status === 'habis');

      return matchCat && matchSearch && matchStatus;
    });
  }, [items, selectedCategory, searchQuery, statusFilter]);

  // Overall stock statistics
  const stats = useMemo(() => {
    let tersedia = 0;
    let terbatas = 0;
    let habis = 0;

    for (const item of items) {
      const s = getStockStatus(item.stock).label;
      if (s === 'Tersedia') tersedia++;
      else if (s === 'Terbatas') terbatas++;
      else habis++;
    }

    return { total: items.length || 105, tersedia, terbatas, habis };
  }, [items]);

  // Out of stock and Low stock items for quick attention
  const outOfStockItems = useMemo(() => items.filter((i) => (i.stock || 0) <= 0), [items]);
  const lowStockItems = useMemo(() => items.filter((i) => (i.stock || 0) > 0 && (i.stock || 0) <= 10), [items]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-olive-900 text-krem px-4 py-2.5 rounded-xl shadow-2xl border border-mustard text-xs font-semibold animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-mustard shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header with Live Sync Status Pill */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-krem-border shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center border border-orange-200 shadow-2xs">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-lg sm:text-xl text-kopi">
                Inventaris Menu & Manajemen Stok (105 Item)
              </h2>
              {/* Live Polling Sync Indicator */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 -ml-3.5" />
                <span>Live Sync Dapur & POS</span>
              </span>
            </div>
            <p className="text-xs text-kopi-muted font-sans mt-0.5">
              Sinkronisasi real-time ketersediaan fisik bahan & menu antara Meja Web, Kasir POS, dan Dapur KDS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-kopi-muted block font-mono">Sinkron Terakhir:</span>
            <span className="text-xs font-bold text-olive-900 font-mono">{lastSyncWib}</span>
          </div>

          <button
            onClick={() => fetchLiveInventory(true)}
            disabled={isSyncing}
            className={`p-2.5 rounded-xl bg-krem hover:bg-krem-dark text-kopi-muted border border-krem-border transition shadow-2xs flex items-center gap-1.5 text-xs font-semibold ${
              isSyncing ? 'opacity-50' : ''
            }`}
            title="Segarkan Sinkronisasi Live"
          >
            <RefreshCw className={`w-4 h-4 text-olive ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sinkronkan</span>
          </button>
        </div>
      </div>

      {/* Dynamic 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        {/* Card 1: Total Menu */}
        <div className="bg-white p-4 rounded-xl border border-krem-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-kopi-muted mb-1 flex items-center justify-between">
              <span>Total Menu</span>
              <Package className="w-3.5 h-3.5 text-olive" />
            </div>
            <div className="font-serif text-2xl font-bold text-olive-900">{stats.total} Item</div>
          </div>
          <div className="text-[10px] text-kopi-subtle mt-1">16 Kategori Otentik Garut</div>
        </div>

        {/* Card 2: Terjual Hari Ini (Bertambah live tiap ada transaksi) */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-amber-800 font-medium mb-1 flex items-center justify-between">
              <span>🔥 Terjual Hari Ini</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            </div>
            <div className="font-serif text-2xl font-bold text-amber-900 font-mono">
              {totalSoldToday} <span className="text-xs font-sans font-normal text-amber-700">Porsi</span>
            </div>
          </div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>Nambah otomatis tiap beli</span>
          </div>
        </div>

        {/* Card 3: Sisa Fisik Bahan di Restoran (Berkurang live) */}
        <div className="bg-white p-4 rounded-xl border border-krem-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-kopi-muted mb-1 flex items-center justify-between">
              <span>📦 Sisa Fisik di Dapur</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-emerald-800 font-mono">
              {totalPhysicalUnits.toLocaleString('id-ID')} <span className="text-xs font-sans font-normal text-emerald-600">Unit</span>
            </div>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            Berkurang live saat dipesan
          </div>
        </div>

        {/* Card 4: Menipis */}
        <div className="bg-white p-4 rounded-xl border border-krem-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-kopi-muted mb-1 flex items-center justify-between">
              <span>⚠️ Stok Menipis (1-10)</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-amber-700">{stats.terbatas} Menu</div>
          </div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1">Perlu re-supply bahan dapur</div>
        </div>

        {/* Card 5: Habis (86) */}
        <div className="bg-white p-4 rounded-xl border border-krem-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-kopi-muted mb-1 flex items-center justify-between">
              <span>⛔ Stok Habis (0 Unit)</span>
              <XCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-red-600">{stats.habis} Menu</div>
          </div>
          <div className="text-[10px] text-red-500 font-semibold mt-1">Terkunci otomatis di POS & Web</div>
        </div>
      </div>

      {/* Celetukan Nenek Garut & Live Activity Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Nenek's Witty Sundanese Quote */}
        <div className="md:col-span-2 bg-gradient-to-r from-[#FBF7EE] to-[#F5EEDC] p-3.5 rounded-2xl border border-[#E8DCC2] shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl select-none">👵</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#3E4F30] uppercase tracking-wider">
                  Nasihat & Celetukan Nenek Garut
                </span>
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">
                  Bikin Adem Pikiran
                </span>
              </div>
              <p className="font-serif italic text-sm text-[#2B2625] font-bold mt-0.5">
                "{NENEK_QUOTES[quoteIdx].sunda}"
              </p>
              <p className="text-[11px] text-[#634E3F] mt-0.5">
                Artinya: {NENEK_QUOTES[quoteIdx].arti}
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuoteIdx((prev) => (prev + 1) % NENEK_QUOTES.length)}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F5EEDC] text-[#3E4F30] text-xs font-bold border border-[#E8DCC2] shrink-0 shadow-2xs transition active:scale-95"
            title="Ganti nasihat nenek lainnya"
          >
            🎲 Celetukan Lain
          </button>
        </div>

        {/* Live Order Ticker */}
        <div className="bg-white p-3.5 rounded-2xl border border-krem-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-olive-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Aktivitas Dapur Terkini</span>
            </span>
            <span className="text-[10px] font-mono text-kopi-subtle">Real-Time</span>
          </div>
          <div className="mt-1">
            <div className="text-xs font-bold text-kopi truncate">
              {activityLogs[0]?.title || 'Menunggu pesanan meja berikutnya...'}
            </div>
            <div className="text-[11px] text-kopi-muted italic truncate">
              {activityLogs[0]?.note || 'Dapur Bumi Upi siap menyajikan masakan otentik!'}
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Warning Banners (If there are items that are Habis or Menipis) */}
      {outOfStockItems.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 shadow-xs space-y-2.5 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-red-600 text-white">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <h3 className="font-serif font-bold text-sm text-red-900">
                Peringatan Dapur: {outOfStockItems.length} Menu Sedang Habis (Terkunci Otomatis)!
              </h3>
            </div>
            <button
              onClick={() => handleBulkRestock({ resetToFifty: false, delta: 25 })}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-xs transition"
            >
              Restock Semua yang Habis (+25 Unit)
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {outOfStockItems.map((it) => (
              <span
                key={it.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-800 text-xs font-semibold shadow-2xs"
              >
                <span>{it.name}</span>
                <button
                  onClick={() => handleQuickDelta(it.id, 20)}
                  className="px-1.5 py-0.2 rounded bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold"
                  title="Restock +20 unit"
                >
                  +20 Unit
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Operational Bulk Action Controls Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-krem-border shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-kopi flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-mustard" />
            <span>Aksi Cepat Restock Massal:</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedCategory !== 'all' && (
            <button
              onClick={() => handleBulkRestock({ category: selectedCategory, delta: 20 })}
              className="px-3 py-1.5 rounded-xl border border-olive-300 bg-olive-50 hover:bg-olive-100 text-olive-900 font-bold transition flex items-center gap-1 shadow-2xs"
              title={`Restock +20 untuk semua menu di kategori ${selectedCategory}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Restock Kategori {selectedCategory} (+20)</span>
            </button>
          )}

          <button
            onClick={() => handleBulkRestock({ resetToFifty: true })}
            className="px-3 py-1.5 rounded-xl border border-krem-border bg-krem-surface hover:bg-krem text-kopi font-bold transition flex items-center gap-1 shadow-2xs"
            title="Reset seluruh 105 menu menjadi stok standar 50 unit"
          >
            <Package className="w-3.5 h-3.5 text-terakota" />
            <span>Pulihkan Semua Menu (50 Unit)</span>
          </button>

          <button
            onClick={() => handleSimulateSale(filteredItems[0]?.id || 1)}
            disabled={simulatingId !== null}
            className="px-3.5 py-1.5 rounded-xl bg-mustard hover:bg-mustard-dark text-kopi-dark font-bold transition flex items-center gap-1 shadow-2xs active:scale-95"
            title="Simulasi live order untuk menguji pengurangan stok real-time"
          >
            <Zap className={`w-3.5 h-3.5 text-kopi-dark ${simulatingId !== null ? 'animate-bounce' : ''}`} />
            <span>Simulasi Penjualan Meja (-2)</span>
          </button>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-krem-border shadow-xs space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-kopi-subtle absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama menu atau kategori untuk cek stok..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-krem-surface border border-krem-border rounded-xl text-kopi focus:outline-none focus:ring-1 focus:ring-olive"
            />
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-krem-surface border border-krem-border rounded-xl px-2.5 py-1.5 text-kopi font-medium"
            >
              <option value="all">Semua Kategori (16 Kategori)</option>
              {MENU_CATEGORIES.map((cat) => (
                <option key={cat.code} value={cat.name}>
                  {cat.name} ({cat.expectedCount} Menu)
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-krem-surface border border-krem-border rounded-xl px-2.5 py-1.5 text-kopi font-medium"
            >
              <option value="all">Semua Status Stok ({items.length})</option>
              <option value="tersedia">Tersedia Saja ({stats.tersedia})</option>
              <option value="terbatas">Stok Terbatas (1-10) ({stats.terbatas})</option>
              <option value="habis">Habis (0 Unit) ({stats.habis})</option>
            </select>
          </div>
        </div>

        {/* Table of 105 Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-krem-surface border-b border-krem-border text-kopi-muted font-serif">
                <th className="py-2.5 px-3 font-bold w-12">No</th>
                <th className="py-2.5 px-3 font-bold">Nama Menu & Kategori</th>
                <th className="py-2.5 px-3 font-bold">Harga Satuan</th>
                <th className="py-2.5 px-3 font-bold">Status Fisik</th>
                <th className="py-2.5 px-3 font-bold text-center">Sisa Stok Real-Time</th>
                <th className="py-2.5 px-3 font-bold text-center">Aksi Cepat Restock</th>
                <th className="py-2.5 px-3 font-bold text-right">Kelola & 86</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-krem-border">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-kopi-subtle">
                    Tidak ditemukan menu yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const status = getStockStatus(item.stock);
                  const isEditing = editingItemId === item.id;
                  const StatusIcon = status.icon;
                  const isSimulating = simulatingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-krem-surface/60 transition ${
                        isSimulating ? 'bg-amber-100/70 animate-pulse' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-kopi-subtle">{item.id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-kopi">{item.name}</div>
                        <div className="text-[11px] text-kopi-muted">{item.category}</div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 mt-0.5">
                            {item.tags.map((t) => (
                              <span key={t} className="text-[9px] px-1 rounded bg-krem text-kopi font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-kopi">
                        Rp {item.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.badgeClass}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{status.label}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editStockValue}
                            onChange={(e) => setEditStockValue(parseInt(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 bg-white border border-olive rounded text-center font-mono font-bold focus:outline-none focus:ring-1 focus:ring-olive"
                            autoFocus
                          />
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded border ${
                                (item.stock || 0) <= 0
                                  ? 'bg-red-50 text-red-700 border-red-300'
                                  : (item.stock || 0) <= 10
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-krem-surface text-olive-900 border-krem-border'
                              }`}
                            >
                              {item.stock ?? 0} Unit
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleQuickDelta(item.id, -5)}
                            className="px-1.5 py-0.5 bg-krem hover:bg-krem-dark text-kopi rounded text-[10px] font-mono border border-krem-border"
                            title="Kurangi 5 porsi"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleQuickDelta(item.id, -1)}
                            className="w-5 h-5 bg-white hover:bg-red-50 text-red-600 border border-krem-border rounded flex items-center justify-center transition active:scale-90"
                            title="Kurangi 1 porsi"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleQuickDelta(item.id, 1)}
                            className="w-5 h-5 bg-white hover:bg-emerald-50 text-emerald-700 border border-krem-border rounded flex items-center justify-center transition active:scale-90"
                            title="Tambah 1 porsi"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleQuickDelta(item.id, 10)}
                            className="px-1.5 py-0.5 bg-krem hover:bg-krem-dark text-kopi rounded text-[10px] font-mono border border-krem-border"
                            title="Tambah 10 porsi"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleQuickDelta(item.id, 25)}
                            className="px-1.5 py-0.5 bg-olive-50 hover:bg-olive-100 text-olive-900 rounded text-[10px] font-mono font-bold border border-olive-200"
                            title="Tambah 25 porsi"
                          >
                            +25
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                              title="Simpan Angka Stok"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="p-1 text-kopi-subtle hover:bg-krem rounded"
                              title="Batal"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Live Buy 1 Test Button */}
                            <button
                              onClick={() => handleSimulateSale(item.id, 1)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-0.5 ${
                                (item.stock || 0) <= 0
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 active:scale-95 shadow-2xs'
                              }`}
                              disabled={(item.stock || 0) <= 0}
                              title="Simulasi 1 porsi dibeli tamu di web / kasir POS"
                            >
                              <Zap className="w-2.5 h-2.5 text-amber-700" />
                              <span>Beli 1</span>
                            </button>

                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1 text-olive hover:bg-olive-50 rounded transition"
                              title="Ubah Angka Stok Langsung"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick 86 / Mark Out-of-Stock Button */}
                            <button
                              onClick={() => handleMarkOutOfStock(item.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-0.5 ${
                                (item.stock || 0) <= 0
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 active:scale-95'
                              }`}
                              disabled={(item.stock || 0) <= 0}
                              title="Kunci / Tandai Habis (86) langsung di POS dan Web"
                            >
                              <span>86 Habis</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
