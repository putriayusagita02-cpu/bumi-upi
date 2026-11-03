# FLOWCHARTS ALUR UTAMA SISTEM — BUMI UPI CRM
**Studi Kasus:** Rumah Tamah Bumi Upi, Garut, Jawa Barat  
**Format:** Diagram Alir Standar (Mermaid)

---

## 1. Alur Transaksi Kasir & Poin Atomic (POS Engine)

```mermaid
flowchart TD
    Start([Kasir Buka POS]) --> SearchCust[Cari Pelanggan via QR / HP]
    SearchCust --> CustFound{Pelanggan Terdaftar?}
    
    CustFound -- Ya --> LoadCust[Tampilkan Nama, Tier & Saldo Poin]
    CustFound -- Tidak --> FastReg[Opsi: Daftar Cepat di Tempat atau Tamu Langsung]
    FastReg --> SelectMenu
    LoadCust --> SelectMenu[Pilih Menu & Jumlah Pesanan]

    SelectMenu --> CheckVcr{Pakai Voucher?}
    CheckVcr -- Ya --> ValidateVcr[Sistem Validasi Kupon & Syarat Min. Belanja]
    ValidateVcr --> VcrValid{Valid & Belum Terpakai?}
    VcrValid -- Ya --> ApplyDisc[Terapkan Potongan Diskon]
    VcrValid -- Tidak --> VcrError[Tampilkan Peringatan Kupon Tidak Sah]
    VcrError --> SelectMenu
    CheckVcr -- Tidak --> HitungTotal[Hitung Subtotal & Total Akhir]
    ApplyDisc --> HitungTotal

    HitungTotal --> Pay[Tekan 'Selesaikan Pembayaran']
    Pay --> AtomicCall[Panggil record_transaction Atomic]

    subgraph "PostgreSQL Atomic Engine"
        AtomicCall --> IdempCheck{Idempotency Key Ada?}
        IdempCheck -- Ya --> SkipTx[Kembalikan Data Transaksi Sebelumnya]
        IdempCheck -- Tidak --> LockVcr[Lock Voucher dengan FOR UPDATE]
        LockVcr --> InsertTx[Insert Baris Transaksi & Items]
        InsertTx --> MarkVcr[Update is_redeemed = TRUE]
        MarkVcr --> CalcPoints[Hitung Poin: final_amount / 10.000]
        CalcPoints --> UpdateCust[Update points_balance & cumulative_points]
        UpdateCust --> TierCheck{cumulative_points >= 300?}
        TierCheck -- Ya --> SetKeluarga[Set Tier = Keluarga]
        TierCheck -- Tidak --> TierCheck2{cumulative_points >= 100?}
        TierCheck2 -- Ya --> SetSahabat[Set Tier = Sahabat]
        TierCheck2 -- Tidak --> SetTamu[Set Tier = Tamu]
        SetKeluarga --> InsertLedger[Catat ke points_ledger]
        SetSahabat --> InsertLedger
        SetTamu --> InsertLedger
    end

    InsertLedger --> Finish[Selesai: Cetak Struk & Push Notifikasi Telegram]
    SkipTx --> Finish
    Finish --> End([Selesai])
```

---

## 2. Alur Verifikasi Nomor HP via Telegram Deep Link

```mermaid
flowchart TD
    Start([Pelanggan Buka Menu Profil]) --> ClickLink[Tekan 'Hubungkan Telegram']
    ClickLink --> GenToken[Sistem Buat Token Sekali Pakai: kedaluwarsa 10 menit]
    GenToken --> DeepLink[Arahkan ke t.me/BumiUpiBot?start=TOKEN]
    DeepLink --> OpenTG[Telegram Terbuka]
    OpenTG --> StartBot[User Tekan /start]
    StartBot --> RequestContact[Bot Meminta: 'Bagikan Kontak']
    RequestContact --> ShareContact[User Membagikan Nomor Kontak HP]
    
    ShareContact --> VerifyOwner{contact.user_id == from.id?}
    VerifyOwner -- Tidak --> RejectFraud[Tolak: Nomor HP Bukan Milik Akun Ini]
    VerifyOwner -- Ya --> SaveVerified[Simpan Nomor HP & Set is_phone_verified = TRUE]
    
    SaveVerified --> SuccessMsg[Bot Balas: Nomor HP Berhasil Terverifikasi!]
    SuccessMsg --> RefreshProfile[Status di Profil Web Berubah Hijau Terverifikasi]
    RefreshProfile --> End([Selesai])
```

---

## 3. Alur Rekalkulasi Segmentasi RFM & Kampanye Broadcast

```mermaid
flowchart TD
    Start([Jadwal Otomatis / Trigger Admin]) --> FetchData[Ambil 200 Pelanggan & 2.140 Transaksi]
    FetchData --> CalcMetrics[Hitung Recency, Frequency, Monetary per Pelanggan]
    CalcMetrics --> QuintileScore[Bagi ke Kuintil Skor 1 - 5]
    QuintileScore --> AssignSegment[Klasifikasikan ke 7 Segmen RFM]
    AssignSegment --> CalcCLV[Hitung Estimasi CLV: AOV x Freq x Lifespan]
    CalcCLV --> UpdateRFMTable[Perbarui Tabel rfm_scores]
    UpdateRFMTable --> RenderMatrix[Tampilkan Matriks & Treemap di Dashboard Admin]

    RenderMatrix --> PickSegment[Admin Pilih Segmen: Misal 'Berisiko']
    PickSegment --> ChooseTemplate[Pilih Template Win-Back: 'Kangen Masakan Rumah Nenek']
    ChooseTemplate --> RateLimitCheck{Menerima > 2 Promo Minggu Ini?}
    RateLimitCheck -- Ya --> FilterOut[Lewatkan Pelanggan Ini - Hormati Batas Frekuensi]
    RateLimitCheck -- Tidak --> OptCheck{opt_in_promo == TRUE?}
    OptCheck -- Tidak --> FilterOut
    OptCheck -- Ya --> DispatchTG[Kirim Pesan via Telegram Bot]
    OptCheck -- Belum Terhubung TG --> GenWA[Buat Tautan wa.me dengan Teks Otomatis]

    DispatchTG --> TrackResult[Catat Statistik Terkirim & Konversi di Kampanye]
    GenWA --> TrackResult
    TrackResult --> End([Selesai])
```
