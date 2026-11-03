-- ============================================================================
-- BUMI UPI CRM — MIGRATION 01: INITIAL SCHEMA
-- Case Study: Rumah Tamah Bumi Upi, Garut, Jawa Barat
-- Database: PostgreSQL / Supabase
-- Timezone: WIB (Asia/Jakarta, UTC+7)
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'kasir', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tier_level AS ENUM ('Tamu', 'Sahabat', 'Keluarga');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rfm_segment_type AS ENUM (
        'Champions',
        'Loyal',
        'Potensial Loyal',
        'Baru',
        'Berisiko',
        'Hampir Hilang',
        'Hilang'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending_payment', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway', 'online_delivery');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('qris', 'cash', 'transfer', 'ewallet');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. PROFILES TABLE (Customers, Kasir, Admin)
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

-- Indexing for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_tg_chat ON public.profiles(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_profiles_qr ON public.profiles(qr_code);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON public.profiles(tier);

-- 2. MENU CATEGORIES & CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 3. PRODUCTS & MENU ITEMS (105 Items, Masakan Sunda & Minuman Bumi Upi)
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

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price INT NOT NULL CHECK (price >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    image_url TEXT,
    variants JSONB DEFAULT '[]',
    temperatures TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 3B. PRODUCT VARIANTS (Size M/L, Suhu Panas/Dingin)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_type TEXT NOT NULL, -- 'size', 'temperature', 'style'
    name TEXT NOT NULL,         -- 'Medium', 'Large', 'Panas', 'Dingin'
    sku TEXT UNIQUE,
    price_adjustment INT NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 3C. INVENTORY & STOCK CONTROL
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    current_stock INT NOT NULL DEFAULT 100 CHECK (current_stock >= 0),
    minimum_stock INT NOT NULL DEFAULT 10,
    unit TEXT NOT NULL DEFAULT 'porsi',
    track_stock BOOLEAN NOT NULL DEFAULT TRUE,
    last_restocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    UNIQUE(product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_products_cat ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_avail ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON public.inventory(current_stock);
CREATE INDEX IF NOT EXISTS idx_menu_items_cat ON public.menu_items(category_id);

-- 4. VOUCHERS MASTER TABLE
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

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON public.vouchers(code);

-- 5. CUSTOMER VOUCHERS (Claimed instances per customer)
CREATE TABLE IF NOT EXISTS public.customer_vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
    unique_code TEXT NOT NULL UNIQUE,
    qr_code TEXT NOT NULL,
    is_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at TIMESTAMPTZ,
    transaction_id UUID,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_cust_vouchers_cid ON public.customer_vouchers(customer_id);
CREATE INDEX IF NOT EXISTS idx_cust_vouchers_code ON public.customer_vouchers(unique_code);

-- 6. TRANSACTIONS & ORDERS TABLES
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cashier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    idempotency_key TEXT NOT NULL UNIQUE,
    subtotal INT NOT NULL CHECK (subtotal >= 0),
    discount_amount INT NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    final_amount INT NOT NULL CHECK (final_amount >= 0),
    points_earned INT NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
    voucher_id UUID REFERENCES public.vouchers(id) ON DELETE SET NULL,
    customer_voucher_id UUID REFERENCES public.customer_vouchers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

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
    voucher_id UUID REFERENCES public.vouchers(id) ON DELETE SET NULL,
    customer_voucher_id UUID REFERENCES public.customer_vouchers(id) ON DELETE SET NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    payment_method payment_method NOT NULL DEFAULT 'qris',
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_transactions_customer ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at);

-- 7. TRANSACTION ITEMS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    unit_price INT NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal INT NOT NULL CHECK (subtotal >= 0)
);

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

CREATE INDEX IF NOT EXISTS idx_tx_items_tx ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 7B. PAYMENTS TABLE
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

-- 8. POINTS LEDGER (Immutable audit log of all point movements)
CREATE TABLE IF NOT EXISTS public.points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    points_change INT NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('transaction', 'welcome_bonus', 'birthday', 'voucher_redemption', 'manual_adjustment', 'tier_bonus')),
    balance_after INT NOT NULL CHECK (balance_after >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_points_ledger_cust ON public.points_ledger(customer_id);

-- 9. RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_email TEXT,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    guest_count INT NOT NULL CHECK (guest_count > 0),
    seating_area TEXT NOT NULL DEFAULT 'Bale Utama',
    status TEXT NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'dikonfirmasi', 'selesai', 'batal')),
    special_notes TEXT,
    staff_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

-- 10. EVENTS & NOBAR TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    max_participants INT NOT NULL DEFAULT 50,
    current_participants INT NOT NULL DEFAULT 0,
    linked_voucher_id UUID REFERENCES public.vouchers(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 11. EVENT RSVPS
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    guest_count INT NOT NULL DEFAULT 1 CHECK (guest_count > 0),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    UNIQUE(event_id, customer_id)
);

-- 12. CUSTOMER FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.customer_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    category TEXT NOT NULL CHECK (category IN ('rasa', 'pelayanan', 'suasana', 'umum')),
    comment TEXT,
    sentiment TEXT DEFAULT 'netral' CHECK (sentiment IN ('positif', 'netral', 'negatif')),
    status TEXT NOT NULL DEFAULT 'baru' CHECK (status IN ('baru', 'diproses', 'selesai')),
    admin_response TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.customer_feedback(rating);

-- 13. RFM SCORES & CLV TABLE
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

CREATE INDEX IF NOT EXISTS idx_rfm_segment ON public.rfm_scores(rfm_segment);

-- 14. CAMPAIGNS & BROADCASTS
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    target_segment rfm_segment_type,
    channel TEXT NOT NULL CHECK (channel IN ('telegram', 'whatsapp')),
    message_template TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    audience_count INT NOT NULL DEFAULT 0,
    delivered_count INT NOT NULL DEFAULT 0,
    conversion_count INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 15. TELEGRAM WEBHOOK IDEMPOTENCY TABLE
CREATE TABLE IF NOT EXISTS public.telegram_updates (
    update_id BIGINT PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    update_payload JSONB
);

-- 16. AI CONFIGURATION & MULTI-PROVIDER FAILOVER
CREATE TABLE IF NOT EXISTS public.ai_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    active_provider TEXT NOT NULL DEFAULT 'gemini' CHECK (active_provider IN ('gemini', 'openai', 'deepseek')),
    failover_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    gemini_api_key TEXT,
    openai_api_key TEXT,
    deepseek_api_key TEXT,
    temperature NUMERIC NOT NULL DEFAULT 0.7,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 17. AI USAGE LOGS
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    latency_ms INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    staff_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 19. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    point_per_amount INT NOT NULL DEFAULT 10000, -- 1 poin per Rp 10.000
    tier_sahabat_min INT NOT NULL DEFAULT 100,
    tier_keluarga_min INT NOT NULL DEFAULT 300,
    operating_hours TEXT NOT NULL DEFAULT '07:00 - 23:00 WIB',
    admin_whatsapp TEXT NOT NULL DEFAULT '6281234567890',
    telegram_bot_username TEXT NOT NULL DEFAULT 'BumiUpiBot',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);
