-- ============================================================================
-- RUMAH TAMAH BUMI UPI — COMPLETE SUPABASE SETUP SCRIPT (ALL-IN-ONE)
-- Lokasi: Jl. Cimanuk 312, Garut, Jawa Barat
-- Database: PostgreSQL 15+ / Supabase
-- Timezone: WIB (Asia/Jakarta, UTC+7)
-- ============================================================================
-- Petunjuk Penggunaan:
-- 1. Buka Supabase Dashboard -> Project Anda -> SQL Editor -> New Query.
-- 2. Salin dan tempel seluruh isi skrip ini.
-- 3. Klik tombol "Run" (Jalankan).
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES / ENUMS
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('customer', 'kasir', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tier_level AS ENUM ('Tamu', 'Sahabat', 'Keluarga'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE rfm_segment_type AS ENUM ('Champions', 'Loyal', 'Potensial Loyal', 'Baru', 'Berisiko', 'Hampir Hilang', 'Hilang'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending_payment', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway', 'online_delivery'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('qris', 'cash', 'transfer', 'ewallet'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES TABLE (Customers, Kasir, Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'customer',
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL UNIQUE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    telegram_chat_id BIGINT UNIQUE,
    telegram_username TEXT,
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

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_qr ON public.profiles(qr_code);

-- 4. CATEGORIES TABLE (16 Kategori Khas Sunda)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    expected_count INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 5. MENU ITEMS TABLE (105 Menu Otentik)
CREATE TABLE IF NOT EXISTS public.menu_items (
    id INT PRIMARY KEY,
    sku TEXT UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price INT NOT NULL CHECK (price >= 0),
    unit TEXT NOT NULL DEFAULT 'porsi',
    tags TEXT[] DEFAULT '{}',
    temps TEXT[] DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_menu_category ON public.menu_items(category);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    idempotency_key TEXT UNIQUE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cashier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_type order_type NOT NULL DEFAULT 'dine_in',
    table_number TEXT NOT NULL DEFAULT 'Meja 01',
    status order_status NOT NULL DEFAULT 'confirmed',
    subtotal INT NOT NULL DEFAULT 0,
    discount_amount INT NOT NULL DEFAULT 0,
    final_amount INT NOT NULL DEFAULT 0,
    points_earned INT NOT NULL DEFAULT 0,
    voucher_id UUID,
    payment_method payment_method NOT NULL DEFAULT 'qris',
    payment_status payment_status NOT NULL DEFAULT 'paid',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES public.menu_items(id),
    item_name TEXT NOT NULL,
    unit_price INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 8. VOUCHERS TABLE
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value INT NOT NULL,
    min_spend INT NOT NULL DEFAULT 0,
    max_discount INT,
    quota INT NOT NULL DEFAULT 100,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 9. CUSTOMER VOUCHERS TABLE (Wallet Kupon Member)
CREATE TABLE IF NOT EXISTS public.customer_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
    qr_code TEXT NOT NULL UNIQUE,
    is_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at TIMESTAMPTZ,
    order_id UUID REFERENCES public.orders(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 10. WHATSAPP OTP CODES TABLE
CREATE TABLE IF NOT EXISTS public.whatsapp_otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

CREATE INDEX IF NOT EXISTS idx_otp_phone_unverified ON public.whatsapp_otp_codes(phone, verified);

-- 11. POJOK SURAT RINDU UNTUK NENEK UPI TABLE
CREATE TABLE IF NOT EXISTS public.surat_rindu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    origin_city TEXT NOT NULL DEFAULT 'Rantau',
    category TEXT NOT NULL DEFAULT 'Cucu yang Merantau',
    message TEXT NOT NULL,
    nenek_blessing TEXT NOT NULL,
    likes INT NOT NULL DEFAULT 0,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 12. DINING TABLES & 5 ZONES TABLE
CREATE TABLE IF NOT EXISTS public.dining_tables (
    table_number TEXT PRIMARY KEY,
    zone_id TEXT NOT NULL,
    zone_name TEXT NOT NULL,
    capacity TEXT NOT NULL,
    icon TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED')),
    current_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 13. DAILY SPINS TABLE (Roda Hadiah Member)
CREATE TABLE IF NOT EXISTS public.daily_spins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    prize_label TEXT NOT NULL,
    prize_type TEXT NOT NULL CHECK (prize_type IN ('points', 'item', 'voucher')),
    prize_value TEXT NOT NULL,
    points_awarded INT DEFAULT 0,
    claim_code TEXT NOT NULL UNIQUE,
    is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    UNIQUE(customer_id, spin_date)
);

-- 14. POINTS AUDIT LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.points_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    points_delta INT NOT NULL,
    balance_after INT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('EARN', 'REDEEM', 'BONUS_WELCOME', 'DAILY_SPIN', 'EXPIRED')),
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- ============================================================================
-- STORED PROCEDURES / ATOMIC FUNCTIONS
-- ============================================================================

-- Function: Increment points & recalculate tier
CREATE OR REPLACE FUNCTION public.increment_customer_points(
    p_customer_id UUID,
    p_points INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_bal INT;
    v_new_cum INT;
    v_new_tier tier_level;
BEGIN
    UPDATE public.profiles
    SET points_balance = points_balance + p_points,
        cumulative_points = cumulative_points + p_points,
        updated_at = (NOW() AT TIME ZONE 'Asia/Jakarta')
    WHERE id = p_customer_id
    RETURNING points_balance, cumulative_points INTO v_new_bal, v_new_cum;

    -- Tier calculation: Tamu (0), Sahabat (100+), Keluarga (300+)
    IF v_new_cum >= 300 THEN
        v_new_tier := 'Keluarga';
    ELSIF v_new_cum >= 100 THEN
        v_new_tier := 'Sahabat';
    ELSE
        v_new_tier := 'Tamu';
    END IF;

    UPDATE public.profiles
    SET tier = v_new_tier
    WHERE id = p_customer_id;

    INSERT INTO public.points_ledger (customer_id, points_delta, balance_after, transaction_type, description)
    VALUES (p_customer_id, p_points, v_new_bal, 'EARN', 'Poin reward transaksi makan di Bumi Upi');
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_rindu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

-- Public can read menu categories, items, tables, vouchers, and approved letters
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public read menu_items" ON public.menu_items FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public read dining_tables" ON public.dining_tables FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read vouchers" ON public.vouchers FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public read surat_rindu" ON public.surat_rindu FOR SELECT TO anon, authenticated USING (is_approved = true);

-- Orders: Customer can read own orders, public/authenticated can insert
CREATE POLICY "Insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Insert order_items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Read own orders" ON public.orders FOR SELECT TO authenticated USING (customer_id = auth.uid());

-- Profiles: Users can view and update own profile
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Public profile lookup" ON public.profiles FOR SELECT TO anon USING (true);

-- ============================================================================
-- SEED DATA: 16 KATEGORI, VOUCHER, MEJA, & SURAT RINDU
-- ============================================================================

-- Seed 16 Categories
INSERT INTO public.categories (name, slug, sort_order, expected_count) VALUES
('Gorengan Dadakan', 'cat-gorengan', 1, 8),
('Cemilan Tradisional', 'cat-cemilan', 2, 7),
('Ketan & Colenak', 'cat-ketan', 3, 4),
('Makanan Pembuka', 'cat-pembuka', 4, 3),
('Lauk Ayam & Unggas', 'cat-ayam', 5, 10),
('Lauk Daging Sapi', 'cat-daging', 6, 8),
('Lauk Ikan & Seafood', 'cat-ikan', 7, 8),
('Tumisan & Sayuran', 'cat-sayur', 8, 8),
('Aneka Sambal Garut', 'cat-sambal', 9, 6),
('Nasi & Karbohidrat', 'cat-nasi', 10, 8),
('Mie & Olahan Tepung', 'cat-mie', 11, 4),
('Kopi & Teh Tradisional', 'cat-kopi', 12, 10),
('Minuman Rempah Herbal', 'cat-rempah', 13, 8),
('Minuman Dingin Tradisional', 'cat-dingin', 14, 8),
('Jus Buah Segar', 'cat-jus', 15, 6),
('Kudapan Manis & Penutup', 'cat-penutup', 16, 4)
ON CONFLICT (name) DO NOTHING;

-- Seed Master Vouchers
INSERT INTO public.vouchers (code, title, description, discount_type, discount_value, min_spend, quota, expires_at)
VALUES
('BUMIWELCOME', 'Traktiran Sambutan Nenek', 'Potongan Rp 10.000 untuk kunjungan pertama keluarga', 'fixed', 10000, 30000, 1000, NOW() + INTERVAL '1 year'),
('PERSIBJUARA', 'Diskon Nobar Maung Bandung', 'Potongan 15% khusus hari nobar Persib di Bale Utama', 'percentage', 15, 40000, 1000, NOW() + INTERVAL '1 year'),
('ULTAHSUNDA', 'Kado Ulang Tahun Baraya', 'Voucher spesial ulang tahun diskon Rp 25.000', 'fixed', 25000, 75000, 500, NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;

-- Seed 20 Tables across 5 Zones
INSERT INTO public.dining_tables (table_number, zone_id, zone_name, capacity, icon, status) VALUES
('Meja 01', 'zone-saung', 'Saung Lesehan Bambu', '4 - 8 Orang', '🎋', 'AVAILABLE'),
('Meja 02', 'zone-saung', 'Saung Lesehan Bambu', '4 - 8 Orang', '🎋', 'AVAILABLE'),
('Meja 03', 'zone-saung', 'Saung Lesehan Bambu', '4 - 8 Orang', '🎋', 'AVAILABLE'),
('Meja 04', 'zone-saung', 'Saung Lesehan Bambu', '4 - 8 Orang', '🎋', 'AVAILABLE'),
('Meja 05', 'zone-teras', 'Teras Krepyak Vintage', '2 - 4 Orang', '🪑', 'AVAILABLE'),
('Meja 06', 'zone-teras', 'Teras Krepyak Vintage', '2 - 4 Orang', '🪑', 'AVAILABLE'),
('Meja 07', 'zone-teras', 'Teras Krepyak Vintage', '2 - 4 Orang', '🪑', 'AVAILABLE'),
('Meja 08', 'zone-teras', 'Teras Krepyak Vintage', '2 - 4 Orang', '🪑', 'AVAILABLE'),
('Meja 09', 'zone-bale', 'Bale Utama Nobar & Botram', '4 - 6 Orang', '📺', 'AVAILABLE'),
('Meja 10', 'zone-bale', 'Bale Utama Nobar & Botram', '4 - 6 Orang', '📺', 'AVAILABLE'),
('Meja 11', 'zone-bale', 'Bale Utama Nobar & Botram', '4 - 6 Orang', '📺', 'AVAILABLE'),
('Meja 12', 'zone-bale', 'Bale Utama Nobar & Botram', '4 - 6 Orang', '📺', 'AVAILABLE'),
('Meja 13', 'zone-dapur', 'Pojok Perapian Dapur Arang', '2 - 4 Orang', '🔥', 'AVAILABLE'),
('Meja 14', 'zone-dapur', 'Pojok Perapian Dapur Arang', '2 - 4 Orang', '🔥', 'AVAILABLE'),
('Meja 15', 'zone-dapur', 'Pojok Perapian Dapur Arang', '2 - 4 Orang', '🔥', 'AVAILABLE'),
('Meja 16', 'zone-dapur', 'Pojok Perapian Dapur Arang', '2 - 4 Orang', '🔥', 'AVAILABLE'),
('Meja 17', 'zone-paviliun', 'Paviliun Belakang Kebun Kopi', '2 - 6 Orang', '🌿', 'AVAILABLE'),
('Meja 18', 'zone-paviliun', 'Paviliun Belakang Kebun Kopi', '2 - 6 Orang', '🌿', 'AVAILABLE'),
('Meja 19', 'zone-paviliun', 'Paviliun Belakang Kebun Kopi', '2 - 6 Orang', '🌿', 'AVAILABLE'),
('Meja 20', 'zone-paviliun', 'Paviliun Belakang Kebun Kopi', '2 - 6 Orang', '🌿', 'AVAILABLE')
ON CONFLICT (table_number) DO NOTHING;

-- Seed Surat Rindu
INSERT INTO public.surat_rindu (author_name, origin_city, category, message, nenek_blessing, likes, is_approved) VALUES
('Teh Sarah Nurhaliza', 'Bandung', 'Cucu yang Merantau', 'Tiap kali makan sambel cibiuk sama ulen bakar di sini, langsung nangis inget masakan emak di Wanaraja. Bener-bener obat rindu kampung halaman...', 'Hatur nuhun Geulis Sarah. Sing sarehat di panyabaan, sing jembar rezekina. Upi salawasna ngadungakeun ti Garut.', 42, TRUE),
('Kang Dian Prasetya', 'Jakarta Selatan', 'Penikmat Masakan Tradisional', 'Rela macet-macetan dari tol Cipularang tiap akhir pekan cuma buat nyeduh kopi Papandayan dan duduk di saung lesehan kolam koi. Suasananya menenangkan jiwa.', 'Sing salamet di jalanna Kasep Dian. Dapur arang nenek salawasna ngebul haneut nganti anaking mulih.', 38, TRUE),
('Ibu Ratna & Keluarga', 'Bekasi Barat', 'Kenangan Masa Kecil', 'Porsi liwetannya melimpah ruah, anak-anak saya lahap banget sama ayam basah dan perkedel kentang. Persis rasa masakan nenek buyutnya dulu.', 'Mugia barokah kersaning Gusti, sing rukun sauyunan sakulawargi. Mangga sumping deui Iraha wae.', 29, TRUE),
('Kang Asep Bobotoh', 'Tarogong, Garut', 'Keluarga Bale Nobar', 'Tempat nongkrong nobar Persib paling asik sa-Garut! Cemilannya mantap, kopina panceg, nu bogana bageur pisan. Hidup Persib, jaya Bumi Upi!', 'Aamiin ya rabbal alamin! Sing sumanget kasep, panceg galih dina kahadean.', 56, TRUE);
