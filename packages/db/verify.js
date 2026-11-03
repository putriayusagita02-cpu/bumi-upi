#!/usr/bin/env node
/**
 * Dedicated Unit Verification Script for @bumi-upi/db
 * Validates:
 * 1. Full 105 menu catalog items and 16 categories
 * 2. Medium/Large and Panas/Dingin variants
 * 3. MockStore pre-population (200 customers, 2,140 transactions)
 * 4. Atomic order creation, idempotency, voucher locking, and stock reduction
 * 5. WhatsApp OTP generation and verification
 * 6. RFM quintile engine and 7-segment classification
 * 7. Unified package exports
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load module from compiled or src via TypeScript loader
// In Node 22+, ts files can be loaded, or we compile first
console.log('\n======================================================================');
console.log('🌿 @BUMI-UPI/DB UNIT VERIFICATION SUITE');
console.log('======================================================================\n');

async function run() {
  const createJiti = (await import('jiti')).default;
  const jiti = createJiti(__dirname);
  const dbMod = jiti('./src/index.ts');

  const {
    DB_MODULE_NAME,
    CATALOG_CATEGORIES,
    MENU_CATEGORIES,
    CATALOG_105_ITEMS,
    MockStore,
    mockStore,
    getMenuCatalog,
    getMenuItem,
    createOrderAtomic,
    getCustomerProfile,
    sendOtp,
    verifyOtp,
    getRfmSegments,
    getTransactions,
    updateStock,
    isMockMode,
    classifyRfmSegment,
    RFM_SEGMENT_MAP
  } = dbMod;

  console.log(`[PASS] DB Module Name: ${DB_MODULE_NAME}`);

  // 1. Verify Catalog Item Count = 105
  console.log('Testing 1: Catalog 105 Items & 16 Categories...');
  assert.equal(CATALOG_105_ITEMS.length, 105, 'Catalog must contain exactly 105 items');
  assert.equal(CATALOG_CATEGORIES.length, 16, 'Catalog must contain exactly 16 categories');
  assert.equal(MENU_CATEGORIES.length, 16, 'MENU_CATEGORIES must contain exactly 16 categories');

  // Check unique IDs and names
  const ids = new Set(CATALOG_105_ITEMS.map((i) => i.id));
  assert.equal(ids.size, 105, 'All 105 item IDs must be unique');
  const names = new Set(CATALOG_105_ITEMS.map((i) => i.name.toLowerCase()));
  assert.equal(names.size, 105, 'All 105 item names must be unique');

  // Verify category item distribution
  const expectedDist = [
    { name: 'Cemilan Cepuluh', count: 18 },
    { name: 'Ber Pepes An', count: 4 },
    { name: 'Emih - Emihan', count: 6 },
    { name: 'Pemadam Kelaparan', count: 7 },
    { name: 'Tuntutan Masyarakat', count: 8 },
    { name: 'Sumber Protein', count: 5 },
    { name: 'Seger Adem', count: 9 },
    { name: 'Es Esan', count: 3 },
    { name: 'Teh & Susu', count: 10 },
    { name: 'Jejamuan', count: 3 },
    { name: 'Kopi', count: 6 },
    { name: 'Jus 4 U', count: 8 },
    { name: 'Satu Rasa Cukup', count: 6 },
    { name: 'Roti Bakar Gurih', count: 6 },
    { name: 'Dua Lebih Spesial', count: 2 },
    { name: 'Pisang Bakar', count: 4 }
  ];

  for (const exp of expectedDist) {
    const items = CATALOG_105_ITEMS.filter((i) => i.category === exp.name);
    assert.equal(items.length, exp.count, `Category ${exp.name} must have ${exp.count} items, found ${items.length}`);
  }
  console.log('  -> All 16 categories and 105 items match exact MENU-REGULER.pdf distribution.');

  // 2. Verify Drink Variants (M/L and Panas/Dingin)
  console.log('Testing 2: Drink Variants (M/L and Panas/Dingin)...');
  const drinksWithML = CATALOG_105_ITEMS.filter((i) => i.variants && i.variants.sizeM && i.variants.sizeL);
  assert.equal(drinksWithML.length, 9, 'Must have exactly 9 drinks with M/L variants');

  const cincau = drinksWithML.find((i) => i.name === 'Es Cincau Jadoel');
  assert.ok(cincau, 'Es Cincau Jadoel must exist');
  assert.equal(cincau.variants.sizeM, 19000);
  assert.equal(cincau.variants.sizeL, 24000);

  const drinksWithTemp = CATALOG_105_ITEMS.filter((i) => i.temps && i.temps.length > 1);
  assert.ok(drinksWithTemp.length >= 10, 'Must have at least 10 drinks supporting both panas and dingin');
  console.log(`  -> Verified 9 M/L drinks and ${drinksWithTemp.length} dual-temperature drinks.`);

  // 3. Verify MockStore Initialization
  console.log('Testing 3: In-Memory MockStore Pre-Population...');
  const store = new MockStore();
  const rawCustomers = Array.from(new Set(store.customers.values())).filter((c) => c.role === 'customer');
  // Including admin and kasir, total unique profiles = 200
  const allUniqueProfiles = Array.from(new Set(store.customers.values()));
  assert.equal(allUniqueProfiles.length, 200, `MockStore must contain exactly 200 profiles, found ${allUniqueProfiles.length}`);

  // Check demo user
  const demoCust = store.getCustomerProfile('081234567890');
  assert.ok(demoCust, 'Demo customer 081234567890 must exist');
  assert.equal(demoCust.name, 'Dimas Kurniawan');
  assert.equal(demoCust.qr_code, 'BUMI-CUST-8899');
  assert.equal(demoCust.tier, 'Sahabat');

  // Check 2,140 transactions
  const allUniqueOrders = Array.from(new Set(store.orders.values()));
  assert.ok(allUniqueOrders.length >= 2140, `MockStore must have at least 2,140 transactions, found ${allUniqueOrders.length}`);
  console.log(`  -> Verified 200 customers and ${allUniqueOrders.length} transactions pre-populated.`);

  // 4. Verify Atomic Order Placement, Stock Reduction & Idempotency
  console.log('Testing 4: Atomic Order Placement, Stock Deduction & Idempotency...');
  const testStockItem = CATALOG_105_ITEMS[0];
  const initialStock = store.inventory.get(testStockItem.id).currentStock;

  const orderParams = {
    idempotencyKey: 'VERIFY-IDEMP-001-' + Date.now(),
    customerId: 'usr-cust-demo',
    cashierId: 'usr-kasir-01',
    tableNumber: 'Meja 08',
    items: [
      { productId: testStockItem.id, itemName: testStockItem.name, unitPrice: testStockItem.price, quantity: 4, subtotal: testStockItem.price * 4 }
    ],
    customerVoucherId: 'cv-demo-01'
  };

  const res1 = store.createOrderAtomic(orderParams);
  assert.equal(res1.success, true, 'Order 1 must succeed');
  assert.equal(res1.isDuplicate, false, 'First call must not be duplicate');
  assert.ok(res1.orderNumber, 'Order must have orderNumber');
  assert.equal(res1.subtotal, testStockItem.price * 4);

  // Check stock deduction
  const updatedStock = store.inventory.get(testStockItem.id).currentStock;
  assert.equal(updatedStock, initialStock - 4, 'Stock must decrease by 4');

  // Check voucher locked
  const cvRecord = store.customerVouchers.get('cv-demo-01');
  assert.equal(cvRecord.isRedeemed, true, 'Customer voucher must be marked isRedeemed');

  // Test duplicate idempotency invocation
  const res2 = store.createOrderAtomic(orderParams);
  assert.equal(res2.success, true, 'Duplicate order call must succeed');
  assert.equal(res2.isDuplicate, true, 'Duplicate call must return isDuplicate: true');
  assert.equal(res2.orderId, res1.orderId, 'Duplicate call must return same orderId');
  assert.equal(store.inventory.get(testStockItem.id).currentStock, updatedStock, 'Stock must not decrease again on duplicate');
  console.log('  -> Atomic order, stock deduction, and idempotency verified.');

  // 5. Verify WhatsApp OTP Generation & Verification
  console.log('Testing 5: WhatsApp OTP Generation & Verification...');
  const testPhone = '081999888777';
  const otpRes = store.sendOtp(testPhone);
  assert.equal(otpRes.success, true);
  assert.equal(otpRes.phone, testPhone);
  assert.match(otpRes.demoOtp, /^\d{6}$/, 'OTP must be 6 digits');
  assert.ok(otpRes.banner.includes('[WHATSAPP OTP CONSOLE MODE]'));

  // Test incorrect OTP
  const failVerify = store.verifyOtp(testPhone, '000000');
  assert.equal(failVerify.success, false);

  // Test correct OTP
  const successVerify = store.verifyOtp(testPhone, otpRes.demoOtp);
  assert.equal(successVerify.success, true);
  assert.ok(successVerify.user, 'Verified user must be returned');

  // Test replay attack (cannot reuse OTP)
  const replayVerify = store.verifyOtp(testPhone, otpRes.demoOtp);
  assert.equal(replayVerify.success, false);
  console.log('  -> WhatsApp OTP generation, verification, and replay protection verified.');

  // 6. Verify RFM Engine
  console.log('Testing 6: RFM Quintile & 7 Customer Segments...');
  const rfmResult = store.getRfmSegments();
  assert.ok(rfmResult.scores.length > 0, 'Must have RFM scores');
  assert.ok(rfmResult.summary, 'Must have RFM summary');
  assert.ok(rfmResult.summary.totalCustomers >= 198, 'Total customer profiles in RFM');

  const segmentKeys = Object.keys(rfmResult.summary.segments);
  assert.equal(segmentKeys.length, 7, 'Must have exactly 7 RFM segments');
  assert.ok(segmentKeys.includes('Champions'));
  assert.ok(segmentKeys.includes('Loyal'));
  assert.ok(segmentKeys.includes('Potensial Loyal'));
  assert.ok(segmentKeys.includes('Baru'));
  assert.ok(segmentKeys.includes('Berisiko'));
  assert.ok(segmentKeys.includes('Hampir Hilang'));
  assert.ok(segmentKeys.includes('Hilang'));

  // Check Sunda / Indonesian label mapping
  assert.equal(RFM_SEGMENT_MAP['Champions'], 'Juara');
  assert.equal(RFM_SEGMENT_MAP['Loyal'], 'Setia');
  assert.equal(RFM_SEGMENT_MAP['Potensial Loyal'], 'Potensial');
  assert.equal(RFM_SEGMENT_MAP['Baru'], 'Butuh Perhatian');
  assert.equal(RFM_SEGMENT_MAP['Hampir Hilang'], 'Hampir Lepas');
  assert.equal(RFM_SEGMENT_MAP['Hilang'], 'Tertidur');
  console.log('  -> RFM 7-segment quintiles and Indonesian translations verified.');

  // 7. Verify Module Exports
  console.log('Testing 7: Unified Package Functions Export...');
  assert.equal(typeof getMenuCatalog, 'function');
  assert.equal(typeof getMenuItem, 'function');
  assert.equal(typeof createOrderAtomic, 'function');
  assert.equal(typeof getCustomerProfile, 'function');
  assert.equal(typeof sendOtp, 'function');
  assert.equal(typeof verifyOtp, 'function');
  assert.equal(typeof getRfmSegments, 'function');
  assert.equal(typeof getTransactions, 'function');
  assert.equal(typeof updateStock, 'function');
  assert.equal(isMockMode(), true, 'Default without Supabase credentials must be mock mode');
  console.log('  -> All repository pattern functions exported and verified.');

  console.log('\n======================================================================');
  console.log('🎉 ALL @BUMI-UPI/DB VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  console.log('======================================================================\n');
}

run().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
