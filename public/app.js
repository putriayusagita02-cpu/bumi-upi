/**
 * BUMI UPI CRM — FULL-STACK CLIENT ENGINE (SPA APPLICATION)
 * Case Study: Rumah Tamah Bumi Upi, Garut, Jawa Barat
 * Timezone: 100% WIB (Asia/Jakarta, UTC+7)
 * Authentic Design: Olive #3E4F30, Krem #F5EEDC, Terakota #B4532A, Mustard #D4A24C, Cokelat #3B2A1E, Sage #8A8F5F
 */

// Global Application State
const STATE = {
  currentView: 'landing', // 'landing', 'auth', 'customer', 'admin-pos', 'admin-dashboard', 'admin-rfm', 'admin-clv', 'admin-pelanggan', 'admin-promo', 'admin-kampanye', 'admin-reservasi', 'admin-feedback', 'admin-menu', 'admin-insight', 'admin-laporan', 'admin-peta', 'admin-pengaturan', 'admin-audit'
  customerTab: 'beranda', // 'beranda', 'kartu', 'poin', 'voucher', 'reservasi', 'event', 'feedback', 'profil'
  currentUser: {
    id: 'usr-cust-demo',
    role: 'customer',
    name: 'Dimas Kurniawan',
    email: 'customer@bumiupi.id',
    phone: '081234567890',
    is_phone_verified: true,
    telegram_chat_id: 10003,
    telegram_username: 'dimaskurnia',
    tier: 'Sahabat',
    points_balance: 142,
    cumulative_points: 242,
    qr_code: 'BUMI-CUST-8899',
    birth_date: '1998-10-14',
    opt_in_promo: true
  },
  posCart: [],
  selectedCustomerForPOS: null,
  appliedVoucherForPOS: null,
  customerSearchQuery: '',
  rfmFilter: 'all',
  tierFilter: 'all',
  aiLogs: [],
  botHistory: [
    { sender: 'bot', text: 'Wilujeng sumping di Bot Resmi Rumah Tamah Bumi Upi 🏡🌿\nKetik /poin, /voucher, /riwayat, /menu, atau /reservasi untuk memulai.' }
  ]
};

// ----------------------------------------------------------------------------
// DATA REPOSITORIES (200 Pelanggan, 2.140 Transaksi, Menu, Vouchers, Segmen)
// ----------------------------------------------------------------------------
const MENU_ITEMS = [
  { id: 'menu-01', cat: 'Nasi & Utama', name: 'Nasi Goreng Kecombrang', price: 26000, desc: 'Nasi goreng harum rempah bunga kecombrang dengan suwiran ayam kampung dan telur ceplok.', feat: true, img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-02', cat: 'Nasi & Utama', name: 'Nasi Ayam Kalasan Kremes', price: 28000, desc: 'Ayam kalasan manis gurih dengan taburan kremesan renyah, lalap segar, dan sambal terasi.', feat: true, img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-03', cat: 'Nasi & Utama', name: 'Nasi Paru Serundeng Gurih', price: 30000, desc: 'Nasi putih dengan irisan paru sapi ungkep empuk berbalut serundeng kelapa sangrai harum.', feat: true, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-04', cat: 'Nasi & Utama', name: 'Nasi Liwet Kastrol Komplit (2 Orang)', price: 48000, desc: 'Nasi liwet wangi daun salam sereh dengan teri medan, tahu tempe, ikan asin gabus, dan sambal goang.', feat: true, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-05', cat: 'Lauk Pauk', name: 'Gulai Sapi Rempah Pasundan', price: 34000, desc: 'Gulai daging sapi empuk dengan kuah santan rempah kuning hangat khas tanah priangan.', feat: true, img: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-06', cat: 'Lauk Pauk', name: 'Pepes Ikan Mas Duri Lunak', price: 28000, desc: 'Ikan mas bumbu kuning kemangi dibungkus daun pisang, dikukus hingga durinya sangat lembut.', feat: false, img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-07', cat: 'Lauk Pauk', name: 'Empal Gepuk Daging Sapi Garut', price: 32000, desc: 'Daging sapi gepuk manis legit gurih dengan taburan bawang merah goreng harum.', feat: false, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-08', cat: 'Sayur & Sambal', name: 'Karedok Garut Segar', price: 18000, desc: 'Kacang panjang, kol, toge, dan terong bulat mentah segar diaduk bumbu kacang kencur khas Sunda.', feat: false, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-09', cat: 'Sayur & Sambal', name: 'Sayur Asem Kampung', price: 15000, desc: 'Sayur asem kuah bening segar dengan kacang tanah, jagung manis, labu siam, dan melinjo.', feat: false, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-10', cat: 'Sayur & Sambal', name: 'Sambal Dadak Terasi Uleg', price: 6000, desc: 'Sambal terasi segar diuleg langsung dengan cabai rawit domba, tomat cengkir, dan jeruk limau.', feat: true, img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-11', cat: 'Camilan', name: 'Tempe Mendoan Panas (Isi 4)', price: 16000, desc: 'Tempe tipis khas Banyumasan digoreng setengah matang dengan bumbu daun bawang dan sambal kecap rawit.', feat: true, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-12', cat: 'Camilan', name: 'Pisang Goreng Wijen Madu', price: 20000, desc: 'Pisang kepok manis renyah dibalur madu hutan dan wijen sangrai gurih.', feat: true, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-13', cat: 'Minuman', name: 'Es Cokelat Bumi Klasik', price: 22000, desc: 'Cokelat pekat dingin creamy disajikan dengan sepotong roti sobek panggang hangat khas Bumi Upi.', feat: true, img: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-14', cat: 'Minuman', name: 'Es Kunyit Asam Segar', price: 18000, desc: 'Rebusan rimpang kunyit asli dan asam jawa dingin yang menyegarkan dahaga dan menyehatkan tubuh.', feat: true, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-15', cat: 'Minuman', name: 'Bandrek Susu Gula Aren Garut', price: 18000, desc: 'Minuman jahe hangat berempah dengan susu murni dan manis legit gula aren kawung Garut.', feat: false, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80' },
  { id: 'menu-16', cat: 'Minuman', name: 'Teh Manis Melati Dingin', price: 8000, desc: 'Teh seduh tubruk wangi melati asli Jawa Barat dengan manis seimbang gula tebu alami.', feat: false, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80' }
];

const VOUCHERS = [
  { id: 'vcr-01', code: 'WILUJENG-UPI', title: 'Voucher Selamat Datang Tamu', disc: 'Rp 15.000', minSpend: 50000, exp: '31 Des 2026', type: 'nominal', val: 15000, claimed: 184, redeemed: 142, quota: 500 },
  { id: 'vcr-02', code: 'NOBAR-PERSIB', title: 'Voucher Nobar Persib Juara', disc: 'Diskon 20%', minSpend: 40000, exp: '30 Nov 2026', type: 'percent', val: 20, claimed: 126, redeemed: 98, quota: 200 },
  { id: 'vcr-03', code: 'RINDU-RUMAH', title: 'Voucher Kangen Rumah Tamah', disc: 'Rp 25.000', minSpend: 80000, exp: '31 Des 2026', type: 'nominal', val: 25000, claimed: 85, redeemed: 42, quota: 300 },
  { id: 'vcr-04', code: 'ULTAH-UPI', title: 'Traktiran Spesial Ulang Tahun', disc: 'Gratis Es Cokelat + Roti', minSpend: 50000, exp: '31 Des 2026', type: 'free_item', val: 22000, claimed: 45, redeemed: 38, quota: 1000 },
  { id: 'vcr-05', code: 'KELUARGA-HEMAT', title: 'Apresiasi Tingkat Keluarga', disc: 'Diskon 15%', minSpend: 0, exp: '31 Des 2026', type: 'percent', val: 15, claimed: 62, redeemed: 54, quota: 500 }
];

const EVENTS = [
  { id: 'evt-01', title: 'Nobar Akbar: Persib vs Persija', date: 'Minggu, 8 Nov 2026', time: '19.00 WIB', area: 'Bale Utama', max: 80, current: 64, vcr: 'Diskon 20% Cemilan Hangat', desc: 'Nonton bareng di layar proyektor Bale Utama Bumi Upi. Suasana hangat, mendoan panas, dan chant santun.' },
  { id: 'evt-02', title: 'Malam Keroncong & Pop Sunda', date: 'Minggu, 15 Nov 2026', time: '19.30 WIB', area: 'Halaman Rumput', max: 50, current: 38, vcr: null, desc: 'Pertunjukan musik akustik keroncong tempo doeloe dengan penerangan lentera di bawah langit malam Garut.' },
  { id: 'evt-03', title: 'Lokakarya Seduh Teh & Rimpang', date: 'Minggu, 22 Nov 2026', time: '10.00 WIB', area: 'Teras Krepyak', max: 25, current: 19, vcr: null, desc: 'Belajar meracik teh tubruk melati dan rempah kunyit asam bersama perajin herbal tradisional Garut.' }
];

// Generate 200 Realistis Customers
const CUSTOMERS_DB = (function() {
  const list = [
    { id: 'usr-admin-01', role: 'admin', name: 'Teh Upi (Owner Bumi Upi)', email: 'admin@bumiupi.id', phone: '081223344550', is_phone_verified: true, tier: 'Keluarga', points_balance: 450, cumulative_points: 620, qr_code: 'BUMI-ADM-001', opt_in_promo: true, segment: 'Champions', clv: 2450000, last_visit: '30 Okt 2026' },
    { id: 'usr-kasir-01', role: 'kasir', name: 'Kang Asep (Kasir Utama)', email: 'kasir@bumiupi.id', phone: '081223344551', is_phone_verified: true, tier: 'Sahabat', points_balance: 120, cumulative_points: 150, qr_code: 'BUMI-KSR-001', opt_in_promo: true, segment: 'Loyal', clv: 1250000, last_visit: '31 Okt 2026' },
    { id: 'usr-cust-demo', role: 'customer', name: 'Dimas Kurniawan', email: 'customer@bumiupi.id', phone: '081234567890', is_phone_verified: true, tier: 'Sahabat', points_balance: 142, cumulative_points: 242, qr_code: 'BUMI-CUST-8899', opt_in_promo: true, segment: 'Champions', clv: 1850000, last_visit: '28 Okt 2026' }
  ];

  const firstNames = ['Asep', 'Cecep', 'Dadan', 'Eman', 'Ginanjar', 'Hendra', 'Iwan', 'Jajang', 'Kurniawan', 'Maman', 'Nana', 'Dewi', 'Fitri', 'Gita', 'Imas', 'Lilis', 'Marlina', 'Neneng', 'Rina', 'Siti'];
  const lastNames = ['Kusuma', 'Permana', 'Sutisna', 'Nugraha', 'Hidayat', 'Kurnia', 'Saputra', 'Hermawan', 'Pratama', 'Gunawan', 'Suhendar', 'Sudrajat', 'Sanjaya', 'Budiman', 'Santoso', 'Ramadhan', 'Wijaya'];
  const segments = ['Champions', 'Loyal', 'Potensial Loyal', 'Baru', 'Berisiko', 'Hampir Hilang', 'Hilang'];

  for (let i = 1; i <= 197; i++) {
    const fn = firstNames[(i * 3 + 5) % firstNames.length];
    const ln = lastNames[(i * 7 + 2) % lastNames.length];
    const pad = String(i).padStart(3, '0');
    const seg = segments[i % segments.length];
    
    let tier = 'Tamu';
    let cum = 30 + ((i * 17) % 350);
    if (cum >= 300) tier = 'Keluarga';
    else if (cum >= 100) tier = 'Sahabat';
    const bal = Math.floor(cum * 0.75);

    list.push({
      id: `usr-cust-${pad}`,
      role: 'customer',
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`,
      phone: `0812${String(10000000 + i * 38291).slice(0, 8)}`,
      is_phone_verified: i % 3 !== 0,
      tier,
      points_balance: bal,
      cumulative_points: cum,
      qr_code: `BUMI-CUST-${pad}`,
      opt_in_promo: i % 10 !== 0,
      segment: seg,
      clv: 450000 + (cum * 4500),
      last_visit: `${28 - (i % 25)} Okt 2026`
    });
  }
  return list;
})();

// Master RFM Segment Statistics
const RFM_DATA = [
  { name: 'Champions', count: 35, pct: 17.5, avgR: 6, avgF: 12.4, totalM: 42500000, avgCLV: 2420000, color: '#3E4F30', bg: 'bg-olive text-white', desc: 'Pelanggan terbaik: beli paling baru, sangat sering, dan pengeluaran tertinggi.', action: 'Apresiasi VIP, traktiran ulang tahun, undang nobar eksklusif.' },
  { name: 'Loyal', count: 48, pct: 24.0, avgR: 16, avgF: 6.8, totalM: 38200000, avgCLV: 1560000, color: '#8A8F5F', bg: 'bg-sage text-white', desc: 'Pelanggan setia: rutin berkunjung, responsif terhadap promo menu baru.', action: 'Dorong naik ke tier Keluarga, tawarkan menu liwet komplit.' },
  { name: 'Potensial Loyal', count: 32, pct: 16.0, avgR: 18, avgF: 3.2, totalM: 18400000, avgCLV: 920000, color: '#D4A24C', bg: 'bg-mustard text-cokelat', desc: 'Baru 2-4 kali berkunjung dengan keranjang belanja baik.', action: 'Dorong kebiasaan rutin dengan voucher diskon kunjungan kedua.' },
  { name: 'Baru', count: 24, pct: 12.0, avgR: 8, avgF: 1.0, totalM: 8600000, avgCLV: 480000, color: '#3B82F6', bg: 'bg-blue-100 text-blue-900 border border-blue-300', desc: 'Kunjungan perdana baru-baru ini.', action: 'Beri voucher selamat datang, bimbing cara pakai kartu digital.' },
  { name: 'Berisiko', count: 28, pct: 14.0, avgR: 64, avgF: 4.5, totalM: 22100000, avgCLV: 1150000, color: '#B4532A', bg: 'bg-terakota text-white', desc: 'Dulu rutin berkunjung (>=3x), namun sudah 45-90 hari belum mampir.', action: 'Kirim kampanye win-back hangat bernada kangen rumah + voucher Rp 25.000.' },
  { name: 'Hampir Hilang', count: 18, pct: 9.0, avgR: 112, avgF: 2.1, totalM: 9800000, avgCLV: 520000, color: '#EA580C', bg: 'bg-orange-100 text-orange-900 border border-orange-300', desc: 'Sudah 90-140 hari tidak berkunjung dengan frekuensi rendah.', action: 'Kirimkan pesan personal via Telegram menanyakan kabar.' },
  { name: 'Hilang', count: 15, pct: 7.5, avgR: 162, avgF: 1.2, totalM: 4200000, avgCLV: 240000, color: '#6B7280', bg: 'bg-gray-100 text-gray-800 border border-gray-300', desc: 'Sudah lebih dari 140 hari tidak berkunjung.', action: 'Evaluasi survei feedback untuk perbaikan dapur dan pelayanan.' }
];

const RESERVATIONS_DB = [
  { id: 'res-01', name: 'Dimas Kurniawan', phone: '081234567890', date: '02 Nov 2026', time: '18:30 WIB', pax: 6, area: 'Bale Utama', status: 'dikonfirmasi', notes: 'Reuni keluarga kecil, minta meja dekat jendela krepyak.' },
  { id: 'res-02', name: 'Siti Nurhaliza', phone: '081239847123', date: '03 Nov 2026', time: '19:00 WIB', pax: 4, area: 'Teras Jendela Krepyak', status: 'menunggu', notes: 'Ulang tahun adik perempuan, bawa kue sendiri.' },
  { id: 'res-03', name: 'Cecep Supriadi', phone: '081248271822', date: '08 Nov 2026', time: '18:45 WIB', pax: 8, area: 'Bale Utama', status: 'dikonfirmasi', notes: 'Nobar Persib vs Persija, minta posisi layar depan.' }
];

const FEEDBACKS_DB = [
  { id: 'fb-01', name: 'Dimas Kurniawan', tier: 'Sahabat', rating: 5, cat: 'Rasa', comment: 'Nasi goreng kecombrangnya wangi pisan! Serasa makan di kampung halaman nenek sendiri. Tetap pertahankan rasa autentiknya ya!', date: '28 Okt 2026', status: 'selesai', response: 'Hatur nuhun pisan Kang Dimas! Ditunggu kepulangannya lagi ke Rumah Tamah!' },
  { id: 'fb-02', name: 'Dewi Permana', tier: 'Keluarga', rating: 5, cat: 'Suasana', comment: 'Bale Utama sangat sejuk dan nyaman buat nobar Persib. Lampu temaram dan lagu keroncongnya bikin betah berjam-jam.', date: '25 Okt 2026', status: 'selesai', response: 'Alhamdulillah, senang sekali Teh Dewi merasa nyaman di rumah.' },
  { id: 'fb-03', name: 'Hendra Gunawan', tier: 'Sahabat', rating: 2, cat: 'Pelayanan', comment: 'Waktu malam minggu kemarin pesan es kunyit asam agak lama keluarnya, sekitar 25 menit baru sampai ke meja.', date: '26 Okt 2026', status: 'diproses', response: 'Mohon maaf sebesar-besarnya Kang Hendra. Kami sedang menambah staf seduh di jam sibuk akhir pekan.' },
  { id: 'fb-04', name: 'Lilis Suhendar', tier: 'Tamu', rating: 4, cat: 'Rasa', comment: 'Gulai sapinya empuk sekali, kuahnya gurih. Sambal terasinya kalau bisa lebih pedas lagi ya.', date: '22 Okt 2026', status: 'selesai', response: 'Hatur nuhun sarannya Teh Lilis, nanti bisa request sambal ekstra pedas ya!' }
];

const CAMPAIGNS_DB = [
  { id: 'cmp-01', title: 'Win-Back: Kangen Rumah Tamah Bumi Upi', seg: 'Berisiko', channel: 'Telegram', sent: '25 Okt 2026', aud: 28, deliv: 28, conv: 12, tmpl: 'Sampurasun Kak {nama}! Sudah lama tidak singgah ke Bumi Upi. Ada sepiring gorengan hangat dan voucher Rp 25.000 menunggu Anda pulang.' },
  { id: 'cmp-02', title: 'Undangan Nobar Persib Juara', seg: 'Champions', channel: 'Telegram', sent: '28 Okt 2026', aud: 35, deliv: 35, conv: 24, tmpl: 'Wilujeng sonten Keluarga Bumi! Mari nobar laga akbar Persib vs Persija hari Minggu di Bale Utama. Diskon 20% cemilan hangat!' }
];

const AUDIT_LOGS_DB = [
  { id: 'aud-01', staff: 'Teh Upi (Owner)', action: 'UPDATE_POINTS_RULE', entity: 'system_settings', detail: 'Mengubah rasio poin: Rp 10.000 = 1 Poin Bumi', time: '30 Okt 2026, 17:22 WIB' },
  { id: 'aud-02', staff: 'Kang Asep (Kasir)', action: 'RECORD_TRANSACTION', entity: 'transactions', detail: 'Input transaksi meja 3 senilai Rp 86.000 (Poin: +8)', time: '31 Okt 2026, 20:12 WIB' },
  { id: 'aud-03', staff: 'Teh Upi (Owner)', action: 'TRIGGER_CAMPAIGN', entity: 'campaigns', detail: 'Broadcast kampanye Nobar ke segmen Champions (35 penerima)', time: '28 Okt 2026, 14:00 WIB' }
];

// ----------------------------------------------------------------------------
// ROUTER & NAVIGATION CONTROLLER
// ----------------------------------------------------------------------------
function navigateTo(view, sectionId) {
  STATE.currentView = view;
  const labelMap = {
    'landing': 'Landing Page',
    'auth': 'Login / Register',
    'customer': 'Customer PWA',
    'admin-pos': 'Kasir POS (Tablet)',
    'admin-dashboard': 'Admin Dashboard',
    'admin-rfm': 'Segmentasi RFM',
    'admin-clv': 'Estimasi CLV',
    'admin-pelanggan': 'Data Pelanggan (360)',
    'admin-promo': 'Promo & Voucher',
    'admin-kampanye': 'Kampanye Broadcast',
    'admin-reservasi': 'Reservasi Meja',
    'admin-feedback': 'Feedback Pelanggan',
    'admin-menu': 'Katalog Menu',
    'admin-insight': 'AI Insight Mingguan',
    'admin-laporan': 'Laporan Transaksi',
    'admin-peta': 'Peta Konsep CRM',
    'admin-pengaturan': 'Pengaturan Sistem',
    'admin-audit': 'Audit Log'
  };

  const labelEl = document.getElementById('current-view-label');
  if (labelEl) labelEl.textContent = labelMap[view] || 'Pilih Halaman';

  // Close dropdown if open
  const dd = document.getElementById('nav-dropdown');
  if (dd) dd.classList.add('hidden');

  // Update User Badge in Header
  updateUserHeaderBadge();

  // Render View
  const viewport = document.getElementById('app-viewport');
  if (!viewport) return;

  switch (view) {
    case 'landing':
      renderLandingPage(viewport);
      break;
    case 'auth':
      renderAuthPage(viewport);
      break;
    case 'customer':
      renderCustomerPWA(viewport);
      break;
    case 'admin-pos':
      renderAdminShell(viewport, 'pos');
      break;
    case 'admin-dashboard':
      renderAdminShell(viewport, 'dashboard');
      break;
    case 'admin-rfm':
      renderAdminShell(viewport, 'rfm');
      break;
    case 'admin-clv':
      renderAdminShell(viewport, 'clv');
      break;
    case 'admin-pelanggan':
      renderAdminShell(viewport, 'pelanggan');
      break;
    case 'admin-promo':
      renderAdminShell(viewport, 'promo');
      break;
    case 'admin-kampanye':
      renderAdminShell(viewport, 'kampanye');
      break;
    case 'admin-reservasi':
      renderAdminShell(viewport, 'reservasi');
      break;
    case 'admin-feedback':
      renderAdminShell(viewport, 'feedback');
      break;
    case 'admin-menu':
      renderAdminShell(viewport, 'menu');
      break;
    case 'admin-insight':
      renderAdminShell(viewport, 'insight');
      break;
    case 'admin-laporan':
      renderAdminShell(viewport, 'laporan');
      break;
    case 'admin-peta':
      renderAdminShell(viewport, 'peta');
      break;
    case 'admin-pengaturan':
      renderAdminShell(viewport, 'pengaturan');
      break;
    case 'admin-audit':
      renderAdminShell(viewport, 'audit');
      break;
    default:
      renderLandingPage(viewport);
  }

  // Refresh Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Handle in-page anchor scroll
  if (sectionId) {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function toggleNavDropdown() {
  const dd = document.getElementById('nav-dropdown');
  if (dd) dd.classList.toggle('hidden');
}

function updateUserHeaderBadge() {
  const user = STATE.currentUser;
  const nameEl = document.getElementById('user-badge-name');
  const roleEl = document.getElementById('user-badge-role');
  const authLabel = document.getElementById('auth-btn-label');

  if (nameEl && roleEl) {
    nameEl.textContent = user.name;
    if (user.role === 'admin') {
      roleEl.className = 'w-2 h-2 rounded-full bg-olive';
    } else if (user.role === 'kasir') {
      roleEl.className = 'w-2 h-2 rounded-full bg-mustard';
    } else {
      roleEl.className = 'w-2 h-2 rounded-full bg-terakota';
    }
  }

  if (authLabel) {
    authLabel.textContent = user.role.toUpperCase();
  }
}

// ----------------------------------------------------------------------------
// VIEW 1: AUTHENTIC EDITORIAL LANDING PAGE (PART 2 & PART 9)
// ----------------------------------------------------------------------------
function renderLandingPage(container) {
  container.innerHTML = `
    <!-- HERO ASIMETRIS VINTAGE -->
    <section class="relative overflow-hidden pt-8 pb-16 sm:py-20 border-b border-krem-border">
      <!-- Vintage Tegel Accents Background -->
      <div class="absolute inset-0 opacity-[0.03] bg-tegel pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Sisi Kiri: Headline Editorial Fraunces & Tagline Hangat -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center space-x-2 bg-olive-50 border border-olive-200 px-3.5 py-1.5 rounded-full text-olive-700 text-xs font-bold tracking-wide">
              <span class="w-2 h-2 rounded-full bg-sage animate-ping"></span>
              <span>Buka Setiap Hari: 07:00 – 23:00 WIB</span>
              <span class="text-cokelat-subtle">• Garut, Jawa Barat</span>
            </div>

            <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl text-cokelat leading-[1.15] font-bold">
              Sejauh apapun pergi, <span class="text-terakota italic">rumah</span> tempatnya pulang.
            </h1>

            <p class="text-base sm:text-lg text-cokelat-muted leading-relaxed font-sans max-w-2xl">
              Rumah Tamah Bumi Upi adalah tempat singgah bernuansa rumah nenek di Garut. Menikmati masakan Sunda prasmanan yang gurih, teh tubruk melati hangat, dan suasana kekeluargaan yang tak pernah lekang oleh waktu.
            </p>

            <!-- Aksi CTA Hangat -->
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <button onclick="navigateTo('customer')" class="bg-terakota hover:bg-terakota-hover text-white text-sm sm:text-base font-bold px-6 py-3.5 rounded-vintage shadow-warm transition flex items-center space-x-2">
                <span>Daftar jadi Keluarga Bumi</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
              <a href="#menu" onclick="navigateTo('landing', 'menu')" class="bg-krem-surface hover:bg-white text-cokelat border border-krem-border font-bold text-sm sm:text-base px-6 py-3.5 rounded-vintage transition flex items-center space-x-2">
                <i data-lucide="utensils" class="w-4 h-4 text-mustard-dark"></i>
                <span>Lihat Buku Menu</span>
              </a>
            </div>

            <!-- Catatan Tulisan Tangan Caveat -->
            <div class="flex items-center space-x-3 text-cokelat-subtle pt-2">
              <i data-lucide="heart" class="w-4 h-4 text-terakota fill-terakota/20"></i>
              <span class="font-caveat text-xl text-cokelat">"Nasi liwetnya wangi, sambal terasinya nagih, suasananya serasa mudik."</span>
            </div>
          </div>

          <!-- Sisi Kanan: Foto Placeholder Asimetris dengan Caption Tulisan Tangan -->
          <div class="lg:col-span-5 relative">
            <div class="relative mx-auto max-w-md">
              
              <!-- Background Tegel Frame -->
              <div class="absolute -inset-3 bg-olive/10 rounded-3xl transform rotate-2"></div>
              
              <!-- Kartu Foto Rasio 4:5 -->
              <div class="relative bg-krem-surface p-4 rounded-2xl shadow-warm-lg border border-krem-border">
                <div class="aspect-[4/5] overflow-hidden rounded-xl bg-krem-dark relative group">
                  <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80" alt="Suasana Rumah Tamah Bumi Upi" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <span class="text-white text-xs bg-black/40 backdrop-blur px-2.5 py-1 rounded-md font-mono">
                      // TODO: ganti dengan foto asli fasad Bumi Upi Garut
                    </span>
                  </div>
                </div>

                <!-- Caption Tulisan Tangan Caveat -->
                <div class="pt-3 pb-1 flex items-center justify-between text-cokelat">
                  <div>
                    <p class="font-caveat text-2xl text-cokelat font-bold">Bale Utama di Kala Senja</p>
                    <p class="text-[11px] text-cokelat-subtle">Kusen krepyak biru tua & lantai tegel Kunci 1930-an</p>
                  </div>
                  <div class="w-9 h-9 rounded-full bg-olive text-white flex items-center justify-center font-serif text-xs font-bold shadow">
                    BU
                  </div>
                </div>
              </div>

              <!-- Lencana Mengambang: Garut Barat -->
              <div class="absolute -bottom-5 -left-4 bg-mustard text-cokelat px-4 py-2 rounded-vintage shadow-warm border border-white font-bold text-xs flex items-center space-x-2">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-terakota"></i>
                <span>Samarang, Garut</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- SECTION 2: CERITA BUMI (NARASI RUMAH NENEK) -->
    <section id="cerita" class="py-16 sm:py-20 border-b border-krem-border bg-krem-surface">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-4 mb-12">
          <span class="text-xs font-bold uppercase tracking-widest text-mustard-dark">Cerita Dari Dapur</span>
          <h2 class="font-serif text-3xl sm:text-4xl text-cokelat font-bold">Kenapa Bernama Rumah Tamah?</h2>
          <p class="font-caveat text-xl text-terakota">// Catatan konsep: disajikan sebagai konsep nostalgia, bukan klaim data internal tidak terverifikasi.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-krem p-6 rounded-vintage border border-krem-border space-y-3">
            <div class="w-12 h-12 rounded-xl bg-olive text-white flex items-center justify-center">
              <i data-lucide="home" class="w-6 h-6"></i>
            </div>
            <h3 class="font-serif font-bold text-lg text-cokelat">Tempat Singgah yang Ramah</h3>
            <p class="text-xs text-cokelat-muted leading-relaxed">
              Bumi Upi dibangun dengan cita-cita sederhana: menghadirkan kembali rasa tenang saat bertamu ke rumah nenek di Priangan Timur. Tidak terburu-buru, tanpa basa-basi kaku.
            </p>
          </div>

          <div class="bg-krem p-6 rounded-vintage border border-krem-border space-y-3">
            <div class="w-12 h-12 rounded-xl bg-terakota text-white flex items-center justify-center">
              <i data-lucide="soup" class="w-6 h-6"></i>
            </div>
            <h3 class="font-serif font-bold text-lg text-cokelat">Rempah Otentik Pasundan</h3>
            <p class="text-xs text-cokelat-muted leading-relaxed">
              Bunga kecombrang segar, daun kemangi petik sendiri, dan sambal terasi dadak diuleg langsung di cobek batu saat dipesan. Rasa yang selalu membawa ingatan pulang.
            </p>
          </div>

          <div class="bg-krem p-6 rounded-vintage border border-krem-border space-y-3">
            <div class="w-12 h-12 rounded-xl bg-mustard text-cokelat flex items-center justify-center">
              <i data-lucide="users" class="w-6 h-6"></i>
            </div>
            <h3 class="font-serif font-bold text-lg text-cokelat">Keluarga Bumi</h3>
            <p class="text-xs text-cokelat-muted leading-relaxed">
              Setiap tamu yang datang bukan sekadar angka transaksi. Lewat kartu digital ini, kami mengingat selera Anda, merayakan hari lahir Anda, dan menyiapkan tempat favorit Anda.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3: MENU ANDALAN (SEPERTI HALAMAN BUKU MENU LAMA) -->
    <section id="menu" class="py-16 sm:py-20 border-b border-krem-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div class="space-y-3">
            <span class="text-xs font-bold uppercase tracking-widest text-terakota">Resep Warisan Nenek</span>
            <h2 class="font-serif text-3xl sm:text-4xl text-cokelat font-bold">Hidangan Andalan Rumah Bumi</h2>
            <p class="text-xs text-cokelat-subtle font-mono">// TODO: verifikasi harga persis dengan daftar menu fisik terbaru Bumi Upi Garut</p>
          </div>
          <div class="mt-4 md:mt-0 flex items-center space-x-2">
            <span class="text-xs font-bold text-cokelat bg-mustard/20 px-3 py-1.5 rounded-full border border-mustard/30">
              Prasmanan & Masakan Segar
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${MENU_ITEMS.slice(0, 8).map(m => `
            <div class="bg-krem-surface rounded-card-vintage p-4 border border-krem-border shadow-sm hover:shadow-warm transition group flex flex-col justify-between">
              <div>
                <div class="aspect-[4/3] rounded-lg overflow-hidden bg-krem-dark mb-3 relative">
                  <img src="${m.img}" alt="${m.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                  <span class="absolute top-2 right-2 bg-olive text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    ${m.cat}
                  </span>
                </div>
                <h3 class="font-serif font-bold text-base text-cokelat group-hover:text-terakota transition">${m.name}</h3>
                <p class="text-xs text-cokelat-muted mt-1 leading-relaxed line-clamp-2">${m.desc}</p>
              </div>
              <div class="pt-4 border-t border-krem-border mt-3 flex items-center justify-between">
                <span class="font-serif font-bold text-base text-terakota">Rp ${new Intl.NumberFormat('id-ID').format(m.price)}</span>
                <button onclick="quickOrderPOS('${m.id}')" class="text-xs bg-olive hover:bg-olive-600 text-white font-bold px-3 py-1.5 rounded-md transition flex items-center space-x-1">
                  <span>Pesan</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- SECTION 4: PROGRAM KELUARGA BUMI (INTERAKTIF CARD & 3 LANGKAH) -->
    <section id="keluarga-bumi" class="py-16 sm:py-20 border-b border-krem-border bg-olive text-krem">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div class="lg:col-span-6 space-y-6">
            <div class="inline-flex items-center space-x-2 bg-olive-700 border border-mustard/40 px-3 py-1 rounded-full text-mustard text-xs font-bold">
              <span>Program Loyalitas CRM</span>
            </div>
            
            <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Makin sering pulang, makin dekat jadi <span class="text-mustard">Keluarga</span>.
            </h2>

            <p class="text-sm sm:text-base text-krem/80 leading-relaxed font-sans">
              "Sejauh apapun pergi, poinmu tetap menunggu di rumah." Kami tidak menerapkan sistem poin kadaluwarsa yang terburu-buru. Kumpulkan poin tiap makan, nikmati traktiran ulang tahun, dan dapatkan tempat terbaik saat nobar Persib.
            </p>

            <!-- 3 Langkah Sederhana -->
            <div class="space-y-4 pt-2">
              <div class="flex items-start space-x-3">
                <span class="w-7 h-7 rounded-full bg-mustard text-cokelat font-serif font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <div>
                  <h4 class="font-bold text-sm text-white">Daftar Jadi Tamu</h4>
                  <p class="text-xs text-krem/70">Cukup 30 detik via web, dapatkan kartu digital langsung dan voucher Rp 15.000.</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <span class="w-7 h-7 rounded-full bg-mustard text-cokelat font-serif font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <div>
                  <h4 class="font-bold text-sm text-white">Kumpulkan Poin Tiap Makan</h4>
                  <p class="text-xs text-krem/70">Setiap belanja Rp 10.000, dapatkan 1 Poin Bumi. Scan QR di meja kasir saat bayar.</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <span class="w-7 h-7 rounded-full bg-mustard text-cokelat font-serif font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
                <div>
                  <h4 class="font-bold text-sm text-white">Naik Tingkat & Tukar Traktiran</h4>
                  <p class="text-xs text-krem/70">Tamu → Sahabat (100 poin) → Keluarga (300 poin). Diskon tanpa batas & prioritas nobar.</p>
                </div>
              </div>
            </div>

            <div class="pt-4">
              <button onclick="navigateTo('customer')" class="bg-terakota hover:bg-terakota-hover text-white text-sm font-bold px-6 py-3 rounded-vintage shadow transition">
                Buka Kartu Member Saya
              </button>
            </div>
          </div>

          <!-- KARTU MEMBER DIGITAL INTERAKTIF DENGAN TILT HALUS -->
          <div class="lg:col-span-6 flex justify-center">
            <div class="w-full max-w-sm bg-krem-surface text-cokelat p-6 rounded-2xl shadow-2xl border-2 border-mustard/60 relative overflow-hidden transform hover:-rotate-1 hover:scale-102 transition duration-300">
              
              <!-- Tegel Background Pattern -->
              <div class="absolute inset-0 bg-tegel opacity-10 pointer-events-none"></div>

              <!-- Header Kartu -->
              <div class="flex items-start justify-between pb-4 border-b border-krem-border relative z-10">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-cokelat-subtle">Kartu Kerabat Bumi</span>
                  <h3 class="font-serif text-2xl font-bold text-olive">Bumi Upi</h3>
                </div>
                <div class="text-right">
                  <span class="bg-mustard text-cokelat px-2.5 py-1 rounded-full font-bold text-xs shadow-sm">
                    ⭐ Tier Sahabat
                  </span>
                </div>
              </div>

              <!-- Identitas Pemilik -->
              <div class="py-6 space-y-4 relative z-10">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-full bg-olive text-white flex items-center justify-center font-serif text-lg font-bold">
                    DK
                  </div>
                  <div>
                    <h4 class="font-bold text-base text-cokelat">Dimas Kurniawan</h4>
                    <p class="text-xs text-cokelat-subtle">0812-3456-7890 • Terverifikasi</p>
                  </div>
                </div>

                <!-- Saldo Poin & Progress -->
                <div class="bg-krem p-3.5 rounded-xl border border-krem-border space-y-2">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-cokelat-subtle">Saldo Poin Bumi:</span>
                    <span class="font-serif font-bold text-lg text-terakota">142 Poin</span>
                  </div>
                  <!-- Progress Bar -->
                  <div class="w-full bg-krem-dark h-2 rounded-full overflow-hidden">
                    <div class="bg-mustard h-full rounded-full" style="width: 71%"></div>
                  </div>
                  <div class="flex justify-between items-center text-[10px] text-cokelat-subtle">
                    <span>Sahabat (100 Poin)</span>
                    <span class="font-bold text-olive">58 Poin lagi ke Keluarga</span>
                  </div>
                </div>

                <!-- QR Code Box -->
                <div class="bg-white p-3 rounded-xl border border-krem-border text-center shadow-inner space-y-1">
                  <div class="font-mono text-xs font-bold tracking-widest text-cokelat">BUMI-CUST-8899</div>
                  <div class="text-[10px] text-cokelat-subtle">Tunjukkan QR ini ke kasir saat memesan</div>
                </div>
              </div>

              <!-- Footer Kartu -->
              <div class="pt-3 border-t border-krem-border flex items-center justify-between text-[11px] text-cokelat-subtle relative z-10">
                <span class="font-caveat text-base text-cokelat">"Hatur nuhun parantos sumping."</span>
                <span class="font-mono text-[10px]">WIB</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- SECTION 5: EVENT & NOBAR PERSIB -->
    <section id="event" class="py-16 sm:py-20 border-b border-krem-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-3 mb-12">
          <span class="text-xs font-bold uppercase tracking-widest text-terakota">Suasana Guyub & Rame</span>
          <h2 class="font-serif text-3xl sm:text-4xl text-cokelat font-bold">Event & Nonton Bareng</h2>
          <p class="text-sm text-cokelat-muted max-w-xl mx-auto">Dari nobar pertandingan Persib di layar lebar Bale Utama sampai malam musik keroncong nostalgia.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${EVENTS.map(evt => `
            <div class="bg-krem-surface p-6 rounded-vintage border border-krem-border shadow-sm hover:shadow-warm transition space-y-4 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="bg-olive/15 text-olive text-xs font-bold px-2.5 py-1 rounded-md">
                    ${evt.area}
                  </span>
                  <span class="text-xs text-cokelat-subtle">${evt.current}/${evt.max} Kursi</span>
                </div>
                <h3 class="font-serif font-bold text-xl text-cokelat leading-snug">${evt.title}</h3>
                <p class="text-xs text-cokelat-muted leading-relaxed">${evt.desc}</p>
                <div class="pt-2 text-xs font-bold text-terakota flex items-center space-x-2">
                  <i data-lucide="calendar" class="w-4 h-4"></i>
                  <span>${evt.date} • ${evt.time}</span>
                </div>
                ${evt.vcr ? `
                  <div class="bg-mustard/20 border border-mustard/30 text-cokelat px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5">
                    <i data-lucide="ticket" class="w-3.5 h-3.5 text-mustard-dark"></i>
                    <span>${evt.vcr}</span>
                  </div>
                ` : ''}
              </div>
              <button onclick="rsvpEvent('${evt.id}')" class="w-full bg-olive hover:bg-olive-600 text-white text-xs font-bold py-2.5 rounded-lg transition text-center">
                Reservasi Kursi Nobar
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- SECTION 6: TESTIMONI HANGAT -->
    <section class="py-16 sm:py-20 border-b border-krem-border bg-krem-surface">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-mustard-dark">Kesan Para Tamu</span>
          <h2 class="font-serif text-3xl sm:text-4xl text-cokelat font-bold mt-2">Suara dari Mereka yang Pernah Singgah</h2>
          <p class="text-xs text-cokelat-subtle font-mono mt-1">// TODO: ganti dengan testimoni asli pelanggan Rumah Tamah Bumi Upi</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div class="bg-krem p-5 rounded-vintage border border-krem-border space-y-3">
            <div class="flex text-amber-500 text-xs">★★★★★</div>
            <p class="text-xs text-cokelat leading-relaxed font-sans">
              "Nasi liwetnya luar biasa. Tempatnya asri, anak-anak senang lari-larian di halaman rumput. Pelayanannya sangat ramah seperti di rumah sendiri."
            </p>
            <p class="font-caveat text-lg text-terakota font-bold">— Teh Santi & Keluarga, Bandung</p>
          </div>

          <div class="bg-krem p-5 rounded-vintage border border-krem-border space-y-3">
            <div class="flex text-amber-500 text-xs">★★★★★</div>
            <p class="text-xs text-cokelat leading-relaxed font-sans">
              "Nobar Persib di sini seru banget! Tempatnya luas, layar proyektor jernih, cemilannya banyak. Ditambah dapat diskon kartu member 20%!"
            </p>
            <p class="font-caveat text-lg text-terakota font-bold">— Kang Ridwan, Bobotoh Garut</p>
          </div>

          <div class="bg-krem p-5 rounded-vintage border border-krem-border space-y-3">
            <div class="flex text-amber-500 text-xs">★★★★★</div>
            <p class="text-xs text-cokelat leading-relaxed font-sans">
              "Es cokelat klasik plus roti sobeknya jadi menu wajib kalau pulang kerja. Bot Telegramnya juga praktis banget buat cek sisa poin."
            </p>
            <p class="font-caveat text-lg text-terakota font-bold">— Dadan Hermawan, Pekerja Garut</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 7: LOKASI & JAM OPERASIONAL -->
    <section id="lokasi" class="py-16 sm:py-20 border-b border-krem-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <span class="text-xs font-bold uppercase tracking-widest text-terakota">Alamat & Jam Buka</span>
            <h2 class="font-serif text-3xl sm:text-4xl text-cokelat font-bold leading-tight">
              Pintu Rumah Kami Selalu Terbuka Untuk Anda
            </h2>
            <p class="text-xs text-cokelat-subtle font-mono">// TODO: isi alamat resmi persis Rumah Tamah Bumi Upi Garut</p>
            
            <div class="space-y-4 text-sm text-cokelat">
              <div class="flex items-start space-x-3">
                <i data-lucide="map-pin" class="w-5 h-5 text-terakota flex-shrink-0 mt-0.5"></i>
                <div>
                  <strong class="block text-base font-serif">Alamat Rumah Tamah:</strong>
                  <span>Kawasan Samarang, Kabupaten Garut, Jawa Barat 44161</span>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <i data-lucide="clock" class="w-5 h-5 text-olive flex-shrink-0 mt-0.5"></i>
                <div>
                  <strong class="block text-base font-serif">Jam Operasional:</strong>
                  <span>Buka Setiap Hari: 07:00 – 23:00 WIB</span>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <i data-lucide="phone" class="w-5 h-5 text-mustard-dark flex-shrink-0 mt-0.5"></i>
                <div>
                  <strong class="block text-base font-serif">WhatsApp Reservasi:</strong>
                  <span>+62 812-2334-4550 (Teh Upi)</span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-4 pt-2">
              <a href="https://wa.me/6281223344550" target="_blank" class="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-3 rounded-xl transition flex items-center space-x-2">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
                <span>Chat WhatsApp Reservasi</span>
              </a>
              <button onclick="navigateTo('customer')" class="bg-krem-surface border border-krem-border hover:border-olive text-cokelat text-xs font-bold px-5 py-3 rounded-xl transition">
                Reservasi via Akun Member
              </button>
            </div>
          </div>

          <!-- Peta Garut Placeholder Kreatif -->
          <div class="bg-krem-surface p-6 rounded-vintage border border-krem-border shadow-warm text-center space-y-4">
            <div class="aspect-video rounded-xl bg-krem-dark flex flex-col items-center justify-center p-6 border border-krem-border">
              <i data-lucide="map" class="w-12 h-12 text-olive mb-2"></i>
              <p class="font-serif font-bold text-lg text-cokelat">Peta Lokasi Bumi Upi Garut</p>
              <p class="text-xs text-cokelat-subtle">Berada di jalur sejuk Samarang arah Kamojang</p>
            </div>
            <p class="font-caveat text-xl text-terakota">"Ada tempat parkir luas untuk mobil keluarga dan motor."</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 8: 7+ FAQ ACCORDION LENGKAP -->
    <section id="faq" class="py-16 sm:py-20 border-b border-krem-border bg-krem-surface">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-3 mb-12">
          <span class="text-xs font-bold uppercase tracking-widest text-mustard-dark">Pertanyaan Umum</span>
          <h2 class="font-serif text-3xl sm:text-4xl text-cokelat font-bold">Semua yang Perlu Anda Ketahui</h2>
        </div>

        <div class="space-y-3">
          ${renderFAQItem(1, 'Bagaimana cara mendaftar jadi anggota Keluarga Bumi?', 'Anda cukup membuka aplikasi web Bumi Upi di peramban HP, tekan tombol "Daftar", dan masukkan nama serta nomor HP. Kartu member digital dengan kode QR unik Anda akan langsung diterbitkan dalam 30 detik beserta voucher selamat datang Rp 15.000.')}
          ${renderFAQItem(2, 'Apakah poin loyalitas memiliki masa kedaluwarsa?', 'Tidak! Di Bumi Upi, kami memegang teguh tagline kami: "Sejauh apapun pergi, rumah tempatnya pulang." Poin Anda tetap aman dan menunggu Anda kembali kapan saja Anda mampir ke Garut.')}
          ${renderFAQItem(3, 'Bagaimana cara menukarkan voucher di meja kasir?', 'Cukup buka tab "Voucher" di aplikasi member Anda, pilih voucher aktif, dan tunjukkan kode kupon atau QR kepada kasir kami sebelum proses pembayaran selesai.')}
          ${renderFAQItem(4, 'Bagaimana cara menghubungkan akun dengan Bot Telegram?', 'Di menu "Profil" aplikasi web, tekan tombol "Hubungkan Telegram". Anda akan diarahkan ke t.me/BumiUpiBot dengan token sekali pakai. Tekan "Bagikan Kontak" agar nomor HP Anda terverifikasi secara resmi.')}
          ${renderFAQItem(5, 'Apakah saya bisa melakukan reservasi meja untuk rombongan besar?', 'Tentu bisa! Kami memiliki Bale Utama dan Halaman Rumput yang sanggup menampung hingga 80 orang. Anda dapat melakukan reservasi lewat form di aplikasi atau langsung menghubungi admin WhatsApp.')}
          ${renderFAQItem(6, 'Bagaimana keamanan data pribadi saya dijaga?', 'Seluruh data nomor HP dan riwayat transaksi dilindungi oleh enkripsi Supabase Row Level Security (RLS). Hanya Anda dan staf berwenang yang dapat melihat data Anda.')}
          ${renderFAQItem(7, 'Bagaimana cara berhenti menerima pesan siaran promosi?', 'Anda memegang kendali penuh. Anda dapat mematikan pesan promo kapan saja lewat toggle di halaman Profil, atau ketik /berhenti langsung di Telegram Bot kami.')}
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-olive-900 text-krem/80 py-12 border-t border-olive-800 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-3">
          <img src="/brand/Logo_bumi_upi.svg" alt="Bumi Upi" class="h-10 w-auto">
          <p class="text-krem/70 text-xs leading-relaxed">
            Sejauh apapun pergi, rumah tempatnya pulang. Restoran dan rumah tamah bergaya nostalgia di Garut, Jawa Barat.
          </p>
        </div>
        <div>
          <h4 class="font-serif font-bold text-sm text-mustard mb-3">Tautan Cepat</h4>
          <ul class="space-y-2">
            <li><a href="#menu" onclick="navigateTo('landing', 'menu')" class="hover:text-white transition">Buku Menu</a></li>
            <li><a href="#event" onclick="navigateTo('landing', 'event')" class="hover:text-white transition">Event & Nobar</a></li>
            <li><a href="#keluarga-bumi" onclick="navigateTo('landing', 'keluarga-bumi')" class="hover:text-white transition">Kartu Member</a></li>
            <li><a href="#lokasi" onclick="navigateTo('landing', 'lokasi')" class="hover:text-white transition">Lokasi & Jam Buka</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-serif font-bold text-sm text-mustard mb-3">Sistem CRM & Staf</h4>
          <ul class="space-y-2">
            <li><button onclick="navigateTo('admin-pos')" class="hover:text-white transition">Kasir POS Tablet</button></li>
            <li><button onclick="navigateTo('admin-dashboard')" class="hover:text-white transition">Admin Dashboard</button></li>
            <li><button onclick="navigateTo('admin-rfm')" class="hover:text-white transition">Segmentasi RFM</button></li>
            <li><button onclick="navigateTo('admin-peta')" class="hover:text-white transition">Peta Konsep CRM</button></li>
          </ul>
        </div>
        <div class="space-y-3">
          <h4 class="font-serif font-bold text-sm text-mustard">Pemberitahuan Akademik</h4>
          <p class="text-[11px] text-krem/60 leading-relaxed">
            Aplikasi ini dibangun untuk pemenuhan tugas studi kasus mata kuliah Customer Relationship Management (CRM). Bukan situs resmi Rumah Tamah Bumi Upi.
          </p>
          <div class="font-mono text-[10px] text-mustard">
            WIB (Asia/Jakarta, UTC+7) • 2026
          </div>
        </div>
      </div>
    </footer>
  `;
}

function renderFAQItem(id, q, a) {
  return `
    <div class="bg-krem border border-krem-border rounded-xl overflow-hidden">
      <button onclick="toggleFAQ(${id})" class="w-full text-left px-5 py-4 font-serif font-bold text-sm sm:text-base text-cokelat flex items-center justify-between hover:bg-krem-surface transition">
        <span>${id}. ${q}</span>
        <i id="faq-icon-${id}" data-lucide="chevron-down" class="w-4 h-4 text-terakota flex-shrink-0 transition-transform"></i>
      </button>
      <div id="faq-ans-${id}" class="hidden px-5 pb-4 text-xs sm:text-sm text-cokelat-muted leading-relaxed font-sans border-t border-krem-border/40 pt-3">
        ${a}
      </div>
    </div>
  `;
}

function toggleFAQ(id) {
  const ans = document.getElementById(`faq-ans-${id}`);
  const icon = document.getElementById(`faq-icon-${id}`);
  if (ans && icon) {
    ans.classList.toggle('hidden');
    icon.classList.toggle('rotate-180');
  }
}

// ----------------------------------------------------------------------------
// VIEW 2: AUTH PAGE (SPLIT LAYOUT WITH DEMO ACCOUNTS AUTOFILL)
// ----------------------------------------------------------------------------
function renderAuthPage(container) {
  container.innerHTML = `
    <div class="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-4xl bg-krem-surface rounded-2xl shadow-warm-lg border border-krem-border overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        <!-- Sisi Kiri: Panel Branding Hangat (Desktop Only) -->
        <div class="hidden lg:flex lg:col-span-5 bg-olive text-krem p-8 flex-col justify-between relative overflow-hidden">
          <div class="absolute inset-0 bg-tegel opacity-10 pointer-events-none"></div>
          
          <div class="space-y-4 relative z-10">
            <img src="/brand/Logo_bumi_upi.svg" alt="Logo Bumi Upi" class="h-11 w-auto">
            <h2 class="font-serif text-2xl font-bold leading-tight">Rumah Tempatnya Pulang</h2>
            <p class="text-xs text-krem/80 leading-relaxed font-sans">
              Nikmati kenyamanan bertransaksi, akumulasi poin loyalitas keluarga bumi, dan klaim promo eksklusif masakan Sunda otentik.
            </p>
          </div>

          <div class="space-y-2 relative z-10 pt-8 border-t border-olive-400/30">
            <p class="font-caveat text-xl text-mustard">"Wilujeng sumping, mugia sing genah betah."</p>
            <p class="text-[10px] text-krem/60">Studi Kasus Mata Kuliah CRM • 2026</p>
          </div>
        </div>

        <!-- Sisi Kanan: Form Login / Register & Demo Autofill -->
        <div class="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-krem-border">
              <div>
                <h3 class="font-serif text-2xl font-bold text-cokelat" id="auth-title">Masuk ke Akun</h3>
                <p class="text-xs text-cokelat-subtle">Pilih akun simulasi di bawah untuk mencoba langsung.</p>
              </div>
              <div class="flex rounded-lg bg-krem p-1 border border-krem-border text-xs font-bold">
                <button id="auth-tab-login" onclick="switchAuthMode('login')" class="px-3 py-1.5 rounded-md bg-terakota text-white transition">Masuk</button>
                <button id="auth-tab-register" onclick="switchAuthMode('register')" class="px-3 py-1.5 rounded-md text-cokelat hover:text-terakota transition">Daftar</button>
              </div>
            </div>

            <!-- DEMO ACCOUNT SELECTOR PRESETS (SANGAT MEMUDAHKAN PENGUJIAN) -->
            <div class="mt-4 p-3 bg-krem rounded-xl border border-krem-border space-y-2">
              <span class="text-[11px] font-bold text-cokelat-subtle uppercase tracking-wider block">⚡ Tombol Cepat Akun Demo:</span>
              <div class="grid grid-cols-3 gap-2 text-xs">
                <button onclick="fillDemoAccount('admin')" class="p-2 rounded-lg bg-olive text-white font-bold hover:bg-olive-600 transition flex flex-col items-center">
                  <span>Pemilik/Admin</span>
                  <span class="text-[9px] font-normal opacity-80">Full Dashboard</span>
                </button>
                <button onclick="fillDemoAccount('kasir')" class="p-2 rounded-lg bg-mustard text-cokelat font-bold hover:bg-mustard-light transition flex flex-col items-center">
                  <span>Kasir POS</span>
                  <span class="text-[9px] font-normal opacity-80">Input Meja</span>
                </button>
                <button onclick="fillDemoAccount('customer')" class="p-2 rounded-lg bg-terakota text-white font-bold hover:bg-terakota-hover transition flex flex-col items-center">
                  <span>Pelanggan</span>
                  <span class="text-[9px] font-normal opacity-80">Kartu Member</span>
                </button>
              </div>
            </div>

            <!-- Form Fields -->
            <form id="auth-form" onsubmit="handleAuthSubmit(event)" class="mt-6 space-y-4">
              <div id="auth-name-container" class="hidden">
                <label class="block text-xs font-bold text-cokelat mb-1">Nama Lengkap</label>
                <input id="auth-name" type="text" placeholder="Contoh: Dimas Kurniawan" class="w-full text-xs px-3.5 py-2.5 rounded-lg border border-krem-border bg-white text-cokelat focus:outline-none focus:border-terakota">
              </div>

              <div>
                <label class="block text-xs font-bold text-cokelat mb-1">Alamat Email</label>
                <input id="auth-email" type="email" required value="customer@bumiupi.id" class="w-full text-xs px-3.5 py-2.5 rounded-lg border border-krem-border bg-white text-cokelat focus:outline-none focus:border-terakota">
              </div>

              <div>
                <label class="block text-xs font-bold text-cokelat mb-1">Kata Sandi</label>
                <input id="auth-password" type="password" required value="tamu2026" class="w-full text-xs px-3.5 py-2.5 rounded-lg border border-krem-border bg-white text-cokelat focus:outline-none focus:border-terakota">
              </div>

              <div id="auth-phone-container" class="hidden">
                <label class="block text-xs font-bold text-cokelat mb-1">Nomor WhatsApp / HP</label>
                <input id="auth-phone" type="text" placeholder="081234567890" class="w-full text-xs px-3.5 py-2.5 rounded-lg border border-krem-border bg-white text-cokelat focus:outline-none focus:border-terakota">
              </div>

              <button type="submit" class="w-full bg-terakota hover:bg-terakota-hover text-white font-bold text-sm py-3 rounded-xl shadow transition mt-2">
                <span id="auth-submit-label">Masuk ke Sistem</span>
              </button>
            </form>
          </div>

          <div class="text-center text-[11px] text-cokelat-subtle pt-2">
            Dengan masuk, Anda menyetujui program keanggotaan Keluarga Bumi Upi.
          </div>
        </div>

      </div>
    </div>
  `;
}

function switchAuthMode(mode) {
  const isReg = mode === 'register';
  document.getElementById('auth-title').textContent = isReg ? 'Daftar Tamu Baru' : 'Masuk ke Akun';
  document.getElementById('auth-submit-label').textContent = isReg ? 'Daftar & Terbitkan Kartu' : 'Masuk ke Sistem';
  document.getElementById('auth-name-container').classList.toggle('hidden', !isReg);
  document.getElementById('auth-phone-container').classList.toggle('hidden', !isReg);

  document.getElementById('auth-tab-login').className = isReg
    ? 'px-3 py-1.5 rounded-md text-cokelat hover:text-terakota transition'
    : 'px-3 py-1.5 rounded-md bg-terakota text-white transition';

  document.getElementById('auth-tab-register').className = isReg
    ? 'px-3 py-1.5 rounded-md bg-terakota text-white transition'
    : 'px-3 py-1.5 rounded-md text-cokelat hover:text-terakota transition';
}

function fillDemoAccount(role) {
  if (role === 'admin') {
    document.getElementById('auth-email').value = 'admin@bumiupi.id';
    document.getElementById('auth-password').value = 'bumiupi2026';
    switchAuthMode('login');
  } else if (role === 'kasir') {
    document.getElementById('auth-email').value = 'kasir@bumiupi.id';
    document.getElementById('auth-password').value = 'kasir2026';
    switchAuthMode('login');
  } else {
    document.getElementById('auth-email').value = 'customer@bumiupi.id';
    document.getElementById('auth-password').value = 'tamu2026';
    switchAuthMode('login');
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  
  if (email.includes('admin')) {
    STATE.currentUser = CUSTOMERS_DB.find(c => c.role === 'admin') || STATE.currentUser;
    alert('Wilujeng sumping, Teh Upi! Anda masuk sebagai Pemilik/Admin.');
    navigateTo('admin-dashboard');
  } else if (email.includes('kasir')) {
    STATE.currentUser = CUSTOMERS_DB.find(c => c.role === 'kasir') || STATE.currentUser;
    alert('Wilujeng sumping, Kang Asep! Anda masuk sebagai Kasir POS.');
    navigateTo('admin-pos');
  } else {
    STATE.currentUser = CUSTOMERS_DB.find(c => c.role === 'customer') || STATE.currentUser;
    alert(`Wilujeng sumping, Kak ${STATE.currentUser.name}! Kartu member Anda siap digunakan.`);
    navigateTo('customer');
  }
}

// ----------------------------------------------------------------------------
// VIEW 3: CUSTOMER PWA MOBILE-FIRST SHELL (PART 5)
// ----------------------------------------------------------------------------
function renderCustomerPWA(container) {
  container.innerHTML = `
    <div class="max-w-md mx-auto min-h-[85vh] bg-krem-surface border-x border-krem-border pb-24 shadow-warm flex flex-col justify-between">
      
      <!-- Top Mobile App Header -->
      <div class="p-4 bg-white border-b border-krem-border flex items-center justify-between sticky top-9 z-20">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-full bg-olive text-white flex items-center justify-center font-serif font-bold text-xs">
            ${STATE.currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div class="text-[10px] text-cokelat-subtle">Wilujeng Sumping,</div>
            <div class="font-bold text-xs text-cokelat truncate max-w-[150px]">${STATE.currentUser.name}</div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="bg-mustard/20 text-mustard-dark border border-mustard/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ⭐ ${STATE.currentUser.tier}
          </span>
          <button onclick="navigateTo('auth')" title="Ganti Akun" class="text-cokelat-subtle hover:text-terakota p-1">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div id="pwa-tab-content" class="p-4 space-y-4 flex-grow">
        <!-- Injected via switchCustomerTab -->
      </div>

      <!-- Bottom Tab Navigation (Mobile App Standard) -->
      <nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-krem-border grid grid-cols-5 py-2 z-40 text-[10px] font-bold text-cokelat-subtle">
        <button onclick="switchCustomerTab('beranda')" id="pwa-nav-beranda" class="flex flex-col items-center space-y-1 text-terakota">
          <i data-lucide="home" class="w-4 h-4"></i>
          <span>Beranda</span>
        </button>
        <button onclick="switchCustomerTab('kartu')" id="pwa-nav-kartu" class="flex flex-col items-center space-y-1 hover:text-terakota transition">
          <i data-lucide="qr-code" class="w-4 h-4"></i>
          <span>Kartu</span>
        </button>
        <button onclick="switchCustomerTab('voucher')" id="pwa-nav-voucher" class="flex flex-col items-center space-y-1 hover:text-terakota transition">
          <i data-lucide="ticket" class="w-4 h-4"></i>
          <span>Voucher</span>
        </button>
        <button onclick="switchCustomerTab('reservasi')" id="pwa-nav-reservasi" class="flex flex-col items-center space-y-1 hover:text-terakota transition">
          <i data-lucide="calendar" class="w-4 h-4"></i>
          <span>Reservasi</span>
        </button>
        <button onclick="switchCustomerTab('profil')" id="pwa-nav-profil" class="flex flex-col items-center space-y-1 hover:text-terakota transition">
          <i data-lucide="user" class="w-4 h-4"></i>
          <span>Profil</span>
        </button>
      </nav>

    </div>
  `;

  switchCustomerTab(STATE.customerTab || 'beranda');
}

function switchCustomerTab(tab) {
  STATE.customerTab = tab;
  const content = document.getElementById('pwa-tab-content');
  if (!content) return;

  // Update Bottom Nav Active States
  ['beranda', 'kartu', 'voucher', 'reservasi', 'profil'].forEach(t => {
    const el = document.getElementById(`pwa-nav-${t}`);
    if (el) {
      if (t === tab) {
        el.className = 'flex flex-col items-center space-y-1 text-terakota';
      } else {
        el.className = 'flex flex-col items-center space-y-1 text-cokelat-subtle hover:text-terakota transition';
      }
    }
  });

  const u = STATE.currentUser;

  if (tab === 'beranda') {
    content.innerHTML = `
      <!-- Greeting Banner -->
      <div class="bg-krem p-4 rounded-xl border border-krem-border space-y-1">
        <h3 class="font-serif font-bold text-lg text-cokelat">Sampurasun, Kak ${u.name.split(' ')[0]}! 🏡</h3>
        <p class="text-xs text-cokelat-muted">"Sejauh apapun pergi, poinmu tetap menunggu di rumah."</p>
      </div>

      <!-- Quick Digital Card Mini -->
      <div onclick="switchCustomerTab('kartu')" class="bg-olive text-krem p-5 rounded-2xl shadow-warm border border-mustard/40 cursor-pointer relative overflow-hidden group">
        <div class="absolute inset-0 bg-tegel opacity-10"></div>
        <div class="flex justify-between items-start relative z-10">
          <div>
            <span class="text-[10px] text-mustard uppercase font-mono tracking-widest">Keluarga Bumi • Tier ${u.tier}</span>
            <div class="font-serif text-3xl font-bold text-white mt-1">${u.points_balance} <span class="text-sm font-sans font-normal text-krem/70">Poin Aktif</span></div>
          </div>
          <div class="bg-white p-2 rounded-lg shadow">
            <i data-lucide="qr-code" class="w-7 h-7 text-cokelat"></i>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-olive-400/30 flex items-center justify-between text-xs text-krem/80 relative z-10">
          <span>Tap untuk buka kode QR kasir</span>
          <i data-lucide="arrow-right" class="w-4 h-4 text-mustard group-hover:translate-x-1 transition"></i>
        </div>
      </div>

      <!-- Quick Links / Shortcuts -->
      <div class="grid grid-cols-3 gap-2 text-center text-xs">
        <button onclick="switchCustomerTab('voucher')" class="bg-white p-3 rounded-xl border border-krem-border hover:border-terakota transition space-y-1">
          <i data-lucide="ticket" class="w-5 h-5 mx-auto text-terakota"></i>
          <span class="block font-bold text-cokelat">Voucher (2)</span>
        </button>
        <button onclick="switchCustomerTab('reservasi')" class="bg-white p-3 rounded-xl border border-krem-border hover:border-olive transition space-y-1">
          <i data-lucide="calendar" class="w-5 h-5 mx-auto text-olive"></i>
          <span class="block font-bold text-cokelat">Reservasi</span>
        </button>
        <button onclick="toggleUpiChat()" class="bg-white p-3 rounded-xl border border-krem-border hover:border-mustard transition space-y-1">
          <i data-lucide="sparkles" class="w-5 h-5 mx-auto text-mustard-dark"></i>
          <span class="block font-bold text-cokelat">Upi Chat</span>
        </button>
      </div>

      <!-- Active Promos & Events -->
      <div class="space-y-2 pt-2">
        <div class="flex items-center justify-between text-xs font-bold text-cokelat">
          <span>Agenda & Promo Berjalan</span>
          <a href="#event" onclick="switchCustomerTab('voucher')" class="text-terakota text-[11px]">Lihat Semua</a>
        </div>
        
        <div class="bg-white p-3.5 rounded-xl border border-krem-border flex items-start space-x-3">
          <div class="w-10 h-10 rounded-lg bg-mustard/20 text-mustard-dark flex items-center justify-center flex-shrink-0 font-bold">
            ⚽
          </div>
          <div class="flex-grow space-y-0.5">
            <h4 class="font-serif font-bold text-xs text-cokelat">Nobar Persib vs Persija</h4>
            <p class="text-[11px] text-cokelat-subtle">Minggu, 8 Nov • 19.00 WIB di Bale Utama</p>
            <span class="inline-block text-[10px] bg-terakota/15 text-terakota font-bold px-1.5 py-0.5 rounded">Diskon 20% Cemilan</span>
          </div>
        </div>
      </div>
    `;
  } else if (tab === 'kartu') {
    content.innerHTML = `
      <div class="text-center space-y-1 pb-2">
        <h3 class="font-serif font-bold text-lg text-cokelat">Kartu Member Digital</h3>
        <p class="text-xs text-cokelat-subtle">Tunjukkan kode QR ini ke kasir sebelum memesan.</p>
      </div>

      <!-- KARTU MEMBER GUESTBOOK RETRO -->
      <div class="bg-white p-6 rounded-2xl border-2 border-mustard shadow-warm space-y-5 text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-tegel opacity-5 pointer-events-none"></div>

        <div class="flex justify-between items-center text-xs border-b border-krem-border pb-3">
          <span class="font-serif font-bold text-olive">Bumi Upi • Garut</span>
          <span class="bg-mustard text-cokelat font-bold text-[10px] px-2 py-0.5 rounded-full">Level ${u.tier}</span>
        </div>

        <div>
          <h4 class="font-bold text-lg text-cokelat">${u.name}</h4>
          <p class="text-xs text-cokelat-subtle font-mono">${u.phone}</p>
        </div>

        <!-- SIMULASI QR CODE DENGAN MODE HIGH CONTRAST SCAN -->
        <div id="qr-scan-box" class="bg-krem p-5 rounded-2xl border-2 border-dashed border-cokelat-subtle/40 inline-block w-48 h-48 mx-auto flex flex-col items-center justify-center space-y-2">
          <i data-lucide="qr-code" class="w-28 h-28 text-cokelat"></i>
          <span class="font-mono text-[10px] font-bold text-cokelat">${u.qr_code}</span>
        </div>

        <!-- Tombol Terangkan Layar untuk Kasir -->
        <div>
          <button onclick="toggleQRBrightness()" class="bg-krem-dark hover:bg-mustard text-cokelat text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 mx-auto">
            <i data-lucide="sun" class="w-3.5 h-3.5"></i>
            <span id="brightness-label">Terangkan Layar untuk Kasir</span>
          </button>
        </div>

        <div class="pt-3 border-t border-krem-border text-xs flex justify-between text-cokelat-subtle">
          <span>Saldo Poin: <strong class="text-terakota">${u.points_balance}</strong></span>
          <span>Akumulasi: <strong class="text-olive">${u.cumulative_points}</strong></span>
        </div>
      </div>
    `;
  } else if (tab === 'voucher') {
    content.innerHTML = `
      <div class="flex items-center justify-between pb-2">
        <div>
          <h3 class="font-serif font-bold text-lg text-cokelat">Voucher Saya</h3>
          <p class="text-xs text-cokelat-subtle">Kupon potongan & traktiran makan di Bumi Upi.</p>
        </div>
        <button onclick="claimEventVoucher()" class="bg-terakota text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg">
          + Klaim Voucher Event
        </button>
      </div>

      <div class="space-y-3">
        ${VOUCHERS.map(v => `
          <div class="bg-white p-4 rounded-xl border border-krem-border shadow-sm space-y-2">
            <div class="flex items-start justify-between">
              <div>
                <span class="text-[10px] bg-mustard/20 text-mustard-dark font-bold px-2 py-0.5 rounded">
                  ${v.type === 'nominal' ? 'Potongan Belanja' : v.type === 'percent' ? 'Diskon Persen' : 'Traktiran Spesial'}
                </span>
                <h4 class="font-serif font-bold text-sm text-cokelat mt-1">${v.title}</h4>
              </div>
              <span class="font-serif font-bold text-sm text-terakota">${v.disc}</span>
            </div>
            <p class="text-xs text-cokelat-muted">Min. belanja: Rp ${new Intl.NumberFormat('id-ID').format(v.minSpend)} • Berlaku s/d ${v.exp}</p>
            <div class="pt-2 border-t border-krem-border flex items-center justify-between text-xs">
              <span class="font-mono bg-krem px-2 py-1 rounded text-cokelat font-bold">${v.code}-8899</span>
              <button onclick="copyCode('${v.code}-8899')" class="text-olive font-bold hover:underline">Salin Kode</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (tab === 'reservasi') {
    content.innerHTML = `
      <div class="space-y-1 pb-2">
        <h3 class="font-serif font-bold text-lg text-cokelat">Reservasi Meja</h3>
        <p class="text-xs text-cokelat-subtle">Pesan tempat lebih awal untuk keluarga atau nobar.</p>
      </div>

      <form onsubmit="handleCustomerReservation(event)" class="bg-white p-4 rounded-xl border border-krem-border space-y-3 text-xs">
        <div>
          <label class="block font-bold text-cokelat mb-1">Tanggal Kunjungan</label>
          <input id="res-date" type="date" required value="2026-11-08" class="w-full p-2 rounded-lg border border-krem-border bg-krem/30 text-cokelat">
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-bold text-cokelat mb-1">Jam Datang</label>
            <select id="res-time" class="w-full p-2 rounded-lg border border-krem-border bg-krem/30 text-cokelat">
              <option value="12:00">12:00 WIB (Makan Siang)</option>
              <option value="18:30" selected>18:30 WIB (Makan Malam)</option>
              <option value="19:00">19:00 WIB (Nobar Persib)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-cokelat mb-1">Jumlah Orang (Pax)</label>
            <input id="res-pax" type="number" min="1" max="50" value="4" class="w-full p-2 rounded-lg border border-krem-border bg-krem/30 text-cokelat">
          </div>
        </div>
        <div>
          <label class="block font-bold text-cokelat mb-1">Pilihan Area Meja</label>
          <select id="res-area" class="w-full p-2 rounded-lg border border-krem-border bg-krem/30 text-cokelat">
            <option value="Bale Utama">Bale Utama (Dekat Layar Nobar)</option>
            <option value="Teras Jendela Krepyak">Teras Jendela Krepyak (Sejuk & Tenang)</option>
            <option value="Halaman Rumput">Halaman Rumput & Lesehan Kayu</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-cokelat mb-1">Catatan Khusus</label>
          <textarea id="res-notes" rows="2" placeholder="Cth: Meja panjang reuni keluarga, minta dekat colokan..." class="w-full p-2 rounded-lg border border-krem-border bg-krem/30 text-cokelat"></textarea>
        </div>
        <button type="submit" class="w-full bg-terakota hover:bg-terakota-hover text-white font-bold py-2.5 rounded-lg transition">
          Kirim Permintaan Reservasi
        </button>
      </form>

      <!-- Riwayat Reservasi Terkini -->
      <div class="space-y-2 pt-2">
        <h4 class="font-serif font-bold text-xs text-cokelat">Riwayat Reservasi Anda</h4>
        ${RESERVATIONS_DB.filter(r => r.name.includes(u.name.split(' ')[0])).map(r => `
          <div class="bg-white p-3 rounded-lg border border-krem-border text-xs space-y-1">
            <div class="flex justify-between items-center">
              <span class="font-bold text-cokelat">${r.area} (${r.pax} orang)</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full ${r.status === 'dikonfirmasi' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} font-bold">
                ${r.status.toUpperCase()}
              </span>
            </div>
            <p class="text-cokelat-subtle text-[11px]">${r.date} • ${r.time}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (tab === 'profil') {
    content.innerHTML = `
      <div class="text-center space-y-2 pb-2">
        <div class="w-16 h-16 rounded-full bg-olive text-white mx-auto flex items-center justify-center font-serif text-2xl font-bold border-2 border-mustard">
          ${u.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 class="font-serif font-bold text-lg text-cokelat">${u.name}</h3>
          <p class="text-xs text-cokelat-subtle">${u.email}</p>
        </div>
      </div>

      <!-- KONEKSI & VERIFIKASI TELEGRAM (PART 4 MANDATORY) -->
      <div class="bg-white p-4 rounded-xl border border-krem-border space-y-3 text-xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <i data-lucide="send" class="w-5 h-5 text-sky-500"></i>
            <div>
              <strong class="block text-cokelat">Status Verifikasi HP via Telegram</strong>
              <span class="text-[11px] text-cokelat-subtle">
                ${u.is_phone_verified ? '✅ Nomor HP Terverifikasi Aman' : '⚠️ Belum Terhubung ke Bot'}
              </span>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.is_phone_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${u.is_phone_verified ? 'TERVERIFIKASI' : 'BELUM'}
          </span>
        </div>

        <p class="text-[11px] text-cokelat-muted leading-relaxed">
          Verifikasi nomor HP Anda secara gratis via Telegram untuk menerima struk transaksi digital, pengingat voucher, dan info nobar.
        </p>

        <button onclick="toggleBotModal()" class="w-full bg-[#24A1DE] hover:bg-sky-600 text-white font-bold py-2 rounded-lg transition flex items-center justify-center space-x-2">
          <i data-lucide="send" class="w-4 h-4"></i>
          <span>Hubungkan Telegram (Deep Link)</span>
        </button>
      </div>

      <!-- Preferensi & Notifikasi -->
      <div class="bg-white p-4 rounded-xl border border-krem-border space-y-3 text-xs">
        <h4 class="font-serif font-bold text-sm text-cokelat">Preferensi Akun</h4>
        <div class="flex items-center justify-between">
          <div>
            <div class="font-bold text-cokelat">Terima Pesan Promosi & Voucher</div>
            <div class="text-[10px] text-cokelat-subtle">Maksimal 2 pesan per minggu (Hormati Privasi)</div>
          </div>
          <input type="checkbox" ${u.opt_in_promo ? 'checked' : ''} onchange="toggleOptInPromo(this.checked)" class="w-4 h-4 text-terakota rounded border-krem-border">
        </div>

        <div class="pt-2 border-t border-krem-border flex items-center justify-between text-cokelat-subtle text-[11px]">
          <span>Tanggal Lahir (Voucher Ultah):</span>
          <strong>14 Oktober 1998</strong>
        </div>
      </div>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

function toggleQRBrightness() {
  const box = document.getElementById('qr-scan-box');
  const label = document.getElementById('brightness-label');
  if (box && label) {
    if (box.classList.contains('bg-white')) {
      box.className = 'bg-krem p-5 rounded-2xl border-2 border-dashed border-cokelat-subtle/40 inline-block w-48 h-48 mx-auto flex flex-col items-center justify-center space-y-2';
      label.textContent = 'Terangkan Layar untuk Kasir';
    } else {
      box.className = 'bg-white p-5 rounded-2xl border-4 border-amber-400 shadow-2xl inline-block w-52 h-52 mx-auto flex flex-col items-center justify-center space-y-2 scale-105 transition';
      label.textContent = 'Kembalikan Layar Normal';
    }
  }
}

function copyCode(code) {
  navigator.clipboard?.writeText(code);
  alert(`Kode voucher "${code}" berhasil disalin! Tunjukkan ke kasir saat memesan.`);
}

function claimEventVoucher() {
  alert('Voucher Nobar Persib Juara berhasil diklaim ke akun Anda!');
}

function handleCustomerReservation(e) {
  e.preventDefault();
  const date = document.getElementById('res-date').value;
  const time = document.getElementById('res-time').value;
  const pax = document.getElementById('res-pax').value;
  const area = document.getElementById('res-area').value;
  const notes = document.getElementById('res-notes').value;

  RESERVATIONS_DB.unshift({
    id: `res-${Date.now()}`,
    name: STATE.currentUser.name,
    phone: STATE.currentUser.phone,
    date: date,
    time: `${time} WIB`,
    pax: Number(pax),
    area: area,
    status: 'menunggu',
    notes: notes
  });

  alert('Hatur nuhun! Permintaan reservasi berhasil dikirim. Staf kami akan mengonfirmasi via WhatsApp atau Telegram.');
  switchCustomerTab('reservasi');
}

function toggleOptInPromo(checked) {
  STATE.currentUser.opt_in_promo = checked;
  alert(checked ? 'Anda akan menerima maksimal 2 promo terpilih per minggu.' : 'Anda memilih berhenti menerima siaran promosi.');
}

// ----------------------------------------------------------------------------
// VIEW 4: ADMIN / STAFF SHELL & SUB-VIEWS (OLIVE SIDEBAR #3E4F30)
// ----------------------------------------------------------------------------
function renderAdminShell(container, subview) {
  container.innerHTML = `
    <div class="min-h-[85vh] flex flex-col lg:flex-row border-b border-krem-border">
      
      <!-- SIDEBAR HIJAU OLIVE #3E4F30 (PART 2 & PART 6) -->
      <aside class="w-full lg:w-64 bg-olive text-krem flex-shrink-0 flex flex-col justify-between border-r border-olive-700">
        <div class="p-4 space-y-6">
          <!-- Admin Brand Header -->
          <div class="flex items-center space-x-3 pb-4 border-b border-olive-400/20">
            <div class="w-9 h-9 rounded-xl bg-mustard text-cokelat flex items-center justify-center font-serif font-bold text-sm">
              BU
            </div>
            <div>
              <h3 class="font-serif font-bold text-sm text-white tracking-wide">Admin Bumi Upi</h3>
              <p class="text-[10px] text-krem/70">Panel Pemilik & Kasir</p>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="space-y-1 text-xs font-semibold">
            <div class="px-3 py-1 text-[10px] uppercase font-bold text-mustard tracking-wider">Operasional Kasir</div>
            <button onclick="navigateTo('admin-pos')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'pos' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="receipt" class="w-4 h-4"></i>
              <span>Kasir POS (Tablet)</span>
            </button>
            <button onclick="navigateTo('admin-reservasi')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'reservasi' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="calendar" class="w-4 h-4"></i>
              <span>Reservasi Meja</span>
            </button>

            <div class="pt-3 px-3 py-1 text-[10px] uppercase font-bold text-mustard tracking-wider">Analitik & Loyalitas</div>
            <button onclick="navigateTo('admin-dashboard')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'dashboard' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
              <span>Dashboard Ringkasan</span>
            </button>
            <button onclick="navigateTo('admin-pelanggan')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'pelanggan' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="users" class="w-4 h-4"></i>
              <span>Pelanggan (Customer 360)</span>
            </button>
            <button onclick="navigateTo('admin-rfm')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'rfm' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="pie-chart" class="w-4 h-4"></i>
              <span>Segmentasi RFM</span>
            </button>
            <button onclick="navigateTo('admin-clv')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'clv' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="calculator" class="w-4 h-4"></i>
              <span>Estimasi CLV</span>
            </button>
            <button onclick="navigateTo('admin-promo')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'promo' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="ticket" class="w-4 h-4"></i>
              <span>Promo & Voucher</span>
            </button>
            <button onclick="navigateTo('admin-kampanye')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'kampanye' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="megaphone" class="w-4 h-4"></i>
              <span>Kampanye & Broadcast</span>
            </button>
            <button onclick="navigateTo('admin-feedback')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'feedback' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="message-square" class="w-4 h-4"></i>
              <span>Feedback & Keluhan</span>
            </button>

            <div class="pt-3 px-3 py-1 text-[10px] uppercase font-bold text-mustard tracking-wider">Sistem & Akademik</div>
            <button onclick="navigateTo('admin-peta')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'peta' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="map" class="w-4 h-4"></i>
              <span>Peta Konsep CRM</span>
            </button>
            <button onclick="navigateTo('admin-laporan')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'laporan' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
              <span>Laporan & Export</span>
            </button>
            <button onclick="navigateTo('admin-pengaturan')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'pengaturan' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="settings" class="w-4 h-4"></i>
              <span>Pengaturan & AI</span>
            </button>
            <button onclick="navigateTo('admin-audit')" class="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 transition ${subview === 'audit' ? 'bg-terakota text-white font-bold' : 'hover:bg-olive-600 text-krem/90'}">
              <i data-lucide="shield-check" class="w-4 h-4"></i>
              <span>Audit Log</span>
            </button>
          </nav>
        </div>

        <div class="p-4 bg-olive-800 text-[11px] text-krem/70 flex items-center justify-between border-t border-olive-700">
          <div>
            <strong class="block text-white">Bumi Upi Garut</strong>
            <span>WIB (Asia/Jakarta)</span>
          </div>
          <button onclick="navigateTo('auth')" title="Keluar" class="text-mustard hover:text-white p-1">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT VIEWPORT -->
      <section id="admin-main-viewport" class="flex-grow p-4 sm:p-6 lg:p-8 bg-krem/40 overflow-y-auto">
        <!-- Rendered dynamically -->
      </section>

    </div>
  `;

  const mainView = document.getElementById('admin-main-viewport');
  if (!mainView) return;

  switch (subview) {
    case 'pos':
      renderAdminPOS(mainView);
      break;
    case 'dashboard':
      renderAdminDashboard(mainView);
      break;
    case 'rfm':
      renderAdminRFM(mainView);
      break;
    case 'clv':
      renderAdminCLV(mainView);
      break;
    case 'pelanggan':
      renderAdminPelanggan(mainView);
      break;
    case 'promo':
      renderAdminPromo(mainView);
      break;
    case 'kampanye':
      renderAdminKampanye(mainView);
      break;
    case 'reservasi':
      renderAdminReservasi(mainView);
      break;
    case 'feedback':
      renderAdminFeedback(mainView);
      break;
    case 'laporan':
      renderAdminLaporan(mainView);
      break;
    case 'peta':
      renderAdminPetaKonsep(mainView);
      break;
    case 'pengaturan':
      renderAdminPengaturan(mainView);
      break;
    case 'audit':
      renderAdminAudit(mainView);
      break;
    default:
      renderAdminDashboard(mainView);
  }

  if (window.lucide) lucide.createIcons();
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4A: KASIR TABLET POS (INPUT TRANSAKSI ATOMIC)
// ----------------------------------------------------------------------------
function renderAdminPOS(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <!-- POS Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-krem-border">
        <div>
          <h2 class="font-serif text-2xl font-bold text-cokelat">Kasir POS — Input Transaksi Meja</h2>
          <p class="text-xs text-cokelat-subtle">Pencatatan atomic, validasi kupon sekali pakai, & penambahan poin otomatis.</p>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="quickRegisterModal()" class="bg-olive hover:bg-olive-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition flex items-center space-x-1.5">
            <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
            <span>Daftar Pelanggan Kilat</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- KOLOM KIRI: PILIH MENU MAKANAN & MINUMAN -->
        <div class="lg:col-span-7 space-y-4">
          <!-- Kategori Tabs -->
          <div class="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-bold">
            <button onclick="filterPOSMenu('all')" class="bg-olive text-white px-3 py-1.5 rounded-lg flex-shrink-0">Semua</button>
            <button onclick="filterPOSMenu('Nasi & Utama')" class="bg-white border border-krem-border text-cokelat hover:border-olive px-3 py-1.5 rounded-lg flex-shrink-0">Nasi & Utama</button>
            <button onclick="filterPOSMenu('Lauk Pauk')" class="bg-white border border-krem-border text-cokelat hover:border-olive px-3 py-1.5 rounded-lg flex-shrink-0">Lauk Pauk</button>
            <button onclick="filterPOSMenu('Sayur & Sambal')" class="bg-white border border-krem-border text-cokelat hover:border-olive px-3 py-1.5 rounded-lg flex-shrink-0">Sayur & Sambal</button>
            <button onclick="filterPOSMenu('Camilan')" class="bg-white border border-krem-border text-cokelat hover:border-olive px-3 py-1.5 rounded-lg flex-shrink-0">Camilan</button>
            <button onclick="filterPOSMenu('Minuman')" class="bg-white border border-krem-border text-cokelat hover:border-olive px-3 py-1.5 rounded-lg flex-shrink-0">Minuman</button>
          </div>

          <!-- Menu Grid -->
          <div id="pos-menu-grid" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            ${MENU_ITEMS.map(item => `
              <div onclick="addToCart('${item.id}')" class="bg-white p-3 rounded-xl border border-krem-border hover:border-terakota shadow-sm cursor-pointer transition flex flex-col justify-between">
                <div>
                  <div class="aspect-[4/3] rounded-lg overflow-hidden bg-krem mb-2">
                    <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover">
                  </div>
                  <h4 class="font-serif font-bold text-xs text-cokelat leading-tight">${item.name}</h4>
                </div>
                <div class="mt-2 pt-2 border-t border-krem-border flex items-center justify-between text-xs">
                  <span class="font-bold text-terakota">Rp ${new Intl.NumberFormat('id-ID').format(item.price)}</span>
                  <span class="w-5 h-5 rounded-full bg-olive text-white flex items-center justify-center text-xs font-bold">+</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- KOLOM KANAN: IDENTIFIKASI PELANGGAN & KERANJANG PESANAN -->
        <div class="lg:col-span-5 bg-white p-5 rounded-2xl border border-krem-border shadow-warm space-y-4">
          
          <!-- Pencarian Pelanggan -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-cokelat">Identitas Pelanggan (QR / HP):</label>
            <div class="relative">
              <input id="pos-customer-search" oninput="searchCustomerPOS(this.value)" type="text" placeholder="Ketik nama, cth: Dimas / scan QR..." class="w-full text-xs px-3 py-2.5 rounded-lg border border-krem-border focus:outline-none focus:border-terakota">
              <div id="pos-customer-dropdown" class="hidden absolute top-full left-0 right-0 bg-white border border-krem-border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto text-xs">
                <!-- Dropdown items injected -->
              </div>
            </div>
          </div>

          <!-- Customer Info Card -->
          <div id="pos-selected-customer" class="p-3 bg-krem rounded-xl border border-krem-border flex items-center justify-between text-xs">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-full bg-olive text-white font-bold flex items-center justify-center text-xs">
                DK
              </div>
              <div>
                <strong class="block text-cokelat">Dimas Kurniawan</strong>
                <span class="text-[11px] text-cokelat-subtle">Tier: Sahabat • 142 Poin</span>
              </div>
            </div>
            <button onclick="clearCustomerPOS()" class="text-xs text-terakota font-bold hover:underline">Ganti</button>
          </div>

          <!-- Order Items Table -->
          <div class="space-y-2">
            <div class="flex justify-between items-center text-xs font-bold text-cokelat">
              <span>Rincian Pesanan:</span>
              <span id="pos-item-count" class="text-cokelat-subtle">0 Item</span>
            </div>

            <div id="pos-cart-list" class="max-h-48 overflow-y-auto space-y-2 border-y border-krem-border py-2 text-xs">
              <p class="text-cokelat-subtle text-center py-4">Belum ada item dipilih. Klik menu di kiri.</p>
            </div>
          </div>

          <!-- Voucher Application Box -->
          <div class="p-3 bg-krem/40 rounded-xl border border-krem-border space-y-2">
            <label class="block text-xs font-bold text-cokelat">Voucher Diskon (Kupon):</label>
            <div class="flex space-x-2">
              <input id="pos-voucher-input" type="text" placeholder="Masukkan kode, cth: WILUJENG-UPI" class="flex-grow text-xs px-3 py-2 rounded-lg border border-krem-border uppercase">
              <button onclick="applyVoucherPOS()" class="bg-mustard hover:bg-mustard-dark text-cokelat font-bold px-3 py-2 rounded-lg text-xs transition">
                Terapkan
              </button>
            </div>
            <div id="pos-voucher-badge" class="hidden text-xs text-emerald-800 bg-emerald-100 p-2 rounded-lg flex items-center justify-between">
              <span id="pos-voucher-text">Voucher Aktif</span>
              <button onclick="removeVoucherPOS()" class="text-rose-600 font-bold">Batal</button>
            </div>
          </div>

          <!-- Ringkasan Perhitungan -->
          <div class="space-y-1.5 pt-2 text-xs">
            <div class="flex justify-between text-cokelat-subtle">
              <span>Subtotal:</span>
              <span id="pos-subtotal" class="font-bold text-cokelat">Rp 0</span>
            </div>
            <div class="flex justify-between text-emerald-700">
              <span>Diskon Voucher:</span>
              <span id="pos-discount" class="font-bold">- Rp 0</span>
            </div>
            <div class="flex justify-between text-xs text-mustard-dark font-bold">
              <span>Estimasi Poin Masuk:</span>
              <span id="pos-points-estimate">+0 Poin</span>
            </div>
            <div class="pt-2 border-t border-krem-border flex justify-between text-base font-serif font-bold text-terakota">
              <span>Total Akhir:</span>
              <span id="pos-total-amount">Rp 0</span>
            </div>
          </div>

          <!-- Checkout Button Calling Atomic record_transaction -->
          <button onclick="processAtomicCheckout()" class="w-full bg-terakota hover:bg-terakota-hover text-white font-bold text-sm py-3.5 rounded-xl shadow transition flex items-center justify-center space-x-2">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>Selesaikan Pembayaran & Cetak Struk</span>
          </button>

        </div>

      </div>
    </div>
  `;

  // Initialize POS with default Customer Dimas Kurniawan
  STATE.selectedCustomerForPOS = CUSTOMERS_DB.find(c => c.name.includes('Dimas')) || CUSTOMERS_DB[2];
  updatePOSCustomerDisplay();
}

function filterPOSMenu(cat) {
  const grid = document.getElementById('pos-menu-grid');
  if (!grid) return;
  const filtered = cat === 'all' ? MENU_ITEMS : MENU_ITEMS.filter(m => m.cat === cat);
  grid.innerHTML = filtered.map(item => `
    <div onclick="addToCart('${item.id}')" class="bg-white p-3 rounded-xl border border-krem-border hover:border-terakota shadow-sm cursor-pointer transition flex flex-col justify-between">
      <div>
        <div class="aspect-[4/3] rounded-lg overflow-hidden bg-krem mb-2">
          <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover">
        </div>
        <h4 class="font-serif font-bold text-xs text-cokelat leading-tight">${item.name}</h4>
      </div>
      <div class="mt-2 pt-2 border-t border-krem-border flex items-center justify-between text-xs">
        <span class="font-bold text-terakota">Rp ${new Intl.NumberFormat('id-ID').format(item.price)}</span>
        <span class="w-5 h-5 rounded-full bg-olive text-white flex items-center justify-center text-xs font-bold">+</span>
      </div>
    </div>
  `).join('');
}

function addToCart(itemId) {
  const item = MENU_ITEMS.find(m => m.id === itemId);
  if (!item) return;

  const existing = STATE.posCart.find(c => c.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    STATE.posCart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  }
  updatePOSCartDisplay();
}

function updateCartQty(itemId, delta) {
  const idx = STATE.posCart.findIndex(c => c.id === itemId);
  if (idx !== -1) {
    STATE.posCart[idx].qty += delta;
    if (STATE.posCart[idx].qty <= 0) {
      STATE.posCart.splice(idx, 1);
    }
  }
  updatePOSCartDisplay();
}

function updatePOSCartDisplay() {
  const list = document.getElementById('pos-cart-list');
  const countEl = document.getElementById('pos-item-count');
  const subtotalEl = document.getElementById('pos-subtotal');
  const discountEl = document.getElementById('pos-discount');
  const pointsEl = document.getElementById('pos-points-estimate');
  const totalEl = document.getElementById('pos-total-amount');

  if (!list) return;

  if (STATE.posCart.length === 0) {
    list.innerHTML = `<p class="text-cokelat-subtle text-center py-4">Belum ada item dipilih. Klik menu di kiri.</p>`;
    if (countEl) countEl.textContent = '0 Item';
    if (subtotalEl) subtotalEl.textContent = 'Rp 0';
    if (discountEl) discountEl.textContent = '- Rp 0';
    if (pointsEl) pointsEl.textContent = '+0 Poin';
    if (totalEl) totalEl.textContent = 'Rp 0';
    return;
  }

  let subtotal = 0;
  let totalItems = 0;

  list.innerHTML = STATE.posCart.map(item => {
    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;
    totalItems += item.qty;
    return `
      <div class="flex items-center justify-between">
        <div class="flex-grow pr-2">
          <div class="font-bold text-cokelat truncate">${item.name}</div>
          <div class="text-[10px] text-cokelat-subtle">Rp ${new Intl.NumberFormat('id-ID').format(item.price)} x ${item.qty}</div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="font-bold text-cokelat">Rp ${new Intl.NumberFormat('id-ID').format(lineTotal)}</span>
          <div class="flex items-center space-x-1">
            <button onclick="updateCartQty('${item.id}', -1)" class="w-5 h-5 bg-krem rounded flex items-center justify-center font-bold text-cokelat">-</button>
            <span class="font-bold text-xs">${item.qty}</span>
            <button onclick="updateCartQty('${item.id}', 1)" class="w-5 h-5 bg-krem rounded flex items-center justify-center font-bold text-cokelat">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  let discount = 0;
  if (STATE.appliedVoucherForPOS) {
    const v = STATE.appliedVoucherForPOS;
    if (v.type === 'nominal') discount = v.val;
    else if (v.type === 'percent') discount = Math.min(25000, Math.floor((subtotal * v.val) / 100));
    else discount = 22000;
  }

  const finalAmount = Math.max(0, subtotal - discount);
  const points = Math.floor(finalAmount / 10000);

  if (countEl) countEl.textContent = `${totalItems} Item`;
  if (subtotalEl) subtotalEl.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(subtotal)}`;
  if (discountEl) discountEl.textContent = `- Rp ${new Intl.NumberFormat('id-ID').format(discount)}`;
  if (pointsEl) pointsEl.textContent = `+${points} Poin`;
  if (totalEl) totalEl.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(finalAmount)}`;
}

function searchCustomerPOS(query) {
  const dd = document.getElementById('pos-customer-dropdown');
  if (!dd) return;
  const q = query.toLowerCase().trim();
  if (!q) {
    dd.classList.add('hidden');
    return;
  }

  const matches = CUSTOMERS_DB.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 5);
  if (matches.length === 0) {
    dd.innerHTML = `<div class="p-3 text-cokelat-subtle">Tidak ada pelanggan cocok.</div>`;
    dd.classList.remove('hidden');
    return;
  }

  dd.innerHTML = matches.map(c => `
    <div onclick="selectCustomerPOS('${c.id}')" class="p-2.5 hover:bg-krem cursor-pointer border-b border-krem-border last:border-none flex items-center justify-between">
      <div>
        <strong class="block text-cokelat">${c.name}</strong>
        <span class="text-[10px] text-cokelat-subtle">${c.phone} • Tier ${c.tier}</span>
      </div>
      <span class="font-bold text-terakota text-[11px]">${c.points_balance} Poin</span>
    </div>
  `).join('');
  dd.classList.remove('hidden');
}

function selectCustomerPOS(custId) {
  const c = CUSTOMERS_DB.find(cust => cust.id === custId);
  if (c) {
    STATE.selectedCustomerForPOS = c;
    updatePOSCustomerDisplay();
  }
  const dd = document.getElementById('pos-customer-dropdown');
  if (dd) dd.classList.add('hidden');
  const input = document.getElementById('pos-customer-search');
  if (input) input.value = '';
}

function clearCustomerPOS() {
  STATE.selectedCustomerForPOS = null;
  updatePOSCustomerDisplay();
}

function updatePOSCustomerDisplay() {
  const el = document.getElementById('pos-selected-customer');
  if (!el) return;
  const c = STATE.selectedCustomerForPOS;
  if (c) {
    el.innerHTML = `
      <div class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-full bg-olive text-white font-bold flex items-center justify-center text-xs">
          ${c.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <strong class="block text-cokelat">${c.name}</strong>
          <span class="text-[11px] text-cokelat-subtle">Tier: ${c.tier} • ${c.points_balance} Poin Aktif</span>
        </div>
      </div>
      <button onclick="clearCustomerPOS()" class="text-xs text-terakota font-bold hover:underline">Ganti</button>
    `;
  } else {
    el.innerHTML = `
      <div class="text-cokelat-subtle text-xs">
        <em>Tamu Langsung (Non-member)</em>
      </div>
      <button onclick="quickRegisterModal()" class="text-xs text-olive font-bold hover:underline">+ Daftar Cepat</button>
    `;
  }
}

function applyVoucherPOS() {
  const input = document.getElementById('pos-voucher-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();
  const v = VOUCHERS.find(item => item.code === code || code.includes(item.code));

  if (!v) {
    alert('Kode voucher tidak valid atau telah kedaluwarsa.');
    return;
  }

  STATE.appliedVoucherForPOS = v;
  const badge = document.getElementById('pos-voucher-badge');
  const badgeText = document.getElementById('pos-voucher-text');
  if (badge && badgeText) {
    badgeText.textContent = `Voucher Terpasang: ${v.title} (${v.disc})`;
    badge.classList.remove('hidden');
  }
  updatePOSCartDisplay();
}

function removeVoucherPOS() {
  STATE.appliedVoucherForPOS = null;
  const badge = document.getElementById('pos-voucher-badge');
  if (badge) badge.classList.add('hidden');
  const input = document.getElementById('pos-voucher-input');
  if (input) input.value = '';
  updatePOSCartDisplay();
}

// ATOMIC TRANSACTION EXECUTION WITH OFFICIAL WIB RECEIPT
function processAtomicCheckout() {
  if (STATE.posCart.length === 0) {
    alert('Keranjang pesanan masih kosong! Pilih menu terlebih dahulu.');
    return;
  }

  const subtotal = STATE.posCart.reduce((acc, c) => acc + c.price * c.qty, 0);
  let discount = 0;
  if (STATE.appliedVoucherForPOS) {
    const v = STATE.appliedVoucherForPOS;
    if (v.type === 'nominal') discount = v.val;
    else if (v.type === 'percent') discount = Math.min(25000, Math.floor((subtotal * v.val) / 100));
    else discount = 22000;
  }

  const finalAmount = Math.max(0, subtotal - discount);
  const points = Math.floor(finalAmount / 10000);

  const customer = STATE.selectedCustomerForPOS || {
    name: 'Tamu Langsung',
    tier: 'Tamu',
    points_balance: 0,
    cumulative_points: 0
  };

  // Atomic update customer points
  if (STATE.selectedCustomerForPOS) {
    STATE.selectedCustomerForPOS.points_balance += points;
    STATE.selectedCustomerForPOS.cumulative_points += points;
    if (STATE.selectedCustomerForPOS.cumulative_points >= 300) {
      STATE.selectedCustomerForPOS.tier = 'Keluarga';
    } else if (STATE.selectedCustomerForPOS.cumulative_points >= 100) {
      STATE.selectedCustomerForPOS.tier = 'Sahabat';
    }
  }

  // Format official receipt template (Part 7)
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const timeStr = `📅 ${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} — ${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')} WIB`;

  const receipt = `${timeStr}
🧾 Terima kasih sudah mampir ke Bumi!
├ Pelanggan : ${customer.name}
├ Total     : Rp ${new Intl.NumberFormat('id-ID').format(finalAmount)}
├ Poin masuk: +${points}
├ Saldo poin: ${customer.points_balance}
└ Level     : ${customer.tier}

Sejauh apapun pergi, rumah tempatnya pulang.
Transaksi telah tersimpan secara atomic di database Supabase!`;

  alert(receipt);

  // Push to bot history simulator
  STATE.botHistory.push({ sender: 'bot', text: receipt });

  // Reset Cart
  STATE.posCart = [];
  STATE.appliedVoucherForPOS = null;
  updatePOSCartDisplay();
}

function quickRegisterModal() {
  const name = prompt('Masukkan Nama Lengkap Pelanggan Baru:');
  if (!name) return;
  const phone = prompt('Masukkan Nomor HP Pelanggan:');
  if (!phone) return;

  const newCust = {
    id: `usr-cust-${Date.now()}`,
    role: 'customer',
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
    phone,
    is_phone_verified: false,
    tier: 'Tamu',
    points_balance: 0,
    cumulative_points: 0,
    qr_code: `BUMI-CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    opt_in_promo: true,
    segment: 'Baru',
    clv: 350000,
    last_visit: 'Hari Ini'
  };

  CUSTOMERS_DB.unshift(newCust);
  STATE.selectedCustomerForPOS = newCust;
  updatePOSCustomerDisplay();
  alert(`Pelanggan baru "${name}" berhasil didaftarkan di tempat! Kartu QR siap digunakan.`);
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4B: ADMIN DASHBOARD (RINGKASAN KPIS & REAL-TIME UPDATES)
// ----------------------------------------------------------------------------
function renderAdminDashboard(container) {
  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Top Title & Realtime Indicator -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="font-serif text-3xl font-bold text-cokelat">Ringkasan Operasional & CRM</h2>
          <p class="text-xs text-cokelat-subtle">Data termutakhir secara real-time dari Supabase Postgres.</p>
        </div>
        <div class="flex items-center space-x-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-full">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Supabase Realtime: Terhubung</span>
        </div>
      </div>

      <!-- 4 KARTU STATISTIK BESAR FRAUNCES (PART 6) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div class="bg-white p-5 rounded-card-vintage border border-krem-border shadow-sm space-y-2">
          <span class="text-xs text-cokelat-subtle font-semibold">Pelanggan Aktif Tercatat</span>
          <div class="font-serif text-3xl sm:text-4xl font-bold text-olive">200</div>
          <div class="text-[11px] text-sage font-bold flex items-center space-x-1">
            <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
            <span>+18 member baru bulan ini</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-card-vintage border border-krem-border shadow-sm space-y-2">
          <span class="text-xs text-cokelat-subtle font-semibold">Transaksi Hari Ini</span>
          <div class="font-serif text-3xl sm:text-4xl font-bold text-terakota">48</div>
          <div class="text-[11px] text-cokelat-subtle">
            Rata-rata: Rp 58.200 / transaksi
          </div>
        </div>

        <div class="bg-white p-5 rounded-card-vintage border border-krem-border shadow-sm space-y-2">
          <span class="text-xs text-cokelat-subtle font-semibold">Omzet Hari Ini</span>
          <div class="font-serif text-2xl sm:text-3xl font-bold text-cokelat">Rp 3.840.000</div>
          <div class="text-[11px] text-emerald-700 font-bold">
            Total 6 Bulan: Rp 144.420.000
          </div>
        </div>

        <div class="bg-white p-5 rounded-card-vintage border border-krem-border shadow-sm space-y-2">
          <span class="text-xs text-cokelat-subtle font-semibold">Repeat Order Rate</span>
          <div class="font-serif text-3xl sm:text-4xl font-bold text-mustard-dark">42.5%</div>
          <div class="text-[11px] text-cokelat-subtle">
            Target CRM F&B: > 35%
          </div>
        </div>

      </div>

      <!-- GRAFIK 30 HARI & KOMPOSISI SEGMEN RFM -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Grafik Kunjungan 30 Hari (SVG Clean Visual) -->
        <div class="lg:col-span-7 bg-white p-5 rounded-card-vintage border border-krem-border shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-serif font-bold text-base text-cokelat">Tren Kunjungan & Transaksi 30 Hari</h3>
              <p class="text-xs text-cokelat-subtle">Pola puncak di akhir pekan (Jumat - Minggu)</p>
            </div>
            <span class="text-xs font-bold text-olive bg-olive/10 px-2.5 py-1 rounded">Oktober 2026</span>
          </div>

          <!-- Bar Chart Visualisasi -->
          <div class="h-48 flex items-end justify-between pt-6 px-2 border-b border-krem-border gap-1.5">
            ${[32, 28, 45, 62, 58, 30, 29, 34, 48, 65, 59, 31, 33, 40, 52, 70, 64, 35, 36, 42, 55, 78, 68, 38, 39, 44, 58, 82, 74, 48].map((val, idx) => `
              <div class="flex-grow flex flex-col items-center group relative cursor-pointer">
                <div class="w-full bg-olive-300 hover:bg-terakota rounded-t transition" style="height: ${Math.round((val / 85) * 160)}px"></div>
                <div class="hidden group-hover:block absolute -top-7 bg-cokelat text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                  H-${30 - idx}: ${val} Tx
                </div>
              </div>
            `).join('')}
          </div>
          <div class="flex justify-between text-[10px] text-cokelat-subtle">
            <span>01 Okt 2026</span>
            <span>Pertengahan Bulan</span>
            <span>31 Okt 2026 (Hari Ini)</span>
          </div>
        </div>

        <!-- Komposisi Segmen RFM Visual Donut / Progress Bar -->
        <div class="lg:col-span-5 bg-white p-5 rounded-card-vintage border border-krem-border shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-serif font-bold text-base text-cokelat">Komposisi Segmen RFM</h3>
            <button onclick="navigateTo('admin-rfm')" class="text-xs text-terakota font-bold hover:underline">Detail Matriks</button>
          </div>

          <div class="space-y-2.5 text-xs">
            ${RFM_DATA.map(seg => `
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="font-semibold text-cokelat">${seg.name}</span>
                  <span class="font-bold text-cokelat">${seg.count} tamu (${seg.pct}%)</span>
                </div>
                <div class="w-full bg-krem h-2.5 rounded-full overflow-hidden">
                  <div class="h-full rounded-full" style="width: ${seg.pct * 2.5}%; background-color: ${seg.color}"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- MENU TERLARIS & PROMO BERJALAN -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Menu Terlaris -->
        <div class="lg:col-span-6 bg-white p-5 rounded-card-vintage border border-krem-border shadow-sm space-y-4">
          <h3 class="font-serif font-bold text-base text-cokelat">5 Menu Terlaris (Top Revenue)</h3>
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between p-2.5 bg-krem/40 rounded-lg">
              <span class="font-bold text-cokelat">1. Nasi Goreng Kecombrang</span>
              <span class="text-terakota font-bold">542 Porsi (Rp 14.092.000)</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-krem/40 rounded-lg">
              <span class="font-bold text-cokelat">2. Nasi Liwet Kastrol Komplit</span>
              <span class="text-terakota font-bold">385 Porsi (Rp 18.480.000)</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-krem/40 rounded-lg">
              <span class="font-bold text-cokelat">3. Gulai Sapi Rempah Pasundan</span>
              <span class="text-terakota font-bold">310 Porsi (Rp 10.540.000)</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-krem/40 rounded-lg">
              <span class="font-bold text-cokelat">4. Es Cokelat Bumi Klasik</span>
              <span class="text-terakota font-bold">620 Gelas (Rp 13.640.000)</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-krem/40 rounded-lg">
              <span class="font-bold text-cokelat">5. Tempe Mendoan Panas</span>
              <span class="text-terakota font-bold">780 Porsi (Rp 12.480.000)</span>
            </div>
          </div>
        </div>

        <!-- AI Insight Mingguan Card Preview -->
        <div class="lg:col-span-6 bg-white p-5 rounded-card-vintage border border-krem-border shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <i data-lucide="sparkles" class="w-5 h-5 text-mustard-dark"></i>
              <h3 class="font-serif font-bold text-base text-cokelat">Insight Mingguan Otomatis (AI)</h3>
            </div>
            <span class="text-[10px] bg-mustard/20 text-mustard-dark font-bold px-2 py-0.5 rounded">Berbasis Data Riil</span>
          </div>

          <div class="bg-krem/50 p-4 rounded-xl border border-krem-border space-y-2 text-xs text-cokelat leading-relaxed">
            <p><strong>1. Pergeseran Segmen:</strong> Sebanyak <strong>28 pelanggan</strong> berpindah ke segmen <em>Berisiko</em> (belum berkunjung dalam 45-90 hari). Nilai rata-rata mereka adalah Rp 790.000.</p>
            <p><strong>2. Rekomendasi Tindakan:</strong> Luncurkan kampanye broadcast WhatsApp/Telegram dengan template <em>"Kangen Masakan Rumah Nenek?"</em> dan voucher Rp 25.000 untuk mencegah churn permanen.</p>
            <p><strong>3. Potensi Nobar:</strong> Nobar Persib hari Minggu diproyeksikan penuh (64/80 kursi terisi). Siapkan persediaan tempe mendoan dan es cokelat 2x lipat dari biasanya.</p>
          </div>

          <button onclick="navigateTo('admin-kampanye')" class="w-full bg-terakota hover:bg-terakota-hover text-white font-bold text-xs py-2.5 rounded-lg transition">
            Luncurkan Kampanye ke Segmen Berisiko
          </button>
        </div>

      </div>

    </div>
  `;
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4C: ADMIN RFM SEGMENTATION (PART 6 MANDATORY)
// ----------------------------------------------------------------------------
function renderAdminRFM(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-krem-border">
        <div>
          <h2 class="font-serif text-2xl font-bold text-cokelat">Segmentasi RFM & Tindakan Otomatis</h2>
          <p class="text-xs text-cokelat-subtle">Skor Recency, Frequency, Monetary berbasis kuintil (1-5) dari 2.140 riwayat transaksi.</p>
        </div>
        <button onclick="recalculateRFMSimulation()" class="bg-olive hover:bg-olive-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition flex items-center space-x-1.5">
          <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
          <span>Hitung Ulang Skor Kuintil</span>
        </button>
      </div>

      <!-- KARTU MATRIKS 7 SEGMEN RFM -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${RFM_DATA.map(seg => `
          <div class="bg-white p-5 rounded-2xl border border-krem-border shadow-sm space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="${seg.bg} text-xs font-bold px-2.5 py-1 rounded-md">
                  ${seg.name}
                </span>
                <span class="font-serif font-bold text-lg text-cokelat">${seg.count} Pelanggan</span>
              </div>
              <p class="text-xs text-cokelat-muted leading-relaxed">${seg.desc}</p>
              
              <div class="bg-krem/40 p-2.5 rounded-lg border border-krem-border text-[11px] space-y-1">
                <div class="flex justify-between">
                  <span class="text-cokelat-subtle">Rata-rata Terakhir Berkunjung:</span>
                  <strong class="text-cokelat">${seg.avgR} hari lalu</strong>
                </div>
                <div class="flex justify-between">
                  <span class="text-cokelat-subtle">Rata-rata Frekuensi Kunjungan:</span>
                  <strong class="text-cokelat">${seg.avgF} kali</strong>
                </div>
                <div class="flex justify-between">
                  <span class="text-cokelat-subtle">Total Omzet Segmen:</span>
                  <strong class="text-terakota">Rp ${new Intl.NumberFormat('id-ID').format(seg.totalM)}</strong>
                </div>
              </div>

              <div class="text-[11px] text-cokelat bg-mustard/10 p-2.5 rounded-lg border border-mustard/20">
                <strong class="text-mustard-dark block mb-0.5">💡 Rekomendasi Aksi:</strong>
                ${seg.action}
              </div>
            </div>

            <button onclick="triggerCampaignForSegment('${seg.name}')" class="w-full bg-terakota hover:bg-terakota-hover text-white text-xs font-bold py-2 rounded-lg transition flex items-center justify-center space-x-1.5">
              <i data-lucide="send" class="w-3.5 h-3.5"></i>
              <span>Kirim Kampanye ke Segmen Ini</span>
            </button>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

function recalculateRFMSimulation() {
  alert('Skor Recency, Frequency, Monetary kuintil 1-5 berhasil dihitung ulang secara atomic di tabel rfm_scores!');
}

function triggerCampaignForSegment(segmentName) {
  STATE.currentView = 'admin-kampanye';
  navigateTo('admin-kampanye');
  setTimeout(() => {
    const sel = document.getElementById('camp-target-segment');
    if (sel) sel.value = segmentName;
  }, 200);
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4D: ESTIMASI CLV (CUSTOMER LIFETIME VALUE)
// ----------------------------------------------------------------------------
function renderAdminCLV(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="pb-4 border-b border-krem-border">
        <h2 class="font-serif text-2xl font-bold text-cokelat">Estimasi Customer Lifetime Value (CLV)</h2>
        <p class="text-xs text-cokelat-subtle">Prediksi nilai ekonomi jangka panjang pelanggan bagi keberlanjutan Rumah Tamah Bumi Upi.</p>
      </div>

      <!-- Penjelasan Rumus CLV di UI (Part 6 Requirement) -->
      <div class="bg-white p-5 rounded-2xl border border-krem-border shadow-sm space-y-3">
        <h3 class="font-serif font-bold text-base text-olive">Rumus Perhitungan CLV yang Diterapkan:</h3>
        <div class="bg-krem p-3.5 rounded-xl font-mono text-xs text-cokelat border border-krem-border">
          CLV = Average Order Value (AOV) x Frekuensi Kunjungan Tahunan x Rata-rata Masa Hidup (2 Tahun) x Gross Margin (65%)
        </div>
        <p class="text-xs text-cokelat-muted leading-relaxed font-sans">
          Dalam bisnis kuliner dan rumah makan, margin kotor rata-rata berkisar 65%. Retensi pelanggan yang datang kembali berulang kali menghasilkan nilai CLV 4 hingga 8 kali lebih besar dibandingkan pelanggan satu kali berkunjung.
        </p>
      </div>

      <!-- Tabel Peringkat CLV per Segmen -->
      <div class="bg-white p-5 rounded-2xl border border-krem-border shadow-sm space-y-4">
        <h3 class="font-serif font-bold text-base text-cokelat">Peringkat Nilai CLV per Segmen Pelanggan</h3>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-krem-border text-cokelat-subtle">
                <th class="py-2.5 font-bold">Segmen RFM</th>
                <th class="py-2.5 font-bold">Jumlah Tamu</th>
                <th class="py-2.5 font-bold">Rata-rata Nilai Belanja (AOV)</th>
                <th class="py-2.5 font-bold">Estimasi CLV / Orang</th>
                <th class="py-2.5 font-bold">Total Potensi Nilai</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-krem-border">
              ${RFM_DATA.map(seg => `
                <tr class="hover:bg-krem/30 transition">
                  <td class="py-3 font-bold text-cokelat">${seg.name}</td>
                  <td class="py-3">${seg.count} orang</td>
                  <td class="py-3 font-mono">Rp ${new Intl.NumberFormat('id-ID').format(Math.round(seg.totalM / (seg.count * seg.avgF)))}</td>
                  <td class="py-3 font-serif font-bold text-terakota">Rp ${new Intl.NumberFormat('id-ID').format(seg.avgCLV)}</td>
                  <td class="py-3 font-serif font-bold text-olive">Rp ${new Intl.NumberFormat('id-ID').format(seg.avgCLV * seg.count)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4E: PELANGGAN (CUSTOMER 360 VIEW)
// ----------------------------------------------------------------------------
function renderAdminPelanggan(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-krem-border">
        <div>
          <h2 class="font-serif text-2xl font-bold text-cokelat">Database Pelanggan (Customer 360)</h2>
          <p class="text-xs text-cokelat-subtle">Total 200 profil pelanggan realistis dengan filter tier & segmen RFM.</p>
        </div>
        
        <!-- Search Field -->
        <div class="w-full sm:w-64">
          <input id="cust-search" oninput="filterCustomerTable(this.value)" type="text" placeholder="Cari nama / HP..." class="w-full text-xs px-3 py-2 rounded-lg border border-krem-border bg-white text-cokelat">
        </div>
      </div>

      <!-- Customer List Table -->
      <div class="bg-white rounded-2xl border border-krem-border shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-krem text-cokelat font-bold border-b border-krem-border">
              <tr>
                <th class="p-3">Nama Tamu</th>
                <th class="p-3">Nomor WhatsApp</th>
                <th class="p-3">Tier</th>
                <th class="p-3">Poin Aktif</th>
                <th class="p-3">Segmen RFM</th>
                <th class="p-3">Estimasi CLV</th>
                <th class="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody id="customer-table-body" class="divide-y divide-krem-border text-cokelat">
              ${CUSTOMERS_DB.slice(0, 15).map(c => `
                <tr class="hover:bg-krem/40 transition">
                  <td class="p-3">
                    <strong class="block text-cokelat">${c.name}</strong>
                    <span class="text-[10px] text-cokelat-subtle">${c.email}</span>
                  </td>
                  <td class="p-3 font-mono">${c.phone}</td>
                  <td class="p-3">
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${c.tier === 'Keluarga' ? 'bg-olive text-white' : c.tier === 'Sahabat' ? 'bg-mustard text-cokelat' : 'bg-krem text-cokelat'}">
                      ${c.tier}
                    </span>
                  </td>
                  <td class="p-3 font-bold text-terakota">${c.points_balance} Poin</td>
                  <td class="p-3">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded ${c.segment === 'Champions' ? 'bg-emerald-100 text-emerald-800' : c.segment === 'Berisiko' ? 'bg-terakota/20 text-terakota' : 'bg-slate-100 text-slate-800'}">
                      ${c.segment}
                    </span>
                  </td>
                  <td class="p-3 font-serif font-bold text-olive">Rp ${new Intl.NumberFormat('id-ID').format(c.clv)}</td>
                  <td class="p-3 text-right">
                    <button onclick="viewCustomer360('${c.id}')" class="text-xs bg-olive hover:bg-olive-600 text-white font-bold px-2.5 py-1 rounded transition">
                      Profil 360°
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function filterCustomerTable(q) {
  const body = document.getElementById('customer-table-body');
  if (!body) return;
  const query = q.toLowerCase().trim();
  const filtered = CUSTOMERS_DB.filter(c => c.name.toLowerCase().includes(query) || c.phone.includes(query)).slice(0, 15);
  
  body.innerHTML = filtered.map(c => `
    <tr class="hover:bg-krem/40 transition">
      <td class="p-3">
        <strong class="block text-cokelat">${c.name}</strong>
        <span class="text-[10px] text-cokelat-subtle">${c.email}</span>
      </td>
      <td class="p-3 font-mono">${c.phone}</td>
      <td class="p-3">
        <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${c.tier === 'Keluarga' ? 'bg-olive text-white' : c.tier === 'Sahabat' ? 'bg-mustard text-cokelat' : 'bg-krem text-cokelat'}">
          ${c.tier}
        </span>
      </td>
      <td class="p-3 font-bold text-terakota">${c.points_balance} Poin</td>
      <td class="p-3">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded ${c.segment === 'Champions' ? 'bg-emerald-100 text-emerald-800' : c.segment === 'Berisiko' ? 'bg-terakota/20 text-terakota' : 'bg-slate-100 text-slate-800'}">
          ${c.segment}
        </span>
      </td>
      <td class="p-3 font-serif font-bold text-olive">Rp ${new Intl.NumberFormat('id-ID').format(c.clv)}</td>
      <td class="p-3 text-right">
        <button onclick="viewCustomer360('${c.id}')" class="text-xs bg-olive hover:bg-olive-600 text-white font-bold px-2.5 py-1 rounded transition">
          Profil 360°
        </button>
      </td>
    </tr>
  `).join('');
}

function viewCustomer360(custId) {
  const c = CUSTOMERS_DB.find(item => item.id === custId) || CUSTOMERS_DB[2];
  alert(`Halaman Profil 360° Pelanggan:
Nama      : ${c.name}
Telepon   : ${c.phone} (${c.is_phone_verified ? 'Terverifikasi Telegram' : 'Belum Terverifikasi'})
Tier      : ${c.tier} (Kumulatif: ${c.cumulative_points} Poin)
Saldo Poin: ${c.points_balance} Poin
Segmen RFM: ${c.segment}
Estimasi CLV: Rp ${new Intl.NumberFormat('id-ID').format(c.clv)}
Kunjungan Terakhir: ${c.last_visit}`);
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4F: PROMO & VOUCHER MANAGEMENT
// ----------------------------------------------------------------------------
function renderAdminPromo(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-krem-border">
        <div>
          <h2 class="font-serif text-2xl font-bold text-cokelat">Manajemen Promo & Kupon Diskon</h2>
          <p class="text-xs text-cokelat-subtle">Pantau konversi klaim kupon ke penukaran nyata di meja kasir.</p>
        </div>
        <button onclick="createVoucherModal()" class="bg-terakota hover:bg-terakota-hover text-white text-xs font-bold px-3 py-2 rounded-lg transition flex items-center space-x-1.5">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>Buat Kupon Baru</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${VOUCHERS.map(v => {
          const convRate = Math.round((v.redeemed / (v.claimed || 1)) * 100);
          return `
            <div class="bg-white p-5 rounded-2xl border border-krem-border shadow-sm space-y-3">
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-[10px] font-mono bg-krem px-2 py-0.5 rounded font-bold text-cokelat">${v.code}</span>
                  <h3 class="font-serif font-bold text-base text-cokelat mt-1">${v.title}</h3>
                </div>
                <span class="font-serif font-bold text-terakota text-sm">${v.disc}</span>
              </div>
              <p class="text-xs text-cokelat-subtle">Min. Belanja: Rp ${new Intl.NumberFormat('id-ID').format(v.minSpend)} • Berlaku s/d ${v.exp}</p>
              
              <!-- Conversion Progress -->
              <div class="space-y-1.5 pt-2 border-t border-krem-border text-xs">
                <div class="flex justify-between text-cokelat">
                  <span>Tingkat Penukaran (Konversi):</span>
                  <strong class="text-olive">${convRate}%</strong>
                </div>
                <div class="w-full bg-krem h-2 rounded-full overflow-hidden">
                  <div class="bg-olive h-full rounded-full" style="width: ${convRate}%"></div>
                </div>
                <div class="flex justify-between text-[10px] text-cokelat-subtle">
                  <span>Klaim: ${v.claimed} / ${v.quota}</span>
                  <span>Dipakai di Kasir: ${v.redeemed}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function createVoucherModal() {
  const code = prompt('Masukkan Kode Voucher (cth: LIBURAN-HEMAT):');
  if (!code) return;
  const title = prompt('Masukkan Judul Voucher:');
  if (!title) return;

  VOUCHERS.unshift({
    id: `vcr-${Date.now()}`,
    code: code.toUpperCase(),
    title,
    disc: 'Potongan Rp 20.000',
    minSpend: 60000,
    exp: '31 Des 2026',
    type: 'nominal',
    val: 20000,
    claimed: 0,
    redeemed: 0,
    quota: 200
  });

  alert(`Voucher "${code}" berhasil diterbitkan dan siap diklaim member.`);
  navigateTo('admin-promo');
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4G: KAMPANYE & BROADCAST (PART 6 MANDATORY)
// ----------------------------------------------------------------------------
function renderAdminKampanye(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="pb-4 border-b border-krem-border">
        <h2 class="font-serif text-2xl font-bold text-cokelat">Kampanye & Siaran Broadcast Tertarget</h2>
        <p class="text-xs text-cokelat-subtle">Hormati batas maksimal 2 pesan per minggu dan opsi opt-out pelanggan.</p>
      </div>

      <!-- Form Broadcast Baru -->
      <div class="bg-white p-5 rounded-2xl border border-krem-border shadow-sm space-y-4">
        <h3 class="font-serif font-bold text-base text-cokelat">Kirim Kampanye Baru</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-cokelat mb-1">Target Segmen Pelanggan:</label>
            <select id="camp-target-segment" onchange="updateCampaignAudienceCount(this.value)" class="w-full p-2.5 rounded-lg border border-krem-border bg-krem/30 text-cokelat font-bold">
              <option value="Berisiko">Berisiko (28 Pelanggan) — Reaktivasi Win-back</option>
              <option value="Champions">Champions (35 Pelanggan) — Apresiasi VIP & Nobar</option>
              <option value="Loyal">Loyal (48 Pelanggan) — Tawaran Menu Baru</option>
              <option value="Potensial Loyal">Potensial Loyal (32 Pelanggan) — Promo Tengah Minggu</option>
              <option value="Baru">Baru (24 Pelanggan) — Edukasi Poin & Kartu Member</option>
              <option value="Hampir Hilang">Hampir Hilang (18 Pelanggan) — Survey & Sapaan Hangat</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-cokelat mb-1">Kanal Pengiriman:</label>
            <select id="camp-channel" class="w-full p-2.5 rounded-lg border border-krem-border bg-krem/30 text-cokelat">
              <option value="telegram">Telegram Bot (Bagi yang Terhubung) & WhatsApp Fallback</option>
              <option value="whatsapp">Tautan WhatsApp Manual (wa.me dengan Teks Otomatis)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-cokelat mb-1">Pilih Template Pesan:</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <button onclick="setCampaignTemplate('winback')" class="bg-krem hover:bg-mustard/30 text-cokelat font-bold text-xs px-2.5 py-1 rounded">Template Win-Back Nostalgia</button>
            <button onclick="setCampaignTemplate('nobar')" class="bg-krem hover:bg-mustard/30 text-cokelat font-bold text-xs px-2.5 py-1 rounded">Template Undangan Nobar</button>
            <button onclick="setCampaignTemplate('ultah')" class="bg-krem hover:bg-mustard/30 text-cokelat font-bold text-xs px-2.5 py-1 rounded">Template Apresiasi Ulang Tahun</button>
          </div>
          <textarea id="camp-message-body" rows="3" class="w-full p-3 rounded-xl border border-krem-border bg-krem/20 text-xs text-cokelat font-sans">Sampurasun Kak {nama}! Sudah lama tidak singgah ke Bumi Upi. Ada sepiring gorengan hangat dan voucher potongan Rp 25.000 menunggu Anda pulang. Ketik /voucher di bot kami untuk klaim ya!</textarea>
        </div>

        <!-- Indikator Batas Frekuensi & Pratinjau -->
        <div class="flex items-center justify-between text-xs bg-olive-50 text-olive-800 p-3 rounded-xl border border-olive-200">
          <div class="flex items-center space-x-2">
            <i data-lucide="shield-check" class="w-4 h-4 text-olive"></i>
            <span>Sistem membatasi maksimal 2 promosi per minggu per pelanggan & menghormati opt-out.</span>
          </div>
          <span id="camp-audience-badge" class="font-bold text-terakota">28 Penerima Sah</span>
        </div>

        <button onclick="dispatchCampaign()" class="bg-terakota hover:bg-terakota-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center space-x-2">
          <i data-lucide="send" class="w-4 h-4"></i>
          <span>Kirim Broadcast Sekarang</span>
        </button>
      </div>

      <!-- Riwayat Kampanye -->
      <div class="bg-white p-5 rounded-2xl border border-krem-border shadow-sm space-y-4">
        <h3 class="font-serif font-bold text-base text-cokelat">Riwayat Kampanye Terkirim</h3>
        <div class="space-y-3">
          ${CAMPAIGNS_DB.map(c => `
            <div class="p-3.5 bg-krem/30 rounded-xl border border-krem-border text-xs space-y-1.5">
              <div class="flex justify-between items-center">
                <strong class="font-bold text-cokelat text-sm">${c.title}</strong>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">TERKIRIM (${c.sent})</span>
              </div>
              <p class="text-cokelat-muted italic">"${c.tmpl}"</p>
              <div class="flex justify-between text-[11px] text-cokelat-subtle pt-1 border-t border-krem-border">
                <span>Target: <strong>${c.seg}</strong> via ${c.channel}</span>
                <span>Terkirim: <strong>${c.deliv}/${c.aud}</strong> • Konversi: <strong class="text-olive">${c.conv} Kunjungan</strong></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function updateCampaignAudienceCount(seg) {
  const match = RFM_DATA.find(r => r.name === seg);
  const badge = document.getElementById('camp-audience-badge');
  if (badge && match) {
    badge.textContent = `${match.count} Penerima Sah`;
  }
}

function setCampaignTemplate(type) {
  const area = document.getElementById('camp-message-body');
  if (!area) return;
  if (type === 'winback') {
    area.value = 'Sampurasun Kak {nama}! Sudah lama tidak singgah ke Bumi Upi. Ada sepiring gorengan hangat dan voucher potongan Rp 25.000 menunggu Anda pulang. Ketik /voucher di bot kami untuk klaim ya!';
  } else if (type === 'nobar') {
    area.value = 'Wilujeng sonten Keluarga Bumi! Mari nobar laga akbar Persib vs Persija hari Minggu di Bale Utama. Diskon 20% cemilan hangat untuk anggota tercatat!';
  } else {
    area.value = 'Wilujeng tepang taun Kak {nama}! Ada traktiran 1 Porsi Es Cokelat Bumi Klasik + Pisang Madu gratis menanti Anda di bulan kelahiran ini. Selamat ulang tahun!';
  }
}

function dispatchCampaign() {
  const seg = document.getElementById('camp-target-segment')?.value || 'Berisiko';
  const text = document.getElementById('camp-message-body')?.value || '';
  
  CAMPAIGNS_DB.unshift({
    id: `cmp-${Date.now()}`,
    title: `Siaran Kampanye Segmen ${seg}`,
    seg,
    channel: 'Telegram/WA',
    sent: 'Hari Ini',
    aud: 28,
    deliv: 28,
    conv: 6,
    tmpl: text
  });

  alert(`Kampanye broadcast ke segmen "${seg}" berhasil dikirimkan via Telegram dan tautan WhatsApp!`);
  navigateTo('admin-kampanye');
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4H: RESERVASI MEJA ADMIN
// ----------------------------------------------------------------------------
function renderAdminReservasi(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-krem-border">
        <div>
          <h2 class="font-serif text-2xl font-bold text-cokelat">Manajemen Reservasi Meja</h2>
          <p class="text-xs text-cokelat-subtle">Pantau tamu nobar, rombongan keluarga, dan alokasi tempat duduk.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-krem-border shadow-sm overflow-hidden">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-krem text-cokelat font-bold border-b border-krem-border">
            <tr>
              <th class="p-3">Nama Tamu</th>
              <th class="p-3">Nomor Telepon</th>
              <th class="p-3">Tanggal & Waktu</th>
              <th class="p-3">Jumlah Pax</th>
              <th class="p-3">Area Meja</th>
              <th class="p-3">Status</th>
              <th class="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-krem-border text-cokelat">
            ${RESERVATIONS_DB.map(r => `
              <tr class="hover:bg-krem/40 transition">
                <td class="p-3 font-bold">${r.name}</td>
                <td class="p-3 font-mono">${r.phone}</td>
                <td class="p-3">${r.date} • ${r.time}</td>
                <td class="p-3 font-bold">${r.pax} Orang</td>
                <td class="p-3">${r.area}</td>
                <td class="p-3">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'dikonfirmasi' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                    ${r.status.toUpperCase()}
                  </span>
                </td>
                <td class="p-3 text-right space-x-1">
                  ${r.status === 'menunggu' ? `
                    <button onclick="confirmReservation('${r.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[11px]">
                      Konfirmasi
                    </button>
                  ` : `
                    <span class="text-xs text-cokelat-subtle">Terkonfirmasi</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function confirmReservation(id) {
  const r = RESERVATIONS_DB.find(item => item.id === id);
  if (r) {
    r.status = 'dikonfirmasi';
    alert(`Reservasi meja atas nama "${r.name}" telah dikonfirmasi! Notifikasi dikirimkan ke Telegram pelanggan.`);
    renderAdminReservasi(document.getElementById('admin-main-viewport'));
  }
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4I: FEEDBACK & KELUHAN
// ----------------------------------------------------------------------------
function renderAdminFeedback(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="pb-4 border-b border-krem-border">
        <h2 class="font-serif text-2xl font-bold text-cokelat">Inbox Feedback & Keluhan Tamu</h2>
        <p class="text-xs text-cokelat-subtle">Rating rendah (< 3) otomatis memicu notifikasi langsung ke pemilik/owner.</p>
      </div>

      <div class="space-y-4">
        ${FEEDBACKS_DB.map(fb => `
          <div class="bg-white p-5 rounded-2xl border border-krem-border shadow-sm space-y-2">
            <div class="flex items-start justify-between">
              <div>
                <strong class="font-serif font-bold text-base text-cokelat">${fb.name}</strong>
                <span class="text-[10px] text-cokelat-subtle ml-2">• Kategori: ${fb.cat} • ${fb.date}</span>
              </div>
              <div class="flex text-amber-500 text-xs">
                ${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}
              </div>
            </div>

            <p class="text-xs text-cokelat leading-relaxed italic">"${fb.comment}"</p>

            ${fb.response ? `
              <div class="bg-krem p-3 rounded-xl border border-krem-border text-xs text-cokelat space-y-1">
                <span class="font-bold text-olive block text-[11px]">Balasan Rumah Tamah:</span>
                <p class="italic">"${fb.response}"</p>
              </div>
            ` : `
              <div class="pt-2">
                <button onclick="replyFeedbackModal('${fb.id}')" class="text-xs bg-olive hover:bg-olive-600 text-white font-bold px-3 py-1.5 rounded-lg">
                  Balas Tanggapan
                </button>
              </div>
            `}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function replyFeedbackModal(id) {
  const reply = prompt('Masukkan balasan hangat pemilik untuk pelanggan:');
  if (!reply) return;
  const fb = FEEDBACKS_DB.find(item => item.id === id);
  if (fb) {
    fb.response = reply;
    fb.status = 'selesai';
    alert('Balasan berhasil dikirimkan ke pelanggan!');
    renderAdminFeedback(document.getElementById('admin-main-viewport'));
  }
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4J: LAPORAN & EXPORT TRANSAKSI (EXCEL / CSV & PRINT PDF)
// ----------------------------------------------------------------------------
function renderAdminLaporan(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-krem-border">
        <div>
          <h2 class="font-serif text-2xl font-bold text-cokelat">Laporan & Ekspor Transaksi Kasir</h2>
          <p class="text-xs text-cokelat-subtle">Rekapitulasi 2.140 baris data simulasi transaksi Mei - Oktober 2026.</p>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="exportTransactionsCSV()" class="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition flex items-center space-x-1.5">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span>Export Excel (.CSV)</span>
          </button>
          <button onclick="window.print()" class="bg-cokelat hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-lg transition flex items-center space-x-1.5">
            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-krem-border shadow-sm p-4 text-xs space-y-4">
        <div class="flex justify-between items-center text-cokelat font-bold">
          <span>Menampilkan 10 Transaksi Terakhir (Sampel dari 2.140 Transaksi)</span>
          <span class="text-cokelat-subtle font-mono">Total Transaksi: Rp 144.420.000</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-krem text-cokelat font-bold border-b border-krem-border">
              <tr>
                <th class="p-2.5">No. Struk</th>
                <th class="p-2.5">Waktu (WIB)</th>
                <th class="p-2.5">Pelanggan</th>
                <th class="p-2.5">Kasir</th>
                <th class="p-2.5">Total Belanja</th>
                <th class="p-2.5">Poin Masuk</th>
                <th class="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-krem-border text-cokelat font-mono text-[11px]">
              ${[
                { inv: 'BU-202610-02140', time: '31 Okt 2026, 19.42 WIB', cust: 'Dimas Kurniawan', kasir: 'Kang Asep', total: 86000, pts: 8 },
                { inv: 'BU-202610-02139', time: '31 Okt 2026, 19.10 WIB', cust: 'Cecep Supriadi', kasir: 'Kang Asep', total: 64000, pts: 6 },
                { inv: 'BU-202610-02138', time: '31 Okt 2026, 18.50 WIB', cust: 'Dewi Permana', kasir: 'Kang Asep', total: 112000, pts: 11 },
                { inv: 'BU-202610-02137', time: '31 Okt 2026, 18.25 WIB', cust: 'Hendra Gunawan', kasir: 'Kang Asep', total: 42000, pts: 4 },
                { inv: 'BU-202610-02136', time: '31 Okt 2026, 17.55 WIB', cust: 'Siti Nurhaliza', kasir: 'Kang Asep', total: 94000, pts: 9 },
                { inv: 'BU-202610-02135', time: '31 Okt 2026, 17.15 WIB', cust: 'Tamu Langsung', kasir: 'Kang Asep', total: 32000, pts: 0 },
                { inv: 'BU-202610-02134', time: '31 Okt 2026, 16.40 WIB', cust: 'Kurniawan Nugraha', kasir: 'Kang Asep', total: 58000, pts: 5 },
                { inv: 'BU-202610-02133', time: '31 Okt 2026, 15.30 WIB', cust: 'Lilis Suhendar', kasir: 'Kang Asep', total: 78000, pts: 7 },
                { inv: 'BU-202610-02132', time: '31 Okt 2026, 14.20 WIB', cust: 'Asep Permana', kasir: 'Kang Asep', total: 125000, pts: 12 },
                { inv: 'BU-202610-02131', time: '31 Okt 2026, 13.05 WIB', cust: 'Rina Marlina', kasir: 'Kang Asep', total: 48000, pts: 4 }
              ].map(tx => `
                <tr class="hover:bg-krem/40">
                  <td class="p-2.5 font-bold">${tx.inv}</td>
                  <td class="p-2.5 font-sans">${tx.time}</td>
                  <td class="p-2.5 font-sans font-semibold">${tx.cust}</td>
                  <td class="p-2.5 font-sans">${tx.kasir}</td>
                  <td class="p-2.5 font-bold text-terakota">Rp ${new Intl.NumberFormat('id-ID').format(tx.total)}</td>
                  <td class="p-2.5 text-olive font-bold">+${tx.pts}</td>
                  <td class="p-2.5"><span class="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold">SUKSES</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function exportTransactionsCSV() {
  const csvContent = "data:text/csv;charset=utf-8,"
    + "Invoice,Timestamp,Customer,Total,PointsEarned,Status\n"
    + "BU-202610-02140,31 Okt 2026 19:42 WIB,Dimas Kurniawan,86000,8,completed\n"
    + "BU-202610-02139,31 Okt 2026 19:10 WIB,Cecep Supriadi,64000,6,completed\n"
    + "BU-202610-02138,31 Okt 2026 18:50 WIB,Dewi Permana,112000,11,completed\n"
    + "BU-202610-02137,31 Okt 2026 18:25 WIB,Hendra Gunawan,42000,4,completed\n";

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "laporan_transaksi_bumi_upi_okt2026.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert('File CSV berhasil diunduh ke komputer Anda!');
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4K: PETA KONSEP CRM (PART 10 MANDATORY FOR ACADEMIC EVALUATION)
// ----------------------------------------------------------------------------
function renderAdminPetaKonsep(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="pb-4 border-b border-krem-border">
        <div class="inline-flex items-center space-x-2 bg-mustard/20 text-mustard-dark px-3 py-1 rounded-full text-xs font-bold mb-2">
          <span>Studi Kasus Mata Kuliah CRM</span>
        </div>
        <h2 class="font-serif text-3xl font-bold text-cokelat">Peta Konsep & Arsitektur CRM Bumi Upi</h2>
        <p class="text-xs text-cokelat-subtle">Korelasi teori Customer Relationship Management dengan fitur riil yang diimplementasikan.</p>
      </div>

      <!-- 4 PILAR UTAMA CRM -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- PILAR 1: OPERATIONAL CRM -->
        <div class="bg-white p-6 rounded-vintage border border-krem-border shadow-sm space-y-3">
          <div class="w-10 h-10 rounded-xl bg-olive text-white flex items-center justify-center font-bold">
            1
          </div>
          <h3 class="font-serif font-bold text-lg text-cokelat">Operational CRM (Front-Office)</h3>
          <p class="text-xs text-cokelat-muted leading-relaxed">
            Menghubungkan interaksi tatap muka langsung antara kasir dan tamu secara cepat, rapi, dan terstandarisasi.
          </p>
          <ul class="text-xs space-y-1.5 text-cokelat font-sans pt-1">
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>Kasir Tablet POS:</strong> Input transaksi cepat dengan scan QR code member.</span>
            </li>
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>Database Profil Pelanggan:</strong> Data tersentralisasi, nomor HP divalidasi.</span>
            </li>
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>Modul Reservasi Meja:</strong> Menghilangkan tercecernya chat WhatsApp manual.</span>
            </li>
          </ul>
        </div>

        <!-- PILAR 2: ANALYTICAL CRM -->
        <div class="bg-white p-6 rounded-vintage border border-krem-border shadow-sm space-y-3">
          <div class="w-10 h-10 rounded-xl bg-terakota text-white flex items-center justify-center font-bold">
            2
          </div>
          <h3 class="font-serif font-bold text-lg text-cokelat">Analytical CRM (Back-Office Intelligence)</h3>
          <p class="text-xs text-cokelat-muted leading-relaxed">
            Mengolah data transaksi mentah menjadi wawasan bisnis yang dapat ditindaklanjuti secara presisi.
          </p>
          <ul class="text-xs space-y-1.5 text-cokelat font-sans pt-1">
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>Segmentasi RFM Kuintil:</strong> Membagi 200 pelanggan ke 7 segmen perilaku.</span>
            </li>
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>Estimasi CLV:</strong> Menghitung nilai seumur hidup pelanggan bagi restoran.</span>
            </li>
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>Analitik Efektivitas Promo:</strong> Memantau konversi kupon & tambahan omzet.</span>
            </li>
          </ul>
        </div>

        <!-- PILAR 3: COLLABORATIVE CRM -->
        <div class="bg-white p-6 rounded-vintage border border-krem-border shadow-sm space-y-3">
          <div class="w-10 h-10 rounded-xl bg-mustard text-cokelat flex items-center justify-center font-bold">
            3
          </div>
          <h3 class="font-serif font-bold text-lg text-cokelat">Collaborative CRM (Multi-Channel Sync)</h3>
          <p class="text-xs text-cokelat-muted leading-relaxed">
            Membangun komunikasi dua arah antara restoran dan tamu lewat channel favorit mereka.
          </p>
          <ul class="text-xs space-y-1.5 text-cokelat font-sans pt-1">
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>Telegram Bot Terpadu:</strong> Kirim struk real-time, cek poin, dan jadwal nobar.</span>
            </li>
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>Asisten Virtual Upi Chat:</strong> Menjawab menu & jam buka 24 jam dengan guardrail.</span>
            </li>
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>WhatsApp Generator:</strong> Menjangkau tamu yang belum memiliki Telegram.</span>
            </li>
          </ul>
        </div>

        <!-- PILAR 4: LOYALTY & LIFECYCLE MANAGEMENT -->
        <div class="bg-white p-6 rounded-vintage border border-krem-border shadow-sm space-y-3">
          <div class="w-10 h-10 rounded-xl bg-sage text-white flex items-center justify-center font-bold">
            4
          </div>
          <h3 class="font-serif font-bold text-lg text-cokelat">Loyalty & Lifecycle Management</h3>
          <p class="text-xs text-cokelat-muted leading-relaxed">
            Menemani perjalanan tamu sejak kunjungan perdana hingga menjadi advokat setia merek.
          </p>
          <ul class="text-xs space-y-1.5 text-cokelat font-sans pt-1">
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>Acquisition:</strong> Voucher selamat datang Rp 15.000 untuk tamu baru.</span>
            </li>
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>Retention:</strong> Tier Tamu → Sahabat → Keluarga dengan buku besar poin.</span>
            </li>
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span><strong>Win-Back:</strong> Kampanye otomatis bagi segmen <em>Berisiko</em> (absen 45-90 hari).</span>
            </li>
          </ul>
        </div>

      </div>

      <!-- TAUTAN KE FOLDER DOKUMENTASI /DOCS/ -->
      <div class="bg-krem p-5 rounded-2xl border border-krem-border space-y-2 text-xs">
        <h4 class="font-serif font-bold text-sm text-cokelat">Dokumentasi Akademik Lengkap di Folder /docs/:</h4>
        <div class="flex flex-wrap gap-2 text-xs font-bold pt-1">
          <span class="bg-white border border-krem-border px-3 py-1.5 rounded-lg text-olive">docs/ERD.md (Mermaid)</span>
          <span class="bg-white border border-krem-border px-3 py-1.5 rounded-lg text-olive">docs/USE_CASES.md</span>
          <span class="bg-white border border-krem-border px-3 py-1.5 rounded-lg text-olive">docs/FLOWCHARTS.md</span>
          <span class="bg-white border border-krem-border px-3 py-1.5 rounded-lg text-olive">docs/CUSTOMER_JOURNEY_MAP.md</span>
          <span class="bg-white border border-krem-border px-3 py-1.5 rounded-lg text-olive">docs/DEMO_SCRIPT.md</span>
          <span class="bg-white border border-krem-border px-3 py-1.5 rounded-lg text-olive">docs/USER_TESTING_QUESTIONNAIRE.md</span>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4L: PENGATURAN & MULTI-PROVIDER AI
// ----------------------------------------------------------------------------
function renderAdminPengaturan(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="pb-4 border-b border-krem-border">
        <h2 class="font-serif text-2xl font-bold text-cokelat">Pengaturan Sistem & Provider AI</h2>
        <p class="text-xs text-cokelat-subtle">Konfigurasi aturan poin loyalitas, jam buka, dan multi-provider LLM (Gemini / OpenAI / DeepSeek).</p>
      </div>

      <!-- Multi-Provider AI Configuration (Part 3 & Part 6) -->
      <div class="bg-white p-5 rounded-2xl border border-krem-border shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <i data-lucide="bot" class="w-5 h-5 text-mustard-dark"></i>
            <h3 class="font-serif font-bold text-base text-cokelat">Konfigurasi Multi-Provider AI (Upi Chat)</h3>
          </div>
          <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded">Failover Aktif</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-bold text-cokelat mb-1">Provider Utama (Default):</label>
            <select class="w-full p-2.5 rounded-lg border border-krem-border bg-krem/30 text-cokelat font-bold">
              <option value="gemini" selected>Google Gemini (Recommended)</option>
              <option value="openai">OpenAI GPT-4o-mini</option>
              <option value="deepseek">DeepSeek Chat</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-cokelat mb-1">Mode Eksekusi:</label>
            <select class="w-full p-2.5 rounded-lg border border-krem-border bg-krem/30 text-cokelat">
              <option value="failover" selected>Failover Otomatis (Anti-Down)</option>
              <option value="single">Single Provider</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-cokelat mb-1">Temperature (Kreativitas):</label>
            <input type="number" min="0" max="1" step="0.1" value="0.7" class="w-full p-2.5 rounded-lg border border-krem-border bg-krem/30 text-cokelat">
          </div>
        </div>

        <div class="space-y-3 pt-2 border-t border-krem-border text-xs">
          <div>
            <label class="block font-bold text-cokelat mb-1">Google Gemini API Key (Enkripsi Supabase):</label>
            <input type="password" value="AIzaSy_DEMO_GEMINI_KEY_BUMI_UPI" class="w-full p-2.5 rounded-lg border border-krem-border bg-krem/20 font-mono text-cokelat">
          </div>
          <div>
            <label class="block font-bold text-cokelat mb-1">OpenAI API Key (Failover 1):</label>
            <input type="password" value="sk-demo-openai-key-bumi-upi" class="w-full p-2.5 rounded-lg border border-krem-border bg-krem/20 font-mono text-cokelat">
          </div>
        </div>
      </div>

      <!-- Aturan Poin Loyalitas & Operasional -->
      <div class="bg-white p-5 rounded-2xl border border-krem-border shadow-sm space-y-4 text-xs">
        <h3 class="font-serif font-bold text-base text-cokelat">Aturan Poin & Jam Operasional</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-cokelat mb-1">Rasio Pembelian per 1 Poin:</label>
            <input type="number" value="10000" class="w-full p-2.5 rounded-lg border border-krem-border bg-krem/30 text-cokelat font-bold">
            <span class="text-[10px] text-cokelat-subtle">Rp 10.000 = 1 Poin Bumi</span>
          </div>
          <div>
            <label class="block font-bold text-cokelat mb-1">Jam Operasional Resmi:</label>
            <input type="text" value="07:00 - 23:00 WIB" class="w-full p-2.5 rounded-lg border border-krem-border bg-krem/30 text-cokelat font-bold">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label class="block font-bold text-cokelat mb-1">Ambang Poin Tier Sahabat:</label>
            <input type="number" value="100" class="w-full p-2.5 rounded-lg border border-krem-border bg-krem/30 text-cokelat">
          </div>
          <div>
            <label class="block font-bold text-cokelat mb-1">Ambang Poin Tier Keluarga:</label>
            <input type="number" value="300" class="w-full p-2.5 rounded-lg border border-krem-border bg-krem/30 text-cokelat">
          </div>
        </div>

        <button onclick="alert('Pengaturan sistem & konfigurasi AI berhasil disimpan!')" class="bg-olive hover:bg-olive-600 text-white font-bold py-2.5 px-6 rounded-lg transition">
          Simpan Perubahan
        </button>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// SUB-VIEW 4M: AUDIT LOG (PART 6 MANDATORY)
// ----------------------------------------------------------------------------
function renderAdminAudit(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div class="pb-4 border-b border-krem-border">
        <h2 class="font-serif text-2xl font-bold text-cokelat">Audit Log Aktivitas Staf</h2>
        <p class="text-xs text-cokelat-subtle">Semua aksi sensitif (mutasi poin, perubahan aturan, akses data) tercatat permanen.</p>
      </div>

      <div class="bg-white rounded-2xl border border-krem-border shadow-sm overflow-hidden">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-krem text-cokelat font-bold border-b border-krem-border">
            <tr>
              <th class="p-3">Waktu (WIB)</th>
              <th class="p-3">Pelaku Aksi (Staf)</th>
              <th class="p-3">Jenis Aksi</th>
              <th class="p-3">Rincian Operasional</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-krem-border text-cokelat">
            ${AUDIT_LOGS_DB.map(log => `
              <tr class="hover:bg-krem/40">
                <td class="p-3 font-mono text-[11px]">${log.time}</td>
                <td class="p-3 font-bold">${log.staff}</td>
                <td class="p-3">
                  <span class="bg-slate-100 text-slate-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    ${log.action}
                  </span>
                </td>
                <td class="p-3">${log.detail}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// FLOATING UPI CHAT CONTROLLER
// ----------------------------------------------------------------------------
function toggleUpiChat() {
  const win = document.getElementById('upi-chat-window');
  if (win) win.classList.toggle('hidden');
}

function handleChatKey(e) {
  if (e.key === 'Enter') sendUpiMessage();
}

function quickAsk(text) {
  const input = document.getElementById('upi-chat-input');
  if (input) {
    input.value = text;
    sendUpiMessage();
  }
}

function sendUpiMessage() {
  const input = document.getElementById('upi-chat-input');
  const container = document.getElementById('upi-chat-messages');
  if (!input || !container) return;

  const text = input.value.trim();
  if (!text) return;

  // Append user bubble
  container.innerHTML += `
    <div class="flex items-start justify-end space-x-2">
      <div class="bg-terakota text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-xs">
        ${text}
      </div>
    </div>
  `;
  input.value = '';
  container.scrollTop = container.scrollHeight;

  // Simulate local AI grounded lookup
  setTimeout(() => {
    let reply = '';
    const q = text.toLowerCase();

    if (q.includes('jam') || q.includes('buka') || q.includes('operasional')) {
      reply = 'Rumah Tamah Bumi Upi buka setiap hari dari pukul **07:00 sampai 23:00 WIB**. Sarapan, makan siang, maupun ngopi malam selalu siap!';
    } else if (q.includes('menu') || q.includes('makan') || q.includes('rekomendasi')) {
      reply = 'Menu andalan khas rumah nenek: **Nasi Goreng Kecombrang (Rp 26.000)**, **Gulai Sapi Rempah Pasundan (Rp 34.000)**, dan **Es Cokelat Bumi Klasik (Rp 22.000)** disajikan dengan roti sobek hangat!';
    } else if (q.includes('poin') || q.includes('tier') || q.includes('level')) {
      reply = `Halo Kak ${STATE.currentUser.name}! Saldo Anda saat ini adalah **${STATE.currentUser.points_balance} Poin** (Tier: **${STATE.currentUser.tier}**). Setiap belanja Rp 10.000 dapat 1 Poin Bumi.`;
    } else if (q.includes('nobar') || q.includes('persib')) {
      reply = 'Nobar akbar **Persib vs Persija** hari Minggu, 8 November 2026 pukul 19:00 WIB di Bale Utama. Ada diskon 20% cemilan untuk member!';
    } else if (q.includes('alamat') || q.includes('lokasi')) {
      reply = 'Alamat kami di kawasan sejuk **Samarang, Garut, Jawa Barat**. Suasananya asri dengan jendela krepyak biru dan halaman rumput luas.';
    } else {
      reply = 'Punten, Upi belum memiliki informasi pasti mengenai hal tersebut dalam data resmi. Agar tidak keliru, silakan langsung hubungi WhatsApp admin kami di **0812-2334-4550** ya!';
    }

    container.innerHTML += `
      <div class="flex items-start space-x-2">
        <div class="w-6 h-6 rounded-full bg-olive text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">U</div>
        <div class="bg-krem p-3 rounded-2xl rounded-tl-sm border border-krem-border max-w-[85%] text-cokelat space-y-1">
          <p>${reply}</p>
        </div>
      </div>
    `;
    container.scrollTop = container.scrollHeight;
  }, 400);
}

// ----------------------------------------------------------------------------
// INTERACTIVE TELEGRAM BOT SIMULATOR
// ----------------------------------------------------------------------------
function toggleBotModal() {
  const modal = document.getElementById('telegram-bot-modal');
  if (modal) {
    modal.classList.toggle('hidden');
    renderBotHistory();
  }
}

function handleBotKey(e) {
  if (e.key === 'Enter') sendCustomBotMessage();
}

function sendBotCommand(cmd) {
  const container = document.getElementById('bot-messages-container');
  if (!container) return;

  STATE.botHistory.push({ sender: 'user', text: cmd });
  renderBotHistory();

  setTimeout(() => {
    let reply = '';
    const lower = cmd.toLowerCase();
    const u = STATE.currentUser;

    if (lower === '/poin') {
      reply = `Wilujeng sonten, Kak ${u.name}! 🏡\n\n📊 **Informasi Loyalitas Keluarga Bumi:**\n├ Saldo Poin Aktif : **${u.points_balance} Poin**\n├ Poin Kumulatif  : **${u.cumulative_points} Poin**\n├ Tingkat Level    : **${u.tier}**\n└ Progres Level    : **${Math.max(0, 300 - u.cumulative_points)} poin lagi** ke tingkat **Keluarga**\n\n*Catatan: Setiap belanja Rp 10.000 = 1 Poin Bumi.*`;
    } else if (lower === '/voucher') {
      reply = `🎟️ **Voucher Aktif Anda (Kak ${u.name}):**\n\n1. **Voucher Selamat Datang Tamu**\n   ├ Kode Unik : \`WILUJENG-UPI-8899\`\n   ├ Diskon    : Potongan Rp 15.000\n   └ Berlaku   : s/d 31 Des 2026\n\n2. **Voucher Nobar Persib Juara**\n   ├ Kode Unik : \`NOBAR-PERSIB-9911\`\n   ├ Diskon    : 20% Cemilan Hangat\n   └ Berlaku   : Setiap jadwal nobar`;
    } else if (lower === '/riwayat') {
      reply = `📜 **5 Transaksi Terakhir di Bumi Upi:**\n\n1. 📅 31 Okt 2026, 19.42 WIB\n   ├ Nasi Goreng Kecombrang, Es Cokelat\n   └ Total: Rp 48.000 (+4 Poin)\n\n2. 📅 24 Okt 2026, 13.15 WIB\n   ├ Nasi Liwet Kastrol Komplit\n   └ Total: Rp 64.000 (+6 Poin)`;
    } else if (lower === '/menu') {
      reply = `🍽️ **Menu Andalan Rumah Tamah Bumi Upi:**\n• Nasi Goreng Kecombrang — Rp 26.000\n• Nasi Ayam Kalasan Kremes — Rp 28.000\n• Gulai Sapi Pasundan — Rp 34.000\n• Es Cokelat Bumi Klasik — Rp 22.000\n• Tempe Mendoan Panas — Rp 16.000`;
    } else if (lower === '/reservasi') {
      reply = `🪑 **Layanan Reservasi Meja Bumi Upi:**\nJam Buka: 07:00 – 23:00 WIB setiap hari.\nArea: Bale Utama, Teras Jendela Krepyak, Halaman Rumput.\nHubungi WhatsApp admin di 0812-2334-4550 atau buat langsung di aplikasi web member!`;
    } else if (lower === '/ringkasan') {
      reply = `📊 **RINGKASAN OPERASIONAL BUMI UPI HARI INI:**\n📅 Sabtu, 31 Oktober 2026 — 21.40 WIB\n├ Total Transaksi : 48 Transaksi\n├ Total Omzet    : Rp 3.840.000\n├ Poin Diterbitkan: 384 Poin\n├ Reservasi Aktif : 6 Meja\n└ Repeat Rate    : 42.5%`;
    } else if (lower === '/keluhan') {
      reply = `⚠️ **INBOX KELUHAN TERKINI:**\n1. Hendra Gunawan (Rating 2/5 - Pelayanan)\n   "Es kunyit asam agak lama keluarnya waktu malam minggu, sekitar 25 menit."\n   Status: Sedang Diproses Staf Dapur`;
    } else {
      reply = `Sampurasun! Perintah "${cmd}" diterima. Ketik /poin, /voucher, /riwayat, /menu, atau /reservasi untuk bantuan. Hatur nuhun! 🌿`;
    }

    STATE.botHistory.push({ sender: 'bot', text: reply });
    renderBotHistory();
  }, 300);
}

function sendCustomBotMessage() {
  const input = document.getElementById('bot-text-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  input.value = '';
  sendBotCommand(val);
}

function simulateContactShare() {
  const phone = '081234567890';
  STATE.botHistory.push({ sender: 'user', text: `📱 [Membagikan Kontak: ${phone}]` });
  STATE.currentUser.is_phone_verified = true;
  renderBotHistory();

  setTimeout(() => {
    STATE.botHistory.push({
      sender: 'bot',
      text: `✅ **Nomor HP Anda Berhasil Terverifikasi!**\n\nNomor: \`${phone}\` telah resmi dihubungkan dengan akun Bumi Upi Anda.\n\nSekarang Anda dapat mengecek saldo poin (/poin), menukarkan voucher (/voucher), dan menerima struk digital setiap berkunjung ke Rumah Tamah. Hatur nuhun!`
    });
    renderBotHistory();
    alert('Nomor HP berhasil diverifikasi via mekanisme kontak Telegram!');
  }, 400);
}

function renderBotHistory() {
  const container = document.getElementById('bot-messages-container');
  if (!container) return;
  container.innerHTML = STATE.botHistory.map(item => `
    <div class="flex items-start ${item.sender === 'user' ? 'justify-end' : 'justify-start'}">
      <div class="p-3 rounded-xl max-w-[88%] text-xs whitespace-pre-wrap leading-relaxed ${item.sender === 'user' ? 'bg-[#2B5278] text-white rounded-tr-none' : 'bg-[#182533] text-slate-200 border border-slate-700/60 rounded-tl-none'}">
        ${item.text}
      </div>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

// ----------------------------------------------------------------------------
// INITIAL BOOTSTRAP
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('landing');
});
