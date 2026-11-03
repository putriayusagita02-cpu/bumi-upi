import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROJECT_ROOT = path.resolve(__dirname, '../../..');

export const PATHS = {
  root: PROJECT_ROOT,
  pnpmWorkspace: path.join(PROJECT_ROOT, 'pnpm-workspace.yaml'),
  rootPackageJson: path.join(PROJECT_ROOT, 'package.json'),
  projectMd: path.join(PROJECT_ROOT, 'PROJECT.md'),
  packages: {
    ui: path.join(PROJECT_ROOT, 'packages/ui'),
    db: path.join(PROJECT_ROOT, 'packages/db')
  },
  apps: {
    web: path.join(PROJECT_ROOT, 'apps/web'),
    admin: path.join(PROJECT_ROOT, 'apps/admin')
  },
  migrations: path.join(PROJECT_ROOT, 'supabase/migrations'),
  srcLib: path.join(PROJECT_ROOT, 'src/lib')
};

export function readTextSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (err) {
    // Return null if unreadable
  }
  return null;
}

export function readJsonSafe(filePath) {
  try {
    const content = readTextSafe(filePath);
    if (content) {
      return JSON.parse(content);
    }
  } catch (err) {
    // Return null on JSON error
  }
  return null;
}

/**
 * Standard In-Memory Reference Store Engine
 * Implements the domain contracts specified in PROJECT.md and explorer_survey_3
 */
export class ReferenceStoreEngine {
  constructor(initialData = {}) {
    this.customers = new Map(initialData.customers || []);
    this.inventory = new Map(initialData.inventory || []);
    this.vouchers = new Map(initialData.vouchers || []);
    this.customerVouchers = new Map(initialData.customerVouchers || []);
    this.orders = new Map(initialData.orders || []);
    this.pointsLedger = [];
    this.auditLogs = [];
    this.otpStore = new Map(); // phone -> { code, expiresAt, attempts, verified }
  }

  // --- WhatsApp OTP ---
  generateOtp(phone) {
    // Generate 6 digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    this.otpStore.set(phone, {
      code,
      expiresAt,
      attempts: 0,
      verified: false
    });

    const banner = [
      '======================================================================',
      '🌿 [WHATSAPP OTP CONSOLE MODE] — RUMAH TAMAH BUMI UPI GARUT',
      '----------------------------------------------------------------------',
      `Tujuan Nomor : ${phone}`,
      `Kode OTP     : ${code}`,
      'Masa Berlaku : 10 Menit (WIB)',
      'Waktu Kirim  : ' + new Date().toISOString() + ' WIB',
      'Pesan Teks   : "Sampurasun! Kode verifikasi pendaftaran Rumah Tamah',
      '                Bumi Upi Anda adalah: ' + code + '."',
      '----------------------------------------------------------------------',
      'Status       : Terkirim Sukses (Console Simulation Mode)',
      '======================================================================'
    ].join('\n');

    return {
      success: true,
      phone,
      demoOtp: code,
      banner,
      expiresAt
    };
  }

  verifyOtp(phone, inputCode) {
    if (!phone || !inputCode) {
      return { success: false, error: 'Phone and OTP code are required' };
    }
    const cleanCode = String(inputCode).trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      return { success: false, error: 'OTP must be exactly 6 numeric digits' };
    }

    const record = this.otpStore.get(phone);
    if (!record) {
      return { success: false, error: 'No OTP requested for this phone number' };
    }

    if (record.verified) {
      return { success: false, error: 'OTP already verified and cannot be reused' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'OTP code has expired' };
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      return { success: false, error: 'Maximum attempts exceeded, OTP blocked' };
    }

    if (record.code !== cleanCode) {
      return { success: false, error: 'Invalid OTP code' };
    }

    record.verified = true;
    return { success: true, message: 'OTP verified successfully' };
  }

  // --- Atomic Order Placement ---
  createOrderAtomic({
    idempotencyKey,
    customerId,
    cashierId,
    orderType = 'dine_in',
    tableNumber = 'Meja 01',
    items = [],
    customerVoucherId = null,
    paymentMethod = 'qris',
    notes = ''
  }) {
    if (!idempotencyKey) {
      return { success: false, error: 'idempotency_key is required' };
    }

    // 1. Idempotency Check
    if (this.orders.has(idempotencyKey)) {
      const existing = this.orders.get(idempotencyKey);
      return {
        success: true,
        isDuplicate: true,
        orderId: existing.id,
        orderNumber: existing.orderNumber,
        finalAmount: existing.finalAmount,
        pointsEarned: existing.pointsEarned,
        status: existing.status,
        message: 'Order already recorded (Idempotent).'
      };
    }

    // 2. Validate Items
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'Order must contain at least 1 item' };
    }

    let subtotal = 0;
    for (const item of items) {
      if (typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return { success: false, error: `Invalid quantity for item ${item.itemName}: must be positive integer` };
      }
      if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
        return { success: false, error: `Invalid price for item ${item.itemName}` };
      }
      // Check stock
      if (item.productId && this.inventory.has(item.productId)) {
        const inv = this.inventory.get(item.productId);
        if (inv.trackStock && inv.currentStock < item.quantity) {
          return { success: false, error: `Insufficient stock for ${item.itemName} (Available: ${inv.currentStock})` };
        }
      }
      subtotal += item.unitPrice * item.quantity;
    }

    // 3. Voucher Validation
    let discountAmount = 0;
    let appliedVoucherId = null;

    if (customerVoucherId) {
      const cv = this.customerVouchers.get(customerVoucherId);
      if (!cv) {
        return { success: false, error: 'Customer voucher not found' };
      }
      if (cv.isRedeemed) {
        return { success: false, error: 'Voucher has already been redeemed' };
      }
      if (new Date(cv.expiresAt).getTime() < Date.now()) {
        return { success: false, error: 'Voucher has expired' };
      }
      if (subtotal < cv.minSpend) {
        return { success: false, error: `Subtotal Rp ${subtotal} below minimum spend Rp ${cv.minSpend}` };
      }

      if (cv.discountType === 'nominal') {
        discountAmount = cv.discountValue;
      } else if (cv.discountType === 'percent') {
        const rawDisc = Math.floor((subtotal * cv.discountValue) / 100);
        discountAmount = cv.maxDiscount ? Math.min(cv.maxDiscount, rawDisc) : rawDisc;
      }
      discountAmount = Math.min(subtotal, discountAmount);
      appliedVoucherId = cv.voucherId;
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);

    // 4. Points Calculation (1 point per Rp 10.000)
    const pointsEarned = customerId ? Math.floor(finalAmount / 10000) : 0;

    // 5. Decrement Stock
    for (const item of items) {
      if (item.productId && this.inventory.has(item.productId)) {
        const inv = this.inventory.get(item.productId);
        if (inv.trackStock) {
          inv.currentStock = Math.max(0, inv.currentStock - item.quantity);
        }
      }
    }

    // 6. Mark Voucher Redeemed
    if (customerVoucherId) {
      const cv = this.customerVouchers.get(customerVoucherId);
      cv.isRedeemed = true;
      cv.redeemedAt = new Date().toISOString();
    }

    // 7. Update Customer Points & Tier
    let newTier = 'Tamu';
    if (customerId && this.customers.has(customerId)) {
      const cust = this.customers.get(customerId);
      cust.pointsBalance = (cust.pointsBalance || 0) + pointsEarned;
      cust.cumulativePoints = (cust.cumulativePoints || 0) + pointsEarned;

      if (cust.cumulativePoints >= 300) {
        newTier = 'Keluarga';
      } else if (cust.cumulativePoints >= 100) {
        newTier = 'Sahabat';
      } else {
        newTier = 'Tamu';
      }
      cust.tier = newTier;

      this.pointsLedger.push({
        customerId,
        pointsChange: pointsEarned,
        balanceAfter: cust.pointsBalance,
        reason: 'transaction',
        createdAt: new Date().toISOString()
      });
    }

    // 8. Store Order
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const orderNumber = `BU-ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.orders.size + 1).padStart(4, '0')}`;

    const orderRecord = {
      id: orderId,
      orderNumber,
      idempotencyKey,
      customerId,
      cashierId,
      orderType,
      tableNumber,
      status: 'confirmed',
      subtotal,
      discountAmount,
      finalAmount,
      pointsEarned,
      voucherId: appliedVoucherId,
      customerVoucherId,
      paymentMethod,
      paymentStatus: 'paid',
      items,
      notes,
      createdAt: new Date().toISOString()
    };

    this.orders.set(idempotencyKey, orderRecord);

    this.auditLogs.push({
      action: 'CREATE_ORDER',
      targetId: orderId,
      staffId: cashierId,
      details: { orderNumber, finalAmount, pointsEarned }
    });

    return {
      success: true,
      isDuplicate: false,
      orderId,
      orderNumber,
      subtotal,
      discountAmount,
      finalAmount,
      pointsEarned,
      newTier,
      status: 'confirmed'
    };
  }
}
