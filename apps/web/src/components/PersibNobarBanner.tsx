'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { MENU_ITEMS } from '../lib/catalogData';
import { Sparkles, Utensils, Check, ArrowRight } from './icons';

interface PersibNobarBannerProps {
  previewMode?: boolean;
}

export const PersibNobarBanner: React.FC<PersibNobarBannerProps> = ({ previewMode = false }) => {
  const { addItem, setOrderType, setTableNumber } = useCart();
  const [isNobarMode, setIsNobarMode] = useState(true);
  const [cheerCount, setCheerCount] = useState(1933);
  const [cheerReaction, setCheerReaction] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Match countdown simulation (towards 19:30 WIB tonight)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 25, seconds: 40 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);

    try {
      const stored = localStorage.getItem('bumi_bobotoh_cheers');
      if (stored) {
        setCheerCount(parseInt(stored, 10));
      }
    } catch {
      // ignore
    }

    return () => clearInterval(timer);
  }, []);

  const handleCheer = () => {
    const nextCount = cheerCount + 1;
    setCheerCount(nextCount);
    try {
      localStorage.setItem('bumi_bobotoh_cheers', nextCount.toString());
    } catch {
      // ignore
    }

    const chants = [
      '🎺 PRIITT! Maung Bandung Juara!',
      '⚽ GOOOLL! Bagimu Persib Jiwa Raga Kami!',
      '💙 Salam Haneut ti Bale Nobar Garut!',
      '🔥 Persib Bandung Salawasna!',
    ];
    const picked = chants[Math.floor(Math.random() * chants.length)];
    setCheerReaction(picked);
    setTimeout(() => setCheerReaction(null), 2500);
  };

  const handleAddNobarBundle = () => {
    // 1. Kopi Hitam Garut (id 74)
    const kopiItem = MENU_ITEMS.find((m) => m.id === 74) || {
      id: 74,
      name: 'Kopi Hitam Garut (Tubruk Panas)',
      category: 'Kopi & Teh Tradisional',
      price: 22000,
    };
    // 2. Ulen Upi Bakar (id 10)
    const ulenItem = MENU_ITEMS.find((m) => m.id === 10) || {
      id: 10,
      name: 'Ulen Upi Goreng Arang',
      category: 'Cemilan Tradisional',
      price: 18000,
    };
    // 3. Bala-Bala (id 8)
    const balaItem = MENU_ITEMS.find((m) => m.id === 8) || {
      id: 8,
      name: 'Bala-Bala Gurih Panas',
      category: 'Gorengan Dadakan',
      price: 15000,
    };

    addItem(kopiItem as any, { temp: 'panas' }, 2);
    addItem(ulenItem as any, {}, 1);
    addItem(balaItem as any, {}, 1);

    // Auto set table to Bale Utama
    setOrderType('dine_in');
    setTableNumber('Meja 09');

    setToastMessage(
      '✓ Paket Nobar Juara (2 Kopi Papandayan + Ulen + Bala-bala) berhasil ditambahkan ke Meja 09 Bale Utama!'
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] transition-all duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 py-3 px-5 rounded-2xl bg-[#002B7F] text-[#F1B300] text-xs font-bold shadow-2xl border-2 border-[#F1B300] flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div
        className={`p-6 sm:p-10 border-2 shadow-2xl transition-all ${
          isNobarMode
            ? 'bg-gradient-to-br from-[#001E54] via-[#002B7F] to-[#0A162B] text-[#F5EEDC] border-[#F1B300]'
            : 'bg-gradient-to-br from-[#3E4F30] via-[#334227] to-[#25301D] text-[#F5EEDC] border-[#D4A24C]'
        }`}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F1B300]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#002B7F]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Bar: Matchday Badge & Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-pulse">⚽</span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F1B300] px-2 py-0.5 rounded bg-black/30 border border-[#F1B300]/50">
                  MATCHDAY BOBOTOH PERSIB • BALE UTAMA
                </span>
                <h3
                  className="font-serif text-xl sm:text-2xl font-black text-white mt-1"
                  style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
                >
                  Mode Nobar & Botram Akbar Persib
                </h3>
              </div>
            </div>

            {/* Toggle Mode Button */}
            <button
              type="button"
              onClick={() => setIsNobarMode(!isNobarMode)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/25 transition flex items-center gap-2 w-fit"
            >
              <span>{isNobarMode ? '🔵 Mode Nobar Aktif' : '🌿 Mode Santai'}</span>
              <span className="text-[10px] text-[#F1B300] underline">(Ubah Mode)</span>
            </button>
          </div>

          {/* Match Info & Big Screen Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Fixture Card */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-black/30 backdrop-blur-xs p-5 rounded-3xl border border-[#F1B300]/40 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#E5EADF]">
                  <span className="flex items-center gap-1.5 font-bold text-[#F1B300]">
                    <span>🔥</span> LAGA KLASIK INDONESIA
                  </span>
                  <span>Si Jalak Harupat • 19.30 WIB</span>
                </div>

                {/* Scoreboard / Versus Graphic */}
                <div className="flex items-center justify-between text-center py-2 px-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex-1 space-y-1">
                    <span className="text-3xl block">🦁</span>
                    <span className="font-serif font-black text-sm sm:text-base text-white">
                      PERSIB BANDUNG
                    </span>
                    <span className="text-[10px] text-[#F1B300] block font-bold">Pangeran Biru</span>
                  </div>

                  <div className="px-4 py-1.5 bg-[#F1B300] text-[#002B7F] font-black rounded-xl text-sm sm:text-base shadow-lg">
                    VS
                  </div>

                  <div className="flex-1 space-y-1">
                    <span className="text-3xl block">🐅</span>
                    <span className="font-serif font-black text-sm sm:text-base text-white">
                      PERSIJA JAKARTA
                    </span>
                    <span className="text-[10px] text-gray-300 block font-bold">Macan Kemayoran</span>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-300">Kickoff Menuju Pertandingan:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[#F1B300] bg-black/40 px-3 py-1 rounded-xl border border-[#F1B300]/30">
                    <span>{String(timeLeft.hours).padStart(2, '0')} Jam</span>
                    <span>:</span>
                    <span>{String(timeLeft.minutes).padStart(2, '0')} Mnt</span>
                    <span>:</span>
                    <span>{String(timeLeft.seconds).padStart(2, '0')} Dtk</span>
                  </div>
                </div>
              </div>

              {/* Facility Note */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-200">
                <span className="flex items-center gap-1">
                  <span>📺</span> Layar Lebar 150 Inch
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>🔊</span> Tata Suara Surround
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>🏮</span> Bale Utama Meja 09-12
                </span>
              </div>
            </div>

            {/* Right: Paket Nobar 1-Click Order & Cheer Button */}
            <div className="lg:col-span-5 space-y-4">
              {/* 1-Click Nobar Pack Box */}
              <div className="p-5 rounded-3xl bg-[#00153B] border-2 border-[#F1B300] space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1B300] text-[#002B7F]">
                    PROMO NOBAR BUNDLE
                  </span>
                  <span className="text-xs line-through text-gray-400">Rp 77.000</span>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-white">
                    Paket Nobar Juara Bobotoh
                  </h4>
                  <p className="text-[11px] text-gray-300 leading-snug mt-0.5">
                    2x Kopi Garut Tubruk Panas + 1x Ulen Bakar Arang Sambel Oncom + 1x Bala-bala Renyah.
                  </p>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-white/10">
                  <span className="text-xs text-gray-300">Harga Paket Nobar:</span>
                  <span className="font-serif text-lg font-black text-[#F1B300]">
                    Rp 55.000
                  </span>
                </div>

                {previewMode ? (
                  <Link
                    href="/auth?mode=register"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#F1B300] hover:bg-[#ffc824] active:scale-95 text-[#002B7F] font-black text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Daftar / Masuk Akun untuk Pesan Paket Nobar →</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddNobarBundle}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#F1B300] hover:bg-[#ffc824] active:scale-95 text-[#002B7F] font-black text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>1-Klik Pesan ke Bale Meja 09 →</span>
                  </button>
                )}
              </div>

              {/* Cheer Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCheer}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-lg border border-blue-400/40 flex items-center justify-center gap-2 transition"
                >
                  <span className="text-base">📢</span>
                  <span>Tiup Peluit & Sorak Biru!</span>
                </button>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-gray-300 block">Total Sorakan</span>
                  <span className="font-mono text-sm font-black text-[#F1B300]">
                    {cheerCount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Dynamic Cheer Shout */}
              {cheerReaction && (
                <div className="p-2.5 rounded-xl bg-blue-900/90 border border-[#F1B300] text-center text-xs font-bold text-[#F1B300] animate-bounce">
                  {cheerReaction}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
