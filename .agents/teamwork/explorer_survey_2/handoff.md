# Handoff Report — explorer_survey_2

## 1. Observation
- **Workspace Path**: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi`
- **Node & NPM Execution**:
  - `Get-Command node.exe` returned `FileVersion 26.13.0` at `C:\Program Files\nodejs\node.exe`.
  - `& "C:\Program Files\nodejs\npm.cmd" --version` exited with code 0 and returned `11.20.0`.
  - Direct execution of `npm` or `pnpm` via PowerShell without `.cmd` encounters PowerShell script execution policy: `"npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system."`
  - Global npm prefix is `C:\Users\Asus\AppData\Roaming\npm`, which is in `$env:Path` (`Test-Path $env:APPDATA\npm` = `True`).
  - `pnpm` is not yet installed in global npm packages (`npm list -g --depth=0` shows `@opencode/cli`, `9router`, `better-sqlite3`, `sql.js`).
- **Existing Codebase Architecture**:
  - Current structure is a single standalone Next.js repository with `package.json` (`next: ^14.2.15`, `react: ^18.3.1`, `@supabase/supabase-js: ^2.45.4`).
  - `src/app/page.tsx` (lines 8-10): executes `window.location.href = '/index.html'` redirecting to a static single-page app in `public/`.
  - `public/app.js` is a 174 KB monolithic JavaScript file containing vanilla DOM manipulation for both customer and cashier views.
  - `server.js` (lines 1-139) is a zero-dependency Node HTTP server serving `public/` and handling mock `/api/telegram/webhook` and `/api/ai/chat`.
  - `src/lib/mockData.ts` (1,007 lines, 32.5 KB) contains mock generator functions for 200 customers, 2,140 transactions, 18 menu items, vouchers, reservations, and RFM calculation.
  - `src/lib/supabase.ts` (lines 1-229) implements an in-memory fallback store (`globalCustomers`, `globalTransactions`, `globalRFM`) when Supabase credentials are demo strings.
  - `supabase/migrations/` contains 4 migrations: `20261031000001_initial_schema.sql` (19 tables, ENUMs), `20261031000002_atomic_functions.sql` (`record_transaction`, voucher locking, RFM recalculation), `20261031000003_rls_policies.sql` (RLS policies), and `20261031000004_seed_data.sql` (contains only 18 menu items).
- **Original Menu PDF Discovery**:
  - Located `MENU-REGULER.pdf` at:
    `C:\Users\Asus\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\2D018F2FC604EE0E17A2CBF350B0532EA22815F2\transfers\2026-44\e95949cc-0357-4daf-939b-eabaa606b5eb_MENU-REGULER.pdf`
  - Transcribed **all 105 menu items across 16 authentic categories**:
    - Cemilan Cepuluh: 18 items
    - Ber Pepes An: 4 items
    - Emih-Emihan: 6 items
    - Pemadam Kelaparan: 7 items
    - Tuntutan Masyarakat: 8 items
    - Sumber Protein: 5 items
    - Minum-Minuman: Seger Adem: 9 items
    - Es Esan: 3 items
    - Teh & Susu: 10 items
    - Jejamuan: 3 items
    - Kopi: 6 items
    - Jus 4 U: 8 items
    - Roti-Rotian: Satu Rasa Cukup: 6 items
    - Roti Bakar Gurih: 6 items
    - Dua Lebih Spesial: 2 items
    - Pisang Bakar: 4 items
    Total: 18 + 4 + 6 + 7 + 8 + 5 + 9 + 3 + 10 + 3 + 6 + 8 + 6 + 6 + 2 + 4 = **105 items**.

## 2. Logic Chain
1. From the observation that Node `v26.13.0` and npm `11.20.0` are installed, but `pnpm` is not globally installed, installing `pnpm` via `& "C:\Program Files\nodejs\npm.cmd" install -g pnpm` is necessary and immediately feasible without administrative elevation because `$env:APPDATA\npm` is user-writable and present in `$env:Path`.
2. From the observation of PowerShell's ExecutionPolicy blocking `.ps1` files, all future task invocations should either execute `.cmd` wrappers (`pnpm.cmd`, `npm.cmd`) or invoke `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` within the process.
3. From the observation that the current application is a single Next.js project pointing to a monolithic vanilla JS file in `public/app.js`, the target architecture (`pnpm workspaces` with `apps/web`, `apps/admin`, `packages/ui`, `packages/db`) represents a clean greenfield/refactor migration that decouples:
   - Customer-facing interfaces into `apps/web`.
   - Admin and POS cashier interfaces into `apps/admin`.
   - Reusable design tokens (Hijau Olive `#3E4F30`, Krem `#F5EEDC`, Terakota `#B4532A`, Fraunces typography) and UI components into `packages/ui`.
   - Database schemas, mock fallback state, RFM calculation logic, and the complete 105-item catalog into `packages/db`.
4. From the observation that `supabase/migrations/20261031000004_seed_data.sql` and `src/lib/mockData.ts` only include 18 legacy menu items, whereas `MENU-REGULER.pdf` contains 105 items, the seed data in `packages/db` must be updated with the transcribed 105 menu items to satisfy requirement #5 of the user request.
5. From the observation that `src/lib/supabase.ts` already has an in-memory simulation engine for transactions, points, tiers, and RFM, this engine can be adapted into `packages/db/src/mockStore.ts` to satisfy requirement #2 (Supabase Postgres migrations + zero-blocker local mock API).

## 3. Caveats
- `pnpm` was not installed during this survey phase to adhere strictly to the "Read-only investigation" constraint. The installation command `& "C:\Program Files\nodejs\npm.cmd" install -g pnpm` must be executed by the first builder agent.
- `MENU-REGULER.pdf` in the WhatsApp transfer directory cannot be opened by Node directly due to Windows UWP package container sandboxing (`EPERM`), but its full visual contents were retrieved and transcribed via `view_file`.

## 4. Conclusion
The environment and workspace are completely ready for migration into the target PNPM Monorepo architecture (`apps/web`, `apps/admin`, `packages/ui`, `packages/db`). All necessary domain specifications, 105 menu items, credentials, mock datasets, and database migrations are documented and available for the builder agents to execute immediately.

## 5. Verification Method
1. **Verify Environment**:
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" --version
   # Expected: 11.20.0
   ```
2. **Verify PNPM Installation Command**:
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" install -g pnpm
   pnpm.cmd --version
   ```
3. **Inspect Transcribed Catalog & Report**:
   Inspect `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_survey_2\survey_report.md` to review the 105 items and workspace mapping.
