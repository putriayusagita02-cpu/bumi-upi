# 🏡 Bumi Upi — Sistem CRM & Pemesanan Terintegrasi Rumah Tamah Garut
> *"Sejauh apapun pergi, rumah tempatnya pulang."*

[![Mata Kuliah CRM](https://img.shields.io/badge/Studi%20Kasus-Mata%20Kuliah%20CRM-3E4F30?style=for-the-badge)](https://github.com/)
[![Monorepo](https://img.shields.io/badge/Monorepo-PNPM%20Workspaces-8A8F5F?style=for-the-badge)](https://pnpm.io/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14%20App%20Router-B4532A?style=for-the-badge)](https://nextjs.org/)
[![Basis Data](https://img.shields.io/badge/Database-Supabase%20%2F%20Postgres-3E4F30?style=for-the-badge)](https://supabase.com/)
[![Telegram Bot](https://img.shields.io/badge/Telegram-@BumiUpiBot-B4532A?style=for-the-badge)](https://core.telegram.org/bots)
[![Zona Waktu](https://img.shields.io/badge/Timezone-WIB%20(Asia%2FJakarta)-D4A24C?style=for-the-badge)](https://time.is/WIB)

> ⚠️ **CATATAN PENTING & PENYANGKALAN (DISCLAIMER):**  
> Proyek aplikasi ini adalah **studi kasus mata kuliah Customer Relationship Management (CRM)**, **BUKAN** situs web atau aplikasi resmi komersial Rumah Tamah Bumi Upi.  
> Semua data pelanggan (200 profil sintetis), transaksi (2.140 baris historis), dan skor RFM yang disajikan dalam repositori ini adalah **DATA SIMULASI REALISTIS** yang dirancang untuk keperluan akademik dan evaluasi sistem.

---

## 🏛️ 1. Arsitektur Monorepo PNPM

Repositori ini menggunakan arsitektur modern **PNPM Workspaces** yang memisahkan aplikasi antarmuka pelanggan dan dasbor manajemen internal, serta berbagi pustaka token desain dan akses data:

```
bumi-upi/
├── apps/
│   ├── web/                     # Portal Pelanggan & Self-Ordering PWA (Next.js 14)
│   │   ├── src/app/             # Katalog 105 menu, Keranjang Meja, WhatsApp OTP, Loyalty Card, QRIS
│   │   └── package.json         # @bumi-upi/web (Port 3000)
│   └── admin/                   # Dasbor Admin, Kasir POS & Live KDS (Next.js 14)
│       ├── src/app/             # POS Kasir, Live KDS Dapur, CRM RFM 7 Segmen, Inventaris Stok, Audit Log
│       └── package.json         # @bumi-upi/admin (Port 3001)
├── packages/
│   ├── ui/                      # Shared Design System Sunda Heritage
│   │   ├── src/tokens/          # Palet Olive (#3E4F30), Krem (#F5EEDC), Terakota (#B4532A), Mustard (#D4A24C)
│   │   └── src/components/      # Button, Badge, Card, Modal, Toast, OtpToastHelper, MemberCard
│   └── db/                      # Repository Layer & In-Memory Store
│       ├── src/                 # Fallback store, 105 seed items, 200 customer profiles, kalkulator RFM
│       └── migrations/          # DDL PostgreSQL Supabase (RLS, schema, atomic RPC create_order_atomic)
├── tests/
│   └── e2e/                     # Dual-Track E2E Test Harness (Tiers 1 - 4, 95/95 PASS)
├── pnpm-workspace.yaml          # Konfigurasi workspace monorepo
└── package.json                 # Skrip root build, dev, test, typecheck
```

---

## 🔑 2. Kredensial Akun Demo Resmi (Siap Uji)

Aplikasi menyediakan kredensial resmi dan tombol sekali klik (*One-Click Demo Login*) di `/login` untuk memudahkan evaluasi instan:

| Peran (Role) | Email / Nomor HP | Kata Sandi | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **👑 Pemilik / Admin (Owner)** | `putriayusagita02@gmail.com` *(atau `admin@bumiupi.id`)* | `BumiUpiAdmin2026!` *(atau `bumiupi2026`)* | Akses Penuh: Dasbor Analitik, POS Kasir, Live KDS Dapur, CRM RFM 7 Segmen, Inventaris 105 Stok Menu, Log Audit |
| **💼 Kasir (POS Staff)** | `kasir@bumiupi.id` | `kasir2026` | Terminal Kasir POS Meja, Live Kitchen Display (KDS), Update Stok Cepat, Cetak Struk WIB |
| **👤 Pelanggan Sahabat (Customer)** | `customer@bumiupi.id` *(atau `081234567890`)* | `tamu2026` *(atau OTP Konsol)* | Kartu Member Digital (Dimas Kurniawan), Saldo 142 Poin (Tier Sahabat), QR `BUMI-CUST-8899`, Riwayat & Voucher |

---

## 📱 3. Fitur Utama & Keunggulan Sistem

### A. Terminal Kasir POS Cepat (`apps/admin/src/app/pos`)
- **Pilihan Meja & Takeaway:** Dukungan meja makan di tempat (*Meja 01 - 12*, *Bale Utama 01 - 04*, *Lesehan 01 - 04*) dan pesanan bungkus (*Takeaway*).
- **Katalog 105 Menu Lengkap:** 105 menu otentik Garut dari `MENU-REGULER.pdf` dalam 16 kategori fisik.
- **Modal Varian Cepat:** Seleksi ukuran porsi (*Medium / Large*) dan suhu minuman (*Panas / Dingin*).
- **Pemindai Member & Voucher:** Deteksi cepat member via QR code (`BUMI-CUST-8899`) atau nomor HP, serta kalkulasi diskon kupon otomatis.
- **Transaksi Atomic:** Pengurangan stok langsung, kalkulasi perolehan poin (+1 poin per Rp 10.000), kenaikan level tier (*Tamu → Sahabat → Keluarga*), dan pencatatan audit log.
- **Struk Resmi WIB & Integrasi Telegram:** Cetak struk 80mm dengan sapaan hangat Sunda *"Hatur nuhun parantos sumping ka Bumi Upi! 🙏"* dan pengiriman notifikasi otomatis ke `@BumiUpiBot`.

### B. Live Kitchen Display System (KDS) (`apps/admin/src/app/kitchen`)
- **Papan Kanban 4 Tahap:** `Masuk (Menunggu)` → `Sedang Dimasak` → `Siap Diambil / Saji` → `Selesai Disajikan`.
- **Indikator Waktu Riil:** Timer menit berjalan dan penanda prioritas otomatis untuk pesanan yang menunggu lebih dari 15 menit.
- **Peringatan Suara Audio:** Notifikasi nada audio saat ada pesanan baru yang dikirim dari kasir atau portal pelanggan.

### C. Analitik Pelanggan RFM 7 Segmen (`apps/admin/src/app/crm`)
- **Metrik Utama:** Total 200 Member Pelanggan, Total Omzet Historis, dan Average Order Value (AOV).
- **Skoring Kuintil RFM (1 - 5):** Recency (hari kunjungan terakhir), Frequency (frekuensi makan), dan Monetary (total belanja).
- **7 Segmen Otentik:**
  1. **Juara (Champions):** Pelanggan terbaik berbelanja paling sering.
  2. **Setia (Loyal):** Pelanggan setia yang stabil.
  3. **Potensial (Potential Loyalists):** Pengunjung baru dengan nilai belanja tinggi.
  4. **Butuh Perhatian (Need Attention):** Pelanggan berbelanja di atas rata-rata yang mulai jarang mampir.
  5. **Hampir Lepas (About to Sleep):** Pelanggan yang sudah lama tidak berkunjung.
  6. **Berisiko (At Risk):** Dahulu sering datang, kini tidak pernah berkunjung.
  7. **Tertidur (Hibernating):** Kunjungan sangat lama dengan transaksi kecil.
- **Estimasi CLV (Customer Lifetime Value):** Proyeksi nilai masa hidup pelanggan untuk personalisasi promo.

### D. Manajemen Inventaris 105 Menu (`apps/admin/src/app/inventory`)
- Pelacak ketersediaan stok fisik: **Tersedia** (>10), **Terbatas** (1-10), **Habis** (0).
- Penyesuaian stok instan (`+1`, `-1`, `+10`, `-5`) atau pengeditan angka langsung yang tercatat ke buku besar audit.

### E. Jejak Audit (Audit Trail Viewer) (`apps/admin/src/app/audit`)
- Rekam jejak seluruh transaksi kasir (`CREATE_ORDER`), pembaruan status dapur (`UPDATE_ORDER_STATUS`), pembaruan stok (`UPDATE_STOCK`), dan sesi login pengguna (`AUTH_LOGIN`).

### F. Mode WhatsApp OTP Konsol (`apps/web`)
- Verifikasi pendaftaran tanpa biaya SMS eksternal menggunakan cetak banner di terminal server konsol dan helper toast UI untuk auto-fill kode 6 digit.

---

## 🚀 4. Cara Menjalankan Aplikasi

Pastikan lingkungan telah terpasang **Node.js (v18+)** dan **pnpm**:

### 1. Masuk ke direktori proyek:
```bash
cd C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi
```

### 2. Jalankan Dasbor Admin & Kasir POS (`apps/admin`):
```bash
# Opsi 1: Menjalankan dev server admin via pnpm filter
pnpm.cmd --filter @bumi-upi/admin dev

# Opsi 2: Masuk ke folder admin langsung
cd apps/admin
node ..\..\node_modules\next\dist\bin\next dev -p 3001
```
Akses di browser: **`http://localhost:3001`**

### 3. Jalankan Portal Pelanggan (`apps/web`):
```bash
pnpm.cmd --filter @bumi-upi/web dev
```
Akses di browser: **`http://localhost:3000`**

### 4. Menjalankan Semua Layanan Secara Bersamaan:
```bash
pnpm.cmd dev
```

---

## 🧪 5. Verifikasi Pengujian (Dual-Track E2E Test Suite)

Proyek ini telah dilengkapi dengan runner pengujian E2E otomatis yang memverifikasi 95 kasus uji tanpa facade mock fiktif:

```bash
# Jalankan seluruh suite E2E (Tiers 1 - 4)
node tests/e2e/run_tests.js
```

### Hasil Verifikasi:
```
======================================================================
📊 TEST EXECUTION SUMMARY REPORT
======================================================================
| Tier | Tier Description                       | Passed | Failed | Total | Status |
|------|----------------------------------------|--------|--------|-------|--------|
| T1   | Tier 1 — Feature Coverage (Isolation)   |     42 |      0 |    42 | PASS   |
| T2   | Tier 2 — Boundary & Corner Cases       |     42 |      0 |    42 | PASS   |
| T3   | Tier 3 — Cross-Feature Interactions    |      6 |      0 |     6 | PASS   |
| T4   | Tier 4 — Real-World Application Scenar |      5 |      0 |     5 | PASS   |
----------------------------------------------------------------------
Total Test Cases Executed : 95
Total Passed              : 95 (100.0% PASS)
======================================================================
```

### Verifikasi Typecheck TypeScript:
```bash
pnpm.cmd --filter @bumi-upi/admin typecheck
```

---

## 🎨 6. Identitas Desain "Rumah Nenek Sunda"
- **Olive (`#3E4F30`):** Warna utama logo Bumi Upi, bilah samping kasir, dan tombol konfirmasi.
- **Krem Kertas (`#F5EEDC` / `#FBF7EE`):** Latar belakang utama bernuansa kertas buku tamu tempo doeloe.
- **Terakota (`#B4532A`):** Aksen tombol aksi utama (*Call to Action*).
- **Mustard (`#D4A24C`):** Lencana poin loyalitas dan kartu member.
- **Tipografi:** Heading klasik *Fraunces*, antarmuka digital jernih *Plus Jakarta Sans*, dan aksen tulisan tangan *Caveat*.

---
*Rumah Tamah Bumi Upi Garut — Dibuat untuk Studi Kasus Mata Kuliah Customer Relationship Management (CRM) 2026.*
#   b u m i - u p i  
 