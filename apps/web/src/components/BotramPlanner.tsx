'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { MENU_ITEMS } from '../lib/catalogData';
import { Utensils, Check, Sparkles, ShoppingBag, Flame, Heart } from './icons';

interface BotramOption {
  pax: number;
  label: string;
  tagline: string;
  baseDiscountPct: number;
}

const PAX_OPTIONS: BotramOption[] = [
  { pax: 2, label: 'Duaan (2 Porsi)', tagline: 'Pas untuk berdua, kencan santai di teras', baseDiscountPct: 5 },
  { pax: 4, label: 'Keluarga Cilik (4 Porsi)', tagline: 'Paket terfavorit keluarga inti', baseDiscountPct: 10 },
  { pax: 6, label: 'Rombongan (6 Porsi)', tagline: 'Santap hangat bersama kerabat', baseDiscountPct: 12 },
  { pax: 8, label: 'Keluarga Besar (8 Porsi)', tagline: 'Kumpul baraya lengkap di bale kayu', baseDiscountPct: 15 },
  { pax: 10, label: 'Bale Riung (10 Porsi)', tagline: 'Pesta liwetan akbar khas Priangan', baseDiscountPct: 20 },
];

interface BotramPlannerProps {
  previewMode?: boolean;
}

export const BotramPlanner: React.FC<BotramPlannerProps> = ({ previewMode = false }) => {
  const { addItem } = useCart();
  const [selectedPax, setSelectedPax] = useState<number>(4);
  const [selectedMainId, setSelectedMainId] = useState<number>(22); // Pepes Goreng Ayam Kampung
  const [selectedSideId, setSelectedSideId] = useState<number>(10); // Ulen Upi
  const [selectedDrinkId, setSelectedDrinkId] = useState<number>(49); // Es Cincau Jadoel
  const [sambalChoice, setSambalChoice] = useState<'hejo' | 'rewel' | 'terasi'>('hejo');
  const [addedToast, setAddedToast] = useState(false);

  // Available options mapped to actual MENU_ITEMS
  const mainChoices = [
    { id: 22, name: 'Pepes Goreng Ayam Kampung', price: 48000, desc: 'Ayam kampung gurih rempah kemangi' },
    { id: 48, name: 'Bebek Sambel Hejo', price: 45000, desc: 'Bebek renyah empuk khas Garut' },
    { id: 42, name: 'Lidah Sambel Hejo', price: 47000, desc: 'Lidah sapi lembut berlumur cabai hijau' },
    { id: 46, name: 'Nasi Ayam Kalasan', price: 32000, desc: 'Ayam legit manis tabur kremes gurih' },
  ];

  const sideChoices = [
    { id: 10, name: 'Ulen Upi Dapur Nenek', price: 22000, desc: 'Ketan bakar kelapa arang' },
    { id: 15, name: 'Cireng Tahu Gejrot', price: 18000, desc: 'Kenyal renyah kuah asam pedas' },
    { id: 12, name: 'Gorengan Darmaji', price: 17000, desc: 'Bala-bala, gehu & tempe krispi' },
    { id: 7, name: 'Pisang Goreng Keemasan', price: 20000, desc: 'Pisang kepok manis renyah' },
  ];

  const drinkChoices = [
    { id: 49, name: 'Es Cincau Jadoel Gula Aren', price: 19000, desc: 'Santan gurih & gula aren kental' },
    { id: 57, name: 'Es Cendol Tradisional', price: 18000, desc: 'Cendol kenyal pandan wangi' },
    { id: 65, name: 'Teh Sereh Hangat', price: 17000, desc: 'Seduhan sereh herbal pelega tenggorokan' },
    { id: 74, name: 'Kopi Hitam Papandayan', price: 17000, desc: 'Kopi tubruk robusta-arabika lokal' },
  ];

  const currentPaxConfig = PAX_OPTIONS.find((p) => p.pax === selectedPax) || PAX_OPTIONS[1];
  const currentMain = mainChoices.find((m) => m.id === selectedMainId) || mainChoices[0];
  const currentSide = sideChoices.find((s) => s.id === selectedSideId) || sideChoices[0];
  const currentDrink = drinkChoices.find((d) => d.id === selectedDrinkId) || drinkChoices[0];

  // Nasi Liwet Kastrol base price: Rp 15.000 per person
  const nasiLiwetPerPax = 15000;
  const rawSubtotal =
    (nasiLiwetPerPax + currentMain.price + currentDrink.price) * selectedPax +
    currentSide.price * Math.ceil(selectedPax / 2);

  const discountAmount = Math.round((rawSubtotal * currentPaxConfig.baseDiscountPct) / 100);
  const finalPrice = rawSubtotal - discountAmount;

  const handleAddFeastToCart = () => {
    // 1. Add Nasi Liwet as main item with special customization note
    const liwetItem = MENU_ITEMS.find((m) => m.id === 36) || {
      id: 999,
      name: `Paket Nasi Liwet Kastrol Botram (${selectedPax} Porsi)`,
      category: 'Nasi & Makanan Utama',
      price: Math.round(finalPrice / selectedPax),
      description: `Paket liwetan komplit ${selectedPax} porsi daun pisang dengan ${currentMain.name}, ${currentSide.name}, ${currentDrink.name}, & Sambal ${sambalChoice}.`,
    };

    // Add main items
    const mainCatalogItem = MENU_ITEMS.find((m) => m.id === currentMain.id);
    if (mainCatalogItem) {
      addItem(
        mainCatalogItem,
        { notes: `[Paket Botram ${selectedPax} Porsi] Lauk Utama. Sambal: ${sambalChoice}` },
        selectedPax
      );
    }

    // Add side dish
    const sideCatalogItem = MENU_ITEMS.find((m) => m.id === currentSide.id);
    if (sideCatalogItem) {
      addItem(
        sideCatalogItem,
        { notes: `[Paket Botram ${selectedPax} Porsi] Cemilan Pendamping` },
        Math.ceil(selectedPax / 2)
      );
    }

    // Add drinks
    const drinkCatalogItem = MENU_ITEMS.find((m) => m.id === currentDrink.id);
    if (drinkCatalogItem) {
      addItem(
        drinkCatalogItem,
        { notes: `[Paket Botram ${selectedPax} Porsi] Seduhan Minuman` },
        selectedPax
      );
    }

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  return (
    <div className="rounded-[2.5rem] bg-[#FBF7EE] border-2 border-[#D4A24C]/40 p-6 sm:p-10 shadow-lg text-[#2B2625] space-y-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#3E4F30]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#B4532A]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-20 right-6 z-50 py-3.5 px-5 rounded-2xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold shadow-2xl border-2 border-[#D4A24C] flex items-center gap-2.5 animate-bounce">
          <Check className="w-4 h-4 text-[#D4A24C]" />
          <span>✓ Seluruh Paket Botram ({selectedPax} Porsi) berhasil dimasukkan ke Keranjang Belanja!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4EADF] border border-[#3E4F30]/30 text-xs font-bold text-[#3E4F30] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A24C]" />
          <span>Tradisi Dapur Garut • Botram Nenek</span>
        </div>
        <h2
          className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2625] tracking-tight"
          style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
        >
          Kalkulator Paket Botram & Liwetan Keluarga
        </h2>
        <p className="text-xs sm:text-sm text-[#634E3F] max-w-2xl leading-relaxed">
          Nikmati sensasi santap bersama beralaskan daun pisang segar di atas bale kayu. Pilih jumlah anggota keluarga dan racik lauk favorit Anda, kami hitung otomatis dengan diskon paket hemat keluarga!
        </p>
      </div>

      {/* Step 1: Pilih Jumlah Anggota / Porsi (Pax) */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-[#3E4F30] flex items-center justify-between">
          <span>1. Pilih Jumlah Porsi Rombongan:</span>
          <span className="text-[#B4532A] font-semibold">Hemat s/d {currentPaxConfig.baseDiscountPct}%</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {PAX_OPTIONS.map((opt) => {
            const isSelected = selectedPax === opt.pax;
            return (
              <button
                key={opt.pax}
                type="button"
                onClick={() => setSelectedPax(opt.pax)}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-[#3E4F30] bg-[#3E4F30] text-[#F5EEDC] shadow-md scale-102'
                    : 'border-[#E8DCC2] bg-white text-[#2B2625] hover:border-[#3E4F30]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{opt.pax} Orang</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-[#D4A24C] text-[#2B2625]' : 'bg-[#E4EADF] text-[#3E4F30]'
                    }`}
                  >
                    -{opt.baseDiscountPct}%
                  </span>
                </div>
                <p className={`text-[11px] mt-1 leading-tight line-clamp-1 ${isSelected ? 'text-[#D0E2C8]' : 'text-[#634E3F]'}`}>
                  {opt.label.split(' ')[0]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Pilih Lauk Utama & Sambal Khas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Lauk Utama */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#3E4F30] block">
            2. Pilihan Lauk Utama ({selectedPax} Porsi):
          </label>
          <div className="space-y-2">
            {mainChoices.map((item) => {
              const isSelected = selectedMainId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMainId(item.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#B4532A] bg-white shadow-xs ring-2 ring-[#B4532A]/20'
                      : 'border-[#E8DCC2] bg-[#F5EEDC]/40 hover:bg-white'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-[#2B2625]">{item.name}</p>
                    <p className="text-[11px] text-[#634E3F]">{item.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0 pl-3">
                    <span className="text-xs font-bold text-[#3E4F30]">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    <div className="mt-1">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center ml-auto ${
                          isSelected ? 'bg-[#B4532A] text-white' : 'border border-[#C8BC9E]'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pilihan Sambal & Cemilan */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#3E4F30] block mb-2">
              3. Pilihan Sambal Garut (Ulekan Dadakan):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'hejo', label: 'Sambel Hejo', sub: 'Tomat hijau segar' },
                { key: 'rewel', label: 'Cabe Rewel', sub: 'Super pedas nampol' },
                { key: 'terasi', label: 'Terasi Dadak', sub: 'Harum jeruk limau' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSambalChoice(s.key as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    sambalChoice === s.key
                      ? 'bg-[#B4532A] text-white font-bold border-[#B4532A] shadow-2xs'
                      : 'bg-white border-[#E8DCC2] text-[#634E3F] hover:bg-[#F5EEDC]'
                  }`}
                >
                  <span className="text-xs block font-bold">{s.label}</span>
                  <span className="text-[10px] opacity-80 block">{s.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#3E4F30] block mb-2">
              4. Pilihan Cemilan Hangat Pendamping ({Math.ceil(selectedPax / 2)} Porsi):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sideChoices.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSideId(s.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedSideId === s.id
                      ? 'bg-[#3E4F30] text-[#F5EEDC] font-bold border-[#3E4F30] shadow-2xs'
                      : 'bg-white border-[#E8DCC2] text-[#2B2625] hover:bg-[#F5EEDC]'
                  }`}
                >
                  <p className="text-xs font-bold">{s.name}</p>
                  <p className={`text-[10px] ${selectedSideId === s.id ? 'text-[#D0E2C8]' : 'text-[#634E3F]'}`}>
                    Rp {s.price.toLocaleString('id-ID')}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#3E4F30] block mb-2">
              5. Pilihan Seduhan Minuman ({selectedPax} Gelas):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {drinkChoices.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDrinkId(d.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedDrinkId === d.id
                      ? 'bg-[#3E4F30] text-[#F5EEDC] font-bold border-[#3E4F30] shadow-2xs'
                      : 'bg-white border-[#E8DCC2] text-[#2B2625] hover:bg-[#F5EEDC]'
                  }`}
                >
                  <p className="text-xs font-bold">{d.name}</p>
                  <p className={`text-[10px] ${selectedDrinkId === d.id ? 'text-[#D0E2C8]' : 'text-[#634E3F]'}`}>
                    Rp {d.price.toLocaleString('id-ID')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Box & Add to Cart Action */}
      <div className="rounded-3xl bg-gradient-to-r from-[#3E4F30] to-[#2B3821] text-[#F5EEDC] p-6 shadow-xl border-2 border-[#D4A24C]/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5EEDC]/15 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-wider text-[#D4A24C] uppercase">
              Rincian Paket Lengkap Botram {selectedPax} Porsi:
            </span>
            <p className="text-sm font-semibold text-white">
              • {selectedPax}x Nasi Liwet Kastrol Daun Pisang + Lalapan Komplit
            </p>
            <p className="text-xs text-[#D0E2C8]">
              • {selectedPax}x {currentMain.name} (Sambal {sambalChoice.toUpperCase()})
            </p>
            <p className="text-xs text-[#D0E2C8]">
              • {Math.ceil(selectedPax / 2)}x {currentSide.name} • {selectedPax}x {currentDrink.name}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="flex items-baseline sm:justify-end gap-2">
              <span className="text-xs line-through text-[#A4BC98]">
                Rp {rawSubtotal.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#B4532A] text-white">
                Hemat Rp {discountAmount.toLocaleString('id-ID')} (-{currentPaxConfig.baseDiscountPct}%)
              </span>
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-extrabold text-[#D4A24C]">
              Rp {finalPrice.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-[#A4BC98]">
              (Rata-rata cuma Rp {Math.round(finalPrice / selectedPax).toLocaleString('id-ID')}/orang)
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-xs text-[#D0E2C8]">
            🌿 Disajikan langsung hangat di atas tampah beralaskan daun pisang pusaka.
          </p>
          {previewMode ? (
            <Link
              href="/auth?mode=register"
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[#D4A24C] hover:bg-[#c4933d] text-[#2B2625] font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-[#2B2625]" />
              <span>Daftar / Masuk Akun untuk Memesan Paket Botram →</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddFeastToCart}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[#D4A24C] hover:bg-[#c4933d] text-[#2B2625] font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-[#2B2625]" />
              <span>Masukkan Seluruh Paket Botram ({selectedPax} Porsi) ke Keranjang</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
