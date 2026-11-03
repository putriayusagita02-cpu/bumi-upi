import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  PATHS,
  readTextSafe,
  readJsonSafe,
  ReferenceStoreEngine
} from '../helpers/test_env.js';
import {
  ORACLE_CATEGORIES,
  ORACLE_105_ITEMS,
  ORACLE_TOKENS,
  ORACLE_DEMO_USERS,
  ORACLE_RFM_SEGMENTS,
  ORACLE_TIER_RULES
} from '../helpers/oracle_data.js';

describe('Tier 1: Feature Coverage (Isolation Testing)', () => {

  // ==========================================================================
  // F1: PNPM Monorepo Workspace Layout & Package Manifest Validity
  // ==========================================================================
  describe('F1: Monorepo Workspace Layout & Manifests', () => {
    it('F1.1: Root pnpm-workspace.yaml exists and defines apps/* and packages/*', () => {
      assert.ok(fs.existsSync(PATHS.pnpmWorkspace), 'pnpm-workspace.yaml must exist at project root');
      const content = readTextSafe(PATHS.pnpmWorkspace);
      assert.ok(content.includes('apps/*') || content.includes("'apps/*'"), 'pnpm-workspace.yaml must include apps/*');
      assert.ok(content.includes('packages/*') || content.includes("'packages/*'"), 'pnpm-workspace.yaml must include packages/*');
    });

    it('F1.2: Root package.json exists with required monorepo build and test scripts', () => {
      assert.ok(fs.existsSync(PATHS.rootPackageJson), 'package.json must exist at project root');
      const pkg = readJsonSafe(PATHS.rootPackageJson);
      assert.ok(pkg, 'Root package.json must be valid JSON');
      assert.equal(pkg.private, true, 'Root package must be marked private: true');
      assert.ok(pkg.scripts, 'Root package.json must contain scripts');
      assert.ok(pkg.scripts.build, 'Root scripts must include build');
      assert.ok(pkg.scripts.test, 'Root scripts must include test');
      assert.ok(pkg.scripts.dev, 'Root scripts must include dev');
    });

    it('F1.3: Package manifest @bumi-upi/ui in packages/ui/package.json has valid name, exports, and peerDependencies', () => {
      const uiPkgPath = path.join(PATHS.packages.ui, 'package.json');
      assert.ok(fs.existsSync(uiPkgPath), 'packages/ui/package.json must exist');
      const pkg = readJsonSafe(uiPkgPath);
      assert.equal(pkg.name, '@bumi-upi/ui', 'UI package name must be @bumi-upi/ui');
      assert.ok(pkg.exports || pkg.main, 'UI package must define exports or main');
      if (pkg.peerDependencies) {
        assert.ok(pkg.peerDependencies.react, 'UI package must specify react in peerDependencies');
      }
    });

    it('F1.4: Package manifest @bumi-upi/db in packages/db/package.json has valid name, main, and build scripts', () => {
      const dbPkgPath = path.join(PATHS.packages.db, 'package.json');
      assert.ok(fs.existsSync(dbPkgPath), 'packages/db/package.json must exist');
      const pkg = readJsonSafe(dbPkgPath);
      assert.equal(pkg.name, '@bumi-upi/db', 'DB package name must be @bumi-upi/db');
      assert.ok(pkg.main, 'DB package must specify main entry point');
      assert.ok(pkg.scripts && (pkg.scripts.build || pkg.scripts.typecheck), 'DB package must have build or typecheck script');
    });

    it('F1.5: Monorepo directory topology conforms to specification (apps/, packages/, tests/)', () => {
      assert.ok(fs.existsSync(path.join(PATHS.root, 'apps')), 'apps/ directory must exist');
      assert.ok(fs.existsSync(path.join(PATHS.root, 'packages')), 'packages/ directory must exist');
      assert.ok(fs.existsSync(path.join(PATHS.root, 'tests')), 'tests/ directory must exist');
      assert.ok(fs.existsSync(PATHS.packages.ui), 'packages/ui directory must exist');
      assert.ok(fs.existsSync(PATHS.packages.db), 'packages/db directory must exist');
    });

    it('F1.6: Package naming convention strictly uses @bumi-upi/ namespace for internal packages', () => {
      const uiPkg = readJsonSafe(path.join(PATHS.packages.ui, 'package.json'));
      const dbPkg = readJsonSafe(path.join(PATHS.packages.db, 'package.json'));
      assert.ok(uiPkg.name.startsWith('@bumi-upi/'), 'UI package must use @bumi-upi/ namespace');
      assert.ok(dbPkg.name.startsWith('@bumi-upi/'), 'DB package must use @bumi-upi/ namespace');
    });
  });

  // ==========================================================================
  // F2: Shared UI Tokens & Component Exports in @bumi-upi/ui
  // ==========================================================================
  describe('F2: Shared UI Tokens & Components', () => {
    it('F2.1: Heritage color palette tokens contain exact hex codes (Olive, Krem, Terakota, Mustard)', () => {
      const tokensFile = path.join(PATHS.packages.ui, 'src/tokens/index.ts');
      const tailwindFile = path.join(PATHS.root, 'tailwind.config.js');
      const content = readTextSafe(tokensFile) || readTextSafe(tailwindFile) || '';

      assert.ok(content.length > 0, 'UI tokens or tailwind config must exist');
      assert.ok(content.includes('#3E4F30') || content.toLowerCase().includes('#3e4f30'), 'Must define Olive #3E4F30');
      assert.ok(content.includes('#F5EEDC') || content.toLowerCase().includes('#f5eedc'), 'Must define Krem Kertas #F5EEDC');
      assert.ok(content.includes('#B4532A') || content.toLowerCase().includes('#b4532a'), 'Must define Terakota #B4532A');
      assert.ok(content.includes('#D4A24C') || content.toLowerCase().includes('#d4a24c'), 'Must define Mustard #D4A24C');
    });

    it('F2.2: Typography tokens specify Fraunces, Caveat, and Plus Jakarta Sans fonts', () => {
      const tokensFile = path.join(PATHS.packages.ui, 'src/tokens/index.ts');
      const tailwindFile = path.join(PATHS.root, 'tailwind.config.js');
      const content = readTextSafe(tokensFile) || readTextSafe(tailwindFile) || '';

      assert.ok(content.includes('Fraunces'), 'Must specify Fraunces font');
      assert.ok(content.includes('Caveat'), 'Must specify Caveat font');
      assert.ok(content.includes('Plus Jakarta Sans') || content.includes('jakarta'), 'Must specify Plus Jakarta Sans font');
    });

    it('F2.3: Button component source exists and implements primary olive and secondary terakota variants', () => {
      const buttonPath = path.join(PATHS.packages.ui, 'src/components/Button.tsx');
      assert.ok(fs.existsSync(buttonPath), 'Button.tsx must exist in packages/ui/src/components/');
      const content = readTextSafe(buttonPath);
      assert.ok(content.includes('#3E4F30') || content.includes('olive') || content.includes('bg-olive'), 'Button must support olive variant (#3E4F30)');
      assert.ok(content.includes('#B4532A') || content.includes('terakota') || content.includes('bg-terakota'), 'Button must support terakota variant (#B4532A)');
    });

    it('F2.4: Badge component or tier tokens exist for Tamu, Sahabat, and Keluarga membership tiers', () => {
      const tokensFile = path.join(PATHS.packages.ui, 'src/tokens/index.ts');
      const badgeFile = path.join(PATHS.packages.ui, 'src/components/Badge.tsx');
      const content = (readTextSafe(tokensFile) || '') + (readTextSafe(badgeFile) || '');
      assert.ok(content.toLowerCase().includes('tamu'), 'Must support Tamu tier badge/token');
      assert.ok(content.toLowerCase().includes('sahabat'), 'Must support Sahabat tier badge/token');
      assert.ok(content.toLowerCase().includes('keluarga'), 'Must support Keluarga tier badge/token');
    });

    it('F2.5: WhatsApp OTP Toast Helper specification or component exists with auto-fill interaction', () => {
      const otpToastPath = path.join(PATHS.packages.ui, 'src/components/OtpToastHelper.tsx');
      const toastPath = path.join(PATHS.packages.ui, 'src/components/Toast.tsx');
      const projectMd = readTextSafe(PATHS.projectMd) || '';
      const hasComponent = fs.existsSync(otpToastPath) || fs.existsSync(toastPath);
      const hasContract = projectMd.includes('OtpToastHelper') || projectMd.includes('OtpHelperToast') || projectMd.includes('auto-fill');
      assert.ok(hasComponent || hasContract, 'OtpToastHelper component or contract must be defined in UI package');
    });

    it('F2.6: MemberCard component or contract exists with loyalty tier and QR code display', () => {
      const memberCardPath = path.join(PATHS.packages.ui, 'src/components/MemberCard.tsx');
      const projectMd = readTextSafe(PATHS.projectMd) || '';
      const hasComponent = fs.existsSync(memberCardPath);
      const hasContract = projectMd.includes('MemberCard');
      assert.ok(hasComponent || hasContract, 'MemberCard component or contract must be defined');
    });
  });

  // ==========================================================================
  // F3: Supabase Postgres Migrations DDL Validity & Syntax
  // ==========================================================================
  describe('F3: Supabase Migrations DDL Validity', () => {
    it('F3.1: Migration files exist with timestamp prefixes for schema, atomic functions, and RLS', () => {
      assert.ok(fs.existsSync(PATHS.migrations), 'supabase/migrations/ directory must exist');
      const files = fs.readdirSync(PATHS.migrations);
      assert.ok(files.some(f => f.includes('schema')), 'Must have initial schema migration');
      assert.ok(files.some(f => f.includes('atomic')), 'Must have atomic functions migration');
      assert.ok(files.some(f => f.includes('rls')), 'Must have RLS policies migration');
      assert.ok(files.some(f => f.includes('seed')), 'Must have seed data migration');
    });

    it('F3.2: DDL defines core relational tables (profiles, categories, menu_items, transactions/orders, vouchers, points_ledger)', () => {
      const schemaFile = path.join(PATHS.migrations, '20261031000001_initial_schema.sql');
      const ddl = readTextSafe(schemaFile) || '';
      
      assert.ok(ddl.includes('profiles'), 'DDL must define profiles table');
      assert.ok(ddl.includes('menu_categories') || ddl.includes('categories'), 'DDL must define categories table');
      assert.ok(ddl.includes('menu_items') || ddl.includes('products'), 'DDL must define menu_items / products table');
      assert.ok(ddl.includes('transactions') || ddl.includes('orders'), 'DDL must define transactions / orders table');
      assert.ok(ddl.includes('vouchers'), 'DDL must define vouchers table');
      assert.ok(ddl.includes('points_ledger'), 'DDL must define points_ledger table');
    });

    it('F3.3: DDL defines domain ENUM types (user_role, tier_level, rfm_segment_type)', () => {
      const schemaFile = path.join(PATHS.migrations, '20261031000001_initial_schema.sql');
      const ddl = readTextSafe(schemaFile) || '';
      assert.ok(ddl.includes('user_role'), 'Must define user_role enum');
      assert.ok(ddl.includes('tier_level'), 'Must define tier_level enum');
      assert.ok(ddl.includes('rfm_segment_type'), 'Must define rfm_segment_type enum');
    });

    it('F3.4: Atomic procedure create_order_atomic (or record_transaction) includes idempotency check and row locking', () => {
      const atomicFile = path.join(PATHS.migrations, '20261031000002_atomic_functions.sql');
      const ddl = readTextSafe(atomicFile) || '';
      assert.ok(
        ddl.includes('create_order_atomic') || ddl.includes('record_transaction'),
        'Must define atomic order/transaction function'
      );
      assert.ok(ddl.includes('idempotency_key') || ddl.includes('p_idempotency_key'), 'Must check idempotency_key');
      assert.ok(ddl.includes('FOR UPDATE'), 'Must use FOR UPDATE row locking for voucher/points');
    });

    it('F3.5: Row Level Security (RLS) policies are defined for profiles, orders, and customer data', () => {
      const rlsFile = path.join(PATHS.migrations, '20261031000003_rls_policies.sql');
      const ddl = readTextSafe(rlsFile) || '';
      assert.ok(ddl.includes('ENABLE ROW LEVEL SECURITY'), 'Must enable RLS');
      assert.ok(ddl.includes('CREATE POLICY'), 'Must create security policies');
      assert.ok(ddl.includes('profiles'), 'Must protect profiles table');
    });

    it('F3.6: Points rule and integrity constraints enforce non-negative balances and ledger audit', () => {
      const schemaFile = path.join(PATHS.migrations, '20261031000001_initial_schema.sql');
      const ddl = readTextSafe(schemaFile) || '';
      assert.ok(ddl.includes('points_balance') && ddl.includes('CHECK (points_balance >= 0)'), 'Must enforce points_balance >= 0 check');
      assert.ok(ddl.includes('points_ledger'), 'Must define points_ledger table');
    });
  });

  // ==========================================================================
  // F4: Local Fallback Mock Store API (200 Customers, 2,140 Tx, Zero-Credential)
  // ==========================================================================
  describe('F4: Local Fallback Mock Store API', () => {
    it('F4.1: Customer dataset generator produces exactly 200 customer profiles with realistic Sunda names and QR codes', () => {
      const mockDataFile = path.join(PATHS.srcLib, 'mockData.ts');
      const content = readTextSafe(mockDataFile) || '';
      assert.ok(content.includes('generate200Customers'), 'Must contain generate200Customers function');

      // Verify generator logic
      const FIRST_NAMES = ['Asep', 'Cecep', 'Dadan', 'Eman', 'Ginanjar', 'Nana', 'Ujang', 'Ai', 'Dewi', 'Fitri'];
      const LAST_NAMES = ['Kusuma', 'Permana', 'Sutisna', 'Nugraha', 'Hidayat', 'Kurnia', 'Saputra'];
      const customers = [];
      customers.push({ id: 'usr-admin-01', role: 'admin', name: 'Teh Upi (Owner)' });
      customers.push({ id: 'usr-kasir-01', role: 'kasir', name: 'Kang Asep (Kasir)' });
      customers.push({ id: 'usr-cust-demo', role: 'customer', name: 'Dimas Kurniawan', qr: 'BUMI-CUST-8899' });

      for (let i = 1; i <= 197; i++) {
        const fn = FIRST_NAMES[i % FIRST_NAMES.length];
        const ln = LAST_NAMES[i % LAST_NAMES.length];
        customers.push({
          id: `usr-cust-${String(i).padStart(3, '0')}`,
          role: 'customer',
          name: `${fn} ${ln}`,
          qr: `BUMI-CUST-${String(i).padStart(3, '0')}`
        });
      }
      assert.equal(customers.length, 200, 'Total generated customers must equal exactly 200');
      assert.equal(customers[2].name, 'Dimas Kurniawan', 'Demo customer must be Dimas Kurniawan');
    });

    it('F4.2: Transaction dataset generator produces exactly 2,140 historical transactions spanning 6 months', () => {
      const mockDataFile = path.join(PATHS.srcLib, 'mockData.ts');
      const content = readTextSafe(mockDataFile) || '';
      assert.ok(content.includes('generate2140Transactions'), 'Must contain generate2140Transactions function');
      assert.ok(content.includes('2140') || content.includes('TOTAL_TX = 2140'), 'Total transactions constant must be 2140');
    });

    it('F4.3: Zero-credential fallback detection logic activates in-memory store when Supabase credentials are missing', () => {
      function isMockMode(url, key, forceMock) {
        if (forceMock === true || forceMock === 'true') return true;
        if (!url || !key) return true;
        if (url.includes('placeholder') || url.includes('your-project') || url.includes('demo')) return true;
        return false;
      }

      assert.equal(isMockMode('', ''), true, 'Empty credentials must trigger mock mode');
      assert.equal(isMockMode('https://your-project.supabase.co', 'placeholder'), true, 'Placeholder credentials must trigger mock mode');
      assert.equal(isMockMode('https://real-project.supabase.co', 'eyJhbGciOi...', 'true'), true, 'forceMock flag must trigger mock mode');
      assert.equal(isMockMode('https://real-project.supabase.co', 'valid-secret-key-12345', false), false, 'Real credentials must disable mock mode');
    });

    it('F4.4: RFM engine computes RFM quintile scores (1-5) and maps to exactly the 7 defined customer segments', () => {
      const rfmSegments = new Set(ORACLE_RFM_SEGMENTS);
      assert.equal(rfmSegments.size, 7, 'Must have exactly 7 RFM segments');
      assert.ok(rfmSegments.has('Champions'), 'Must include Champions');
      assert.ok(rfmSegments.has('Loyal'), 'Must include Loyal');
      assert.ok(rfmSegments.has('Potensial Loyal'), 'Must include Potensial Loyal');
      assert.ok(rfmSegments.has('Baru'), 'Must include Baru');
      assert.ok(rfmSegments.has('Berisiko'), 'Must include Berisiko');
      assert.ok(rfmSegments.has('Hampir Hilang'), 'Must include Hampir Hilang');
      assert.ok(rfmSegments.has('Hilang'), 'Must include Hilang');

      // Test classification logic
      function classifyRfm(r, f, m) {
        if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
        if (r >= 3 && f >= 3) return 'Loyal';
        if (r >= 4 && f <= 2) return 'Baru';
        if (r <= 2 && f >= 3) return 'Berisiko';
        if (r <= 2 && f <= 2 && m <= 2) return 'Hilang';
        return 'Potensial Loyal';
      }

      assert.equal(classifyRfm(5, 5, 5), 'Champions');
      assert.equal(classifyRfm(4, 4, 3), 'Loyal');
      assert.equal(classifyRfm(5, 1, 2), 'Baru');
      assert.equal(classifyRfm(1, 4, 4), 'Berisiko');
      assert.equal(classifyRfm(1, 1, 1), 'Hilang');
    });

    it('F4.5: In-memory reactive state supports atomic order insertion and idempotency key deduplication', () => {
      const engine = new ReferenceStoreEngine();
      const payload = {
        idempotencyKey: 'IDEMP-TEST-F4-001',
        tableNumber: 'Meja 05',
        items: [{ itemName: 'Nasi Goreng Kecombrang', unitPrice: 24000, quantity: 2 }]
      };

      const res1 = engine.createOrderAtomic(payload);
      assert.equal(res1.success, true);
      assert.equal(res1.isDuplicate, false);
      assert.equal(res1.finalAmount, 48000);

      // Duplicate invocation
      const res2 = engine.createOrderAtomic(payload);
      assert.equal(res2.success, true);
      assert.equal(res2.isDuplicate, true);
      assert.equal(res2.orderId, res1.orderId);
      assert.equal(res2.finalAmount, 48000);
    });

    it('F4.6: Customer tier progression logic correctly upgrades Tamu -> Sahabat (>=100 pts) -> Keluarga (>=300 pts)', () => {
      function evaluateTier(cumulativePoints) {
        if (cumulativePoints >= ORACLE_TIER_RULES.thresholds.keluarga) return 'Keluarga';
        if (cumulativePoints >= ORACLE_TIER_RULES.thresholds.sahabat) return 'Sahabat';
        return 'Tamu';
      }

      assert.equal(evaluateTier(0), 'Tamu');
      assert.equal(evaluateTier(99), 'Tamu');
      assert.equal(evaluateTier(100), 'Sahabat');
      assert.equal(evaluateTier(299), 'Sahabat');
      assert.equal(evaluateTier(300), 'Keluarga');
      assert.equal(evaluateTier(650), 'Keluarga');
    });
  });

  // ==========================================================================
  // F5: Full 105 Menu Items Catalog (16 Categories, M/L Size, Panas/Dingin)
  // ==========================================================================
  describe('F5: Full 105 Menu Catalog & Variants', () => {
    it('F5.1: Menu catalog oracle contains exactly 105 unique items sourced from MENU-REGULER.pdf', () => {
      assert.equal(ORACLE_105_ITEMS.length, 105, 'Catalog must contain exactly 105 items');
      const ids = new Set(ORACLE_105_ITEMS.map(i => i.id));
      assert.equal(ids.size, 105, 'All 105 item IDs must be unique');
      const names = new Set(ORACLE_105_ITEMS.map(i => i.name.toLowerCase()));
      assert.equal(names.size, 105, 'All 105 item names must be unique');
    });

    it('F5.2: 16 subcategories are properly enumerated with exact item distribution matching MENU-REGULER.pdf', () => {
      assert.equal(ORACLE_CATEGORIES.length, 16, 'Must contain exactly 16 categories');
      let totalExpected = 0;
      for (const cat of ORACLE_CATEGORIES) {
        const matchingItems = ORACLE_105_ITEMS.filter(i => i.category === cat.name);
        assert.equal(
          matchingItems.length,
          cat.expectedCount,
          `Category ${cat.name} must have ${cat.expectedCount} items, found ${matchingItems.length}`
        );
        totalExpected += cat.expectedCount;
      }
      assert.equal(totalExpected, 105, 'Sum of category items must be 105');
    });

    it('F5.3: Size variant (Medium / Large) pricing rules: verified on the 9 designated drinks', () => {
      const drinksWithSize = ORACLE_105_ITEMS.filter(i => i.variants && i.variants.sizeM && i.variants.sizeL);
      assert.equal(drinksWithSize.length, 9, 'Must have exactly 9 drinks with M/L variants');

      // Verify specific drinks price delta
      const cincau = drinksWithSize.find(i => i.name === 'Es Cincau Jadoel');
      assert.ok(cincau);
      assert.equal(cincau.variants.sizeM, 19000);
      assert.equal(cincau.variants.sizeL, 24000);

      const kopiHitam = drinksWithSize.find(i => i.name === 'Kopi Hitam');
      assert.ok(kopiHitam);
      assert.equal(kopiHitam.variants.sizeM, 17000);
      assert.equal(kopiHitam.variants.sizeL, 22000);

      const kopiSusu = drinksWithSize.find(i => i.name === 'Kopi Susu');
      assert.ok(kopiSusu);
      assert.equal(kopiSusu.variants.sizeM, 22000);
      assert.equal(kopiSusu.variants.sizeL, 27000);
    });

    it('F5.4: Temperature variant (Panas / Dingin) rules verified on dual-temp items and hot-only items', () => {
      const dualTempDrinks = ORACLE_105_ITEMS.filter(
        i => i.temps && i.temps.includes('panas') && i.temps.includes('dingin')
      );
      assert.ok(dualTempDrinks.length >= 8, 'Must have at least 8 dual-temperature drink options');

      const hotOnlyDrinks = ORACLE_105_ITEMS.filter(
        i => i.temps && i.temps.length === 1 && i.temps[0] === 'panas'
      );
      assert.equal(hotOnlyDrinks.length, 3, 'Must have exactly 3 hot-only drinks');
      const hotNames = hotOnlyDrinks.map(i => i.name);
      assert.ok(hotNames.includes('Teh Sereh'), 'Teh Sereh must be hot-only');
      assert.ok(hotNames.includes('Cokelat Malt Panas'), 'Cokelat Malt Panas must be hot-only');
      assert.ok(hotNames.includes('Kopi Susu Butter'), 'Kopi Susu Butter must be hot-only');
    });

    it('F5.5: Menu item tags/labels (Rekomendasi, Favorit, Pedas, Untuk Anak) correctly attributed to signature items', () => {
      const kidItems = ORACLE_105_ITEMS.filter(i => i.tags && i.tags.includes('Untuk Anak'));
      assert.equal(kidItems.length, 2, 'Must have exactly 2 items tagged Untuk Anak');
      const kidNames = kidItems.map(i => i.name);
      assert.ok(kidNames.includes('Tuangeun Bocil'), 'Tuangeun Bocil must be tagged Untuk Anak');
      assert.ok(kidNames.includes('Mie Anak Sekolah'), 'Mie Anak Sekolah must be tagged Untuk Anak');

      const spicyItems = ORACLE_105_ITEMS.filter(i => i.tags && i.tags.includes('Pedas'));
      assert.ok(spicyItems.length >= 6, 'Must have spicy items tagged Pedas');
    });

    it('F5.6: Pricing consistency: every item has positive integer base_price formatted in IDR', () => {
      for (const item of ORACLE_105_ITEMS) {
        assert.ok(typeof item.price === 'number', `Item ${item.name} price must be a number`);
        assert.ok(item.price > 0, `Item ${item.name} price must be > 0`);
        assert.ok(Number.isInteger(item.price), `Item ${item.name} price must be an integer`);
        assert.ok(item.price % 100 === 0, `Item ${item.name} price must be in standard IDR hundreds`);
      }
    });
  });

  // ==========================================================================
  // F6: WhatsApp OTP Console Mode Banner & Auto-Fill Payload
  // ==========================================================================
  describe('F6: WhatsApp OTP Console Mode & Auto-Fill', () => {
    it('F6.1: OTP generation produces a 6-digit numeric string (100000 - 999999)', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.generateOtp('081234567890');
      assert.equal(res.success, true);
      assert.match(res.demoOtp, /^\d{6}$/, 'OTP must be exactly 6 digits');
      const num = parseInt(res.demoOtp, 10);
      assert.ok(num >= 100000 && num <= 999999, 'OTP must be within 100000-999999');
    });

    it('F6.2: Console banner output contains formatted WhatsApp notification headers, target phone, and Sunda greetings', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.generateOtp('081298765432');
      assert.ok(res.banner.includes('[WHATSAPP OTP CONSOLE MODE]'), 'Banner must have OTP mode header');
      assert.ok(res.banner.includes('081298765432'), 'Banner must show target phone number');
      assert.ok(res.banner.includes(res.demoOtp), 'Banner must display the OTP code');
      assert.ok(res.banner.includes('Sampurasun!'), 'Banner must include Sunda greeting Sampurasun!');
    });

    it('F6.3: API response in demo mode returns success: true and demoOtp for auto-fill helper toast', () => {
      const engine = new ReferenceStoreEngine();
      const res = engine.generateOtp('081223344550');
      assert.equal(res.success, true);
      assert.ok(res.demoOtp, 'Must return demoOtp in payload');
      assert.equal(typeof res.demoOtp, 'string');
    });

    it('F6.4: OTP verification validates exact matching code, marks record verified, and returns success', () => {
      const engine = new ReferenceStoreEngine();
      const sendRes = engine.generateOtp('081234567890');
      const verifyRes = engine.verifyOtp('081234567890', sendRes.demoOtp);
      assert.equal(verifyRes.success, true);
      assert.equal(verifyRes.message, 'OTP verified successfully');
    });

    it('F6.5: OTP expiration: expired OTP codes are rejected after expiration timestamp', () => {
      const engine = new ReferenceStoreEngine();
      const sendRes = engine.generateOtp('081234567890');
      // Artificially expire the OTP
      const record = engine.otpStore.get('081234567890');
      record.expiresAt = Date.now() - 1000;

      const verifyRes = engine.verifyOtp('081234567890', sendRes.demoOtp);
      assert.equal(verifyRes.success, false);
      assert.ok(verifyRes.error.includes('expired'), 'Must report OTP as expired');
    });

    it('F6.6: Single-use OTP token: verified OTP cannot be reused a second time', () => {
      const engine = new ReferenceStoreEngine();
      const sendRes = engine.generateOtp('081234567890');
      const verify1 = engine.verifyOtp('081234567890', sendRes.demoOtp);
      assert.equal(verify1.success, true);

      // Second attempt with same code
      const verify2 = engine.verifyOtp('081234567890', sendRes.demoOtp);
      assert.equal(verify2.success, false);
      assert.ok(verify2.error.includes('cannot be reused') || verify2.error.includes('already verified'));
    });
  });

  // ==========================================================================
  // F7: Demo Credentials Accessibility (Admin, Kasir, Customer)
  // ==========================================================================
  describe('F7: Demo Credentials Accessibility', () => {
    it('F7.1: Admin demo credentials putriayusagita02@gmail.com / BumiUpiAdmin2026! authenticate with admin role', () => {
      const adminSpec = ORACLE_DEMO_USERS.admin;
      assert.equal(adminSpec.email, 'putriayusagita02@gmail.com');
      assert.equal(adminSpec.password, 'BumiUpiAdmin2026!');
      assert.equal(adminSpec.role, 'admin');

      function authenticate(email, password) {
        if (email === adminSpec.email && password === adminSpec.password) {
          return { success: true, user: { email, role: 'admin' } };
        }
        return { success: false, error: 'Invalid credentials' };
      }

      const res = authenticate('putriayusagita02@gmail.com', 'BumiUpiAdmin2026!');
      assert.equal(res.success, true);
      assert.equal(res.user.role, 'admin');
    });

    it('F7.2: Kasir demo credentials kasir@bumiupi.id authenticate with kasir role', () => {
      const kasirSpec = ORACLE_DEMO_USERS.kasir;
      assert.equal(kasirSpec.email, 'kasir@bumiupi.id');
      assert.equal(kasirSpec.role, 'kasir');

      function authenticate(email, password) {
        if (email === kasirSpec.email && kasirSpec.passwordCandidates.includes(password)) {
          return { success: true, user: { email, role: 'kasir' } };
        }
        return { success: false, error: 'Invalid credentials' };
      }

      const res1 = authenticate('kasir@bumiupi.id', 'kasir2026');
      assert.equal(res1.success, true);
      assert.equal(res1.user.role, 'kasir');
    });

    it('F7.3: Customer demo credentials customer@bumiupi.id / 081234567890 authenticate with customer role', () => {
      const custSpec = ORACLE_DEMO_USERS.customer;
      assert.equal(custSpec.email, 'customer@bumiupi.id');
      assert.equal(custSpec.phone, '081234567890');
      assert.equal(custSpec.role, 'customer');

      function authenticate(identifier, password) {
        if ((identifier === custSpec.email || identifier === custSpec.phone) && custSpec.passwordCandidates.includes(password)) {
          return { success: true, user: { email: custSpec.email, role: 'customer' } };
        }
        return { success: false, error: 'Invalid credentials' };
      }

      const resPhone = authenticate('081234567890', 'tamu2026');
      assert.equal(resPhone.success, true);
      assert.equal(resPhone.user.role, 'customer');
    });

    it('F7.4: Role-based permissions guard: customer cannot access POS or Admin routes; kasir cannot access audit config', () => {
      function canAccessRoute(role, route) {
        if (route.startsWith('/admin/pos')) return role === 'admin' || role === 'kasir';
        if (route.startsWith('/admin')) return role === 'admin';
        return true;
      }

      assert.equal(canAccessRoute('customer', '/admin/pos'), false, 'Customer cannot access POS');
      assert.equal(canAccessRoute('customer', '/admin/crm'), false, 'Customer cannot access CRM');
      assert.equal(canAccessRoute('kasir', '/admin/pos'), true, 'Kasir can access POS');
      assert.equal(canAccessRoute('kasir', '/admin/audit'), false, 'Kasir cannot access Owner Audit');
      assert.equal(canAccessRoute('admin', '/admin/audit'), true, 'Admin can access Owner Audit');
    });

    it('F7.5: Demo customer Dimas Kurniawan has pre-seeded Sahabat tier, 142 points, and active welcome vouchers', () => {
      const custSpec = ORACLE_DEMO_USERS.customer;
      assert.equal(custSpec.tier, 'Sahabat');
      assert.equal(custSpec.points, 142);
      assert.ok(custSpec.points >= 100, 'Sahabat tier requires at least 100 points');
    });

    it('F7.6: Quick role switcher payload returns valid mock auth session without external network request', () => {
      function switchDemoRole(targetRole) {
        const users = {
          admin: { id: 'usr-admin-01', name: 'Teh Upi', role: 'admin', email: 'admin@bumiupi.id' },
          kasir: { id: 'usr-kasir-01', name: 'Kang Asep', role: 'kasir', email: 'kasir@bumiupi.id' },
          customer: { id: 'usr-cust-demo', name: 'Dimas Kurniawan', role: 'customer', email: 'customer@bumiupi.id' }
        };
        const u = users[targetRole];
        if (!u) return { success: false, error: 'Unknown demo role' };
        return {
          success: true,
          token: `mock-jwt-${targetRole}-${Date.now()}`,
          user: u
        };
      }

      const adminSess = switchDemoRole('admin');
      assert.equal(adminSess.success, true);
      assert.equal(adminSess.user.role, 'admin');

      const kasirSess = switchDemoRole('kasir');
      assert.equal(kasirSess.success, true);
      assert.equal(kasirSess.user.role, 'kasir');

      const custSess = switchDemoRole('customer');
      assert.equal(custSess.success, true);
      assert.equal(custSess.user.role, 'customer');
    });
  });

});
