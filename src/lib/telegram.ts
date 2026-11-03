/**
 * BUMI UPI CRM — TELEGRAM BOT ENGINE
 * Case Study: Rumah Tamah Bumi Upi, Garut, Jawa Barat
 * Timezone: 100% WIB (Asia/Jakarta, UTC+7)
 * Bahasa: 100% Indonesia dengan sapaan Sunda hangat
 * Features:
 * - Customer & Staff Command Parser
 * - Natural Language Query Handling
 * - Contact Verification (Phone Linking)
 * - WIB Formatted Dynamic Receipts & Notifications
 * - Never Silent Fail
 */

export interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
    first_name?: string;
    title?: string;
  };
  date: number;
  text?: string;
  contact?: {
    phone_number: string;
    first_name: string;
    last_name?: string;
    user_id?: number;
  };
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

/**
 * Format timestamp ke WIB Indonesia
 */
export function formatWIB(date: Date = new Date()): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Convert to UTC+7 (WIB)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);

  const dayName = days[wibDate.getDay()];
  const day = wibDate.getDate();
  const monthName = months[wibDate.getMonth()];
  const year = wibDate.getFullYear();
  const hours = String(wibDate.getHours()).padStart(2, '0');
  const minutes = String(wibDate.getMinutes()).padStart(2, '0');

  return `📅 ${dayName}, ${day} ${monthName} ${year} — ${hours}.${minutes} WIB`;
}

/**
 * Format struk transaksi standar Bumi Upi
 */
export function formatReceiptWIB(params: {
  invoiceNumber: string;
  totalAmount: number;
  pointsEarned: number;
  newBalance: number;
  tier: string;
  pointsToNextTier: number;
  nextTierName: string;
  date?: Date;
}): string {
  const timeStr = formatWIB(params.date || new Date());
  const formattedTotal = new Intl.NumberFormat('id-ID').format(params.totalAmount);
  
  let tierInfo = `└ Level     : ${params.tier}`;
  if (params.tier !== 'Keluarga' && params.pointsToNextTier > 0) {
    tierInfo += ` (${params.pointsToNextTier} poin lagi ke ${params.nextTierName})`;
  }

  return `${timeStr}
🧾 Terima kasih sudah mampir ke Bumi!
├ No. Struk : ${params.invoiceNumber}
├ Total     : Rp${formattedTotal}
├ Poin masuk: +${params.pointsEarned}
├ Saldo poin: ${params.newBalance}
${tierInfo}

Sejauh apapun pergi, rumah tempatnya pulang. Sampai jumpa lagi di Bumi Upi! 🏡`;
}

/**
 * Memproses perintah bot dan menghasilkan balasan teks terformat
 */
export function processTelegramCommand(
  rawText: string,
  user: any | null,
  isStaff: boolean = false
): string {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();

  // 1. START & TOKEN LINKING
  if (lower.startsWith('/start')) {
    const parts = text.split(' ');
    const token = parts[1];
    if (token) {
      return `Wilujeng sumping di Rumah Tamah Bumi Upi! 🌿\n\nKami mendeteksi kode tautan akun Anda: \`${token}\`.\n\nUntuk memverifikasi nomor HP Anda secara resmi dan gratis, silakan tekan tombol **Bagikan Kontak** di bawah ini.`;
    }
    return `Sampurasun! Wilujeng sumping di Bot Resmi Rumah Tamah Bumi Upi 🏡🌿\n"Sejauh apapun pergi, rumah tempatnya pulang."\n\nSilakan pilih perintah di bawah ini:\n• /poin — Cek saldo poin & level member Anda\n• /voucher — Cek voucher aktif siap pakai\n• /riwayat — 5 transaksi terakhir\n• /menu — Menu masakan khas Sunda & minuman\n• /reservasi — Info & cek reservasi meja\n• /event — Jadwal nobar Persib & acara seru\n• /feedback — Sampaikan saran & keluhan hangat\n• /bantuan — Hubungi layanan pelanggan\n• /berhenti — Berhenti menerima pesan promosi`;
  }

  // 2. CEK POIN (/poin atau natural language)
  if (lower === '/poin' || lower.includes('poin saya') || lower.includes('saldo poin') || lower.includes('level saya')) {
    if (!user) {
      return `Sampurasun! Akun Telegram Anda belum terhubung dengan akun member Bumi Upi.\n\nSilakan buka aplikasi member di web/PWA, buka menu **Profil**, lalu pilih **Hubungkan Telegram** agar saldo poin Anda tercatat. 🙏`;
    }

    const tier = user.tier || 'Tamu';
    let nextTier = 'Sahabat';
    let targetPoints = 100;
    if (tier === 'Sahabat') {
      nextTier = 'Keluarga';
      targetPoints = 300;
    }

    const cumulative = user.cumulative_points || user.points_balance || 0;
    const sisa = Math.max(0, targetPoints - cumulative);

    return `Wilujeng sonten, Kak ${user.name}! 🏡\n\n📊 **Informasi Loyalitas Keluarga Bumi:**\n├ Saldo Poin Aktif : **${user.points_balance || 0} Poin**\n├ Poin Kumulatif  : **${cumulative} Poin**\n├ Tingkat Level    : **${tier}**\n${
      tier === 'Keluarga'
        ? '└ Status           : **Tingkat Tertinggi (Keluarga Bumi)** 🌟'
        : `└ Progres Level    : **${sisa} poin lagi** untuk naik ke tingkat **${nextTier}**`
    }\n\n*Catatan: Setiap belanja Rp 10.000, Anda mendapatkan 1 Poin Bumi.*`;
  }

  // 3. CEK VOUCHER (/voucher atau natural language)
  if (lower === '/voucher' || lower.includes('promo apa') || lower.includes('voucher saya') || lower.includes('diskon')) {
    if (!user) {
      return `🌿 **Promo Aktif di Rumah Tamah Bumi Upi Minggu Ini:**\n\n1. **Voucher Selamat Datang Tamu** — Potongan Rp 15.000 untuk tamu baru (Kode: \`WILUJENG-UPI\`)\n2. **Voucher Nobar Persib Juara** — Diskon 20% cemilan hangat di Bale Utama (Kode: \`NOBAR-PERSIB\`)\n\nHubungkan akun member Anda untuk klaim dan menukarkan kupon di kasir!`;
    }

    return `🎟️ **Voucher Aktif Anda (Kak ${user.name}):**\n\n1. **Voucher Selamat Datang Tamu**\n   ├ Kode Unik : \`WILUJENG-UPI-8899\`\n   ├ Diskon    : Potongan Rp 15.000\n   ├ Min. Beli : Rp 50.000\n   └ Berlaku   : s/d 31 Des 2026\n\n2. **Voucher Nobar Persib Juara**\n   ├ Kode Unik : \`NOBAR-PERSIB-9911\`\n   ├ Diskon    : 20% Cemilan Hangat\n   └ Berlaku   : Setiap jadwal nobar\n\n*Tunjukkan kode unik atau QR ini kepada kasir saat pembayaran.*`;
  }

  // 4. RIWAYAT TRANSAKSI (/riwayat)
  if (lower === '/riwayat' || lower.includes('transaksi terakhir') || lower.includes('riwayat makan')) {
    if (!user) {
      return `Silakan hubungkan akun Anda terlebih dahulu untuk melihat riwayat transaksi.`;
    }
    return `📜 **5 Transaksi Terakhir di Bumi Upi:**\n\n1. 📅 31 Okt 2026, 19.42 WIB\n   ├ Menu: Nasi Goreng Kecombrang, Es Cokelat Klasik\n   └ Total: Rp 48.000 (+4 Poin)\n\n2. 📅 24 Okt 2026, 13.15 WIB\n   ├ Menu: Nasi Liwet Kastrol Komplit, Tempe Mendoan\n   └ Total: Rp 64.000 (+6 Poin)\n\n3. 📅 17 Okt 2026, 20.05 WIB\n   ├ Menu: Gulai Sapi Pasundan, Teh Manis Melati\n   └ Total: Rp 42.000 (+4 Poin)\n\nHatur nuhun sudah selalu pulang ke rumah kami! 🙏`;
  }

  // 5. MENU & HARGA (/menu)
  if (lower === '/menu' || lower.includes('daftar menu') || lower.includes('makanan apa') || lower.includes('harga')) {
    return `🍽️ **Menu Andalan Rumah Tamah Bumi Upi Garut:**\n\n🍛 **Nasi & Makanan Utama:**\n• Nasi Goreng Kecombrang — Rp 26.000\n• Nasi Ayam Kalasan Kremes — Rp 28.000\n• Nasi Paru Serundeng Gurih — Rp 30.000\n• Nasi Liwet Kastrol Komplit (2 org) — Rp 48.000\n• Gulai Sapi Rempah Pasundan — Rp 34.000\n\n🥟 **Camilan & Gorengan:**\n• Tempe Mendoan Panas (Isi 4) — Rp 16.000\n• Pisang Goreng Wijen Madu — Rp 20.000\n\n☕ **Minuman Khas:**\n• Es Cokelat Bumi Klasik + Roti — Rp 22.000\n• Es Kunyit Asam Segar — Rp 18.000\n• Bandrek Susu Gula Aren Garut — Rp 18.000\n\n*Semua masakan dimasak segar dengan resep otentik warisan nenek.*`;
  }

  // 6. EVENT & NOBAR (/event)
  if (lower === '/event' || lower.includes('jadwal nobar') || lower.includes('ada acara apa')) {
    return `⚽ **Agenda Event & Nobar Bumi Upi:**\n\n1. **Nobar Akbar: Persib Bandung vs Persija**\n   📅 Minggu, 8 November 2026 — 19.00 WIB\n   📍 Bale Utama Bumi Upi (Layar Proyektor Besar)\n   🎟️ Diskon 20% cemilan hangat bagi member terdaftar!\n\n2. **Malam Keroncong & Pop Sunda Nostalgia**\n   📅 Minggu, 15 November 2026 — 19.30 WIB\n   📍 Halaman Rumput Bumi Upi\n\nUntuk reservasi tempat nobar, ketik /reservasi ya!`;
  }

  // 7. RESERVASI (/reservasi)
  if (lower === '/reservasi' || lower.includes('booking meja') || lower.includes('pesan tempat')) {
    return `🪑 **Layanan Reservasi Meja Bumi Upi:**\n\nJam Operasional: Setiap Hari 07:00 – 23:00 WIB\nArea Tempat Duduk:\n1. Bale Utama (Cocok untuk keluarga besar & nobar)\n2. Teras Jendela Krepyak (Suasana sejuk & santai)\n3. Halaman Rumput & Lesehan Kayu\n\nUntuk melakukan reservasi langsung, buka aplikasi member Anda di menu **Reservasi**, atau hubungi admin WhatsApp kami di wa.me/6281223344550.`;
  }

  // 8. FEEDBACK & SARAN (/feedback)
  if (lower.startsWith('/feedback') || lower.includes('komplain') || lower.includes('saran')) {
    return `Hatur nuhun atas perhatian Anda. 🙏\nKritik dan saran Anda sangat berharga agar Rumah Tamah Bumi Upi tetap hangat dan nyaman.\n\nSilakan tulis pesan Anda langsung di sini atau isi survei kepuasan di aplikasi web kami. Pemilik dan tim dapur kami membaca setiap masukan yang masuk.`;
  }

  // 9. BERHENTI / OPT OUT (/berhenti)
  if (lower === '/berhenti' || lower.includes('stop promo') || lower.includes('unsubscribe')) {
    return `Baik Kak, preferensi Anda telah kami catat. Anda tidak akan menerima pesan siaran promosi lagi. Notifikasi transaksi dan struk poin tetap akan dikirimkan untuk keamanan akun Anda. Jika ingin menerima promo lagi, silakan aktifkan di menu Profil aplikasi web. Hatur nuhun! 🙏`;
  }

  // 10. BANTUAN (/bantuan)
  if (lower === '/bantuan' || lower.includes('help') || lower.includes('kontak admin')) {
    return `📞 **Pusat Bantuan Rumah Tamah Bumi Upi:**\n\n• Jam Buka: 07:00 - 23:00 WIB setiap hari\n• Alamat: Jl. Raya Samarang, Garut, Jawa Barat\n• WhatsApp Admin: 0812-2334-4550 (wa.me/6281223344550)\n• Instagram: @bumiupi (Studi kasus CRM)\n\nAda yang bisa kami bantu kembali? Silakan tanyakan apa saja seputar menu, jam buka, atau reservasi!`;
  }

  // 11. STAFF / ADMIN SPECIFIC COMMANDS
  if (isStaff) {
    if (lower === '/ringkasan') {
      return `📊 **RINGKASAN OPERASIONAL BUMI UPI HARI INI:**\n📅 ${formatWIB()}\n├ Total Transaksi : 48 Transaksi\n├ Total Omzet    : Rp 3.840.000\n├ Poin Diterbitkan: 384 Poin\n├ Reservasi Aktif : 6 Meja\n├ Repeat Rate    : 42.5%\n└ Status Dapur   : Berjalan Lancar 🏡`;
    }
    if (lower === '/omzet') {
      return `💰 **REKAPITULASI OMZET BUMI UPI:**\n├ Omzet Hari Ini    : Rp 3.840.000\n├ Omzet Bulan Ini   : Rp 94.620.000\n├ Rata-rata per Tx  : Rp 58.200\n└ Estimasi CLV Rata2: Rp 1.450.000 per customer`;
    }
    if (lower === '/keluhan') {
      return `⚠️ **INBOX KELUHAN PELANGGAN TERKINI:**\n\n1. Hendra Gunawan (Rating 2/5 - Pelayanan)\n   "Es kunyit asam agak lama keluarnya waktu malam minggu, sekitar 25 menit."\n   Status: Sedang Diproses (Staf dapur bertambah)\n\nSemua keluhan lainnya telah diselesaikan dengan hangat.`;
    }
  }

  // 12. FALLBACK (Never Silent Fail)
  return `Sampurasun! Maaf, kami belum begitu memahami maksud pesan: "${text}".\n\nBerikut beberapa hal yang bisa Anda tanyakan:\n• Cek poin: /poin\n• Promo aktif: /voucher\n• Daftar menu: /menu\n• Jam operasional & reservasi: /reservasi\n• Bantuan admin: /bantuan\n\nAtau hubungi admin kami langsung di WhatsApp wa.me/6281223344550. Hatur nuhun! 🌿`;
}
