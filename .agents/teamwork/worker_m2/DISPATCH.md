# Dispatch — Worker M2: Database, Migrations, 105 Menu Seed & Mock Store

## Mandatory References
- Read `ORIGINAL_REQUEST.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md`
- Read `PROJECT.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\PROJECT.md`
- Read `survey_report.md` from `spec_miner_survey_1`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\spec_miner_survey_1\survey_report.md` (105 items & 16 categories)
- Read `survey_report.md` from `explorer_survey_3`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_survey_3\survey_report.md` (Supabase schema, DDL, mock store architecture)

## Write Ownership (Exclusive)
You exclusively own:
- `packages/db/*` (all files in `packages/db/`)
- `supabase/migrations/*` (all SQL migration files)
DO NOT modify files in `packages/ui`, `apps/web`, or `apps/admin`.

## Task Description
Implement Milestone 2:
1. **Supabase PostgreSQL Migrations (`supabase/migrations/`)**:
   - Create/update migration files with complete DDL:
     - All 19 relational tables + `categories`, `products`, `product_variants` (M/L & Panas/Dingin), `orders`, `order_items`, `payments`, `inventory`, `audit_logs`, `points_ledger`, `vouchers`, `customer_vouchers`.
     - Atomic functions: `create_order_atomic` and `record_transaction` with row-level locking (`FOR UPDATE`) and idempotency key handling.
     - Row Level Security (RLS) policies.
     - Complete seed SQL with all 105 menu items from `spec_miner_survey_1` across 16 categories with variants (M/L and Panas/Dingin) and pricing.
2. **`packages/db` Package Implementation**:
   - `packages/db/package.json` (`@bumi-upi/db`, version `0.1.0`, main, types, exports, dependencies: `@supabase/supabase-js`, `typescript`).
   - `packages/db/tsconfig.json`.
   - `packages/db/src/types.ts`: Comprehensive TypeScript interfaces for all database entities, catalog items, variants, cart, orders, users, vouchers, RFM metrics.
   - `packages/db/src/supabaseClient.ts`: Typed Supabase client with failover check.
   - `packages/db/src/seedCatalog105.ts`: Full, authentic TypeScript array of all 105 menu items, 16 categories, descriptions, base prices, M/L variants, and temperature options.
   - `packages/db/src/mockStore.ts`: Full local in-memory mock repository implementing zero-credential dual-mode operation:
     - Pre-populated with 200 synthetic customers, 2,140 transactions, 105 menu items, vouchers, reservations, and inventory.
     - Atomic order creation (`createOrderAtomic`) with idempotency deduplication, voucher locking, and stock deduction.
     - WhatsApp OTP verification logic (supports demo OTP code from server log).
     - RFM quintile computation engine (7 segments: Juara, Setia, Potensial, Butuh Perhatian, Hampir Lepas, Berisiko, Tertidur).
     - Inventory stock updater and audit logging.
   - `packages/db/src/index.ts`: Unified export of all repository functions, types, and clients.
3. **Build & Verify**:
   - Run `pnpm.cmd --filter @bumi-upi/db build` and `typecheck`.
   - Run `node tests/e2e/run_tests.js` to ensure all 95 tests continue passing.
   - Create a dedicated unit test script `packages/db/verify.js` verifying catalog item count (=105), mock store atomic orders, and exports.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-01T01:37:59Z
Sender: 84903406-8a88-4b8e-8505-db2987cdbaca
You are worker_m2.
Your working directory is: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\worker_m2\
Read the original request file at: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture file at: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\PROJECT.md
Read your assignment in: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\worker_m2\DISPATCH.md
Read survey report for 105 items: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\spec_miner_survey_1\survey_report.md
Read survey report for architecture/DDL: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_survey_3\survey_report.md

Your exclusive write ownership:
- packages/db/*
- supabase/migrations/*

Your task is to implement Milestone 2:
1. Complete Supabase PostgreSQL DDL migrations (tables, variants, atomic create_order_atomic with row locking, RLS, full 105 menu items seed across 16 categories with M/L and Panas/Dingin variants).
2. Implement packages/db package (types.ts, seedCatalog105.ts with 105 items, mockStore.ts in-memory repository with 200 customers, 2,140 transactions, RFM engine, OTP verification, atomic orders, index.ts).
3. Verify build and typecheck with pnpm.cmd. Run node tests/e2e/run_tests.js.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Document commands, files created, and test outputs in handoff.md.
Send completion message to parent when done.


## 2026-11-01T02:59:41Z
Sender: 84903406-8a88-4b8e-8505-db2987cdbaca
**Context**: PRIORITAS TINGGI / BOOST DARI USER
**Content**: User meminta penyelesaian segera:
Mohon selesaikan implementasi packages/db dan migrasi Supabase (DDL, seed 105 menu, mockStore in-memory zero credential), jalankan build/typecheck & verify.js, lalu segera tuliskan handoff.md!
**Action**: Finalisasi implementasi dan serahkan handoff.md sekarang juga.
