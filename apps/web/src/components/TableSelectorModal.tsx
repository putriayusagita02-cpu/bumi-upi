'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Utensils, ShoppingBag, Check, MapPin } from './icons';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiningZone {
  id: string;
  name: string;
  slogan: string;
  icon: string;
  vibe: string;
  capacity: string;
  tables: string[];
  features: string[];
}

const ZONES: DiningZone[] = [
  {
    id: 'zone-teras',
    name: 'Teras Rumah Nenek (Vintage 1930)',
    slogan: 'Spot Pintu Viral & Kusen Krepyak Hijau Kolonial',
    icon: '🪑',
    vibe: 'Nuansa teras rumah tempo doeloe, lantai bata merah herringbone, kursi lipat antik, dan angin semilir Garut.',
    capacity: '2 – 4 Orang / Meja',
    tables: ['Meja 01', 'Meja 02', 'Meja 03', 'Meja 04'],
    features: ['Pintu Kayu Viral', 'Kursi Sedan Jati', 'Spot Foto OOTD Estetik', 'Angin Semilir Sore'],
  },
  {
    id: 'zone-indoor',
    name: 'Ruang Tengah Rumah Nenek (Indoor AC)',
    slogan: 'Suasana Hangat Keluarga, Radio Antik & Sofa Vintage',
    icon: '📻',
    vibe: 'Interior klasik tempo doeloe, sejuk berpendingin ruangan, sangat homey serasa berkunjung ke rumah kakek-nenek.',
    capacity: '2 – 6 Orang / Meja',
    tables: ['Meja 05', 'Meja 06', 'Meja 07', 'Meja 08'],
    features: ['Ruangan Full AC', 'Pajangan Radio Jadul', 'Sofa & Lemari Antik', 'Nyaman & Privat'],
  },
  {
    id: 'zone-photobooth',
    name: 'Pojok Photobox & Sudut Nostalgia',
    slogan: 'Cetak Strip Foto Instan & Abadikan Momen Bahagia',
    icon: '📸',
    vibe: 'Area paling hits tepat di dekat bilik photobox vintage Bumi Upi, meja favorit anak muda dan kencan santai.',
    capacity: '2 – 4 Orang / Meja',
    tables: ['Meja 09', 'Meja 10', 'Meja 11', 'Meja 12'],
    features: ['Akses Photobox Rp 25k', 'Properti Foto Retro', 'Dekat Bar Seduhan Kopi', 'Vibes Kekinian'],
  },
  {
    id: 'zone-taman',
    name: 'Taman Belakang & Playground (Outdoor Asri)',
    slogan: 'Rumput Hijau Asri, Pepohonan Rindang & Playground Ramah Anak',
    icon: '🌿',
    vibe: 'Halaman terbuka hijau yang sejuk dan luas, ramah anak-anak untuk bermain santai di playground.',
    capacity: '4 – 8 Orang / Meja',
    tables: ['Meja 13', 'Meja 14', 'Meja 15', 'Meja 16'],
    features: ['Playground Ramah Anak', 'Rumput Alami Sejuk', 'Meja Payung Luar', 'Pencahayaan Alami Estetik'],
  },
  {
    id: 'zone-baleriung',
    name: 'Bale Riung Utama (Pendopo Semi-Outdoor)',
    slogan: 'Meja Panjang Botram Keluarga Besar, Nobar & Intimate Event',
    icon: '🏮',
    vibe: 'Pendopo kayu lapang beratap genteng klasik, cocok untuk jamuan makan rombongan besar dan perayaan syukuran.',
    capacity: '6 – 12 Orang / Meja',
    tables: ['Meja 17', 'Meja 18', 'Meja 19', 'Meja 20'],
    features: ['Meja Panjang Kayu Solid', 'Layar Nobar Proyektor', 'Kapasitas Rombongan', 'Venue Intimate Wedding'],
  },
];

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({ isOpen, onClose }) => {
  const { tableNumber, setTableNumber, orderType, setOrderType } = useCart();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-teras');
  const [viewMode, setViewMode] = useState<'visual' | 'quick'>('visual');

  if (!isOpen) return null;

  const currentZone = ZONES.find((z) => z.id === selectedZoneId) || ZONES[0];

  const handleSelectTable = (tbl: string) => {
    setOrderType('dine_in');
    setTableNumber(tbl);
    onClose();
  };

  const handleSelectTakeaway = () => {
    setOrderType('takeaway');
    setTableNumber('Takeaway');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#2B2625]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-[2.5rem] bg-[#FBF7EE] border-2 border-[#D4A24C] shadow-2xl p-5 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#E8DCC2]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E4EADF] text-[#3E4F30] text-[10px] font-bold uppercase tracking-wider">
              <span>🗺️</span>
              <span>Denah Suasana Rumah Tamah</span>
            </div>
            <h3
              className="font-serif text-xl sm:text-2xl font-bold text-[#2B2625] mt-1"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Pilih Suasana & Meja Santap
            </h3>
            <p className="text-xs text-[#634E3F]">
              Setiap sudut di Bumi Upi memiliki kenangan dan nuansa tersendiri.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E8DCC2]/60 hover:bg-[#E8DCC2] text-[#634E3F] flex items-center justify-center text-sm font-bold transition shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Order Type Toggle: Dine In vs Takeaway */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 font-medium text-xs sm:text-sm transition-all ${
              orderType === 'dine_in'
                ? 'border-[#3E4F30] bg-[#E4EADF] text-[#3E4F30] font-bold shadow-xs'
                : 'border-[#E8DCC2] bg-white text-[#634E3F] hover:bg-[#F5EEDC]'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Makan di Tempat (Dine-in)</span>
          </button>

          <button
            type="button"
            onClick={handleSelectTakeaway}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 font-medium text-xs sm:text-sm transition-all ${
              orderType === 'takeaway'
                ? 'border-[#B4532A] bg-[#FCE7DF] text-[#B4532A] font-bold shadow-xs'
                : 'border-[#E8DCC2] bg-white text-[#634E3F] hover:bg-[#F5EEDC]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bungkus Pulang (Takeaway)</span>
          </button>
        </div>

        {orderType === 'dine_in' && (
          <div className="space-y-4">
            {/* View Switcher: Visual Map vs Quick Number Picker */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2B2625]">
                Pilihan Area & Suasana Bale:
              </span>
              <div className="flex gap-1 p-1 bg-[#F5EEDC] rounded-xl border border-[#E0D4BA]">
                <button
                  type="button"
                  onClick={() => setViewMode('visual')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                    viewMode === 'visual'
                      ? 'bg-[#3E4F30] text-[#F5EEDC]'
                      : 'text-[#634E3F] hover:text-[#2B2625]'
                  }`}
                >
                  🗺️ Peta Suasana
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('quick')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                    viewMode === 'quick'
                      ? 'bg-[#3E4F30] text-[#F5EEDC]'
                      : 'text-[#634E3F] hover:text-[#2B2625]'
                  }`}
                >
                  🔢 Nomor Cepat (1-20)
                </button>
              </div>
            </div>

            {viewMode === 'visual' ? (
              <div className="space-y-4">
                {/* 5 Zone Horizontal Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {ZONES.map((z) => {
                    const isSelected = selectedZoneId === z.id;
                    const hasCurrentTable = z.tables.includes(tableNumber);
                    return (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => setSelectedZoneId(z.id)}
                        className={`shrink-0 flex items-center gap-2 py-2.5 px-3.5 rounded-2xl border-2 text-xs font-bold transition-all text-left ${
                          isSelected
                            ? 'border-[#3E4F30] bg-[#3E4F30] text-[#F5EEDC] shadow-md'
                            : 'border-[#E8DCC2] bg-white text-[#2B2625] hover:border-[#D4A24C]'
                        }`}
                      >
                        <span className="text-lg">{z.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{z.name}</span>
                            {hasCurrentTable && (
                              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                            )}
                          </div>
                          <span
                            className={`text-[9px] block font-normal ${
                              isSelected ? 'text-[#E5EADF]' : 'text-[#8C7767]'
                            }`}
                          >
                            {z.tables.length} Meja
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Zone Detail Card & Interactive Tables */}
                <div className="p-5 rounded-3xl bg-white border-2 border-[#D4A24C]/60 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DCC2] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F5EEDC] border border-[#D4A24C] flex items-center justify-center text-2xl shrink-0">
                        {currentZone.icon}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#2B2625]">
                          {currentZone.name}
                        </h4>
                        <p className="text-xs text-[#B4532A] font-medium">
                          {currentZone.slogan}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E4EADF] text-[#3E4F30] w-fit">
                      👥 {currentZone.capacity}
                    </span>
                  </div>

                  <p className="text-xs text-[#634E3F] leading-relaxed">
                    {currentZone.vibe}
                  </p>

                  {/* Highlights pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {currentZone.features.map((feat, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F5EEDC] text-[#634E3F] border border-[#E0D4BA] font-medium"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>

                  {/* Table Buttons in this Zone */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7767] block mb-2">
                      Pilih Meja di Area Ini:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {currentZone.tables.map((tbl) => {
                        const isChosen = tableNumber === tbl;
                        return (
                          <button
                            key={tbl}
                            type="button"
                            onClick={() => handleSelectTable(tbl)}
                            className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-between gap-1 ${
                              isChosen
                                ? 'border-[#3E4F30] bg-[#3E4F30] text-[#F5EEDC] shadow-md ring-2 ring-[#D4A24C]'
                                : 'border-[#E8DCC2] bg-[#FBF7EE] text-[#2B2625] hover:border-[#3E4F30] hover:bg-[#F4F6F2]'
                            }`}
                          >
                            <span className="text-xs font-black">{tbl}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                isChosen
                                  ? 'bg-[#D4A24C] text-[#2B2625]'
                                  : 'bg-[#E4EADF] text-[#3E4F30]'
                              }`}
                            >
                              {isChosen ? '✓ Terpilih' : 'Tersedia'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Quick Table Number Grid (Meja 01 - Meja 20) */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#634E3F]">
                  <span>Pilih langsung dari 20 meja:</span>
                  <span className="text-[#3E4F30] font-bold">Saat ini: {tableNumber}</span>
                </div>
                <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1">
                  {Array.from({ length: 20 }, (_, i) => `Meja ${String(i + 1).padStart(2, '0')}`).map(
                    (t) => {
                      const isSelected = tableNumber === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleSelectTable(t)}
                          className={`py-2.5 px-2 text-center rounded-xl border-2 text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-[#3E4F30] bg-[#3E4F30] text-[#F5EEDC] shadow-md'
                              : 'border-[#E8DCC2] bg-white text-[#2B2625] hover:border-[#3E4F30] hover:bg-[#F4F6F2]'
                          }`}
                        >
                          {t.replace('Meja ', 'M-')}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#E8DCC2] flex items-center justify-between text-xs">
          <span className="text-[#634E3F]">
            Status:{' '}
            <strong className="text-[#2B2625]">
              {orderType === 'dine_in' ? `Dine-in (${tableNumber})` : 'Bawa Pulang (Takeaway)'}
            </strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#3E4F30] text-[#F5EEDC] font-bold hover:brightness-110 shadow-xs"
          >
            Gunakan Pilihan Ini
          </button>
        </div>
      </div>
    </div>
  );
};
