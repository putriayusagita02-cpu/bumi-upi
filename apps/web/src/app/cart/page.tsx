'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { MENU_ITEMS } from '../../lib/catalogData';
import { Voucher } from '../../lib/types';
import { getAllAvailableVouchers, findVoucherByCode } from '../../lib/voucherStore';
import { TableSelectorModal } from '../../components/TableSelectorModal';
import { Plus, Minus, X, Ticket, ShoppingBag, Utensils, ArrowRight, ArrowLeft } from '../../components/icons';
import { asmrAudioEngine } from '../../lib/asmrAudioEngine';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    tableNumber,
    orderType,
    addItem,
    updateQuantity,
    setItemQuantity,
    removeItem,
    clearCart,
    subtotal,
    discountAmount,
    totalAmount,
    totalItemsCount,
    estimatedPoints,
    appliedVoucher,
    applyVoucher,
    removeVoucher,
  } = useCart();

  const { customer } = useAuth();
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isPlayingSoundtrack, setIsPlayingSoundtrack] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    setAvailableVouchers(getAllAvailableVouchers());
  }, []);

  const toggleSoundtrack = () => {
    if (isPlayingSoundtrack) {
      asmrAudioEngine.stop();
      setIsPlayingSoundtrack(false);
    } else {
      asmrAudioEngine.startOrderingAmbience();
      setIsPlayingSoundtrack(true);
    }
  };

  const handleApplyVoucherCode = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError('');
    setVoucherSuccess('');

    const code = voucherInput.trim().toUpperCase();
    if (!code) return;

    const found = findVoucherByCode(code);
    if (!found) {
      setVoucherError('Kode voucher tidak ditemukan atau belum aktif');
      return;
    }

    const res = applyVoucher(found);
    if (!res.success) {
      setVoucherError(res.message);
    } else {
      setVoucherSuccess(res.message);
      setVoucherInput('');
      // Jika voucher berupa gratis menu, pastikan item tersebut ada di keranjang
      if (found.freeItemId) {
        const hasItem = items.some((it) => it.menuItem.id === found.freeItemId);
        if (!hasItem) {
          const freeItem = MENU_ITEMS.find((m) => m.id === found.freeItemId);
          if (freeItem) {
            addItem(freeItem, { notes: 'Traktiran Gratis Pojok Hoki' }, 1);
          }
        }
      }
    }
  };

  const handleSelectVoucherPill = (v: Voucher) => {
    setVoucherError('');
    setVoucherSuccess('');
    const res = applyVoucher(v);
    if (!res.success) {
      setVoucherError(res.message);
    } else {
      setVoucherSuccess(res.message);
      // Jika voucher berupa gratis menu, pastikan item tersebut ada di keranjang
      if (v.freeItemId) {
        const hasItem = items.some((it) => it.menuItem.id === v.freeItemId);
        if (!hasItem) {
          const freeItem = MENU_ITEMS.find((m) => m.id === v.freeItemId);
          if (freeItem) {
            addItem(freeItem, { notes: 'Traktiran Gratis Pojok Hoki' }, 1);
          }
        }
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-[#FBF7EE] p-8 rounded-3xl border border-[#E8DCC2] shadow-sm">
        <span className="text-5xl">🛍️</span>
        <h2
          className="font-serif text-2xl font-bold text-[#2B2625]"
          style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
        >
          Keranjang Masih Kosong
        </h2>
        <p className="text-xs text-[#634E3F] leading-relaxed">
          Belum ada santapan atau seduhan yang dipilih. Yuk jelajahi menu otentik Rumah Tamah Bumi Upi!
        </p>
        <div className="pt-2">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl font-bold text-xs text-white shadow-md hover:brightness-110"
            style={{ backgroundColor: '#B4532A' }}
          >
            <span>Mulai Pilih Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DCC2]">
        <div>
          <h1
            className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2625]"
            style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
          >
            Keranjang Santapan
          </h1>
          <p className="text-xs text-[#634E3F]">
            {totalItemsCount} item terpilih untuk {orderType === 'dine_in' ? `Dine-in di ${tableNumber}` : 'Bawa Pulang (Takeaway)'}
          </p>
        </div>

        {/* Change Table Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsTableModalOpen(true)}
            className="flex items-center gap-2 py-2 px-3.5 rounded-xl border border-[#D4A24C] bg-[#FDF7EE] text-xs font-bold text-[#2B2625] hover:bg-[#F8EECF] transition-colors"
          >
            {orderType === 'dine_in' ? (
              <Utensils className="w-4 h-4 text-[#3E4F30]" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-[#B4532A]" />
            )}
            <span>{orderType === 'dine_in' ? tableNumber : 'Takeaway'}</span>
            <span className="text-[10px] text-[#B4532A] underline">(Ganti)</span>
          </button>

          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-[#8C7767] hover:text-[#B4532A] font-medium"
          >
            Kosongkan
          </button>
        </div>
      </div>

      {/* Soundtrack Ambient Player (Sedang Memesan) */}
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#3E4F30] via-[#465B36] to-[#2B3A21] text-[#F5EEDC] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 border border-[#D4A24C]/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4A24C]/20 border border-[#D4A24C]/40 flex items-center justify-center text-lg shrink-0">
            {isPlayingSoundtrack ? '🎶' : '🎵'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wide">Soundtrack Alunan Menemani Pesanan Anda</span>
              {isPlayingSoundtrack && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4A24C] text-[#2B2625] font-bold animate-pulse">
                  Sedang Mengalun ♫
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#E0D4BA] leading-tight">
              Kacapi Pasundan & suasana ramah Rumah Nenek Garut menemani Anda memilih santapan.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleSoundtrack}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 active:scale-95 ${
            isPlayingSoundtrack
              ? 'bg-[#B4532A] text-white hover:brightness-110'
              : 'bg-[#F5EEDC] text-[#3E4F30] hover:bg-white'
          }`}
        >
          <span>{isPlayingSoundtrack ? '⏸ Jeda Soundtrack' : '▶ Putar Soundtrack (Kacapi Pasundan)'}</span>
        </button>
      </div>

      {/* Main Grid: Cart Items (Left) & Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Item list */}
        <div className="lg:col-span-7 space-y-3">
          {items.map((it) => {
            const itemTotal = it.unitPrice * it.quantity;
            return (
              <div
                key={it.cartItemId}
                className="p-4 rounded-2xl bg-[#FBF7EE] border border-[#E8DCC2] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#E4EADF] text-[#3E4F30] uppercase">
                      {it.menuItem.category}
                    </span>
                    {it.customization.size && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#F5EEDC] text-[#634E3F] border border-[#E0D4BA]">
                        Size: {it.customization.size}
                      </span>
                    )}
                    {it.customization.temp && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#F5EEDC] text-[#634E3F] border border-[#E0D4BA]">
                        {it.customization.temp === 'panas' ? '🔥 Panas' : '❄️ Dingin'}
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif text-sm font-bold text-[#2B2625]">
                    {it.menuItem.name}
                  </h4>

                  {it.customization.notes && (
                    <p className="text-[11px] text-[#8C7767] italic">
                      &quot;{it.customization.notes}&quot;
                    </p>
                  )}

                  <p className="text-xs font-semibold text-[#B4532A]">
                    Rp {it.unitPrice.toLocaleString('id-ID')} / porsi
                  </p>
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#E8DCC2] rounded-xl bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(it.cartItemId, -1)}
                        className="p-1.5 px-2 hover:bg-[#F5EEDC] text-[#2B2625] transition-colors"
                        aria-label="Kurangi"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={it.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 1) {
                            setItemQuantity(it.cartItemId, val);
                          }
                        }}
                        className="w-14 text-center font-mono font-bold text-xs text-[#2B2625] border-x border-[#E8DCC2] py-1.5 focus:outline-none focus:bg-[#FFFDF9]"
                        aria-label="Ketik jumlah porsi langsung"
                        title="Bisa ketik langsung (misal: 10)"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(it.cartItemId, 1)}
                        className="p-1.5 px-2 hover:bg-[#F5EEDC] text-[#2B2625] transition-colors"
                        aria-label="Tambah"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[5rem]">
                      <span className="font-serif text-sm font-bold text-[#2B2625]">
                        Rp {itemTotal.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(it.cartItemId)}
                      className="p-1 text-[#8C7767] hover:text-[#B4532A] transition-colors"
                      title="Hapus dari keranjang"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tombol Cepat Porsi: 1, 2, 3, 4, 10 */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-[#8C7767] font-medium">Beli Cepat:</span>
                    {[1, 2, 3, 4, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setItemQuantity(it.cartItemId, num)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          it.quantity === num
                            ? 'bg-[#B4532A] text-white shadow-2xs'
                            : 'bg-white border border-[#E8DCC2] text-[#634E3F] hover:bg-[#F5EEDC]'
                        }`}
                        title={`Atur ke ${num} porsi`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3E4F30] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tambah Santapan Lain dari Menu</span>
            </Link>
          </div>
        </div>

        {/* Right: Vouchers & Checkout Summary */}
        <div className="lg:col-span-5 space-y-4">
          {/* Voucher Box */}
          <div className="p-5 rounded-2xl bg-[#FBF7EE] border border-[#E8DCC2] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#B4532A]" />
                <h4 className="font-serif text-sm font-bold text-[#2B2625]">
                  Voucher & Kupon Diskon
                </h4>
              </div>
              {appliedVoucher && (
                <button
                  type="button"
                  onClick={removeVoucher}
                  className="text-[11px] text-[#B4532A] font-semibold hover:underline"
                >
                  Lepas
                </button>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleApplyVoucherCode} className="flex gap-2">
              <input
                type="text"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
                placeholder="Kode kupon (misal: BUMIWELCOME)"
                className="flex-1 py-2 px-3 rounded-xl border border-[#E8DCC2] text-xs font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#3E4F30]"
              />
              <button
                type="submit"
                className="py-2 px-3 rounded-xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
              >
                Pakai
              </button>
            </form>

            {voucherError && <p className="text-xs text-[#B4532A]">{voucherError}</p>}
            {voucherSuccess && <p className="text-xs text-[#3E4F30] font-medium">{voucherSuccess}</p>}

            {/* Available Vouchers Quick Selection */}
            <div className="pt-2 border-t border-[#E8DCC2]/60 space-y-1.5">
              <p className="text-[10px] text-[#8C7767] uppercase font-bold tracking-wider">
                Voucher Tersedia untuk Anda:
              </p>
              <div className="space-y-1.5">
                {availableVouchers.map((v) => {
                  const isApplied = appliedVoucher?.id === v.id;
                  const isEligible = subtotal >= v.minSpend;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVoucherPill(v)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start justify-between gap-2 ${
                        isApplied
                          ? 'border-[#3E4F30] bg-[#E4EADF] text-[#3E4F30] font-bold ring-1 ring-[#3E4F30]'
                          : v.isFromHoki
                          ? 'border-[#D4A24C] bg-[#FFFBF0] hover:border-[#B4532A]'
                          : isEligible
                          ? 'border-[#E8DCC2] bg-white hover:border-[#D4A24C]'
                          : 'border-[#E8DCC2] bg-white/60 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-[#B4532A]">{v.code}</span>
                          <span className="font-semibold text-[#2B2625]">{v.title}</span>
                          {v.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#D4A24C] text-[#2B2625] font-extrabold shadow-2xs">
                              {v.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#634E3F] mt-0.5">{v.description}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-[#3E4F30] shrink-0">
                        {isApplied ? '✓ Terpasang' : isEligible ? 'Gunakan' : v.minSpend > 0 ? `Min. Rp ${(v.minSpend / 1000)}rb` : 'Gunakan'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cost Summary Box */}
          <div className="p-6 rounded-2xl bg-[#FBF7EE] border border-[#E8DCC2] shadow-md space-y-4">
            <h4 className="font-serif text-sm font-bold text-[#2B2625] pb-2 border-b border-[#E8DCC2]">
              Ringkasan Pembayaran
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#634E3F]">
                <span>Subtotal ({totalItemsCount} item)</span>
                <span className="font-medium text-[#2B2625]">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#B4532A] font-semibold">
                  <span>Diskon Kupon ({appliedVoucher?.code})</span>
                  <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between text-[#3E4F30] pt-1 border-t border-[#E8DCC2]/60">
                <span className="flex items-center gap-1">
                  <span>🪙</span>
                  <span>Estimasi Poin Didapat</span>
                </span>
                <span className="font-bold">+{estimatedPoints} Poin</span>
              </div>

              <div className="pt-3 border-t border-[#E8DCC2] flex justify-between items-baseline">
                <span className="font-bold text-sm text-[#2B2625]">Total Tagihan</span>
                <span className="font-serif text-xl font-black text-[#B4532A]">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={() => {
                if (!customer) {
                  router.push('/auth');
                } else {
                  router.push('/checkout');
                }
              }}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-110"
              style={{ backgroundColor: '#B4532A' }}
            >
              <span>{customer ? 'Lanjut ke Pembayaran QRIS' : 'Masuk untuk Bayar QRIS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />
    </div>
  );
}
