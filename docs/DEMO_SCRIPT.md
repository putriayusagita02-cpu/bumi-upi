# SKENARIO DEMO PRESENTASI — BUMI UPI CRM
**Panduan Pengujian & Presentasi Langsung (Durasi ~10-15 Menit)**

---

## 1. Persiapan Awal
Pastikan server lokal berjalan (buka terminal dan jalankan `npm run dev` atau `node server.js` atau `python server.py`). Buka peramban di `http://localhost:3000`.

### Akun Demo Tersedia:
- **Admin / Pemilik:** `admin@bumiupi.id` / Sandi: `bumiupi2026`
- **Kasir:** `kasir@bumiupi.id` / Sandi: `kasir2026`
- **Pelanggan Utama:** `customer@bumiupi.id` / Sandi: `tamu2026`

---

## 2. Babak 1: Suasana Landing Page & Chatbot "Upi Chat" (2 Menit)
1. **Buka Halaman Utama (`/`):**
   - Tunjukkan identitas visual khas *rumah nenek*: logo resmi hijau olive `#3E4F30`, latar kertas krem `#F5EEDC`, motif tegel Garut tempo doeloe, dan tipografi Fraunces & Caveat.
   - Perhatikan tidak ada gradient ungu neon atau layout dashboard startup generik.
2. **Uji Upi Chat AI Widget:**
   - Klik bubble chat di pojok kanan bawah.
   - Ketik: *"Jam berapa Bumi Upi buka dan ada menu andalan apa saja?"*
   - Perhatikan jawaban Upi Chat ramah dengan sapaan Sunda (*Sampurasun*), menyebut jam buka resmi 07:00 - 23:00 WIB dan menu andalan seperti Nasi Goreng Kecombrang serta Gulai Sapi Pasundan.
   - Ketik pertanyaan di luar konteks: *"Berapa harga tiket pesawat ke Bali?"*
   - Perhatikan guardrail bekerja: Upi Chat jujur menolak mengarang dan mengarahkan ke WhatsApp admin.

---

## 3. Babak 2: Pengalaman Pelanggan (Customer PWA) (3 Menit)
1. **Masuk sebagai Pelanggan (`/login`):**
   - Masukkan `customer@bumiupi.id` / `tamu2026`.
2. **Tinjau Beranda Pelanggan (`/customer`):**
   - Tunjukkan kartu member digital dengan kode QR dinamis `BUMI-CUST-8899`, saldo 142 Poin, dan Tier **Sahabat** (58 poin lagi ke Keluarga).
   - Klik kartu untuk mode kecerahan layar penuh (agar mudah discan kasir).
3. **Klaim Voucher & Reservasi Meja:**
   - Buka tab **Voucher**: lihat voucher aktif dan tombol klaim voucher nobar.
   - Buka tab **Reservasi**: isi form reservasi meja untuk 4 orang di Bale Utama. Status langsung tersimpan sebagai *menunggu konfirmasi*.
4. **Verifikasi HP via Telegram:**
   - Buka tab **Profil**: lihat tombol *Hubungkan Telegram* dengan deep link token sekali pakai.

---

## 4. Babak 3: Kasir Tablet POS & Transaksi Atomic (3 Menit)
1. **Pindah ke Tampilan Kasir (`/admin/kasir`):**
   - Masuk sebagai `kasir@bumiupi.id` / `kasir2026`.
2. **Simulasi Pembelian:**
   - Ketik nama pelanggan *"Dimas Kurniawan"* atau nomor HP `081234567890`. Profil langsung ditemukan dengan saldo 142 Poin.
   - Pilih menu: *Nasi Goreng Kecombrang* (x2), *Es Cokelat Bumi Klasik* (x2), *Tempe Mendoan Panas* (x1).
   - Terapkan Voucher: masukkan kode `WILUJENG-UPI` (potongan Rp 15.000).
   - Klik tombol terakota **"Selesaikan Pembayaran & Cetak Struk"**.
3. **Verifikasi Integritas:**
   - Perhatikan fungsi atomic berjalan: transaksi tercatat di database, saldo Dimas bertambah poin secara otomatis, voucher ditandai telah dipakai, dan audit log kasir diperbarui.
   - Coba selesaikan lagi dengan key yang sama -> sistem mendeteksi idempotency dan mencegah duplikasi poin.

---

## 5. Babak 4: Admin Analytical CRM (RFM, CLV, & Kampanye) (4 Menit)
1. **Masuk ke Dashboard Admin (`/admin`):**
   - Tampilkan banner mencolok **"DATA SIMULASI — STUDI KASUS CRM"**.
   - Tunjukkan metrik realtime: 200 pelanggan, 2.140 transaksi, omzet kumulatif, grafik tren 30 hari, dan proporsi segmen pelanggan.
2. **Buka Halaman Segmentasi RFM (`/admin/rfm`):**
   - Tunjukkan visualisasi matriks kuintil R, F, M (skor 1 sampai 5) dan sebaran 7 segmen (Champions, Loyal, Potensial Loyal, Baru, Berisiko, Hampir Hilang, Hilang).
   - Klik segmen **Berisiko (At-Risk)**: tampilkan daftar 28 pelanggan yang dulu rutin berkunjung namun sudah 45-90 hari tidak datang.
3. **Luncurkan Kampanye Broadcast:**
   - Klik tombol **"Kirim Kampanye Win-Back ke Segmen Berisiko"**.
   - Pilih template *"Kangen Masakan Rumah Nenek?"* dengan potongan Rp 25.000.
   - Tunjukkan filter batas 2 pesan/minggu dan opsi opt-out yang dihormati sistem.
4. **Customer 360 View (`/admin/pelanggan`):**
   - Cari salah satu pelanggan (misal: *Dimas Kurniawan*).
   - Buka halaman Customer 360: lihat profil lengkap, estimasi CLV (Customer Lifetime Value), menu favorit, riwayat kunjungan, dan riwayat voucher.
5. **Peta Konsep CRM (`/admin/peta-konsep`):**
   - Tunjukkan pemetaan akademik: Operational CRM, Analytical CRM, Collaborative CRM, dan Loyalty Lifecycle.

---

## 6. Babak 5: Tanya Jawab Dosen & Penguji (2 Menit)
- Tunjukkan file migrasi PostgreSQL di `supabase/migrations/` yang membuktikan aturan RLS dan fungsi atomic.
- Tunjukkan folder `/docs/` yang berisi ERD, Use Cases, Flowcharts, dan Kuesioner Pengujian.
