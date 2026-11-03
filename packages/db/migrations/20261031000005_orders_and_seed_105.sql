-- ============================================================================
-- BUMI UPI CRM — MIGRATION 05: ORDERS, INVENTORY, ATOMIC RPC & 105 SEED
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
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tier_level AS ENUM ('Tamu', 'Sahabat', 'Keluarga');
EXCEPTION WHEN duplicate_object THEN null; END $$;

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
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending_payment', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway', 'online_delivery');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('qris', 'cash', 'transfer', 'ewallet');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. PRODUCT VARIANTS TABLE
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

-- 2. INVENTORY & STOCK CONTROL TABLE
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

CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON public.inventory(current_stock);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cashier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_type order_type NOT NULL DEFAULT 'dine_in',
    table_number TEXT,
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

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_idemp ON public.orders(idempotency_key);

-- 4. ORDER ITEMS TABLE
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

-- 5. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    payment_gateway TEXT NOT NULL DEFAULT 'mock_qris',
    transaction_ref TEXT,
    amount INT NOT NULL CHECK (amount >= 0),
    payment_method payment_method NOT NULL,
    status TEXT NOT NULL DEFAULT 'successful' CHECK (status IN ('pending', 'successful', 'failed', 'expired')),
    raw_response JSONB DEFAULT '{}',
    paid_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);

-- 6. ATOMIC ORDER CREATION RPC PROCEDURE
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
    p_items JSONB,
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
    -- STEP 1: Idempotency Check
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

    -- STEP 2: Voucher Validation & Row-Locking
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

    -- STEP 3: Points Calculation (1 pt per Rp 10.000)
    IF p_customer_id IS NOT NULL THEN
        v_points_earned := FLOOR(p_final_amount / 10000);
    END IF;

    -- STEP 4: Generate Unique Order Number
    v_order_number := 'BU-ORD-' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- STEP 5: Insert Order Record
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

    -- STEP 6: Insert Items & Decrement Inventory Stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_pid := CASE WHEN v_item->>'product_id' IS NOT NULL AND (v_item->>'product_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN (v_item->>'product_id')::UUID ELSE NULL END;
        v_vid := CASE WHEN v_item->>'variant_id' IS NOT NULL AND (v_item->>'variant_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN (v_item->>'variant_id')::UUID ELSE NULL END;
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

        IF v_pid IS NOT NULL THEN
            UPDATE public.inventory
            SET current_stock = GREATEST(0, current_stock - v_qty),
                updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
            WHERE (product_id = v_pid AND (v_vid IS NULL OR variant_id = v_vid));
        END IF;
    END LOOP;

    -- STEP 7: Mark Voucher Redeemed
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

    -- STEP 8: Update Customer Points & Tier
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
            'Poin dari pesanan ' || v_order_number
        );
    END IF;

    -- STEP 9: Record Payment
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
        'TRX-' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDDHH24MISS'),
        p_final_amount,
        p_payment_method,
        'successful',
        NOW() AT TIME ZONE 'Asia/Jakarta'
    );

    RETURN jsonb_build_object(
        'success', true,
        'is_duplicate', false,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal', p_subtotal,
        'discount_amount', p_discount_amount,
        'final_amount', p_final_amount,
        'points_earned', v_points_earned,
        'new_tier', v_new_tier,
        'status', 'confirmed',
        'message', 'Pesanan dan pembayaran berhasil diproses secara atomic.'
    );
END;
$$;


-- ============================================================================
-- BUMI UPI CRM — MIGRATION 04: COMPLETE SEED CATALOG 105 MENU ITEMS & DATA
-- Case Study: Rumah Tamah Bumi Upi, Garut, Jawa Barat
-- Verified against MENU-REGULER.pdf (105 items across 16 categories)
-- ============================================================================

-- 1. SYSTEM SETTINGS SEED
INSERT INTO public.system_settings (
    point_per_amount,
    tier_sahabat_min,
    tier_keluarga_min,
    operating_hours,
    admin_whatsapp,
    telegram_bot_username
) VALUES (
    10000,
    100,
    300,
    '07:00 - 23:00 WIB',
    '6281223344550',
    'BumiUpiBot'
) ON CONFLICT DO NOTHING;

-- 2. AI CONFIGURATION SEED
INSERT INTO public.ai_configs (
    active_provider,
    failover_enabled,
    gemini_api_key,
    openai_api_key,
    deepseek_api_key,
    temperature
) VALUES (
    'gemini',
    TRUE,
    'AIzaSy_DEMO_GEMINI_KEY_BUMI_UPI',
    'sk-demo-openai-key-bumi-upi',
    'sk-demo-deepseek-key-bumi-upi',
    0.7
) ON CONFLICT DO NOTHING;

-- 3. 16 MENU CATEGORIES SEED
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES
('cat-01000000-0000-0000-0000-000000000001', 'Cemilan Cepuluh', 'cemilan-cepuluh', 'Camilan Tradisional', 1),
('cat-01000000-0000-0000-0000-000000000002', 'Ber Pepes An', 'ber-pepes-an', 'Lauk Pauk & Pepes', 2),
('cat-01000000-0000-0000-0000-000000000003', 'Emih - Emihan', 'emih-emihan', 'Nasi & Makanan Utama', 3),
('cat-01000000-0000-0000-0000-000000000004', 'Pemadam Kelaparan', 'pemadam-kelaparan', 'Nasi & Makanan Utama', 4),
('cat-01000000-0000-0000-0000-000000000005', 'Tuntutan Masyarakat', 'tuntutan-masyarakat', 'Nasi & Makanan Utama', 5),
('cat-01000000-0000-0000-0000-000000000006', 'Sumber Protein', 'sumber-protein', 'Lauk Pauk & Pepes', 6),
('cat-01000000-0000-0000-0000-000000000007', 'Seger Adem', 'seger-adem', 'Minuman Tradisional & Dingin', 7),
('cat-01000000-0000-0000-0000-000000000008', 'Es Esan', 'es-esan', 'Minuman Tradisional & Dingin', 8),
('cat-01000000-0000-0000-0000-000000000009', 'Teh & Susu', 'teh-susu', 'Minuman Tradisional & Dingin', 9),
('cat-01000000-0000-0000-0000-000000000010', 'Jejamuan', 'jejamuan', 'Minuman Tradisional & Dingin', 10),
('cat-01000000-0000-0000-0000-000000000011', 'Kopi', 'kopi', 'Kopi & Cokelat', 11),
('cat-01000000-0000-0000-0000-000000000012', 'Jus 4 U', 'jus-4-u', 'Minuman Tradisional & Dingin', 12),
('cat-01000000-0000-0000-0000-000000000013', 'Satu Rasa Cukup', 'satu-rasa-cukup', 'Roti & Pisang Bakar', 13),
('cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Gurih', 'roti-bakar-gurih', 'Roti & Pisang Bakar', 14),
('cat-01000000-0000-0000-0000-000000000015', 'Dua Lebih Spesial', 'dua-lebih-spesial', 'Roti & Pisang Bakar', 15),
('cat-01000000-0000-0000-0000-000000000016', 'Pisang Bakar', 'pisang-bakar', 'Roti & Pisang Bakar', 16)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.menu_categories (id, name, sort_order) VALUES
('cat-01000000-0000-0000-0000-000000000001', 'Cemilan Cepuluh', 1),
('cat-01000000-0000-0000-0000-000000000002', 'Ber Pepes An', 2),
('cat-01000000-0000-0000-0000-000000000003', 'Emih - Emihan', 3),
('cat-01000000-0000-0000-0000-000000000004', 'Pemadam Kelaparan', 4),
('cat-01000000-0000-0000-0000-000000000005', 'Tuntutan Masyarakat', 5),
('cat-01000000-0000-0000-0000-000000000006', 'Sumber Protein', 6),
('cat-01000000-0000-0000-0000-000000000007', 'Seger Adem', 7),
('cat-01000000-0000-0000-0000-000000000008', 'Es Esan', 8),
('cat-01000000-0000-0000-0000-000000000009', 'Teh & Susu', 9),
('cat-01000000-0000-0000-0000-000000000010', 'Jejamuan', 10),
('cat-01000000-0000-0000-0000-000000000011', 'Kopi', 11),
('cat-01000000-0000-0000-0000-000000000012', 'Jus 4 U', 12),
('cat-01000000-0000-0000-0000-000000000013', 'Satu Rasa Cukup', 13),
('cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Gurih', 14),
('cat-01000000-0000-0000-0000-000000000015', 'Dua Lebih Spesial', 15),
('cat-01000000-0000-0000-0000-000000000016', 'Pisang Bakar', 16)
ON CONFLICT (name) DO NOTHING;

-- 4. 105 MENU ITEMS & PRODUCTS SEED
INSERT INTO public.products (id, category_id, name, slug, description, base_price, is_available, is_featured, sort_order) VALUES
('prod-0000-0000-0000-000000000001', 'cat-01000000-0000-0000-0000-000000000001', 'Sate Aci', 'sate-aci-1', 'Sate Vegetarian jadul pake bumbu kacang', 14000, TRUE, FALSE, 1),
('prod-0000-0000-0000-000000000002', 'cat-01000000-0000-0000-0000-000000000001', 'Tahu Cirawraw', 'tahu-cirawraw-2', 'Cemilan berbahan tahu, aci dan cabe rawit karena Garut adalah kota aci.', 15000, TRUE, FALSE, 2),
('prod-0000-0000-0000-000000000003', 'cat-01000000-0000-0000-0000-000000000001', 'Bakso Yang Ditukar', 'bakso-yang-ditukar-3', 'Bakso yang ditusuk terus dibakar, bosen dikuah terus mah', 20000, TRUE, FALSE, 3),
('prod-0000-0000-0000-000000000004', 'cat-01000000-0000-0000-0000-000000000001', 'Dimsum Ekonomis', 'dimsum-ekonomis-4', 'Dimsum ayam isi 5', 15000, TRUE, FALSE, 4),
('prod-0000-0000-0000-000000000005', 'cat-01000000-0000-0000-0000-000000000001', 'Dimsum Sejahtera', 'dimsum-sejahtera-5', 'Dimsum udang isi 3', 20000, TRUE, FALSE, 5),
('prod-0000-0000-0000-000000000006', 'cat-01000000-0000-0000-0000-000000000001', 'Pisang Kukus', 'pisang-kukus-6', 'Pisang tanduk yang dikukus, panas-panas dikasih cocolan gula palem', 17000, TRUE, FALSE, 6),
('prod-0000-0000-0000-000000000007', 'cat-01000000-0000-0000-0000-000000000001', 'Pisang Goreng', 'pisang-goreng-7', 'Pisang goreng SNI yang dikasih taburan gula palem', 20000, TRUE, FALSE, 7),
('prod-0000-0000-0000-000000000008', 'cat-01000000-0000-0000-0000-000000000001', 'Singkong Goreng', 'singkong-goreng-8', 'Singkong goreng kering renyah bikin nostalgia', 20000, TRUE, FALSE, 8),
('prod-0000-0000-0000-000000000009', 'cat-01000000-0000-0000-0000-000000000001', 'Kentang Sosis', 'kentang-sosis-9', 'Sosis dan kentang yang digoreng', 22000, TRUE, FALSE, 9),
('prod-0000-0000-0000-000000000010', 'cat-01000000-0000-0000-0000-000000000001', 'Ulen Upi', 'ulen-upi-10', 'Ketan goreng saus oncom, saudaranya tape uli kalo di Betawi', 22000, TRUE, FALSE, 10),
('prod-0000-0000-0000-000000000011', 'cat-01000000-0000-0000-0000-000000000001', 'Ketan Kinca', 'ketan-kinca-11', 'Nasi ketan dengan kelapa, lebih enak dibalur kinca (gula aren cair)', 24500, TRUE, TRUE, 11),
('prod-0000-0000-0000-000000000012', 'cat-01000000-0000-0000-0000-000000000001', 'Gorengan Darmaji', 'gorengan-darmaji-12', 'Literally makan lima gorengan bayarnya satu porsi aja', 17000, TRUE, FALSE, 12),
('prod-0000-0000-0000-000000000013', 'cat-01000000-0000-0000-0000-000000000001', 'Cireng Ayah Ojak', 'cireng-ayah-ojak-13', 'Cireng dengan bumbu uyah yang gurih dan rujak jadi satu', 17000, TRUE, FALSE, 13),
('prod-0000-0000-0000-000000000014', 'cat-01000000-0000-0000-0000-000000000001', 'Tahu Cabe Rewel', 'tahu-cabe-rewel-14', 'Tahu yang digoreng dan dibumbui cabe garam biar well', 22000, TRUE, TRUE, 14),
('prod-0000-0000-0000-000000000015', 'cat-01000000-0000-0000-0000-000000000001', 'Cireng Tahu Gejrot', 'cireng-tahu-gejrot-15', 'Kerjasama antara tahu dan cireng dibanjur kuah tahu gejrot. Gitu we enak!', 18000, TRUE, TRUE, 15),
('prod-0000-0000-0000-000000000016', 'cat-01000000-0000-0000-0000-000000000001', 'Pagordas', 'pagordas-16', 'Pangsit goreng mini, digalokeun jeung chili oil pedas gurih pereda janghead', 20000, TRUE, FALSE, 16),
('prod-0000-0000-0000-000000000017', 'cat-01000000-0000-0000-0000-000000000001', 'Lumpia Vietnam', 'lumpia-vietnam-17', 'Lumpia sayuran buat yang lagi diet cenah', 22000, TRUE, FALSE, 17),
('prod-0000-0000-0000-000000000018', 'cat-01000000-0000-0000-0000-000000000001', 'Tuangeun Bocil', 'tuangeun-bocil-18', 'Makanan anak - anak dengan isian nugget, sosis, sop, dan kentang/nasi (+7rb dapat Es coklat)', 25000, TRUE, TRUE, 18),
('prod-0000-0000-0000-000000000019', 'cat-01000000-0000-0000-0000-000000000002', 'Pepes Goreng Ayam Bule', 'pepes-goreng-ayam-bule-19', 'More or less pepesnya digoreng lagi', 39000, TRUE, FALSE, 19),
('prod-0000-0000-0000-000000000020', 'cat-01000000-0000-0000-0000-000000000002', 'Pepes Ayam Bule', 'pepes-ayam-bule-20', 'Which is ayam negeri yang dipepes', 39000, TRUE, FALSE, 20),
('prod-0000-0000-0000-000000000021', 'cat-01000000-0000-0000-0000-000000000002', 'Pepes Ayam Kampung', 'pepes-ayam-kampung-21', 'Literally ayam kampung yang dipepes', 48000, TRUE, FALSE, 21),
('prod-0000-0000-0000-000000000022', 'cat-01000000-0000-0000-0000-000000000002', 'Pepes Goreng Ayam Kampung', 'pepes-goreng-ayam-kampung-22', 'Setelah dipepes and then digoreng', 48000, TRUE, FALSE, 22),
('prod-0000-0000-0000-000000000023', 'cat-01000000-0000-0000-0000-000000000003', 'Mie Kasep', 'mie-kasep-23', 'Kasian atuh kalau disebut mie goreng wae', 24000, TRUE, TRUE, 23),
('prod-0000-0000-0000-000000000024', 'cat-01000000-0000-0000-0000-000000000003', 'Mie Racing', 'mie-racing-24', 'Mie kuah yang rasanya gurih dan kriminya balapan di lidah', 25000, TRUE, TRUE, 24),
('prod-0000-0000-0000-000000000025', 'cat-01000000-0000-0000-0000-000000000003', 'Mie Ebroh', 'mie-ebroh-25', 'Mie goreng bumbu sambal uleg yang pedesnya nendang, pake telor ceplok', 25000, TRUE, TRUE, 25),
('prod-0000-0000-0000-000000000026', 'cat-01000000-0000-0000-0000-000000000003', 'Mie Chili Oil', 'mie-chili-oil-26', 'Mie pedas dengan bumbu Chili Oil yang gurih, pake baso/pangsit goreng sesuai stock', 24000, TRUE, FALSE, 26),
('prod-0000-0000-0000-000000000027', 'cat-01000000-0000-0000-0000-000000000003', 'Mie Anak Sekolah', 'mie-anak-sekolah-27', 'Mie goreng bukan mie instant, tanpa MSG kan buat bocil', 27000, TRUE, TRUE, 27),
('prod-0000-0000-0000-000000000028', 'cat-01000000-0000-0000-0000-000000000003', 'Bihun Kuwah', 'bihun-kuwah-28', 'Bihun berkuah bening, pas untuk cuaca Garut yang dingin.', 29000, TRUE, FALSE, 28),
('prod-0000-0000-0000-000000000029', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Upiwan', 'nasi-goreng-upiwan-29', 'Nasi goreng kecap SNI', 25000, TRUE, FALSE, 29),
('prod-0000-0000-0000-000000000030', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Upiwati', 'nasi-goreng-upiwati-30', 'Semacam versi betina dari nasgor upiwan, Karena warnanya merah dari saus Ujung Pandang', 26000, TRUE, FALSE, 30),
('prod-0000-0000-0000-000000000031', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Cumi Upi', 'nasi-goreng-cumi-upi-31', 'Nasgor asin cumi dengan cabe hejo yang sedap dan pedas', 28000, TRUE, TRUE, 31),
('prod-0000-0000-0000-000000000032', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Bunda Kornet', 'nasi-goreng-bunda-kornet-32', 'Semacam nasi goreng dengan citarasa kornet yang gurih', 27000, TRUE, FALSE, 32),
('prod-0000-0000-0000-000000000033', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Peda Kemangi', 'nasi-goreng-peda-kemangi-33', 'Nasi goreng cita rasa kampung tapi selera metropolitan, ada petenya juga', 27000, TRUE, TRUE, 33),
('prod-0000-0000-0000-000000000034', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Omah', 'nasi-goreng-omah-34', 'Nasi goreng dengan rasa kunyit seperti dibuatin omah kita dulu.', 23000, TRUE, FALSE, 34),
('prod-0000-0000-0000-000000000035', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Kecombrang', 'nasi-goreng-kecombrang-35', 'Semacam nasi goreng dengan rasa kecombrang yang aromatic dan sedap.', 24000, TRUE, FALSE, 35),
('prod-0000-0000-0000-000000000036', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Galo Bumi Upi', 'nasi-galo-bumi-upi-36', 'Sejenis ricebowl tapi lebih meriah, ada nasi, beef, sambal bawang,dll. Omat makannya harus di-galoin (campur)', 39000, TRUE, TRUE, 36),
('prod-0000-0000-0000-000000000037', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Paru Serundeng', 'nasi-paru-serundeng-37', 'Nasi pake paru goreng, serundeng, lalapan, dan sambal.', 25000, TRUE, FALSE, 37),
('prod-0000-0000-0000-000000000038', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Dangdutan', 'nasi-dangdutan-38', 'Nasi lengkap dengan lauk semeriah dangdutan, mulai dari kulit goreng, paru goreng, telor dadar crispy, serundeng, lalapan, dan sambal.', 36000, TRUE, TRUE, 38),
('prod-0000-0000-0000-000000000039', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Buntut Rewel', 'nasi-buntut-rewel-39', 'Nasi dengan buntut sapi yang ditumis pedas supaya lebih well', 45000, TRUE, TRUE, 39),
('prod-0000-0000-0000-000000000040', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Buntut Kebakaran', 'nasi-buntut-kebakaran-40', 'Nasi dengan buntut bakar dan sop sayuran. Menu yang biasanya mahal di tiap restoran, memperesentasikan kasta kehidupan seseorang', 40000, TRUE, FALSE, 40),
('prod-0000-0000-0000-000000000041', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Ghewlaa', 'nasi-ghewlaa-41', 'Bacanya nasi gila ya, nasi dengan toping meriah (sosis,bakso,sayur)', 29000, TRUE, TRUE, 41),
('prod-0000-0000-0000-000000000042', 'cat-01000000-0000-0000-0000-000000000005', 'Lidah Sambel Hejo', 'lidah-sambel-hejo-42', 'Definisi lidah tidak bertulang tapi bersambal hejo, lengkap pakai nasi', 47000, TRUE, TRUE, 42),
('prod-0000-0000-0000-000000000043', 'cat-01000000-0000-0000-0000-000000000005', 'Buntut Goreng Sambal Hejo', 'buntut-goreng-sambal-hejo-43', 'Buntut Sapi dibumbui sedemikian rupa dibalur sambel hejo + nasi', 45000, TRUE, TRUE, 43),
('prod-0000-0000-0000-000000000044', 'cat-01000000-0000-0000-0000-000000000006', 'Nasi Ayam Ajep-Ajep', 'nasi-ayam-ajep-ajep-44', 'Nasi ayam jejepangan alias chicken karage', 24000, TRUE, FALSE, 44),
('prod-0000-0000-0000-000000000045', 'cat-01000000-0000-0000-0000-000000000006', 'Nasi Ayam Omongan Tetangga', 'nasi-ayam-omongan-tetangga-45', 'Nasi ayam yang dikasih minyak cabe pedas, sepedas omongan tetangga kamu', 24000, TRUE, FALSE, 45),
('prod-0000-0000-0000-000000000046', 'cat-01000000-0000-0000-0000-000000000006', 'Nasi Ayam Kalasan', 'nasi-ayam-kalasan-46', 'Nasi pake ayam goreng manis, lalapan, dan sambal', 32000, TRUE, FALSE, 46),
('prod-0000-0000-0000-000000000047', 'cat-01000000-0000-0000-0000-000000000006', 'Nasi Kulit Serundeng', 'nasi-kulit-serundeng-47', 'Nasi pake kulit goreng, serundeng, lalapan, dan sambal', 22000, TRUE, FALSE, 47),
('prod-0000-0000-0000-000000000048', 'cat-01000000-0000-0000-0000-000000000006', 'Bebek Sambel Hejo', 'bebek-sambel-hejo-48', 'Sepiring nasi dengan sebongkah bebek goreng plus sambel hejo, enak!', 45000, TRUE, TRUE, 48),
('prod-0000-0000-0000-000000000049', 'cat-01000000-0000-0000-0000-000000000007', 'Es Cincau Jadoel', 'es-cincau-jadoel-49', 'Es cincau hitam tradisional manis segar', 19000, TRUE, FALSE, 49),
('prod-0000-0000-0000-000000000050', 'cat-01000000-0000-0000-0000-000000000007', 'Es Limun', 'es-limun-50', 'Minuman soda limun segar nostalgia', 20000, TRUE, FALSE, 50),
('prod-0000-0000-0000-000000000051', 'cat-01000000-0000-0000-0000-000000000007', 'Es Soda Gembira', 'es-soda-gembira-51', 'Perpaduan soda, sirup merah, dan susu kental manis', 20000, TRUE, FALSE, 51),
('prod-0000-0000-0000-000000000052', 'cat-01000000-0000-0000-0000-000000000007', 'Es Cincau Hijau', 'es-cincau-hijau-52', 'Cincau hijau alami dengan kuah santan dan gula merah', 20000, TRUE, FALSE, 52),
('prod-0000-0000-0000-000000000053', 'cat-01000000-0000-0000-0000-000000000007', 'Es Jeruk / Jeruk Panas', 'es-jeruk-jeruk-panas-53', 'Perasan jeruk asli segar, pilihan dingin menyegarkan atau hangat melegakan', 18000, TRUE, FALSE, 53),
('prod-0000-0000-0000-000000000054', 'cat-01000000-0000-0000-0000-000000000007', 'Es Kelapa Muda', 'es-kelapa-muda-54', 'Air dan serutan daging kelapa muda segar murni', 10000, TRUE, FALSE, 54),
('prod-0000-0000-0000-000000000055', 'cat-01000000-0000-0000-0000-000000000007', 'Es Kelapa Jeruk', 'es-kelapa-jeruk-55', 'Kelapa muda berpadu dengan segarnya perasan jeruk asli', 12000, TRUE, FALSE, 55),
('prod-0000-0000-0000-000000000056', 'cat-01000000-0000-0000-0000-000000000007', 'Es Kelapa Nangka', 'es-kelapa-nangka-56', 'Kelapa muda dengan potongan buah nangka manis wangi harum', 18000, TRUE, FALSE, 56),
('prod-0000-0000-0000-000000000057', 'cat-01000000-0000-0000-0000-000000000007', 'Es Cendol', 'es-cendol-57', 'Cendol kenyal gurih santan dan legit gula aren asli', 18000, TRUE, FALSE, 57),
('prod-0000-0000-0000-000000000058', 'cat-01000000-0000-0000-0000-000000000008', 'Es Krim Bumi Upi', 'es-krim-bumi-upi-58', 'Es krim signature khas Bumi Upi dengan topping istimewa', 22000, TRUE, FALSE, 58),
('prod-0000-0000-0000-000000000059', 'cat-01000000-0000-0000-0000-000000000008', 'Es ABC', 'es-abc-59', 'Es campur meriah khas Bumi Upi (Air Batu Campur)', 28000, TRUE, FALSE, 59),
('prod-0000-0000-0000-000000000060', 'cat-01000000-0000-0000-0000-000000000008', 'Es Teller', 'es-teller-60', 'Alpukat, kelapa muda, nangka dengan kuah santan manis creamy', 30000, TRUE, FALSE, 60),
('prod-0000-0000-0000-000000000061', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Tawar Jumbo', 'teh-tawar-jumbo-61', 'Teh seduh porsi jumbo tanpa gula', 18000, TRUE, FALSE, 61),
('prod-0000-0000-0000-000000000062', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Manis Jumbo', 'teh-manis-jumbo-62', 'Teh seduh porsi jumbo dengan gula tebu asli', 22000, TRUE, FALSE, 62),
('prod-0000-0000-0000-000000000063', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Manis', 'teh-manis-63', 'Teh seduh klasik wangi melati dengan manis seimbang', 13000, TRUE, FALSE, 63),
('prod-0000-0000-0000-000000000064', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Lemon', 'teh-lemon-64', 'Teh seduh segar dipadukan dengan perasan irisan lemon', 20000, TRUE, FALSE, 64),
('prod-0000-0000-0000-000000000065', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Sereh', 'teh-sereh-65', 'Seduhan teh hangat dengan batang sereh wangi menenangkan', 17000, TRUE, FALSE, 65),
('prod-0000-0000-0000-000000000066', 'cat-01000000-0000-0000-0000-000000000009', 'Es Cokelat Malt Dinosaurus', 'es-cokelat-malt-dinosaurus-66', 'Cokelat malt pekat dingin dengan taburan bubuk melimpah', 20000, TRUE, FALSE, 66),
('prod-0000-0000-0000-000000000067', 'cat-01000000-0000-0000-0000-000000000009', 'Cokelat Malt Panas', 'cokelat-malt-panas-67', 'Cokelat malt hangat kental nikmat khas Bumi Upi', 20000, TRUE, FALSE, 67),
('prod-0000-0000-0000-000000000068', 'cat-01000000-0000-0000-0000-000000000009', 'Es Goyobod Alun - Alun', 'es-goyobod-alun-alun-68', 'Es goyobod hunkwe khas Garut / Priangan dengan santan gurih', 18000, TRUE, FALSE, 68),
('prod-0000-0000-0000-000000000069', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Susu Tolak Angin', 'teh-susu-tolak-angin-69', 'Perpaduan teh susu berkhasiat herbal tolak angin', 23000, TRUE, FALSE, 69),
('prod-0000-0000-0000-000000000070', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Tarik', 'teh-tarik-70', 'Teh tarik berbusa lembut creamy khas Melayu Nusantara', 20000, TRUE, FALSE, 70),
('prod-0000-0000-0000-000000000071', 'cat-01000000-0000-0000-0000-000000000010', 'Es Beras Kencur', 'es-beras-kencur-71', 'Minuman herbal beras kencur segar kaya manfaat stamina', 18000, TRUE, FALSE, 71),
('prod-0000-0000-0000-000000000072', 'cat-01000000-0000-0000-0000-000000000010', 'Es Kunyit Asem', 'es-kunyit-asem-72', 'Seduhan rimpang kunyit dan asam jawa dingin menyegarkan dahaga', 18000, TRUE, FALSE, 72),
('prod-0000-0000-0000-000000000073', 'cat-01000000-0000-0000-0000-000000000010', 'Es Beras Kencur Jeruk', 'es-beras-kencur-jeruk-73', 'Beras kencur tradisional ditambah perasan jeruk segar', 20000, TRUE, FALSE, 73),
('prod-0000-0000-0000-000000000074', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Hitam', 'kopi-hitam-74', 'Seduhan kopi hitam klasik mantap khas Bumi Upi', 17000, TRUE, FALSE, 74),
('prod-0000-0000-0000-000000000075', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Susu', 'kopi-susu-75', 'Kopi susu gula aren gurih legit bersahabat', 22000, TRUE, FALSE, 75),
('prod-0000-0000-0000-000000000076', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Susu Butter', 'kopi-susu-butter-76', 'Kopi susu panas dengan lelehan butter gurih aromatik', 22000, TRUE, FALSE, 76),
('prod-0000-0000-0000-000000000077', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Susu Santan', 'kopi-susu-santan-77', 'Kopi dipadu gurihnya santan segar alami', 23000, TRUE, FALSE, 77),
('prod-0000-0000-0000-000000000078', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Susu Kecap', 'kopi-susu-kecap-78', 'Racikan unik kopi susu dengan sentuhan kecap manis karamelisasi', 22000, TRUE, FALSE, 78),
('prod-0000-0000-0000-000000000079', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Krim Soda', 'kopi-krim-soda-79', 'Espresso kopi berpadu soda berkarbonasi dan krim vanilla', 23000, TRUE, FALSE, 79),
('prod-0000-0000-0000-000000000080', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Tomat', 'jus-tomat-80', 'Jus tomat segar kaya vitamin dan antioksidan', 17000, TRUE, FALSE, 80),
('prod-0000-0000-0000-000000000081', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Sirsak', 'jus-sirsak-81', 'Jus sirsak asam manis menyegarkan tenggorokan', 18000, TRUE, FALSE, 81),
('prod-0000-0000-0000-000000000082', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Semangka', 'jus-semangka-82', 'Jus buah semangka merah manis alami penghilang dahaga', 20000, TRUE, FALSE, 82),
('prod-0000-0000-0000-000000000083', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Mangga', 'jus-mangga-83', 'Jus mangga harum manis kental legit', 25000, TRUE, FALSE, 83),
('prod-0000-0000-0000-000000000084', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Alpukat', 'jus-alpukat-84', 'Jus alpukat mentega Garut kental dengan lelehan susu kental cokelat', 25000, TRUE, FALSE, 84),
('prod-0000-0000-0000-000000000085', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Tape', 'jus-tape-85', 'Jus olahan tape peuyeum manis legit aromatik khas Priangan', 20000, TRUE, FALSE, 85),
('prod-0000-0000-0000-000000000086', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Stroberi', 'jus-stroberi-86', 'Jus buah stroberi segar asam manis segar', 24000, TRUE, FALSE, 86),
('prod-0000-0000-0000-000000000087', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Jambu', 'jus-jambu-87', 'Jus jambu biji merah segar kaya vitamin C', 20000, TRUE, FALSE, 87),
('prod-0000-0000-0000-000000000088', 'cat-01000000-0000-0000-0000-000000000013', 'Roti Bakar Cokelat', 'roti-bakar-cokelat-88', 'Roti bakar empuk dengan selai dan meses cokelat manis', 18000, TRUE, FALSE, 88),
('prod-0000-0000-0000-000000000089', 'cat-01000000-0000-0000-0000-000000000013', 'Roti Bakar Keju', 'roti-bakar-keju-89', 'Roti bakar dengan limpahan keju cheddar parut dan susu manis', 20000, TRUE, FALSE, 89),
('prod-0000-0000-0000-000000000090', 'cat-01000000-0000-0000-0000-000000000013', 'Roti Bakar Gula Klasik', 'roti-bakar-gula-klasik-90', 'Roti bakar renyah mentega dan taburan gula pasir tempo doeloe', 15000, TRUE, FALSE, 90),
('prod-0000-0000-0000-000000000091', 'cat-01000000-0000-0000-0000-000000000013', 'Roti Bakar Nanas', 'roti-bakar-nanas-91', 'Roti bakar selai nanas segar manis asam khas rumah nenek', 18000, TRUE, FALSE, 91),
('prod-0000-0000-0000-000000000092', 'cat-01000000-0000-0000-0000-000000000013', 'Roti Bakar Srikaya', 'roti-bakar-srikaya-92', 'Roti bakar olesan selai srikaya harum pandan legit', 18000, TRUE, FALSE, 92),
('prod-0000-0000-0000-000000000093', 'cat-01000000-0000-0000-0000-000000000013', 'Burger Gulai Upi', 'burger-gulai-upi-93', 'Burger roti bakar unik dengan isian daging bumbu gulai khas Bumi Upi', 30000, TRUE, FALSE, 93),
('prod-0000-0000-0000-000000000094', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Telur', 'roti-bakar-telur-94', 'Roti bakar isi telur dadar bumbu gurih hangat', 20000, TRUE, FALSE, 94),
('prod-0000-0000-0000-000000000095', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Telur Keju', 'roti-bakar-telur-keju-95', 'Roti bakar gurih telur dadar berpadu keju leleh', 23000, TRUE, FALSE, 95),
('prod-0000-0000-0000-000000000096', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Kornet', 'roti-bakar-kornet-96', 'Roti bakar dengan tumisan kornet sapi gurih sedap', 20000, TRUE, FALSE, 96),
('prod-0000-0000-0000-000000000097', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Kornet Telur Keju', 'roti-bakar-kornet-telur-keju-97', 'Roti bakar komplit isi kornet sapi, telur dadar, dan keju melimpah', 26000, TRUE, FALSE, 97),
('prod-0000-0000-0000-000000000098', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Kornet Telur', 'roti-bakar-kornet-telur-98', 'Roti bakar kombinasi kornet sapi dan telur dadar gurih', 24000, TRUE, FALSE, 98),
('prod-0000-0000-0000-000000000099', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Kornet Keju', 'roti-bakar-kornet-keju-99', 'Roti bakar kornet sapi gurih dengan lelehan keju', 24000, TRUE, FALSE, 99),
('prod-0000-0000-0000-000000000100', 'cat-01000000-0000-0000-0000-000000000015', 'Roti Bakar 2 rasa', 'roti-bakar-2-rasa-100', 'Roti bakar dengan kombinasi bebas 2 varian rasa pilihan', 21000, TRUE, FALSE, 100),
('prod-0000-0000-0000-000000000101', 'cat-01000000-0000-0000-0000-000000000015', 'Roti Bakar Mocca nougat', 'roti-bakar-mocca-nougat-101', 'Roti bakar aroma kopi mocca dengan taburan kacang nougat renyah', 21000, TRUE, FALSE, 101),
('prod-0000-0000-0000-000000000102', 'cat-01000000-0000-0000-0000-000000000016', 'Pisang Bakar Cokelat', 'pisang-bakar-cokelat-102', 'Pisang kepok panggang manis dengan saus dan meses cokelat', 20000, TRUE, FALSE, 102),
('prod-0000-0000-0000-000000000103', 'cat-01000000-0000-0000-0000-000000000016', 'Pisang Bakar Keju', 'pisang-bakar-keju-103', 'Pisang panggang harum bertabur keju parut gurih dan susu kental manis', 21000, TRUE, FALSE, 103),
('prod-0000-0000-0000-000000000104', 'cat-01000000-0000-0000-0000-000000000016', 'Pisang Bakar Cokelat Keju', 'pisang-bakar-cokelat-keju-104', 'Kombinasi klasik pisang panggang cokelat dan keju lezat', 23000, TRUE, FALSE, 104),
('prod-0000-0000-0000-000000000105', 'cat-01000000-0000-0000-0000-000000000016', 'Pisang Bakar Double Cokelat', 'pisang-bakar-double-cokelat-105', 'Pisang bakar dengan lumuran cokelat ekstra ganda pekat legit', 23000, TRUE, FALSE, 105)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.menu_items (id, category_id, name, description, price, is_available, is_featured, variants, temperatures, tags, sort_order) VALUES
('prod-0000-0000-0000-000000000001', 'cat-01000000-0000-0000-0000-000000000001', 'Sate Aci', 'Sate Vegetarian jadul pake bumbu kacang', 14000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 1),
('prod-0000-0000-0000-000000000002', 'cat-01000000-0000-0000-0000-000000000001', 'Tahu Cirawraw', 'Cemilan berbahan tahu, aci dan cabe rawit karena Garut adalah kota aci.', 15000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 2),
('prod-0000-0000-0000-000000000003', 'cat-01000000-0000-0000-0000-000000000001', 'Bakso Yang Ditukar', 'Bakso yang ditusuk terus dibakar, bosen dikuah terus mah', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 3),
('prod-0000-0000-0000-000000000004', 'cat-01000000-0000-0000-0000-000000000001', 'Dimsum Ekonomis', 'Dimsum ayam isi 5', 15000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 4),
('prod-0000-0000-0000-000000000005', 'cat-01000000-0000-0000-0000-000000000001', 'Dimsum Sejahtera', 'Dimsum udang isi 3', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 5),
('prod-0000-0000-0000-000000000006', 'cat-01000000-0000-0000-0000-000000000001', 'Pisang Kukus', 'Pisang tanduk yang dikukus, panas-panas dikasih cocolan gula palem', 17000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 6),
('prod-0000-0000-0000-000000000007', 'cat-01000000-0000-0000-0000-000000000001', 'Pisang Goreng', 'Pisang goreng SNI yang dikasih taburan gula palem', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 7),
('prod-0000-0000-0000-000000000008', 'cat-01000000-0000-0000-0000-000000000001', 'Singkong Goreng', 'Singkong goreng kering renyah bikin nostalgia', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 8),
('prod-0000-0000-0000-000000000009', 'cat-01000000-0000-0000-0000-000000000001', 'Kentang Sosis', 'Sosis dan kentang yang digoreng', 22000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 9),
('prod-0000-0000-0000-000000000010', 'cat-01000000-0000-0000-0000-000000000001', 'Ulen Upi', 'Ketan goreng saus oncom, saudaranya tape uli kalo di Betawi', 22000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 10),
('prod-0000-0000-0000-000000000011', 'cat-01000000-0000-0000-0000-000000000001', 'Ketan Kinca', 'Nasi ketan dengan kelapa, lebih enak dibalur kinca (gula aren cair)', 24500, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Rekomendasi'], 11),
('prod-0000-0000-0000-000000000012', 'cat-01000000-0000-0000-0000-000000000001', 'Gorengan Darmaji', 'Literally makan lima gorengan bayarnya satu porsi aja', 17000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 12),
('prod-0000-0000-0000-000000000013', 'cat-01000000-0000-0000-0000-000000000001', 'Cireng Ayah Ojak', 'Cireng dengan bumbu uyah yang gurih dan rujak jadi satu', 17000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 13),
('prod-0000-0000-0000-000000000014', 'cat-01000000-0000-0000-0000-000000000001', 'Tahu Cabe Rewel', 'Tahu yang digoreng dan dibumbui cabe garam biar well', 22000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Pedas'], 14),
('prod-0000-0000-0000-000000000015', 'cat-01000000-0000-0000-0000-000000000001', 'Cireng Tahu Gejrot', 'Kerjasama antara tahu dan cireng dibanjur kuah tahu gejrot. Gitu we enak!', 18000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Favorit','Pedas'], 15),
('prod-0000-0000-0000-000000000016', 'cat-01000000-0000-0000-0000-000000000001', 'Pagordas', 'Pangsit goreng mini, digalokeun jeung chili oil pedas gurih pereda janghead', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 16),
('prod-0000-0000-0000-000000000017', 'cat-01000000-0000-0000-0000-000000000001', 'Lumpia Vietnam', 'Lumpia sayuran buat yang lagi diet cenah', 22000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 17),
('prod-0000-0000-0000-000000000018', 'cat-01000000-0000-0000-0000-000000000001', 'Tuangeun Bocil', 'Makanan anak - anak dengan isian nugget, sosis, sop, dan kentang/nasi (+7rb dapat Es coklat)', 25000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Untuk Anak','Rekomendasi'], 18),
('prod-0000-0000-0000-000000000019', 'cat-01000000-0000-0000-0000-000000000002', 'Pepes Goreng Ayam Bule', 'More or less pepesnya digoreng lagi', 39000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 19),
('prod-0000-0000-0000-000000000020', 'cat-01000000-0000-0000-0000-000000000002', 'Pepes Ayam Bule', 'Which is ayam negeri yang dipepes', 39000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 20),
('prod-0000-0000-0000-000000000021', 'cat-01000000-0000-0000-0000-000000000002', 'Pepes Ayam Kampung', 'Literally ayam kampung yang dipepes', 48000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 21),
('prod-0000-0000-0000-000000000022', 'cat-01000000-0000-0000-0000-000000000002', 'Pepes Goreng Ayam Kampung', 'Setelah dipepes and then digoreng', 48000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 22),
('prod-0000-0000-0000-000000000023', 'cat-01000000-0000-0000-0000-000000000003', 'Mie Kasep', 'Kasian atuh kalau disebut mie goreng wae', 24000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Rekomendasi'], 23),
('prod-0000-0000-0000-000000000024', 'cat-01000000-0000-0000-0000-000000000003', 'Mie Racing', 'Mie kuah yang rasanya gurih dan kriminya balapan di lidah', 25000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Rekomendasi'], 24),
('prod-0000-0000-0000-000000000025', 'cat-01000000-0000-0000-0000-000000000003', 'Mie Ebroh', 'Mie goreng bumbu sambal uleg yang pedesnya nendang, pake telor ceplok', 25000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Pedas'], 25),
('prod-0000-0000-0000-000000000026', 'cat-01000000-0000-0000-0000-000000000003', 'Mie Chili Oil', 'Mie pedas dengan bumbu Chili Oil yang gurih, pake baso/pangsit goreng sesuai stock', 24000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 26),
('prod-0000-0000-0000-000000000027', 'cat-01000000-0000-0000-0000-000000000003', 'Mie Anak Sekolah', 'Mie goreng bukan mie instant, tanpa MSG kan buat bocil', 27000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Untuk Anak','Rekomendasi'], 27),
('prod-0000-0000-0000-000000000028', 'cat-01000000-0000-0000-0000-000000000003', 'Bihun Kuwah', 'Bihun berkuah bening, pas untuk cuaca Garut yang dingin.', 29000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 28),
('prod-0000-0000-0000-000000000029', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Upiwan', 'Nasi goreng kecap SNI', 25000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 29),
('prod-0000-0000-0000-000000000030', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Upiwati', 'Semacam versi betina dari nasgor upiwan, Karena warnanya merah dari saus Ujung Pandang', 26000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 30),
('prod-0000-0000-0000-000000000031', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Cumi Upi', 'Nasgor asin cumi dengan cabe hejo yang sedap dan pedas', 28000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Favorit','Pedas'], 31),
('prod-0000-0000-0000-000000000032', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Bunda Kornet', 'Semacam nasi goreng dengan citarasa kornet yang gurih', 27000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 32),
('prod-0000-0000-0000-000000000033', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Peda Kemangi', 'Nasi goreng cita rasa kampung tapi selera metropolitan, ada petenya juga', 27000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Favorit','Pedas'], 33),
('prod-0000-0000-0000-000000000034', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Omah', 'Nasi goreng dengan rasa kunyit seperti dibuatin omah kita dulu.', 23000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 34),
('prod-0000-0000-0000-000000000035', 'cat-01000000-0000-0000-0000-000000000004', 'Nasi Goreng Kecombrang', 'Semacam nasi goreng dengan rasa kecombrang yang aromatic dan sedap.', 24000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 35),
('prod-0000-0000-0000-000000000036', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Galo Bumi Upi', 'Sejenis ricebowl tapi lebih meriah, ada nasi, beef, sambal bawang,dll. Omat makannya harus di-galoin (campur)', 39000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Favorit','Pedas'], 36),
('prod-0000-0000-0000-000000000037', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Paru Serundeng', 'Nasi pake paru goreng, serundeng, lalapan, dan sambal.', 25000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 37),
('prod-0000-0000-0000-000000000038', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Dangdutan', 'Nasi lengkap dengan lauk semeriah dangdutan, mulai dari kulit goreng, paru goreng, telor dadar crispy, serundeng, lalapan, dan sambal.', 36000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Favorit','Pedas'], 38),
('prod-0000-0000-0000-000000000039', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Buntut Rewel', 'Nasi dengan buntut sapi yang ditumis pedas supaya lebih well', 45000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Pedas'], 39),
('prod-0000-0000-0000-000000000040', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Buntut Kebakaran', 'Nasi dengan buntut bakar dan sop sayuran. Menu yang biasanya mahal di tiap restoran, memperesentasikan kasta kehidupan seseorang', 40000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 40),
('prod-0000-0000-0000-000000000041', 'cat-01000000-0000-0000-0000-000000000005', 'Nasi Ghewlaa', 'Bacanya nasi gila ya, nasi dengan toping meriah (sosis,bakso,sayur)', 29000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Rekomendasi'], 41),
('prod-0000-0000-0000-000000000042', 'cat-01000000-0000-0000-0000-000000000005', 'Lidah Sambel Hejo', 'Definisi lidah tidak bertulang tapi bersambal hejo, lengkap pakai nasi', 47000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Rekomendasi'], 42),
('prod-0000-0000-0000-000000000043', 'cat-01000000-0000-0000-0000-000000000005', 'Buntut Goreng Sambal Hejo', 'Buntut Sapi dibumbui sedemikian rupa dibalur sambel hejo + nasi', 45000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Rekomendasi'], 43),
('prod-0000-0000-0000-000000000044', 'cat-01000000-0000-0000-0000-000000000006', 'Nasi Ayam Ajep-Ajep', 'Nasi ayam jejepangan alias chicken karage', 24000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 44),
('prod-0000-0000-0000-000000000045', 'cat-01000000-0000-0000-0000-000000000006', 'Nasi Ayam Omongan Tetangga', 'Nasi ayam yang dikasih minyak cabe pedas, sepedas omongan tetangga kamu', 24000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 45),
('prod-0000-0000-0000-000000000046', 'cat-01000000-0000-0000-0000-000000000006', 'Nasi Ayam Kalasan', 'Nasi pake ayam goreng manis, lalapan, dan sambal', 32000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 46),
('prod-0000-0000-0000-000000000047', 'cat-01000000-0000-0000-0000-000000000006', 'Nasi Kulit Serundeng', 'Nasi pake kulit goreng, serundeng, lalapan, dan sambal', 22000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 47),
('prod-0000-0000-0000-000000000048', 'cat-01000000-0000-0000-0000-000000000006', 'Bebek Sambel Hejo', 'Sepiring nasi dengan sebongkah bebek goreng plus sambel hejo, enak!', 45000, TRUE, TRUE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY['Rekomendasi'], 48),
('prod-0000-0000-0000-000000000049', 'cat-01000000-0000-0000-0000-000000000007', 'Es Cincau Jadoel', 'Es cincau hitam tradisional manis segar', 19000, TRUE, FALSE, '{"sizeM":19000,"sizeL":24000}'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 49),
('prod-0000-0000-0000-000000000050', 'cat-01000000-0000-0000-0000-000000000007', 'Es Limun', 'Minuman soda limun segar nostalgia', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 50),
('prod-0000-0000-0000-000000000051', 'cat-01000000-0000-0000-0000-000000000007', 'Es Soda Gembira', 'Perpaduan soda, sirup merah, dan susu kental manis', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 51),
('prod-0000-0000-0000-000000000052', 'cat-01000000-0000-0000-0000-000000000007', 'Es Cincau Hijau', 'Cincau hijau alami dengan kuah santan dan gula merah', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 52),
('prod-0000-0000-0000-000000000053', 'cat-01000000-0000-0000-0000-000000000007', 'Es Jeruk / Jeruk Panas', 'Perasan jeruk asli segar, pilihan dingin menyegarkan atau hangat melegakan', 18000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin','panas'], ARRAY[]::TEXT[], 53),
('prod-0000-0000-0000-000000000054', 'cat-01000000-0000-0000-0000-000000000007', 'Es Kelapa Muda', 'Air dan serutan daging kelapa muda segar murni', 10000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 54),
('prod-0000-0000-0000-000000000055', 'cat-01000000-0000-0000-0000-000000000007', 'Es Kelapa Jeruk', 'Kelapa muda berpadu dengan segarnya perasan jeruk asli', 12000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 55),
('prod-0000-0000-0000-000000000056', 'cat-01000000-0000-0000-0000-000000000007', 'Es Kelapa Nangka', 'Kelapa muda dengan potongan buah nangka manis wangi harum', 18000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 56),
('prod-0000-0000-0000-000000000057', 'cat-01000000-0000-0000-0000-000000000007', 'Es Cendol', 'Cendol kenyal gurih santan dan legit gula aren asli', 18000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 57),
('prod-0000-0000-0000-000000000058', 'cat-01000000-0000-0000-0000-000000000008', 'Es Krim Bumi Upi', 'Es krim signature khas Bumi Upi dengan topping istimewa', 22000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 58),
('prod-0000-0000-0000-000000000059', 'cat-01000000-0000-0000-0000-000000000008', 'Es ABC', 'Es campur meriah khas Bumi Upi (Air Batu Campur)', 28000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 59),
('prod-0000-0000-0000-000000000060', 'cat-01000000-0000-0000-0000-000000000008', 'Es Teller', 'Alpukat, kelapa muda, nangka dengan kuah santan manis creamy', 30000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 60),
('prod-0000-0000-0000-000000000061', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Tawar Jumbo', 'Teh seduh porsi jumbo tanpa gula', 18000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin','panas'], ARRAY[]::TEXT[], 61),
('prod-0000-0000-0000-000000000062', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Manis Jumbo', 'Teh seduh porsi jumbo dengan gula tebu asli', 22000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin','panas'], ARRAY[]::TEXT[], 62),
('prod-0000-0000-0000-000000000063', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Manis', 'Teh seduh klasik wangi melati dengan manis seimbang', 13000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin','panas'], ARRAY[]::TEXT[], 63),
('prod-0000-0000-0000-000000000064', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Lemon', 'Teh seduh segar dipadukan dengan perasan irisan lemon', 20000, TRUE, FALSE, '{"sizeM":20000,"sizeL":25000}'::JSONB, ARRAY['dingin','panas'], ARRAY[]::TEXT[], 64),
('prod-0000-0000-0000-000000000065', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Sereh', 'Seduhan teh hangat dengan batang sereh wangi menenangkan', 17000, TRUE, FALSE, '[]'::JSONB, ARRAY['panas'], ARRAY[]::TEXT[], 65),
('prod-0000-0000-0000-000000000066', 'cat-01000000-0000-0000-0000-000000000009', 'Es Cokelat Malt Dinosaurus', 'Cokelat malt pekat dingin dengan taburan bubuk melimpah', 20000, TRUE, FALSE, '{"sizeM":20000,"sizeL":25000}'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 66),
('prod-0000-0000-0000-000000000067', 'cat-01000000-0000-0000-0000-000000000009', 'Cokelat Malt Panas', 'Cokelat malt hangat kental nikmat khas Bumi Upi', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY['panas'], ARRAY[]::TEXT[], 67),
('prod-0000-0000-0000-000000000068', 'cat-01000000-0000-0000-0000-000000000009', 'Es Goyobod Alun - Alun', 'Es goyobod hunkwe khas Garut / Priangan dengan santan gurih', 18000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 68),
('prod-0000-0000-0000-000000000069', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Susu Tolak Angin', 'Perpaduan teh susu berkhasiat herbal tolak angin', 23000, TRUE, FALSE, '{"sizeM":23000,"sizeL":25000}'::JSONB, ARRAY['dingin','panas'], ARRAY[]::TEXT[], 69),
('prod-0000-0000-0000-000000000070', 'cat-01000000-0000-0000-0000-000000000009', 'Teh Tarik', 'Teh tarik berbusa lembut creamy khas Melayu Nusantara', 20000, TRUE, FALSE, '{"sizeM":20000,"sizeL":25000}'::JSONB, ARRAY['dingin','panas'], ARRAY[]::TEXT[], 70),
('prod-0000-0000-0000-000000000071', 'cat-01000000-0000-0000-0000-000000000010', 'Es Beras Kencur', 'Minuman herbal beras kencur segar kaya manfaat stamina', 18000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 71),
('prod-0000-0000-0000-000000000072', 'cat-01000000-0000-0000-0000-000000000010', 'Es Kunyit Asem', 'Seduhan rimpang kunyit dan asam jawa dingin menyegarkan dahaga', 18000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 72),
('prod-0000-0000-0000-000000000073', 'cat-01000000-0000-0000-0000-000000000010', 'Es Beras Kencur Jeruk', 'Beras kencur tradisional ditambah perasan jeruk segar', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 73),
('prod-0000-0000-0000-000000000074', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Hitam', 'Seduhan kopi hitam klasik mantap khas Bumi Upi', 17000, TRUE, FALSE, '{"sizeM":17000,"sizeL":22000}'::JSONB, ARRAY['dingin','panas'], ARRAY[]::TEXT[], 74),
('prod-0000-0000-0000-000000000075', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Susu', 'Kopi susu gula aren gurih legit bersahabat', 22000, TRUE, FALSE, '{"sizeM":22000,"sizeL":27000}'::JSONB, ARRAY['dingin','panas'], ARRAY[]::TEXT[], 75),
('prod-0000-0000-0000-000000000076', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Susu Butter', 'Kopi susu panas dengan lelehan butter gurih aromatik', 22000, TRUE, FALSE, '[]'::JSONB, ARRAY['panas'], ARRAY[]::TEXT[], 76),
('prod-0000-0000-0000-000000000077', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Susu Santan', 'Kopi dipadu gurihnya santan segar alami', 23000, TRUE, FALSE, '{"sizeM":23000,"sizeL":27000}'::JSONB, ARRAY['dingin','panas'], ARRAY[]::TEXT[], 77),
('prod-0000-0000-0000-000000000078', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Susu Kecap', 'Racikan unik kopi susu dengan sentuhan kecap manis karamelisasi', 22000, TRUE, FALSE, '{"sizeM":22000,"sizeL":27000}'::JSONB, ARRAY['dingin','panas'], ARRAY[]::TEXT[], 78),
('prod-0000-0000-0000-000000000079', 'cat-01000000-0000-0000-0000-000000000011', 'Kopi Krim Soda', 'Espresso kopi berpadu soda berkarbonasi dan krim vanilla', 23000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 79),
('prod-0000-0000-0000-000000000080', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Tomat', 'Jus tomat segar kaya vitamin dan antioksidan', 17000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 80),
('prod-0000-0000-0000-000000000081', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Sirsak', 'Jus sirsak asam manis menyegarkan tenggorokan', 18000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 81),
('prod-0000-0000-0000-000000000082', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Semangka', 'Jus buah semangka merah manis alami penghilang dahaga', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 82),
('prod-0000-0000-0000-000000000083', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Mangga', 'Jus mangga harum manis kental legit', 25000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 83),
('prod-0000-0000-0000-000000000084', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Alpukat', 'Jus alpukat mentega Garut kental dengan lelehan susu kental cokelat', 25000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 84),
('prod-0000-0000-0000-000000000085', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Tape', 'Jus olahan tape peuyeum manis legit aromatik khas Priangan', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 85),
('prod-0000-0000-0000-000000000086', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Stroberi', 'Jus buah stroberi segar asam manis segar', 24000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 86),
('prod-0000-0000-0000-000000000087', 'cat-01000000-0000-0000-0000-000000000012', 'Jus Jambu', 'Jus jambu biji merah segar kaya vitamin C', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY['dingin'], ARRAY[]::TEXT[], 87),
('prod-0000-0000-0000-000000000088', 'cat-01000000-0000-0000-0000-000000000013', 'Roti Bakar Cokelat', 'Roti bakar empuk dengan selai dan meses cokelat manis', 18000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 88),
('prod-0000-0000-0000-000000000089', 'cat-01000000-0000-0000-0000-000000000013', 'Roti Bakar Keju', 'Roti bakar dengan limpahan keju cheddar parut dan susu manis', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 89),
('prod-0000-0000-0000-000000000090', 'cat-01000000-0000-0000-0000-000000000013', 'Roti Bakar Gula Klasik', 'Roti bakar renyah mentega dan taburan gula pasir tempo doeloe', 15000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 90),
('prod-0000-0000-0000-000000000091', 'cat-01000000-0000-0000-0000-000000000013', 'Roti Bakar Nanas', 'Roti bakar selai nanas segar manis asam khas rumah nenek', 18000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 91),
('prod-0000-0000-0000-000000000092', 'cat-01000000-0000-0000-0000-000000000013', 'Roti Bakar Srikaya', 'Roti bakar olesan selai srikaya harum pandan legit', 18000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 92),
('prod-0000-0000-0000-000000000093', 'cat-01000000-0000-0000-0000-000000000013', 'Burger Gulai Upi', 'Burger roti bakar unik dengan isian daging bumbu gulai khas Bumi Upi', 30000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 93),
('prod-0000-0000-0000-000000000094', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Telur', 'Roti bakar isi telur dadar bumbu gurih hangat', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 94),
('prod-0000-0000-0000-000000000095', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Telur Keju', 'Roti bakar gurih telur dadar berpadu keju leleh', 23000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 95),
('prod-0000-0000-0000-000000000096', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Kornet', 'Roti bakar dengan tumisan kornet sapi gurih sedap', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 96),
('prod-0000-0000-0000-000000000097', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Kornet Telur Keju', 'Roti bakar komplit isi kornet sapi, telur dadar, dan keju melimpah', 26000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 97),
('prod-0000-0000-0000-000000000098', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Kornet Telur', 'Roti bakar kombinasi kornet sapi dan telur dadar gurih', 24000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 98),
('prod-0000-0000-0000-000000000099', 'cat-01000000-0000-0000-0000-000000000014', 'Roti Bakar Kornet Keju', 'Roti bakar kornet sapi gurih dengan lelehan keju', 24000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 99),
('prod-0000-0000-0000-000000000100', 'cat-01000000-0000-0000-0000-000000000015', 'Roti Bakar 2 rasa', 'Roti bakar dengan kombinasi bebas 2 varian rasa pilihan', 21000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 100),
('prod-0000-0000-0000-000000000101', 'cat-01000000-0000-0000-0000-000000000015', 'Roti Bakar Mocca nougat', 'Roti bakar aroma kopi mocca dengan taburan kacang nougat renyah', 21000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 101),
('prod-0000-0000-0000-000000000102', 'cat-01000000-0000-0000-0000-000000000016', 'Pisang Bakar Cokelat', 'Pisang kepok panggang manis dengan saus dan meses cokelat', 20000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 102),
('prod-0000-0000-0000-000000000103', 'cat-01000000-0000-0000-0000-000000000016', 'Pisang Bakar Keju', 'Pisang panggang harum bertabur keju parut gurih dan susu kental manis', 21000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 103),
('prod-0000-0000-0000-000000000104', 'cat-01000000-0000-0000-0000-000000000016', 'Pisang Bakar Cokelat Keju', 'Kombinasi klasik pisang panggang cokelat dan keju lezat', 23000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 104),
('prod-0000-0000-0000-000000000105', 'cat-01000000-0000-0000-0000-000000000016', 'Pisang Bakar Double Cokelat', 'Pisang bakar dengan lumuran cokelat ekstra ganda pekat legit', 23000, TRUE, FALSE, '[]'::JSONB, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 105)
ON CONFLICT (id) DO NOTHING;

-- 5. PRODUCT VARIANTS (Size M/L and Temperature Panas/Dingin)
INSERT INTO public.product_variants (id, product_id, variant_type, name, sku, price_adjustment, sort_order) VALUES
('var-0000-0000-0000-000000000001', 'prod-0000-0000-0000-000000000049', 'size', 'Medium', 'SKU-49-M', 0, 1),
('var-0000-0000-0000-000000000002', 'prod-0000-0000-0000-000000000049', 'size', 'Large', 'SKU-49-L', 5000, 2),
('var-0000-0000-0000-000000000003', 'prod-0000-0000-0000-000000000053', 'temperature', 'Panas', 'SKU-53-HOT', 0, 1),
('var-0000-0000-0000-000000000004', 'prod-0000-0000-0000-000000000053', 'temperature', 'Dingin', 'SKU-53-COLD', 0, 2),
('var-0000-0000-0000-000000000005', 'prod-0000-0000-0000-000000000061', 'temperature', 'Panas', 'SKU-61-HOT', 0, 1),
('var-0000-0000-0000-000000000006', 'prod-0000-0000-0000-000000000061', 'temperature', 'Dingin', 'SKU-61-COLD', 0, 2),
('var-0000-0000-0000-000000000007', 'prod-0000-0000-0000-000000000062', 'temperature', 'Panas', 'SKU-62-HOT', 0, 1),
('var-0000-0000-0000-000000000008', 'prod-0000-0000-0000-000000000062', 'temperature', 'Dingin', 'SKU-62-COLD', 0, 2),
('var-0000-0000-0000-000000000009', 'prod-0000-0000-0000-000000000063', 'temperature', 'Panas', 'SKU-63-HOT', 0, 1),
('var-0000-0000-0000-000000000010', 'prod-0000-0000-0000-000000000063', 'temperature', 'Dingin', 'SKU-63-COLD', 0, 2),
('var-0000-0000-0000-000000000011', 'prod-0000-0000-0000-000000000064', 'size', 'Medium', 'SKU-64-M', 0, 1),
('var-0000-0000-0000-000000000012', 'prod-0000-0000-0000-000000000064', 'size', 'Large', 'SKU-64-L', 5000, 2),
('var-0000-0000-0000-000000000013', 'prod-0000-0000-0000-000000000064', 'temperature', 'Panas', 'SKU-64-HOT', 0, 1),
('var-0000-0000-0000-000000000014', 'prod-0000-0000-0000-000000000064', 'temperature', 'Dingin', 'SKU-64-COLD', 0, 2),
('var-0000-0000-0000-000000000015', 'prod-0000-0000-0000-000000000066', 'size', 'Medium', 'SKU-66-M', 0, 1),
('var-0000-0000-0000-000000000016', 'prod-0000-0000-0000-000000000066', 'size', 'Large', 'SKU-66-L', 5000, 2),
('var-0000-0000-0000-000000000017', 'prod-0000-0000-0000-000000000069', 'size', 'Medium', 'SKU-69-M', 0, 1),
('var-0000-0000-0000-000000000018', 'prod-0000-0000-0000-000000000069', 'size', 'Large', 'SKU-69-L', 2000, 2),
('var-0000-0000-0000-000000000019', 'prod-0000-0000-0000-000000000069', 'temperature', 'Panas', 'SKU-69-HOT', 0, 1),
('var-0000-0000-0000-000000000020', 'prod-0000-0000-0000-000000000069', 'temperature', 'Dingin', 'SKU-69-COLD', 0, 2),
('var-0000-0000-0000-000000000021', 'prod-0000-0000-0000-000000000070', 'size', 'Medium', 'SKU-70-M', 0, 1),
('var-0000-0000-0000-000000000022', 'prod-0000-0000-0000-000000000070', 'size', 'Large', 'SKU-70-L', 5000, 2),
('var-0000-0000-0000-000000000023', 'prod-0000-0000-0000-000000000070', 'temperature', 'Panas', 'SKU-70-HOT', 0, 1),
('var-0000-0000-0000-000000000024', 'prod-0000-0000-0000-000000000070', 'temperature', 'Dingin', 'SKU-70-COLD', 0, 2),
('var-0000-0000-0000-000000000025', 'prod-0000-0000-0000-000000000074', 'size', 'Medium', 'SKU-74-M', 0, 1),
('var-0000-0000-0000-000000000026', 'prod-0000-0000-0000-000000000074', 'size', 'Large', 'SKU-74-L', 5000, 2),
('var-0000-0000-0000-000000000027', 'prod-0000-0000-0000-000000000074', 'temperature', 'Panas', 'SKU-74-HOT', 0, 1),
('var-0000-0000-0000-000000000028', 'prod-0000-0000-0000-000000000074', 'temperature', 'Dingin', 'SKU-74-COLD', 0, 2),
('var-0000-0000-0000-000000000029', 'prod-0000-0000-0000-000000000075', 'size', 'Medium', 'SKU-75-M', 0, 1),
('var-0000-0000-0000-000000000030', 'prod-0000-0000-0000-000000000075', 'size', 'Large', 'SKU-75-L', 5000, 2),
('var-0000-0000-0000-000000000031', 'prod-0000-0000-0000-000000000075', 'temperature', 'Panas', 'SKU-75-HOT', 0, 1),
('var-0000-0000-0000-000000000032', 'prod-0000-0000-0000-000000000075', 'temperature', 'Dingin', 'SKU-75-COLD', 0, 2),
('var-0000-0000-0000-000000000033', 'prod-0000-0000-0000-000000000077', 'size', 'Medium', 'SKU-77-M', 0, 1),
('var-0000-0000-0000-000000000034', 'prod-0000-0000-0000-000000000077', 'size', 'Large', 'SKU-77-L', 4000, 2),
('var-0000-0000-0000-000000000035', 'prod-0000-0000-0000-000000000077', 'temperature', 'Panas', 'SKU-77-HOT', 0, 1),
('var-0000-0000-0000-000000000036', 'prod-0000-0000-0000-000000000077', 'temperature', 'Dingin', 'SKU-77-COLD', 0, 2),
('var-0000-0000-0000-000000000037', 'prod-0000-0000-0000-000000000078', 'size', 'Medium', 'SKU-78-M', 0, 1),
('var-0000-0000-0000-000000000038', 'prod-0000-0000-0000-000000000078', 'size', 'Large', 'SKU-78-L', 5000, 2),
('var-0000-0000-0000-000000000039', 'prod-0000-0000-0000-000000000078', 'temperature', 'Panas', 'SKU-78-HOT', 0, 1),
('var-0000-0000-0000-000000000040', 'prod-0000-0000-0000-000000000078', 'temperature', 'Dingin', 'SKU-78-COLD', 0, 2)
ON CONFLICT (id) DO NOTHING;

-- 6. INVENTORY PRE-POPULATION
INSERT INTO public.inventory (id, product_id, current_stock, minimum_stock, unit, track_stock) VALUES
('inv-0000-0000-0000-000000000001', 'prod-0000-0000-0000-000000000001', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000002', 'prod-0000-0000-0000-000000000002', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000003', 'prod-0000-0000-0000-000000000003', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000004', 'prod-0000-0000-0000-000000000004', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000005', 'prod-0000-0000-0000-000000000005', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000006', 'prod-0000-0000-0000-000000000006', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000007', 'prod-0000-0000-0000-000000000007', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000008', 'prod-0000-0000-0000-000000000008', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000009', 'prod-0000-0000-0000-000000000009', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000010', 'prod-0000-0000-0000-000000000010', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000011', 'prod-0000-0000-0000-000000000011', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000012', 'prod-0000-0000-0000-000000000012', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000013', 'prod-0000-0000-0000-000000000013', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000014', 'prod-0000-0000-0000-000000000014', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000015', 'prod-0000-0000-0000-000000000015', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000016', 'prod-0000-0000-0000-000000000016', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000017', 'prod-0000-0000-0000-000000000017', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000018', 'prod-0000-0000-0000-000000000018', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000019', 'prod-0000-0000-0000-000000000019', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000020', 'prod-0000-0000-0000-000000000020', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000021', 'prod-0000-0000-0000-000000000021', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000022', 'prod-0000-0000-0000-000000000022', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000023', 'prod-0000-0000-0000-000000000023', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000024', 'prod-0000-0000-0000-000000000024', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000025', 'prod-0000-0000-0000-000000000025', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000026', 'prod-0000-0000-0000-000000000026', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000027', 'prod-0000-0000-0000-000000000027', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000028', 'prod-0000-0000-0000-000000000028', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000029', 'prod-0000-0000-0000-000000000029', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000030', 'prod-0000-0000-0000-000000000030', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000031', 'prod-0000-0000-0000-000000000031', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000032', 'prod-0000-0000-0000-000000000032', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000033', 'prod-0000-0000-0000-000000000033', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000034', 'prod-0000-0000-0000-000000000034', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000035', 'prod-0000-0000-0000-000000000035', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000036', 'prod-0000-0000-0000-000000000036', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000037', 'prod-0000-0000-0000-000000000037', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000038', 'prod-0000-0000-0000-000000000038', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000039', 'prod-0000-0000-0000-000000000039', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000040', 'prod-0000-0000-0000-000000000040', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000041', 'prod-0000-0000-0000-000000000041', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000042', 'prod-0000-0000-0000-000000000042', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000043', 'prod-0000-0000-0000-000000000043', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000044', 'prod-0000-0000-0000-000000000044', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000045', 'prod-0000-0000-0000-000000000045', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000046', 'prod-0000-0000-0000-000000000046', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000047', 'prod-0000-0000-0000-000000000047', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000048', 'prod-0000-0000-0000-000000000048', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000049', 'prod-0000-0000-0000-000000000049', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000050', 'prod-0000-0000-0000-000000000050', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000051', 'prod-0000-0000-0000-000000000051', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000052', 'prod-0000-0000-0000-000000000052', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000053', 'prod-0000-0000-0000-000000000053', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000054', 'prod-0000-0000-0000-000000000054', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000055', 'prod-0000-0000-0000-000000000055', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000056', 'prod-0000-0000-0000-000000000056', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000057', 'prod-0000-0000-0000-000000000057', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000058', 'prod-0000-0000-0000-000000000058', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000059', 'prod-0000-0000-0000-000000000059', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000060', 'prod-0000-0000-0000-000000000060', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000061', 'prod-0000-0000-0000-000000000061', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000062', 'prod-0000-0000-0000-000000000062', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000063', 'prod-0000-0000-0000-000000000063', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000064', 'prod-0000-0000-0000-000000000064', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000065', 'prod-0000-0000-0000-000000000065', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000066', 'prod-0000-0000-0000-000000000066', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000067', 'prod-0000-0000-0000-000000000067', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000068', 'prod-0000-0000-0000-000000000068', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000069', 'prod-0000-0000-0000-000000000069', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000070', 'prod-0000-0000-0000-000000000070', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000071', 'prod-0000-0000-0000-000000000071', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000072', 'prod-0000-0000-0000-000000000072', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000073', 'prod-0000-0000-0000-000000000073', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000074', 'prod-0000-0000-0000-000000000074', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000075', 'prod-0000-0000-0000-000000000075', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000076', 'prod-0000-0000-0000-000000000076', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000077', 'prod-0000-0000-0000-000000000077', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000078', 'prod-0000-0000-0000-000000000078', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000079', 'prod-0000-0000-0000-000000000079', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000080', 'prod-0000-0000-0000-000000000080', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000081', 'prod-0000-0000-0000-000000000081', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000082', 'prod-0000-0000-0000-000000000082', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000083', 'prod-0000-0000-0000-000000000083', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000084', 'prod-0000-0000-0000-000000000084', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000085', 'prod-0000-0000-0000-000000000085', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000086', 'prod-0000-0000-0000-000000000086', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000087', 'prod-0000-0000-0000-000000000087', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000088', 'prod-0000-0000-0000-000000000088', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000089', 'prod-0000-0000-0000-000000000089', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000090', 'prod-0000-0000-0000-000000000090', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000091', 'prod-0000-0000-0000-000000000091', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000092', 'prod-0000-0000-0000-000000000092', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000093', 'prod-0000-0000-0000-000000000093', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000094', 'prod-0000-0000-0000-000000000094', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000095', 'prod-0000-0000-0000-000000000095', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000096', 'prod-0000-0000-0000-000000000096', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000097', 'prod-0000-0000-0000-000000000097', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000098', 'prod-0000-0000-0000-000000000098', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000099', 'prod-0000-0000-0000-000000000099', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000100', 'prod-0000-0000-0000-000000000100', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000101', 'prod-0000-0000-0000-000000000101', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000102', 'prod-0000-0000-0000-000000000102', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000103', 'prod-0000-0000-0000-000000000103', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000104', 'prod-0000-0000-0000-000000000104', 100, 10, 'porsi', TRUE),
('inv-0000-0000-0000-000000000105', 'prod-0000-0000-0000-000000000105', 100, 10, 'porsi', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 7. MASTER VOUCHERS SEED
INSERT INTO public.vouchers (id, code, title, description, discount_type, discount_value, min_spend, max_discount, quota, claimed_count, redeemed_count, valid_from, valid_until, target_tier, target_rfm_segment, is_active) VALUES
('vcr-00000000-0000-0000-0000-000000000001', 'WILUJENG-UPI', 'Voucher Selamat Datang Tamu', 'Potongan Rp 15.000 untuk kunjungan perdana Anda di Rumah Tamah Bumi Upi.', 'nominal', 15000, 50000, 15000, 500, 184, 142, '2026-05-01 00:00:00+07', '2026-12-31 23:59:59+07', 'Tamu', 'Baru', TRUE),
('vcr-00000000-0000-0000-0000-000000000002', 'NOBAR-PERSIB', 'Voucher Nobar Persib Juara', 'Diskon 20% untuk semua cemilan hangat saat nobar pertandingan Persib di Bale Utama.', 'percent', 20, 40000, 25000, 200, 126, 98, '2026-06-01 00:00:00+07', '2026-11-30 23:59:59+07', NULL, 'Champions', TRUE),
('vcr-00000000-0000-0000-0000-000000000003', 'RINDU-RUMAH', 'Voucher Kangen Rumah Tamah', 'Potongan Rp 25.000 khusus untuk Anda yang sudah lama tidak singgah ke Bumi.', 'nominal', 25000, 80000, 25000, 300, 85, 42, '2026-07-01 00:00:00+07', '2026-12-31 23:59:59+07', NULL, 'Berisiko', TRUE),
('vcr-00000000-0000-0000-0000-000000000004', 'ULTAH-UPI', 'Traktiran Spesial Hari Ulang Tahun', 'Gratis 1 Porsi Es Cokelat Bumi Klasik + Pisang Goreng Madu di bulan kelahiran Anda.', 'free_item', 42000, 60000, 42000, 1000, 45, 38, '2026-01-01 00:00:00+07', '2026-12-31 23:59:59+07', NULL, NULL, TRUE),
('vcr-00000000-0000-0000-0000-000000000005', 'KELUARGA-HEMAT', 'Apresiasi Tingkat Keluarga', 'Diskon 15% tanpa minimum belanja untuk anggota tier tertinggi Keluarga Bumi.', 'percent', 15, 0, 50000, 500, 62, 54, '2026-08-01 00:00:00+07', '2026-12-31 23:59:59+07', 'Keluarga', 'Champions', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 8. EVENTS SEED
INSERT INTO public.events (id, title, description, event_date, event_time, max_participants, current_participants, linked_voucher_id, is_active) VALUES
('evt-00000000-0000-0000-0000-000000000001', 'Nobar Akbar: Persib Bandung vs Persija', 'Nonton bareng di layar proyektor Bale Utama Bumi Upi. Suasana hangat, camilan mendoan hangat, dan chant santun.', '2026-11-08', '19:00:00', 80, 64, 'vcr-00000000-0000-0000-0000-000000000002', TRUE),
('evt-00000000-0000-0000-0000-000000000002', 'Malam Keroncong & Pop Sunda Nostalgia', 'Pertunjukan musik akustik keroncong tempo doeloe di halaman rumput Bumi Upi.', '2026-11-15', '19:30:00', 50, 38, NULL, TRUE),
('evt-00000000-0000-0000-0000-000000000003', 'Lokakarya Seduh Teh Melati & Rimpang Garut', 'Belajar meracik teh tubruk melati dan rempah kunyit asam bersama perajin herbal Garut.', '2026-11-22', '10:00:00', 25, 19, NULL, TRUE)
ON CONFLICT (id) DO NOTHING;
