# HANDOFF REPORT — SURVEY 3 (SYSTEM ARCHITECTURE EXPLORER)

## 1. Observation
- **Original Task Specification**: In `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md`, lines 9-15:
  > "1. Struktur: Monorepo pnpm workspaces (apps/web, apps/admin, packages/ui, packages/db) di C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi.
  > 2. Database: Supabase Postgres migrations lengkap + fallback mock API lokal di Next.js sehingga aplikasi bisa langsung diuji coba end-to-end tanpa blokir credentials.
  > 3. WhatsApp OTP: Mode console dengan server log dan toast helper demo.
  > 4. Kredensial Demo: Admin putriayusagita02@gmail.com (BumiUpiAdmin2026!), kasir, dan customer di README.
  > 5. Katalog Menu: 105 item dari MENU-REGULER.pdf di-seed lengkap."
- **Existing Schema Analysis**: In `supabase/migrations/20261031000001_initial_schema.sql`, tables defined: `profiles`, `menu_categories`, `menu_items`, `vouchers`, `customer_vouchers`, `transactions`, `transaction_items`, `points_ledger`, `reservations`, `events`, `event_rsvps`, `customer_feedback`, `rfm_scores`, `campaigns`, `telegram_updates`, `ai_configs`, `ai_logs`, `audit_logs`, `system_settings`. Missing explicit tables for online `orders`, `order_items`, `payments`, `inventory`, and `product_variants` (M/L/Panas/Dingin).
- **Existing Atomic Function**: In `supabase/migrations/20261031000002_atomic_functions.sql`, `record_transaction` implements idempotency and voucher locking (`FOR UPDATE`) for cashier POS transactions, but lacks online ordering state lifecycle and inventory stock decrement.
- **Existing Mock Fallback**: In `src/lib/supabase.ts`, lines 28-35 and `src/lib/mockData.ts`, an in-memory repository exists with 200 synthetic customers, 2,140 transactions, and RFM scoring calculation, proving viability for zero-credential operation.
- **Menu PDF Asset Location**: Discovered `MENU-REGULER.pdf` at:
  `C:/Users/Asus/AppData/Local/Packages/5319275A.WhatsAppDesktop_cv1g1gvanyjgm/LocalState/sessions/2D018F2FC604EE0E17A2CBF350B0532EA22815F2/transfers/2026-44/e95949cc-0357-4daf-939b-eabaa606b5eb_MENU-REGULER.pdf`.

## 2. Logic Chain
1. Sesuai observasi `ORIGINAL_REQUEST.md` (Poin 1-5), aplikasi CRM dan Ordering Rumah Tamah Bumi Upi ditargetkan berjalan sebagai pnpm monorepo (`apps/web`, `apps/admin`, `packages/ui`, `packages/db`).
2. Agar aplikasi web customer (`apps/web`) dapat menangani pemesanan meja (dine-in) dan takeaway dengan varian (M/L, Panas/Dingin), skema Supabase yang ada perlu diekspansi untuk mendukung tabel `categories`, `products`, `product_variants`, `orders`, `order_items`, `payments`, dan `inventory` secara formal (sebagaimana dirancang di Section 2 `survey_report.md`).
3. Mengacu pada kebutuhan pengujian instan tanpa ketergantungan API pihak ketiga, arsitektur fallback mock API lokal di Next.js dapat dibangun menggunakan Repository Pattern pada `packages/db`. Ketika `NEXT_PUBLIC_SUPABASE_URL` tidak tersedia atau bernilai placeholder, sistem secara transparan mengalihkan operasi baca/tulis ke in-memory store yang telah diisi data awal (105 menu item, 200 pelanggan, 2.140 transaksi, inventaris, dan voucher).
4. Mode WhatsApp OTP Console dirancang untuk mencetak kode OTP berformat visual jelas ke terminal server Node.js sekaligus menyertakan `demoOtp` di payload respons JSON, sehingga komponen UI toast di frontend dapat menyediakan tombol "Isi Otomatis (Auto-fill)", menjamin alur registrasi dan verifikasi pelanggan berjalan mulus saat evaluasi langsung.
5. Akun demo standar (`putriayusagita02@gmail.com` / `BumiUpiAdmin2026!`, `kasir@bumiupi.id`, `customer@bumiupi.id`) dikonfigurasikan di seed SQL, mock auth store, dan tombol login cepat untuk memastikan kemudahan akses penguji.
6. Integrasi bot Telegram (`@BumiUpiBot`) menghubungkan transaksi selesai ke notifikasi struk berformat waktu WIB, pemicu pesanan masuk ke grup dapur, serta mekanisme verifikasi nomor HP yang aman melalui native contact sharing.

## 3. Caveats
- Pengujian WhatsApp OTP mode console tidak mengirim pesan jaringan riil ke nomor HP WhatsApp pengguna di dunia nyata, melainkan merekayasanya melalui console log dan toast helper sesuai mandat perancangan demo.
- Lokasi fisik file `MENU-REGULER.pdf` berada di folder cache WhatsApp Desktop lokal pengguna (`AppData/Local/...`); sub-orchestrator seeding perlu membaca/menyalin file tersebut atau menggunakan daftar 105 item yang diekstrak oleh `spec_miner_survey_1`.

## 4. Conclusion
Arsitektur sistem, skema basis data Supabase (PostgreSQL), arsitektur fallback local mock API, alur WhatsApp OTP console, akun kredensial demo, serta alur ordering web dan CRM/POS telah selesai diinvestigasi dan dirumuskan secara komprehensif. Laporan lengkap siap dijadikan acuan cetak biru teknis bagi sub-orchestrator dan builder di `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_survey_3\survey_report.md`.

## 5. Verification Method
1. **Inspeksi Berkas Laporan**:
   Buka dan periksa dokumen `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_survey_3\survey_report.md`. Pastikan seluruh 5 domain arsitektural (Skema Supabase, Fallback Mock API, WhatsApp OTP Console, Kredensial Demo, dan Integrasi Telegram Web Ordering) terdokumentasi lengkap dengan DDL SQL dan diagram alur.
2. **Validasi Sintaks SQL**:
   Periksa blok DDL PostgreSQL dan fungsi atomic `create_order_atomic` di Section 2 untuk memastikan tipe data, constraint kunci unik, referensi relasional antar tabel, dan row locking (`FOR UPDATE`) valid.
3. **Pemeriksaan Konsistensi Token & Warna**:
   Verifikasi kesesuaian palet warna heritage (Olive `#3E4F30`, Krem `#F5EEDC`, Terakota `#B4532A`, Mustard `#D4A24C`) dan tipografi (Fraunces, Caveat, Plus Jakarta Sans) yang tercantum pada spesifikasi apps/web dan apps/admin.
