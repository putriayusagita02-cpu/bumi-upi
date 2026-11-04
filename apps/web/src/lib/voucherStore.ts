import { Voucher } from './types';
import { MOCK_VOUCHERS, MENU_ITEMS } from './catalogData';

export const HOKI_VOUCHER_STORAGE_KEY = 'bumi_user_vouchers';
export const HOKI_PRIZES_STORAGE_KEY = 'bumi_won_prizes';

export function getSavedHokiVouchers(): Voucher[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HOKI_VOUCHER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHokiVoucher(voucher: Voucher): Voucher {
  if (typeof window === 'undefined') return voucher;
  try {
    const current = getSavedHokiVouchers();
    // Replace if same code exists, otherwise add to front
    const existingIdx = current.findIndex((v) => v.code.toUpperCase() === voucher.code.toUpperCase());
    if (existingIdx >= 0) {
      current[existingIdx] = { ...current[existingIdx], ...voucher, isRedeemed: false };
    } else {
      current.unshift(voucher);
    }
    localStorage.setItem(HOKI_VOUCHER_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Failed to save hoki voucher to localStorage', err);
  }
  return voucher;
}

export function getAllAvailableVouchers(): Voucher[] {
  const hokiVouchers = getSavedHokiVouchers();
  const activeHoki = hokiVouchers.filter((v) => !v.isRedeemed);
  // Merge: won vouchers first, followed by default base vouchers
  return [...activeHoki, ...MOCK_VOUCHERS];
}

export function findVoucherByCode(code: string): Voucher | undefined {
  if (!code) return undefined;
  const cleanCode = code.trim().toUpperCase();
  const all = getAllAvailableVouchers();
  return all.find((v) => v.code.toUpperCase() === cleanCode);
}

export function markVoucherAsRedeemed(voucherId: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedHokiVouchers();
    const updated = current.map((v) => (v.id === voucherId ? { ...v, isRedeemed: true } : v));
    localStorage.setItem(HOKI_VOUCHER_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function getWonPrizesHistory(): Array<{
  date: string;
  prize: string;
  label: string;
  code?: string;
  type?: string;
}> {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HOKI_PRIZES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Map won prize object into a usable Voucher object
export function createVoucherFromPrize(prize: {
  id: number;
  label: string;
  sub: string;
  type: 'points' | 'item' | 'voucher';
  value: string;
}): Voucher | null {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // Valid for 30 days
  const expiresAt = expiryDate.toISOString();

  if (prize.type === 'voucher') {
    return {
      id: `vouch-hoki-diskon15-${Date.now()}`,
      code: 'DISKON15',
      title: 'Voucher Hoki Diskon 15%',
      description: 'Hadiah Roda Traktiran Pojok Hoki! Diskon 15% untuk seluruh santapan & seduhan.',
      discountType: 'percent',
      discountValue: 15,
      minSpend: 25000,
      maxDiscount: 25000,
      expiresAt,
      badge: '🎁 Hadiah Pojok Hoki',
      isFromHoki: true,
      isRedeemed: false,
    };
  }

  if (prize.type === 'item') {
    if (prize.id === 1) {
      // Ulen Upi
      return {
        id: `vouch-hoki-ulen-${Date.now()}`,
        code: 'GRATISULEN',
        title: 'Gratis 1 Porsi Ulen Upi Bakar',
        description: 'Traktiran Nenek dari Pojok Hoki! Potongan 100% senilai 1 porsi Ulen Upi (Rp 16.000).',
        discountType: 'nominal',
        discountValue: 16000,
        minSpend: 0,
        expiresAt,
        badge: '🎁 Traktiran Menu Gratis',
        isFromHoki: true,
        freeItemId: 10, // ID Ulen Upi di CATALOG
        isRedeemed: false,
      };
    }
    if (prize.id === 3) {
      // Es Cincau Jadoel
      return {
        id: `vouch-hoki-cincau-${Date.now()}`,
        code: 'GRATISCINCAU',
        title: 'Gratis 1 Gelas Es Cincau Jadoel',
        description: 'Traktiran Nenek dari Pojok Hoki! Potongan 100% senilai 1 gelas Es Cincau Jadoel (Rp 15.000).',
        discountType: 'nominal',
        discountValue: 15000,
        minSpend: 0,
        expiresAt,
        badge: '🎁 Traktiran Menu Gratis',
        isFromHoki: true,
        freeItemId: 69, // ID Es Cincau Jadoel
        isRedeemed: false,
      };
    }
    if (prize.id === 4) {
      // Kopi Garut
      return {
        id: `vouch-hoki-kopi-${Date.now()}`,
        code: 'GRATISKOPI',
        title: 'Gratis 1 Cangkir Kopi Tubruk Papandayan',
        description: 'Traktiran Nenek dari Pojok Hoki! Potongan 100% senilai 1 cangkir Kopi Tubruk Garut (Rp 18.000).',
        discountType: 'nominal',
        discountValue: 18000,
        minSpend: 0,
        expiresAt,
        badge: '🎁 Traktiran Menu Gratis',
        isFromHoki: true,
        freeItemId: 74, // ID Kopi Hitam Tubruk
        isRedeemed: false,
      };
    }
  }

  return null;
}
