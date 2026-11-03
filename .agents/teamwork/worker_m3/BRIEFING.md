# BRIEFING — 2026-11-01T03:14:00Z

## Mission
Build the complete Customer Web Portal & Ordering Application in `apps/web` (Next.js 14) for Rumah Tamah Bumi Upi, featuring 105 catalog items in 16 categories, variant customization, table/takeaway selection, cart & dynamic QRIS checkout, atomic order submission, order status tracker, WhatsApp OTP auth with console banner and toast helper, digital loyalty member card, and Upi Chat AI assistant.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\worker_m3\
- Original parent: 84903406-8a88-4b8e-8505-db2987cdbaca
- Milestone: M3 (Customer Web Portal & Ordering Application)

## 🔒 Key Constraints
- Exclusive write ownership: apps/web/* only.
- DO NOT modify packages/ui, packages/db, or apps/admin.
- Integrity mandate: genuine implementation, zero cheating, zero hardcoding of test assertions or facade mocks.
- Sunda heritage theme tokens (Olive #3E4F30, Krem #F5EEDC, Terakota #B4532A, Mustard #D4A24C).
- 105 authentic items across 16 categories with variant customization (M/L size price delta, Panas/Dingin temp, notes).
- WhatsApp OTP auth in console mode (prints banner to console and triggers OtpToastHelper auto-fill).
- Submitting order invokes createOrderAtomic.

## Current Parent
- Conversation ID: 84903406-8a88-4b8e-8505-db2987cdbaca
- Updated: 2026-11-01T03:05:42Z

## Task Summary
- **What to build**: Next.js 14 Customer Web Portal in `apps/web`:
  - Configuration (`package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.js`, `postcss.config.js`)
  - Root Layout with Sunda Heritage theme and ToastProvider (`src/app/layout.tsx`)
  - Home landing page (`src/app/page.tsx`) with table selection (1-20 dine-in / takeaway)
  - Menu catalog (`src/app/menu/page.tsx`) with 105 items, 16 categories, search, filter tags, and customization modal
  - Cart & Checkout (`src/app/cart/page.tsx`, `src/app/checkout/page.tsx`) with voucher discount, QRIS simulation, and atomic order creation
  - Order tracker (`src/app/order/[id]/page.tsx`) with live status pipeline
  - WhatsApp OTP auth (`src/app/auth/page.tsx`, `src/app/api/auth/otp/route.ts`) with console banner and UI toast auto-fill
  - Digital Member Card (`src/app/member/page.tsx`) with tier, points, vouchers
  - Upi Chat AI assistant (`src/app/api/ai/chat/route.ts`, chat drawer/widget)
- **Success criteria**: Genuine full-featured web app, Next.js build and typecheck pass, E2E test suite remains 100% pass.
- **Interface contracts**: PROJECT.md § Interface Contracts
- **Code layout**: PROJECT.md § Code Layout

## Key Decisions Made
- Use `@bumi-upi/ui` components (`Button`, `Badge`, `Card`, `Modal`, `ToastProvider`, `useToast`, `OtpToastHelper`, `MemberCard`) and token styling.
- Client Component wrapper `Providers.tsx` ensures flawless Next.js App Router context integration.
- Full 105 items from `MENU-REGULER.pdf` in 16 categories with size variants and temperature options.
- Dynamic QRIS simulation with authentic vector QR and countdown timer.
- WhatsApp OTP console mode banner + `OtpToastHelper` auto-fill event listener.

## Artifact Index
- `apps/web/package.json` — Web package manifest with build & typecheck scripts
- `apps/web/next.config.js` — Next.js configuration
- `apps/web/tailwind.config.js` — Tailwind CSS Sunda heritage config
- `apps/web/postcss.config.js` — PostCSS configuration
- `apps/web/tsconfig.json` — TypeScript configuration
- `apps/web/src/components/Providers.tsx` — Client context providers wrapper
- `apps/web/src/components/Navbar.tsx` — Sunda heritage navbar with table selector pill
- `apps/web/src/components/Footer.tsx` — Heritage footer with address & hours
- `apps/web/src/components/UpiChatDrawer.tsx` — AI customer service assistant drawer
- `apps/web/src/components/TableSelectorModal.tsx` — Meja 1-20 & Takeaway modal
- `apps/web/src/components/CustomizationModal.tsx` — M/L size delta, Panas/Dingin temp, notes modal
- `apps/web/src/components/OtpHelperToastContainer.tsx` — OtpToastHelper auto-fill demo container
- `apps/web/src/components/icons/index.tsx` — Pure SVG icons
- `apps/web/src/context/CartContext.tsx` — Cart state and calculations
- `apps/web/src/context/AuthContext.tsx` — Auth state with OTP toast helper
- `apps/web/src/lib/types.ts` — TypeScript interfaces
- `apps/web/src/lib/catalogData.ts` — 105 items across 16 categories & vouchers
- `apps/web/src/lib/dbBridge.ts` — Database bridge & local order engine
- `apps/web/src/app/layout.tsx` — Root Layout
- `apps/web/src/app/page.tsx` — Landing page with Hero "Hayu ka Bumi Upi!" and Table selector
- `apps/web/src/app/menu/page.tsx` — 105 item menu catalog with 16 category pills and modal
- `apps/web/src/app/cart/page.tsx` — Cart page with voucher application
- `apps/web/src/app/checkout/page.tsx` — QRIS payment & order submission
- `apps/web/src/app/order/[id]/page.tsx` — Visual order status tracker
- `apps/web/src/app/auth/page.tsx` — WhatsApp OTP login with console banner and toast auto-fill
- `apps/web/src/app/member/page.tsx` — Digital member loyalty card & voucher wallet
- `apps/web/src/app/api/auth/otp/route.ts` — OTP API endpoint
- `apps/web/src/app/api/orders/route.ts` — Order submission and retrieval API
- `apps/web/src/app/api/ai/chat/route.ts` — Upi Chat AI assistant API

## Change Tracker
- **Files modified**: All 27 files in `apps/web/`
- **Build status**: PASS (Next.js 14 build: 12 static/dynamic routes prerendered)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (Next.js build PASS, E2E suite 95/95 PASS - 100%)
- **Lint status**: PASS
- **Tests added/modified**: Covered under dual-track E2E suite

## Loaded Skills
- None requested in dispatch prompt
