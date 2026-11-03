/**
 * BUMI UPI CRM & ORDERING MONOREPO
 * Full In-Memory Mock Store & Repository Pattern Implementation
 * Enables 100% Zero-Credential End-to-End Operation & Automated Testing
 * Location: packages/db/src/mockStore.ts
 */

import type {
  Profile,
  Category,
  MenuItem,
  InventoryItem,
  Order,
  OrderItem,
  Voucher,
  CustomerVoucher,
  PointsLedgerItem,
  Reservation,
  AuditLog,
  RFMScore,
  RFMSummary,
  CreateOrderAtomicParams,
  CreateOrderAtomicResult,
  SendOtpResult,
  VerifyOtpResult,
  TierLevel
} from './types';
import { CATALOG_CATEGORIES, CATALOG_105_ITEMS } from './seedCatalog105';
import { computeAllRfmScores, generateRfmSummary } from './rfmEngine';
import { saveSharedOrder } from './liveSync';

// ----------------------------------------------------------------------------
// Deterministic Synthetic Customers Generator (200 Profiles)
// ----------------------------------------------------------------------------
const FIRST_NAMES = [
  'Asep', 'Cecep', 'Dadan', 'Eman', 'Ginanjar', 'Hendra', 'Iwan', 'Jajang', 'Kurniawan', 'Maman',
  'Nana', 'Oding', 'Purnama', 'Rizky', 'Suryana', 'Tata', 'Ujang', 'Wawan', 'Yayan', 'Zainal',
  'Ai', 'Cucu', 'Dewi', 'Elis', 'Fitri', 'Gita', 'Hani', 'Imas', 'Lilis', 'Marlina',
  'Neneng', 'Popon', 'Rina', 'Siti', 'Tuti', 'Wiwin', 'Yayah', 'Yuliani', 'Dian', 'Nadia'
];

const LAST_NAMES = [
  'Kusuma', 'Permana', 'Sutisna', 'Nugraha', 'Hidayat', 'Kurnia', 'Saputra', 'Hermawan', 'Pratama', 'Gunawan',
  'Suhendar', 'Sudrajat', 'Sanjaya', 'Budiman', 'Wibowo', 'Santoso', 'Ramadhan', 'Wijaya', 'Siregar', 'Mahendra',
  'Subagja', 'Supriatna', 'Iskandar', 'Somantri', 'Wiguna', 'Fauzi', 'Hakim', 'Bachtiar', 'Syahputra', 'Rustandi'
];

export function generate200Customers(): Profile[] {
  const customers: Profile[] = [];

  // 1. Admin
  customers.push({
    id: 'usr-admin-01',
    role: 'admin',
    name: 'Teh Upi (Owner Bumi Upi)',
    email: 'putriayusagita02@gmail.com',
    phone: '081223344550',
    is_phone_verified: true,
    telegram_chat_id: 10001,
    telegram_username: 'owner_bumiupi',
    tier: 'Keluarga',
    points_balance: 450,
    cumulative_points: 620,
    qr_code: 'BUMI-ADM-001',
    birth_date: '1985-06-15',
    menu_preferences: ['Nasi Goreng Kecombrang', 'Lidah Sambel Hejo'],
    opt_in_promo: true,
    created_at: '2026-05-01T08:00:00+07:00'
  });

  // 2. Kasir
  customers.push({
    id: 'usr-kasir-01',
    role: 'kasir',
    name: 'Kang Asep (Kasir Utama)',
    email: 'kasir@bumiupi.id',
    phone: '081223344551',
    is_phone_verified: true,
    telegram_chat_id: 10002,
    telegram_username: 'kasir_bumiupi',
    tier: 'Sahabat',
    points_balance: 120,
    cumulative_points: 150,
    qr_code: 'BUMI-KSR-001',
    birth_date: '1996-03-22',
    menu_preferences: ['Tempe Mendoan Panas', 'Es Cokelat Malt Dinosaurus'],
    opt_in_promo: true,
    created_at: '2026-05-01T08:30:00+07:00'
  });

  // 3. Demo Customer (Dimas Kurniawan)
  customers.push({
    id: 'usr-cust-demo',
    role: 'customer',
    name: 'Dimas Kurniawan',
    email: 'customer@bumiupi.id',
    phone: '081234567890',
    is_phone_verified: true,
    telegram_chat_id: 10003,
    telegram_username: 'dimaskurnia',
    tier: 'Sahabat',
    points_balance: 142,
    cumulative_points: 242,
    qr_code: 'BUMI-CUST-8899',
    birth_date: '1998-10-14',
    menu_preferences: ['Nasi Dangdutan', 'Es Cincau Jadoel'],
    opt_in_promo: true,
    created_at: '2026-05-15T11:20:00+07:00'
  });

  // Generate 197 additional customers with realistic variations
  for (let i = 1; i <= 197; i++) {
    const fn = FIRST_NAMES[(i * 3 + 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 5 + 11) % LAST_NAMES.length];
    const pad = String(i).padStart(3, '0');
    const phone = `0812${String(10000000 + i * 38291).slice(0, 8)}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`;

    let tier: TierLevel = 'Tamu';
    const cumulative = 20 + ((i * 17) % 360);
    if (cumulative >= 300) {
      tier = 'Keluarga';
    } else if (cumulative >= 100) {
      tier = 'Sahabat';
    }
    const balance = Math.max(10, Math.floor(cumulative * 0.7));
    const isVerified = i % 3 !== 0;

    customers.push({
      id: `usr-cust-${pad}`,
      role: 'customer',
      name: `${fn} ${ln}`,
      email,
      phone,
      is_phone_verified: isVerified,
      telegram_chat_id: isVerified ? 20000 + i : null,
      telegram_username: isVerified ? `${fn.toLowerCase()}_${i}` : null,
      tier,
      points_balance: balance,
      cumulative_points: cumulative,
      qr_code: `BUMI-CUST-${pad}`,
      birth_date: `199${i % 10}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
      menu_preferences: [
        CATALOG_105_ITEMS[i % CATALOG_105_ITEMS.length].name,
        CATALOG_105_ITEMS[(i + 13) % CATALOG_105_ITEMS.length].name
      ],
      opt_in_promo: i % 10 !== 0,
      created_at: new Date(Date.parse('2026-05-01T00:00:00+07:00') + i * 78000000).toISOString()
    });
  }

  return customers;
}

// ----------------------------------------------------------------------------
// Master Vouchers Dataset
// ----------------------------------------------------------------------------
export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'vcr-01',
    code: 'WILUJENG-UPI',
    title: 'Voucher Selamat Datang Tamu',
    description: 'Potongan Rp 15.000 untuk kunjungan pertama Anda sebagai Tamu Rumah Bumi Upi.',
    discount_type: 'nominal',
    discount_value: 15000,
    min_spend: 50000,
    quota: 500,
    claimed_count: 184,
    redeemed_count: 142,
    valid_from: '2026-05-01',
    valid_until: '2026-12-31',
    target_tier: 'Tamu',
    target_rfm_segment: 'Baru',
    is_active: true
  },
  {
    id: 'vouch-tamu-15k',
    code: 'BUMIWELCOME',
    title: 'Voucher Selamat Datang Tamu',
    description: 'Potongan Rp 15.000 untuk kunjungan pertama Anda sebagai Tamu Rumah Bumi Upi.',
    discount_type: 'nominal',
    discount_value: 15000,
    min_spend: 50000,
    quota: 1000,
    claimed_count: 50,
    redeemed_count: 10,
    valid_from: '2026-01-01',
    valid_until: '2026-12-31',
    target_tier: 'Tamu',
    is_active: true
  },
  {
    id: 'vcr-02',
    code: 'NOBAR-PERSIB',
    title: 'Voucher Nobar Persib Juara',
    description: 'Diskon 20% untuk semua menu cemilan hangat saat nobar pertandingan Persib.',
    discount_type: 'percent',
    discount_value: 20,
    min_spend: 40000,
    max_discount: 25000,
    quota: 200,
    claimed_count: 126,
    redeemed_count: 98,
    valid_from: '2026-06-01',
    valid_until: '2026-11-30',
    target_rfm_segment: 'Champions',
    is_active: true
  },
  {
    id: 'vouch-nobar-20pct',
    code: 'PERSIBJUARA',
    title: 'Voucher Nobar Persib Juara',
    description: 'Diskon 20% untuk semua menu cemilan hangat saat nobar di Bale Utama.',
    discount_type: 'percent',
    discount_value: 20,
    min_spend: 40000,
    max_discount: 20000,
    quota: 1000,
    claimed_count: 60,
    redeemed_count: 15,
    valid_from: '2026-01-01',
    valid_until: '2026-12-31',
    is_active: true
  },
  {
    id: 'vcr-03',
    code: 'RINDU-RUMAH',
    title: 'Voucher Kangen Rumah Tamah',
    description: 'Potongan Rp 25.000 khusus untuk Anda yang sudah lama tidak singgah ke Bumi.',
    discount_type: 'nominal',
    discount_value: 25000,
    min_spend: 80000,
    quota: 300,
    claimed_count: 85,
    redeemed_count: 42,
    valid_from: '2026-07-01',
    valid_until: '2026-12-31',
    target_rfm_segment: 'Berisiko',
    is_active: true
  },
  {
    id: 'vouch-ultah-30k',
    code: 'ULTAHSUNDA',
    title: 'Voucher Traktiran Ulang Tahun',
    description: 'Potongan spesial Rp 30.000 di hari bahagiamu bersama Keluarga Bumi.',
    discount_type: 'nominal',
    discount_value: 30000,
    min_spend: 75000,
    quota: 1000,
    claimed_count: 30,
    redeemed_count: 5,
    valid_from: '2026-01-01',
    valid_until: '2026-12-31',
    is_active: true
  },
  {
    id: 'vcr-04',
    code: 'ULTAH-UPI',
    title: 'Traktiran Spesial Hari Ulang Tahun',
    description: 'Gratis 1 Porsi Es Cokelat Bumi Klasik + Pisang Goreng Madu di bulan kelahiran Anda.',
    discount_type: 'free_item',
    discount_value: 42000,
    min_spend: 50000,
    quota: 1000,
    claimed_count: 45,
    redeemed_count: 38,
    valid_from: '2026-01-01',
    valid_until: '2026-12-31',
    is_active: true
  },
  {
    id: 'vcr-05',
    code: 'KELUARGA-HEMAT',
    title: 'Apresiasi Tingkat Keluarga',
    description: 'Diskon 15% tanpa minimum belanja untuk anggota tier tertinggi Keluarga Bumi.',
    discount_type: 'percent',
    discount_value: 15,
    min_spend: 0,
    max_discount: 50000,
    quota: 500,
    claimed_count: 62,
    redeemed_count: 54,
    valid_from: '2026-08-01',
    valid_until: '2026-12-31',
    target_tier: 'Keluarga',
    target_rfm_segment: 'Champions',
    is_active: true
  }
];

// ----------------------------------------------------------------------------
// Deterministic Synthetic Transactions Generator (2,140 Transactions)
// ----------------------------------------------------------------------------
export function generate2140Transactions(customers: Profile[]): Order[] {
  const transactions: Order[] = [];
  const onlyCustomers = customers.filter((c) => c.role === 'customer');
  const startDate = new Date('2026-05-01T07:30:00+07:00').getTime();
  const endDate = new Date('2026-10-31T22:30:00+07:00').getTime();
  const totalDuration = endDate - startDate;
  const TOTAL_TX = 2140;

  for (let i = 1; i <= TOTAL_TX; i++) {
    const progress = i / TOTAL_TX;
    const rawTime = startDate + progress * totalDuration;
    const dateObj = new Date(rawTime);

    const hourMod = 11 + ((i * 7) % 11);
    const minMod = (i * 13) % 60;
    dateObj.setHours(hourMod, minMod, 0, 0);

    let custIndex = 0;
    if (i % 5 === 0) {
      custIndex = 2; // Dimas Kurniawan (Demo Customer)
    } else if (i % 2 === 0) {
      custIndex = 3 + (i % 30);
    } else {
      custIndex = 3 + (i % Math.max(1, onlyCustomers.length - 3));
    }
    const cust = onlyCustomers[custIndex] || onlyCustomers[2];

    const itemCount = 2 + (i % 3);
    const items: OrderItem[] = [];
    let subtotal = 0;

    for (let k = 0; k < itemCount; k++) {
      const menu = CATALOG_105_ITEMS[(i + k * 7) % CATALOG_105_ITEMS.length];
      const qty = 1 + ((i + k) % 2);
      const lineTotal = menu.price * qty;
      subtotal += lineTotal;
      items.push({
        productId: menu.id,
        itemName: menu.name,
        unitPrice: menu.price,
        quantity: qty,
        subtotal: lineTotal
      });
    }

    let discount = 0;
    let voucherId: string | null = null;
    let voucherTitle: string | undefined = undefined;

    if (i % 6 === 0 && subtotal >= 50000) {
      const vcr = INITIAL_VOUCHERS[i % INITIAL_VOUCHERS.length];
      voucherId = vcr.id;
      voucherTitle = vcr.title;
      if (vcr.discount_type === 'nominal') {
        discount = vcr.discount_value;
      } else if (vcr.discount_type === 'percent') {
        discount = Math.min(vcr.max_discount || 25000, Math.floor((subtotal * vcr.discount_value) / 100));
      } else {
        discount = 20000;
      }
    }

    const finalAmount = Math.max(0, subtotal - discount);
    const pointsEarned = Math.floor(finalAmount / 10000);
    const pad = String(i).padStart(5, '0');

    transactions.push({
      id: `tx-${pad}`,
      orderNumber: `BU-${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}-${pad}`,
      idempotencyKey: `IDEMP-${pad}-${dateObj.getTime()}`,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerTier: cust.tier,
      cashierId: 'usr-kasir-01',
      cashierName: 'Kang Asep (Kasir Utama)',
      orderType: i % 4 === 0 ? 'takeaway' : 'dine_in',
      tableNumber: i % 4 === 0 ? undefined : `Meja ${String(1 + (i % 20)).padStart(2, '0')}`,
      status: 'completed',
      subtotal,
      discountAmount: discount,
      finalAmount,
      pointsEarned,
      voucherId,
      voucherTitle,
      paymentMethod: i % 2 === 0 ? 'qris' : 'cash',
      paymentStatus: 'paid',
      items,
      notes: i % 15 === 0 ? 'Makan bersama keluarga besar' : undefined,
      createdAt: dateObj.toISOString()
    });
  }

  return transactions;
}

// ----------------------------------------------------------------------------
// In-Memory Mock Store Class
// ----------------------------------------------------------------------------
export class MockStore {
  public customers: Map<string, Profile> = new Map();
  public categories: Category[] = [];
  public menuItems: MenuItem[] = [];
  public inventory: Map<string | number, InventoryItem> = new Map();
  public vouchers: Map<string, Voucher> = new Map();
  public customerVouchers: Map<string, CustomerVoucher> = new Map();
  public orders: Map<string, Order> = new Map(); // keyed by idempotencyKey
  public pointsLedger: PointsLedgerItem[] = [];
  public reservations: Reservation[] = [];
  public auditLogs: AuditLog[] = [];
  public otpStore: Map<string, { code: string; expiresAt: number; attempts: number; verified: boolean }> = new Map();

  constructor() {
    this.init();
  }

  public init(): void {
    // 1. Categories
    this.categories = [...CATALOG_CATEGORIES];

    // 2. Menu Items (105 items)
    this.menuItems = [...CATALOG_105_ITEMS];

    // 3. Inventory for 105 items
    for (const item of this.menuItems) {
      this.inventory.set(item.id, {
        id: `inv-${item.id}`,
        productId: item.id,
        currentStock: 100,
        minimumStock: 10,
        unit: 'porsi',
        trackStock: true,
        updatedAt: new Date().toISOString()
      });
      if (item.uuid) {
        this.inventory.set(item.uuid, {
          id: `inv-${item.uuid}`,
          productId: item.uuid,
          currentStock: 100,
          minimumStock: 10,
          unit: 'porsi',
          trackStock: true,
          updatedAt: new Date().toISOString()
        });
      }
    }

    // 4. Vouchers
    for (const v of INITIAL_VOUCHERS) {
      this.vouchers.set(v.id, { ...v });
      this.vouchers.set(v.code, { ...v });
    }

    // 5. Customers (200 Profiles)
    const initialCustomers = generate200Customers();
    for (const c of initialCustomers) {
      this.customers.set(c.id, c);
    }

    // Pre-seed demo customer voucher
    const demoVoucher = this.vouchers.get('vcr-01');
    if (demoVoucher) {
      const cv: CustomerVoucher = {
        id: 'cv-demo-01',
        customerId: 'usr-cust-demo',
        voucherId: demoVoucher.id,
        uniqueCode: 'WILUJENG-DEMO-01',
        qrCode: 'BUMI-VCR-WILUJENG-DEMO-01',
        isRedeemed: false,
        expiresAt: '2026-12-31T23:59:59+07:00',
        createdAt: '2026-05-15T11:20:00+07:00',
        voucher: demoVoucher
      };
      this.customerVouchers.set(cv.id, cv);
      this.customerVouchers.set(cv.uniqueCode, cv);
    }

    // 6. Transactions (2,140 Historical Transactions)
    const initialTx = generate2140Transactions(initialCustomers);
    for (const tx of initialTx) {
      this.orders.set(tx.idempotencyKey, tx);
    }
  }

  // --- Catalog Methods ---
  public getMenuCatalog(): MenuItem[] {
    return this.menuItems;
  }

  public getCategories(): Category[] {
    return this.categories;
  }

  public getMenuItem(id: string | number): MenuItem | null {
    const item = this.menuItems.find((i) => i.id === id || String(i.id) === String(id) || i.uuid === id || i.slug === id);
    return item || null;
  }

  // --- Customer & Auth Methods ---
  public getCustomerProfile(phoneOrEmailOrId: string): Profile | null {
    if (!phoneOrEmailOrId) return null;
    const clean = String(phoneOrEmailOrId).trim();
    if (this.customers.has(clean)) return this.customers.get(clean)!;
    for (const c of this.customers.values()) {
      if (c.phone === clean || c.email === clean || c.qr_code === clean) {
        return c;
      }
    }
    return null;
  }

  private lastGeneratedOtp: { code: string; expiresAt: number; phone: string } | null = null;

  public sendOtp(phone: string): SendOtpResult {
    const cleanPhone = String(phone).replace(/\s+/g, '');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const entry = {
      code,
      expiresAt,
      attempts: 0,
      verified: false
    };

    // Store across all Indonesian phone number formats
    const digits = cleanPhone.replace(/\D/g, '');
    const variations = new Set<string>([cleanPhone, digits]);
    if (digits.startsWith('0')) {
      variations.add(digits.slice(1));
      variations.add('62' + digits.slice(1));
      variations.add('+62' + digits.slice(1));
    } else if (digits.startsWith('62')) {
      variations.add('0' + digits.slice(2));
      variations.add(digits.slice(2));
      variations.add('+' + digits);
    } else if (digits.startsWith('8')) {
      variations.add('0' + digits);
      variations.add('62' + digits);
      variations.add('+62' + digits);
    }

    for (const v of variations) {
      this.otpStore.set(v, entry);
    }
    this.lastGeneratedOtp = { code, expiresAt, phone: cleanPhone };

    const banner = [
      '======================================================================',
      '🌿 [WHATSAPP OTP CONSOLE MODE] — RUMAH TAMAH BUMI UPI GARUT',
      '----------------------------------------------------------------------',
      `Tujuan Nomor : ${cleanPhone}`,
      `Kode OTP     : ${code}`,
      'Masa Berlaku : 10 Menit (WIB)',
      'Waktu Kirim  : ' + new Date().toISOString() + ' WIB',
      'Pesan Teks   : "Sampurasun! Kode verifikasi pendaftaran Rumah Tamah',
      '                Bumi Upi Anda adalah: ' + code + '."',
      '----------------------------------------------------------------------',
      'Status       : Terkirim Sukses (Console Simulation Mode)',
      '======================================================================'
    ].join('\n');

    console.log(banner);

    return {
      success: true,
      phone: cleanPhone,
      demoOtp: code,
      banner,
      expiresAt
    };
  }

  public verifyOtp(phone: string, inputCode: string, name?: string, email?: string): VerifyOtpResult {
    if (!phone || !inputCode) {
      return { success: false, error: 'Nomor telepon dan kode OTP wajib diisi.' };
    }
    const cleanPhone = String(phone).replace(/\s+/g, '');
    const cleanCode = String(inputCode).trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return { success: false, error: 'Kode OTP harus berupa 6 digit angka.' };
    }

    const digits = cleanPhone.replace(/\D/g, '');
    const variations = new Set<string>([cleanPhone, digits]);
    if (digits.startsWith('0')) {
      variations.add(digits.slice(1));
      variations.add('62' + digits.slice(1));
      variations.add('+62' + digits.slice(1));
    } else if (digits.startsWith('62')) {
      variations.add('0' + digits.slice(2));
      variations.add(digits.slice(2));
      variations.add('+' + digits);
    } else if (digits.startsWith('8')) {
      variations.add('0' + digits);
      variations.add('62' + digits);
      variations.add('+62' + digits);
    }

    let record = this.otpStore.get(cleanPhone);
    if (!record) {
      for (const v of variations) {
        if (this.otpStore.has(v)) {
          record = this.otpStore.get(v);
          break;
        }
      }
    }

    if (!record && this.lastGeneratedOtp && this.lastGeneratedOtp.code === cleanCode && Date.now() <= this.lastGeneratedOtp.expiresAt) {
      record = {
        code: cleanCode,
        expiresAt: this.lastGeneratedOtp.expiresAt,
        attempts: 1,
        verified: false,
      };
      for (const v of variations) {
        this.otpStore.set(v, record);
      }
    }

    // Allow demo fallback OTP "123456" or "839201" for testing
    const isMasterDemoCode = cleanCode === '123456' || cleanCode === '839201';

    if (!record && !isMasterDemoCode) {
      return { success: false, error: 'OTP belum diminta untuk nomor ini.' };
    }

    if (record) {
      if (record.verified) {
        return { success: false, error: 'OTP sudah pernah digunakan dan tidak dapat dipakai ulang.' };
      }
      if (Date.now() > record.expiresAt) {
        return { success: false, error: 'Kode OTP telah kedaluwarsa.' };
      }
      record.attempts += 1;
      if (record.attempts > 5) {
        return { success: false, error: 'Batas percobaan OTP terlampaui.' };
      }
      if (record.code !== cleanCode && !isMasterDemoCode) {
        return { success: false, error: 'Kode OTP tidak cocok.' };
      }
      record.verified = true;
    }

    let customer = this.getCustomerProfile(cleanPhone);
    if (!customer) {
      // Auto-register new customer with real name & email & 50 bonus points
      const newId = `usr-cust-${Date.now()}`;
      customer = {
        id: newId,
        role: 'customer',
        name: name ? String(name).trim() : `Pelanggan ${cleanPhone.slice(-4)}`,
        email: email ? String(email).trim() : `cust_${cleanPhone.slice(-4)}@bumiupi.id`,
        phone: cleanPhone,
        is_phone_verified: true,
        telegram_chat_id: null,
        telegram_username: null,
        tier: 'Tamu',
        points_balance: 50,
        cumulative_points: 50,
        qr_code: `BUMI-CUST-${cleanPhone.slice(-4)}`,
        birth_date: '2000-01-01',
        menu_preferences: [],
        opt_in_promo: true,
        created_at: new Date().toISOString()
      };
      this.customers.set(customer.id, customer);
      this.customers.set(customer.phone, customer);
    } else {
      customer.is_phone_verified = true;
      if (name) customer.name = String(name).trim();
      if (email) customer.email = String(email).trim();
    }

    return {
      success: true,
      message: 'Nomor telepon berhasil diverifikasi.',
      user: customer
    };
  }

  // --- Inventory & Stock Methods ---
  public updateStock(productId: string | number, quantityDelta: number): { success: boolean; currentStock: number } {
    let inv = this.inventory.get(productId);
    if (!inv) {
      inv = {
        id: `inv-${productId}`,
        productId,
        currentStock: 100,
        minimumStock: 10,
        unit: 'porsi',
        trackStock: true,
        updatedAt: new Date().toISOString()
      };
      this.inventory.set(productId, inv);
    }

    inv.currentStock = Math.max(0, inv.currentStock + quantityDelta);
    inv.updatedAt = new Date().toISOString();

    this.auditLogs.push({
      id: `audit-${Date.now()}`,
      staffName: 'Sistem Kasir',
      action: 'STOCK_ADJUSTMENT',
      targetEntity: 'inventory',
      targetId: String(productId),
      details: { quantityDelta, newStock: inv.currentStock },
      createdAt: new Date().toISOString()
    });

    return { success: true, currentStock: inv.currentStock };
  }

  // --- Atomic Order Creation ---
  public createOrderAtomic(params: CreateOrderAtomicParams): CreateOrderAtomicResult {
    const {
      idempotencyKey,
      customerId,
      cashierId,
      orderType = 'dine_in',
      tableNumber = 'Meja 01',
      items = [],
      customerVoucherId,
      paymentMethod = 'qris',
      notes
    } = params;

    if (!idempotencyKey) {
      return { success: false, isDuplicate: false, error: 'idempotency_key wajib disertakan.' };
    }

    // 1. Idempotency Check
    if (this.orders.has(idempotencyKey)) {
      const existing = this.orders.get(idempotencyKey)!;
      return {
        success: true,
        isDuplicate: true,
        orderId: existing.id,
        orderNumber: existing.orderNumber,
        subtotal: existing.subtotal,
        discountAmount: existing.discountAmount,
        finalAmount: existing.finalAmount,
        pointsEarned: existing.pointsEarned,
        newTier: existing.customerTier,
        status: existing.status,
        message: 'Pesanan sudah tercatat sebelumnya (Idempotent).'
      };
    }

    // 2. Validate Items
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, isDuplicate: false, error: 'Pesanan harus memiliki minimal 1 item (empty cart).' };
    }

    let subtotal = 0;
    for (const item of items) {
      if (typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return {
          success: false,
          isDuplicate: false,
          error: `Kuantitas untuk item ${item.itemName} tidak valid: harus bilangan bulat positif.`
        };
      }
      if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
        return { success: false, isDuplicate: false, error: `Harga untuk item ${item.itemName} tidak valid.` };
      }

      // Check stock
      if (item.productId && this.inventory.has(item.productId)) {
        const inv = this.inventory.get(item.productId)!;
        if (inv.trackStock && inv.currentStock < item.quantity) {
          return {
            success: false,
            isDuplicate: false,
            error: `Stok tidak mencukupi untuk ${item.itemName} (Tersedia: ${inv.currentStock}).`
          };
        }
      }

      subtotal += item.unitPrice * item.quantity;
    }

    // 3. Single-Use Voucher Validation (Row-Locking replica)
    let discountAmount = 0;
    let appliedVoucherId: string | null = null;

    if (customerVoucherId) {
      let cv = this.customerVouchers.get(customerVoucherId);
      if (!cv) {
        for (const val of this.customerVouchers.values()) {
          if (
            val.uniqueCode === customerVoucherId ||
            val.voucherId === customerVoucherId ||
            val.voucher?.code === customerVoucherId ||
            val.voucher?.code.toUpperCase() === String(customerVoucherId).toUpperCase()
          ) {
            cv = val;
            break;
          }
        }
      }
      
      const isPromoVoucher = !customerVoucherId.startsWith('cv-');

      // For general promo vouchers, instantiate fresh instance if none or already redeemed
      if (!cv || (cv.isRedeemed && isPromoVoucher)) {
        const vm =
          this.vouchers.get(customerVoucherId) ||
          Array.from(this.vouchers.values()).find(
            (v) =>
              v.code === customerVoucherId ||
              v.id === customerVoucherId ||
              v.code.toUpperCase() === String(customerVoucherId).toUpperCase()
          );
        if (vm) {
          const autoCv: CustomerVoucher = {
            id: `cv-auto-${vm.id}-${Date.now()}`,
            customerId: customerId || 'guest',
            voucherId: vm.id,
            uniqueCode: `CV-${vm.code}-${Date.now()}`,
            qrCode: `BUMI-VCR-${vm.code}`,
            isRedeemed: false,
            expiresAt: '2026-12-31T23:59:59+07:00',
            createdAt: new Date().toISOString(),
            voucher: vm,
          };
          this.customerVouchers.set(autoCv.id, autoCv);
          this.customerVouchers.set(customerVoucherId, autoCv);
          cv = autoCv;
        }
      }
      if (!cv) {
        return { success: false, isDuplicate: false, error: 'Voucher pelanggan tidak ditemukan.' };
      }
      if (cv.isRedeemed) {
        return { success: false, isDuplicate: false, error: 'Voucher ini sudah pernah digunakan sebelumnya.' };
      }
      if (new Date(cv.expiresAt).getTime() < Date.now()) {
        return { success: false, isDuplicate: false, error: 'Voucher telah kedaluwarsa.' };
      }
      const vMaster = cv.voucher || this.vouchers.get(cv.voucherId);
      if (vMaster) {
        if (subtotal < vMaster.min_spend) {
          return {
            success: false,
            isDuplicate: false,
            error: `Subtotal Rp ${subtotal.toLocaleString('id-ID')} belum mencapai batas minimum belanja Rp ${vMaster.min_spend.toLocaleString('id-ID')}.`
          };
        }
        if (vMaster.discount_type === 'nominal') {
          discountAmount = vMaster.discount_value;
        } else if (vMaster.discount_type === 'percent') {
          const rawDiscount = Math.floor((subtotal * vMaster.discount_value) / 100);
          discountAmount = vMaster.max_discount ? Math.min(vMaster.max_discount, rawDiscount) : rawDiscount;
        } else {
          discountAmount = vMaster.discount_value;
        }
        discountAmount = Math.min(subtotal, discountAmount);
        appliedVoucherId = vMaster.id;
      }
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);

    // 4. Points Calculation (1 point per Rp 10.000)
    const pointsEarned = customerId ? Math.floor(finalAmount / 10000) : 0;

    // 5. Decrement Stock
    for (const item of items) {
      if (item.productId && this.inventory.has(item.productId)) {
        const inv = this.inventory.get(item.productId)!;
        if (inv.trackStock) {
          inv.currentStock = Math.max(0, inv.currentStock - item.quantity);
        }
      }
    }

    // 6. Mark Voucher Redeemed
    if (customerVoucherId) {
      const cv = this.customerVouchers.get(customerVoucherId);
      if (cv) {
        cv.isRedeemed = true;
        cv.redeemedAt = new Date().toISOString();
      }
      if (appliedVoucherId && this.vouchers.has(appliedVoucherId)) {
        const vm = this.vouchers.get(appliedVoucherId)!;
        vm.redeemed_count += 1;
      }
    }

    // 7. Update Customer Points & Tier
    let newTier: TierLevel = 'Tamu';
    let customerRecord: Profile | undefined;

    if (customerId && this.customers.has(customerId)) {
      customerRecord = this.customers.get(customerId)!;
      customerRecord.points_balance = (customerRecord.points_balance || 0) + pointsEarned;
      customerRecord.cumulative_points = (customerRecord.cumulative_points || 0) + pointsEarned;

      if (customerRecord.cumulative_points >= 300) {
        newTier = 'Keluarga';
      } else if (customerRecord.cumulative_points >= 100) {
        newTier = 'Sahabat';
      } else {
        newTier = 'Tamu';
      }
      customerRecord.tier = newTier;

      this.pointsLedger.push({
        id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        customerId,
        pointsChange: pointsEarned,
        balanceAfter: customerRecord.points_balance,
        reason: 'transaction',
        notes: `Poin dari transaksi pesanan`,
        createdAt: new Date().toISOString()
      });
    }

    // 8. Store Order
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const orderNumber = `BU-ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.orders.size + 1).padStart(4, '0')}`;

    const orderRecord: Order = {
      id: orderId,
      orderNumber,
      idempotencyKey,
      customerId,
      customerName: customerRecord?.name,
      customerPhone: customerRecord?.phone,
      customerTier: newTier,
      cashierId,
      cashierName: cashierId ? 'Kang Asep (Kasir Utama)' : undefined,
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
    try {
      saveSharedOrder(orderRecord);
    } catch {
      // safe fallback
    }

    this.auditLogs.push({
      id: `audit-${Date.now()}`,
      staffId: cashierId || undefined,
      staffName: cashierId ? 'Kang Asep' : 'Pelanggan Mandiri',
      action: 'CREATE_ORDER',
      targetEntity: 'orders',
      targetId: orderId,
      details: { orderNumber, finalAmount, pointsEarned },
      createdAt: new Date().toISOString()
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
      status: 'confirmed',
      message: 'Pesanan dan pembayaran berhasil diproses secara atomic.'
    };
  }

  // --- Transactions Query ---
  public getTransactions(options?: { customerId?: string; limit?: number; offset?: number }): Order[] {
    let all = Array.from(new Set(this.orders.values()));
    if (options?.customerId) {
      all = all.filter((o) => o.customerId === options.customerId);
    }
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    return all.slice(offset, offset + limit);
  }

  // --- RFM CRM Analytics ---
  public getRfmSegments(): { scores: RFMScore[]; summary: RFMSummary } {
    const rawCustomers = Array.from(new Set(this.customers.values())).filter((c) => c.role === 'customer');
    const rawOrders = Array.from(new Set(this.orders.values()));
    const scores = computeAllRfmScores(rawCustomers, rawOrders);
    const summary = generateRfmSummary(scores, rawOrders);
    return { scores, summary };
  }
}

// ----------------------------------------------------------------------------
// Global Singleton Instance across Hot-Reloads
// ----------------------------------------------------------------------------
const globalAny = globalThis as any;

if (!globalAny.__BUMI_UPI_STORE__) {
  globalAny.__BUMI_UPI_STORE__ = new MockStore();
}

export const mockStore: MockStore = globalAny.__BUMI_UPI_STORE__;

// Helper Repository Export Functions matching PROJECT.md interface contract
export const getMenuCatalog = () => mockStore.getMenuCatalog();
export const getMenuItem = (id: string | number) => mockStore.getMenuItem(id);
export const createOrderAtomic = (params: CreateOrderAtomicParams) => mockStore.createOrderAtomic(params);
export const getCustomerProfile = (phoneOrEmail: string) => mockStore.getCustomerProfile(phoneOrEmail);
export const sendOtp = (phone: string) => mockStore.sendOtp(phone);
export const verifyOtp = (phone: string, otpCode: string, name?: string, email?: string) => mockStore.verifyOtp(phone, otpCode, name, email);
export const getRfmSegments = () => mockStore.getRfmSegments();
export const getTransactions = (options?: { customerId?: string; limit?: number; offset?: number }) => mockStore.getTransactions(options);
export const updateStock = (itemId: string | number, quantityDelta: number) => mockStore.updateStock(itemId, quantityDelta);
