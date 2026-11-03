-- ============================================================================
-- BUMI UPI CRM — MIGRATION 02: ATOMIC POSTGRES FUNCTIONS & TRIGGERS
-- Critical Business Logic: Transactions, Points, Tiers, Vouchers, RFM, CLV
-- Guaranteed Idempotent & Atomic Execution
-- ============================================================================

-- 1. RECORD TRANSACTION ATOMIC FUNCTION
CREATE OR REPLACE FUNCTION public.record_transaction(
    p_idempotency_key TEXT,
    p_customer_id UUID,
    p_cashier_id UUID,
    p_invoice_number TEXT,
    p_subtotal INT,
    p_discount_amount INT,
    p_final_amount INT,
    p_customer_voucher_id UUID,
    p_items JSONB,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_tx RECORD;
    v_tx_id UUID;
    v_voucher_id UUID;
    v_is_redeemed BOOLEAN;
    v_voucher_expiry TIMESTAMPTZ;
    v_point_rate INT := 10000;
    v_points_earned INT := 0;
    v_tier_sahabat INT := 100;
    v_tier_keluarga INT := 300;
    v_current_points INT := 0;
    v_new_balance INT := 0;
    v_new_cumulative INT := 0;
    v_new_tier tier_level := 'Tamu';
    v_item RECORD;
    v_res JSONB;
BEGIN
    -- STEP 1: Idempotency Check
    SELECT id, invoice_number, final_amount, points_earned, created_at
    INTO v_existing_tx
    FROM public.transactions
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'is_duplicate', true,
            'transaction_id', v_existing_tx.id,
            'invoice_number', v_existing_tx.invoice_number,
            'final_amount', v_existing_tx.final_amount,
            'points_earned', v_existing_tx.points_earned,
            'message', 'Transaksi sudah pernah dicatat sebelumnya (Idempotent).'
        );
    END IF;

    -- STEP 2: Voucher Validation (Row-Locking with FOR UPDATE)
    IF p_customer_voucher_id IS NOT NULL THEN
        SELECT voucher_id, is_redeemed, expires_at
        INTO v_voucher_id, v_is_redeemed, v_voucher_expiry
        FROM public.customer_vouchers
        WHERE id = p_customer_voucher_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Voucher tidak ditemukan.';
        END IF;

        IF v_is_redeemed THEN
            RAISE EXCEPTION 'Voucher ini sudah pernah ditukarkan sebelumnya dan tidak dapat digunakan lagi.';
        END IF;

        IF v_voucher_expiry < (NOW() AT TIME ZONE 'Asia/Jakarta') THEN
            RAISE EXCEPTION 'Voucher ini telah kedaluwarsa.';
        END IF;
    END IF;

    -- STEP 3: Fetch System Point Settings
    SELECT point_per_amount, tier_sahabat_min, tier_keluarga_min
    INTO v_point_rate, v_tier_sahabat, v_tier_keluarga
    FROM public.system_settings
    LIMIT 1;

    IF v_point_rate IS NULL OR v_point_rate <= 0 THEN
        v_point_rate := 10000;
    END IF;

    -- STEP 4: Calculate Points Earned (1 poin per Rp 10.000)
    IF p_customer_id IS NOT NULL THEN
        v_points_earned := FLOOR(p_final_amount / v_point_rate);
    ELSE
        v_points_earned := 0;
    END IF;

    -- STEP 5: Insert Transaction Record
    INSERT INTO public.transactions (
        customer_id,
        cashier_id,
        invoice_number,
        idempotency_key,
        subtotal,
        discount_amount,
        final_amount,
        points_earned,
        voucher_id,
        customer_voucher_id,
        status,
        notes,
        created_at
    ) VALUES (
        p_customer_id,
        p_cashier_id,
        p_invoice_number,
        p_idempotency_key,
        p_subtotal,
        p_discount_amount,
        p_final_amount,
        v_points_earned,
        v_voucher_id,
        p_customer_voucher_id,
        'completed',
        p_notes,
        (NOW() AT TIME ZONE 'Asia/Jakarta')
    )
    RETURNING id INTO v_tx_id;

    -- STEP 6: Insert Items
    IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
            menu_item_id UUID,
            item_name TEXT,
            unit_price INT,
            quantity INT,
            subtotal INT
        )
        LOOP
            INSERT INTO public.transaction_items (
                transaction_id,
                menu_item_id,
                item_name,
                unit_price,
                quantity,
                subtotal
            ) VALUES (
                v_tx_id,
                v_item.menu_item_id,
                v_item.item_name,
                v_item.unit_price,
                v_item.quantity,
                v_item.subtotal
            );
        END LOOP;
    END IF;

    -- STEP 7: Mark Voucher as Redeemed
    IF p_customer_voucher_id IS NOT NULL THEN
        UPDATE public.customer_vouchers
        SET is_redeemed = TRUE,
            redeemed_at = (NOW() AT TIME ZONE 'Asia/Jakarta'),
            transaction_id = v_tx_id
        WHERE id = p_customer_voucher_id;

        UPDATE public.vouchers
        SET redeemed_count = redeemed_count + 1
        WHERE id = v_voucher_id;
    END IF;

    -- STEP 8: Credit Points and Evaluate Tier Progression
    IF p_customer_id IS NOT NULL AND v_points_earned > 0 THEN
        -- Lock customer row
        SELECT points_balance, cumulative_points, tier
        INTO v_current_points, v_new_cumulative, v_new_tier
        FROM public.profiles
        WHERE id = p_customer_id
        FOR UPDATE;

        v_new_balance := v_current_points + v_points_earned;
        v_new_cumulative := v_new_cumulative + v_points_earned;

        -- Tier Threshold Logic: Tamu -> Sahabat -> Keluarga
        IF v_new_cumulative >= v_tier_keluarga THEN
            v_new_tier := 'Keluarga';
        ELSIF v_new_cumulative >= v_tier_sahabat THEN
            v_new_tier := 'Sahabat';
        ELSE
            v_new_tier := 'Tamu';
        END IF;

        UPDATE public.profiles
        SET points_balance = v_new_balance,
            cumulative_points = v_new_cumulative,
            tier = v_new_tier,
            updated_at = (NOW() AT TIME ZONE 'Asia/Jakarta')
        WHERE id = p_customer_id;

        -- Record Immutable Points Ledger
        INSERT INTO public.points_ledger (
            customer_id,
            transaction_id,
            points_change,
            reason,
            balance_after,
            notes,
            created_at
        ) VALUES (
            p_customer_id,
            v_tx_id,
            v_points_earned,
            'transaction',
            v_new_balance,
            'Poin dari transaksi ' || p_invoice_number,
            (NOW() AT TIME ZONE 'Asia/Jakarta')
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'is_duplicate', false,
        'transaction_id', v_tx_id,
        'invoice_number', p_invoice_number,
        'final_amount', p_final_amount,
        'points_earned', v_points_earned,
        'new_balance', v_new_balance,
        'new_tier', v_new_tier,
        'created_at', (NOW() AT TIME ZONE 'Asia/Jakarta')
    );
END;
$$;

-- 2. CLAIM VOUCHER ATOMIC FUNCTION
CREATE OR REPLACE FUNCTION public.claim_voucher(
    p_customer_id UUID,
    p_voucher_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_voucher RECORD;
    v_already_claimed BOOLEAN;
    v_unique_code TEXT;
    v_customer_voucher_id UUID;
BEGIN
    -- Lock voucher record
    SELECT * INTO v_voucher
    FROM public.vouchers
    WHERE id = p_voucher_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voucher tidak ditemukan.';
    END IF;

    IF NOT v_voucher.is_active THEN
        RAISE EXCEPTION 'Voucher sudah tidak aktif.';
    END IF;

    IF v_voucher.valid_until < (NOW() AT TIME ZONE 'Asia/Jakarta') THEN
        RAISE EXCEPTION 'Voucher telah kedaluwarsa.';
    END IF;

    IF v_voucher.claimed_count >= v_voucher.quota THEN
        RAISE EXCEPTION 'Kuota voucher ini sudah habis.';
    END IF;

    -- Check if customer already claimed this specific voucher
    SELECT EXISTS (
        SELECT 1 FROM public.customer_vouchers
        WHERE customer_id = p_customer_id AND voucher_id = p_voucher_id AND is_redeemed = FALSE
    ) INTO v_already_claimed;

    IF v_already_claimed THEN
        RAISE EXCEPTION 'Anda sudah memiliki voucher ini yang belum digunakan.';
    END IF;

    -- Generate unique coupon code for customer instance
    v_unique_code := v_voucher.code || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6));

    INSERT INTO public.customer_vouchers (
        customer_id,
        voucher_id,
        unique_code,
        qr_code,
        is_redeemed,
        expires_at,
        created_at
    ) VALUES (
        p_customer_id,
        p_voucher_id,
        v_unique_code,
        'BUMI-VCR-' || v_unique_code,
        FALSE,
        v_voucher.valid_until,
        (NOW() AT TIME ZONE 'Asia/Jakarta')
    )
    RETURNING id INTO v_customer_voucher_id;

    -- Increment claimed count
    UPDATE public.vouchers
    SET claimed_count = claimed_count + 1
    WHERE id = p_voucher_id;

    RETURN jsonb_build_object(
        'success', true,
        'customer_voucher_id', v_customer_voucher_id,
        'unique_code', v_unique_code,
        'title', v_voucher.title,
        'expires_at', v_voucher.valid_until
    );
END;
$$;

-- 3. RECALCULATE RFM & CLV ESTIMATES
CREATE OR REPLACE FUNCTION public.recalculate_rfm_segments()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_processed_count INT := 0;
    v_now TIMESTAMPTZ := (NOW() AT TIME ZONE 'Asia/Jakarta');
BEGIN
    -- Temporary table to hold raw metrics per customer
    CREATE TEMP TABLE temp_rfm_metrics ON COMMIT DROP AS
    SELECT
        p.id AS customer_id,
        COALESCE(EXTRACT(DAY FROM (v_now - MAX(t.created_at)))::INT, 180) AS recency_days,
        COUNT(t.id)::INT AS frequency_count,
        COALESCE(SUM(t.final_amount), 0)::BIGINT AS monetary_total
    FROM public.profiles p
    LEFT JOIN public.transactions t ON p.id = t.customer_id AND t.status = 'completed'
    WHERE p.role = 'customer'
    GROUP BY p.id;

    -- Insert or Update into public.rfm_scores using quintiles logic
    INSERT INTO public.rfm_scores (
        customer_id,
        recency_days,
        frequency_count,
        monetary_total,
        r_score,
        f_score,
        m_score,
        rfm_segment,
        clv_estimate,
        calculated_at
    )
    SELECT
        m.customer_id,
        m.recency_days,
        m.frequency_count,
        m.monetary_total,
        -- R Score: Lower recency days = Higher R score (1 to 5)
        CASE
            WHEN m.recency_days <= 14 THEN 5
            WHEN m.recency_days <= 30 THEN 4
            WHEN m.recency_days <= 60 THEN 3
            WHEN m.recency_days <= 90 THEN 2
            ELSE 1
        END AS r_score,
        -- F Score: Higher frequency = Higher F score (1 to 5)
        CASE
            WHEN m.frequency_count >= 15 THEN 5
            WHEN m.frequency_count >= 8  THEN 4
            WHEN m.frequency_count >= 4  THEN 3
            WHEN m.frequency_count >= 2  THEN 2
            ELSE 1
        END AS f_score,
        -- M Score: Higher monetary = Higher M score (1 to 5)
        CASE
            WHEN m.monetary_total >= 1500000 THEN 5
            WHEN m.monetary_total >= 800000  THEN 4
            WHEN m.monetary_total >= 400000  THEN 3
            WHEN m.monetary_total >= 150000  THEN 2
            ELSE 1
        END AS m_score,
        -- RFM Segment Categorization (Standard F&B Industry Mapping)
        CASE
            -- Champions: Bought recently, buy often, and spend the most
            WHEN (m.recency_days <= 21 AND m.frequency_count >= 8) THEN 'Champions'::rfm_segment_type
            -- Loyal: Spend good money, responsive to promos, frequent
            WHEN (m.frequency_count >= 5 AND m.recency_days <= 45) THEN 'Loyal'::rfm_segment_type
            -- Potensial Loyal: Recent customers with average frequency
            WHEN (m.recency_days <= 30 AND m.frequency_count BETWEEN 2 AND 4) THEN 'Potensial Loyal'::rfm_segment_type
            -- Baru: Recent customers who visited 1 time
            WHEN (m.recency_days <= 21 AND m.frequency_count <= 1) THEN 'Baru'::rfm_segment_type
            -- Berisiko: Spent good money, frequent before, but haven't visited in 45-90 days
            WHEN (m.recency_days BETWEEN 46 AND 90 AND m.frequency_count >= 3) THEN 'Berisiko'::rfm_segment_type
            -- Hampir Hilang: Below average recency and frequency
            WHEN (m.recency_days BETWEEN 91 AND 140) THEN 'Hampir Hilang'::rfm_segment_type
            -- Hilang: Haven't visited in > 140 days
            ELSE 'Hilang'::rfm_segment_type
        END AS rfm_segment,
        -- CLV Calculation: (AOV) * (Purchase Frequency per Year) * (Average Customer Lifespan ~ 2 years)
        CASE
            WHEN m.frequency_count > 0 THEN
                CAST((m.monetary_total / m.frequency_count) * (m.frequency_count * 2) * 1.5 AS BIGINT)
            ELSE 0
        END AS clv_estimate,
        v_now
    FROM temp_rfm_metrics m
    ON CONFLICT (customer_id) DO UPDATE SET
        recency_days = EXCLUDED.recency_days,
        frequency_count = EXCLUDED.frequency_count,
        monetary_total = EXCLUDED.monetary_total,
        r_score = EXCLUDED.r_score,
        f_score = EXCLUDED.f_score,
        m_score = EXCLUDED.m_score,
        rfm_segment = EXCLUDED.rfm_segment,
        clv_estimate = EXCLUDED.clv_estimate,
        calculated_at = EXCLUDED.calculated_at;

    GET DIAGNOSTICS v_processed_count = ROW_COUNT;
    RETURN v_processed_count;
END;
$$;

-- 4. CREATE ORDER ATOMIC FUNCTION
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
    p_items JSONB, -- Array of objects: [{product_id, variant_id, item_name, variant_name, unit_price, quantity, subtotal, special_instructions}]
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

        -- Pengurangan Stok Inventaris
        IF v_pid IS NOT NULL THEN
            UPDATE public.inventory
            SET current_stock = GREATEST(0, current_stock - v_qty),
                updated_at = NOW() AT TIME ZONE 'Asia/Jakarta'
            WHERE (product_id = v_pid AND (v_vid IS NULL OR variant_id = v_vid));
        END IF;
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
            'Poin dari pesanan ' || v_order_number
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
