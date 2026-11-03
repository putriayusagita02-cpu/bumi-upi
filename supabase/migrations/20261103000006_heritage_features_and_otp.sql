-- ============================================================================
-- BUMI UPI CRM — MIGRATION 06: HERITAGE FEATURES & WHATSAPP OTP
-- Tables: whatsapp_otp_codes, surat_rindu, dining_tables, daily_spins
-- Case Study: Rumah Tamah Bumi Upi, Garut, Jawa Barat
-- Timezone: WIB (Asia/Jakarta, UTC+7)
-- ============================================================================

-- 1. WHATSAPP OTP CODES TABLE
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

CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.whatsapp_otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON public.whatsapp_otp_codes(expires_at);

-- 2. POJOK SURAT RINDU UNTUK NENEK UPI TABLE
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

CREATE INDEX IF NOT EXISTS idx_surat_approved ON public.surat_rindu(is_approved, created_at DESC);

-- 3. DINING TABLES & 5 ZONES TABLE
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

-- 4. DAILY SPINS TABLE (Roda Hadiah & Traktiran Member)
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

CREATE INDEX IF NOT EXISTS idx_daily_spins_cust_date ON public.daily_spins(customer_id, spin_date);

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================
ALTER TABLE public.whatsapp_otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_rindu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_spins ENABLE ROW LEVEL SECURITY;

-- OTP Policies (Anon can insert request & verify, Service role has full access)
CREATE POLICY "Allow public OTP insert" ON public.whatsapp_otp_codes
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public OTP select for verification" ON public.whatsapp_otp_codes
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public OTP update for verification" ON public.whatsapp_otp_codes
    FOR UPDATE TO anon, authenticated USING (true);

-- Surat Rindu Policies (Public can read approved, authenticated/anon can insert)
CREATE POLICY "Public read approved surat_rindu" ON public.surat_rindu
    FOR SELECT TO anon, authenticated USING (is_approved = TRUE);

CREATE POLICY "Allow anyone to write surat_rindu" ON public.surat_rindu
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow liking surat_rindu" ON public.surat_rindu
    FOR UPDATE TO anon, authenticated USING (true);

-- Dining Tables Policies (Public read, Staff manage)
CREATE POLICY "Public read dining_tables" ON public.dining_tables
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Staff update dining_tables" ON public.dining_tables
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'kasir'))
    );

-- Daily Spins Policies (Customer can see and insert own spins)
CREATE POLICY "Customer read own daily_spins" ON public.daily_spins
    FOR SELECT TO authenticated USING (customer_id = auth.uid());

CREATE POLICY "Customer insert own daily_spins" ON public.daily_spins
    FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());

-- ============================================================================
-- SEED DATA: DINING TABLES & PRESEEDED SURAT RINDU
-- ============================================================================

-- Seed 20 Dining Tables across 5 Zones
INSERT INTO public.dining_tables (table_number, zone_id, zone_name, capacity, icon, status)
VALUES
    -- Zona 1: Saung Lesehan Bambu
    ('Meja 01', 'zone-saung', 'Saung Lesehan Bambu', '4 - 8 Orang', '🎋', 'AVAILABLE'),
    ('Meja 02', 'zone-saung', 'Saung Lesehan Bambu', '4 - 8 Orang', '🎋', 'AVAILABLE'),
    ('Meja 03', 'zone-saung', 'Saung Lesehan Bambu', '4 - 8 Orang', '🎋', 'AVAILABLE'),
    ('Meja 04', 'zone-saung', 'Saung Lesehan Bambu', '4 - 8 Orang', '🎋', 'AVAILABLE'),
    -- Zona 2: Teras Krepyak Vintage
    ('Meja 05', 'zone-teras', 'Teras Krepyak Vintage', '2 - 4 Orang', '🪑', 'AVAILABLE'),
    ('Meja 06', 'zone-teras', 'Teras Krepyak Vintage', '2 - 4 Orang', '🪑', 'AVAILABLE'),
    ('Meja 07', 'zone-teras', 'Teras Krepyak Vintage', '2 - 4 Orang', '🪑', 'AVAILABLE'),
    ('Meja 08', 'zone-teras', 'Teras Krepyak Vintage', '2 - 4 Orang', '🪑', 'AVAILABLE'),
    -- Zona 3: Bale Utama Nobar & Botram
    ('Meja 09', 'zone-bale', 'Bale Utama Nobar & Botram', '4 - 6 Orang', '📺', 'AVAILABLE'),
    ('Meja 10', 'zone-bale', 'Bale Utama Nobar & Botram', '4 - 6 Orang', '📺', 'AVAILABLE'),
    ('Meja 11', 'zone-bale', 'Bale Utama Nobar & Botram', '4 - 6 Orang', '📺', 'AVAILABLE'),
    ('Meja 12', 'zone-bale', 'Bale Utama Nobar & Botram', '4 - 6 Orang', '📺', 'AVAILABLE'),
    -- Zona 4: Pojok Perapian Dapur Arang
    ('Meja 13', 'zone-dapur', 'Pojok Perapian Dapur Arang', '2 - 4 Orang', '🔥', 'AVAILABLE'),
    ('Meja 14', 'zone-dapur', 'Pojok Perapian Dapur Arang', '2 - 4 Orang', '🔥', 'AVAILABLE'),
    ('Meja 15', 'zone-dapur', 'Pojok Perapian Dapur Arang', '2 - 4 Orang', '🔥', 'AVAILABLE'),
    ('Meja 16', 'zone-dapur', 'Pojok Perapian Dapur Arang', '2 - 4 Orang', '🔥', 'AVAILABLE'),
    -- Zona 5: Paviliun Belakang Kebun Kopi
    ('Meja 17', 'zone-paviliun', 'Paviliun Belakang Kebun Kopi', '2 - 6 Orang', '🌿', 'AVAILABLE'),
    ('Meja 18', 'zone-paviliun', 'Paviliun Belakang Kebun Kopi', '2 - 6 Orang', '🌿', 'AVAILABLE'),
    ('Meja 19', 'zone-paviliun', 'Paviliun Belakang Kebun Kopi', '2 - 6 Orang', '🌿', 'AVAILABLE'),
    ('Meja 20', 'zone-paviliun', 'Paviliun Belakang Kebun Kopi', '2 - 6 Orang', '🌿', 'AVAILABLE')
ON CONFLICT (table_number) DO NOTHING;

-- Seed Preseeded Surat Rindu
INSERT INTO public.surat_rindu (author_name, origin_city, category, message, nenek_blessing, likes, is_approved)
VALUES
    (
        'Teh Sarah Nurhaliza',
        'Bandung',
        'Cucu yang Merantau',
        'Tiap kali makan sambel cibiuk sama ulen bakar di sini, langsung nangis inget masakan emak di Wanaraja. Bener-bener obat rindu kampung halaman...',
        'Hatur nuhun Geulis Sarah. Sing sarehat di panyabaan, sing jembar rezekina. Upi salawasna ngadungakeun ti Garut.',
        42,
        TRUE
    ),
    (
        'Kang Dian Prasetya',
        'Jakarta Selatan',
        'Penikmat Masakan Tradisional',
        'Rela macet-macetan dari tol Cipularang tiap akhir pekan cuma buat nyeduh kopi Papandayan dan duduk di saung lesehan kolam koi. Suasananya menenangkan jiwa.',
        'Sing salamet di jalanna Kasep Dian. Dapur arang nenek salawasna ngebul haneut nganti anaking mulih.',
        38,
        TRUE
    ),
    (
        'Ibu Ratna & Keluarga',
        'Bekasi Barat',
        'Kenangan Masa Kecil',
        'Porsi liwetannya melimpah ruah, anak-anak saya lahap banget sama ayam basah dan perkedel kentang. Persis rasa masakan nenek buyutnya dulu.',
        'Mugia barokah kersaning Gusti, sing rukun sauyunan sakulawargi. Mangga sumping deui Iraha wae.',
        29,
        TRUE
    ),
    (
        'Kang Asep Bobotoh',
        'Tarogong, Garut',
        'Keluarga Bale Nobar',
        'Tempat nongkrong nobar Persib paling asik sa-Garut! Cemilannya mantap, kopina panceg, nu bogana bageur pisan. Hidup Persib, jaya Bumi Upi!',
        'Aamiin ya rabbal alamin! Sing sumanget kasep, panceg galih dina kahadean.',
        56,
        TRUE
    );

-- Realtime Publication for Live Table Status and Surat Rindu
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dining_tables;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.surat_rindu;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
