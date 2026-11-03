'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Check, Ticket, X } from './icons';

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
  { id: 0, label: '+50 Poin', sub: 'Poin Loyalitas', type: 'points', value: '50 Poin', pointsAmount: 50, color: '#3E4F30', textColor: '#F5EEDC' },
  { id: 1, label: 'Ulen Upi', sub: 'Ketan Bakar Gratis', type: 'item', value: 'Gratis 1 Porsi Ulen Upi', color: '#D4A24C', textColor: '#2B2625' },
  { id: 2, label: 'Diskon 15%', sub: 'Makan Siang Hemat', type: 'voucher', value: 'Voucher DISKON15', color: '#B4532A', textColor: '#FFFFFF' },
  { id: 3, label: 'Es Cincau', sub: 'Jadoel Segar Gratis', type: 'item', value: 'Gratis 1 Gelas Es Cincau Jadoel', color: '#334227', textColor: '#F5EEDC' },
  { id: 4, label: 'Kopi Garut', sub: 'Kopi Tubruk Hangat', type: 'item', value: 'Gratis 1 Cangkir Kopi Tubruk Papandayan', color: '#634E3F', textColor: '#FFFFFF' },
  { id: 5, label: '+100 Poin', sub: 'Jackpot Baraya', type: 'points', value: '100 Poin', pointsAmount: 100, color: '#E5A93C', textColor: '#2B2625' },
];

interface DailySpinProps {
  previewMode?: boolean;
}

export const DailySpin: React.FC<DailySpinProps> = ({ previewMode = false }) => {
  const { customer } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

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
    setShowCelebration(false);

    // Pick a random prize
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const targetPrize = PRIZES[prizeIndex];

    // Total degrees calculation (5 full spins + slice target)
    const segmentDegree = 360 / PRIZES.length;
    // Each segment is 60 degrees. Pointer at top (0 deg).
    // Target angle needs to align segment center with top pointer
    const targetSliceCenter = 360 - (prizeIndex * segmentDegree + segmentDegree / 2);
    const totalRotation = rotation + 360 * 5 + (targetSliceCenter - (rotation % 360));

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setWonPrize(targetPrize);
      setShowCelebration(true);
      setHasSpunToday(true);

      try {
        const todayStr = new Date().toISOString().split('T')[0];
        localStorage.setItem('bumi_daily_spin_date', todayStr);

        // Save won prize to local storage
        const currentPrizes = JSON.parse(localStorage.getItem('bumi_won_prizes') || '[]');
        currentPrizes.unshift({
          date: todayStr,
          prize: targetPrize.value,
          label: targetPrize.label,
        });
        localStorage.setItem('bumi_won_prizes', JSON.stringify(currentPrizes));
      } catch {}
    }, 4000);
  };

  const handleResetDemo = () => {
    setHasSpunToday(false);
    setShowCelebration(false);
    setWonPrize(null);
    try {
      localStorage.removeItem('bumi_daily_spin_date');
    } catch {}
  };

  return (
    <div className="rounded-[2.5rem] bg-gradient-to-br from-[#2B3821] via-[#3E4F30] to-[#25301D] text-[#F5EEDC] p-6 sm:p-10 shadow-xl border-2 border-[#D4A24C]/40 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4A24C]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#B4532A]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            {PRIZES.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-2 text-left"
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

          <div className="pt-2 flex items-center gap-4">
            {previewMode ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/auth?mode=register"
                  className="py-3 px-8 rounded-xl bg-[#D4A24C] hover:bg-[#c4933d] active:scale-95 text-[#2B2625] font-extrabold text-sm shadow-xl flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#2B2625]" />
                  <span>Daftar / Masuk Akun untuk Putar Roda Harian →</span>
                </Link>
                <span className="text-[11px] text-[#D0E2C8]">
                  🔒 1x Putaran Gratis Setiap Hari untuk Member
                </span>
              </div>
            ) : hasSpunToday ? (
              <div className="flex items-center gap-3">
                <div className="py-2.5 px-4 rounded-xl bg-white/10 text-[#D4A24C] text-xs font-bold border border-[#D4A24C]/30 flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#25D366]" />
                  <span>Traktiran hari ini sudah Anda putar! Silakan kembali besok pagi.</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="text-[11px] text-[#D0E2C8] underline hover:text-white"
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
                className="py-3 px-8 rounded-xl bg-[#D4A24C] hover:bg-[#c4933d] active:scale-95 text-[#2B2625] font-extrabold text-sm shadow-xl flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#2B2625]" />
                <span>{spinning ? 'Roda Sedang Berputar...' : 'Putar Roda Traktiran Sekarang!'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Wheel Graphic Column */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          {/* Wheel Pointer */}
          <div className="absolute top-0 z-20 -mt-2.5">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-[#B4532A] drop-shadow-md" />
          </div>

          {/* The Spinning Wheel */}
          <div
            className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-[#D4A24C] shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] ease-[cubic-bezier(0.15,0.85,0.15,1)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: 'conic-gradient(#3E4F30 0deg 60deg, #D4A24C 60deg 120deg, #B4532A 120deg 180deg, #334227 180deg 240deg, #634E3F 240deg 300deg, #E5A93C 300deg 360deg)',
            }}
          >
            {/* Center Pin / Hub */}
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#F5EEDC] border-4 border-[#3E4F30] shadow-xl flex items-center justify-center text-xl z-10">
              👵
            </div>

            {/* Labels on the wheel segments */}
            {PRIZES.map((p, idx) => {
              const angle = idx * 60 + 30; // center of each 60deg slice
              return (
                <div
                  key={p.id}
                  className="absolute inset-0 flex items-start justify-center pt-3 pointer-events-none select-none"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <span
                    className="text-[11px] font-bold tracking-tight px-1.5 py-0.5 rounded shadow-xs"
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
          <p className="text-[11px] text-[#A4BC98] mt-3">
            {previewMode
              ? '🔒 Tampilan Teaser: Fitur putar roda berjalan otomatis saat Anda masuk akun member.'
              : customer
              ? `Member: ${customer.name} (Tier ${customer.tier})`
              : 'Berlaku untuk seluruh Anggota Keluarga Bumi'}
          </p>
        </div>
      </div>

      {/* WINNING CELEBRATION MODAL */}
      {showCelebration && wonPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FBF7EE] border-4 border-[#D4A24C] rounded-[2rem] p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative text-[#2B2625] animate-in zoom-in-95">
            <button
              onClick={() => setShowCelebration(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#634E3F] hover:text-[#2B2625] hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 mx-auto rounded-full bg-[#D4A24C] text-3xl flex items-center justify-center shadow-md animate-bounce">
              🎉
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#B4532A] uppercase tracking-wider">
                Wilujeng! Traktiran Berhasil Didapatkan:
              </span>
              <h3
                className="font-serif text-2xl font-extrabold text-[#3E4F30]"
                style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
              >
                {wonPrize.value}
              </h3>
              <p className="text-xs text-[#634E3F] pt-1">
                Hadiah ini telah tersimpan dan siap Anda nikmati saat berkunjung ke Rumah Tamah Bumi Upi!
              </p>
            </div>

            <div className="p-3 bg-[#E4EADF] rounded-xl border border-[#3E4F30]/30 text-xs font-mono font-bold text-[#3E4F30]">
              KODE KLAIM: TRAKTIRAN-{Math.floor(100000 + Math.random() * 900000)}
            </div>

            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="w-full py-3 px-4 rounded-xl bg-[#3E4F30] hover:brightness-110 text-[#F5EEDC] font-bold text-xs shadow-md transition active:scale-95"
            >
              Simpan Hadiah & Lanjutkan Santap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
