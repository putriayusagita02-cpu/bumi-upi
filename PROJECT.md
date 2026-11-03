# Project: Rumah Tamah Bumi Upi — F&B CRM & Ordering Monorepo

## Architecture
Monorepo berbasis PNPM Workspaces yang memisahkan aplikasi customer dan admin/POS dengan shared packages:
- `packages/ui`: Shared design system bergaya "Rumah Nenek Sunda" (Hijau Olive `#3E4F30`, Krem Kertas `#F5EEDC`, Terakota `#B4532A`, Mustard `#D4A24C`; font Fraunces, Caveat, Plus Jakarta Sans; tombol, badge, modal, toast helper dengan auto-fill OTP, kartu member).
- `packages/db`: Data access layer berbasis Repository Pattern:
  - Supabase PostgreSQL client & migration scripts (tabel relasional, atomic RPC `create_order_atomic`, RLS policies).
  - Fallback local in-memory mock store untuk pengujian instan zero-credential tanpa blokir koneksi jaringan (200 pelanggan, 2.140 transaksi, 105 menu item lengkap, generator RFM kuintil & 7 segmen).
- `apps/web`: Portal Pelanggan & Pemesanan Mandiri (Next.js 14):
  - Katalog 105 menu dalam 16 kategori otentik Sunda dengan pencarian dan filter.
  - Modal kustomisasi menu: pilihan ukuran M/L, suhu Panas/Dingin, catatan pedas/khusus.
  - Keranjang belanja dine-in (nomor meja) dan takeaway.
  - Autentikasi WhatsApp OTP mode konsol dengan banner terminal dan UI toast helper auto-fill.
  - Kartu loyalitas digital, tier membership (Tamu, Sahabat, Keluarga), wallet voucher, dan riwayat pesanan.
  - Checkout pembayaran QRIS dinamis & pelacak status pesanan real-time.
  - Asisten ramah Upi Chat AI berbudaya Sunda.
- `apps/admin`: Portal Admin & Kasir POS (Next.js 14):
  - Layar POS Kasir cepat dengan pemilihan varian, pemotongan stok otomatis, dan locking kupon.
  - Live Kitchen Display System (KDS) untuk pesanan masuk.
  - Dashboard Analitik Pelanggan RFM (7 segmen pelanggan, RFM score 1-5, CLV).
  - Manajemen katalog 105 menu & inventaris stok.
  - Audit trail log sistem.
  - Integrasi Telegram Bot (`@BumiUpiBot`) untuk pengiriman struk transaksi WIB dan notifikasi dapur.
  - Demo role switcher & kredensial instan di README.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | PNPM Monorepo Workspace | Workspace pnpm (`pnpm-workspace.yaml`, root scripts `build`, `dev`, `test`, `apps/*`, `packages/*`) | M1 | ORIGINAL_REQUEST §1 |
| 2 | Shared UI Design System | Paket `packages/ui` dengan token warna Sunda heritage, typography, komponen UI, dan toast OTP helper | M1 | ORIGINAL_REQUEST §1 & Survey |
| 3 | Supabase Postgres Migrations | DDL migrations skema relasional lengkap (profiles, categories, products, product_variants, orders, order_items, payments, inventory, vouchers, audit_logs) + atomic functions | M2 | ORIGINAL_REQUEST §2 & Survey |
| 4 | Fallback Local Mock API Store | In-memory repository dual-mode di `packages/db` dengan 200 pelanggan sintetis, 2.140 tx, RFM calculator, dan zero-credential fallback | M2 | ORIGINAL_REQUEST §2 |
| 5 | Full 105 Menu Catalog Seeding | 105 item menu dari `MENU-REGULER.pdf` dalam 16 kategori lengkap dengan varian M/L, Panas/Dingin, dan harga di-seed ke SQL & mock store | M2 | ORIGINAL_REQUEST §5 |
| 6 | Customer Catalog & Order Customization | apps/web: Browsing 105 item, 16 kategori, pencarian, filter, seleksi varian M/L dan Panas/Dingin, keranjang meja/takeaway | M3 | Survey & ORIGINAL_REQUEST |
| 7 | WhatsApp OTP Console Mode | apps/web: Otentikasi nomor HP dengan server console log banner & UI toast helper dengan tombol auto-fill OTP | M3 | ORIGINAL_REQUEST §3 |
| 8 | Customer Loyalty & Wallet | apps/web: Digital membership card, poin & tier progress (Tamu/Sahabat/Keluarga), klaim voucher diskon, order history & tracker | M3 | Survey |
| 9 | Upi Chat AI Heritage Assistant | apps/web: Asisten customer service lokal berbudaya Sunda untuk rekomendasi menu dan bantuan reservasi | M3 | Survey |
| 10 | POS Cashier Fast Checkout | apps/admin: Terminal kasir POS cepat, penambahan menu instan, seleksi varian, aplikasi voucher dengan atomic row lock | M4 | ORIGINAL_REQUEST §4 & Survey |
| 11 | Live Kitchen Display System (KDS) | apps/admin: Tampilan pesanan dapur real-time untuk status pesanan Masuk -> Diproses -> Siap -> Selesai | M4 | Survey |
| 12 | RFM Customer CRM & Analytics | apps/admin: Analitik loyalitas 7 segmen (Juara, Setia, Potensial, Butuh Perhatian, Hampir Lepas, Berisiko, Tertidur), skor kuintil, CLV | M4 | Survey |
| 13 | Menu & Stock Inventory Management | apps/admin: Manajemen status stok menu (Tersedia, Terbatas, Habis), pembaruan harga, dan audit log perubahan | M4 | Survey |
| 14 | Telegram Bot Receipt & Notifications | apps/admin: Integrasi webhook/simulasi Telegram bot (`@BumiUpiBot`) berformat waktu WIB untuk struk dan tiket pesanan | M4 | ORIGINAL_REQUEST Persona |
| 15 | Demo Accounts & Quick Switcher | README dan UI: Demo admin `putriayusagita02@gmail.com` / `BumiUpiAdmin2026!`, kasir `kasir@bumiupi.id`, dan customer dengan quick login | M4 | ORIGINAL_REQUEST §4 |
| 16 | Comprehensive E2E Testing Suite | Dual track E2E testing: Tiers 1-4 requirement-driven test harness dan Tier 5 adversarial hardening | M5 | Project Pattern & Dual Track |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Monorepo Foundation & Shared UI | Setup pnpm workspace, root configurations, dan paket `packages/ui` (design tokens, components, toast helper) | none | IN_PROGRESS |
| M2 | Database, Migrations, 105 Seed & Mock Store | Skema Supabase PostgreSQL lengkap, seed 105 menu item dari PDF, dan in-memory mock engine di `packages/db` | M1 | PLANNED |
| M3 | Customer Web Portal & Ordering App | Aplikasi `apps/web`: katalog 105 menu, kustomisasi varian M/L/Panas/Dingin, WhatsApp OTP console, loyalty, QRIS checkout, Upi Chat | M1, M2 | PLANNED |
| M4 | Admin/Kasir POS & CRM Dashboard | Aplikasi `apps/admin`: POS kasir, live KDS, RFM CRM analytics, inventaris stok, Telegram bot, demo quick login, dan README | M1, M2 | PLANNED |
| M5 | Final E2E Test Pass & Hardening | Phase 1: 100% pass E2E test suite (Tiers 1-4). Phase 2: Adversarial coverage hardening (Tier 5) | M3, M4 | PLANNED |

## Interface Contracts
### `packages/ui` ↔ `apps/web` & `apps/admin`
- Shared Theme & Tokens: `colors` (olive, krem, terakota, mustard), `fonts` (Fraunces, Caveat, Plus Jakarta Sans).
- Component Exports: `Button`, `Input`, `Badge`, `Modal`, `Card`, `ToastProvider` & `useToast`, `OtpHelperToast`, `MemberCard`, `Navbar`.

### `packages/db` ↔ `apps/web` & `apps/admin`
- Repository Pattern Functions:
  - `getMenuCatalog()`: Menghasilkan 105 item terkelompok dalam 16 kategori beserta varian dan harga.
  - `getMenuItem(id)`: Mengambil detail item dan opsi varian.
  - `createOrderAtomic(orderData)`: Membuat pesanan secara atomic (idempotency key, row-locking kupon, pengurangan inventaris stok).
  - `getCustomerProfile(phoneOrEmail)`: Mengambil profil, poin, tier, dan voucher aktif.
  - `verifyOtp(phone, otpCode)`: Verifikasi OTP (mendukung kode dari server log / toast helper demo).
  - `getRfmSegments()`: Menghasilkan analitik 7 segmen pelanggan berdasarkan 2.140 transaksi.
  - `getTransactions(options)`: Mengambil daftar riwayat transaksi kasir dan pelanggan.
  - `updateStock(itemId, quantityDelta)`: Memperbarui stok inventaris dan mencatat `audit_logs`.

### `apps/admin` ↔ Telegram Bot
- `sendTelegramReceipt(orderId, customerTelegramId)`: Mengirimkan struk transaksi berformat WIB ke Telegram.
- `sendKitchenNotification(orderId, items, tableNumber)`: Mengirim pesan notifikasi pesanan baru ke grup dapur.

## Code Layout
```
C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\
├── pnpm-workspace.yaml
├── package.json
├── README.md
├── packages/
│   ├── ui/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── styles/
│   │       │   └── tokens.css
│   │       └── components/
│   │           ├── Button.tsx
│   │           ├── Badge.tsx
│   │           ├── Modal.tsx
│   │           ├── Toast.tsx
│   │           ├── OtpToastHelper.tsx
│   │           └── MemberCard.tsx
│   └── db/
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── types.ts
│       │   ├── supabaseClient.ts
│       │   ├── mockStore.ts
│       │   ├── seedCatalog105.ts
│       │   └── rfmEngine.ts
│       └── migrations/
│           ├── 20261031000001_initial_schema.sql
│           ├── 20261031000002_atomic_functions.sql
│           ├── 20261031000003_rls_policies.sql
│           ├── 20261031000004_seed_catalog_105.sql
│           └── 20261031000005_orders_and_inventory.sql
├── apps/
│   ├── web/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx
│   │       │   ├── menu/page.tsx
│   │       │   ├── cart/page.tsx
│   │       │   ├── checkout/page.tsx
│   │       │   ├── order/[id]/page.tsx
│   │       │   ├── member/page.tsx
│   │       │   ├── auth/page.tsx
│   │       │   └── api/
│   │       │       ├── auth/otp/route.ts
│   │       │       ├── orders/route.ts
│   │       │       └── ai/chat/route.ts
│   │       └── components/
│   └── admin/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── page.tsx
│           │   ├── pos/page.tsx
│           │   ├── kitchen/page.tsx
│           │   ├── crm/page.tsx
│           │   ├── inventory/page.tsx
│           │   ├── audit/page.tsx
│           │   ├── login/page.tsx
│           │   └── api/
│           │       ├── pos/transaction/route.ts
│           │       └── telegram/notify/route.ts
│           └── components/
└── tests/
    └── e2e/
        ├── package.json
        ├── run_tests.js
        └── tiers/
            ├── tier1_features.test.js
            ├── tier2_boundaries.test.js
            ├── tier3_interactions.test.js
            └── tier4_application.test.js
```
