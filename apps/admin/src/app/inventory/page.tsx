'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { adminStore } from '../../lib/adminStore';
import { MENU_CATEGORIES, MenuItem } from '../../lib/catalogData';
import { useAuth } from '../../lib/authContext';

export default function InventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'tersedia' | 'terbatas' | 'habis'>('all');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const refreshItems = () => {
    setItems([...adminStore.items]);
  };

  useEffect(() => {
    refreshItems();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleQuickDelta = (itemId: number, delta: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const current = item.stock || 0;
    const nextVal = Math.max(0, current + delta);
    const staffName = user?.name || 'Teh Upi (Owner)';
    const staffId = user?.id || 'usr-admin-01';

    adminStore.updateStock(itemId, nextVal, staffId, staffName);
    refreshItems();
    showToast(`Stok ${item.name} diperbarui: ${nextVal} unit`);
  };

  const handleStartEdit = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditStockValue(item.stock || 0);
  };

  const handleSaveEdit = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const staffName = user?.name || 'Teh Upi (Owner)';
    const staffId = user?.id || 'usr-admin-01';

    adminStore.updateStock(itemId, editStockValue, staffId, staffName);
    setEditingItemId(null);
    refreshItems();
    showToast(`Stok ${item.name} disimpan: ${editStockValue} unit`);
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

    return { total: items.length, tersedia, terbatas, habis };
  }, [items]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-olive-900 text-krem px-4 py-2 rounded-xl shadow-xl border border-mustard text-xs font-semibold animate-bounce flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-mustard" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-krem-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-kopi">
              Inventaris Menu & Manajemen Stok (105 Item)
            </h2>
            <p className="text-xs text-kopi-muted font-sans">
              Pantau ketersediaan fisik bahan makanan & minuman otentik Garut secara real-time
            </p>
          </div>
        </div>

        <button
          onClick={refreshItems}
          className="p-2 rounded-xl bg-krem hover:bg-krem-dark text-kopi-muted border border-krem-border"
          title="Muat Ulang Data Stok"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-krem-border shadow-xs">
          <div className="text-kopi-muted mb-1">Total Menu Terdaftar</div>
          <div className="font-serif text-2xl font-bold text-olive-900">{stats.total} Item</div>
          <div className="text-[10px] text-kopi-subtle">16 Kategori Lengkap</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-krem-border shadow-xs">
          <div className="text-kopi-muted mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Stok Tersedia (&gt;10)</span>
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-700">{stats.tersedia} Item</div>
          <div className="text-[10px] text-emerald-600">Siap dipesan kasir</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-krem-border shadow-xs">
          <div className="text-kopi-muted mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Stok Terbatas (1-10)</span>
          </div>
          <div className="font-serif text-2xl font-bold text-amber-700">{stats.terbatas} Item</div>
          <div className="text-[10px] text-amber-600">Perlu re-supply bahan</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-krem-border shadow-xs">
          <div className="text-kopi-muted mb-1 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Stok Habis (0)</span>
          </div>
          <div className="font-serif text-2xl font-bold text-red-600">{stats.habis} Item</div>
          <div className="text-[10px] text-red-500">Terkunci otomatis di POS</div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white p-4 rounded-2xl border border-krem-border shadow-xs space-y-3">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-kopi-subtle absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari menu untuk update stok..."
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
              className="bg-krem-surface border border-krem-border rounded-xl px-2.5 py-1.5 text-kopi"
            >
              <option value="all">Semua Kategori (16)</option>
              {MENU_CATEGORIES.map((cat) => (
                <option key={cat.code} value={cat.name}>
                  {cat.name} ({cat.expectedCount})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-krem-surface border border-krem-border rounded-xl px-2.5 py-1.5 text-kopi"
            >
              <option value="all">Semua Status</option>
              <option value="tersedia">Tersedia Saja</option>
              <option value="terbatas">Terbatas Saja</option>
              <option value="habis">Habis Saja</option>
            </select>
          </div>
        </div>

        {/* Table of 105 Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-krem-surface border-b border-krem-border text-kopi-muted font-serif">
                <th className="py-2.5 px-3 font-bold">No</th>
                <th className="py-2.5 px-3 font-bold">Nama Menu & Kategori</th>
                <th className="py-2.5 px-3 font-bold">Harga Satuan</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
                <th className="py-2.5 px-3 font-bold text-center">Sisa Stok</th>
                <th className="py-2.5 px-3 font-bold text-center">Aksi Cepat (+ / -)</th>
                <th className="py-2.5 px-3 font-bold text-right">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-krem-border">
              {filteredItems.map((item, idx) => {
                const status = getStockStatus(item.stock);
                const isEditing = editingItemId === item.id;
                const StatusIcon = status.icon;

                return (
                  <tr key={item.id} className="hover:bg-krem-surface/50 transition">
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
                          className="w-16 px-1.5 py-0.5 bg-white border border-olive rounded text-center font-mono font-bold"
                          autoFocus
                        />
                      ) : (
                        <span className="font-mono font-bold text-sm bg-krem-surface px-2.5 py-0.5 rounded border border-krem-border">
                          {item.stock ?? 0}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleQuickDelta(item.id, -5)}
                          className="px-1.5 py-0.5 bg-krem hover:bg-krem-dark text-kopi rounded text-[10px] font-mono"
                          title="Kurangi 5"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleQuickDelta(item.id, -1)}
                          className="w-5 h-5 bg-white hover:bg-red-50 text-red-600 border border-krem-border rounded flex items-center justify-center"
                          title="Kurangi 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleQuickDelta(item.id, 1)}
                          className="w-5 h-5 bg-white hover:bg-emerald-50 text-emerald-700 border border-krem-border rounded flex items-center justify-center"
                          title="Tambah 1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleQuickDelta(item.id, 10)}
                          className="px-1.5 py-0.5 bg-krem hover:bg-krem-dark text-kopi rounded text-[10px] font-mono"
                          title="Tambah 10"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Simpan"
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
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1 text-olive hover:bg-olive-50 rounded"
                          title="Ketik Angka Stok Langsung"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
