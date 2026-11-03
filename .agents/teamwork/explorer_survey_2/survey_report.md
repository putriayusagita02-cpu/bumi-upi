# Laporan Survei Komprehensif Workspace & Kesiapan Monorepo PNPM
**Proyek**: Rumah Tamah Bumi Upi (Garut) — Sistem CRM & Loyalitas Pelanggan  
**Lokasi Direktori**: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi`  
**Waktu Survei**: 2026-11-01 (WIB / Asia/Jakarta)  
**Penyusun**: `explorer_survey_2`

---

## 1. Ringkasan Eksekutif

Pemeriksaan menyeluruh terhadap workspace `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi` telah selesai. Saat ini repositori berbentuk **single-repo Next.js monolitik** yang juga memuat runner independen (`server.js`, `server.py`) dan sebuah SPA statis di direktori `public/` (174 KB `app.js`).

Tujuan arsitektur target adalah **Monorepo PNPM Workspaces** yang memisahkan aplikasi ke dalam:
1. `apps/web`: Portal Pelanggan (PWA, Member Card, QR, Poin & Tier, Klaim Voucher, Reservasi, Upi Chat AI, Katalog 105 Menu).
2. `apps/admin`: Portal Admin & Kasir (POS Kasir Cepat atomic, Dashboard Analitik RFM Kuintil & CLV, Simulasi Broadcast WhatsApp/Telegram, Manajemen Reservasi & Audit Log).
3. `packages/ui`: Shared UI Design System ("Rumah Nenek Sunda": Hijau Olive `#3E4F30`, Krem Kertas `#F5EEDC`, Terakota `#B4532A`, Mustard `#D4A24C`, font Fraunces/Jakarta Sans/Caveat, tombol, badge, modal, toast helper).
4. `packages/db`: Shared Database Client (Supabase PostgreSQL migrations, skema TypeScript, dataset simulasi realistis 200 pelanggan & 2.140 transaksi, seed 105 menu lengkap, serta fallback mock in-memory API).

Dokumen ini memetakan kondisi eksisting, kesiapan lingkungan runtime, temuan katalog menu 105 item dari `MENU-REGULER.pdf`, serta panduan refaktor langkah-demi-langkah bagi agen implementasi.

---

## 2. Analisis Lingkungan Build & Toolchain

| Komponen | Status Eksisting | Path Eksekusi / Detail | Tindakan untuk Implementasi |
| :--- | :--- | :--- | :--- |
| **Node.js** | **v26.13.0** | `C:\Program Files\nodejs\node.exe` | Siap digunakan langsung. Runtime modern mendukung ESM, fetch bawaan, dan fitur terbaru. |
| **npm** | **11.20.0** | `C:\Program Files\nodejs\npm.cmd` | Berfungsi normal melalui command `.cmd`. |
| **pnpm** | **Belum terpasang secara global** | Belum ada di `$env:APPDATA\npm\pnpm.cmd` | Agen implementasi dapat langsung memasangnya via: `& "C:\Program Files\nodejs\npm.cmd" install -g pnpm`. Prefix global `C:\Users\Asus\AppData\Roaming\npm` sudah ada di PATH dan memiliki hak tulis user. |
| **PowerShell ExecutionPolicy** | **Restricted secara default** | PowerShell memblokir `.ps1` bawaan | Gunakan `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` pada awal sesi PowerShell, atau selalu panggil file batch `.cmd` (`pnpm.cmd`, `npm.cmd`). |
| **Git** | **Tidak terpasang di PATH** | - | Pengelolaan kode dilakukan langsung pada struktur folder lokal tanpa ketergantungan git commit. |
| **Python** | **Stub WindowsApps** | Tidak aktif | Seluruh build & server dijalankan berbasis Node.js / Next.js / PNPM. |

---

## 3. Inventarisasi Berkas & Struktur Workspace Eksisting

```
C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\
├── .agents/                    # Metadata koordinasi agen teamwork
├── .env                        # Variabel lingkungan lokal demo (Supabase, Telegram, Gemini)
├── .env.example                # Panduan konfigurasi env
├── README.md                   # Dokumentasi studi kasus CRM & kredensial demo
├── docs/                       # Dokumentasi arsitektur & akademik
│   ├── CUSTOMER_JOURNEY_MAP.md # Journey tamu & loyalitas
│   ├── DEMO_SCRIPT.md          # Skenario pengujian presentasi
│   ├── ERD.md                  # Entity Relationship Diagram
│   ├── FLOWCHARTS.md           # Diagram alur transaksi & RFM
│   ├── USER_TESTING_QUESTIONNAIRE.md
│   └── USE_CASES.md            # Skenario use-case sistem
├── next.config.js              # Konfigurasi Next.js 14
├── package.json                # Single root package (Next 14.2.15, React 18.3.1, Supabase 2.45)
├── postcss.config.js           # Konfigurasi PostCSS
├── tailwind.config.js          # Palet warna otentik Bumi Upi & custom typography
├── tsconfig.json               # Konfigurasi TypeScript bundler
├── run_server.bat              # Script runner Windows
├── server.js                   # Node.js zero-dependency http server (serving /public)
├── server.py                   # Python fallback runner
├── public/                     # Aset statis & SPA monolitik
│   ├── brand/
│   │   ├── Logo_bumi_upi.svg   # Logo resmi Rumah Tamah Bumi Upi Garut
│   │   ├── illustrations.svg   # Ilustrasi krepyak & ornamen Sunda
│   │   └── tegel-pattern.svg   # Motif tegel Kunci Garut tempo doeloe
│   ├── app.js                  # Frontend SPA monolitik (174 KB)
│   ├── index.html              # Template HTML pelanggan & kasir
│   ├── manifest.json           # Konfigurasi PWA
│   └── sw.js                   # Service Worker offline cache
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/chat/route.ts        # Endpoint Upi Chat AI
│   │   │   └── telegram/webhook/route.ts# Endpoint Webhook Telegram Bot
│   │   ├── globals.css         # Styling global Tailwind
│   │   ├── layout.tsx          # Root Layout Next.js
│   │   └── page.tsx            # Halaman pengarah (redirects ke /index.html)
│   └── lib/
│       ├── ai.ts               # Knowledge base lokal Upi Chat & multi-provider AI
│       ├── mockData.ts         # Dataset 200 pelanggan, 2.140 tx, RFM generator (32 KB)
│       ├── rfm.ts              # Analisis RFM kuintil & 7 segmen
│       ├── supabase.ts         # Supabase client + in-memory store state fallback
│       └── telegram.ts         # Bot Telegram, sapaan Sunda, format WIB
└── supabase/
    └── migrations/
        ├── 20261031000001_initial_schema.sql    # 19 tabel relasional & custom ENUMs
        ├── 20261031000002_atomic_functions.sql # record_transaction, locking kupon, RFM recalc
        ├── 20261031000003_rls_policies.sql     # Row Level Security lengkap
        └── 20261031000004_seed_data.sql        # Data awal (hanya memuat 18 menu lama)
```

---

## 4. Penemuan & Transkripsi Lengkap 105 Menu dari `MENU-REGULER.pdf`

Berkas PDF asli berhasil ditemukan di:  
`C:\Users\Asus\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\2D018F2FC604EE0E17A2CBF350B0532EA22815F2\transfers\2026-44\e95949cc-0357-4daf-939b-eabaa606b5eb_MENU-REGULER.pdf`

Total teridentifikasi **tepat 105 item menu** dalam **16 kategori otentik** untuk di-seed ke `packages/db`:

### Kategori 1: CEMILAN CEPULUH (18 Item)
1. **Sate Aci** — Rp 14.000 (*Sate Vegetarian jadul pake bumbu kacang*)
2. **Tahu Ciraweaw** — Rp 15.000 (*Camilan berbahan tahu aci dan cabe rawit karena Garut adalah kota aci*)
3. **Bakso Yang Ditukar** — Rp 20.000 (*Bakso yang ditusuk terus dibakar, bukan ditarik tara mah*)
4. **Dimsum Ekonomis** — Rp 15.000 (*Dimsum ayam isi 6*)
5. **Dimsum Sejahtera** — Rp 20.000 (*Dimsum udang isi 6*)
6. **Pisang Kukus** — Rp 17.000 (*Pisang tanduk yang dikukus, panas-panas dikasih cocolan gula palem*)
7. **Pisang Goreng** — Rp 20.000 (*Pisang goreng SNI yang dikasih taburan gula palem*)
8. **Singkong Goreng** — Rp 20.000 (*Singkong goreng kering renyah bikin nostalgia*)
9. **Kentang Sosis** — Rp 22.000 (*Sosis dan kentang yang digoreng*)
10. **Ulen Upi** — Rp 22.000 (*Ketan goreng saus oncom, saudaranya tape uli kalo di Betawi*)
11. **Ketan Kinca** — Rp 24.500 (*Nasi ketan dengan kelapa, lebih enak dibalur kinca/gula aren cair*)
12. **Gorengan Darmaji** — Rp 17.000 (*Literally makan lima gorengan bayarnya satu porsi aja*)
13. **Cireng Ayah Ojak** — Rp 17.000 (*Cireng dengan bumbu uyah yang gurih dan rujak jadi satu*)
14. **Tahu Cabe Rewel** — Rp 22.000 (*Tahu yang digoreng dan dibumbui cabe garam biar well*)
15. **Cireng Tahu Gejrot** — Rp 18.000 (*Kerjasama antara tahu dan cireng dibanjur kuah tahu gejrot. Gitu we enak!*)
16. **Pagordas** — Rp 20.000 (*Pangsit goreng mini, digolokeun jeung chili oil pedas gurih pereda janghad*)
17. **Lumpia Vietnam** — Rp 22.000 (*Lumpia sayuran buat yang lagi diet cenah*)
18. **Tuangeun Bocil** — Rp 25.000 (*Makanan anak-anak dengan isian nugget, sosis, sop, dan kentang/es coklat*)

### Kategori 2: BER PEPES AN (4 Item)
19. **Pepes Goreng Ayam Bule** — Rp 39.000 (*More or less pepesnya digoreng lagi*)
20. **Pepes Ayam Bule** — Rp 39.000 (*Which is ayam negeri yang dipepes*)
21. **Pepes Ayam Kampung** — Rp 48.000 (*Literally ayam kampung yang dipepes*)
22. **Pepes Goreng Ayam Kampung** — Rp 48.000 (*Setelah dipepes and then digoreng*)

### Kategori 3: EMIH - EMIHAN (6 Item)
23. **Mie Kasep** — Rp 24.000 (*Kasep atuh kalau disebut mie goreng wae*)
24. **Mie Racing** — Rp 25.000 (*Mie kuah yang rasanya gurih dan krimnya balapan di lidah*)
25. **Mie Ebroh** — Rp 25.000 (*Mie goreng bumbu sambal uleg pedas nendang pake telor ceplok*)
26. **Mie Chili Oil** — Rp 24.000 (*Mie pedas bumbu Chili Oil gurih, pake bakso pangsit goreng*)
27. **Mie Anak Sekolah** — Rp 27.000 (*Mie goreng bukan mie instant, tanpa MSG buat bocil*)
28. **Bihun Kuah** — Rp 29.000 (*Bihun berkuah bening, pas untuk cuaca Garut yang dingin*)

### Kategori 4: PEMADAM KELAPARAN (7 Item)
29. **Nasi Goreng Upiwan** — Rp 25.000 (*Nasi goreng kecap SNI*)
30. **Nasi Goreng Upiwati** — Rp 26.000 (*Versi betina dari nasgor upiwan, saus merah Ujung Pandang*)
31. **Nasi Goreng Cumi Upi** — Rp 28.000 (*Nasgor asin cumi dengan cabe hejo sedap pedas*)
32. **Nasi Goreng Eunda Kornet** — Rp 27.000 (*Nasi goreng citarasa kornet gurih*)
33. **Nasi Goreng Peda Kemangi** — Rp 27.000 (*Nasi goreng rasa kampung selera metropolitan*)
34. **Nasi Goreng Omah** — Rp 25.000 (*Nasi goreng daun rasa kunyit buatan omah*)
35. **Nasi Goreng Kecombrang** — Rp 24.000 (*Nasi goreng aroma kecombrang sedap*)

### Kategori 5: TUNTUTAN MASYARAKAT (8 Item)
36. **Nasi Galo Bumi Upi** — Rp 39.000 (*Sejenis nasi rawit meriah, beef, sambal bawang; diaduk/galo*)
37. **Nasi Paru Serundeng** — Rp 25.000 (*Nasi pake paru goreng, serundeng, lalapan, sambal*)
38. **Nasi Dangduan** — Rp 36.000 (*Nasi semeriah dangdutan: kulit, paru, telur dadar crispy, serundeng*)
39. **Nasi Buntut Rewel** — Rp 45.000 (*Nasi buntut sapi ditumis pedas well*)
40. **Nasi Buntut Kebakaran** — Rp 40.000 (*Nasi buntut bakar dan sop sayuran kasta tinggi*)
41. **Nasi Ghewlaa** — Rp 29.000 (*Nasi gila toping sosis, bakso, sayur*)
42. **Lidah Sambel Hejo** — Rp 47.000 (*Lidah sapi tidak bertulang balut sambel hejo*)
43. **Buntut Goreng Sambal Hejo** — Rp 45.000 (*Buntut sapi goreng gurih balut sambel hejo*)

### Kategori 6: SUMBER PROTEIN (5 Item)
44. **Nasi Ayam Ajep-Ajep** — Rp 24.000 (*Nasi chicken katsu gaya Sunda*)
45. **Nasi Ayam Omongan Tetangga** — Rp 24.000 (*Nasi ayam minyak cabe super pedas*)
46. **Nasi Ayam Kalasan** — Rp 32.000 (*Nasi ayam goreng manis, lalapan, sambal*)
47. **Nasi Kulit Serundeng** — Rp 22.000 (*Nasi kulit goreng renyah serundeng*)
48. **Bebek Sambel Hejo** — Rp 45.000 (*Bebek goreng empuk plus sambel hejo*)

### Kategori 7: MINUM - MINUMAN: SEGER ADEM (9 Item)
49. **Es Cincau Jadoel** — M: Rp 19.000 / L: Rp 24.000
50. **Es Limun** — Rp 20.000
51. **Es Soda Gembira** — Rp 20.000
52. **Es Cincau Hijau** — Rp 20.000
53. **Es Jeruk** — Rp 18.000
54. **Es Kelapa Muda** — Rp 10.000
55. **Es Kelapa Jeruk** — Rp 12.000
56. **Es Kelapa Nangka** — Rp 18.000
57. **Es Cendol** — Rp 18.000

### Kategori 8: ES ESAN (3 Item)
58. **Es Krim Bumi Upi** — Rp 22.000
59. **Es ABC** — Rp 28.000
60. **Es Teller** — Rp 30.000

### Kategori 9: TEH & SUSU (10 Item)
61. **Teh Tawar Jumbo** — Rp 18.000
62. **Teh Manis Jumbo** — Rp 22.000
63. **Teh Manis** — Rp 13.000
64. **Teh Lemon** — M: Rp 16.000 / L: Rp 17.000
65. **Teh Sereh** — Rp 17.000
66. **Es Cokelat Malt Dinosaurus** — M: Rp 20.000 / L: Rp 25.000
67. **Cokelat Malt Panas** — Rp 20.000
68. **Es Goyobod Alun-Alun** — Rp 18.000
69. **Teh Susu Tolak Angin** — M: Rp 20.000 / L: Rp 25.000
70. **Teh Tarik** — M: Rp 20.000 / L: Rp 25.000

### Kategori 10: JEJAMUAN (3 Item)
71. **Es Beras Kencur** — Rp 18.000
72. **Es Kunyit Asem** — Rp 18.000
73. **Es Beras Kencur Jeruk** — Rp 20.000

### Kategori 11: KOPI (6 Item)
74. **Kopi Hitam** — M: Rp 17.000 / L: Rp 20.000
75. **Kopi Susu** — M: Rp 19.000 / L: Rp 22.000
76. **Kopi Susu Butter** — Rp 22.000
77. **Kopi Susu Santan** — M: Rp 23.000 / L: Rp 27.000
78. **Kopi Susu Kecap** — M: Rp 23.000 / L: Rp 27.000
79. **Kopi Krim Soda** — Rp 25.000

### Kategori 12: JUS 4 U (8 Item)
80. **Jus Tomat** — Rp 17.000
81. **Jus Sirsak** — Rp 18.000
82. **Jus Semangka** — Rp 20.000
83. **Jus Mangga** — Rp 25.000
84. **Jus Alpukat** — Rp 25.000
85. **Jus Tape** — Rp 20.000
86. **Jus Stroberi** — Rp 24.000
87. **Jus Jambu** — Rp 20.000

### Kategori 13: ROTI-ROTIAN: SATU RASA CUKUP (6 Item)
88. **Roti Bakar Cokelat** — Rp 18.000
89. **Roti Bakar Keju** — Rp 20.000
90. **Roti Bakar Gula Klasik** — Rp 15.000
91. **Roti Bakar Nanas** — Rp 18.000
92. **Roti Bakar Srikaya** — Rp 18.000
93. **Burger Gulai Upi** — Rp 30.000

### Kategori 14: ROTI BAKAR GURIH (6 Item)
94. **Roti Bakar Telur** — Rp 20.000
95. **Roti Bakar Telur Keju** — Rp 23.000
96. **Roti Bakar Kornet** — Rp 20.000
97. **Roti Bakar Kornet Telur Keju** — Rp 26.000
98. **Roti Bakar Kornet Telur** — Rp 24.000
99. **Roti Bakar Kornet Keju** — Rp 24.000

### Kategori 15: DUA LEBIH SPESIAL (2 Item)
100. **Roti Bakar 2 Rasa** — Rp 21.000
101. **Roti Bakar Mocca Nougat** — Rp 21.000

### Kategori 16: PISANG BAKAR (4 Item)
102. **Pisang Bakar Cokelat** — Rp 20.000
103. **Pisang Bakar Keju** — Rp 21.000
104. **Pisang Bakar Cokelat Keju** — Rp 23.000
105. **Pisang Bakar Double Cokelat** — Rp 23.000

**Jumlah Total: 18 + 4 + 6 + 7 + 8 + 5 + 9 + 3 + 10 + 3 + 6 + 8 + 6 + 6 + 2 + 4 = 105 Item.**

---

## 5. Rencana Arsitektur & Transisi ke Monorepo PNPM

### 5.1 Struktur Target Monorepo
```
bumi-upi/
├── pnpm-workspace.yaml
├── package.json (root workspace)
├── apps/
│   ├── web/                     # Customer PWA Next.js 14
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.js
│   │   ├── public/              # Icons, manifest.json, brand assets
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/      # Login OTP WhatsApp Demo & Register
│   │       │   ├── member/      # Kartu digital, QR, riwayat poin
│   │       │   ├── menu/        # Katalog 105 menu interaktif
│   │       │   ├── vouchers/    # Klaim & daftar voucher
│   │       │   ├── reservation/ # Form reservasi meja bale/teras
│   │       │   ├── chat/        # Asisten Upi Chat AI
│   │       │   ├── feedback/    # Ulasan & rating rasa/suasana
│   │       │   ├── layout.tsx
│   │       │   └── page.tsx     # Landing page Rumah Tamah
│   │       └── lib/
│   └── admin/                   # POS Kasir & Dashboard Owner Next.js 14
│       ├── package.json
│       ├── next.config.js
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       └── src/
│           ├── app/
│           │   ├── (auth)/login # Login admin putriayusagita02@gmail.com / kasir
│           │   ├── pos/         # Kasir cepat, scan QR, atomic transaction
│           │   ├── rfm/         # Analitik 7 Segmen Kuintil & CLV Matrix
│           │   ├── campaigns/   # Simulasi broadcast WA/Telegram & voucher
│           │   ├── reservations/# Kalender & konfirmasi kedatangan meja
│           │   ├── feedback/    # Analitik sentimen ulasan pengunjung
│           │   ├── audit/       # Buku besar poin & compliance audit log
│           │   ├── layout.tsx
│           │   └── page.tsx     # Overview dashboard metrics
│           └── lib/
└── packages/
    ├── ui/                      # Shared Component Library
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── components/      # Button, Card, Badge, Modal, Toast Helper, Tabs
    │       ├── tokens/          # Warna otentik, tipografi, radius vintage
    │       └── index.ts
    └── db/                      # Shared Data, Mock Store & Client
        ├── package.json
        ├── tsconfig.json
        ├── src/
        │   ├── client.ts        # Supabase client initializer
        │   ├── mockStore.ts     # In-memory reactive state (200 cust, 2.140 tx)
        │   ├── menuCatalog.ts   # 105 Item Menu Seed data
        │   ├── rfmEngine.ts     # Perhitungan RFM kuintil & CLV
        │   ├── types.ts         # TypeScript interfaces (Profile, MenuItem, dll)
        │   └── index.ts
        └── migrations/          # PostgreSQL Supabase migrations (01 - 04)
```

### 5.2 Rincian Fitur Mandatoris Per Keputusan User

1. **WhatsApp OTP Mode Console**:
   - Helper fungsi pengirim OTP menghasilkan kode 6-digit acak.
   - Dicetak ke server terminal (`console.log('[WHATSAPP OTP] Kode verifikasi untuk 628...: 481920')`).
   - Dilengkapi **Toast Notification Demo** di UI ("*Demo Mode: Kode OTP Anda adalah 481920*") sehingga penguji dapat melakukan input instan tanpa menunggu SMS/chat asli.

2. **Kredensial Demo Sesuai Kesepakatan**:
   - **Admin / Owner**: `putriayusagita02@gmail.com` | `BumiUpiAdmin2026!`
   - **Kasir (POS)**: `kasir@bumiupi.id` | `kasir2026`
   - **Pelanggan (Customer)**: `customer@bumiupi.id` / `081223344550` | `tamu2026`

3. **Fallback In-Memory State**:
   - Tidak ada kendala credential Supabase: Jika kredensial demo dipakai, sistem otomatis beralih ke state reaktif di memori lokal Next.js yang mendukung simulasi transaksi atomic kasir, mutasi poin, klaim kupon, dan perubahan status reservasi secara real-time.

---

## 6. Rekomendasi Urutan Eksekusi Agen Builder

1. **Persiapan PNPM & Workspace**:
   - Jalankan `& "C:\Program Files\nodejs\npm.cmd" install -g pnpm`.
   - Buat `pnpm-workspace.yaml` di root bumi-upi.
   - Buat struktur direktori `apps/web`, `apps/admin`, `packages/ui`, `packages/db`.
2. **Setup `packages/db`**:
   - Pindahkan dan rapikan `types.ts`, `rfmEngine.ts`, serta `mockStore.ts`.
   - Tambahkan dataset lengkap 105 menu item di `menuCatalog.ts`.
   - Update migrasi `20261031000004_seed_data.sql` agar menyertakan seluruh 105 menu item.
3. **Setup `packages/ui`**:
   - Ekstrak komponen antarmuka bersama (Badge Tier, Tombol Aksi Terakota, Card Kertas Krem, Toast OTP/Notification).
4. **Implementasi `apps/web` (Portal Pelanggan)**:
   - Bangun antarmuka Next.js App Router dengan fitur kartu member, scan QR, katalog 105 menu berfilter kategori, klaim voucher, form reservasi, dan widget Upi Chat.
5. **Implementasi `apps/admin` (POS & Dashboard)**:
   - Bangun antarmuka POS kasir cepat untuk pencatatan transaksi atomic, visualisasi RFM kuintil, simulasi broadcast kampanye, dan manajemen reservasi.
6. **Validasi & Verifikasi Akhir**:
   - Jalankan `pnpm build` untuk semua target workspace guna memastikan zero error pada TypeScript dan bundler Next.js.
