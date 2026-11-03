import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

// Read seedCatalog105.ts text
const catalogText = fs.readFileSync(path.join(PROJECT_ROOT, 'packages/db/src/seedCatalog105.ts'), 'utf8');

// Also load oracle_data.js
const oraclePath = pathToFileURL(path.join(PROJECT_ROOT, 'tests/e2e/helpers/oracle_data.js')).href;
const oracleModule = await import(oraclePath);
const { ORACLE_CATEGORIES, ORACLE_105_ITEMS } = oracleModule;

// Extract descriptions from seedCatalog105.ts
const descMap = new Map();
const descRegex = /id:\s*(\d+),[\s\S]*?description:\s*'([^']+)'/g;
let match;
while ((match = descRegex.exec(catalogText)) !== null) {
  descMap.set(parseInt(match[1], 10), match[2]);
}

console.log('Descriptions mapped:', descMap.size);

// Category mapping
const catUuidMap = {
  'Cemilan Cepuluh': 'cat-01000000-0000-0000-0000-000000000001',
  'Ber Pepes An': 'cat-01000000-0000-0000-0000-000000000002',
  'Emih - Emihan': 'cat-01000000-0000-0000-0000-000000000003',
  'Pemadam Kelaparan': 'cat-01000000-0000-0000-0000-000000000004',
  'Tuntutan Masyarakat': 'cat-01000000-0000-0000-0000-000000000005',
  'Sumber Protein': 'cat-01000000-0000-0000-0000-000000000006',
  'Seger Adem': 'cat-01000000-0000-0000-0000-000000000007',
  'Es Esan': 'cat-01000000-0000-0000-0000-000000000008',
  'Teh & Susu': 'cat-01000000-0000-0000-0000-000000000009',
  'Jejamuan': 'cat-01000000-0000-0000-0000-000000000010',
  'Kopi': 'cat-01000000-0000-0000-0000-000000000011',
  'Jus 4 U': 'cat-01000000-0000-0000-0000-000000000012',
  'Satu Rasa Cukup': 'cat-01000000-0000-0000-0000-000000000013',
  'Roti Bakar Gurih': 'cat-01000000-0000-0000-0000-000000000014',
  'Dua Lebih Spesial': 'cat-01000000-0000-0000-0000-000000000015',
  'Pisang Bakar': 'cat-01000000-0000-0000-0000-000000000016'
};

const catSlugMap = {
  'Cemilan Cepuluh': 'cemilan-cepuluh',
  'Ber Pepes An': 'ber-pepes-an',
  'Emih - Emihan': 'emih-emihan',
  'Pemadam Kelaparan': 'pemadam-kelaparan',
  'Tuntutan Masyarakat': 'tuntutan-masyarakat',
  'Sumber Protein': 'sumber-protein',
  'Seger Adem': 'seger-adem',
  'Es Esan': 'es-esan',
  'Teh & Susu': 'teh-susu',
  'Jejamuan': 'jejamuan',
  'Kopi': 'kopi',
  'Jus 4 U': 'jus-4-u',
  'Satu Rasa Cukup': 'satu-rasa-cukup',
  'Roti Bakar Gurih': 'roti-bakar-gurih',
  'Dua Lebih Spesial': 'dua-lebih-spesial',
  'Pisang Bakar': 'pisang-bakar'
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function escapeSql(text) {
  return text.replace(/'/g, "''");
}

let sql = `-- ============================================================================
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
`;

const catInserts = ORACLE_CATEGORIES.map((cat, idx) => {
  const cid = catUuidMap[cat.name];
  const slug = catSlugMap[cat.name];
  return `('${cid}', '${escapeSql(cat.name)}', '${slug}', '${escapeSql(cat.parent)}', ${idx + 1})`;
});

sql += catInserts.join(',\n') + '\nON CONFLICT (name) DO NOTHING;\n\n';

sql += `INSERT INTO public.menu_categories (id, name, sort_order) VALUES\n`;
sql += ORACLE_CATEGORIES.map((cat, idx) => {
  const cid = catUuidMap[cat.name];
  return `('${cid}', '${escapeSql(cat.name)}', ${idx + 1})`;
}).join(',\n') + '\nON CONFLICT (name) DO NOTHING;\n\n';

sql += `-- 4. 105 MENU ITEMS & PRODUCTS SEED\n`;
sql += `INSERT INTO public.products (id, category_id, name, slug, description, base_price, is_available, is_featured, sort_order) VALUES\n`;

const prodInserts = ORACLE_105_ITEMS.map((item) => {
  const pad = String(item.id).padStart(12, '0');
  const uid = `prod-0000-0000-0000-${pad}`;
  const cid = catUuidMap[item.category];
  const slug = slugify(item.name) + `-${item.id}`;
  const desc = escapeSql(descMap.get(item.id) || item.name);
  const isFeat = (item.tags && item.tags.length > 0) ? 'TRUE' : 'FALSE';
  return `('${uid}', '${cid}', '${escapeSql(item.name)}', '${slug}', '${desc}', ${item.price}, TRUE, ${isFeat}, ${item.id})`;
});

sql += prodInserts.join(',\n') + '\nON CONFLICT (slug) DO NOTHING;\n\n';

sql += `INSERT INTO public.menu_items (id, category_id, name, description, price, is_available, is_featured, variants, temperatures, tags, sort_order) VALUES\n`;

const menuItemInserts = ORACLE_105_ITEMS.map((item) => {
  const pad = String(item.id).padStart(12, '0');
  const uid = `prod-0000-0000-0000-${pad}`;
  const cid = catUuidMap[item.category];
  const desc = escapeSql(descMap.get(item.id) || item.name);
  const isFeat = (item.tags && item.tags.length > 0) ? 'TRUE' : 'FALSE';
  const variantsJson = item.variants ? escapeSql(JSON.stringify(item.variants)) : '[]';
  const tempsArr = item.temps ? `ARRAY[${item.temps.map(t => `'${t}'`).join(',')}]` : `ARRAY[]::TEXT[]`;
  const tagsArr = item.tags && item.tags.length > 0 ? `ARRAY[${item.tags.map(t => `'${t}'`).join(',')}]` : `ARRAY[]::TEXT[]`;

  return `('${uid}', '${cid}', '${escapeSql(item.name)}', '${desc}', ${item.price}, TRUE, ${isFeat}, '${variantsJson}'::JSONB, ${tempsArr}, ${tagsArr}, ${item.id})`;
});

sql += menuItemInserts.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';

sql += `-- 5. PRODUCT VARIANTS (Size M/L and Temperature Panas/Dingin)\n`;
sql += `INSERT INTO public.product_variants (id, product_id, variant_type, name, sku, price_adjustment, sort_order) VALUES\n`;

const variantInserts = [];
let vIdx = 1;
for (const item of ORACLE_105_ITEMS) {
  const pad = String(item.id).padStart(12, '0');
  const uid = `prod-0000-0000-0000-${pad}`;

  if (item.variants && item.variants.sizeM && item.variants.sizeL) {
    const vPadM = String(vIdx++).padStart(12, '0');
    const vPadL = String(vIdx++).padStart(12, '0');
    const delta = item.variants.sizeL - item.variants.sizeM;
    variantInserts.push(`('var-0000-0000-0000-${vPadM}', '${uid}', 'size', 'Medium', 'SKU-${item.id}-M', 0, 1)`);
    variantInserts.push(`('var-0000-0000-0000-${vPadL}', '${uid}', 'size', 'Large', 'SKU-${item.id}-L', ${delta}, 2)`);
  }

  if (item.temps && item.temps.length > 1) {
    const vPadH = String(vIdx++).padStart(12, '0');
    const vPadC = String(vIdx++).padStart(12, '0');
    variantInserts.push(`('var-0000-0000-0000-${vPadH}', '${uid}', 'temperature', 'Panas', 'SKU-${item.id}-HOT', 0, 1)`);
    variantInserts.push(`('var-0000-0000-0000-${vPadC}', '${uid}', 'temperature', 'Dingin', 'SKU-${item.id}-COLD', 0, 2)`);
  }
}

sql += variantInserts.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';

sql += `-- 6. INVENTORY PRE-POPULATION\n`;
sql += `INSERT INTO public.inventory (id, product_id, current_stock, minimum_stock, unit, track_stock) VALUES\n`;

const invInserts = ORACLE_105_ITEMS.map((item) => {
  const pad = String(item.id).padStart(12, '0');
  const uid = `prod-0000-0000-0000-${pad}`;
  const invUid = `inv-0000-0000-0000-${pad}`;
  return `('${invUid}', '${uid}', 100, 10, 'porsi', TRUE)`;
});

sql += invInserts.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';

sql += `-- 7. MASTER VOUCHERS SEED
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
`;

// Write to migration files
const targetMig105 = path.join(PROJECT_ROOT, 'supabase/migrations/20261031000004_seed_catalog_105.sql');
const targetMigSeedData = path.join(PROJECT_ROOT, 'supabase/migrations/20261031000004_seed_data.sql');

fs.writeFileSync(targetMig105, sql, 'utf8');
fs.writeFileSync(targetMigSeedData, sql, 'utf8');

// Mirror to packages/db/migrations
const dbMigDir = path.join(PROJECT_ROOT, 'packages/db/migrations');
if (!fs.existsSync(dbMigDir)) {
  fs.mkdirSync(dbMigDir, { recursive: true });
}

// Copy all migrations to packages/db/migrations
const supMigDir = path.join(PROJECT_ROOT, 'supabase/migrations');
const files = fs.readdirSync(supMigDir);
for (const f of files) {
  fs.copyFileSync(path.join(supMigDir, f), path.join(dbMigDir, f));
}

console.log('Successfully generated 105 catalog seed migrations!');
