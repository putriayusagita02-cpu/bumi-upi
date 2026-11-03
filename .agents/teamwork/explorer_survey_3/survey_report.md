# LAPORAN SURVEI ARSITEKTUR & SPESIFIKASI SISTEM
# BUMI UPI CRM & ORDERING MONOREPO
**Proyek:** Rumah Tamah Bumi Upi, Garut, Jawa Barat  
**Penyusun:** explorer_survey_3 (Teamwork Architecture Explorer)  
**Tanggal:** 1 November 2026  
**Status:** Disetujui untuk Eksekusi Langsung (Zero-Credential Immediate Run)

---

## 1. RINGKASAN EKSEKUTIF & ARSITEKTUR TINGKAT TINGGI

Sistem Bumi Upi adalah platform terintegrasi F&B and Hospitality yang menggabungkan:
1. **Customer Web Ordering App (`apps/web`)**: Pengalaman pelanggan ramah, modern, bernuansa rumah nenek tempo doeloe (Garut heritage), dilengkapi pemesanan meja/online, kartu member digital, voucher wallet, dan Upi Chat AI.
2. **Admin & Kasir CRM & POS Dashboard (`apps/admin`)**: Tablet POS kasir cepat untuk transaksi on-site, Operational CRM, Analytical CRM berbasis matriks RFM (Recency, Frequency, Monetary) & CLV (Customer Lifetime Value), manajemen inventaris, dan audit trail staf.
3. **Shared Packages (`packages/ui`, `packages/db`)**: Komponen desain terstandarisasi dengan token warna resmi (Olive `#3E4F30`, Krem `#F5EEDC`, Terakota `#B4532A`, Mustard `#D4A24C`) dan layer abstraksi data terpadu (Supabase Client + Local Mock Repository).
4. **Integrasi Telegram Bot (`@BumiUpiBot`)**: Notifikasi struk transaksi otomatis berformat WIB, pemesanan dapur seketika, verifikasi nomor HP nir-penipuan via native contact sharing, dan query loyalitas pelanggan.
5. **WhatsApp OTP Console Mode**: Verifikasi nomor handphone tanpa ketergantungan kredensial gateway eksternal, dilengkapi cetak konsol server dan helper toast UI untuk pengujian end-to-end instan.

```
                              ┌──────────────────────────────────────────┐
                              │      BUMI UPI PNPM MONOREPO WORKSPACE     │
                              └──────────────────────────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 │                                                                     │
     ┌───────────────────────┐                                             ┌───────────────────────┐
     │       apps/web        │                                             │      apps/admin       │
     │  (Customer Ordering,  │                                             │   (Kasir Tablet POS,  │
     │  PWA Member & Portal) │                                             │    CRM & Analytics)   │
     └───────────┬───────────┘                                             └───────────┬───────────┘
                 │                                                                     │
                 └───────────────────┐                       ┌─────────────────────────┘
                                     │                       │
                                     ▼                       ▼
                         ┌──────────────────────────────────────────┐
                         │               packages/ui                │
                         │   (Shared Tailwind, Heritage Tokens,     │
                         │    Radix UI Primitives, Lucide Icons)    │
                         └──────────────────────────────────────────┘
                                              │
                                              ▼
                         ┌──────────────────────────────────────────┐
                         │               packages/db                │
                         │   (Supabase Client, Schema Types,        │
                         │    Data Abstraction & Mock Engine)       │
                         └────────────────────┬─────────────────────┘
                                              │
                 ┌────────────────────────────┴────────────────────────────┐
                 │                                                         │
                 ▼                                                         ▼
     ┌───────────────────────┐                                 ┌───────────────────────┐
     │  Production Database  │                                 │   Local Fallback API  │
     │   Supabase Postgres   │  ◄── Automatic Failover / ────  │   (Zero-Credential,   │
     │  (Migrations & RLS)   │      Detection Logic            │   In-Memory Reactive) │
     └───────────────────────┘                                 └───────────────────────┘
                 │                                                         │
                 └────────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                                 ┌───────────────────────────┐
                                 │   External Integrations   │
                                 │  • Telegram Bot Engine    │
                                 │  • WhatsApp OTP Console   │
                                 │  • Upi Chat AI Engine     │
                                 └───────────────────────────┘
```

---

## 2. DOMAIN 1: PERANCANGAN SKEMA BASIS DATA SUPABASE (POSTGRESQL)

Perancangan skema memenuhi kebutuhan operasional F&B, sistem POS restoran, customer loyalty CRM, inventaris stok, serta keamanan RLS (Row Level Security).

### 2.1. DDL Tabel Utama

```sql
-- ============================================================================
-- SKEMA BASIS DATA BUMI UPI CRM & ORDERING (POSTGRESQL / SUPABASE)
-- Zona Waktu: Asia/Jakarta (WIB, UTC+7)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'kasir', 'admin');
CREATE TYPE tier_level AS ENUM ('Tamu', 'Sahabat', 'Keluarga');
CREATE TYPE order_status AS ENUM ('pending_payment', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway', 'online_delivery');
CREATE TYPE payment_method AS ENUM ('qris', 'cash', 'transfer', 'ewallet');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
CREATE TYPE rfm_segment_type AS ENUM (
    'Champions', 'Loyal', 'Potensial Loyal', 'Baru', 'Berisiko', 'Hampir Hilang', 'Hilang'
);

-- ----------------------------------------------------------------------------
-- 1. PROFILES / USERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    telegram_chat_id BIGINT UNIQUE,
    telegram_username TEXT,
    telegram_verification_token TEXT,
    telegram_token_expires_at TIMESTAMPTZ,
    tier tier_level NOT NULL DEFAULT 'Tamu',
    points_balance INT NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    cumulative_points INT NOT NULL DEFAULT 0 CHECK (cumulative_points >= 0),
    qr_code TEXT NOT NULL UNIQUE,
    birth_date DATE,
    menu_preferences TEXT[] DEFAULT '{}',
    opt_in_promo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_qr ON public.profiles(qr_code);
CREATE INDEX IF NOT EXISTS idx_profiles_tg_chat ON public.profiles(telegram_chat_id);

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_categories_sort ON public.categories(sort_order);

-- ----------------------------------------------------------------------------
-- 3. PRODUCTS (MENU ITEMS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    base_price INT NOT NULL CHECK (base_price >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_products_cat ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_avail ON public.products(is_available);

-- ----------------------------------------------------------------------------
-- 4. PRODUCT VARIANTS (Size M/L, Suhu Panas/Dingin, dll)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_type TEXT NOT NULL, -- 'size', 'temperature', 'style'
    name TEXT NOT NULL,         -- 'Medium', 'Large', 'Panas', 'Dingin'
    sku TEXT UNIQUE,
    price_adjustment INT NOT NULL DEFAULT 0, -- misal +3000 untuk Large
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);

-- ----------------------------------------------------------------------------
-- 5. INVENTORY & STOCK CONTROL
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    current_stock INT NOT NULL DEFAULT 100 CHECK (current_stock >= 0),
    minimum_stock INT NOT NULL DEFAULT 10,
    unit TEXT NOT NULL DEFAULT 'porsi', -- 'porsi', 'cup', 'pcs', 'gram'
    track_stock BOOLEAN NOT NULL DEFAULT TRUE,
    last_restocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    UNIQUE(product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_stock ON public.inventory(current_stock);

-- ----------------------------------------------------------------------------
-- 6. ORDERS (Dine-in, Takeaway, Online Customer Ordering)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,     -- e.g. 'BU-ORD-202611-0001'
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cashier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_type order_type NOT NULL DEFAULT 'dine_in',
    table_number TEXT,                      -- e.g. 'Meja 04', 'Bale Utama'
    status order_status NOT NULL DEFAULT 'pending_payment',
    subtotal INT NOT NULL CHECK (subtotal >= 0),
    discount_amount INT NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    final_amount INT NOT NULL CHECK (final_amount >= 0),
    points_earned INT NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
    voucher_id UUID,
    customer_voucher_id UUID,
    idempotency_key TEXT NOT NULL UNIQUE,
    payment_method payment_method NOT NULL DEFAULT 'qris',
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at);

-- ----------------------------------------------------------------------------
-- 7. ORDER ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    variant_name TEXT,
    unit_price INT NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal INT NOT NULL CHECK (subtotal >= 0),
    special_instructions TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ----------------------------------------------------------------------------
-- 8. PAYMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    payment_gateway TEXT NOT NULL DEFAULT 'mock_qris', -- 'mock_qris', 'midtrans', 'cash'
    transaction_ref TEXT,
    amount INT NOT NULL CHECK (amount >= 0),
    payment_method payment_method NOT NULL,
    status TEXT NOT NULL DEFAULT 'successful' CHECK (status IN ('pending', 'successful', 'failed', 'expired')),
    raw_response JSONB DEFAULT '{}',
    paid_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);

-- ----------------------------------------------------------------------------
-- 9. AUDIT LOGS (STAFF & SYSTEM ACTIONS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    staff_name TEXT NOT NULL,
    action TEXT NOT NULL, -- 'RECORD_TRANSACTION', 'UPDATE_ORDER_STATUS', 'STOCK_ADJUSTMENT', etc.
    target_entity TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_audit_staff ON public.audit_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);

-- ----------------------------------------------------------------------------
-- 10. VOUCHERS MASTER & CUSTOMER VOUCHERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('nominal', 'percent', 'free_item')),
    discount_value INT NOT NULL CHECK (discount_value >= 0),
    min_spend INT NOT NULL DEFAULT 0,
    max_discount INT,
    quota INT NOT NULL DEFAULT 100,
    claimed_count INT NOT NULL DEFAULT 0,
    redeemed_count INT NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    target_tier tier_level,
    target_rfm_segment rfm_segment_type,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE TABLE IF NOT EXISTS public.customer_vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
    unique_code TEXT NOT NULL UNIQUE,
    qr_code TEXT NOT NULL,
    is_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at TIMESTAMPTZ,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- ----------------------------------------------------------------------------
-- 11. POINTS LEDGER (IMMUTABLE LOYALTY BALANCE RECORD)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    points_change INT NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('transaction', 'welcome_bonus', 'birthday', 'voucher_redemption', 'manual_adjustment', 'tier_bonus')),
    balance_after INT NOT NULL CHECK (balance_after >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_points_ledger_customer ON public.points_ledger(customer_id);

-- ----------------------------------------------------------------------------
-- 12. RFM SCORES & CLV TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rfm_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    recency_days INT NOT NULL,
    frequency_count INT NOT NULL,
    monetary_total BIGINT NOT NULL,
    r_score INT NOT NULL CHECK (r_score BETWEEN 1 AND 5),
    f_score INT NOT NULL CHECK (f_score BETWEEN 1 AND 5),
    m_score INT NOT NULL CHECK (m_score BETWEEN 1 AND 5),
    rfm_segment rfm_segment_type NOT NULL,
    clv_estimate BIGINT NOT NULL DEFAULT 0,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);
```

### 2.2. Fungsi Atomic Stored Procedure: `create_order_atomic`

Fungsi ini menjamin **idempotensi**, **lock kupon (FOR UPDATE)**, **pengurangan stok otomatis**, **penghitungan poin loyalitas**, **promosi tier otomatis**, dan **pencatatan ledger & audit log**:

```sql
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_idempotency_key TEXT,
    p_customer_id UUID,
    p_cashier_id UUID,
    p_order_type order_type,
    p_table_number TEXT,
    p_subtotal INT,
    p_discount_amount INT,
    p_final_amount INT,
    p_customer_voucher_id UUID,
    p_payment_method payment_method,
    p_items JSONB, -- Array of objects: [{product_id, variant_id, item_name, variant_name, unit_price, quantity, subtotal}]
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_order RECORD;
    v_order_id UUID;
    v_order_number TEXT;
    v_voucher_id UUID;
    v_is_redeemed BOOLEAN;
    v_voucher_expiry TIMESTAMPTZ;
    v_points_earned INT := 0;
    v_current_points INT := 0;
    v_new_balance INT := 0;
    v_new_cumulative INT := 0;
    v_new_tier tier_level := 'Tamu';
    v_item JSONB;
    v_pid UUID;
    v_vid UUID;
    v_qty INT;
BEGIN
    -- 1. Idempotency Check
    SELECT id, order_number, final_amount, points_earned, status
    INTO v_existing_order
    FROM public.orders
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'is_duplicate', true,
            'order_id', v_existing_order.id,
            'order_number', v_existing_order.order_number,
            'final_amount', v_existing_order.final_amount,
            'points_earned', v_existing_order.points_earned,
            'status', v_existing_order.status,
            'message', 'Pesanan sudah tercatat sebelumnya (Idempotent).'
        );
    END IF;

    -- 2. Validasi & Lock Voucher Single-Use
    IF p_customer_voucher_id IS NOT NULL THEN
        SELECT voucher_id, is_redeemed, expires_at
        INTO v_voucher_id, v_is_redeemed, v_voucher_expiry
        FROM public.customer_vouchers
        WHERE id = p_customer_voucher_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Voucher pelanggan tidak ditemukan.';
        END IF;

        IF v_is_redeemed THEN
            RAISE EXCEPTION 'Voucher sudah pernah digunakan sebelumnya.';
        END IF;

        IF v_voucher_expiry < (NOW() AT TIME ZONE 'Asia/Jakarta') THEN
            RAISE EXCEPTION 'Voucher sudah kedaluwarsa.';
        END IF;
    END IF;

    -- 3. Hitung Poin (1 Poin per Rp 10.000)
    IF p_customer_id IS NOT NULL THEN
        v_points_earned := FLOOR(p_final_amount / 10000);
    END IF;

    -- 4. Generate Nomor Pesanan Unik
    v_order_number := 'BU-ORD-' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- 5. Insert Record Order
    INSERT INTO public.orders (
        order_number,
        customer_id,
        cashier_id,
        order_type,
        table_number,
        status,
        subtotal,
        discount_amount,
        final_amount,
        points_earned,
        voucher_id,
        customer_voucher_id,
        idempotency_key,
        payment_method,
        payment_status,
        notes
    ) VALUES (
        v_order_number,
        p_customer_id,
        p_cashier_id,
        p_order_type,
        p_table_number,
        'confirmed',
        p_subtotal,
        p_discount_amount,
        p_final_amount,
        v_points_earned,
        v_voucher_id,
        p_customer_voucher_id,
        p_idempotency_key,
        p_payment_method,
        'paid',
        p_notes
    ) RETURNING id INTO v_order_id;

    -- 6. Insert Items & Pengurangan Stok Inventaris
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_pid := (v_item->>'product_id')::UUID;
        v_vid := CASE WHEN v_item->>'variant_id' IS NOT NULL THEN (v_item->>'variant_id')::UUID ELSE NULL END;
        v_qty := (v_item->>'quantity')::INT;

        INSERT INTO public.order_items (
            order_id,
            product_id,
            variant_id,
            item_name,
            variant_name,
            unit_price,
            quantity,
            subtotal,
            special_instructions
        ) VALUES (
            v_order_id,
            v_pid,
            v_vid,
            v_item->>'item_name',
            v_item->>'variant_name',
            (v_item->>'unit_price')::INT,
            v_qty,
            (v_item->>'subtotal')::INT,
            v_item->>'special_instructions'
        );

        -- Pengurangan Stok Inventaris
        UPDATE public.inventory
        SET current_stock = GREATEST(0, current_stock - v_qty),
            updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
        WHERE (product_id = v_pid AND (v_vid IS NULL OR variant_id = v_vid));
    END LOOP;

    -- 7. Tandai Voucher Terpakai
    IF p_customer_voucher_id IS NOT NULL THEN
        UPDATE public.customer_vouchers
        SET is_redeemed = TRUE,
            redeemed_at = NOW() AT TIME ZONE 'Asia/Jakarta',
            order_id = v_order_id
        WHERE id = p_customer_voucher_id;

        UPDATE public.vouchers
        SET redeemed_count = redeemed_count + 1
        WHERE id = v_voucher_id;
    END IF;

    -- 8. Update Saldo Poin & Kenaikan Tier Anggota
    IF p_customer_id IS NOT NULL THEN
        SELECT points_balance, cumulative_points
        INTO v_current_points, v_new_cumulative
        FROM public.profiles
        WHERE id = p_customer_id
        FOR UPDATE;

        v_new_balance := v_current_points + v_points_earned;
        v_new_cumulative := v_new_cumulative + v_points_earned;

        IF v_new_cumulative >= 300 THEN
            v_new_tier := 'Keluarga';
        ELSIF v_new_cumulative >= 100 THEN
            v_new_tier := 'Sahabat';
        ELSE
            v_new_tier := 'Tamu';
        END IF;

        UPDATE public.profiles
        SET points_balance = v_new_balance,
            cumulative_points = v_new_cumulative,
            tier = v_new_tier,
            updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
        WHERE id = p_customer_id;

        -- Catat ke Points Ledger
        INSERT INTO public.points_ledger (
            customer_id,
            order_id,
            points_change,
            reason,
            balance_after,
            notes
        ) VALUES (
            p_customer_id,
            v_order_id,
            v_points_earned,
            'transaction',
            v_new_balance,
            'Poin dari transaksi pesanan ' || v_order_number
        );
    END IF;

    -- 9. Catat Pembayaran
    INSERT INTO public.payments (
        order_id,
        invoice_number,
        payment_gateway,
        transaction_ref,
        amount,
        payment_method,
        status,
        paid_at
    ) VALUES (
        v_order_id,
        v_order_number,
        CASE WHEN p_payment_method = 'qris' THEN 'mock_qris' ELSE 'cash' END,
        p_idempotency_key,
        p_final_amount,
        p_payment_method,
        'successful',
        NOW() AT TIME ZONE 'Asia/Jakarta'
    );

    -- 10. Audit Log
    INSERT INTO public.audit_logs (
        staff_id,
        staff_name,
        action,
        target_entity,
        target_id,
        details
    ) VALUES (
        p_cashier_id,
        COALESCE((SELECT name FROM public.profiles WHERE id = p_cashier_id), 'Sistem Web Kasir'),
        'CREATE_ORDER',
        'orders',
        v_order_id::TEXT,
        jsonb_build_object(
            'order_number', v_order_number,
            'final_amount', p_final_amount,
            'items_count', jsonb_array_length(p_items),
            'points_earned', v_points_earned
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'is_duplicate', false,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'final_amount', p_final_amount,
        'points_earned', v_points_earned,
        'new_tier', v_new_tier,
        'message', 'Pesanan dan pembayaran berhasil diproses secara atomic.'
    );
END;
$$;
```

---

## 3. DOMAIN 2: ARSITEKTUR FALLBACK LOCAL MOCK API NEXT.JS (ZERO-CREDENTIAL)

Sesuai spesifikasi, aplikasi harus **100% langsung dapat diuji coba end-to-end tanpa kredensial Supabase eksternal**.

### 3.1. Unified Data Layer Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │     Frontend Component / Route Handler       │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │      Data Provider / Client Abstraction      │
                    │         (packages/db/src/client.ts)          │
                    └──────────────────────┬───────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ isMockMode?                         │
                        ▼                                     ▼
             [YES: Zero Credentials]               [NO: Valid Credentials]
             ┌─────────────────────┐               ┌─────────────────────┐
             │  Local Mock Service │               │  Real Supabase SDK  │
             │   (In-Memory Store  │               │ (@supabase/supabase-│
             │   & State Manager)  │               │        js)          │
             └─────────────────────┘               └─────────────────────┘
```

### 3.2. Logika Deteksi Otomatis (Zero-Config Guard)

```typescript
// packages/db/src/config.ts
export function isMockMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const forceMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

  if (forceMock) return true;
  if (!url || !key) return true;
  if (url.includes('placeholder') || url.includes('your-project') || url.includes('demo')) return true;

  return false;
}
```

### 3.3. Struktur Route Handlers Fallback di Next.js App Router

Semua endpoint backend di `apps/web/src/app/api` dan `apps/admin/src/app/api` menggunakan fallback service:
- `/api/products` (GET): Mengembalikan 105 menu item lengkap dengan kategori dan varian (M/L/Panas/Dingin).
- `/api/orders` (POST, GET): Menjalankan `recordOrderMockAtomic` yang mereplikasi fungsi PostgreSQL `create_order_atomic`.
- `/api/auth/login` (POST): Mengautentikasi kredensial demo secara lokal dan mengeluarkan token JWT / session cookie.
- `/api/auth/otp/send` (POST): Menghasilkan OTP WhatsApp 6-angka, mencetak ke server console, dan mengirimkan demo toast helper.
- `/api/auth/otp/verify` (POST): Memverifikasi kode OTP dan mengaktifkan profil pelanggan.
- `/api/inventory` (GET, PATCH): Manajemen inventaris real-time lokal.
- `/api/rfm` (GET, POST): Rekalkulasi kuintil skor RFM 200 pelanggan lokal.
- `/api/telegram/webhook` (POST): Simulasi webhook Telegram dengan pemrosesan idempotensi.

### 3.4. Penyimpanan State Mock (State Persistence across Hot-Reload)

Untuk memastikan data tidak hilang saat hot-reload di mode pengembangan:
1. **In-Memory Global Singleton**: `globalThis.__BUMI_UPI_STORE__` menyimpan state `customers`, `orders`, `inventory`, `vouchers`, dan `audit_logs`.
2. **Local Session Cache**: Menyinkronkan perubahan ke browser `localStorage` pada sisi klien sehingga refresh peramban mempertahankan transaksi baru.

---

## 4. DOMAIN 3: WHATSAPP OTP CONSOLE MODE FLOW & UI TOAST HELPER

Pemberian OTP via WhatsApp pada implementasi awal dijalankan dalam mode **Console & Toast Helper**. Ini memberikan 100% kelancaran demonstrasi tanpa biaya API pihak ketiga (seperti Twilio, Fonnte, atau Waba).

### 4.1. Diagram Alir WhatsApp OTP Console Mode

```
Pelanggan                          Next.js API Handler                     Server Terminal
 (Browser)                           (/api/auth/otp)                        (Stdout / Node)
     │                                      │                                      │
     │ 1. Input Nomor HP: 081234567890      │                                      │
     ├─────────────────────────────────────►│                                      │
     │    POST /api/auth/otp/send           │                                      │
     │                                      │ 2. Generate 6-Digit OTP: "839201"    │
     │                                      │    Simpan di Memory Cache (Exp 10m)  │
     │                                      │                                      │
     │                                      │ 3. Cetak Banner WhatsApp Formatted   │
     │                                      ├─────────────────────────────────────►│
     │                                      │                                      │ [WHATSAPP OTP CONSOLE]
     │                                      │                                      │ Nomor : +62 812-3456-7890
     │                                      │                                      │ Kode  : 839201
     │                                      │                                      │ Status: Sent (Console)
     │                                      │                                      │
     │ 4. Response JSON:                    │                                      │
     │    { success: true, demoOtp: 839201 }│                                      │
     │◄─────────────────────────────────────┤                                      │
     │                                                                             │
     │ 5. Tampilkan UI Toast Helper:                                               │
     │    "Mode Demo: Kode OTP Anda: 839201 [Klik untuk Isi Otomatis]"             │
     │                                                                             │
     │ 6. User Klik / Masukkan Kode OTP                                            │
     ├─────────────────────────────────────►│                                      │
     │    POST /api/auth/otp/verify         │                                      │
     │                                      │ 7. Cocokkan Kode                     │
     │                                      │    Set is_phone_verified = TRUE      │
     │                                      │    Terbitkan Session Cookie          │
     │ 8. Verifikasi Berhasil & Redirect    │                                      │
     │◄─────────────────────────────────────┤                                      │
```

### 4.2. Spesifikasi Cetakan Konsol Server

Handler `POST /api/auth/otp/send` mencetak format standar berikut:

```
======================================================================
🌿 [WHATSAPP OTP CONSOLE MODE] — RUMAH TAMAH BUMI UPI GARUT
----------------------------------------------------------------------
Tujuan Nomor : +62 812-3456-7890
Kode OTP     : 839201
Masa Berlaku : 10 Menit (WIB)
Waktu Kirim  : Minggu, 01 Nov 2026 — 07:55:00 WIB
Pesan Teks   : "Sampurasun! Kode verifikasi pendaftaran Rumah Tamah
                Bumi Upi Anda adalah: 839201.
                Jangan berikan kode ini kepada siapapun demi keamanan."
----------------------------------------------------------------------
Status       : Terkirim Sukses (Console Simulation Mode)
======================================================================
```

### 4.3. Spesifikasi UI Toast Helper

Komponen toast di frontend (`packages/ui/src/components/OtpDemoToast.tsx`):
- Muncul di sisi kanan-atas dengan warna Terakota & Krem heritage.
- Menampilkan teks: `💬 Kode OTP Terkirim ke WhatsApp: 839201`.
- Memiliki tombol aksi: `[Isi Otomatis]` yang langsung mengisikan ke input 6 kotak angka dan mengarahkan fokus ke tombol verifikasi.

---

## 5. DOMAIN 4: PENGATURAN KREDENSIAL DEMO SISTEM

Sistem menyediakan 3 akun demo resmi yang telah dikonfigurasi langsung untuk pengujian instan:

| Peran (Role) | Email Login | Kata Sandi Demo | Akses Halaman | Fitur Utama |
|---|---|---|---|---|
| **Admin / Pemilik** | `putriayusagita02@gmail.com` | `BumiUpiAdmin2026!` | `/admin`, `/admin/rfm`, `/admin/campaigns`, `/admin/inventory`, `/admin/audit` | Dashboard Analitik CRM, Matriks Kuintil RFM & CLV, Peluncur Kampanye Broadcast, Manajemen Menu & Inventaris, Log Audit Staf |
| **Kasir / Staf POS** | `kasir@bumiupi.id` | `kasir2026!` *(atau `BumiUpiKasir2026!`)* | `/admin/pos` | Tablet POS kasir, Scan QR / Input HP Pelanggan, Modifikasi Pesanan & Varian, Validasi Kupon Sekali Pakai, Cetak Struk Kasir |
| **Pelanggan Utama** | `customer@bumiupi.id` *(HP: `081234567890`)* | `tamu2026!` *(atau `BumiUpiTamu2026!`)* | `/customer`, `/menu`, `/cart`, `/checkout` | Kartu Member Digital (`BUMI-CUST-8899`), Saldo 142 Poin (Tier Sahabat), Wallet Voucher, Riwayat Pesanan, Deep Link Telegram |

### 5.1. Tombol Switcher Kredensial Cepat (One-Click Demo Login)
Di halaman login (`/login`), terdapat baris tombol cepat:
- `[Masuk sebagai Admin (Putri Ayu)]`
- `[Masuk sebagai Kasir (Kang Asep)]`
- `[Masuk sebagai Pelanggan (Dimas Kurniawan)]`

---

## 6. DOMAIN 5: ALUR WEB ORDERING PELANGGAN & DASHBOARD CRM/POS DENGAN TELEGRAM BOT

### 6.1. Alur Web Ordering Pelanggan (`apps/web`)

1. **Halaman Beranda (`/`)**:
   - Branding visual Garut tempo doeloe (Olive `#3E4F30`, Krem `#F5EEDC`, Terakota `#B4532A`, Tipografi Fraunces & Caveat).
   - Bubble widget **Upi Chat AI** (asisten AI ramah khas Sunda untuk info jam buka, menu andalan, dan suasana rumah nenek).
2. **Katalog Menu Digital (`/menu`)**:
   - Memuat **105 item menu lengkap** (Nasi & Makanan Utama, Lauk Pauk Tradisional, Sayur & Sambal Khas Garut, Camilan & Gorengan Hangat, Minuman Tradisional & Kopi).
   - Filter kategori cepat, penanda menu favorit/unggulan, dan pencarian interaktif.
   - **Modal Pemilihan Varian**:
     - Ukuran: Medium (M) atau Large (L, penyesuaian harga +Rp 3.000).
     - Suhu Minuman: Dingin (Es) atau Panas (Hangat).
     - Catatan Dapur: Instruksi khusus (misal: "kurang pedas", "es dipisah").
3. **Keranjang & Review Pesanan (`/cart`)**:
   - Ringkasan baris pesanan, kuantitas, dan subtotal dinamis.
   - Pilihan Opsi Konsumsi:
     - **Makan di Tempat (Dine-in)**: Pemilihan nomor meja (Meja 01 - Meja 20, Bale Utama, Teras Jendela).
     - **Bungkus (Takeaway)**.
4. **Pembayaran & Loyalitas (`/checkout`)**:
   - Input/Terapkan Kode Voucher Pelanggan (potongan diskon seketika).
   - Opsi Tukar Poin Member.
   - Metode Pembayaran: **QRIS Dinamis** (simulasi scan QRIS instan) atau **Bayar di Kasir**.
5. **Pelacak Status Pesanan (`/order-status/[id]`)**:
   - Realtime status progress: `Menunggu Pembayaran` -> `Dikonfirmasi` -> `Sedang Dimasak di Dapur` -> `Siap Disajikan`.
6. **Portal Loyalitas Pelanggan (`/customer`)**:
   - Kartu Anggota Digital beranimasi dengan QR Code dinamis (`BUMI-CUST-8899`).
   - Progress bar kenaikan level: `Tamu` (0-99 Poin) -> `Sahabat` (100-299 Poin) -> `Keluarga` (300+ Poin).
   - Buku besar mutasi poin (`points_ledger`).
   - Dompet Voucher & Klaim promo.
   - Form Reservasi Meja & Pendaftaran Nobar Persib.
   - **Tautan Verifikasi Telegram**: Tombol `Hubungkan Telegram` yang membuka deep-link `t.me/BumiUpiBot?start=TOKEN`.

---

### 6.2. Alur Dashboard POS & CRM Admin/Kasir (`apps/admin`)

1. **POS Tablet Register Kasir (`/admin/pos`)**:
   - Desain layar sentuh responsif dengan grid menu cepat.
   - Pencarian pelanggan melalui scan kamera QR atau input nomor HP. Menampilkan nama, tier, dan saldo poin seketika.
   - Popover modifier varian (M/L, Panas/Dingin) dalam satu sentuhan.
   - Kolom validasi voucher pelanggan dengan proteksi anti-dobel.
   - Tombol **Selesaikan Pembayaran & Cetak Struk**: Menjalankan fungsi atomic, mencetak struk thermal, dan menyalakan webhook notifikasi Telegram.
2. **Dashboard Eksekutif & Ringkasan Penjualan (`/admin`)**:
   - Banner **"DATA SIMULASI — STUDI KASUS CRM BUMI UPI"**.
   - Ringkasan metrik: Omzet harian/bulanan, total 200 pelanggan, 2.140 transaksi, rata-rata transaksi (AOV).
   - Grafik tren penjualan 30 hari.
3. **Analytical CRM: Matriks RFM & CLV (`/admin/rfm`)**:
   - Matriks kuintil Recency, Frequency, Monetary (Skor 1 sampai 5).
   - Distribusi 7 segmen pelanggan: *Champions, Loyal, Potensial Loyal, Baru, Berisiko, Hampir Hilang, Hilang*.
   - Filter drill-down: Klik segmen **Berisiko** untuk melihat 28 pelanggan yang belum berkunjung 45-90 hari terakhir.
   - Customer 360 View: Profil individual lengkap, riwayat pesanan, menu favorit, dan estimasi CLV.
4. **Collaborative CRM: Kampanye Broadcast (`/admin/campaigns`)**:
   - Pembuatan pesan siaran targeted per segmen RFM.
   - Safeguard frekuensi: Pembatasan otomatis maksimal 2 pesan per minggu per pelanggan.
   - Opsi pengiriman: Otomatis via Bot Telegram bagi yang terhubung, atau tautan `wa.me` teks otomatis.
5. **Kontrol Inventaris Stok (`/admin/inventory`)**:
   - Tabel stok bahan dan porsi menu.
   - Peringatan stok kritis (< 10 porsi).
   - Log restock dan penyesuaian bahan.
6. **Buku Audit Staf (`/admin/audit`)**:
   - Riwayat pencatatan setiap aksi kasir dan admin.

---

### 6.3. Integrasi Mesin Bot Telegram (`@BumiUpiBot`)

Bot Telegram berfungsi ganda: sebagai asisten bagi pelanggan dan sistem pemicu notifikasi bagi tim operasional/dapur.

```
                                 ┌───────────────────────────────┐
                                 │     Transaksi / Pesanan Web   │
                                 │       Selesai Dibayar         │
                                 └───────────────┬───────────────┘
                                                 │
                                                 ▼
                                 ┌───────────────────────────────┐
                                 │    Telegram Dispatcher        │
                                 │   (src/lib/telegram.ts)       │
                                 └───────────────┬───────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        │                                                 │
                        ▼                                                 ▼
            [Channel Pelanggan]                                 [Channel Dapur & Staf]
            • Push Struk Digital (WIB)                          • Notifikasi Pesanan Masuk
            • Update Saldo Poin & Level                         • Rincian Meja & Varian Menu
            • Link Promo Baru                                   • Peringatan Stok Kritis
```

#### A. Format Notifikasi Struk Transaksi Digital (WIB):
```
📅 Minggu, 1 November 2026 — 07.55 WIB
🧾 Terima kasih sudah mampir ke Bumi!
├ No. Struk : BU-ORD-20261101-8899
├ Total     : Rp74.000
├ Poin masuk: +7 Poin
├ Saldo poin: 149 Poin
└ Level     : Sahabat (151 poin lagi ke Keluarga)

Sejauh apapun pergi, rumah tempatnya pulang. Sampai jumpa lagi di Bumi Upi! 🏡
```

#### B. Notifikasi Pesanan Masuk ke Dapur:
```
🔔 PESANAN BARU MASUK! [Meja 04 — Bale Utama]
No. Pesanan: BU-ORD-20261101-8899
Waktu      : 07.55 WIB
Status     : Sudah Dibayar (QRIS)
---------------------------------------------
1. 2x Nasi Goreng Kecombrang (Pedas Sedang)
2. 2x Es Cokelat Bumi Klasik (Dingin, Roti Hangat)
3. 1x Tempe Mendoan Panas (Isi 4)
---------------------------------------------
Catatan: Sambal terasi dipisah.
```

#### C. Verifikasi Kontak Anti-Spoofing:
- Saat user menekan `/start TOKEN`, bot meminta kontak via tombol keyboard `Bagikan Kontak (Share Contact)`.
- Server memvalidasi bahwa `contact.user_id == from.id`. Hal ini mencegah nomor HP palsu atau hasil ketikan manual, sehingga verifikasi nomor pelanggan terjamin 100% valid dan gratis.

---

## 7. MATRIKS KELAYAKAN TEKNOLOGI & LINGKUNGAN PENGEMBANGAN

Berdasarkan investigasi lingkungan Windows workspace:
- **Node.js**: Tersedia.
- **PNPM**: Siap digunakan untuk monorepo workspaces (`apps/*`, `packages/*`).
- **Next.js**: Next.js 14 (App Router) dengan Tailwind CSS dan TypeScript.
- **Database**: Supabase PostgreSQL migration scripts terstruktur di folder `supabase/migrations/` + Local Mock API fallback.
- **Katalog Menu**: Ditemukan referensi file PDF `MENU-REGULER.pdf` (pada riwayat transfer WhatsApp lokal sistem) berisi 105 item lengkap yang akan diseed ke database dan mock store.

---

## 8. REKOMENDASI TAHAPAN IMPLEMENTASI (DOWNSTREAM ROADMAP)

1. **Milestone 1 — Monorepo Foundation & Shared Packages**:
   - Inisialisasi `pnpm-workspace.yaml`.
   - Setup `packages/ui` (komponen tema Bumi Upi) dan `packages/db` (klien Supabase + mock store).
   - Setup `apps/web` dan `apps/admin`.
2. **Milestone 2 — Schema Migration & 105 Menu Items Seed**:
   - Jalankan migrasi SQL yang diperbarui (tabel categories, products, product_variants, orders, order_items, payments, inventory, audit_logs).
   - Seeding 105 menu item lengkap dengan varian harga.
3. **Milestone 3 — Customer Web Ordering (`apps/web`)**:
   - Implementasi katalog digital, modal varian, keranjang meja, checkout QRIS, status pesanan, dan WhatsApp OTP console mode.
4. **Milestone 4 — Admin & Kasir CRM & POS Dashboard (`apps/admin`)**:
   - Implementasi Tablet POS Kasir, Matriks RFM, Manajemen Inventaris, dan Webhook Telegram Bot.
5. **Milestone 5 — Integrasi End-to-End & Uji Coba**:
   - Verifikasi alur zero-credential lengkap dengan akun demo putriayusagita02@gmail.com, kasir, dan customer.
