# Dispatch — Worker M4: Admin & Kasir POS Dashboard (`apps/admin`) & README

## Mandatory References
- Read `ORIGINAL_REQUEST.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md`
- Read `PROJECT.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\PROJECT.md`
- Read `TEST_READY.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\TEST_READY.md`

## Write Ownership (Exclusive)
You exclusively own:
- `apps/admin/*` (all files in `apps/admin/`)
- Root `README.md`
DO NOT modify files in `packages/ui`, `packages/db`, or `apps/web`.

## Task Description
Build the complete Admin & Staff POS Dashboard in `apps/admin` (Next.js 14 App Router) and root `README.md`:
1. **Next.js 14 Setup & Config**:
   - `apps/admin/package.json` (`@bumi-upi/admin`, dependencies: `next`, `react`, `react-dom`, `@bumi-upi/ui`, `@bumi-upi/db`, `lucide-react`, `clsx`, `tailwind-merge`).
   - `apps/admin/tsconfig.json`, `apps/admin/next.config.js`, `apps/admin/tailwind.config.js`, `apps/admin/postcss.config.js`.
2. **Pages & Features (Human-Crafted Professional POS/CRM Design)**:
   - Root layout (`src/app/layout.tsx`): Admin sidebar navigation (POS Kasir, Live Kitchen, CRM Pelanggan, Inventaris Menu, Audit Log), header with active role indicator.
   - Demo Login & Quick Role Switcher (`src/app/login/page.tsx`):
     - Admin: `putriayusagita02@gmail.com` / `BumiUpiAdmin2026!`
     - Kasir: `kasir@bumiupi.id` / `kasir2026`
     - Customer: `customer@bumiupi.id` / `081234567890`
     - Quick "One-Click Demo Login" buttons for instant switcher during evaluation!
   - Fast POS Cashier Terminal (`src/app/pos/page.tsx`):
     - Table grid view + takeaway order mode.
     - Quick catalog search & category filtering for 105 items.
     - Fast variant selection modal (M/L, Panas/Dingin).
     - Customer member scanner (by phone / QR code), voucher selector with live validation.
     - Quick payment buttons (Cash, QRIS, Debit) invoking `createOrderAtomic` or `record_transaction`.
     - Printable / viewable receipt with authentic Sunda greeting and formatted WIB timestamp.
   - Live Kitchen Display System (KDS) (`src/app/kitchen/page.tsx`):
     - Real-time kanban board of kitchen tickets: `Masuk` -> `Dimasak` -> `Siap Diambil` -> `Selesai`.
     - Sound alert / visual highlight for newly placed dine-in orders.
   - RFM Customer CRM & Analytics (`src/app/crm/page.tsx`):
     - Summary metrics: Total Customers (200), Total Revenue, Average Order Value (AOV).
     - RFM Quintile Scoring (Recency, Frequency, Monetary 1-5).
     - 7 Authentic Customer Segments: Juara, Setia, Potensial, Butuh Perhatian, Hampir Lepas, Berisiko, Tertidur.
     - Customer list with search, tier, point balance, and CLV estimates.
   - Menu & Stock Inventory (`src/app/inventory/page.tsx`):
     - Status tracker for 105 items (Tersedia, Terbatas, Habis).
     - Quick stock toggle and price update logging.
   - Audit Trail Viewer (`src/app/audit/page.tsx`):
     - Timeline of cashier transactions, stock edits, voucher applications, and staff actions.
   - Telegram Bot Notification Integration (`src/app/api/telegram/notify/route.ts`):
     - Endpoint / helper generating WIB formatted transaction receipts and kitchen tickets for `@BumiUpiBot`.
3. **Comprehensive Root `README.md`**:
   - Monorepo architecture overview (`apps/web`, `apps/admin`, `packages/ui`, `packages/db`).
   - Official Demo Credentials table (`putriayusagita02@gmail.com` / `BumiUpiAdmin2026!`, Kasir, Customer).
   - How to run dev servers (`pnpm dev` or per-app commands).
   - Verification commands (`node tests/e2e/run_tests.js`).
4. **Build & Verify**:
   - Run `pnpm.cmd --filter @bumi-upi/admin build` or typecheck.
   - Document verification commands and output in `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-01T01:38:12Z
[Message] sender=84903406-8a88-4b8e-8505-db2987cdbaca priority=MESSAGE_PRIORITY_HIGH
Content: You are worker_m4.
Your working directory is: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\worker_m4\
Read the original request file at: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture file at: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\PROJECT.md
Read your assignment in: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\worker_m4\DISPATCH.md
Read TEST_READY.md: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\TEST_READY.md

Your exclusive write ownership:
- apps/admin/*
- Root README.md

Your task is to build the Admin & Kasir POS Dashboard in apps/admin (Next.js 14) and root README.md


## 2026-11-01T02:59:52Z
[Message] sender=84903406-8a88-4b8e-8505-db2987cdbaca priority=MESSAGE_PRIORITY_HIGH
Context: PRIORITAS TINGGI / BOOST DARI USER
Content: User meminta penyelesaian segera:
Mohon selesaikan implementasi apps/admin (POS kasir, live KDS, analitik RFM 7 segmen, inventaris stok, audit trail, Telegram bot, demo quick login) dan root README.md, pastikan build/typecheck lulus, dan segera serahkan handoff.md!
Action: Finalisasi implementasi apps/admin dan serahkan handoff.md sekarang juga.
