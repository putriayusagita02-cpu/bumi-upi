# Dispatch — Worker M3: Customer Web Portal (`apps/web`)

## Mandatory References
- Read `ORIGINAL_REQUEST.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md`
- Read `PROJECT.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\PROJECT.md`
- Read `TEST_READY.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\TEST_READY.md`

## Write Ownership (Exclusive)
You exclusively own:
- `apps/web/*` (all files in `apps/web/`)
DO NOT modify files in `packages/ui`, `packages/db`, or `apps/admin`.

## Task Description
Build the complete Customer Web Portal & Ordering Application in `apps/web` (Next.js 14 App Router):
1. **Next.js 14 Setup & Config**:
   - `apps/web/package.json` (`@bumi-upi/web`, dependencies: `next`, `react`, `react-dom`, `@bumi-upi/ui`, `@bumi-upi/db`, `lucide-react`, `clsx`, `tailwind-merge`).
   - `apps/web/tsconfig.json`, `apps/web/next.config.js`, `apps/web/tailwind.config.js`, `apps/web/postcss.config.js`.
2. **Pages & Features (Human-Crafted Sunda Heritage Design)**:
   - Root layout (`src/app/layout.tsx`): Sunda heritage palette (Olive `#3E4F30`, Krem `#F5EEDC`, Terakota `#B4532A`, Mustard `#D4A24C`), ToastProvider, mobile-friendly navigation.
   - Home / Landing (`src/app/page.tsx`): Hero with welcome banner "Hayu ka Bumi Upi!", table selection (Dine-in table 1-20 / Takeaway), quick links, digital member card snippet.
   - Menu Catalog (`src/app/menu/page.tsx`):
     - Displays all 105 items across 16 authentic categories (Cemilan Cepuluh, Ber Pepes An, Emih-Emihan, Pemadam Kelaparan, Tuntutan Masyarakat, Sumber Protein, Minuman Seger Adem, Es Esan, Teh & Susu, Jejamuan, Kopi, Jus 4 U, Roti Satu Rasa Cukup, Roti Bakar Gurih, Dua Lebih Spesial, Pisang Bakar).
     - Category pills, live search bar, filter tags (Rekomendasi, Favorit, Pedas, Untuk Anak).
     - Item Customization Modal: Select size (Medium / Large with dynamic price addition), Temperature (Panas / Dingin), quantity, and notes.
   - Cart & Checkout (`src/app/cart/page.tsx`, `src/app/checkout/page.tsx`):
     - Table number display, item breakdown, voucher claim/apply with live discount calculation.
     - Dynamic QRIS simulation with QR code and timer.
     - Submitting order invokes `createOrderAtomic` from `@bumi-upi/db`.
   - Order Tracker (`src/app/order/[id]/page.tsx`):
     - Live visual status pipeline: `Menunggu Konfirmasi` -> `Sedang Dimasak` -> `Siap Diantar` -> `Selesai`.
   - Customer Auth / WhatsApp OTP (`src/app/auth/page.tsx`, `src/app/api/auth/otp/route.ts`):
     - Mode 'console': OTP 6-angka printed with banner to server console log.
     - UI Toast Helper: When OTP is requested, frontend triggers `OtpToastHelper` with auto-fill button, enabling seamless demo flow.
   - Digital Member & Loyalty (`src/app/member/page.tsx`):
     - Shows `MemberCard` with current tier (Tamu, Sahabat, Keluarga), points balance, progress bar, vouchers wallet.
   - Upi Chat AI (`src/app/api/ai/chat/route.ts`, chat drawer):
     - Friendly AI customer service with Sunda hospitality answering menu questions and recommendations.
3. **Build & Verify**:
   - Run `pnpm.cmd --filter @bumi-upi/web build` or typecheck.
   - Document verification commands and output in `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-01T01:38:05Z
From: 84903406-8a88-4b8e-8505-db2987cdbaca
Content:
You are worker_m3.
Your working directory is: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\worker_m3\
Read the original request file at: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture file at: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\PROJECT.md
Read your assignment in: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\worker_m3\DISPATCH.md
Read TEST_READY.md: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\TEST_READY.md

Your exclusive write ownership:
- apps/web/*

Your task is to build the Customer Web Portal & Ordering Application in apps/web (Next.js 14):
1. Setup package.json, tsconfig.json, next.config.js, tailwind.config.js, layout.tsx with Sunda heritage theme.
2. Home page (welcome, table selection dine-in / takeaway).
3. 105 Menu catalog page across 16 authentic categories with live search, category tabs, and customization modal (M/L size with price delta, Panas/Dingin temperature, notes).
4. Cart & Checkout page with dynamic QRIS simulation and atomic order submission.
5. Order tracker page with real-time status transitions.
6. WhatsApp OTP auth in console mode (prints banner to console and triggers OtpToastHelper with auto-fill button).
7. Digital Member Card page with tier, points, vouchers.
8. Upi Chat AI customer service assistant.
9. Verify build and typecheck with pnpm.cmd.


## 2026-11-01T02:59:47Z
From: 84903406-8a88-4b8e-8505-db2987cdbaca
Content:
**Context**: PRIORITAS TINGGI / BOOST DARI USER
**Content**: User meminta penyelesaian segera:
Mohon selesaikan implementasi apps/web (halaman menu 105 item, filter/search, varian modal M/L & Panas/Dingin, keranjang, OTP console flow + toast helper, digital member card, QRIS checkout, Upi Chat AI), pastikan build/typecheck lulus, dan segera serahkan handoff.md!
**Action**: Finalisasi implementasi apps/web dan serahkan handoff.md sekarang juga.


## 2026-11-01T03:05:42Z
From: 84903406-8a88-4b8e-8505-db2987cdbaca
Content:
**Context**: Finalisasi Milestone 3 (apps/web)
**Content**: Seluruh halaman apps/web sudah terverifikasi lengkap di disk (layout, home, menu 105 catalog, cart, checkout QRIS, order tracker, auth OTP, member card, Upi Chat AI).
**Action**: Mohon jalankan build verification, tulis handoff.md, dan kirim pesan selesai sekarang juga.
