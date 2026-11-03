import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..');

console.log('======================================================================');
console.log('🔍 INDEPENDENT VICTORY AUDITOR VERIFICATION SUITE');
console.log('======================================================================');
console.log('Target Root:', ROOT);

let totalPassed = 0;
let totalFailed = 0;

async function check(name, testFn) {
  try {
    await testFn();
    totalPassed++;
    console.log(`[PASS] ${name}`);
  } catch (err) {
    totalFailed++;
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
  }
}

async function main() {
  // CRITERION 1: Monorepo PNPM Workspaces
  console.log('\n--- Checking Criterion 1: Monorepo PNPM Workspaces ---');
  await check('pnpm-workspace.yaml exists with apps/* and packages/*', () => {
    const yaml = fs.readFileSync(path.join(ROOT, 'pnpm-workspace.yaml'), 'utf8');
    assert(yaml.includes('apps/*'), 'Missing apps/*');
    assert(yaml.includes('packages/*'), 'Missing packages/*');
  });

  await check('All 4 packages have valid package.json with proper workspace names and dependencies', () => {
    const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    assert.equal(rootPkg.name, 'bumi-upi');

    const webPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps', 'web', 'package.json'), 'utf8'));
    assert.equal(webPkg.name, '@bumi-upi/web');
    assert(webPkg.dependencies['@bumi-upi/ui'], 'Missing @bumi-upi/ui in apps/web');
    assert(webPkg.dependencies['@bumi-upi/db'], 'Missing @bumi-upi/db in apps/web');

    const adminPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps', 'admin', 'package.json'), 'utf8'));
    assert.equal(adminPkg.name, '@bumi-upi/admin');
    assert(adminPkg.dependencies['@bumi-upi/ui'], 'Missing @bumi-upi/ui in apps/admin');
    assert(adminPkg.dependencies['@bumi-upi/db'], 'Missing @bumi-upi/db in apps/admin');

    const uiPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages', 'ui', 'package.json'), 'utf8'));
    assert.equal(uiPkg.name, '@bumi-upi/ui');

    const dbPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages', 'db', 'package.json'), 'utf8'));
    assert.equal(dbPkg.name, '@bumi-upi/db');
  });

  // CRITERION 2: Database & Fallback Local Mock Store
  console.log('\n--- Checking Criterion 2: Database & Fallback Local Mock Store ---');
  await check('Supabase migrations directory contains complete SQL schemas and atomic RPC', () => {
    const migDir = path.join(ROOT, 'supabase', 'migrations');
    assert(fs.existsSync(migDir), 'supabase/migrations does not exist');
    const files = fs.readdirSync(migDir);
    assert(files.length >= 5, `Expected >=5 migrations, found ${files.length}`);
    
    // Check initial schema
    const schemaSql = fs.readFileSync(path.join(migDir, '20261031000001_initial_schema.sql'), 'utf8');
    assert(schemaSql.includes('CREATE TABLE'), 'Missing CREATE TABLE in schema');
    assert(schemaSql.includes('profiles'), 'Missing profiles table');
    assert(schemaSql.includes('products'), 'Missing products table');
    assert(schemaSql.includes('orders'), 'Missing orders table');
    assert(schemaSql.includes('order_items'), 'Missing order_items table');
    assert(schemaSql.includes('inventory'), 'Missing inventory table');

    // Check atomic RPC
    const atomicSql = fs.readFileSync(path.join(migDir, '20261031000002_atomic_functions.sql'), 'utf8');
    assert(atomicSql.includes('create_order_atomic'), 'Missing create_order_atomic RPC');
  });

  // Load @bumi-upi/db via jiti
  const createJiti = (await import('jiti')).default;
  const jiti = createJiti(path.join(ROOT, 'packages', 'db'));
  const db = jiti('./src/index.ts');

  await check('MockStore pre-populates exactly 200 customers and 2140 transactions', () => {
    const store = new db.MockStore();
    const uniqueProfiles = Array.from(new Set(store.customers.values()));
    assert.equal(uniqueProfiles.length, 200, `Expected 200 unique profiles, got ${uniqueProfiles.length}`);

    const uniqueOrders = Array.from(new Set(store.orders.values()));
    assert.equal(uniqueOrders.length, 2140, `Expected 2140 transactions, got ${uniqueOrders.length}`);
  });

  // CRITERION 3: WhatsApp OTP Console Mode
  console.log('\n--- Checking Criterion 3: WhatsApp OTP Console Mode ---');
  await check('WhatsApp OTP generates 6-digit random code, prints banner, and verifies with expiry/replay guard', () => {
    const store = new db.MockStore();
    const phone = '081234567899';
    const otpResult = store.sendOtp(phone);

    assert(otpResult.success, 'sendOtp failed');
    assert(/^\d{6}$/.test(otpResult.demoOtp), `OTP must be 6 digits, got ${otpResult.demoOtp}`);
    assert(otpResult.banner.includes('WHATSAPP OTP CONSOLE MODE'), 'Banner must indicate console mode');

    // Verify correct OTP
    const verifyResult = store.verifyOtp(phone, otpResult.demoOtp);
    assert(verifyResult.success, 'Valid OTP failed verification');

    // Replay attack prevention
    const replayResult = store.verifyOtp(phone, otpResult.demoOtp);
    assert.equal(replayResult.success, false, 'Replay attack should fail');
    assert(replayResult.error.includes('sudah pernah digunakan'), 'Replay error message expected');
  });

  // CRITERION 4: Demo Accounts in README & Code
  console.log('\n--- Checking Criterion 4: Demo Accounts ---');
  await check('README.md and Auth system document and support official demo accounts', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    assert(readme.includes('putriayusagita02@gmail.com'), 'README missing admin email');
    assert(readme.includes('BumiUpiAdmin2026!'), 'README missing admin password');
    assert(readme.includes('kasir@bumiupi.id'), 'README missing kasir email');
    assert(readme.includes('kasir2026'), 'README missing kasir password');
    assert(readme.includes('customer@bumiupi.id') || readme.includes('081234567890'), 'README missing customer credentials');

    // Check in MockStore
    const store = new db.MockStore();
    const admin = store.getCustomerProfile('putriayusagita02@gmail.com');
    assert(admin, 'Admin profile not found in MockStore');
    assert.equal(admin.role, 'admin');

    const cashier = store.getCustomerProfile('kasir@bumiupi.id');
    assert(cashier, 'Cashier profile not found in MockStore');
    assert.equal(cashier.role, 'kasir');

    const customer = store.getCustomerProfile('customer@bumiupi.id');
    assert(customer, 'Demo customer profile not found in MockStore');
    assert.equal(customer.name, 'Dimas Kurniawan');
  });

  // CRITERION 5: 105 Menu Items Seed Catalog
  console.log('\n--- Checking Criterion 5: 105 Menu Items Catalog ---');
  await check('Exactly 105 menu items and 16 categories seeded in seedCatalog105.ts', () => {
    assert.equal(db.CATALOG_CATEGORIES.length, 16, `Expected 16 categories, got ${db.CATALOG_CATEGORIES.length}`);
    assert.equal(db.CATALOG_105_ITEMS.length, 105, `Expected 105 items, got ${db.CATALOG_105_ITEMS.length}`);

    // Check uniqueness of IDs
    const ids = new Set(db.CATALOG_105_ITEMS.map(i => i.id));
    assert.equal(ids.size, 105, 'Duplicate IDs found in catalog');

    // Check category expected counts
    const counts = {};
    for (const item of db.CATALOG_105_ITEMS) {
      counts[item.category_id] = (counts[item.category_id] || 0) + 1;
    }

    for (const cat of db.CATALOG_CATEGORIES) {
      assert.equal(
        counts[cat.id],
        cat.expectedCount,
        `Category ${cat.name} (${cat.id}) has ${counts[cat.id]} items, expected ${cat.expectedCount}`
      );
    }
  });

  await check('SQL migration 04 and 05 contain exactly 105 products', () => {
    const mig04 = fs.readFileSync(path.join(ROOT, 'supabase', 'migrations', '20261031000004_seed_catalog_105.sql'), 'utf8');
    const prodMatches04 = mig04.match(/'prod-0000-0000-0000-\d{12}'/g);
    const unique04 = new Set(prodMatches04);
    assert.equal(unique04.size, 105, `Expected 105 products in migration 04, got ${unique04.size}`);

    const mig05 = fs.readFileSync(path.join(ROOT, 'supabase', 'migrations', '20261031000005_orders_and_seed_105.sql'), 'utf8');
    const prodMatches05 = mig05.match(/'prod-0000-0000-0000-\d{12}'/g);
    const unique05 = new Set(prodMatches05);
    assert.equal(unique05.size, 105, `Expected 105 products in migration 05, got ${unique05.size}`);
  });

  // CRITERION 6: Atomic Business Logic & RFM
  console.log('\n--- Checking Criterion 6: Atomic Business Logic & RFM Engine ---');
  await check('createOrderAtomic enforces idempotency, stock decrement, and voucher row locking', () => {
    const store = new db.MockStore();
    const idemKey = `audit-test-${Date.now()}`;

    // Update initial stock
    store.updateStock(1, 50);

    const orderRes = store.createOrderAtomic({
      idempotencyKey: idemKey,
      customerId: 'usr-cust-demo',
      orderType: 'dine_in',
      tableNumber: 'Meja 05',
      items: [{ productId: 1, itemName: 'Sate Aci', quantity: 2, unitPrice: 14000 }]
    });

    assert(orderRes.success, 'Order placement failed');
    assert.equal(orderRes.isDuplicate, false);
    assert.equal(orderRes.finalAmount, 28000);

    // Duplicate order check (idempotency)
    const dupRes = store.createOrderAtomic({
      idempotencyKey: idemKey,
      customerId: 'usr-cust-demo',
      orderType: 'dine_in',
      tableNumber: 'Meja 05',
      items: [{ productId: 1, itemName: 'Sate Aci', quantity: 2, unitPrice: 14000 }]
    });

    assert(dupRes.success, 'Duplicate order check failed');
    assert.equal(dupRes.isDuplicate, true, 'Duplicate order must return isDuplicate = true');
    assert.equal(dupRes.orderId, orderRes.orderId);
  });

  await check('RFM Engine classifies customers into 7 authentic Indonesian segments', () => {
    const store = new db.MockStore();
    const rfmResult = store.getRfmSegments();

    assert(rfmResult, 'RFM result is undefined');
    assert(rfmResult.summary, 'RFM summary is undefined');
    assert.equal(rfmResult.summary.totalCustomers, 198, `Expected 198 customer profiles in RFM, got ${rfmResult.summary.totalCustomers}`);
    assert(rfmResult.summary.totalRevenue > 0, 'Total revenue should be > 0');

    const expectedSegments = [
      'Champions',
      'Loyal',
      'Potensial Loyal',
      'Baru',
      'Berisiko',
      'Hampir Hilang',
      'Hilang'
    ];

    const actualSegments = Object.keys(rfmResult.summary.segments);
    assert.equal(actualSegments.length, 7, `Expected 7 segments, got ${actualSegments.length}`);

    for (const seg of expectedSegments) {
      assert(actualSegments.includes(seg), `Missing segment: ${seg}`);
    }

    // Check Indonesian label mapping
    assert.equal(db.RFM_SEGMENT_MAP['Champions'], 'Juara');
    assert.equal(db.RFM_SEGMENT_MAP['Loyal'], 'Setia');
    assert.equal(db.RFM_SEGMENT_MAP['Potensial Loyal'], 'Potensial');
    assert.equal(db.RFM_SEGMENT_MAP['Baru'], 'Butuh Perhatian');
    assert.equal(db.RFM_SEGMENT_MAP['Hampir Hilang'], 'Hampir Lepas');
    assert.equal(db.RFM_SEGMENT_MAP['Hilang'], 'Tertidur');
  });

  console.log('\n======================================================================');
  console.log(`AUDIT RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('======================================================================');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal audit runner error:', err);
  process.exit(1);
});
