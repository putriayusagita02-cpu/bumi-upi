#!/usr/bin/env node
/**
 * MILESTONE 5 ADVERSARIAL CHALLENGER STRESS HARNESS
 * Empirical stress tests and boundary assertions across the entire Bumi Upi monorepo.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('======================================================================');
console.log('🔥 BUMI UPI — M5 EMPIRICAL CHALLENGER ADVERSARIAL STRESS HARNESS');
console.log('======================================================================');

let passedTests = 0;
let failedTests = 0;

function challenge(title, fn) {
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${title}`);
  } catch (err) {
    failedTests++;
    console.error(`  [FAIL] ${title}: ${err.message}`);
  }
}

async function run() {
  const createJiti = (await import('jiti')).default;
  const jiti = createJiti(path.join(ROOT, 'packages', 'db'));
  const dbMod = jiti('./src/index.ts');

  const {
    MockStore,
    isMockMode,
    CATALOG_CATEGORIES,
    CATALOG_105_ITEMS,
    classifyRfmSegment,
    RFM_SEGMENT_MAP
  } = dbMod;

  // --------------------------------------------------------------------------
  // SECTION 1: ZERO-CREDENTIAL OFFLINE RESILIENCE
  // --------------------------------------------------------------------------
  console.log('\n--- 1. ZERO-CREDENTIAL OFFLINE RESILIENCE ---');

  challenge('Zero-credential detection guard triggers mock mode', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_ANON_KEY;

    assert.equal(isMockMode(), true, 'isMockMode() must return true when env vars are absent');
    assert.equal(isMockMode('', ''), true, 'isMockMode("", "") must return true');
    assert.equal(isMockMode('https://placeholder.supabase.co', 'placeholder-key'), true, 'Placeholder URL must return true');
  });

  const offlineStore = new MockStore();

  challenge('Offline MockStore retrieves full catalog (105 items) and 16 categories without network', () => {
    const catalog = offlineStore.getMenuCatalog();
    assert.equal(catalog.length, 105, 'Catalog should contain exactly 105 items');
    const categories = offlineStore.getCategories();
    assert.equal(categories.length, 16, 'Categories should contain exactly 16 categories');
  });

  challenge('Offline MockStore retrieves individual items and variants without network', () => {
    const item1 = offlineStore.getMenuItem(1);
    assert.ok(item1, 'Item #1 must exist offline');
    assert.equal(item1.name, 'Sate Aci');

    const cincau = offlineStore.getMenuItem(66);
    assert.ok(cincau, 'Es Cincau Jadoel (#66) must exist');
    assert.ok(cincau.variants.sizeM > 0, 'Must have sizeM price');
    assert.ok(cincau.variants.sizeL > cincau.variants.sizeM, 'sizeL must be > sizeM');
  });

  challenge('Offline customer profiles & demo accounts initialized', () => {
    const admin = offlineStore.getCustomerProfile('putriayusagita02@gmail.com');
    assert.ok(admin, 'Admin putriayusagita02@gmail.com must exist');
    assert.equal(admin.role, 'admin');

    const kasir = offlineStore.getCustomerProfile('kasir@bumiupi.id');
    assert.ok(kasir, 'Kasir kasir@bumiupi.id must exist');
    assert.equal(kasir.role, 'kasir');

    const customer = offlineStore.getCustomerProfile('081234567890');
    assert.ok(customer, 'Customer 081234567890 must exist');
    assert.equal(customer.name, 'Dimas Kurniawan');
    assert.equal(customer.points_balance, 142);
    assert.equal(customer.tier, 'Sahabat');
  });

  challenge('Offline 2,140 transactions and RFM analysis without network', () => {
    const rfm = offlineStore.getRfmSegments();
    assert.ok(rfm.scores, 'RFM analysis must produce customer scores');
    assert.ok(rfm.scores.length >= 195, `RFM must classify customers (got ${rfm.scores.length})`);
    assert.ok(rfm.summary, 'RFM summary must exist');
    assert.ok(rfm.summary.segments, 'RFM summary must contain segment breakdowns');
    assert.equal(Object.keys(rfm.summary.segments).length, 7, 'Must have exactly 7 segments');
    assert.ok(rfm.summary.totalRevenue > 0, 'RFM total revenue must be > 0');
    assert.ok(rfm.summary.averageAOV > 0, 'RFM Average Order Value must be > 0');
  });

  // --------------------------------------------------------------------------
  // SECTION 2: WHATSAPP OTP CONSOLE MODE & ADVERSARIAL SECURITY
  // --------------------------------------------------------------------------
  console.log('\n--- 2. WHATSAPP OTP CONSOLE MODE & SECURITY ---');

  challenge('WhatsApp OTP generation outputs authentic console banner', () => {
    let capturedLog = '';
    const originalLog = console.log;
    console.log = (...args) => {
      capturedLog += args.join(' ') + '\n';
    };

    const res = offlineStore.sendOtp('085512345678');
    console.log = originalLog;

    assert.equal(res.success, true, 'sendOtp must return success: true');
    assert.ok(/^\d{6}$/.test(res.demoOtp), `OTP must be 6 digits, got ${res.demoOtp}`);
    assert.ok(capturedLog.includes('WHATSAPP OTP CONSOLE MODE'), 'Console banner must include title');
    assert.ok(capturedLog.includes('085512345678'), 'Console banner must include recipient phone');
    assert.ok(capturedLog.includes('Sampurasun!'), 'Console banner must include Sundanese greeting');
    assert.ok(capturedLog.includes(res.demoOtp), 'Console banner must display OTP code');
  });

  challenge('Valid OTP verifies successfully and activates customer', () => {
    const phone = '085587654321';
    const sendRes = offlineStore.sendOtp(phone);
    const verifyRes = offlineStore.verifyOtp(phone, sendRes.demoOtp);
    assert.equal(verifyRes.success, true, 'Valid OTP must verify');
    assert.ok(verifyRes.user, 'Verification must return user profile');
    assert.equal(verifyRes.user.phone, phone);
    assert.equal(verifyRes.user.is_phone_verified, true);
  });

  challenge('Replay attack: Used OTP cannot be reused', () => {
    const phone = '085587654321';
    const otpRecord = offlineStore.otpStore.get(phone);
    const replayRes = offlineStore.verifyOtp(phone, otpRecord.code);
    assert.equal(replayRes.success, false, 'Replay verification must be rejected');
    assert.ok(replayRes.error.includes('sudah pernah digunakan'), 'Error message must reflect single-use policy');
  });

  challenge('Brute force attack: Lockout after 5 failed attempts', () => {
    const phone = '085599887766';
    offlineStore.sendOtp(phone);

    // 5 failed attempts
    for (let i = 1; i <= 5; i++) {
      const failRes = offlineStore.verifyOtp(phone, '000000');
      assert.equal(failRes.success, false);
    }

    // 6th attempt should be locked out
    const lockoutRes = offlineStore.verifyOtp(phone, '000000');
    assert.equal(lockoutRes.success, false);
    assert.ok(lockoutRes.error.includes('Batas percobaan OTP terlampaui'), 'Lockout error must trigger on >5 attempts');
  });

  challenge('Expired OTP rejection', () => {
    const phone = '085533221100';
    offlineStore.sendOtp(phone);
    const record = offlineStore.otpStore.get(phone);
    record.expiresAt = Date.now() - 1000;

    const expiredRes = offlineStore.verifyOtp(phone, record.code);
    assert.equal(expiredRes.success, false);
    assert.ok(expiredRes.error.includes('kedaluwarsa'), 'Expired OTP must be rejected');
  });

  // --------------------------------------------------------------------------
  // SECTION 3: ATOMIC TRANSACTIONS, RACE CONDITIONS & INVARIANTS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. ATOMIC TRANSACTIONS & CONCURRENCY ---');

  challenge('Atomic stock deduction prevents negative stock (overselling)', () => {
    const freshStore = new MockStore();
    freshStore.inventory.set(1, {
      id: 'inv-1',
      productId: 1,
      currentStock: 5,
      minimumStock: 2,
      unit: 'porsi',
      trackStock: true,
      updatedAt: new Date().toISOString()
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 1; i <= 8; i++) {
      const res = freshStore.createOrderAtomic({
        customerId: 'usr-cust-demo',
        customerPhone: '081234567890',
        orderType: 'dine_in',
        tableNumber: 'Meja 01',
        items: [{ productId: 1, quantity: 1, unitPrice: 14000, selectedVariant: 'standard', notes: '' }],
        paymentMethod: 'qris',
        idempotencyKey: `idem-stock-test-${i}`
      });

      if (res.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    assert.equal(successCount, 5, 'Exactly 5 orders should succeed');
    assert.equal(failCount, 3, 'Exactly 3 orders should fail due to stock depletion');
    assert.equal(freshStore.inventory.get(1).currentStock, 0, 'Final stock must be exactly 0, never negative');
  });

  challenge('Idempotency key prevents duplicate charges and duplicate stock deduction', () => {
    const freshStore = new MockStore();
    freshStore.updateStock(2, 50);
    const initialStock = freshStore.inventory.get(2).currentStock;
    const customer = freshStore.getCustomerProfile('081234567890');
    const initialPoints = customer.points_balance;

    const idempotencyKey = 'fixed-uuid-idempotency-key-12345';

    const orderPayload = {
      customerId: 'usr-cust-demo',
      customerPhone: '081234567890',
      orderType: 'dine_in',
      tableNumber: 'Meja 05',
      items: [{ productId: 2, quantity: 2, unitPrice: 15000, selectedVariant: 'standard', notes: '' }],
      paymentMethod: 'qris',
      idempotencyKey
    };

    // First attempt
    const res1 = freshStore.createOrderAtomic(orderPayload);
    assert.equal(res1.success, true);
    assert.equal(res1.isDuplicate, false);
    const stockAfter1 = freshStore.inventory.get(2).currentStock;
    assert.equal(stockAfter1, initialStock - 2, 'First order deducted 2 items');

    // Second attempt with SAME idempotency key
    const res2 = freshStore.createOrderAtomic(orderPayload);
    assert.equal(res2.success, true);
    assert.equal(res2.isDuplicate, true);
    assert.equal(res2.orderId, res1.orderId, 'Must return same cached order ID');

    // Verify stock was NOT deducted again
    const stockAfter2 = freshStore.inventory.get(2).currentStock;
    assert.equal(stockAfter2, stockAfter1, 'Stock must NOT be deducted on duplicate idempotency key');

    // Verify points balance was NOT duplicated
    assert.equal(customer.points_balance, initialPoints + Math.floor(30000 / 10000), 'Points must not double credit');
  });

  challenge('Voucher minimum spend and single-use enforcement', () => {
    const freshStore = new MockStore();
    const demoVcr = freshStore.customerVouchers.get('cv-demo-01');
    assert.ok(demoVcr, 'Demo voucher cv-demo-01 must exist');

    // 1. Below minimum spend (Rp 50.000 minimum spend, order is Rp 14.000)
    const belowMinRes = freshStore.createOrderAtomic({
      customerId: 'usr-cust-demo',
      customerPhone: '081234567890',
      orderType: 'dine_in',
      items: [{ productId: 1, quantity: 1, unitPrice: 14000, selectedVariant: 'standard', notes: '' }],
      customerVoucherId: 'cv-demo-01',
      paymentMethod: 'qris',
      idempotencyKey: 'idem-voucher-min-spend'
    });
    assert.equal(belowMinRes.success, false, 'Order below min spend should be rejected');
    assert.ok(belowMinRes.error.includes('belum mencapai batas minimum belanja'), 'Error should specify minimum spend requirement');

    // 2. Above minimum spend (4 * 14.000 = 56.000 >= 50.000)
    const validVoucherRes = freshStore.createOrderAtomic({
      customerId: 'usr-cust-demo',
      customerPhone: '081234567890',
      orderType: 'dine_in',
      items: [{ productId: 1, quantity: 4, unitPrice: 14000, selectedVariant: 'standard', notes: '' }],
      customerVoucherId: 'cv-demo-01',
      paymentMethod: 'qris',
      idempotencyKey: 'idem-voucher-valid'
    });
    assert.equal(validVoucherRes.success, true, 'Valid voucher order should succeed');
    assert.ok(validVoucherRes.discountAmount > 0, 'Discount amount must be applied');
    assert.equal(demoVcr.isRedeemed, true, 'Voucher should be marked redeemed');

    // 3. Re-using the same voucher for same customer
    const reuseVoucherRes = freshStore.createOrderAtomic({
      customerId: 'usr-cust-demo',
      customerPhone: '081234567890',
      orderType: 'dine_in',
      items: [{ productId: 1, quantity: 4, unitPrice: 14000, selectedVariant: 'standard', notes: '' }],
      customerVoucherId: 'cv-demo-01',
      paymentMethod: 'qris',
      idempotencyKey: 'idem-voucher-reuse'
    });
    assert.equal(reuseVoucherRes.success, false, 'Used voucher must be rejected on second use');
    assert.ok(reuseVoucherRes.error.includes('sudah pernah digunakan'), 'Error message should indicate voucher already used');
  });

  // --------------------------------------------------------------------------
  // SECTION 4: CATALOG INTEGRITY (105 ITEMS & 16 CATEGORIES)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. CATALOG INTEGRITY (105 ITEMS & 16 CATEGORIES) ---');

  challenge('Exact 16 categories and 105 items present', () => {
    assert.equal(CATALOG_CATEGORIES.length, 16, 'Exactly 16 categories required');
    assert.equal(CATALOG_105_ITEMS.length, 105, 'Exactly 105 items required');
  });

  challenge('Zero corrupted fields across all 105 items', () => {
    const validCategories = new Set(CATALOG_CATEGORIES.map(c => c.name));
    for (const item of CATALOG_105_ITEMS) {
      assert.ok(item.id > 0, `Item ${item.name} has invalid id: ${item.id}`);
      assert.ok(item.name && item.name.length > 0, `Item has empty name`);
      assert.ok(item.price > 0, `Item ${item.name} has non-positive price: ${item.price}`);
      assert.ok(!isNaN(item.price), `Item ${item.name} price is NaN`);
      assert.ok(validCategories.has(item.category), `Item ${item.name} has invalid category: ${item.category}`);
      assert.ok(item.slug && item.slug.length > 0, `Item ${item.name} missing slug`);
    }
  });

  challenge('Category distribution strictly matches MENU-REGULER.pdf specification', () => {
    const expectedCounts = {
      'Cemilan Cepuluh': 18,
      'Ber Pepes An': 4,
      'Emih - Emihan': 6,
      'Pemadam Kelaparan': 7,
      'Tuntutan Masyarakat': 8,
      'Sumber Protein': 5,
      'Seger Adem': 9,
      'Es Esan': 3,
      'Teh & Susu': 10,
      'Jejamuan': 3,
      'Kopi': 6,
      'Jus 4 U': 8,
      'Satu Rasa Cukup': 6,
      'Roti Bakar Gurih': 6,
      'Dua Lebih Spesial': 2,
      'Pisang Bakar': 4
    };

    let totalCheck = 0;
    for (const [catName, count] of Object.entries(expectedCounts)) {
      const actualCount = CATALOG_105_ITEMS.filter(i => i.category === catName).length;
      assert.equal(actualCount, count, `Category ${catName} expected ${count}, got ${actualCount}`);
      totalCheck += actualCount;
    }
    assert.equal(totalCheck, 105, 'Sum of category items must be 105');
  });

  challenge('Drink variant pricing sanity (Medium / Large & Panas / Dingin)', () => {
    const mlDrinks = CATALOG_105_ITEMS.filter(i => i.variants && i.variants.sizeM && i.variants.sizeL);
    assert.equal(mlDrinks.length, 9, 'Must be exactly 9 drinks with M/L variants');
    for (const drink of mlDrinks) {
      assert.ok(drink.variants.sizeM > 0, `${drink.name} sizeM price > 0`);
      assert.ok(drink.variants.sizeL > drink.variants.sizeM, `${drink.name} sizeL must cost more than sizeM`);
    }

    const dualTempDrinks = CATALOG_105_ITEMS.filter(i => i.temps && i.temps.length > 1);
    assert.ok(dualTempDrinks.length >= 10, `At least 10 dual temp drinks expected (found ${dualTempDrinks.length})`);
    for (const drink of dualTempDrinks) {
      assert.ok(drink.temps.includes('panas') && drink.temps.includes('dingin'), `${drink.name} must offer panas & dingin`);
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 5: README CREDENTIALS & DEMO COMPLIANCE
  // --------------------------------------------------------------------------
  console.log('\n--- 5. README CREDENTIALS & DEMO COMPLIANCE ---');

  challenge('README.md includes all official demo credentials', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf-8');
    assert.ok(readme.includes('putriayusagita02@gmail.com'), 'README must contain admin email putriayusagita02@gmail.com');
    assert.ok(readme.includes('BumiUpiAdmin2026!'), 'README must contain admin password BumiUpiAdmin2026!');
    assert.ok(readme.includes('kasir@bumiupi.id'), 'README must contain kasir email kasir@bumiupi.id');
    assert.ok(readme.includes('kasir2026'), 'README must contain kasir password kasir2026');
    assert.ok(readme.includes('customer@bumiupi.id'), 'README must contain customer email customer@bumiupi.id');
    assert.ok(readme.includes('081234567890'), 'README must contain customer phone 081234567890');
    assert.ok(readme.includes('Dimas Kurniawan'), 'README must mention customer name Dimas Kurniawan');
    assert.ok(readme.includes('142 Poin') || readme.includes('142 poin'), 'README must mention customer points 142');
  });

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`STRESS HARNESS RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal stress harness failure:', err);
  process.exit(1);
});
