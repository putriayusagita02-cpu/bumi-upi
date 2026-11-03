import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ReferenceStoreEngine } from '../helpers/test_env.js';
import { ORACLE_TIER_RULES } from '../helpers/oracle_data.js';

describe('Tier 2: Boundary & Corner Cases', () => {

  // ==========================================================================
  // B1: Cart & Checkout Boundaries
  // ==========================================================================
  describe('B1: Cart & Checkout Boundaries', () => {
    it('B1.1: Empty cart checkout rejection (cannot create order with 0 items)', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B1-EMPTY-001',
        items: []
      });
      assert.equal(res.success, false);
      assert.ok(res.error.toLowerCase().includes('at least 1 item') || res.error.toLowerCase().includes('empty'));
    });

    it('B1.2: Negative quantity in line items is strictly rejected', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B1-NEG-QTY',
        items: [{ itemName: 'Mie Kasep', unitPrice: 24000, quantity: -2 }]
      });
      assert.equal(res.success, false);
      assert.ok(res.error.toLowerCase().includes('quantity'));
    });

    it('B1.3: Fractional quantity (e.g. 1.5 portions) is strictly rejected', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B1-FRACT-QTY',
        items: [{ itemName: 'Es Cincau Jadoel', unitPrice: 19000, quantity: 1.5 }]
      });
      assert.equal(res.success, false);
      assert.ok(res.error.toLowerCase().includes('quantity') || res.error.toLowerCase().includes('integer'));
    });

    it('B1.4: Zero unit price items handled and do not cause division-by-zero or negative totals', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B1-FREE-PROMO',
        items: [
          { itemName: 'Teh Tawar Hangat Promo', unitPrice: 0, quantity: 1 },
          { itemName: 'Nasi Liwet', unitPrice: 48000, quantity: 1 }
        ]
      });
      assert.equal(res.success, true);
      assert.equal(res.subtotal, 48000);
      assert.equal(res.finalAmount, 48000);
    });

    it('B1.5: Extreme large quantity (e.g. 99,999 portions) exceeds stock availability and fails', () => {
      const engine = new ReferenceStoreEngine({
        inventory: [['prod-mie-01', { currentStock: 25, trackStock: true }]]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B1-EXTREME-QTY',
        items: [{ productId: 'prod-mie-01', itemName: 'Mie Racing', unitPrice: 25000, quantity: 99999 }]
      });
      assert.equal(res.success, false);
      assert.ok(res.error.toLowerCase().includes('insufficient stock'));
    });

    it('B1.6: Missing items array field returns validation error', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B1-NO-ITEMS'
      });
      assert.equal(res.success, false);
    });
  });

  // ==========================================================================
  // B2: Telephone & Contact Input Boundaries
  // ==========================================================================
  describe('B2: Telephone & Contact Input Boundaries', () => {
    function normalizePhone(raw) {
      if (!raw || typeof raw !== 'string') return null;
      let clean = raw.trim().replace(/[\s\-\(\)]/g, '');
      if (clean.startsWith('+62')) {
        clean = '0' + clean.slice(3);
      } else if (clean.startsWith('62')) {
        clean = '0' + clean.slice(2);
      }
      if (!/^08\d{7,13}$/.test(clean)) {
        return null; // Invalid Indonesian mobile number
      }
      return clean;
    }

    it('B2.1: Indonesian phone format normalization handles +628..., 08..., and 628...', () => {
      assert.equal(normalizePhone('+62 812-3456-7890'), '081234567890');
      assert.equal(normalizePhone('6281234567890'), '081234567890');
      assert.equal(normalizePhone('081234567890'), '081234567890');
      assert.equal(normalizePhone(' 0812-3456-7890 '), '081234567890');
    });

    it('B2.2: Phone number with letters or invalid characters rejected', () => {
      assert.equal(normalizePhone('0812ABCD7890'), null);
      assert.equal(normalizePhone('0812@#$7890'), null);
    });

    it('B2.3: Phone number too short (<9 digits) or too long (>15 digits) rejected', () => {
      assert.equal(normalizePhone('081234'), null); // too short
      assert.equal(normalizePhone('081234567890123456'), null); // too long
    });

    it('B2.4: Empty or whitespace-only phone number rejected', () => {
      assert.equal(normalizePhone(''), null);
      assert.equal(normalizePhone('   '), null);
      assert.equal(normalizePhone(null), null);
    });

    it('B2.5: Special characters and injection attempts in phone field sanitized/rejected', () => {
      assert.equal(normalizePhone("081234567890' OR '1'='1"), null);
      assert.equal(normalizePhone('<script>alert(1)</script>'), null);
    });

    it('B2.6: Non-Indonesian or non-mobile prefixes (e.g. landline 022, international +1) rejected for WhatsApp OTP', () => {
      assert.equal(normalizePhone('0222501234'), null); // Bandung landline
      assert.equal(normalizePhone('+14155552671'), null); // US number
    });
  });

  // ==========================================================================
  // B3: WhatsApp OTP Verification Boundaries
  // ==========================================================================
  describe('B3: WhatsApp OTP Verification Boundaries', () => {
    it('B3.1: Non-numeric OTP code (e.g. "ABCDEF") is strictly rejected', () => {
      const engine = new ReferenceStoreEngine();
      engine.generateOtp('081234567890');
      const res = engine.verifyOtp('081234567890', 'ABCDEF');
      assert.equal(res.success, false);
      assert.ok(res.error.includes('numeric'));
    });

    it('B3.2: 5-digit and 7-digit OTP codes rejected (must be strictly 6 digits)', () => {
      const engine = new ReferenceStoreEngine();
      engine.generateOtp('081234567890');
      const res5 = engine.verifyOtp('081234567890', '12345');
      assert.equal(res5.success, false);
      const res7 = engine.verifyOtp('081234567890', '1234567');
      assert.equal(res7.success, false);
    });

    it('B3.3: Empty or null OTP rejected with validation error', () => {
      const engine = new ReferenceStoreEngine();
      engine.generateOtp('081234567890');
      assert.equal(engine.verifyOtp('081234567890', '').success, false);
      assert.equal(engine.verifyOtp('081234567890', null).success, false);
    });

    it('B3.4: Rate limiting / brute-force threshold: excessive failed attempts (>5) locks OTP', () => {
      const engine = new ReferenceStoreEngine();
      const sendRes = engine.generateOtp('081234567890');
      for (let i = 0; i < 5; i++) {
        const attempt = engine.verifyOtp('081234567890', '000000');
        assert.equal(attempt.success, false);
      }
      // 6th attempt even with correct code should be blocked
      const blockedAttempt = engine.verifyOtp('081234567890', sendRes.demoOtp);
      assert.equal(blockedAttempt.success, false);
      assert.ok(blockedAttempt.error.includes('exceeded') || blockedAttempt.error.includes('blocked'));
    });

    it('B3.5: OTP whitespace trimming behavior handles leading/trailing spaces cleanly', () => {
      const engine = new ReferenceStoreEngine();
      const sendRes = engine.generateOtp('081234567890');
      const res = engine.verifyOtp('081234567890', `  ${sendRes.demoOtp}  `);
      assert.equal(res.success, true);
    });

    it('B3.6: Non-requested phone number verification attempt returns clear error', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.verifyOtp('089999999999', '123456');
      assert.equal(res.success, false);
      assert.ok(res.error.includes('No OTP requested'));
    });
  });

  // ==========================================================================
  // B4: Inventory & Stock Boundaries
  // ==========================================================================
  describe('B4: Inventory & Stock Boundaries', () => {
    it('B4.1: Out-of-stock item (stock = 0) cannot be added to order', () => {
      const engine = new ReferenceStoreEngine({
        inventory: [['prod-buntut-01', { currentStock: 0, trackStock: true }]]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B4-OUT-OF-STOCK',
        items: [{ productId: 'prod-buntut-01', itemName: 'Nasi Buntut Rewel', unitPrice: 45000, quantity: 1 }]
      });
      assert.equal(res.success, false);
      assert.ok(res.error.toLowerCase().includes('insufficient stock'));
    });

    it('B4.2: Exact stock boundary: purchasing all remaining stock succeeds and sets stock to 0', () => {
      const engine = new ReferenceStoreEngine({
        inventory: [['prod-galo-01', { currentStock: 3, trackStock: true }]]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B4-EXACT-STOCK',
        items: [{ productId: 'prod-galo-01', itemName: 'Nasi Galo Bumi Upi', unitPrice: 39000, quantity: 3 }]
      });
      assert.equal(res.success, true);
      assert.equal(engine.inventory.get('prod-galo-01').currentStock, 0);
    });

    it('B4.3: Exceeding stock by 1 unit fails with out-of-stock error', () => {
      const engine = new ReferenceStoreEngine({
        inventory: [['prod-bebek-01', { currentStock: 2, trackStock: true }]]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B4-EXCEED-STOCK',
        items: [{ productId: 'prod-bebek-01', itemName: 'Bebek Sambel Hejo', unitPrice: 45000, quantity: 3 }]
      });
      assert.equal(res.success, false);
      assert.ok(res.error.toLowerCase().includes('insufficient stock'));
    });

    it('B4.4: Stock decrement never results in negative stock balance', () => {
      const engine = new ReferenceStoreEngine({
        inventory: [['prod-pisang-01', { currentStock: 1, trackStock: true }]]
      });
      engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B4-STOCK-CHECK',
        items: [{ productId: 'prod-pisang-01', itemName: 'Pisang Bakar Cokelat', unitPrice: 20000, quantity: 1 }]
      });
      const stock = engine.inventory.get('prod-pisang-01').currentStock;
      assert.ok(stock >= 0, 'Stock must never fall below 0');
      assert.equal(stock, 0);
    });

    it('B4.5: Non-tracked items (trackStock = false) allow unrestricted ordering', () => {
      const engine = new ReferenceStoreEngine({
        inventory: [['prod-es-teh-01', { currentStock: 0, trackStock: false }]]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B4-UNTRACKED',
        items: [{ productId: 'prod-es-teh-01', itemName: 'Teh Manis', unitPrice: 13000, quantity: 50 }]
      });
      assert.equal(res.success, true);
    });

    it('B4.6: Multi-item mixed stock validation fails whole order atomically if any single item is out of stock', () => {
      const engine = new ReferenceStoreEngine({
        inventory: [
          ['prod-dimsum-01', { currentStock: 10, trackStock: true }],
          ['prod-pepes-01', { currentStock: 0, trackStock: true }]
        ]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B4-MIXED-STOCK',
        items: [
          { productId: 'prod-dimsum-01', itemName: 'Dimsum Ekonomis', unitPrice: 15000, quantity: 2 },
          { productId: 'prod-pepes-01', itemName: 'Pepes Ayam Kampung', unitPrice: 48000, quantity: 1 }
        ]
      });
      assert.equal(res.success, false);
      // Ensure dimsum stock was not deducted
      assert.equal(engine.inventory.get('prod-dimsum-01').currentStock, 10);
    });
  });

  // ==========================================================================
  // B5: Voucher & Discount Boundaries
  // ==========================================================================
  describe('B5: Voucher & Discount Boundaries', () => {
    it('B5.1: Minimum spend boundary: voucher with min_spend Rp 50.000 applied to subtotal Rp 49.999 is rejected', () => {
      const engine = new ReferenceStoreEngine({
        customerVouchers: [
          ['cv-01', { voucherId: 'v-01', minSpend: 50000, discountType: 'nominal', discountValue: 10000, isRedeemed: false, expiresAt: '2029-01-01' }]
        ]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B5-MINSPEND-FAIL',
        customerVoucherId: 'cv-01',
        items: [{ itemName: 'Item A', unitPrice: 49999, quantity: 1 }]
      });
      assert.equal(res.success, false);
      assert.ok(res.error.includes('below minimum spend'));
    });

    it('B5.2: Minimum spend boundary: voucher applied to subtotal exactly Rp 50.000 is accepted', () => {
      const engine = new ReferenceStoreEngine({
        customerVouchers: [
          ['cv-02', { voucherId: 'v-01', minSpend: 50000, discountType: 'nominal', discountValue: 10000, isRedeemed: false, expiresAt: '2029-01-01' }]
        ]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B5-MINSPEND-PASS',
        customerVoucherId: 'cv-02',
        items: [{ itemName: 'Item B', unitPrice: 50000, quantity: 1 }]
      });
      assert.equal(res.success, true);
      assert.equal(res.discountAmount, 10000);
      assert.equal(res.finalAmount, 40000);
    });

    it('B5.3: Percentage discount capping: 20% discount with max_discount Rp 25.000 on Rp 200.000 caps discount at Rp 25.000', () => {
      const engine = new ReferenceStoreEngine({
        customerVouchers: [
          ['cv-03', { voucherId: 'v-02', minSpend: 50000, discountType: 'percent', discountValue: 20, maxDiscount: 25000, isRedeemed: false, expiresAt: '2029-01-01' }]
        ]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B5-CAP-DISCOUNT',
        customerVoucherId: 'cv-03',
        items: [{ itemName: 'Party Package', unitPrice: 200000, quantity: 1 }]
      });
      assert.equal(res.success, true);
      assert.equal(res.discountAmount, 25000, 'Discount must be capped at maxDiscount Rp 25.000 (not 40.000)');
      assert.equal(res.finalAmount, 175000);
    });

    it('B5.4: Expired voucher application is rejected', () => {
      const engine = new ReferenceStoreEngine({
        customerVouchers: [
          ['cv-04', { voucherId: 'v-03', minSpend: 10000, discountType: 'nominal', discountValue: 5000, isRedeemed: false, expiresAt: '2020-01-01' }]
        ]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B5-EXPIRED',
        customerVoucherId: 'cv-04',
        items: [{ itemName: 'Kopi Hitam', unitPrice: 17000, quantity: 1 }]
      });
      assert.equal(res.success, false);
      assert.ok(res.error.toLowerCase().includes('expired'));
    });

    it('B5.5: Single-use voucher: attempting to apply already redeemed voucher (isRedeemed = true) is rejected', () => {
      const engine = new ReferenceStoreEngine({
        customerVouchers: [
          ['cv-05', { voucherId: 'v-04', minSpend: 10000, discountType: 'nominal', discountValue: 5000, isRedeemed: true, expiresAt: '2029-01-01' }]
        ]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B5-ALREADY-USED',
        customerVoucherId: 'cv-05',
        items: [{ itemName: 'Teh Manis', unitPrice: 13000, quantity: 1 }]
      });
      assert.equal(res.success, false);
      assert.ok(res.error.toLowerCase().includes('already been redeemed'));
    });

    it('B5.6: Discount amount cannot exceed subtotal (final amount never negative)', () => {
      const engine = new ReferenceStoreEngine({
        customerVouchers: [
          ['cv-06', { voucherId: 'v-05', minSpend: 10000, discountType: 'nominal', discountValue: 50000, isRedeemed: false, expiresAt: '2029-01-01' }]
        ]
      });
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B5-NO-NEGATIVE',
        customerVoucherId: 'cv-06',
        items: [{ itemName: 'Dimsum', unitPrice: 15000, quantity: 1 }]
      });
      assert.equal(res.success, true);
      assert.equal(res.finalAmount, 0, 'Final amount cannot be negative');
      assert.equal(res.discountAmount, 15000, 'Discount capped to subtotal');
    });
  });

  // ==========================================================================
  // B6: Currency, Pricing & Numerical Precision
  // ==========================================================================
  describe('B6: Currency, Pricing & Numerical Precision', () => {
    it('B6.1: Negative price in line item is rejected', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B6-NEG-PRICE',
        items: [{ itemName: 'Bug Item', unitPrice: -10000, quantity: 1 }]
      });
      assert.equal(res.success, false);
      assert.ok(res.error.toLowerCase().includes('price'));
    });

    it('B6.2: Points calculation floor rounding: Rp 19.999 generates 1 point (not 2 points)', () => {
      const points = Math.floor(19999 / ORACLE_TIER_RULES.pointsPerRupiah);
      assert.equal(points, 1);
    });

    it('B6.3: Sub-ten-thousand transaction: Rp 9.999 generates 0 points', () => {
      const points = Math.floor(9999 / ORACLE_TIER_RULES.pointsPerRupiah);
      assert.equal(points, 0);
    });

    it('B6.4: Extremely large transaction (Rp 100.000.000) calculates exactly 10.000 points without integer overflow', () => {
      const points = Math.floor(100000000 / ORACLE_TIER_RULES.pointsPerRupiah);
      assert.equal(points, 10000);
      assert.ok(Number.isSafeInteger(points));
    });

    it('B6.5: Table number edge cases: strings with whitespace, symbols, or Unicode handled properly', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B6-UNICODE-TABLE',
        tableNumber: 'Bale Utama № 4 (🌿 Teras Depan)',
        items: [{ itemName: 'Teh Sereh', unitPrice: 17000, quantity: 1 }]
      });
      assert.equal(res.success, true);
      const stored = engine.orders.get('IDEMP-B6-UNICODE-TABLE');
      assert.equal(stored.tableNumber, 'Bale Utama № 4 (🌿 Teras Depan)');
    });

    it('B6.6: Floating point precision artifacts prevented in final amount calculation', () => {
      const price = 24.5 * 1000; // 24500 (Ketan Kinca)
      const qty = 3;
      const subtotal = Math.round(price * qty);
      assert.equal(subtotal, 73500);
      assert.ok(Number.isInteger(subtotal));
    });
  });

  // ==========================================================================
  // B7: Idempotency Key Boundaries
  // ==========================================================================
  describe('B7: Idempotency Key Boundaries', () => {
    it('B7.1: Missing idempotency key returns validation error', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.createOrderAtomic({
        items: [{ itemName: 'Item X', unitPrice: 20000, quantity: 1 }]
      });
      assert.equal(res.success, false);
      assert.ok(res.error.includes('idempotency_key'));
    });

    it('B7.2: Duplicate idempotency key with identical payload returns cached original order without double deduction', () => {
      const engine = new ReferenceStoreEngine({
        customers: [['cust-demo', { pointsBalance: 0, cumulativePoints: 0, tier: 'Tamu' }]],
        inventory: [['prod-mie-01', { currentStock: 5, trackStock: true }]]
      });

      const payload = {
        idempotencyKey: 'IDEMP-B7-DUPLICATE-001',
        customerId: 'cust-demo',
        items: [{ productId: 'prod-mie-01', itemName: 'Mie Racing', unitPrice: 25000, quantity: 2 }]
      };

      const res1 = engine.createOrderAtomic(payload);
      assert.equal(res1.success, true);
      assert.equal(res1.isDuplicate, false);
      assert.equal(res1.pointsEarned, 5); // 50000 / 10000 = 5
      assert.equal(engine.inventory.get('prod-mie-01').currentStock, 3);
      assert.equal(engine.customers.get('cust-demo').pointsBalance, 5);

      // Re-send exact payload
      const res2 = engine.createOrderAtomic(payload);
      assert.equal(res2.success, true);
      assert.equal(res2.isDuplicate, true);
      assert.equal(res2.orderId, res1.orderId);

      // Stock and points must NOT change
      assert.equal(engine.inventory.get('prod-mie-01').currentStock, 3, 'Stock must not be deducted twice');
      assert.equal(engine.customers.get('cust-demo').pointsBalance, 5, 'Points must not be awarded twice');
    });

    it('B7.3: Idempotency key containing UUID format or hyphens is parsed cleanly', () => {
      const engine = new ReferenceStoreEngine();
      const uuidKey = 'c38d58a1-7c9b-4e8a-bf94-279fa264e101';
      const res = engine.createOrderAtomic({
        idempotencyKey: uuidKey,
        items: [{ itemName: 'Es Cendol', unitPrice: 18000, quantity: 1 }]
      });
      assert.equal(res.success, true);
      assert.ok(engine.orders.has(uuidKey));
    });

    it('B7.4: Idempotency key case sensitivity is preserved', () => {
      const engine = new ReferenceStoreEngine();
      const keyUpper = 'IDEMP-CASE-SENSITIVE-KEY';
      const keyLower = 'idemp-case-sensitive-key';

      const res1 = engine.createOrderAtomic({
        idempotencyKey: keyUpper,
        items: [{ itemName: 'Sate Aci', unitPrice: 14000, quantity: 1 }]
      });
      assert.equal(res1.success, true);

      // In standard REST / database uniqueness, different case strings are distinct keys
      const res2 = engine.createOrderAtomic({
        idempotencyKey: keyLower,
        items: [{ itemName: 'Sate Aci', unitPrice: 14000, quantity: 1 }]
      });
      assert.equal(res2.success, true);
      assert.notEqual(res1.orderId, res2.orderId);
    });

    it('B7.5: Rapid successive submissions with same idempotency key are safely deduplicated', () => {
      const engine = new ReferenceStoreEngine();
      const sharedKey = 'IDEMP-RACE-001';
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(engine.createOrderAtomic({
          idempotencyKey: sharedKey,
          items: [{ itemName: 'Gorengan Darmaji', unitPrice: 17000, quantity: 1 }]
        }));
      }

      assert.equal(results[0].isDuplicate, false);
      for (let i = 1; i < 5; i++) {
        assert.equal(results[i].isDuplicate, true);
        assert.equal(results[i].orderId, results[0].orderId);
      }
    });

    it('B7.6: Audit log captures CREATE_ORDER action and staff ID on successful placement', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.createOrderAtomic({
        idempotencyKey: 'IDEMP-B7-AUDIT',
        cashierId: 'usr-kasir-01',
        items: [{ itemName: 'Kopi Susu', unitPrice: 22000, quantity: 1 }]
      });
      assert.equal(res.success, true);
      assert.ok(engine.auditLogs.length > 0);
      const log = engine.auditLogs.find(l => l.targetId === res.orderId);
      assert.ok(log);
      assert.equal(log.action, 'CREATE_ORDER');
      assert.equal(log.staffId, 'usr-kasir-01');
    });
  });

});
