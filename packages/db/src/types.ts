/**
 * BUMI UPI CRM & ORDERING MONOREPO
 * Data Layer TypeScript Interfaces & Domain Models
 * Location: packages/db/src/types.ts
 */

export type UserRole = 'customer' | 'kasir' | 'admin';

export type TierLevel = 'Tamu' | 'Sahabat' | 'Keluarga';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type OrderType = 'dine_in' | 'takeaway' | 'online_delivery';

export type PaymentMethod = 'qris' | 'cash' | 'transfer' | 'ewallet';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type RfmSegmentEnglish =
  | 'Champions'
  | 'Loyal'
  | 'Potensial Loyal'
  | 'Baru'
  | 'Berisiko'
  | 'Hampir Hilang'
  | 'Hilang';

export type RfmSegmentIndonesian =
  | 'Juara'
  | 'Setia'
  | 'Potensial'
  | 'Butuh Perhatian'
  | 'Hampir Lepas'
  | 'Berisiko'
  | 'Tertidur';

export type RfmSegment = RfmSegmentEnglish | RfmSegmentIndonesian;

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  is_phone_verified: boolean;
  telegram_chat_id: number | null;
  telegram_username: string | null;
  tier: TierLevel;
  points_balance: number;
  cumulative_points: number;
  qr_code: string;
  birth_date: string;
  menu_preferences: string[];
  opt_in_promo: boolean;
  created_at: string;
  updated_at?: string;
  avatar_url?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string;
  sortOrder: number;
  isActive: boolean;
  expectedCount?: number;
}

export type MenuCategory = Category;

export interface ProductVariant {
  id: string;
  productId: string;
  variantType: 'size' | 'temperature' | 'style';
  name: string;
  sku?: string;
  priceAdjustment: number;
  isAvailable: boolean;
  sortOrder?: number;
}

export interface MenuItemVariants {
  sizeM?: number;
  sizeL?: number;
  priceDelta?: number;
}

export interface MenuItem {
  id: number | string;
  uuid?: string;
  category_id?: string;
  category: string;
  categoryName?: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  basePrice?: number;
  variants?: MenuItemVariants;
  temps?: ('panas' | 'dingin')[];
  tags: string[];
  isAvailable?: boolean;
  isFeatured?: boolean;
  imageUrl?: string;
}

export type Product = MenuItem;

export interface InventoryItem {
  id: string;
  productId: string | number;
  variantId?: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  trackStock: boolean;
  lastRestockedAt?: string;
  updatedAt: string;
}

export interface OrderItem {
  productId?: string | number;
  variantId?: string;
  itemName: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  idempotencyKey: string;
  customerId?: string | null;
  customerName?: string;
  customerPhone?: string;
  customerTier?: TierLevel;
  cashierId?: string | null;
  cashierName?: string;
  orderType: OrderType;
  tableNumber?: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  pointsEarned: number;
  voucherId?: string | null;
  voucherTitle?: string;
  customerVoucherId?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type Transaction = Order;

export interface Payment {
  id: string;
  orderId: string;
  invoiceNumber: string;
  paymentGateway: string;
  transactionRef?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'successful' | 'failed' | 'expired';
  rawResponse?: Record<string, any>;
  paidAt: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'nominal' | 'percent' | 'free_item';
  discount_value: number;
  min_spend: number;
  max_discount?: number;
  quota: number;
  claimed_count: number;
  redeemed_count: number;
  valid_from: string;
  valid_until: string;
  target_tier?: TierLevel;
  target_rfm_segment?: RfmSegment;
  is_active: boolean;
}

export interface CustomerVoucher {
  id: string;
  customerId: string;
  voucherId: string;
  uniqueCode: string;
  qrCode: string;
  isRedeemed: boolean;
  redeemedAt?: string;
  orderId?: string;
  expiresAt: string;
  createdAt: string;
  voucher?: Voucher;
}

export interface PointsLedgerItem {
  id: string;
  customerId: string;
  orderId?: string;
  transactionId?: string;
  pointsChange: number;
  reason:
    | 'transaction'
    | 'welcome_bonus'
    | 'birthday'
    | 'voucher_redemption'
    | 'manual_adjustment'
    | 'tier_bonus';
  balanceAfter: number;
  notes?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  customerId?: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  seatingArea: string;
  status: 'menunggu' | 'dikonfirmasi' | 'selesai' | 'batal';
  specialNotes?: string;
  staffNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  staffId?: string;
  staffName: string;
  action: string;
  targetEntity: string;
  targetId?: string;
  details: Record<string, any> | string;
  ipAddress?: string;
  createdAt: string;
}

export interface RFMScore {
  customer_id: string;
  customer_name: string;
  phone: string;
  tier: TierLevel;
  recency_days: number;
  frequency_count: number;
  monetary_total: number;
  r_score: number;
  f_score: number;
  m_score: number;
  rfm_segment: RfmSegment;
  clv_estimate: number;
  last_visit: string;
}

export interface RFMSummary {
  totalCustomers: number;
  totalTransactions: number;
  totalRevenue: number;
  averageAOV: number;
  segments: Record<
    string,
    {
      name: string;
      labelSunda: string;
      count: number;
      percentage: number;
      monetaryTotal: number;
      avgMonetary: number;
      avgFrequency: number;
      avgRecency: number;
      clvTotal: number;
    }
  >;
}

export interface CreateOrderAtomicParams {
  idempotencyKey: string;
  customerId?: string | null;
  cashierId?: string | null;
  orderType?: OrderType;
  tableNumber?: string;
  items: OrderItem[];
  customerVoucherId?: string | null;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface CreateOrderAtomicResult {
  success: boolean;
  isDuplicate: boolean;
  orderId?: string;
  orderNumber?: string;
  subtotal?: number;
  discountAmount?: number;
  finalAmount?: number;
  pointsEarned?: number;
  newTier?: TierLevel;
  status?: OrderStatus;
  message?: string;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  message?: string;
  error?: string;
  user?: Profile;
}

export interface SendOtpResult {
  success: boolean;
  phone: string;
  demoOtp: string;
  banner: string;
  expiresAt: number;
}
