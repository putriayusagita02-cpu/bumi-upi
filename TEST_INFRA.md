# Test Infrastructure: Rumah Tamah Bumi Upi Monorepo E2E Harness

Dokumentasi infrastruktur pengujian End-to-End (E2E) untuk ekosistem CRM & Ordering Monorepo Rumah Tamah Bumi Upi, Garut, Jawa Barat.

---

## 1. Arsitektur Test Harness & Runtime

Test harness dirancang berbasis **Node.js Test Runner bawaan (`node:test` & `node:assert/strict`)** yang didukung secara native pada Node.js v26.13.0 tanpa ketergantungan paket eksternal (*zero-dependency*). Desain ini menjamin eksekusi pengujian instan, deterministik, dan dapat dijalankan di seluruh lingkungan tanpa blokir instalasi npm/pnpm jaringan.

### Fitur Utama Runner:
1. **Runner Terpadu (`tests/e2e/run_tests.js`)**:
   - Mendukung opsi eksekusi per tier (`--tier=1`, `--tier=2`, `--tier=3`, `--tier=4`, `--tier=all`).
   - Melakukan agregasi metrik pengujian (pass count, fail count, total duration, ANSI report table).
   - Menghasilkan return code standard (`0` saat 100% lulus, `1` saat ada kegagalan).
2. **Kompatibilitas Native Node Test**:
   - Setiap berkas uji di `tests/e2e/tiers/` dapat dieksekusi langsung via `node --test <path>`.
3. **Penyedia Data Otoritatif (Data Oracle)**:
   - Modul `tests/e2e/helpers/oracle_data.js` memuat transkripsi lengkap 105 menu item, 16 kategori, aturan varian M/L dan Panas/Dingin dari `MENU-REGULER.pdf`, token desain resmi, dan kredensial demo.
4. **Reference Store Engine (`tests/e2e/helpers/test_env.js`)**:
   - Mensimulasikan logika atomic order placement, verifikasi single-use voucher, pelacakan stok inventaris, perhitungan poin loyalitas, mutasi tier, dan simulasi WhatsApp OTP console mode.

---

## 2. Struktur Direktori Pengujian

```
tests/e2e/
├── package.json                   # Konfigurasi npm scripts untuk test suite
├── run_tests.js                   # Unified executable runner & aggregator
├── helpers/
│   ├── oracle_data.js             # Data otoritatif 105 menu, 16 kategori, token, users
│   └── test_env.js                # Environment paths & ReferenceStoreEngine
└── tiers/
    ├── tier1_features.test.js     # Tier 1: Feature Coverage (42 tests, F1-F7)
    ├── tier2_boundaries.test.js   # Tier 2: Boundary & Corner Cases (42 tests, B1-B7)
    ├── tier3_interactions.test.js # Tier 3: Cross-Feature Interactions (6 chains)
    └── tier4_application.test.js  # Tier 4: Real-World Scenarios (5 scenarios)
```

---

## 3. Metodologi Pengujian 4-Tier

### Tier 1 — Feature Coverage (Pengujian Fitur Terisolasi)
Mencakup **42 kasus uji** (minimal 6 per fitur, melampaui syarat >=5):
- **F1: PNPM Monorepo Layout & Package Manifests** (6 tests):
  - Validitas `pnpm-workspace.yaml`, workspaces patterns (`apps/*`, `packages/*`).
  - Skrip `build`, `dev`, `test`, `lint`, `typecheck` di root `package.json`.
  - Manifest `@bumi-upi/ui` (name, exports, peerDependencies).
  - Manifest `@bumi-upi/db` (name, main, scripts).
  - Topologi struktur folder dan standard namespace `@bumi-upi/`.
- **F2: Shared UI Tokens & Components** (6 tests):
  - Token palet warna resmi: Hijau Olive (`#3E4F30`), Krem Kertas (`#F5EEDC`), Terakota (`#B4532A`), Mustard (`#D4A24C`).
  - Token tipografi: Fraunces, Caveat, Plus Jakarta Sans.
  - Komponen `Button.tsx` dengan varian primary olive & secondary terakota.
  - Token/komponen `Badge` untuk tier Tamu, Sahabat, dan Keluarga.
  - Spesifikasi/komponen `OtpToastHelper` untuk interaksi auto-fill OTP.
  - Spesifikasi/komponen `MemberCard` kartu digital pelanggan.
- **F3: Supabase Postgres Migrations DDL Validity** (6 tests):
  - Kelengkapan berkas migrasi SQL berawalan timestamp.
  - Definisi tabel relasional inti (`profiles`, `menu_categories`/`categories`, `menu_items`/`products`, `transactions`/`orders`, `vouchers`, `points_ledger`).
  - Tipe ENUM domain (`user_role`, `tier_level`, `rfm_segment_type`).
  - Fungsi atomic procedure dengan pengecekan `idempotency_key` dan row locking `FOR UPDATE`.
  - Kebijakan Row Level Security (RLS) pada tabel profil dan transaksi.
  - Integritas aturan poin (`points_balance >= 0`, `points_ledger`).
- **F4: Local Fallback Mock Store API** (6 tests):
  - Generator 200 profil pelanggan dengan nama realistis Sunda dan QR code unik.
  - Generator 2.140 transaksi historis 6 bulan (Mei - Oktober 2026).
  - Logika deteksi otomatis zero-credential fallback ke in-memory store.
  - Klasifikasi RFM kuintil (skor 1-5) ke 7 segmen pelanggan resmi.
  - Deduplikasi pesanan berdasarkan idempotency key.
  - Kenaikan tier membership: Tamu -> Sahabat (>=100 poin) -> Keluarga (>=300 poin).
- **F5: Full 105 Menu Items Catalog & Variants** (6 tests):
  - Keutuhan 105 menu unik dari `MENU-REGULER.pdf`.
  - Distribusi tepat di 16 kategori buku menu fisik.
  - Aturan harga varian ukuran (Medium / Large) pada 9 minuman spesifik.
  - Aturan suhu Panas / Dingin pada minuman dual-suhu dan minuman panas saja.
  - Penandaan label menu (Rekomendasi, Favorit, Pedas, Untuk Anak).
  - Integritas nominal harga satuan dalam integer Rupiah.
- **F6: WhatsApp OTP Console Mode & Auto-Fill** (6 tests):
  - Pembangkitan OTP numerik 6-digit aman (100000 - 999999).
  - Format cetakan banner konsol WhatsApp dengan sapaan Sunda (*Sampurasun!*).
  - Format respons payload API demo mode `{ success: true, demoOtp: "..." }`.
  - Verifikasi pencocokan kode OTP dan aktivasi status verifikasi.
  - Penolakan kode OTP kedaluwarsa (>10 menit).
  - Sifat single-use OTP (kode tidak dapat dipakai ulang).
- **F7: Demo Credentials Accessibility** (6 tests):
  - Autentikasi Admin `putriayusagita02@gmail.com` / `BumiUpiAdmin2026!` (role: admin).
  - Autentikasi Kasir `kasir@bumiupi.id` / `kasir2026` (role: kasir).
  - Autentikasi Customer `customer@bumiupi.id` (`081234567890`) / `tamu2026` (role: customer).
  - Proteksi otorisasi berbasis peran (Role-Based Access Control).
  - Saldo awal pelanggan demo Dimas Kurniawan (Tier Sahabat, 142 poin).
  - Payload switcher peran instan tanpa panggilan jaringan eksternal.

---

### Tier 2 — Boundary & Corner Cases (Pengujian Batas & Kondisi Ekstrem)
Mencakup **42 kasus uji** (6 per kategori):
- **B1: Cart & Checkout Boundaries** (6 tests): Keranjang kosong, kuantitas negatif, kuantitas pecahan, harga nol/promo, kuantitas melebihi stok, format array kosong.
- **B2: Telephone & Contact Input Boundaries** (6 tests): Normalisasi awalan nomor (`+628`, `08`, `628`), penolakan karakter huruf/simbol, batas panjang nomor (9-15 digit), penolakan input kosong/spasi, sanitasi injeksi, penolakan nomor luar negeri/telepon rumah.
- **B3: WhatsApp OTP Verification Boundaries** (6 tests): OTP non-angka, panjang OTP bukan 6 digit (5 digit / 7 digit), OTP kosong/null, penguncian setelah 5x gagal uji coba (*rate limit / brute force guard*), pembersihan spasi (*trimming*), verifikasi nomor tanpa permintaan OTP.
- **B4: Inventory & Stock Boundaries** (6 tests): Pemesanan item habis (stok 0), pembelian tepat habis (stok sisa 0), pemesanan melebihi sisa 1 unit, proteksi stok tidak pernah negatif, item tanpa pelacakan stok (*untracked*), kegagalan pesanan multi-item secara atomic jika salah satu item habis.
- **B5: Voucher & Discount Boundaries** (6 tests): Penolakan di bawah minimum belanja (Rp 49.999 vs Rp 50.000), penerimaan tepat minimum belanja (Rp 50.000), pembatasan diskon persen (*max discount cap*), penolakan voucher kedaluwarsa, penolakan voucher yang sudah dipakai (*single-use*), pembatasan diskon maksimal senilai subtotal (total akhir tidak boleh negatif).
- **B6: Currency, Pricing & Numerical Precision** (6 tests): Penolakan harga negatif, pembulatan poin ke bawah (Rp 19.999 = 1 poin), transaksi di bawah Rp 10.000 = 0 poin, transaksi masif (Rp 100.000.000 = 10.000 poin tanpa overflow), sanitasi nomor meja berkarakter khusus/Unicode, penanganan presisi bilangan desimal.
- **B7: Idempotency Key Boundaries** (6 tests): Validasi kunci idempotensi wajib, pengembalian respons cached tanpa pengurangan stok ganda atau penggandaan poin, format kunci UUID, sensitivitas huruf kunci, proteksi pengiriman beruntun berkecepatan tinggi (*rapid duplicate race condition*), pencatatan audit log `CREATE_ORDER`.

---

### Tier 3 — Cross-Feature Interactions (Integrasi Multi-Langkah)
Mencakup **6 alur integrasi kompleks**:
- **Chain 1**: OTP Login -> Ambil Profil -> Seleksi Varian Menu (M/L & Suhu) -> Aplikasi Voucher Diskon -> Rekam Pesanan Atomic -> Pemotongan Stok -> Pencatatan Points Ledger.
- **Chain 2**: Kasir POS Scan QR Pelanggan -> Deteksi Tier & Poin -> Input Cepat Pesanan -> Pembayaran Tunai/QRIS -> Cetak Struk WIB -> Format Payload Notifikasi Telegram `@BumiUpiBot`.
- **Chain 3**: Pemesanan Makan di Tempat (Meja 12) -> Siklus Status KDS Lengkap (`confirmed` -> `preparing` -> `ready` -> `completed`) -> Pencatatan Audit Trail Perubahan Status.
- **Chain 4**: Akumulasi Transaksi Melewati Ambang 100 Poin (Sahabat) dan 300 Poin (Keluarga) -> Kenaikan Tier Otomatis Seketika.
- **Chain 5**: Peningkatan Frekuensi Transaksi Pelanggan -> Rekalkulasi Metrik RFM -> Migrasi Segmen Otomatis dari `Baru` menjadi `Champions`.
- **Chain 6**: Pemesanan Konkuren Multi-Pengguna pada Item dengan Stok Terbatas -> Pemotongan Stok Atomic Mencegah Penjualan Berlebih (*zero overselling*).

---

### Tier 4 — Real-World Application Scenarios (Skenario Operasional Nyata)
Mencakup **5 skenario aplikasi**:
- **Scenario 1**: Pemesanan Dine-in Meja 04 oleh pelanggan terverifikasi OTP WhatsApp dengan 3 menu (Nasi Goreng Upiwati, Kopi Hitam L Panas, Roti Bakar Telur Keju).
- **Scenario 2**: Transaksi kasir POS cepat dengan aplikasi voucher diskon 20% (terkena capping) dan pencatatan staf kasir.
- **Scenario 3**: Kunjungan ulang tahun pelanggan setia Dimas Kurniawan (Tier Sahabat) dengan penukaran voucher ulang tahun Rp 30.000 dan penambahan 10 poin.
- **Scenario 4**: Alur Kitchen Display System (KDS) terintegrasi dapur dan pelayan meja untuk pesanan camilan tradisional.
- **Scenario 5**: Skenario evaluasi aplikasi luring (*offline zero-credential demo run*) memanfaatkan repository in-memory fallback 100% fungsional tanpa jaringan luar.

---

## 4. Panduan Eksekusi Pengujian

### Menjalankan Seluruh Suite (Tiers 1 - 4):
```bash
cd C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi
node tests/e2e/run_tests.js
```
Atau melalui npm / pnpm:
```bash
pnpm --filter @bumi-upi/tests-e2e test
```

### Menjalankan Tier Tertentu:
```bash
# Tier 1 saja:
node tests/e2e/run_tests.js --tier=1

# Tier 2 saja:
node tests/e2e/run_tests.js --tier=2

# Tier 3 saja:
node tests/e2e/run_tests.js --tier=3

# Tier 4 saja:
node tests/e2e/run_tests.js --tier=4
```

### Menjalankan Berkas Uji Individual via Native Runner:
```bash
node --test tests/e2e/tiers/tier1_features.test.js
node --test tests/e2e/tiers/tier2_boundaries.test.js
node --test tests/e2e/tiers/tier3_interactions.test.js
node --test tests/e2e/tiers/tier4_application.test.js
```

---

## 5. Matriks Progresivitas & Kesiapan Suite

| Tier | Kategori Pengujian | Jumlah Kasus | Status Saat Ini | Milestone Terkait |
|:---:|:---|:---:|:---:|:---:|
| **T1** | Feature Coverage (F1 - F7) | 42 | **100% PASS** (42/42) | M1, M2, M3, M4 |
| **T2** | Boundary & Corner Cases (B1 - B7) | 42 | **100% PASS** (42/42) | M1, M2, M3, M4 |
| **T3** | Cross-Feature Interactions (Chains 1 - 6) | 6 | **100% PASS** (6/6) | M2, M3, M4 |
| **T4** | Real-World Application Scenarios (1 - 5) | 5 | **100% PASS** (5/5) | M3, M4 |
| **Total** | **Seluruh Kasus Uji E2E** | **95** | **100% PASS** (95/95) | **Suite Siap Pakai** |
