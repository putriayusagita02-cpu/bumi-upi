'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  CreditCard,
  QrCode,
  Banknote,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Coffee,
  Sparkles,
  Send
} from 'lucide-react';
import { adminStore, OrderItem, OrderRecord } from '../../lib/adminStore';
import { CATALOG_105_ITEMS, MENU_CATEGORIES, MenuItem } from '../../lib/catalogData';
import { CustomerProfile } from '../../lib/crmData';
import { useAuth } from '../../lib/authContext';

const TABLES = [
  'Meja 01', 'Meja 02', 'Meja 03', 'Meja 04', 'Meja 05', 'Meja 06',
  'Meja 07', 'Meja 08', 'Meja 09', 'Meja 10', 'Meja 11', 'Meja 12',
  'Bale Utama 01', 'Bale Utama 02', 'Bale Utama 03', 'Bale Utama 04',
  'Lesehan 01', 'Lesehan 02', 'Lesehan 03', 'Lesehan 04'
];

export default function PosPage() {
  const { user } = useAuth();

  // Order settings state
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [selectedTable, setSelectedTable] = useState<string>('Meja 04');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cart state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [customerSearchMsg, setCustomerSearchMsg] = useState<string>('');
  const [selectedVoucherId, setSelectedVoucherId] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'debit'>('qris');

  // Variant Modal state
  const [variantModalItem, setVariantModalItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'sizeM' | 'sizeL'>('sizeM');
  const [selectedTemp, setSelectedTemp] = useState<'dingin' | 'panas'>('dingin');
  const [variantNotes, setVariantNotes] = useState<string>('');

  // Receipt Modal state
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter 105 Catalog items
  const filteredItems = useMemo(() => {
    return CATALOG_105_ITEMS.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchCat && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Cart Subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  // Selected Voucher details
  const activeVoucher = useMemo(() => {
    if (!selectedVoucherId) return null;
    return adminStore.vouchers.find((v) => v.id === selectedVoucherId);
  }, [selectedVoucherId]);

  // Discount calculation
  const discountAmount = useMemo(() => {
    if (!activeVoucher) return 0;
    if (subtotal < activeVoucher.minSpend) return 0;
    if (activeVoucher.discountType === 'nominal') {
      return Math.min(subtotal, activeVoucher.discountValue);
    }
    if (activeVoucher.discountType === 'percent') {
      const raw = Math.floor((subtotal * activeVoucher.discountValue) / 100);
      const capped = activeVoucher.maxDiscount ? Math.min(raw, activeVoucher.maxDiscount) : raw;
      return Math.min(subtotal, capped);
    }
    return 0;
  }, [activeVoucher, subtotal]);

  const finalAmount = Math.max(0, subtotal - discountAmount);
  const pointsEarned = selectedCustomer ? Math.floor(finalAmount / 10000) : 0;

  // Add Item to cart
  const handleItemClick = (item: MenuItem) => {
    const hasVariants = Boolean(item.variants || (item.temps && item.temps.length > 1));
    if (hasVariants) {
      setVariantModalItem(item);
      setSelectedSize('sizeM');
      setSelectedTemp(item.temps?.includes('dingin') ? 'dingin' : 'panas');
      setVariantNotes('');
    } else {
      addToCart(item, item.price, item.temps?.[0] ? `Suhu: ${item.temps[0]}` : undefined);
    }
  };

  const addToCart = (item: MenuItem, price: number, variantDesc?: string, notes?: string) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (ci) => ci.productId === item.id && ci.variantName === variantDesc && ci.notes === notes
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        next[existingIdx].subtotal = next[existingIdx].quantity * next[existingIdx].unitPrice;
        return next;
      }
      return [
        ...prev,
        {
          productId: item.id,
          itemName: item.name,
          variantName: variantDesc,
          unitPrice: price,
          quantity: 1,
          subtotal: price,
          notes
        }
      ];
    });
    showToast(`Ditambahkan: ${item.name}`);
  };

  const handleConfirmVariant = () => {
    if (!variantModalItem) return;
    let price = variantModalItem.price;
    const descParts: string[] = [];

    if (variantModalItem.variants) {
      if (selectedSize === 'sizeL') {
        price = variantModalItem.variants.sizeL;
        descParts.push('Large');
      } else {
        price = variantModalItem.variants.sizeM;
        descParts.push('Medium');
      }
    }

    if (variantModalItem.temps && variantModalItem.temps.length > 0) {
      descParts.push(selectedTemp === 'dingin' ? 'Dingin' : 'Panas');
    }

    addToCart(variantModalItem, price, descParts.join(' / '), variantNotes.trim() || undefined);
    setVariantModalItem(null);
  };

  const updateQuantity = (idx: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const target = next[idx];
      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== idx);
      }
      target.quantity = newQty;
      target.subtotal = newQty * target.unitPrice;
      return next;
    });
  };

  const removeItem = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  // Customer search
  const handleCustomerLookup = (query: string) => {
    setCustomerSearch(query);
    if (!query.trim()) {
      setSelectedCustomer(null);
      setCustomerSearchMsg('');
      return;
    }
    const found = adminStore.findCustomer(query);
    if (found) {
      setSelectedCustomer(found);
      setCustomerSearchMsg(`Ditemukan: ${found.name} (${found.tier} - ${found.pointsBalance} Poin)`);
    } else {
      setSelectedCustomer(null);
      setCustomerSearchMsg('Pelanggan tidak ditemukan. Masukkan nomor HP baru atau pilih demo.');
    }
  };

  const handleSelectDemoCustomer = () => {
    const demo = adminStore.findCustomer('081234567890');
    if (demo) {
      setSelectedCustomer(demo);
      setCustomerSearch(demo.phone);
      setCustomerSearchMsg(`Terpilih: ${demo.name} (${demo.tier} - ${demo.pointsBalance} Poin)`);
      showToast('Member demo Dimas Kurniawan aktif!');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Execute atomic order transaction
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Pilih minimal 1 menu sebelum checkout.');
      return;
    }

    const idempotencyKey = `IDEMP-POS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const cashierName = user?.name || 'Kang Asep (Kasir Utama)';
    const cashierId = user?.id || 'usr-kasir-01';

    const result = adminStore.createOrderAtomic({
      idempotencyKey,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      cashierId,
      cashierName,
      orderType,
      tableNumber: orderType === 'dine_in' ? selectedTable : 'Takeaway (Bungkus)',
      items: cart,
      voucherId: selectedVoucherId || undefined,
      paymentMethod,
      notes: orderNotes
    });

    if (result.success && result.order) {
      setCompletedOrder(result.order);
      setShowReceipt(true);
      // Reset POS cart
      setCart([]);
      setSelectedVoucherId('');
      setOrderNotes('');
      showToast('Transaksi Berhasil Disimpan & Tiket Dapur Dikirim!');
    } else {
      alert(`Gagal memproses pesanan: ${result.error}`);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-olive-900 text-krem px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-mustard font-medium text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-mustard" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar: Order Type, Table Selector, Live Status */}
      <div className="bg-white p-3.5 rounded-2xl border border-krem-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Order Mode Toggle */}
          <div className="inline-flex rounded-xl bg-krem p-1 border border-krem-border text-xs font-semibold">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`px-3 py-1.5 rounded-lg transition ${
                orderType === 'dine_in'
                  ? 'bg-olive text-white shadow-xs'
                  : 'text-olive-900 hover:text-terakota'
              }`}
            >
              🍽️ Makan di Tempat (Dine-In)
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`px-3 py-1.5 rounded-lg transition ${
                orderType === 'takeaway'
                  ? 'bg-olive text-white shadow-xs'
                  : 'text-olive-900 hover:text-terakota'
              }`}
            >
              🥡 Bungkus (Takeaway)
            </button>
          </div>

          {/* Table Selector (if dine-in) */}
          {orderType === 'dine_in' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-kopi-muted font-medium">Meja:</span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="bg-krem-surface border border-krem-border rounded-lg px-2.5 py-1.5 font-bold text-olive-900 focus:outline-none focus:ring-1 focus:ring-olive"
              >
                {TABLES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Cashier active indicator */}
        <div className="text-xs text-kopi-muted flex items-center gap-2">
          <span>Kasir Aktif:</span>
          <span className="font-bold text-olive-900 bg-olive-50 px-2 py-1 rounded-md border border-olive-200">
            {user?.name || 'Kang Asep'}
          </span>
        </div>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 105 Menu Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search & Categories Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-krem-border shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-kopi-subtle absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari dari 105 menu otentik Sunda (nama, kategori, pedas, rekomendasi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-krem-surface border border-krem-border rounded-xl text-xs text-kopi placeholder-kopi-subtle focus:outline-none focus:ring-1 focus:ring-olive"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-kopi-subtle hover:text-kopi text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 16 Category Scroll Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg flex-shrink-0 font-medium transition ${
                  selectedCategory === 'all'
                    ? 'bg-olive text-white shadow-xs'
                    : 'bg-krem text-olive-900 hover:bg-krem-dark'
                }`}
              >
                Semua (105)
              </button>
              {MENU_CATEGORIES.map((cat) => (
                <button
                  key={cat.code}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-2.5 py-1.5 rounded-lg flex-shrink-0 font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.name
                      ? 'bg-olive text-white shadow-xs'
                      : 'bg-krem text-kopi hover:bg-krem-dark'
                  }`}
                >
                  {cat.name} ({cat.expectedCount})
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const hasVariant = Boolean(item.variants || (item.temps && item.temps.length > 1));
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="bg-white p-3 rounded-xl border border-krem-border hover:border-olive-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
                >
                  <div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {item.tags?.map((t) => (
                        <span
                          key={t}
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            t === 'Pedas'
                              ? 'bg-red-100 text-red-700'
                              : t === 'Rekomendasi'
                              ? 'bg-amber-100 text-amber-800'
                              : t === 'Favorit'
                              ? 'bg-olive-100 text-olive-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                      {hasVariant && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-semibold">
                          Varian
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-xs text-kopi group-hover:text-olive transition line-clamp-2">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-kopi-muted block">{item.category}</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-krem-border flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-terakota-dark">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    <button
                      className="w-6 h-6 rounded-md bg-olive-50 text-olive group-hover:bg-olive group-hover:text-white flex items-center justify-center transition"
                      title="Tambah ke Keranjang"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Cart, Customer Scan, Voucher & Checkout (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Customer Loyalty Scanner Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-krem-border shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-olive-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-terakota" />
                Member Loyalitas
              </span>
              <button
                onClick={handleSelectDemoCustomer}
                className="text-[10px] text-olive font-semibold bg-olive-50 border border-olive-200 px-2 py-0.5 rounded hover:bg-olive hover:text-white transition"
              >
                + Pilih Demo (Dimas - Sahabat)
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Scan QR (BUMI-CUST-8899) atau ketik HP 081234567890..."
                value={customerSearch}
                onChange={(e) => handleCustomerLookup(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-krem-surface border border-krem-border rounded-lg text-kopi focus:outline-none focus:ring-1 focus:ring-olive"
              />
            </div>

            {selectedCustomer ? (
              <div className="bg-olive-50 border border-olive-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-olive-900">{selectedCustomer.name}</div>
                  <div className="text-[11px] text-olive-700">
                    Tier: <span className="font-semibold text-terakota">{selectedCustomer.tier}</span> • Saldo: <span className="font-bold">{selectedCustomer.pointsBalance} Poin</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                    setCustomerSearchMsg('');
                  }}
                  className="text-xs text-terakota hover:underline"
                >
                  Lepas
                </button>
              </div>
            ) : customerSearchMsg ? (
              <p className="text-[11px] text-amber-700 font-medium">{customerSearchMsg}</p>
            ) : null}
          </div>

          {/* Cart Items List */}
          <div className="bg-white p-3.5 rounded-2xl border border-krem-border shadow-xs flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-krem-border">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-terakota" />
                  <span className="font-serif font-bold text-sm text-kopi">
                    Daftar Pesanan ({cart.reduce((s, i) => s + i.quantity, 0)})
                  </span>
                </div>
                <span className="text-xs font-semibold text-olive-800 bg-krem px-2 py-0.5 rounded">
                  {orderType === 'dine_in' ? selectedTable : 'Bungkus'}
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-kopi-muted space-y-2">
                  <Coffee className="w-8 h-8 mx-auto text-krem-border" />
                  <p className="text-xs">Keranjang masih kosong.</p>
                  <p className="text-[11px] text-kopi-subtle">
                    Klik menu di katalog sebelah kiri untuk menambahkan.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div
                      key={`${item.productId}-${item.variantName}-${idx}`}
                      className="p-2 rounded-xl bg-krem-surface border border-krem-border flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 mr-2">
                        <div className="font-semibold text-kopi">{item.itemName}</div>
                        {item.variantName && (
                          <div className="text-[10px] text-terakota-dark font-medium">
                            {item.variantName}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[10px] text-kopi-subtle italic">
                            &quot;{item.notes}&quot;
                          </div>
                        )}
                        <div className="text-[11px] text-kopi-muted font-mono">
                          Rp {item.unitPrice.toLocaleString('id-ID')}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          className="w-5 h-5 rounded bg-white border border-krem-border text-kopi hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          className="w-5 h-5 rounded bg-white border border-krem-border text-kopi hover:bg-olive-50 hover:text-olive flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-1 text-kopi-subtle hover:text-red-600 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vouchers, Notes & Payment Summary */}
            <div className="pt-3 border-t border-krem-border space-y-2.5 mt-2">
              {/* Voucher selection */}
              <div>
                <label className="text-[11px] font-semibold text-kopi-muted block mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-terakota" /> Voucher Diskon:
                </label>
                <select
                  value={selectedVoucherId}
                  onChange={(e) => setSelectedVoucherId(e.target.value)}
                  className="w-full text-xs p-1.5 bg-krem-surface border border-krem-border rounded-lg text-kopi"
                >
                  <option value="">-- Tanpa Voucher --</option>
                  {adminStore.vouchers.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.isRedeemed}>
                      {v.title} {v.isRedeemed ? '(Sudah Dipakai)' : ''}
                    </option>
                  ))}
                </select>
                {activeVoucher && subtotal < activeVoucher.minSpend && (
                  <p className="text-[10px] text-red-600 mt-0.5">
                    Minimal belanja Rp {activeVoucher.minSpend.toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              {/* Order Notes */}
              <div>
                <input
                  type="text"
                  placeholder="Catatan pesanan untuk dapur (cth: jangan terlalu pedas)..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-krem-surface border border-krem-border rounded-lg text-kopi"
                />
              </div>

              {/* Financial Calculation breakdown */}
              <div className="bg-krem-surface p-2.5 rounded-xl border border-krem-border space-y-1 text-xs">
                <div className="flex justify-between text-kopi-muted">
                  <span>Subtotal:</span>
                  <span className="font-mono">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Diskon Voucher:</span>
                    <span className="font-mono">-Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-kopi pt-1 border-t border-krem-border">
                  <span>Total Bayar:</span>
                  <span className="font-mono text-terakota-dark">
                    Rp {finalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                {selectedCustomer && (
                  <div className="flex justify-between text-[11px] text-olive-800 font-medium">
                    <span>Estimasi Poin Diperoleh:</span>
                    <span className="font-mono font-bold">+{pointsEarned} Poin</span>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'qris'
                      ? 'bg-olive text-white border-olive shadow-xs'
                      : 'bg-white border-krem-border text-kopi hover:bg-krem'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'cash'
                      ? 'bg-olive text-white border-olive shadow-xs'
                      : 'bg-white border-krem-border text-kopi hover:bg-krem'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tunai</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('debit')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'debit'
                      ? 'bg-olive text-white border-olive shadow-xs'
                      : 'bg-white border-krem-border text-kopi hover:bg-krem'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Debit / Kartu</span>
                </button>
              </div>

              {/* Action Button: Checkout */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 rounded-xl bg-terakota hover:bg-terakota-light disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Bayar & Cetak Struk (Rp {finalAmount.toLocaleString('id-ID')})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {variantModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-krem-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-krem-border pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-kopi">
                  Kustomisasi: {variantModalItem.name}
                </h3>
                <span className="text-xs text-kopi-muted">{variantModalItem.category}</span>
              </div>
              <button
                onClick={() => setVariantModalItem(null)}
                className="p-1 rounded-lg hover:bg-krem text-kopi-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Size variants */}
            {variantModalItem.variants && (
              <div>
                <label className="text-xs font-bold text-kopi block mb-1.5">Pilihan Porsi / Ukuran:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setSelectedSize('sizeM')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      selectedSize === 'sizeM'
                        ? 'bg-olive text-white border-olive font-bold'
                        : 'border-krem-border bg-krem-surface text-kopi'
                    }`}
                  >
                    <div>Ukuran Medium</div>
                    <div className="font-mono mt-0.5">
                      Rp {variantModalItem.variants.sizeM.toLocaleString('id-ID')}
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedSize('sizeL')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      selectedSize === 'sizeL'
                        ? 'bg-olive text-white border-olive font-bold'
                        : 'border-krem-border bg-krem-surface text-kopi'
                    }`}
                  >
                    <div>Ukuran Large (Besar)</div>
                    <div className="font-mono mt-0.5">
                      Rp {variantModalItem.variants.sizeL.toLocaleString('id-ID')}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Temperature variants */}
            {variantModalItem.temps && variantModalItem.temps.length > 0 && (
              <div>
                <label className="text-xs font-bold text-kopi block mb-1.5">Suhu Minuman:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {variantModalItem.temps.includes('dingin') && (
                    <button
                      onClick={() => setSelectedTemp('dingin')}
                      className={`p-2 rounded-xl border text-center transition ${
                        selectedTemp === 'dingin'
                          ? 'bg-olive text-white border-olive font-bold'
                          : 'border-krem-border bg-krem-surface text-kopi'
                      }`}
                    >
                      🧊 Dingin / Es
                    </button>
                  )}
                  {variantModalItem.temps.includes('panas') && (
                    <button
                      onClick={() => setSelectedTemp('panas')}
                      className={`p-2 rounded-xl border text-center transition ${
                        selectedTemp === 'panas'
                          ? 'bg-olive text-white border-olive font-bold'
                          : 'border-krem-border bg-krem-surface text-kopi'
                      }`}
                    >
                      ☕ Panas / Hangat
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Variant notes */}
            <div>
              <label className="text-xs font-bold text-kopi block mb-1.5">
                Catatan Khusus (misal: gula terpisah / pedas level 2):
              </label>
              <input
                type="text"
                placeholder="Tulis catatan..."
                value={variantNotes}
                onChange={(e) => setVariantNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-krem-surface border border-krem-border rounded-xl text-kopi"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-krem-border">
              <button
                onClick={() => setVariantModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-kopi-muted hover:bg-krem"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmVariant}
                className="px-5 py-2 rounded-xl bg-olive hover:bg-olive-600 text-white text-xs font-bold shadow-sm"
              >
                Tambahkan ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt & Telegram Preview Modal */}
      {showReceipt && completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-krem-border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-krem-border pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif font-bold text-base text-kopi">
                  Transaksi Berhasil Disimpan
                </h3>
              </div>
              <button
                onClick={() => setShowReceipt(false)}
                className="p-1 rounded-lg hover:bg-krem text-kopi-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Paper */}
            <div
              id="printable-receipt"
              className="bg-krem-surface p-4 rounded-xl border border-krem-border font-mono text-xs text-kopi space-y-2 shadow-inner"
            >
              <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-krem-border">
                <h4 className="font-serif font-bold text-sm text-olive-900">
                  RUMAH TAMAH BUMI UPI
                </h4>
                <p className="text-[10px] text-kopi-muted">Jl. Raya Garut, Jawa Barat</p>
                <p className="text-[10px] text-terakota-dark font-bold">
                  Struk Transaksi Resmi Kasir
                </p>
              </div>

              <div className="text-[11px] space-y-0.5">
                <div>No: <span className="font-bold">{completedOrder.orderNumber}</span></div>
                <div>Waktu: {completedOrder.createdAtWib}</div>
                <div>Kasir: {completedOrder.cashierName}</div>
                <div>Lokasi: {completedOrder.tableNumber}</div>
                <div>Pelanggan: {completedOrder.customerName} ({completedOrder.customerTier})</div>
              </div>

              <div className="py-2 border-t border-b border-dashed border-krem-border space-y-1">
                {completedOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <div>
                      <div>{it.itemName}</div>
                      {it.variantName && <div className="text-[10px] text-kopi-subtle">[{it.variantName}]</div>}
                      <div className="text-[10px] text-kopi-muted">x{it.quantity} @ Rp {it.unitPrice.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="font-bold">Rp {it.subtotal.toLocaleString('id-ID')}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 text-right text-[11px]">
                <div>Subtotal: Rp {completedOrder.subtotal.toLocaleString('id-ID')}</div>
                {completedOrder.discountAmount > 0 && (
                  <div className="text-emerald-700">Diskon: -Rp {completedOrder.discountAmount.toLocaleString('id-ID')}</div>
                )}
                <div className="text-sm font-bold pt-1 border-t border-krem-border">
                  TOTAL: Rp {completedOrder.finalAmount.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-kopi-muted uppercase">Metode: {completedOrder.paymentMethod} (LUNAS)</div>
                {completedOrder.pointsEarned > 0 && (
                  <div className="text-olive font-bold text-[11px]">
                    Poin Diperoleh: +{completedOrder.pointsEarned} Poin
                  </div>
                )}
              </div>

              <div className="pt-2 text-center text-[10px] text-kopi-muted border-t border-dashed border-krem-border font-serif">
                &quot;Hatur nuhun parantos sumping ka Bumi Upi! 🙏&quot;<br />
                Sejauh apapun pergi, rumah tempatnya pulang.
              </div>
            </div>

            {/* Telegram Notification Dispatch Preview */}
            <div className="bg-olive-50 p-3 rounded-xl border border-olive-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-olive-900">
                <Send className="w-3.5 h-3.5 text-olive" />
                <span>Notifikasi Telegram Bot (@BumiUpiBot):</span>
              </div>
              <pre className="text-[10px] text-olive-950 font-mono bg-white p-2 rounded-lg overflow-x-auto whitespace-pre-wrap border border-olive-200">
                {completedOrder.receiptTelegram}
              </pre>
            </div>

            {/* Print and Close Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-krem-border">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-krem-border hover:bg-krem text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-kopi" />
                <span>Cetak Struk (80mm)</span>
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="px-5 py-2 rounded-xl bg-olive hover:bg-olive-600 text-white text-xs font-bold"
              >
                Selesai / Pesanan Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
