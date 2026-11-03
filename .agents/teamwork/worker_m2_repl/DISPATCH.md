# Dispatch — Worker M2 Replacement (Fast Execution)

## Context
Previous worker_m2 stalled after creating `packages/db/src/types.ts` and `supabaseClient.ts`.
You are replacing worker_m2 to finish Milestone 2 immediately in BOOST MODE!

## Mandatory References
- Read `ORIGINAL_REQUEST.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md`
- Read `PROJECT.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\PROJECT.md`
- Read 105 items catalog in: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\spec_miner_survey_1\survey_report.md` or `tests/e2e/helpers/oracle_data.js`
- Existing types in: `packages/db/src/types.ts`
- Existing client in: `packages/db/src/supabaseClient.ts`

## Write Ownership (Exclusive)
You exclusively own:
- `packages/db/*`
- `supabase/migrations/*`

## Task Description
Implement the remaining deliverables for Milestone 2:
1. **`packages/db/src/seedCatalog105.ts`**:
   - Export `CATALOG_105_ITEMS` (all 105 items, 16 categories, descriptions, base prices, M/L variants, Panas/Dingin variants, badges) and `MENU_CATEGORIES`. You can reference `tests/e2e/helpers/oracle_data.js` which already contains the exact verified 105 items!
2. **`packages/db/src/mockStore.ts`**:
   - In-memory store initialized with 200 customers, 2,140 transactions, 105 menu items, vouchers, reservations, and inventory.
   - Implement repository functions:
     - `getMenuCatalog()`
     - `getMenuItem(id)`
     - `createOrderAtomic(orderData)` (with idempotency, voucher locking, stock decrement)
     - `getCustomerProfile(phoneOrEmail)`
     - `verifyOtp(phone, otpCode)`
     - `getRfmSegments()`
     - `getTransactions(options)`
     - `updateStock(itemId, delta)`
3. **`packages/db/src/index.ts`**:
   - Export all types from `./types`, client from `./supabaseClient`, catalog from `./seedCatalog105`, and repository methods from `./mockStore`.
4. **`supabase/migrations/20261031000005_orders_and_seed_105.sql`**:
   - DDL for `orders`, `order_items`, `payments`, `inventory`, `product_variants`, atomic `create_order_atomic`, and SQL seed for 105 items.
5. **Verify**:
   - Create `packages/db/verify.js` (checks catalog length = 105, repository methods).
   - Run `pnpm.cmd --filter @bumi-upi/db build` and `typecheck`.
   - Run `node tests/e2e/run_tests.js`.
6. Write `handoff.md` and notify parent.


## 2026-11-01T03:04:06Z
Implement seedCatalog105.ts, mockStore.ts, index.ts in packages/db/src/, and supabase/migrations/20261031000005_orders_and_seed_105.sql.
Verify with pnpm build and node tests/e2e/run_tests.js.
Write handoff.md and notify parent when done.


## 2026-11-01T03:12:14Z
Status check from parent:
Bagaimana hasil verifikasi packages/db dan migrasi Supabase? Berikan update status atau serahkan handoff.md.


## 2026-11-01T03:14:30Z
Final call from parent:
Please write your final handoff.md in your working directory (.agents/teamwork/worker_m2_repl/handoff.md) and report completion.
