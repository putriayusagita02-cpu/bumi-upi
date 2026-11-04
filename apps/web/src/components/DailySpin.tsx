'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MENU_ITEMS } from '../lib/catalogData';
import { Voucher } from '../lib/types';
import { Sparkles, Check, Ticket, X } from './icons';
import { createVoucherFromPrize, saveHokiVoucher } from '../lib/voucherStore';

interface Prize {
  id: number;
  label: string;
  sub: string;
  type: 'points' | 'item' | 'voucher';
  value: string;
  pointsAmount?: number;
  color: string;
  textColor: string;
}

const PRIZES: Prize[] = [
  { id: 0, label: '+50 Poin', sub: 'Poin Loyalitas', type: 'points', value: '50 Poin Bonus', pointsAmount: 50, color: '#3E4F30', textColor: '#F5EEDC' },
  { id: 1, label: 'Ulen Upi', sub: 'Ketan Bakar Gratis', type: 'item', value: 'Gratis 1 Porsi Ulen Upi', color: '#D4A24C', textColor: '#2B2625' },
  { id: 2, label: 'Diskon 15%', sub: 'Makan Siang Hemat', type: 'voucher', value: 'Voucher DISKON15', color: '#B4532A', textColor: '#FFFFFF' },
  { id: 3, label: 'Es Cincau', sub: 'Jadoel Segar Gratis', type: 'item', value: 'Gratis 1 Gelas Es Cincau Jadoel', color: '#334227', textColor: '#F5EEDC' },
  { id: 4, label: 'Kopi Garut', sub: 'Kopi Tubruk Hangat', type: 'item', value: 'Gratis 1 Cangkir Kopi Tubruk Papandayan', color: '#634E3F', textColor: '#FFFFFF' },
  { id: 5, label: '+100 Poin', sub: 'Jackpot Baraya', type: 'points', value: '100 Poin Jackpot', pointsAmount: 100, color: '#E5A93C', textColor: '#2B2625' },
];

interface DailySpinProps {
  previewMode?: boolean;
}

export const DailySpin: React.FC<DailySpinProps> = ({ previewMode = false }) => {
  const router = useRouter();
  const { customer, addPoints, isLoggedIn } = useAuth();
  const { applyVoucher, addItem } = useCart();

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [generatedVoucher, setGeneratedVoucher] = useState<Voucher | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem('bumi_daily_spin_date');
      if (savedDate === todayStr) {
        setHasSpunToday(true);
      }
    } catch {}
  }, []);

  const handleSpin = () => {
    if (spinning) return;

    setSpinning(true);
    setWonPrize(null);
    setGeneratedVoucher(null);
    setShowCelebration(false);
    setCopiedCode(false);
    setSavedSuccessMsg(null);

    // Pick a random prize
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const targetPrize = PRIZES[prizeIndex];

    // Total degrees calculation (5 full spins + slice target)
    const segmentDegree = 360 / PRIZES.length;
    const targetSliceCenter = 360 - (prizeIndex * segmentDegree + segmentDegree / 2);
    const totalRotation = rotation + 360 * 5 + (targetSliceCenter - (rotation % 360));

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setWonPrize(targetPrize);
      setHasSpunToday(true);

      const todayStr = new Date().toISOString().split('T')[0];
      try {
        localStorage.setItem('bumi_daily_spin_date', todayStr);
      } catch {}

      // 1. Jika Hadiah Poin: Langsung tambahkan ke saldo member
      if (targetPrize.type === 'points' && targetPrize.pointsAmount) {
        addPoints(targetPrize.pointsAmount);
        setGeneratedVoucher(null);
      }

      // 2. Jika Hadiah Voucher / Item Makanan: Buat voucher nyata & simpan ke Dompet Voucher
      let createdVouch: Voucher | null = null;
      if (targetPrize.type === 'voucher' || targetPrize.type === 'item') {
        createdVouch = createVoucherFromPrize(targetPrize);
        if (createdVouch) {
          saveHokiVoucher(createdVouch);
          setGeneratedVoucher(createdVouch);
        }
      }

      // 3. Catat di riwayat hadiah harian
      try {
        const currentPrizes = JSON.parse(localStorage.getItem('bumi_won_prizes') || '[]');
        currentPrizes.unshift({
          date: todayStr,
          prize: targetPrize.value,
          label: targetPrize.label,
          code: createdVouch?.code,
          type: targetPrize.type,
        });
        localStorage.setItem('bumi_won_prizes', JSON.stringify(currentPrizes));
      } catch {}

      setShowCelebration(true);
    }, 4000);
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {}
  };

  // Langsung pakai hadiah di keranjang santapan
  const handleUseDirectlyInCart = () => {
    if (!generatedVoucher) return;

    // Pasang voucher ke keranjang
    applyVoucher(generatedVoucher);

    // Jika hadiah berupa item makanan/minuman gratis, otomatis masukkan 1 porsi ke keranjang!
    if (generatedVoucher.freeItemId) {
      const freeMenuItem = MENU_ITEMS.find((m) => m.id === generatedVoucher.freeItemId);
      if (freeMenuItem) {
        addItem(freeMenuItem, { notes: 'Traktiran Gratis Pojok Hoki' }, 1);
      }
    }

    setShowCelebration(false);
    router.push('/cart');
  };

  const handleSaveToWallet = () => {
    setSavedSuccessMsg('✓ Hadiah berhasil tersimpan di Dompet Voucher Member!');
    setTimeout(() => {
      setShowCelebration(false);
      setSavedSuccessMsg(null);
    }, 1500);
  };

  const handleResetDemo = () => {
    setHasSpunToday(false);
    setShowCelebration(false);
    setWonPrize(null);
    setGeneratedVoucher(null);
    try {
      localStorage.removeItem('bumi_daily_spin_date');
    } catch {}
  };

  return (
    <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#2B3821] via-[#3E4F30] to-[#25301D] text-[#F5EEDC] p-5 sm:p-10 shadow-xl border-2 border-[#D4A24C]/40 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4A24C]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#B4532A]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
        {/* Left Information Column */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A24C]/20 border border-[#D4A24C]/50 text-xs font-bold text-[#D4A24C] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A24C]" />
            <span>Pojok Hoki • Traktiran Nenek</span>
          </div>

          <h2
            className="font-serif text-2xl sm:text-4xl font-extrabold text-[#F5EEDC] leading-snug"
            style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
          >
            Putar Roda Traktiran Harian Keluarga Bumi!
          </h2>

          <p className="text-xs sm:text-sm text-[#D0E2C8] leading-relaxed max-w-xl">
            Sebagai apresiasi kesetiaan Anda di Rumah Tamah Bumi Upi, setiap anggota berhak memutar <strong>1x Roda Keberuntungan Harian</strong>. Dapatkan traktiran ulen bakar gratis, es cincau jadoel, voucher diskon 15%, hingga bonus 100 Poin Loyalitas!
          </p>

          {/* Prize Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1">
            {PRIZES.map((p) => (
              <div
                key={p.id}
                className="p-2 sm:p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-2 text-left"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#F5EEDC] truncate">{p.label}</p>
                  <p className="text-[10px] text-[#A4BC98] truncate">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {previewMode ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/auth?mode=register"
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[#D4A24C] hover:bg-[#c4933d] active:scale-95 text-[#2B2625] font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all text-center"
                >
                  <Sparkles className="w-4 h-4 text-[#2B2625]" />
                  <span>Daftar / Masuk Akun untuk Putar Roda Harian →</span>
                </Link>
                <span className="text-[11px] text-[#D0E2C8] text-center sm:text-left">
                  🔒 1x Putaran Gratis Setiap Hari untuk Member
                </span>
              </div>
            ) : hasSpunToday ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <div className="py-2.5 px-4 rounded-xl bg-white/10 text-[#D4A24C] text-xs font-bold border border-[#D4A24C]/30 flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>Traktiran hari ini sudah Anda putar! Silakan kembali besok pagi.</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="text-[11px] text-[#D0E2C8] underline hover:text-white pl-1"
                  title="Reset status untuk mencoba putar lagi (Simulasi Demo)"
                >
                  (Coba Putar Lagi)
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSpin}
                disabled={spinning}
                className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#D4A24C] hover:bg-[#c4933d] active:scale-95 text-[#2B2625] font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#2B2625]" />
                <span>{spinning ? 'Roda Sedang Berputar...' : 'Putar Roda Traktiran Sekarang!'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Wheel Graphic Column */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative pt-2 sm:pt-0">
          {/* Wheel Pointer */}
          <div className="absolute top-2 sm:top-0 z-20 -mt-2.5">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-[#B4532A] drop-shadow-md" />
          </div>

          {/* The Spinning Wheel */}
          <div
            className="w-60 h-60 sm:w-72 sm:h-72 max-w-[80vw] max-h-[80vw] rounded-full border-4 border-[#D4A24C] shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] ease-[cubic-bezier(0.15,0.85,0.15,1)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: 'conic-gradient(#3E4F30 0deg 60deg, #D4A24C 60deg 120deg, #B4532A 120deg 180deg, #334227 180deg 240deg, #634E3F 240deg 300deg, #E5A93C 300deg 360deg)',
            }}
          >
            {/* Center Pin / Hub */}
            <div className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F5EEDC] border-4 border-[#3E4F30] shadow-xl flex items-center justify-center text-lg sm:text-xl z-10">
              👵
            </div>

            {/* Labels on the wheel segments */}
            {PRIZES.map((p, idx) => {
              const angle = idx * 60 + 30; // center of each 60deg slice
              return (
                <div
                  key={p.id}
                  className="absolute inset-0 flex items-start justify-center pt-2.5 sm:pt-3 pointer-events-none select-none"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <span
                    className="text-[10px] sm:text-[11px] font-bold tracking-tight px-1.5 py-0.5 rounded shadow-xs"
                    style={{
                      color: p.textColor,
                      backgroundColor: 'rgba(0,0,0,0.25)',
                    }}
                  >
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick status underneath */}
          <p className="text-[11px] text-[#A4BC98] mt-3 text-center">
            {previewMode
              ? '🔒 Tampilan Teaser: Masuk / Daftar akun untuk memutar roda harian.'
              : customer
              ? `Member: ${customer.name} (Saldo: ${customer.pointsBalance} Poin)`
              : 'Berlaku untuk seluruh Anggota Keluarga Bumi'}
          </p>
        </div>
      </div>

      {/* WINNING CELEBRATION MODAL */}
      {showCelebration && wonPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FBF7EE] border-4 border-[#D4A24C] rounded-[2rem] p-5 sm:p-7 max-w-sm w-full text-center space-y-4 shadow-2xl relative text-[#2B2625] animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCelebration(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#634E3F] hover:text-[#2B2625] hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#D4A24C] text-2xl sm:text-3xl flex items-center justify-center shadow-md animate-bounce">
              🎉
            </div>

            <div className="space-y-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#B4532A] uppercase tracking-wider">
                Wilujeng! Hadiah Berhasil Didapatkan:
              </span>
              <h3
                className="font-serif text-xl sm:text-2xl font-extrabold text-[#3E4F30]"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                {wonPrize.value}
              </h3>
              <p className="text-xs text-[#634E3F] pt-0.5 leading-relaxed">
                {wonPrize.type === 'points'
                  ? `Saldo Poin Anda telah bertambah +${wonPrize.pointsAmount} Poin otomatis!`
                  : 'Voucher hadiah telah langsung masuk dan tersimpan di Dompet Voucher Member Anda.'}
              </p>
            </div>

            {/* Voucher Code Box (Untuk Hadiah Diskon / Menu Gratis) */}
            {generatedVoucher && (
              <div className="p-3 bg-[#E4EADF] rounded-xl border border-[#3E4F30]/30 text-center space-y-1.5">
                <span className="text-[10px] text-[#3E4F30] font-bold uppercase tracking-wider block">
                  KODE VOUCHER ANDA:
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-base font-extrabold text-[#B4532A] tracking-wider px-2 py-0.5 bg-white rounded-lg border border-[#D5C7B0]">
                    {generatedVoucher.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(generatedVoucher.code)}
                    className="py-1 px-2.5 rounded-lg bg-[#3E4F30] text-white text-[11px] font-bold hover:brightness-110 active:scale-95"
                  >
                    {copiedCode ? '✓ Disalin' : 'Salin'}
                  </button>
                </div>
                <p className="text-[10px] text-[#634E3F]">
                  {generatedVoucher.description}
                </p>
              </div>
            )}

            {/* Points confirmation */}
            {wonPrize.type === 'points' && (
              <div className="p-3 bg-[#FDF7EE] rounded-xl border border-[#D4A24C] text-xs text-[#3E4F30] font-semibold space-y-0.5">
                <p className="font-bold">🪙 Saldo Poin Baru: {customer ? customer.pointsBalance : 0} Poin</p>
                <p className="text-[11px] text-[#634E3F]">Gunakan poin untuk potongan belanja di kasir atau tukar voucher.</p>
              </div>
            )}

            {savedSuccessMsg && (
              <div className="p-2 rounded-lg bg-green-100 text-green-800 text-xs font-bold animate-in fade-in">
                {savedSuccessMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {generatedVoucher ? (
                <>
                  <button
                    type="button"
                    onClick={handleUseDirectlyInCart}
                    className="w-full py-3 px-4 rounded-xl bg-[#B4532A] hover:brightness-110 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Gunakan di Keranjang Sekarang →</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToWallet}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#3E4F30] text-[#3E4F30] hover:bg-[#3E4F30]/10 font-bold text-xs transition active:scale-95"
                  >
                    Simpan ke Dompet Voucher
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowCelebration(false);
                    router.push('/member');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#3E4F30] hover:brightness-110 text-[#F5EEDC] font-bold text-xs shadow-md transition active:scale-95"
                >
                  Lihat Kartu Member & Saldo Poin →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
