'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { QrCode, ArrowLeft, CheckCircle2, Clock, ShieldCheck } from '../../components/icons';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    tableNumber,
    orderType,
    subtotal,
    discountAmount,
    totalAmount,
    appliedVoucher,
    removeVoucher,
    clearCart,
  } = useCart();
  const { customer, addPoints } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(900); // 15 minutes timer

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!customer) {
      router.push('/auth');
    }
  }, [customer, router]);

  // If cart is empty and not loading, redirect to /cart
  useEffect(() => {
    if (items.length === 0 && !loading) {
      router.push('/cart');
    }
  }, [items, loading, router]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const executePayment = async (voucherToUse?: string | null) => {
    if (loading) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const idempotencyKey = `qris-tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      // Use specified voucher or fallback to cart voucher if subtotal qualifies
      const chosenVoucherId =
        voucherToUse !== undefined
          ? voucherToUse
          : appliedVoucher && subtotal >= (appliedVoucher.minSpend || 0)
          ? appliedVoucher.id || appliedVoucher.code
          : null;

      const payload = {
        idempotencyKey,
        customerId: customer?.id || null,
        orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber : 'Takeaway',
        customerVoucherId: chosenVoucherId,
        paymentMethod: 'qris',
        items: items.map((it) => ({
          productId: it.menuItem.id,
          itemName: `${it.menuItem.name}${it.customization.size ? ` (${it.customization.size})` : ''}${it.customization.temp ? ` [${it.customization.temp}]` : ''}`,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          size: it.customization.size,
          temp: it.customization.temp,
          notes: it.customization.notes,
        })),
        notes: `Pemesanan via Web Portal Bumi Upi (${tableNumber})`,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error || 'Gagal memproses pesanan.');
        setLoading(false);
        return;
      }

      // Add points
      if (data.pointsEarned && data.pointsEarned > 0) {
        addPoints(data.pointsEarned);
      }

      const orderId = data.orderId || data.order?.id;
      const orderRecord = data.order || {
        id: orderId,
        orderNumber: data.orderNumber || `BU-ORD-${orderId}`,
        customerId: customer?.id || null,
        orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber : 'Takeaway',
        status: 'confirmed',
        subtotal,
        discountAmount,
        finalAmount: data.finalAmount || totalAmount,
        pointsEarned: data.pointsEarned || 0,
        paymentMethod: 'qris',
        paymentStatus: 'paid',
        items: payload.items,
        notes: payload.notes,
        createdAt: new Date().toISOString()
      };

      // Simpan ke localStorage agar riwayat member dan pelacakan order selalu sinkron & instan
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('bumi_upi_client_orders');
          const list = raw ? JSON.parse(raw) : [];
          const map = new Map(list.map((o: any) => [o.id, o]));
          map.set(orderRecord.id, orderRecord);
          localStorage.setItem('bumi_upi_client_orders', JSON.stringify(Array.from(map.values())));
        } catch (e) {
          console.warn('Failed to save order to localStorage', e);
        }

        // Sinkronisasi langsung dari browser ke server Admin KDS/POS (baik lokal maupun di Vercel)
        try {
          const adminCandidates = [
            process.env.NEXT_PUBLIC_ADMIN_URL,
            'https://bumi-upi-admin.vercel.app',
            'http://127.0.0.1:3001'
          ].filter(Boolean) as string[];

          for (const adminEndpoint of adminCandidates) {
            fetch(`${adminEndpoint}/api/pos/transaction`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderRecord),
              mode: 'cors'
            }).catch(() => {});
          }
        } catch {}
      }

      // Clear cart
      clearCart();

      // Navigate to order tracker
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi gangguan jaringan.');
      setLoading(false);
    }
  };

  const handleSimulatePayment = () => executePayment();

  const handlePayWithoutVoucher = () => {
    removeVoucher();
    setErrorMsg('');
    executePayment(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/cart"
          className="p-2 rounded-xl bg-white border border-[#E8DCC2] text-[#2B2625] hover:bg-[#FBF7EE] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1
            className="font-serif text-2xl font-bold text-[#2B2625]"
            style={{ fontFamily: 'var(--font-fraunces, "Fraunces", Georgia, serif)' }}
          >
            Pembayaran QRIS Dinamis
          </h1>
          <p className="text-xs text-[#634E3F]">
            Pindai QRIS menggunakan BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, atau DANA
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Dynamic QRIS Card & Timer */}
        <div className="md:col-span-6 bg-[#FBF7EE] border border-[#E8DCC2] rounded-3xl p-6 shadow-md text-center space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC2]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#3E4F30] flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#3E4F30]" />
              <span>QRIS Standar Bank Indonesia</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-[#B4532A] bg-[#FCE7DF] px-2 py-0.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeFormatted}</span>
            </span>
          </div>

          {/* QR Container */}
          <div className="p-4 bg-white rounded-2xl border-2 border-[#3E4F30] shadow-inner inline-block mx-auto">
            <svg
              className="w-48 h-48 mx-auto text-[#2B2625]"
              viewBox="0 0 100 100"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Corner 1 */}
              <rect x="10" y="10" width="24" height="24" rx="2" fill="#2B2625" />
              <rect x="15" y="15" width="14" height="14" fill="#FFFFFF" />
              <rect x="18" y="18" width="8" height="8" fill="#3E4F30" />

              {/* Corner 2 */}
              <rect x="66" y="10" width="24" height="24" rx="2" fill="#2B2625" />
              <rect x="71" y="15" width="14" height="14" fill="#FFFFFF" />
              <rect x="74" y="18" width="8" height="8" fill="#3E4F30" />

              {/* Corner 3 */}
              <rect x="10" y="66" width="24" height="24" rx="2" fill="#2B2625" />
              <rect x="15" y="71" width="14" height="14" fill="#FFFFFF" />
              <rect x="18" y="74" width="8" height="8" fill="#3E4F30" />

              {/* Matrix Data dots */}
              <rect x="42" y="14" width="8" height="8" rx="1" fill="#2B2625" />
              <rect x="52" y="24" width="6" height="6" fill="#B4532A" />
              <rect x="42" y="38" width="10" height="10" rx="1" fill="#2B2625" />
              <rect x="14" y="44" width="8" height="8" fill="#2B2625" />
              <rect x="28" y="48" width="6" height="6" fill="#2B2625" />
              <rect x="58" y="48" width="8" height="8" fill="#3E4F30" />
              <rect x="72" y="42" width="12" height="6" fill="#2B2625" />
              <rect x="42" y="66" width="8" height="8" rx="1" fill="#2B2625" />
              <rect x="56" y="66" width="14" height="8" fill="#B4532A" />
              <rect x="76" y="66" width="8" height="16" fill="#2B2625" />
              <rect x="52" y="78" width="16" height="8" fill="#3E4F30" />
            </svg>
            <p className="text-[10px] font-mono font-bold text-[#634E3F] pt-2 uppercase tracking-wider">
              NMID: ID102688992026 • BUMI UPI GARUT
            </p>
          </div>

          <div>
            <p className="text-xs text-[#634E3F]">Total Tagihan Resmi:</p>
            <p className="font-serif text-2xl font-black text-[#B4532A]">
              Rp {totalAmount.toLocaleString('id-ID')}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-[#FBE8E3] border border-[#B4532A] text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#B4532A]">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
              {appliedVoucher && (
                <div className="pt-1.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-[#B4532A]/20 text-xs">
                  <span className="text-[#634E3F] text-[11px]">Ada kendala voucher? Anda dapat tetap lanjut:</span>
                  <button
                    type="button"
                    onClick={handlePayWithoutVoucher}
                    className="py-1.5 px-3 rounded-lg bg-[#B4532A] text-white font-bold text-xs hover:brightness-110 active:scale-95 transition"
                  >
                    Bayar Tanpa Voucher (Rp {subtotal.toLocaleString('id-ID')}) →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Trigger button */}
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: '#3E4F30' }}
          >
            {loading ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>Memproses Pesanan Atomic...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#D4A24C]" />
                <span>Simulasi Bayar QRIS Sekarang</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Order Summary Details */}
        <div className="md:col-span-6 bg-[#FBF7EE] border border-[#E8DCC2] rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC2]">
            <h4 className="font-serif text-sm font-bold text-[#2B2625]">
              Rincian Pesanan
            </h4>
            <span className="text-xs font-bold text-[#3E4F30]">
              {orderType === 'dine_in' ? tableNumber : 'Takeaway'}
            </span>
          </div>

          {/* Items Preview */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {items.map((it) => (
              <div
                key={it.cartItemId}
                className="flex items-start justify-between text-xs py-1 border-b border-[#E8DCC2]/40"
              >
                <div>
                  <p className="font-semibold text-[#2B2625]">
                    {it.quantity}x {it.menuItem.name}
                  </p>
                  <p className="text-[10px] text-[#634E3F]">
                    {it.customization.size && `Size ${it.customization.size} • `}
                    {it.customization.temp && `${it.customization.temp} • `}
                    Rp {it.unitPrice.toLocaleString('id-ID')}
                  </p>
                </div>
                <span className="font-medium text-[#2B2625] shrink-0">
                  Rp {(it.unitPrice * it.quantity).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="pt-2 border-t border-[#E8DCC2] space-y-1.5 text-xs text-[#634E3F]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-[#2B2625]">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-[#B4532A] font-semibold">
                <div className="flex items-center gap-1.5">
                  <span>Diskon Kupon ({appliedVoucher?.code})</span>
                  <button
                    type="button"
                    onClick={removeVoucher}
                    className="text-[10px] text-[#8C7767] hover:text-[#B4532A] underline"
                    title="Lepas kupon ini"
                  >
                    (Lepas)
                  </button>
                </div>
                <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-[#3E4F30] font-semibold pt-1">
              <span>Estimasi Tambahan Poin</span>
              <span>+{Math.floor(totalAmount / 10000)} Poin</span>
            </div>
            <div className="pt-2 border-t border-[#E8DCC2] flex justify-between items-baseline">
              <span className="font-bold text-sm text-[#2B2625]">Total Pembayaran</span>
              <span className="font-serif text-lg font-bold text-[#B4532A]">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
