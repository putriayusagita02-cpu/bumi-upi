'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { OrderRecord, OrderStatus } from '../../../lib/types';
import { CheckCircle2, Clock, Utensils, ArrowRight, Sparkles, Check } from '../../../components/icons';

export default function OrderTrackerPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'tracker' | 'postal_receipt'>('tracker');
  const [copiedLink, setCopiedLink] = useState(false);

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'confirmed', label: 'Menunggu Konfirmasi', desc: 'Pesanan diterima & dicatat sistem' },
    { key: 'preparing', label: 'Sedang Dimasak', desc: 'Dapur tradisional Garut sedang meracik bumbu' },
    { key: 'ready', label: 'Siap Diantar', desc: 'Sajian hangat siap diantar ke meja Anda' },
    { key: 'completed', label: 'Selesai', desc: 'Selamat menikmati santapan Bumi Upi!' },
  ];

  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      // Jika sedang ada proses update status, jangan overwrite dari polling
      if (updatingStatus) return;

      try {
        const res = await fetch(`/api/orders?id=${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          // Ambil status tersimpan dari localStorage jika status lokal lebih maju
          let resolvedStatus = data.order.status;
          if (typeof window !== 'undefined') {
            try {
              const raw = localStorage.getItem('bumi_upi_client_orders');
              if (raw) {
                const list = JSON.parse(raw);
                const local = list.find((o: any) => o.id === orderId || o.orderNumber === orderId);
                if (local && local.status) {
                  const sIdx = steps.findIndex((s) => s.key === local.status);
                  const sServerIdx = steps.findIndex((s) => s.key === resolvedStatus);
                  if (sIdx > sServerIdx) {
                    resolvedStatus = local.status;
                  }
                }
              }
            } catch {}
          }

          setOrder({ ...data.order, status: resolvedStatus });
          const idx = steps.findIndex((s) => s.key === resolvedStatus);
          setCurrentStepIndex(idx >= 0 ? idx : 0);
        } else {
          // Cek localStorage browser terlebih dahulu
          let localOrder: OrderRecord | null = null;
          if (typeof window !== 'undefined') {
            try {
              const raw = localStorage.getItem('bumi_upi_client_orders');
              if (raw) {
                const list = JSON.parse(raw);
                localOrder = list.find((o: any) => o.id === orderId || o.orderNumber === orderId) || null;
              }
            } catch {}
          }

          if (localOrder) {
            setOrder(localOrder);
            const idx = steps.findIndex((s) => s.key === localOrder.status);
            setCurrentStepIndex(idx >= 0 ? idx : 0);
          } else {
            // Fallback mock order if direct link
            const mockOrd: OrderRecord = {
              id: orderId || 'ord-mock',
              orderNumber: `BU-ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0088`,
              idempotencyKey: 'idemp-mock',
              orderType: 'dine_in',
              tableNumber: 'Meja 04',
              status: 'confirmed',
              subtotal: 68000,
              discountAmount: 15000,
              finalAmount: 53000,
              pointsEarned: 5,
              paymentMethod: 'qris',
              paymentStatus: 'paid',
              items: [
                { productId: 30, itemName: 'Nasi Goreng Upiwati', quantity: 1, unitPrice: 26000 },
                { productId: 74, itemName: 'Kopi Hitam (L, Panas)', quantity: 1, unitPrice: 22000 },
                { productId: 95, itemName: 'Roti Bakar Telur Keju', quantity: 1, unitPrice: 23000 },
              ],
              createdAt: new Date().toISOString(),
            };
            setOrder(mockOrd);
            setCurrentStepIndex(0);
          }
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }

    loadOrder();

    // Polling setiap 3 detik untuk sinkronisasi otomatis dari update dapur Admin
    const pollInterval = setInterval(() => {
      loadOrder();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [orderId, updatingStatus]);

  const advanceStep = async () => {
    if (!order || updatingStatus) return;
    const nextIdx = Math.min(steps.length - 1, currentStepIndex + 1);
    const nextStatus = steps[nextIdx].key;

    setCurrentStepIndex(nextIdx);
    const updatedOrder: OrderRecord = { ...order, status: nextStatus };
    setOrder(updatedOrder);
    setUpdatingStatus(true);

    // Simpan ke localStorage agar tidak ter-reset oleh interval polling
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('bumi_upi_client_orders');
        const list = raw ? JSON.parse(raw) : [];
        const map = new Map(list.map((o: any) => [o.id, o]));
        map.set(updatedOrder.id, updatedOrder);
        localStorage.setItem('bumi_upi_client_orders', JSON.stringify(Array.from(map.values())));
      } catch (e) {
        console.warn('Failed to persist locally', e);
      }
    }

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: nextStatus }),
      });
    } catch (e) {
      console.warn('Failed to persist status change to server', e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCopyReceipt = () => {
    if (order) {
      navigator.clipboard.writeText(
        `📜 Struk Dagang Tempo Doeloe - Bumi Upi Garut\nNo: ${order.orderNumber}\nMeja: ${order.tableNumber}\nTotal: Rp ${order.finalAmount.toLocaleString('id-ID')}\nStatus: Lunas (${order.paymentMethod.toUpperCase()})\nHatur nuhun!`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <span className="animate-spin text-4xl block">⏳</span>
        <p className="text-xs text-[#634E3F]">Memuat status pelacakan pesanan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Switcher: Pelacak Modern vs Struk Kartu Pos Tempo Doeloe */}
      <div className="flex items-center justify-between bg-[#FBF7EE] p-2 rounded-2xl border border-[#E8DCC2]">
        <button
          type="button"
          onClick={() => setViewMode('tracker')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            viewMode === 'tracker'
              ? 'bg-[#3E4F30] text-[#F5EEDC] shadow-sm'
              : 'text-[#634E3F] hover:text-[#2B2625]'
          }`}
        >
          <span>⏱️ Pelacak Status Meja</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('postal_receipt')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            viewMode === 'postal_receipt'
              ? 'bg-[#B4532A] text-white shadow-sm'
              : 'text-[#634E3F] hover:text-[#2B2625]'
          }`}
        >
          <span>📜 Struk Kartu Pos Tempo Doeloe</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            Aksara Sunda
          </span>
        </button>
      </div>

      {/* VIEW 1: MODERN TRACKER */}
      {viewMode === 'tracker' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-[#FBF7EE] border border-[#E8DCC2] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8DCC2]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E4F30] px-2 py-0.5 rounded bg-[#E4EADF]">
                  {order?.orderType === 'dine_in' ? `Dine-in (${order?.tableNumber})` : 'Bawa Pulang'}
                </span>
                <h1
                  className="font-serif text-2xl font-bold text-[#2B2625] mt-1"
                  style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
                >
                  Status Pesanan Anda
                </h1>
                <p className="font-mono text-xs text-[#634E3F]">{order?.orderNumber}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-[#8C7767] uppercase block">Total Bayar</span>
                <span className="font-serif text-xl font-black text-[#B4532A]">
                  Rp {order?.finalAmount.toLocaleString('id-ID')}
                </span>
                <p className="text-[10px] text-[#3E4F30] font-semibold">
                  ✓ Lunas ({order?.paymentMethod.toUpperCase()})
                </p>
              </div>
            </div>

            {/* Live Visual Status Pipeline: Menunggu Konfirmasi -> Sedang Dimasak -> Siap Diantar -> Selesai */}
            <div className="py-4">
              <div className="relative">
                {/* Connecting Bar */}
                <div className="absolute top-5 left-6 right-6 h-1 bg-[#E8DCC2] -z-0">
                  <div
                    className="h-full bg-[#3E4F30] transition-all duration-500 ease-out"
                    style={{
                      width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Steps Nodes */}
                <div className="relative z-10 flex justify-between">
                  {steps.map((st, idx) => {
                    const isPassed = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div key={st.key} className="flex flex-col items-center text-center max-w-[5.5rem]">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-300 ${
                            isCurrent
                              ? 'bg-[#B4532A] text-white ring-4 ring-[#FCE7DF]'
                              : isPassed
                              ? 'bg-[#3E4F30] text-[#F5EEDC]'
                              : 'bg-white border-2 border-[#E8DCC2] text-[#8C7767]'
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] font-bold mt-2 leading-tight ${
                            isCurrent
                              ? 'text-[#B4532A]'
                              : isPassed
                              ? 'text-[#3E4F30]'
                              : 'text-[#8C7767]'
                          }`}
                        >
                          {st.label}
                        </span>
                        <span className="text-[9px] text-[#634E3F] leading-tight mt-0.5 hidden sm:block">
                          {st.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Simulation Transition Button */}
              <div className="mt-8 pt-4 border-t border-[#E8DCC2]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-[#634E3F]">
                  Fase saat ini:{' '}
                  <strong className="text-[#2B2625]">{steps[currentStepIndex].label}</strong>
                </span>
                {currentStepIndex < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={advanceStep}
                    disabled={updatingStatus}
                    className="py-1.5 px-3 rounded-lg bg-[#3E4F30] text-[#F5EEDC] text-xs font-semibold hover:brightness-110 active:scale-95 shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {updatingStatus && <span className="animate-spin text-xs">⏳</span>}
                    <span>{updatingStatus ? 'Menyimpan...' : 'Simulasi Status Berikutnya →'}</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-[#3E4F30] bg-[#E4EADF] px-2.5 py-1 rounded-full">
                    🎉 Pesanan Telah Selesai
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Item Breakdown Box */}
          <div className="bg-[#FBF7EE] border border-[#E8DCC2] rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-serif text-sm font-bold text-[#2B2625] pb-2 border-b border-[#E8DCC2]">
              Rincian Menu yang Sedang Disiapkan
            </h4>

            <div className="space-y-2">
              {order?.items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-[#E8DCC2]/40"
                >
                  <div>
                    <p className="font-semibold text-[#2B2625]">
                      {it.quantity}x {it.itemName}
                    </p>
                    {it.notes && (
                      <p className="text-[10px] text-[#8C7767] italic">&quot;{it.notes}&quot;</p>
                    )}
                  </div>
                  <span className="font-mono font-medium text-[#2B2625]">
                    Rp {(it.unitPrice * it.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-[#3E4F30] font-semibold bg-[#E4EADF]/40 p-3 rounded-xl">
              <span className="flex items-center gap-1.5">
                <span>🪙</span>
                <span>Poin Loyalitas Didapat:</span>
              </span>
              <span className="font-bold">+{order?.pointsEarned} Poin Bumi</span>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <Link
                href="/menu"
                className="text-xs font-bold text-[#3E4F30] hover:underline"
              >
                ← Pesan Menu Tambahan
              </Link>
              <Link
                href="/member"
                className="text-xs font-bold text-[#B4532A] hover:underline"
              >
                Cek Saldo Kartu Member →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: VINTAGE POSTAL RECEIPT WITH SUNDANESE SCRIPT & RED WAX SEAL */}
      {viewMode === 'postal_receipt' && (
        <div className="space-y-4">
          <div className="relative rounded-[2.5rem] bg-[#F7EED9] p-6 sm:p-10 border-4 border-[#8C6D46] shadow-2xl text-[#2B2625] space-y-6 overflow-hidden">
            {/* Watermark Logo */}
            <div className="absolute right-6 top-20 pointer-events-none opacity-10 select-none">
              <span className="font-serif text-8xl font-black text-[#8C6D46]">ᮞᮥᮔ᮪ᮓ</span>
            </div>

            {/* Postal Header */}
            <div className="flex items-start justify-between border-b-2 border-dashed border-[#8C6D46]/40 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xl font-bold text-[#3E4F30]">
                    ᮞᮙ᮪ᮕᮥᮛᮃᮞᮥᮔ᮪
                  </span>
                  <span className="text-xs font-serif italic text-[#8C6D46]">
                    (Sampurasun)
                  </span>
                </div>
                <h2
                  className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2B2625] tracking-tight"
                  style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
                >
                  ᮘᮥᮙᮤ ᮅᮕᮤ • Rumah Tamah Bumi Upi
                </h2>
                <p className="text-[11px] text-[#634E3F]">
                  Dapur Prasmanan Priangan Timur • Jl. Cimanuk No. 312, Garut
                </p>
                <div className="font-mono text-[10px] text-[#8C6D46] pt-1">
                  STRUK DAGANG RESMI: {order?.orderNumber}
                </div>
              </div>

              {/* Vintage Stamp Graphic */}
              <div className="w-20 h-24 rounded border-2 border-dashed border-[#B4532A] bg-[#FFF8EC] p-2 flex flex-col items-center justify-between text-center rotate-3 shadow-sm shrink-0">
                <span className="text-[7px] font-bold uppercase tracking-widest text-[#8C6D46]">
                  GARUT 1928
                </span>
                <span className="text-2xl">☕</span>
                <span className="text-[8px] font-bold text-[#B4532A]">LUNAS</span>
              </div>
            </div>

            {/* Dining Table Info & Date */}
            <div className="grid grid-cols-2 gap-4 text-xs py-2 bg-[#EFE4CB]/70 p-4 rounded-2xl border border-[#D5C7B0]">
              <div>
                <span className="text-[10px] text-[#8C7767] uppercase block font-semibold">
                  Tempat Santap:
                </span>
                <span className="font-serif font-bold text-sm text-[#3E4F30]">
                  {order?.orderType === 'dine_in' ? order?.tableNumber : 'Bawa Pulang (Takeaway)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8C7767] uppercase block font-semibold">
                  Wanci / Tanggal:
                </span>
                <span className="font-medium text-[#2B2625]">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  • {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#8C6D46] uppercase border-b border-[#8C6D46]/30 pb-1">
                <span>Rincian Olahan Dapur</span>
                <span>Jumlah (Rp)</span>
              </div>

              {order?.items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-[#8C6D46]/15 font-serif"
                >
                  <div className="pr-4">
                    <span className="font-bold text-[#2B2625]">
                      {it.quantity}x {it.itemName}
                    </span>
                    {it.notes && (
                      <span className="block text-[10px] text-[#634E3F] italic">
                        Catatan: &ldquo;{it.notes}&rdquo;
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs font-bold text-[#2B2625] shrink-0">
                    {(it.unitPrice * it.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-2 border-t-2 border-dashed border-[#8C6D46]/30 text-xs">
              <div className="flex justify-between text-[#634E3F]">
                <span>Subtotal Masakan:</span>
                <span className="font-mono">Rp {order?.subtotal.toLocaleString('id-ID')}</span>
              </div>

              {order?.discountAmount && order.discountAmount > 0 && (
                <div className="flex justify-between text-[#B4532A] font-semibold">
                  <span>Potongan Berkah Voucher:</span>
                  <span className="font-mono">- Rp {order.discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base font-black text-[#2B2625] pt-2 border-t border-[#8C6D46]/30">
                <span>Total Lunas:</span>
                <span className="font-mono text-[#B4532A]">
                  Rp {order?.finalAmount.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-[#3E4F30] font-bold pt-1">
                <span>Poin Keluarga Bumi Masuk:</span>
                <span>+{order?.pointsEarned} Poin Loyalitas</span>
              </div>
            </div>

            {/* Red Wax Seal & Paribasa Sunda */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-4 border-t-2 border-dashed border-[#8C6D46]/40">
              {/* Wax Seal */}
              <div className="sm:col-span-4 flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A52A2A] via-[#8B0000] to-[#550000] text-amber-200 flex flex-col items-center justify-center shadow-xl border-2 border-amber-300/40 rotate-[-10deg] shrink-0">
                  <span className="text-[10px] font-black tracking-tighter">BUMI</span>
                  <span className="text-[7px] font-mono tracking-widest">LUNAS</span>
                </div>
                <div className="text-[10px] text-[#634E3F] leading-tight">
                  <span className="font-bold text-[#8B0000] block uppercase tracking-wider">
                    Segel Dapur Arang
                  </span>
                  <span>Sah diverifikasi kasir Garut</span>
                </div>
              </div>

              {/* Paribasa Sunda Wisdom */}
              <div className="sm:col-span-8 bg-[#FFF8EC] p-3.5 rounded-2xl border border-[#D5C7B0] space-y-1">
                <span className="text-[10px] font-bold text-[#3E4F30] uppercase tracking-wider block">
                  📜 Paribasa Sunda Dinten Ieu:
                </span>
                <p
                  className="font-serif italic text-xs text-[#2B2625] leading-snug"
                  style={{ fontFamily: 'var(--font-caveat, "Caveat", Georgia, cursive)' }}
                >
                  &ldquo;Kudu landung kandungan laer aisan — Sing sabar tur wijaksana dina ngambah kahirupan.&rdquo;
                </p>
                <span className="text-[9px] text-[#8C7767] block">
                  Hatur nuhun parantos tuang di Bumi Upi. Sing sarehat tur barokah!
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setViewMode('tracker')}
              className="text-xs font-bold text-[#634E3F] hover:underline"
            >
              ← Kembali ke Pelacak Status Meja
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyReceipt}
                className="py-2 px-4 rounded-xl bg-white border border-[#D4A24C] text-[#2B2625] text-xs font-bold hover:bg-[#F5EEDC] shadow-2xs transition flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#3E4F30]" /> : <span>📋</span>}
                <span>{copiedLink ? 'Tersalin!' : 'Salin Teks Struk'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-2 px-4 rounded-xl bg-[#B4532A] text-white text-xs font-bold hover:brightness-110 shadow-xs transition flex items-center gap-1.5"
              >
                <span>🖨️ Cetak / Unduh Struk Digital</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
