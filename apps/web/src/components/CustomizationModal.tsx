'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, CartCustomization } from '../lib/types';
import { Plus, Minus } from './icons';

interface CustomizationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, customization: CartCustomization, quantity: number) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [size, setSize] = useState<'M' | 'L'>('M');
  const [temp, setTemp] = useState<'panas' | 'dingin'>('dingin');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (item) {
      setSize('M');
      if (item.temps && item.temps.length > 0) {
        setTemp(item.temps[0]);
      } else {
        setTemp('dingin');
      }
      setQuantity(1);
      setNotes('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  // Price calculations
  let currentUnitPrice = item.price;
  if (item.variants) {
    currentUnitPrice = size === 'L' ? item.variants.sizeL : item.variants.sizeM;
  }
  const currentTotal = currentUnitPrice * quantity;

  const handleAdd = () => {
    const cust: CartCustomization = {
      notes: notes.trim() || undefined,
    };
    if (item.variants) {
      cust.size = size;
    }
    if (item.temps && item.temps.length > 0) {
      cust.temp = temp;
    }
    onAddToCart(item, cust, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#2B2625]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-[1.5rem] bg-[#FBF7EE] border border-[#E8DCC2] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#E8DCC2] bg-[#F5EEDC]/60 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B4532A]">
              {item.category}
            </span>
            <h3 className="font-serif text-xl font-bold text-[#2B2625]">{item.name}</h3>
            {item.description && (
              <p className="text-xs text-[#634E3F] mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#634E3F] hover:bg-[#E8DCC2] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Size Options (If drink with M/L variants) */}
          {item.variants && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#2B2625]">
                  Pilih Ukuran (Size)
                </label>
                <span className="text-[11px] text-[#B4532A] font-semibold">Wajib</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSize('M')}
                  className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all ${
                    size === 'M'
                      ? 'border-[#3E4F30] bg-[#E4EADF] text-[#3E4F30]'
                      : 'border-[#E8DCC2] bg-white text-[#2B2625] hover:bg-[#F5EEDC]'
                  }`}
                >
                  <span className="font-bold text-sm">Ukuran Medium (M)</span>
                  <span className="text-xs text-[#634E3F] mt-0.5">
                    Rp {item.variants.sizeM.toLocaleString('id-ID')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSize('L')}
                  className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all ${
                    size === 'L'
                      ? 'border-[#3E4F30] bg-[#E4EADF] text-[#3E4F30]'
                      : 'border-[#E8DCC2] bg-white text-[#2B2625] hover:bg-[#F5EEDC]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm">Ukuran Large (L)</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#B4532A] text-white">
                      +Rp {(item.variants.sizeL - item.variants.sizeM).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="text-xs text-[#634E3F] mt-0.5">
                    Rp {item.variants.sizeL.toLocaleString('id-ID')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Temperature Options (Panas / Dingin) */}
          {item.temps && item.temps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#2B2625]">
                  Penyajian Suhu
                </label>
                <span className="text-[11px] text-[#B4532A] font-semibold">Wajib</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {item.temps.includes('dingin') && (
                  <button
                    type="button"
                    onClick={() => setTemp('dingin')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                      temp === 'dingin'
                        ? 'border-[#3E4F30] bg-[#E4EADF] text-[#3E4F30]'
                        : 'border-[#E8DCC2] bg-white text-[#634E3F] hover:bg-[#F5EEDC]'
                    }`}
                  >
                    <span>❄️ Dingin (Pake Es)</span>
                  </button>
                )}
                {item.temps.includes('panas') && (
                  <button
                    type="button"
                    onClick={() => setTemp('panas')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                      temp === 'panas'
                        ? 'border-[#B4532A] bg-[#FCE7DF] text-[#B4532A]'
                        : 'border-[#E8DCC2] bg-white text-[#634E3F] hover:bg-[#F5EEDC]'
                    }`}
                  >
                    <span>🔥 Hangat / Panas</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#2B2625] block mb-2">
              Jumlah Pesanan
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E8DCC2] rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-[#F5EEDC] text-[#2B2625] transition-colors"
                  aria-label="Kurangi jumlah"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-mono font-bold text-sm text-[#2B2625]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2.5 hover:bg-[#F5EEDC] text-[#2B2625] transition-colors"
                  aria-label="Tambah jumlah"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-[#634E3F]">
                Rp {currentUnitPrice.toLocaleString('id-ID')} / porsi
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#2B2625] block mb-1.5">
              Catatan Khusus (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kurang manis, sambal dipisah, jangan pake daun bawang..."
              className="w-full text-xs p-3 rounded-xl border border-[#E8DCC2] bg-white focus:outline-none focus:ring-2 focus:ring-[#3E4F30] text-[#2B2625] placeholder:text-[#8C7767]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#E8DCC2] bg-[#F5EEDC]/60 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#634E3F]">
              Total Harga
            </p>
            <p className="font-serif text-lg font-bold text-[#B4532A]">
              Rp {currentTotal.toLocaleString('id-ID')}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="py-2.5 px-6 rounded-xl font-semibold text-xs text-white shadow-md transition-all active:scale-95 hover:brightness-110"
            style={{ backgroundColor: '#B4532A' }}
          >
            + Masukkan Keranjang
          </button>
        </div>
      </div>
    </div>
  );
};
