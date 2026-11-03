# Dispatch — E2E Test Writer: Dual Track Test Suite

## Mandatory References
- Read `ORIGINAL_REQUEST.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md`
- Read `PROJECT.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\PROJECT.md`
- Read `survey_report.md` from `spec_miner_survey_1`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\spec_miner_survey_1\survey_report.md`
- Read `survey_report.md` from `explorer_survey_2`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_survey_2\survey_report.md`

## Write Ownership (Exclusive)
You exclusively own:
- `tests/e2e/*` (all files in `tests/e2e/`)
- `TEST_INFRA.md` at project root
- `TEST_READY.md` at project root (published when test suite is complete)
DO NOT modify implementation files in `packages/` or `apps/`.

## Task Description
Build a comprehensive opaque-box E2E test suite derived from user requirements and `PROJECT.md § Feature Inventory` using Node.js test runner or a lightweight standalone runner.
Follow the 4-tier methodology:
1. **Test Infrastructure**:
   - Create `tests/e2e/package.json` and `tests/e2e/run_tests.js`.
   - Create `TEST_INFRA.md` following the template in instructions.
2. **Tier 1 — Feature Coverage (>=5 per feature)**:
   - Test every feature in isolation:
     - F1: PNPM monorepo workspace layout & package manifest validity
     - F2: Shared UI tokens & component exports in `@bumi-upi/ui`
     - F3: Supabase migrations DDL validity & syntax (tables, constraints)
     - F4: Local fallback mock store API (200 customers, 2,140 transactions, zero-credential operation)
     - F5: Full 105 menu items catalog (16 categories, M/L size pricing, Panas/Dingin variants)
     - F6: WhatsApp OTP console mode banner & auto-fill payload
     - F7: Demo credentials accessibility (Admin, Kasir, Customer)
3. **Tier 2 — Boundary & Corner Cases (>=5 per feature)**:
   - Empty cart checkout, negative quantities, invalid phone numbers, invalid OTPs, out-of-stock items, boundary prices, voucher limit boundary.
4. **Tier 3 — Cross-Feature Combinations**:
   - Pairing OTP login -> cart building -> variant selection -> voucher apply -> atomic order placement -> stock decrement -> receipt dispatch.
5. **Tier 4 — Real-World Application Scenarios (>=5)**:
   - Scenario 1: Dine-in Table 4 customer order with 3 items (including M/L and Panas/Dingin variants) and WhatsApp OTP login.
   - Scenario 2: Cashier POS fast order processing with voucher discount and atomic record.
   - Scenario 3: VIP Sahabat member redemption of birthday voucher and points accumulation.
   - Scenario 4: Kitchen display status transitions (Pending -> Cooking -> Ready -> Completed).
   - Scenario 5: Offline/zero-credential demo run utilizing local mock repository completely.
6. **Publish `TEST_READY.md`**:
   - Publish `TEST_READY.md` at project root summarizing runner command, tier counts, and feature checklist.
   - Run the test suite once (documenting what passes now vs what will pass as milestones complete).

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-11-01T01:03:01Z
You are test_writer_e2e.
Your working directory is: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\test_writer_e2e\
Read the original request file at: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture file at: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\PROJECT.md
Read your assignment in: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\test_writer_e2e\DISPATCH.md
Read survey reports from:
- C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\spec_miner_survey_1\survey_report.md
- C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_survey_2\survey_report.md
- C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_survey_3\survey_report.md

Your exclusive write ownership:
- tests/e2e/*
- TEST_INFRA.md at project root
- TEST_READY.md at project root

Your task is to design and implement the E2E test suite across Tiers 1-4:
- Tier 1: Feature Coverage (>=5 per feature)
- Tier 2: Boundary & Corner Cases (>=5 per feature)
- Tier 3: Cross-Feature Interactions
- Tier 4: Real-World Application Scenarios (>=5)
Create TEST_INFRA.md, write executable test cases in tests/e2e/, execute test runner, and publish TEST_READY.md at project root.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Document your commands, tests created, and verification output in handoff.md in your working directory.
When done, send a message to parent with summary and file reference.

