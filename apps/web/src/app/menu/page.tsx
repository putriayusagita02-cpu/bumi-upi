'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CATEGORIES, MENU_ITEMS } from '../../lib/catalogData';
import { MenuItem, CartCustomization } from '../../lib/types';
import { useCart } from '../../context/CartContext';
import { CustomizationModal } from '../../components/CustomizationModal';
import { KamusRasaModal } from '../../components/KamusRasaModal';
import { Search, Sparkles, Flame, Heart, Plus, Check } from '../../components/icons';

function MenuCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'Semua';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Semua');
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);
  const [addedSuccessId, setAddedSuccessId] = useState<number | null>(null);
  const [isKamusModalOpen, setIsKamusModalOpen] = useState(false);
  const [liveStockMap, setLiveStockMap] = useState<Record<number, { stock: number; isAvailable: boolean }>>({});

  const { addItem } = useCart();

  // Sinkronisasi status ketersediaan stok fisik real-time dengan Dapur & Inventaris Admin
  useEffect(() => {
    const fetchLiveStock = async () => {
      try {
        const res = await fetch('/api/inventory', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          const map: Record<number, { stock: number; isAvailable: boolean }> = {};
          for (const it of data.items) {
            map[it.id] = {
              stock: it.stock !== undefined ? it.stock : 45,
              isAvailable: it.isAvailable !== undefined ? it.isAvailable : ((it.stock ?? 45) > 0)
            };
          }
          setLiveStockMap(map);
        }
      } catch {}
    };

    fetchLiveStock();
    const interval = setInterval(fetchLiveStock, 3500);
    return () => clearInterval(interval);
  }, []);

  const filterTags = ['Semua', 'Rekomendasi', 'Favorit', 'Pedas', 'Untuk Anak'];

  // Filtered Items Calculation
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // 1. Category Filter
      if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
        return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q) || false;
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      // 3. Tag Filter
      if (selectedTag !== 'Semua') {
        if (!item.tags || !item.tags.includes(selectedTag)) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCategory, searchQuery, selectedTag]);

  const handleCardAdd = (item: MenuItem) => {
    const live = liveStockMap[item.id];
    const isOut = live ? (live.stock <= 0 || !live.isAvailable) : false;
    if (isOut) return;

    // If item has variants or multiple temps, open modal
    if (item.variants || (item.temps && item.temps.length > 1)) {
      setActiveModalItem(item);
    } else {
      addItem(item, {}, 1);
      setAddedSuccessId(item.id);
      setTimeout(() => setAddedSuccessId(null), 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Catalog Header */}
      <div className="bg-[#FBF7EE] p-6 rounded-[2rem] border border-[#E8DCC2] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3E4F30]">
              <span>🌿</span>
              <span>Katalog Lengkap Resmi Garut</span>
            </div>
            <h1
              className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2625]"
              style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
            >
              Katalog Menu Santapan & Seduhan
            </h1>
            <p className="text-xs text-[#634E3F] mt-0.5">
              Menampilkan {filteredItems.length} menu otentik dalam 16 kategori khas Sunda.
            </p>
          </div>

          {/* Kamus Rasa Button & Live Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsKamusModalOpen(true)}
              className="py-2.5 px-3.5 rounded-xl bg-[#3E4F30] text-[#F5EEDC] text-xs font-bold shadow-xs hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>📖 Kamus Rasa & Filosofi</span>
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7767]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nasi goreng, kopi, mie..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8DCC2] bg-white text-xs text-[#2B2625] focus:outline-none focus:ring-2 focus:ring-[#3E4F30] placeholder:text-[#8C7767] shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7767] hover:text-[#2B2625]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tags: Rekomendasi, Favorit, Pedas, Untuk Anak */}
        <div className="pt-2 border-t border-[#E8DCC2]/60 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#634E3F] shrink-0">
            Label Khusus:
          </span>
          {filterTags.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`shrink-0 text-xs py-1 px-3 rounded-full font-medium transition-all ${
                  isActive
                    ? 'bg-[#B4532A] text-white font-bold shadow-2xs'
                    : 'bg-white border border-[#E0D4BA] text-[#634E3F] hover:bg-[#F5EEDC]'
                }`}
              >
                {tag === 'Rekomendasi' && '⭐ '}
                {tag === 'Favorit' && '❤️ '}
                {tag === 'Pedas' && '🌶️ '}
                {tag === 'Untuk Anak' && '👶 '}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 16 Category Tabs / Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('Semua')}
          className={`shrink-0 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === 'Semua'
              ? 'bg-[#3E4F30] text-[#F5EEDC] shadow-sm'
              : 'bg-[#FBF7EE] border border-[#E8DCC2] text-[#634E3F] hover:bg-white'
          }`}
        >
          Semua Menu
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.code}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`shrink-0 flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[#3E4F30] text-[#F5EEDC] shadow-sm'
                  : 'bg-[#FBF7EE] border border-[#E8DCC2] text-[#634E3F] hover:bg-white'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-[#D4A24C] text-[#2B2625]' : 'bg-[#E4EADF] text-[#3E4F30]'
                }`}
              >
                {cat.expectedCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Menu Grid (All 105 Items) */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-[#FBF7EE] rounded-3xl border border-[#E8DCC2] space-y-3">
          <p className="text-4xl">🍃</p>
          <h3 className="font-serif text-lg font-bold text-[#2B2625]">
            Tidak ada menu yang sesuai pencarian
          </h3>
          <p className="text-xs text-[#634E3F]">
            Coba gunakan kata kunci lain atau pilih kategori &quot;Semua&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Semua');
              setSearchQuery('');
              setSelectedTag('Semua');
            }}
            className="text-xs font-bold text-[#B4532A] hover:underline"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const hasVariants = !!item.variants;
            const hasTemps = item.temps && item.temps.length > 1;
            const isJustAdded = addedSuccessId === item.id;
            const live = liveStockMap[item.id];
            const stock = live ? live.stock : 45;
            const isOutOfStock = live ? (live.stock <= 0 || !live.isAvailable) : false;
            const isLowStock = stock > 0 && stock <= 5;

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between p-4 rounded-2xl bg-[#FBF7EE] border transition-all duration-200 ${
                  isOutOfStock
                    ? 'border-red-200 bg-[#FBF7EE]/80'
                    : 'border-[#E8DCC2] hover:border-[#3E4F30] shadow-2xs hover:shadow-md'
                }`}
              >
                <div className="space-y-2">
                  {/* Category & Tags Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E4EADF] text-[#3E4F30] uppercase">
                      {item.category}
                    </span>

                    <div className="flex flex-wrap gap-1">
                      {/* Real-Time Stock Badges */}
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                          ⛔ Habis Terjual
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          ⚡ Sisa {stock} Porsi!
                        </span>
                      ) : null}

                      {item.tags?.includes('Rekomendasi') && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FDF4DF] text-[#B88632] flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> Rekomendasi
                        </span>
                      )}
                      {item.tags?.includes('Favorit') && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FFF0F0] text-[#B4532A] flex items-center gap-0.5">
                          <Heart className="w-3 h-3" /> Favorit
                        </span>
                      )}
                      {item.tags?.includes('Pedas') && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FCE7DF] text-[#B4532A] flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> Pedas
                        </span>
                      )}
                      {item.tags?.includes('Untuk Anak') && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F0F7FF] text-[#2C5567]">
                          👶 Anak
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name & Description */}
                  <h3 className={`font-serif text-base font-bold leading-snug ${isOutOfStock ? 'text-stone-500 line-through' : 'text-[#2B2625]'}`}>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-[#634E3F] leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Badges for M/L or Panas/Dingin */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hasVariants && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#F5EEDC] text-[#634E3F] font-medium border border-[#E0D4BA]">
                        Opsi Size: M / L
                      </span>
                    )}
                    {item.temps && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#F5EEDC] text-[#634E3F] font-medium border border-[#E0D4BA]">
                        {item.temps.includes('panas') && item.temps.includes('dingin')
                          ? 'Panas / Dingin'
                          : item.temps.includes('panas')
                          ? '🔥 Khusus Panas'
                          : '❄️ Dingin'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Add to Cart button */}
                <div className="pt-4 mt-3 border-t border-[#E8DCC2]/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#8C7767] uppercase block font-medium">
                      Harga
                    </span>
                    <span className="font-serif text-sm font-bold text-[#B4532A]">
                      Rp {item.price.toLocaleString('id-ID')}
                      {hasVariants && (
                        <span className="text-[10px] text-[#634E3F] font-sans font-normal">
                          {' '}
                          (M)
                        </span>
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => handleCardAdd(item)}
                    className={`py-1.5 px-3.5 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 ${
                      isOutOfStock
                        ? 'bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed'
                        : isJustAdded
                        ? 'bg-[#3E4F30] text-white'
                        : 'bg-[#B4532A] text-white hover:brightness-110 active:scale-95'
                    }`}
                  >
                    {isOutOfStock ? (
                      <span>Habis</span>
                    ) : isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Ditambahkan!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{hasVariants || hasTemps ? 'Kustomisasi' : 'Tambah'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Customization Modal */}
      <CustomizationModal
        item={activeModalItem}
        isOpen={!!activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onAddToCart={(item, cust, qty) => addItem(item, cust, qty)}
      />

      {/* Kamus Rasa Modal */}
      <KamusRasaModal
        isOpen={isKamusModalOpen}
        onClose={() => setIsKamusModalOpen(false)}
      />
    </div>
  );
}

export default function MenuCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-[#634E3F]">
          <span className="animate-spin text-3xl block mb-2">🌿</span>
          <span>Memuat resep otentik Bumi Upi...</span>
        </div>
      }
    >
      <MenuCatalogContent />
    </Suspense>
  );
}
