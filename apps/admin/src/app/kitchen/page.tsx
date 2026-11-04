'use client';

import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  BellRing,
  Utensils,
  ArrowRight,
  Filter,
  RefreshCw,
  Send
} from 'lucide-react';
import { adminStore, OrderRecord, OrderStatus } from '../../lib/adminStore';
import { useAuth } from '../../lib/authContext';

export default function KitchenPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'dine_in' | 'takeaway'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const refreshOrders = () => {
    setOrders([...adminStore.orders]);
  };

  useEffect(() => {
    adminStore.loadFromStorage();
    refreshOrders();
    adminStore.syncLiveOrdersFromApi().then(refreshOrders);

    const interval = setInterval(async () => {
      await adminStore.syncLiveOrdersFromApi();
      setOrders([...adminStore.orders]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Alert when new orders arrive
  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount > 0 && soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } catch {
        // AudioContext may be blocked before interaction
      }
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount, soundEnabled]);

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    const chefName = user?.name || 'Mang Udin (Kepala Dapur)';
    const chefId = user?.id || 'usr-chef-01';
    adminStore.updateOrderStatus(orderId, nextStatus, chefId, chefName);
    refreshOrders();

    try {
      fetch('/api/pos/transaction', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: nextStatus })
      }).catch(() => {});
    } catch {}
  };

  const filteredOrders = orders.filter((o) => {
    if (filterType === 'dine_in') return o.orderType === 'dine_in';
    if (filterType === 'takeaway') return o.orderType === 'takeaway';
    return true;
  });

  const columns: { status: OrderStatus; title: string; color: string; badgeClass: string; icon: any }[] = [
    {
      status: 'confirmed',
      title: 'Masuk (Menunggu)',
      color: 'border-amber-400 bg-amber-50/50',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: Clock
    },
    {
      status: 'preparing',
      title: 'Sedang Dimasak',
      color: 'border-orange-500 bg-orange-50/50',
      badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
      icon: Flame
    },
    {
      status: 'ready',
      title: 'Siap Diambil / Saji',
      color: 'border-emerald-500 bg-emerald-50/50',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: BellRing
    },
    {
      status: 'completed',
      title: 'Selesai Disajikan',
      color: 'border-stone-400 bg-stone-50/50',
      badgeClass: 'bg-stone-200 text-stone-800 border-stone-300',
      icon: CheckCircle2
    }
  ];

  // Helper to calculate minutes elapsed
  const getElapsedMinutes = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diffMs / 60000);
    return Math.max(1, mins);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* KDS Header & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-krem-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-kopi flex items-center gap-2">
              <span>Live Kitchen Display System (KDS)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </h2>
            <p className="text-xs text-kopi-muted font-sans">
              Papan pesanan antrean dapur Rumah Nenek Garut • Sinkronisasi otomatis
            </p>
          </div>
        </div>

        {/* Filter & Sound Toggle */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="inline-flex rounded-xl bg-krem p-1 border border-krem-border font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === 'all' ? 'bg-olive text-white' : 'text-kopi hover:text-terakota'
              }`}
            >
              Semua ({orders.length})
            </button>
            <button
              onClick={() => setFilterType('dine_in')}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === 'dine_in' ? 'bg-olive text-white' : 'text-kopi hover:text-terakota'
              }`}
            >
              🍽️ Meja ({orders.filter((o) => o.orderType === 'dine_in').length})
            </button>
            <button
              onClick={() => setFilterType('takeaway')}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === 'takeaway' ? 'bg-olive text-white' : 'text-kopi hover:text-terakota'
              }`}
            >
              🥡 Bungkus ({orders.filter((o) => o.orderType === 'takeaway').length})
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-krem text-kopi-muted border-krem-border'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Suara: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={refreshOrders}
            className="p-1.5 rounded-xl bg-krem hover:bg-krem-dark text-kopi-muted border border-krem-border"
            title="Muat Ulang Tiket"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.status === col.status);
          const ColIcon = col.icon;

          return (
            <div
              key={col.status}
              className={`rounded-2xl border-2 p-3 space-y-3 flex flex-col justify-start min-h-[550px] ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-krem-border">
                <div className="flex items-center gap-2">
                  <ColIcon className="w-4 h-4 text-kopi" />
                  <span className="font-serif font-bold text-xs text-kopi">{col.title}</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold border ${col.badgeClass}`}
                >
                  {colOrders.length}
                </span>
              </div>

              {/* Tickets list */}
              <div className="space-y-3 overflow-y-auto max-h-[680px] pr-1">
                {colOrders.length === 0 ? (
                  <div className="p-8 text-center text-kopi-subtle text-xs border border-dashed border-krem-border rounded-xl">
                    Tidak ada tiket di tahap ini.
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const elapsed = getElapsedMinutes(order.createdAt);
                    const isUrgent = elapsed >= 15 && order.status !== 'completed';

                    return (
                      <div
                        key={order.id}
                        className={`bg-white rounded-xl p-3.5 border shadow-xs space-y-2.5 transition relative overflow-hidden ${
                          isUrgent ? 'border-red-400 ring-1 ring-red-300' : 'border-krem-border hover:shadow-md'
                        }`}
                      >
                        {isUrgent && (
                          <div className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider text-center">
                            ⚠️ Prioritas Masak (&gt; 15 Menit)
                          </div>
                        )}

                        {/* Ticket Header */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-olive-900 bg-olive-50 px-2 py-0.5 rounded font-mono">
                            {order.tableNumber}
                          </span>
                          <span
                            className={`flex items-center gap-1 font-mono text-[11px] ${
                              isUrgent ? 'text-red-600 font-bold' : 'text-kopi-muted'
                            }`}
                          >
                            <Clock className="w-3 h-3" /> {elapsed} mnt lalu
                          </span>
                        </div>

                        <div className="text-[11px] text-kopi-muted flex items-center justify-between">
                          <span className="font-mono text-[10px] text-kopi-subtle">
                            {order.orderNumber}
                          </span>
                          <span className="font-bold text-terakota-dark flex items-center gap-1 bg-terakota-50 px-2 py-0.5 rounded-md border border-terakota-100">
                            <span className="text-[10px]">👤</span>
                            <span>
                              {(order.customerName && order.customerName !== 'Pelanggan Member')
                                ? order.customerName
                                : (adminStore.customers.find((c) => c.id === order.customerId)?.name || order.customerName || 'Pelanggan Member')}
                            </span>
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="bg-krem-surface p-2.5 rounded-lg border border-krem-border space-y-1.5 text-xs">
                          {order.items.map((it, i) => (
                            <div key={i} className="flex items-start justify-between">
                              <div>
                                <span className="font-bold text-kopi">{it.itemName}</span>
                                {it.variantName && (
                                  <span className="text-[10px] text-purple-700 block font-medium">
                                    • {it.variantName}
                                  </span>
                                )}
                                {it.notes && (
                                  <span className="text-[10px] text-red-600 italic block">
                                    Catatan: {it.notes}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 rounded border border-krem-border ml-2">
                                x{it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="text-[10px] bg-amber-50 border border-amber-200 text-amber-900 p-1.5 rounded">
                            <span className="font-bold">Memo Meja:</span> {order.notes}
                          </div>
                        )}

                        {/* Action buttons to progress ticket */}
                        <div className="pt-2 border-t border-krem-border flex items-center justify-between gap-1.5">
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'preparing')}
                              className="w-full py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span>Mulai Masak</span>
                            </button>
                          )}

                          {order.status === 'preparing' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'ready')}
                              className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                            >
                              <BellRing className="w-3.5 h-3.5" />
                              <span>Siap Diambil</span>
                            </button>
                          )}

                          {order.status === 'ready' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'completed')}
                              className="w-full py-1.5 rounded-lg bg-olive hover:bg-olive-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selesai Disajikan</span>
                            </button>
                          )}

                          {order.status === 'completed' && (
                            <div className="w-full text-center text-[10px] text-emerald-700 font-bold py-1">
                              ✓ Makanan Telah Dinikmati Pelanggan
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
