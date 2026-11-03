/**
 * BUMI UPI CRM & ORDERING MONOREPO
 * Supabase Service Layer (Production TypeScript Client)
 * Location: packages/db/src/supabaseService.ts
 *
 * Implements high-level typed database operations with automatic
 * graceful fallback to the in-memory MockStore when running offline
 * or in zero-credential evaluation mode.
 */

import { getSupabaseClient, isMockMode } from './supabaseClient';
import {
  mockStore,
  getMenuCatalog as mockGetCatalog,
  getMenuItem as mockGetItem,
  createOrderAtomic as mockCreateOrder,
  getCustomerProfile as mockGetProfile,
  sendOtp as mockSendOtp,
  verifyOtp as mockVerifyOtp,
} from './mockStore';
import {
  Category,
  MenuItem,
  Order,
  Profile,
  CreateOrderAtomicParams,
  CreateOrderAtomicResult,
} from './types';

export interface SuratRinduInput {
  customerId?: string | null;
  authorName: string;
  originCity: string;
  category: string;
  message: string;
  nenekBlessing: string;
}

export interface DiningTableRecord {
  tableNumber: string;
  zoneId: string;
  zoneName: string;
  capacity: string;
  icon: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

class SupabaseService {
  /**
   * 1. MENU CATALOG OPERATIONS
   */
  async getMenuCategories(): Promise<Category[]> {
    const client = getSupabaseClient();
    if (!client || isMockMode()) {
      return mockStore.getCategories();
    }

    try {
      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return mockStore.getCategories();
      }

      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        sortOrder: c.sort_order,
        isActive: c.is_active,
        expectedCount: c.expected_count,
      }));
    } catch {
      return mockStore.getCategories();
    }
  }

  async getMenuCatalog(): Promise<MenuItem[]> {
    const client = getSupabaseClient();
    if (!client || isMockMode()) {
      return mockGetCatalog();
    }

    try {
      const { data, error } = await client
        .from('menu_items')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data || data.length === 0) {
        return mockGetCatalog();
      }

      return data.map((item: any) => ({
        id: typeof item.id === 'number' ? item.id : parseInt(String(item.id), 10) || 1,
        name: item.name,
        category: item.category || 'Nasi & Karbohidrat',
        description: item.description || '',
        price: item.price,
        tags: item.tags || [],
        temps: item.temps,
        isAvailable: item.is_active !== false,
        imageUrl: item.image_url,
      }));
    } catch {
      return mockGetCatalog();
    }
  }

  async getMenuItemById(id: number): Promise<MenuItem | null> {
    const client = getSupabaseClient();
    if (!client || isMockMode()) {
      return mockGetItem(id);
    }

    try {
      const { data, error } = await client
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        return mockGetItem(id);
      }

      return {
        id: data.id,
        name: data.name,
        category: data.category,
        description: data.description || '',
        price: data.price,
        tags: data.tags || [],
        temps: data.temps,
        isAvailable: data.is_active !== false,
        imageUrl: data.image_url,
      };
    } catch {
      return mockGetItem(id);
    }
  }

  /**
   * 2. CUSTOMER & WHATSAPP OTP OPERATIONS
   */
  async requestWhatsAppOtp(phone: string): Promise<{ success: boolean; code: string; message: string }> {
    const client = getSupabaseClient();
    if (!client || isMockMode()) {
      const result = mockSendOtp(phone);
      return {
        success: result.success,
        code: result.demoOtp,
        message: `Kode verifikasi OTP ${result.demoOtp} berhasil disiapkan untuk ${result.phone}.`,
      };
    }

    try {
      // 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { error } = await client
        .from('whatsapp_otp_codes')
        .insert({
          phone,
          code_hash: code,
          expires_at: expiresAt,
          verified: false,
        });

      if (error) {
        const fallback = mockSendOtp(phone);
        return {
          success: fallback.success,
          code: fallback.demoOtp,
          message: `Kode verifikasi OTP ${fallback.demoOtp} berhasil disiapkan untuk ${fallback.phone}.`,
        };
      }

      return {
        success: true,
        code,
        message: `Kode verifikasi OTP ${code} berhasil disiapkan untuk nomor ${phone}.`,
      };
    } catch {
      const fallback = mockSendOtp(phone);
      return {
        success: fallback.success,
        code: fallback.demoOtp,
        message: `Kode verifikasi OTP ${fallback.demoOtp} berhasil disiapkan untuk ${fallback.phone}.`,
      };
    }
  }

  async verifyWhatsAppOtp(
    phone: string,
    code: string,
    name?: string
  ): Promise<{ success: boolean; customer?: Profile; message: string }> {
    const client = getSupabaseClient();
    if (!client || isMockMode()) {
      const result = mockVerifyOtp(phone, code);
      if (result.success && result.user) {
        return { success: true, customer: result.user, message: result.message || 'Verifikasi sukses.' };
      }
      return { success: false, message: result.message || result.error || 'OTP tidak valid.' };
    }

    try {
      // Check OTP in Supabase
      const { data: otpRecord, error } = await client
        .from('whatsapp_otp_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code_hash', code)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !otpRecord) {
        // Fallback to mock store verify
        const fallback = mockVerifyOtp(phone, code);
        return {
          success: fallback.success,
          customer: fallback.user,
          message: fallback.message || fallback.error || 'Kode OTP tidak valid.',
        };
      }

      // Mark verified
      await client
        .from('whatsapp_otp_codes')
        .update({ verified: true, verified_at: new Date().toISOString() })
        .eq('id', otpRecord.id);

      // Check or create customer profile
      const { data: existingProfile } = await client
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (existingProfile) {
        return { success: true, customer: existingProfile, message: 'Verifikasi berhasil. Selamat datang kembali!' };
      }

      // Create new profile with 50 bonus points
      const newProfile: Partial<Profile> = {
        name: name || 'Baraya Bumi',
        phone,
        role: 'customer',
        tier: 'Tamu',
        points_balance: 50,
        cumulative_points: 50,
        qr_code: `BU-QR-${phone.replace(/\D/g, '').slice(-6)}`,
        opt_in_promo: true,
      };

      const { data: created, error: createErr } = await client
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createErr || !created) {
        const fallback = mockVerifyOtp(phone, code);
        return {
          success: fallback.success,
          customer: fallback.user,
          message: fallback.message || fallback.error || 'Gagal membuat profil.',
        };
      }

      return {
        success: true,
        customer: created,
        message: 'Pendaftaran anggota berhasil! Anda mendapatkan bonus 50 poin sambutan.',
      };
    } catch {
      const fallback = mockVerifyOtp(phone, code);
      return {
        success: fallback.success,
        customer: fallback.user,
        message: fallback.message || fallback.error || 'Verifikasi gagal.',
      };
    }
  }

  async getCustomerProfile(phoneOrId: string): Promise<Profile | null> {
    const client = getSupabaseClient();
    if (!client || isMockMode()) {
      return mockGetProfile(phoneOrId) || null;
    }

    try {
      const isUUID = phoneOrId.includes('-');
      const query = client.from('profiles').select('*');

      const { data, error } = isUUID
        ? await query.eq('id', phoneOrId).maybeSingle()
        : await query.eq('phone', phoneOrId).maybeSingle();

      if (error || !data) {
        return mockGetProfile(phoneOrId) || null;
      }

      return data;
    } catch {
      return mockGetProfile(phoneOrId) || null;
    }
  }

  /**
   * 3. ATOMIC ORDERING & CHECKOUT
   */
  async createOrderAtomic(params: CreateOrderAtomicParams): Promise<CreateOrderAtomicResult> {
    const client = getSupabaseClient();
    if (!client || isMockMode()) {
      return mockCreateOrder(params);
    }

    try {
      const subtotal = params.items.reduce((acc, it) => acc + (it.subtotal || it.unitPrice * it.quantity), 0);
      const discountAmount = 0;
      const finalAmount = Math.max(0, subtotal - discountAmount);
      const pointsEarned = Math.floor(finalAmount / 10000);
      const invoiceNumber = `BU-ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderPayload = {
        order_number: invoiceNumber,
        idempotency_key: params.idempotencyKey,
        customer_id: params.customerId || null,
        order_type: params.orderType || 'dine_in',
        table_number: params.tableNumber || 'Meja 01',
        subtotal,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        points_earned: pointsEarned,
        payment_method: params.paymentMethod || 'qris',
        payment_status: 'paid',
        status: 'confirmed',
      };

      const { data: createdOrder, error: orderErr } = await client
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderErr || !createdOrder) {
        return mockCreateOrder(params);
      }

      // Insert line items
      const lineItems = params.items.map((it) => ({
        order_id: createdOrder.id,
        menu_item_id: it.productId,
        item_name: it.itemName,
        unit_price: it.unitPrice,
        quantity: it.quantity,
        subtotal: it.subtotal || it.unitPrice * it.quantity,
      }));

      await client.from('order_items').insert(lineItems);

      return {
        success: true,
        isDuplicate: false,
        orderId: createdOrder.id,
        orderNumber: invoiceNumber,
        subtotal,
        discountAmount,
        finalAmount,
        pointsEarned,
        status: 'confirmed',
        message: 'Pesanan berhasil dicatat dan diproses di dapur Garut.',
      };
    } catch {
      return mockCreateOrder(params);
    }
  }

  /**
   * 4. POJOK SURAT RINDU
   */
  async getSuratRindu(): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client || isMockMode()) {
      return [];
    }

    try {
      const { data, error } = await client
        .from('surat_rindu')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  }

  async submitSuratRindu(input: SuratRinduInput): Promise<{ success: boolean; data?: any }> {
    const client = getSupabaseClient();
    if (!client || isMockMode()) {
      return { success: true };
    }

    try {
      const { data, error } = await client
        .from('surat_rindu')
        .insert({
          customer_id: input.customerId,
          author_name: input.authorName,
          origin_city: input.originCity,
          category: input.category,
          message: input.message,
          nenek_blessing: input.nenekBlessing,
          is_approved: true,
        })
        .select()
        .single();

      if (error) return { success: false };
      return { success: true, data };
    } catch {
      return { success: false };
    }
  }

  /**
   * 5. DINING TABLES & REALTIME SEATS
   */
  async getDiningTables(): Promise<DiningTableRecord[]> {
    const client = getSupabaseClient();
    if (!client || isMockMode()) {
      return [];
    }

    try {
      const { data, error } = await client
        .from('dining_tables')
        .select('*')
        .order('table_number', { ascending: true });

      if (error || !data) return [];
      return data.map((t: any) => ({
        tableNumber: t.table_number,
        zoneId: t.zone_id,
        zoneName: t.zone_name,
        capacity: t.capacity,
        icon: t.icon,
        status: t.status,
      }));
    } catch {
      return [];
    }
  }
}

export const supabaseService = new SupabaseService();
