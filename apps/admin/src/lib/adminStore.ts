/**
 * Central State Store and Domain Logic for Admin & Kasir POS
 * Provides atomic ordering, KDS lifecycle, inventory stock tracking, and audit logging.
 */

import { CATALOG_105_ITEMS, MenuItem } from './catalogData';
import { INITIAL_CUSTOMERS, CustomerProfile, CustomerTier } from './crmData';
import { formatTelegramReceipt, formatKitchenNotification, TelegramReceiptPayload } from './telegramHelper';

export type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  id?: string;
  productId: number;
  itemName: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface VoucherItem {
  id: string;
  code: string;
  title: string;
  discountType: 'nominal' | 'percent';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  expiresAt: string;
  isRedeemed?: boolean;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  idempotencyKey: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerTier: CustomerTier;
  cashierId: string;
  cashierName: string;
  orderType: 'dine_in' | 'takeaway';
  tableNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  pointsEarned: number;
  voucherId?: string;
  voucherCode?: string;
  paymentMethod: 'cash' | 'qris' | 'debit';
  paymentStatus: 'paid' | 'pending';
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  createdAtWib: string;
  receiptTelegram?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: 'CREATE_ORDER' | 'UPDATE_ORDER_STATUS' | 'UPDATE_STOCK' | 'AUTH_LOGIN' | 'REDEEM_VOUCHER';
  targetId: string;
  staffId: string;
  staffName: string;
  details: string;
}

const DEFAULT_VOUCHERS: VoucherItem[] = [
  {
    id: 'cv-wel-01',
    code: 'SUNDAWELCOME',
    title: 'Diskon Sambutan Wilujeng Sumping (Rp 15.000)',
    discountType: 'nominal',
    discountValue: 15000,
    minSpend: 50000,
    expiresAt: '2026-12-31T23:59:59Z',
    isRedeemed: false
  },
  {
    id: 'cv-disc-20',
    code: 'KANGENUPI20',
    title: 'Diskon Kangen Masakan Nenek 20% (Maks. Rp 30.000)',
    discountType: 'percent',
    discountValue: 20,
    minSpend: 50000,
    maxDiscount: 30000,
    expiresAt: '2026-12-31T23:59:59Z',
    isRedeemed: false
  },
  {
    id: 'cv-bday-30',
    code: 'MILANGKALA30',
    title: 'Voucher Ulang Tahun Sahabat (Rp 30.000)',
    discountType: 'nominal',
    discountValue: 30000,
    minSpend: 80000,
    expiresAt: '2026-12-31T23:59:59Z',
    isRedeemed: false
  }
];

// Pre-seeded active kitchen orders for live demonstration
const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ord-init-001',
    orderNumber: 'BU-ORD-20261101-0001',
    idempotencyKey: 'IDEMP-INIT-001',
    customerId: 'usr-cust-demo',
    customerName: 'Dimas Kurniawan',
    customerPhone: '081234567890',
    customerTier: 'Sahabat',
    cashierId: 'usr-kasir-01',
    cashierName: 'Kang Asep (Kasir Utama)',
    orderType: 'dine_in',
    tableNumber: 'Meja 04',
    status: 'preparing',
    subtotal: 70000,
    discountAmount: 15000,
    finalAmount: 55000,
    pointsEarned: 5,
    voucherId: 'cv-wel-01',
    voucherCode: 'SUNDAWELCOME',
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    items: [
      { productId: 31, itemName: 'Nasi Goreng Cumi Upi', variantName: 'Pedas Level 2', unitPrice: 28000, quantity: 1, subtotal: 28000, notes: 'Jangan terlalu pedas' },
      { productId: 74, itemName: 'Kopi Hitam', variantName: 'Large / Panas', unitPrice: 22000, quantity: 1, subtotal: 22000, notes: 'Gula sedikit saja' },
      { productId: 7, itemName: 'Pisang Goreng', unitPrice: 20000, quantity: 1, subtotal: 20000, notes: 'Panas-panas baru angkat' }
    ],
    notes: 'Pelanggan VIP Sahabat',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    createdAtWib: '01 Nov 2026, 08:26:00 WIB'
  },
  {
    id: 'ord-init-002',
    orderNumber: 'BU-ORD-20261101-0002',
    idempotencyKey: 'IDEMP-INIT-002',
    customerId: 'usr-cust-002',
    customerName: 'Asep Permana',
    customerPhone: '081298765432',
    customerTier: 'Keluarga',
    cashierId: 'usr-kasir-01',
    cashierName: 'Kang Asep (Kasir Utama)',
    orderType: 'dine_in',
    tableNumber: 'Bale Utama 01',
    status: 'confirmed',
    subtotal: 125000,
    discountAmount: 0,
    finalAmount: 125000,
    pointsEarned: 12,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    items: [
      { productId: 36, itemName: 'Nasi Galo Bumi Upi', unitPrice: 39000, quantity: 2, subtotal: 78000 },
      { productId: 64, itemName: 'Teh Lemon', variantName: 'Large / Dingin', unitPrice: 25000, quantity: 1, subtotal: 25000 },
      { productId: 11, itemName: 'Ketan Kinca', unitPrice: 24500, quantity: 1, subtotal: 24500 }
    ],
    notes: 'Keluarga besar berkunjung',
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    createdAtWib: '01 Nov 2026, 08:34:00 WIB'
  },
  {
    id: 'ord-init-003',
    orderNumber: 'BU-ORD-20261101-0003',
    idempotencyKey: 'IDEMP-INIT-003',
    customerName: 'Tamu Meja 08',
    customerTier: 'Tamu',
    cashierId: 'usr-kasir-01',
    cashierName: 'Kang Asep (Kasir Utama)',
    orderType: 'dine_in',
    tableNumber: 'Meja 08',
    status: 'ready',
    subtotal: 44000,
    discountAmount: 0,
    finalAmount: 44000,
    pointsEarned: 4,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    items: [
      { productId: 23, itemName: 'Mie Kasep', unitPrice: 24000, quantity: 1, subtotal: 24000 },
      { productId: 50, itemName: 'Es Limun', unitPrice: 20000, quantity: 1, subtotal: 20000 }
    ],
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    createdAtWib: '01 Nov 2026, 08:16:00 WIB'
  }
];

const INITIAL_LOGS: AuditLogItem[] = [
  {
    id: 'log-001',
    timestamp: '01 Nov 2026, 07:00:00 WIB',
    action: 'AUTH_LOGIN',
    targetId: 'usr-admin-01',
    staffId: 'usr-admin-01',
    staffName: 'Teh Upi (Owner)',
    details: 'Login berhasil sebagai Administrator Owner Bumi Upi'
  },
  {
    id: 'log-002',
    timestamp: '01 Nov 2026, 07:15:00 WIB',
    action: 'AUTH_LOGIN',
    targetId: 'usr-kasir-01',
    staffId: 'usr-kasir-01',
    staffName: 'Kang Asep (Kasir)',
    details: 'Buka sesi kasir pagi POS Meja Kasir 1'
  },
  {
    id: 'log-003',
    timestamp: '01 Nov 2026, 08:26:00 WIB',
    action: 'CREATE_ORDER',
    targetId: 'ord-init-001',
    staffId: 'usr-kasir-01',
    staffName: 'Kang Asep (Kasir)',
    details: 'Pesanan BU-ORD-20261101-0001 (Meja 04) total Rp 55.000 QRIS'
  },
  {
    id: 'log-004',
    timestamp: '01 Nov 2026, 08:34:00 WIB',
    action: 'CREATE_ORDER',
    targetId: 'ord-init-002',
    staffId: 'usr-kasir-01',
    staffName: 'Kang Asep (Kasir)',
    details: 'Pesanan BU-ORD-20261101-0002 (Bale Utama 01) total Rp 125.000 Tunai'
  }
];

// Helper to access and persist store in browser
const STORAGE_KEYS = {
  ORDERS: 'bumi_upi_admin_orders',
  ITEMS: 'bumi_upi_admin_catalog',
  CUSTOMERS: 'bumi_upi_admin_customers',
  LOGS: 'bumi_upi_admin_logs',
  VOUCHERS: 'bumi_upi_admin_vouchers'
};

export class AdminStore {
  private static instance: AdminStore;

  orders: OrderRecord[] = [...INITIAL_ORDERS];
  items: MenuItem[] = [...CATALOG_105_ITEMS];
  customers: CustomerProfile[] = [...INITIAL_CUSTOMERS];
  logs: AuditLogItem[] = [...INITIAL_LOGS];
  vouchers: VoucherItem[] = [...DEFAULT_VOUCHERS];

  constructor() {
    this.loadFromStorage();
  }

  static getInstance(): AdminStore {
    if (!AdminStore.instance) {
      AdminStore.instance = new AdminStore();
    }
    return AdminStore.instance;
  }

  // Merge live orders placed by customers from web portal or Supabase
  mergeLiveOrders(incomingOrders: any[]): void {
    if (!Array.isArray(incomingOrders) || incomingOrders.length === 0) return;
    const existingMap = new Map(this.orders.map((o) => [o.id, o]));
    let hasChanges = false;

    for (const inc of incomingOrders) {
      if (!existingMap.has(inc.id)) {
        const record: OrderRecord = {
          id: inc.id,
          orderNumber: inc.orderNumber || `BU-ORD-${inc.id.slice(-6)}`,
          idempotencyKey: inc.idempotencyKey || inc.id,
          customerId: inc.customerId || undefined,
          customerName: inc.customerName || (inc.customerId ? 'Pelanggan Member' : 'Tamu Mandiri (Web)'),
          customerPhone: inc.customerPhone || undefined,
          customerTier: inc.customerTier || 'Tamu',
          cashierId: inc.cashierId || 'web-self-service',
          cashierName: inc.cashierName || 'Pemesanan Web Mandiri',
          orderType: inc.orderType || 'dine_in',
          tableNumber: inc.tableNumber || 'Meja 01',
          status: inc.status || 'confirmed',
          subtotal: inc.subtotal || 0,
          discountAmount: inc.discountAmount || 0,
          finalAmount: inc.finalAmount || 0,
          pointsEarned: inc.pointsEarned || 0,
          voucherId: inc.voucherId || undefined,
          voucherCode: inc.voucherCode || undefined,
          paymentMethod: inc.paymentMethod || 'qris',
          paymentStatus: inc.paymentStatus || 'paid',
          items: (inc.items || []).map((it: any) => ({
            productId: it.productId || it.id || 1,
            itemName: it.itemName || it.name || 'Menu Bumi Upi',
            variantName: it.variantName || (it.size || it.temp ? `${it.size || ''} ${it.temp || ''}`.trim() : undefined),
            unitPrice: it.unitPrice || it.price || 0,
            quantity: it.quantity || 1,
            subtotal: it.subtotal || ((it.unitPrice || it.price || 0) * (it.quantity || 1)),
            notes: it.notes || undefined,
          })),
          notes: inc.notes || 'Pemesanan via Web Mandiri',
          createdAt: inc.createdAt || new Date().toISOString(),
          createdAtWib: inc.createdAtWib || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'
        };
        this.orders.unshift(record);
        hasChanges = true;
      } else {
        const existing = existingMap.get(inc.id)!;
        if (inc.status && inc.status !== existing.status) {
          existing.status = inc.status;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      this.saveToStorage();
    }
  }

  // Fetch live orders asynchronously from API to sync with web portal
  async syncLiveOrdersFromApi(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/pos/transaction');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        this.mergeLiveOrders(data.orders);
      }
    } catch {
      // ignore
    }
  }

  loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (storedOrders) this.orders = JSON.parse(storedOrders);

      const storedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (storedItems) this.items = JSON.parse(storedItems);

      const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (storedCustomers) this.customers = JSON.parse(storedCustomers);

      const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (storedLogs) this.logs = JSON.parse(storedLogs);

      const storedVouchers = localStorage.getItem(STORAGE_KEYS.VOUCHERS);
      if (storedVouchers) this.vouchers = JSON.parse(storedVouchers);
    } catch (e) {
      console.warn('Failed to load store from localStorage', e);
    }
  }

  saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(this.items));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(this.customers));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs));
      localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(this.vouchers));
    } catch (e) {
      console.warn('Failed to save store to localStorage', e);
    }
  }

  // Find customer by QR code, phone number, or name substring
  findCustomer(query: string): CustomerProfile | undefined {
    const q = query.trim().toLowerCase();
    if (!q) return undefined;
    return this.customers.find((c) =>
      c.qrCode.toLowerCase() === q ||
      c.phone.includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase() === q
    );
  }

  // Atomic order creation from cashier terminal
  createOrderAtomic({
    idempotencyKey,
    customerId,
    customerName,
    cashierId = 'usr-kasir-01',
    cashierName = 'Kang Asep (Kasir Utama)',
    orderType = 'dine_in',
    tableNumber = 'Meja 01',
    items,
    voucherId,
    paymentMethod = 'qris',
    notes = ''
  }: {
    idempotencyKey: string;
    customerId?: string;
    customerName?: string;
    cashierId?: string;
    cashierName?: string;
    orderType: 'dine_in' | 'takeaway';
    tableNumber: string;
    items: OrderItem[];
    voucherId?: string;
    paymentMethod: 'cash' | 'qris' | 'debit';
    notes?: string;
  }): { success: boolean; order?: OrderRecord; error?: string } {
    if (!idempotencyKey) {
      return { success: false, error: 'idempotency_key is required' };
    }

    // 1. Check idempotency
    const existing = this.orders.find((o) => o.idempotencyKey === idempotencyKey);
    if (existing) {
      return { success: true, order: existing };
    }

    // 2. Validate items
    if (!items || items.length === 0) {
      return { success: false, error: 'Order must contain at least 1 item' };
    }

    let subtotal = 0;
    for (const item of items) {
      if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return { success: false, error: `Invalid quantity for ${item.itemName}` };
      }
      if (item.unitPrice < 0) {
        return { success: false, error: `Invalid unit price for ${item.itemName}` };
      }
      subtotal += item.unitPrice * item.quantity;

      // Check stock
      const catalogItem = this.items.find((i) => i.id === item.productId);
      if (catalogItem && catalogItem.stock !== undefined && catalogItem.stock < item.quantity) {
        return { success: false, error: `Stok tidak mencukupi untuk ${item.itemName} (Tersisa: ${catalogItem.stock})` };
      }
    }

    // 3. Voucher calculation
    let discountAmount = 0;
    let appliedVoucher: VoucherItem | undefined;

    if (voucherId) {
      appliedVoucher = this.vouchers.find((v) => v.id === voucherId || v.code.toUpperCase() === voucherId.toUpperCase());
      if (!appliedVoucher) {
        return { success: false, error: 'Voucher tidak ditemukan' };
      }
      if (appliedVoucher.isRedeemed) {
        return { success: false, error: 'Voucher sudah pernah digunakan' };
      }
      if (subtotal < appliedVoucher.minSpend) {
        return { success: false, error: `Subtotal Rp ${subtotal.toLocaleString('id-ID')} kurang dari minimal belanja Rp ${appliedVoucher.minSpend.toLocaleString('id-ID')}` };
      }

      if (appliedVoucher.discountType === 'nominal') {
        discountAmount = appliedVoucher.discountValue;
      } else if (appliedVoucher.discountType === 'percent') {
        const rawDisc = Math.floor((subtotal * appliedVoucher.discountValue) / 100);
        discountAmount = appliedVoucher.maxDiscount ? Math.min(appliedVoucher.maxDiscount, rawDisc) : rawDisc;
      }
      discountAmount = Math.min(subtotal, discountAmount);
      appliedVoucher.isRedeemed = true;
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);
    const pointsEarned = customerId ? Math.floor(finalAmount / 10000) : 0;

    // 4. Stock deduction
    for (const item of items) {
      const catalogItem = this.items.find((i) => i.id === item.productId);
      if (catalogItem && catalogItem.stock !== undefined) {
        catalogItem.stock = Math.max(0, catalogItem.stock - item.quantity);
        if (catalogItem.stock === 0) {
          catalogItem.isAvailable = false;
        }
      }
    }

    // 5. Update customer points and tier
    let resolvedCustomer: CustomerProfile | undefined;
    let newTier: CustomerTier = 'Tamu';
    let newPointsBalance = 0;

    if (customerId) {
      resolvedCustomer = this.customers.find((c) => c.id === customerId);
      if (resolvedCustomer) {
        resolvedCustomer.pointsBalance += pointsEarned;
        resolvedCustomer.cumulativePoints += pointsEarned;
        resolvedCustomer.frequencyCount += 1;
        resolvedCustomer.monetaryTotal += finalAmount;
        resolvedCustomer.recencyDays = 0;

        if (resolvedCustomer.cumulativePoints >= 300) {
          newTier = 'Keluarga';
        } else if (resolvedCustomer.cumulativePoints >= 100) {
          newTier = 'Sahabat';
        } else {
          newTier = 'Tamu';
        }
        resolvedCustomer.tier = newTier;
        newPointsBalance = resolvedCustomer.pointsBalance;
      }
    }

    // 6. Generate IDs and dates
    const dateNow = new Date();
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const ymd = dateNow.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(this.orders.length + 1).padStart(4, '0');
    const orderNumber = `BU-ORD-${ymd}-${seq}`;

    const timeWib = `${dateNow.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][dateNow.getMonth()]} 2026, ${String(dateNow.getHours()).padStart(2, '0')}:${String(dateNow.getMinutes()).padStart(2, '0')}:${String(dateNow.getSeconds()).padStart(2, '0')} WIB`;

    // 7. Format Telegram message
    const receiptTelegram = formatTelegramReceipt({
      orderNumber,
      customerName: resolvedCustomer ? resolvedCustomer.name : customerName || 'Tamu Terhormat',
      customerTier: resolvedCustomer ? resolvedCustomer.tier : 'Tamu',
      tableNumber,
      items,
      subtotal,
      discountAmount,
      finalAmount,
      pointsEarned,
      newPointsBalance,
      paymentMethod,
      cashierName,
      timeWib
    });

    const newOrder: OrderRecord = {
      id: orderId,
      orderNumber,
      idempotencyKey,
      customerId,
      customerName: resolvedCustomer ? resolvedCustomer.name : customerName || 'Tamu Terhormat',
      customerPhone: resolvedCustomer?.phone,
      customerTier: resolvedCustomer ? resolvedCustomer.tier : 'Tamu',
      cashierId,
      cashierName,
      orderType,
      tableNumber,
      status: 'confirmed',
      subtotal,
      discountAmount,
      finalAmount,
      pointsEarned,
      voucherId: appliedVoucher?.id,
      voucherCode: appliedVoucher?.code,
      paymentMethod,
      paymentStatus: 'paid',
      items,
      notes,
      createdAt: dateNow.toISOString(),
      createdAtWib: timeWib,
      receiptTelegram
    };

    this.orders.unshift(newOrder);

    // 8. Audit log
    this.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: timeWib,
      action: 'CREATE_ORDER',
      targetId: orderId,
      staffId: cashierId,
      staffName: cashierName,
      details: `Transaksi ${orderNumber} (${tableNumber}) total Rp ${finalAmount.toLocaleString('id-ID')} [${paymentMethod.toUpperCase()}]`
    });

    this.saveToStorage();
    return { success: true, order: newOrder };
  }

  // Update order status in KDS (Masuk -> Dimasak -> Siap -> Selesai)
  updateOrderStatus(orderId: string, newStatus: OrderStatus, staffId: string = 'usr-chef-01', staffName: string = 'Mang Udin (Kepala Dapur)'): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return false;

    const oldStatus = order.status;
    order.status = newStatus;

    const now = new Date();
    const timeWib = `${now.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][now.getMonth()]} 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

    this.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: timeWib,
      action: 'UPDATE_ORDER_STATUS',
      targetId: orderId,
      staffId,
      staffName,
      details: `Tiket ${order.orderNumber} diubah status dari ${oldStatus} menjadi ${newStatus}`
    });

    this.saveToStorage();

    // Sinkronisasi status tiket ke shared live store agar terbaca pelanggan di portal Web
    if (typeof window !== 'undefined') {
      fetch('/api/pos/transaction', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      }).catch(() => {});
    }

    return true;
  }

  // Update menu inventory stock
  updateStock(itemId: number, newStock: number, staffId: string = 'usr-admin-01', staffName: string = 'Teh Upi (Owner)'): boolean {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return false;

    const oldStock = item.stock || 0;
    item.stock = Math.max(0, newStock);
    item.isAvailable = item.stock > 0;

    const now = new Date();
    const timeWib = `${now.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][now.getMonth()]} 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;

    this.logs.unshift({
      id: `log-${Date.now()}`,
      timestamp: timeWib,
      action: 'UPDATE_STOCK',
      targetId: `item-${itemId}`,
      staffId,
      staffName,
      details: `Pembaruan stok "${item.name}": ${oldStock} -> ${item.stock} unit`
    });

    this.saveToStorage();
    return true;
  }
}

export const adminStore = AdminStore.getInstance();
