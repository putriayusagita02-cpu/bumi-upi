# TEST READY — Bumi Upi Dual Track E2E Test Suite (Tiers 1 - 4)

**Tanggal Publikasi**: 2026-11-01  
**Penyusun**: `test_writer_e2e`  
**Status**: **READY & VERIFIED (100% PASS, 95/95 TESTS)**

---

## 1. Ringkasan Eksekutif Kesiapan Suite

Suite pengujian E2E menyeluruh untuk ekosistem Monorepo PNPM Rumah Tamah Bumi Upi telah selesai dibangun dan diverifikasi dengan eksekusi nyata pada lingkungan proyek. Seluruh kasus uji diimplementasikan tanpa facade/dummy mock fiktif dan memvalidasi keutuhan spesifikasi dari dokumen otoritatif (`MENU-REGULER.pdf`, `PROJECT.md`, laporan survei arsitektur, skema migrasi Supabase, dan model store in-memory).

### Perintah Utama Eksekusi:
```bash
cd C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi
node tests/e2e/run_tests.js
```

---

## 2. Metrik Eksekusi & Distribusi Tier

| Tier | Deskripsi Lingkup | Target Min. | Jumlah Kasus | Status | Waktu Eksekusi |
|:---:|:---|:---:|:---:|:---:|:---:|
| **Tier 1** | Feature Coverage (F1 - F7) | >= 35 (>=5/fitur) | **42** | **PASS (42/42)** | ~430 ms |
| **Tier 2** | Boundary & Corner Cases (B1 - B7) | >= 35 (>=5/kategori) | **42** | **PASS (42/42)** | ~3.270 ms |
| **Tier 3** | Cross-Feature Interactions (Chains 1 - 6) | >= 5 | **6** | **PASS (6/6)** | ~5.420 ms |
| **Tier 4** | Real-World Application Scenarios (1 - 5) | >= 5 | **5** | **PASS (5/5)** | ~400 ms |
| **TOTAL** | **Seluruh Kasus Uji E2E Tiers 1 - 4** | **>= 80** | **95** | **100% PASS** | **~9,5 detik** |

---

## 3. Checklist Fitur & Verifikasi Spesifikasi

### Feature Coverage (Tier 1):
- [x] **F1: PNPM Monorepo Layout & Package Manifests** (6 tests): Validasi workspace root, konfigurasi workspaces (`apps/*`, `packages/*`), package.json scripts (`build`, `dev`, `test`), manifest `@bumi-upi/ui`, manifest `@bumi-upi/db`, dan struktur topologi monorepo.
- [x] **F2: Shared UI Tokens & Components** (6 tests): Token warna Sunda Heritage (Olive `#3E4F30`, Krem `#F5EEDC`, Terakota `#B4532A`, Mustard `#D4A24C`), font (Fraunces, Caveat, Plus Jakarta Sans), komponen `Button`, `Badge`, `OtpToastHelper`, dan `MemberCard`.
- [x] **F3: Supabase Postgres Migrations DDL Validity** (6 tests): Validasi berkas migrasi SQL, definisi tabel inti (`profiles`, `menu_categories`/`categories`, `menu_items`/`products`, `transactions`/`orders`, `vouchers`, `points_ledger`), ENUMs (`user_role`, `tier_level`, `rfm_segment_type`), fungsi atomic dengan lock `FOR UPDATE`, dan RLS policies.
- [x] **F4: Local Fallback Mock Store API** (6 tests): Generator dataset 200 pelanggan Sunda & QR unik, generator 2.140 transaksi historis 6 bulan, logika failover otomatis zero-credential, perhitungan kuintil RFM 7 segmen, deduplikasi pesanan idempotensi, dan kenaikan tier Tamu -> Sahabat -> Keluarga.
- [x] **F5: Full 105 Menu Items Catalog & Variants** (6 tests): Enumerasi tepat 105 menu unik dari `MENU-REGULER.pdf`, 16 kategori fisik, harga varian ukuran Medium & Large pada 9 minuman, suhu Panas & Dingin pada minuman dual-temp dan hot-only, serta label menu (Rekomendasi, Favorit, Pedas, Untuk Anak).
- [x] **F6: WhatsApp OTP Console Mode & Auto-Fill** (6 tests): Pembangkitan OTP 6-angka acak, format banner konsol resmi dengan sapaan Sunda *Sampurasun!*, format respons demo toast `{ success: true, demoOtp: "..." }`, verifikasi kode cocok, kedaluwarsa 10 menit, dan sifat single-use OTP.
- [x] **F7: Demo Credentials Accessibility** (6 tests): Autentikasi Admin `putriayusagita02@gmail.com` / `BumiUpiAdmin2026!`, Kasir `kasir@bumiupi.id` / `kasir2026`, Customer `customer@bumiupi.id` / `081234567890`, proteksi RBAC, saldo awal Dimas Kurniawan (142 poin), dan payload quick role switcher.

### Boundary & Corner Cases (Tier 2):
- [x] **B1**: Keranjang belanja kosong, kuantitas negatif, kuantitas desimal, item harga promo/nol, kuantitas masif melebihi stok, penanganan payload tanpa items.
- [x] **B2**: Normalisasi nomor HP Indonesia (`+628`, `08`, `628`), penolakan huruf/simbol, panjang nomor (<9 atau >15 digit), sanitasi spasi, sanitasi injeksi, penolakan nomor telepon rumah/internasional.
- [x] **B3**: Penolakan OTP huruf, panjang OTP bukan 6 angka, OTP null/kosong, batas penguncian 5x gagal uji (*brute force threshold*), pembersihan spasi, pengujian nomor tanpa OTP.
- [x] **B4**: Penolakan item habis (stok 0), transaksi tepat menghabiskan sisa stok, penolakan melebihi 1 unit, proteksi stok non-negatif, item tanpa pelacakan stok (*untracked*), pembatalan multi-item pesanan secara atomic jika stok tidak mencukupi.
- [x] **B5**: Validasi tepat batas minimum belanja voucher (Rp 49.999 ditolak vs Rp 50.000 diterima), pembatasan diskon persen (*capping*), penolakan voucher kedaluwarsa, penolakan voucher sudah terpakai, pembatasan diskon maksimal senilai subtotal.
- [x] **B6**: Penolakan harga negatif, pembulatan poin ke bawah (1 poin per Rp 10.000), transaksi sub-sepuluh-ribu = 0 poin, transaksi masif Rp 100 juta = 10.000 poin tanpa overflow, sanitasi nomor meja berkarakter Unicode/simbol, presisi perkalian harga.
- [x] **B7**: Validasi idempotency_key wajib, penanganan respons cached tanpa pemotongan stok ganda atau penambahan poin ganda, format UUID, penanganan race condition submission beruntun, pencatatan log audit staf kasir.

### Cross-Feature Interactions (Tier 3):
- [x] **Chain 1**: OTP Login -> Profil -> Seleksi Varian Menu (M/L & Suhu) -> Aplikasi Voucher -> Rekam Pesanan Atomic -> Pengurangan Stok -> Mutasi Poin & Ledger.
- [x] **Chain 2**: Kasir POS Scan QR Pelanggan -> Deteksi Tier & Saldo Poin -> Pesanan Cepat -> Pembayaran Kasir -> Format Struk WIB -> Payload Bot Telegram `@BumiUpiBot`.
- [x] **Chain 3**: Alokasi Meja Dine-in -> Transisi Status Kitchen Display System (`confirmed` -> `preparing` -> `ready` -> `completed`) -> Audit Trail Staf Dapur & Pelayan.
- [x] **Chain 4**: Akumulasi Poin Pelanggan Melewati Ambang 100 & 300 Poin -> Kenaikan Tier Otomatis ke Sahabat dan Keluarga.
- [x] **Chain 5**: Peningkatan Frekuensi Transaksi -> Rekalkulasi Skor Kuintil RFM -> Migrasi Segmen Otomatis dari `Baru` ke `Champions`.
- [x] **Chain 6**: Pemesanan Konkuren Multi-Pengguna pada Stok Terbatas -> Pemotongan Stok Atomic Mencegah Penjualan Berlebih (*zero overselling*).

### Real-World Scenarios (Tier 4):
- [x] **Scenario 1**: Pemesanan Dine-in Meja 04 oleh pelanggan terverifikasi WhatsApp OTP dengan 3 menu kombinasi varian (Nasi Goreng Upiwati, Kopi Hitam L Panas, Roti Bakar Telur Keju).
- [x] **Scenario 2**: Transaksi POS kasir cepat dengan diskon voucher 20% capped dan pencatatan staf kasir.
- [x] **Scenario 3**: Kunjungan ulang tahun pelanggan Dimas Kurniawan (Tier Sahabat) menukarkan voucher ulang tahun Rp 30.000 dan akumulasi poin.
- [x] **Scenario 4**: Siklus pesanan dapur tradisional Garut melalui live Kitchen Display System (KDS) dan pelayan meja.
- [x] **Scenario 5**: Skenario evaluasi sistem luring (*offline demo mode*) menggunakan seluruh fungsionalitas repository lokal in-memory tanpa ketergantungan kredensial luar.

---

## 4. Bukti Hasil Eksekusi Aktual

```
======================================================================
🌿 BUMI UPI — DUAL TRACK E2E TEST RUNNER (TIERS 1 - 4)
======================================================================
Directory : C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi
Node.js   : v26.13.0
Target    : All Tiers (1 to 4)
----------------------------------------------------------------------

⏳ Running Tier 1 — Feature Coverage (Isolation Testing)... PASSED (42/42 tests in 432ms)
⏳ Running Tier 2 — Boundary & Corner Cases... PASSED (42/42 tests in 3270ms)
⏳ Running Tier 3 — Cross-Feature Interactions... PASSED (6/6 tests in 5423ms)
⏳ Running Tier 4 — Real-World Application Scenarios... PASSED (5/5 tests in 398ms)

======================================================================
📊 TEST EXECUTION SUMMARY REPORT
======================================================================
| Tier | Tier Description                       | Passed | Failed | Total | Status | Time   |
|------|----------------------------------------|--------|--------|-------|--------|--------|
| T1   | Tier 1 — Feature Coverage (Isolation T |     42 |      0 |    42 | PASS   | 432ms  |
| T2   | Tier 2 — Boundary & Corner Cases       |     42 |      0 |    42 | PASS   | 3270ms |
| T3   | Tier 3 — Cross-Feature Interactions    |      6 |      0 |     6 | PASS   | 5423ms |
| T4   | Tier 4 — Real-World Application Scenar |      5 |      0 |     5 | PASS   | 398ms  |
----------------------------------------------------------------------
Total Test Cases Executed : 95
Total Passed              : 95
Total Failed              : 0
Success Rate              : 100.0%
======================================================================
```

---

## 5. Panduan untuk Sub-Orchestrator & Agen Milestone

Setiap agen yang menyelesaikan milestone (M1, M2, M3, M4) dapat memverifikasi bahwa perubahan mereka tidak merusak kontrak antarmuka atau aturan bisnis dengan menjalankan:
```bash
node tests/e2e/run_tests.js
```
Jika seluruh pengujian lulus dengan kode keluar 0, milestone dinyatakan aman untuk dilanjutkan ke fase berikutnya.
