export type MembershipTier = 'Tamu' | 'Sahabat' | 'Keluarga';

export interface MenuCategory {
  code: string;
  name: string;
  expectedCount: number;
  parent: string;
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description?: string;
  tags?: string[];
  variants?: {
    sizeM: number;
    sizeL: number;
  };
  temps?: Array<'dingin' | 'panas'>;
  imageUrl?: string;
}

export interface CartCustomization {
  size?: 'M' | 'L';
  temp?: 'panas' | 'dingin';
  notes?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  customization: CartCustomization;
}

export type OrderType = 'dine_in' | 'takeaway';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  productId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  size?: 'M' | 'L';
  temp?: 'panas' | 'dingin';
  notes?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  idempotencyKey: string;
  customerId?: string | null;
  cashierId?: string | null;
  orderType: OrderType;
  tableNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  pointsEarned: number;
  voucherId?: string | null;
  customerVoucherId?: string | null;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid';
  items: OrderItem[];
  notes?: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'nominal' | 'percent';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  expiresAt: string;
  isRedeemed?: boolean;
  badge?: string;
  isFromHoki?: boolean;
  freeItemId?: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: MembershipTier;
  pointsBalance: number;
  cumulativePoints: number;
  memberId: string;
  qrValue: string;
  birthDate?: string;
  favoritePreferences?: string;
}
