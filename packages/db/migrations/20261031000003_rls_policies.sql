-- ============================================================================
-- BUMI UPI CRM — MIGRATION 03: ROW LEVEL SECURITY (RLS) POLICIES
-- Strict role-based enforcement across all tables
-- Roles: 'customer', 'kasir', 'admin'
-- ============================================================================

-- Helper functions to identify current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'kasir')
    );
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfm_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_updates ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
-- Customer can read and update their own profile; staff can read all profiles; admin can manage all
CREATE POLICY "Profiles read policy" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR public.is_staff()
    );

CREATE POLICY "Profiles update own policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR public.is_admin()
    );

CREATE POLICY "Admin insert/delete profiles" ON public.profiles
    FOR ALL USING (
        public.is_admin()
    );

-- 2. MENU CATEGORIES & ITEMS POLICIES
-- Public read for active menu; Staff/Admin can manage
CREATE POLICY "Public read active categories" ON public.menu_categories
    FOR SELECT USING (true);

CREATE POLICY "Staff manage categories" ON public.menu_categories
    FOR ALL USING (public.is_staff());

CREATE POLICY "Public read active menu items" ON public.menu_items
    FOR SELECT USING (true);

CREATE POLICY "Staff manage menu items" ON public.menu_items
    FOR ALL USING (public.is_staff());

-- 3. VOUCHERS POLICIES
CREATE POLICY "Read active vouchers" ON public.vouchers
    FOR SELECT USING (is_active = TRUE OR public.is_staff());

CREATE POLICY "Staff manage vouchers" ON public.vouchers
    FOR ALL USING (public.is_staff());

-- 4. CUSTOMER VOUCHERS POLICIES
-- Customer only sees their own; Staff can see and validate (for POS redemption)
CREATE POLICY "Customer voucher select" ON public.customer_vouchers
    FOR SELECT USING (customer_id = auth.uid() OR public.is_staff());

CREATE POLICY "Customer voucher claim" ON public.customer_vouchers
    FOR INSERT WITH CHECK (customer_id = auth.uid() OR public.is_staff());

CREATE POLICY "Staff update customer voucher" ON public.customer_vouchers
    FOR UPDATE USING (public.is_staff());

-- 5. TRANSACTIONS & ITEMS POLICIES
CREATE POLICY "Transactions select" ON public.transactions
    FOR SELECT USING (customer_id = auth.uid() OR public.is_staff());

CREATE POLICY "Staff manage transactions" ON public.transactions
    FOR INSERT WITH CHECK (public.is_staff());

CREATE POLICY "Transaction items select" ON public.transaction_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id AND (t.customer_id = auth.uid() OR public.is_staff())
        )
    );

CREATE POLICY "Staff insert transaction items" ON public.transaction_items
    FOR INSERT WITH CHECK (public.is_staff());

-- 6. POINTS LEDGER POLICIES
CREATE POLICY "Points ledger select" ON public.points_ledger
    FOR SELECT USING (customer_id = auth.uid() OR public.is_staff());

-- 7. RESERVATIONS POLICIES
CREATE POLICY "Reservations select" ON public.reservations
    FOR SELECT USING (customer_id = auth.uid() OR public.is_staff());

CREATE POLICY "Customer insert reservation" ON public.reservations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Customer cancel own reservation" ON public.reservations
    FOR UPDATE USING (customer_id = auth.uid() OR public.is_staff());

-- 8. EVENTS & RSVPS POLICIES
CREATE POLICY "Events public select" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Staff manage events" ON public.events
    FOR ALL USING (public.is_staff());

CREATE POLICY "RSVP select" ON public.event_rsvps
    FOR SELECT USING (customer_id = auth.uid() OR public.is_staff());

CREATE POLICY "RSVP insert" ON public.event_rsvps
    FOR INSERT WITH CHECK (customer_id = auth.uid() OR public.is_staff());

-- 9. CUSTOMER FEEDBACK POLICIES
CREATE POLICY "Feedback select" ON public.customer_feedback
    FOR SELECT USING (customer_id = auth.uid() OR public.is_staff());

CREATE POLICY "Customer insert feedback" ON public.customer_feedback
    FOR INSERT WITH CHECK (customer_id = auth.uid() OR public.is_staff());

CREATE POLICY "Staff update feedback" ON public.customer_feedback
    FOR UPDATE USING (public.is_staff());

-- 10. RFM SCORES, CAMPAIGNS, AI, AUDIT, SETTINGS (Admin/Staff only)
CREATE POLICY "Staff view rfm" ON public.rfm_scores
    FOR SELECT USING (public.is_staff());

CREATE POLICY "Staff manage campaigns" ON public.campaigns
    FOR ALL USING (public.is_staff());

CREATE POLICY "Admin only ai_configs" ON public.ai_configs
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admin view ai_logs" ON public.ai_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin view audit_logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Public read system settings" ON public.system_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin update system settings" ON public.system_settings
    FOR ALL USING (public.is_admin());

-- 11. PRODUCTS, CATEGORIES, VARIANTS, INVENTORY, ORDERS & PAYMENTS POLICIES
CREATE POLICY "Public read active categories new" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Staff manage categories new" ON public.categories
    FOR ALL USING (public.is_staff());

CREATE POLICY "Public read active products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Staff manage products" ON public.products
    FOR ALL USING (public.is_staff());

CREATE POLICY "Public read product variants" ON public.product_variants
    FOR SELECT USING (true);

CREATE POLICY "Staff manage product variants" ON public.product_variants
    FOR ALL USING (public.is_staff());

CREATE POLICY "Staff manage inventory" ON public.inventory
    FOR ALL USING (public.is_staff());

CREATE POLICY "Orders read policy" ON public.orders
    FOR SELECT USING (customer_id = auth.uid() OR public.is_staff());

CREATE POLICY "Orders insert policy" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders staff manage" ON public.orders
    FOR ALL USING (public.is_staff());

CREATE POLICY "Order items select" ON public.order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.customer_id = auth.uid() OR public.is_staff()))
    );

CREATE POLICY "Order items insert" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Payments read policy" ON public.payments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.customer_id = auth.uid() OR public.is_staff()))
    );

CREATE POLICY "Payments staff manage" ON public.payments
    FOR ALL USING (public.is_staff());
