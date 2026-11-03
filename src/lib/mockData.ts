/**
 * BUMI UPI CRM — REALISTIC SIMULATION DATASET (DATA SIMULASI)
 * =============================================================================
 * Case Study: Rumah Tamah Bumi Upi, Garut, Jawa Barat
 * Catatan: Ini adalah proyek studi kasus mata kuliah CRM, bukan situs resmi Bumi Upi.
 * Dataset mencakup:
 * - 200 Pelanggan realistis (Sunda & Priangan context)
 * - 2.140 Transaksi historis (1 Mei 2026 - 31 Oktober 2026)
 * - 7 Segmen RFM: Champions, Loyal, Potensial Loyal, Baru, Berisiko, Hampir Hilang, Hilang
 * - Perhitungan CLV (Customer Lifetime Value)
 * - Riwayat Poin, Voucher, Reservasi, Event, Feedback, & Audit Logs
 * =============================================================================
 */

export interface Profile {
  id: string;
  role: 'customer' | 'kasir' | 'admin';
  name: string;
  email: string;
  phone: string;
  is_phone_verified: boolean;
  telegram_chat_id: number | null;
  telegram_username: string | null;
  tier: 'Tamu' | 'Sahabat' | 'Keluarga';
  points_balance: number;
  cumulative_points: number;
  qr_code: string;
  birth_date: string;
  menu_preferences: string[];
  opt_in_promo: boolean;
  created_at: string;
  avatar_url?: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  is_featured: boolean;
  image_url: string;
}

export interface TransactionItem {
  menu_item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoice_number: string;
  idempotency_key: string;
  customer_id: string | null;
  customer_name?: string;
  customer_tier?: string;
  customer_phone?: string;
  cashier_id: string;
  cashier_name: string;
  subtotal: number;
  discount_amount: number;
  final_amount: number;
  points_earned: number;
  voucher_id: string | null;
  voucher_title?: string;
  status: 'completed' | 'cancelled';
  items: TransactionItem[];
  notes?: string;
  created_at: string; // ISO String in WIB
}

export interface PointsLedgerItem {
  id: string;
  customer_id: string;
  transaction_id?: string;
  points_change: number;
  reason: 'transaction' | 'welcome_bonus' | 'birthday' | 'voucher_redemption' | 'manual_adjustment';
  balance_after: number;
  notes: string;
  created_at: string;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'nominal' | 'percent' | 'free_item';
  discount_value: number;
  min_spend: number;
  max_discount?: number;
  quota: number;
  claimed_count: number;
  redeemed_count: number;
  valid_from: string;
  valid_until: string;
  target_tier?: 'Tamu' | 'Sahabat' | 'Keluarga';
  target_rfm_segment?: string;
  is_active: boolean;
}

export interface CustomerVoucher {
  id: string;
  customer_id: string;
  voucher_id: string;
  voucher_title: string;
  unique_code: string;
  qr_code: string;
  discount_type: 'nominal' | 'percent' | 'free_item';
  discount_value: number;
  min_spend: number;
  is_redeemed: boolean;
  redeemed_at?: string;
  expires_at: string;
  created_at: string;
}

export interface Reservation {
  id: string;
  customer_id: string | null;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  seating_area: 'Bale Utama' | 'Teras Jendela Krepyak' | 'Halaman Rumput' | 'Lesehan Kayu';
  status: 'menunggu' | 'dikonfirmasi' | 'selesai' | 'batal';
  special_notes?: string;
  staff_notes?: string;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  max_participants: number;
  current_participants: number;
  linked_voucher_id?: string;
  is_active: boolean;
  is_rsvp_open: boolean;
}

export interface CustomerFeedback {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_tier: string;
  rating: number; // 1 to 5
  category: 'rasa' | 'pelayanan' | 'suasana' | 'umum';
  comment: string;
  sentiment: 'positif' | 'netral' | 'negatif';
  status: 'baru' | 'diproses' | 'selesai';
  admin_response?: string;
  created_at: string;
}

export interface RFMScore {
  customer_id: string;
  customer_name: string;
  phone: string;
  tier: 'Tamu' | 'Sahabat' | 'Keluarga';
  recency_days: number;
  frequency_count: number;
  monetary_total: number;
  r_score: number;
  f_score: number;
  m_score: number;
  rfm_segment: 'Champions' | 'Loyal' | 'Potensial Loyal' | 'Baru' | 'Berisiko' | 'Hampir Hilang' | 'Hilang';
  clv_estimate: number;
  last_visit: string;
}

export interface Campaign {
  id: string;
  title: string;
  target_segment: string;
  channel: 'telegram' | 'whatsapp';
  message_template: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_at?: string;
  sent_at?: string;
  audience_count: number;
  delivered_count: number;
  conversion_count: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  staff_name: string;
  action: string;
  target_entity: string;
  target_id?: string;
  details: string;
  created_at: string;
}

// ----------------------------------------------------------------------------
// MASTER MENU ITEMS (Authentic Sunda & Nusantara)
// ----------------------------------------------------------------------------
export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-01',
    category_id: 'cat-nasi',
    category_name: 'Nasi & Makanan Utama',
    name: 'Nasi Goreng Kecombrang',
    description: 'Nasi goreng harum rempah bunga kecombrang dengan suwiran ayam kampung dan telur ceplok.',
    price: 26000,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-02',
    category_id: 'cat-nasi',
    category_name: 'Nasi & Makanan Utama',
    name: 'Nasi Ayam Kalasan Kremes',
    description: 'Ayam kalasan manis gurih dengan taburan kremesan renyah, lalap segar, dan sambal terasi.',
    price: 28000,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-03',
    category_id: 'cat-nasi',
    category_name: 'Nasi & Makanan Utama',
    name: 'Nasi Paru Serundeng Gurih',
    description: 'Nasi putih dengan irisan paru sapi ungkep empuk berbalut serundeng kelapa sangrai harum.',
    price: 30000,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-04',
    category_id: 'cat-nasi',
    category_name: 'Nasi & Makanan Utama',
    name: 'Nasi Liwet Kastrol Komplit (2 Orang)',
    description: 'Nasi liwet wangi daun salam sereh dengan teri medan, tahu tempe, ikan asin gabus, dan sambal goang.',
    price: 48000,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-05',
    category_id: 'cat-lauk',
    category_name: 'Lauk Pauk Tradisional',
    name: 'Gulai Sapi Rempah Pasundan',
    description: 'Gulai daging sapi empuk dengan kuah santan rempah kuning hangat khas tanah priangan.',
    price: 34000,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-06',
    category_id: 'cat-lauk',
    category_name: 'Lauk Pauk Tradisional',
    name: 'Pepes Ikan Mas Duri Lunak',
    description: 'Ikan mas bumbu kuning kemangi dibungkus daun pisang, dikukus hingga durinya sangat lembut.',
    price: 28000,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-07',
    category_id: 'cat-lauk',
    category_name: 'Lauk Pauk Tradisional',
    name: 'Empal Gepuk Daging Sapi Garut',
    description: 'Daging sapi gepuk manis legit gurih dengan taburan bawang merah goreng harum.',
    price: 32000,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-08',
    category_id: 'cat-sayur',
    category_name: 'Sayur & Sambal Khas Garut',
    name: 'Karedok Garut Segar',
    description: 'Kacang panjang, kol, toge, dan terong bulat mentah segar diaduk bumbu kacang kencur khas Sunda.',
    price: 18000,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-09',
    category_id: 'cat-sayur',
    category_name: 'Sayur & Sambal Khas Garut',
    name: 'Sayur Asem Kampung',
    description: 'Sayur asem kuah bening segar dengan kacang tanah, jagung manis, labu siam, dan melinjo.',
    price: 15000,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-10',
    category_id: 'cat-sayur',
    category_name: 'Sayur & Sambal Khas Garut',
    name: 'Sambal Dadak Terasi Uleg',
    description: 'Sambal terasi segar diuleg langsung dengan cabai rawit domba, tomat cengkir, dan perasan jeruk limau.',
    price: 6000,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-11',
    category_id: 'cat-camilan',
    category_name: 'Camilan & Gorengan Hangat',
    name: 'Tempe Mendoan Panas (Isi 4)',
    description: 'Tempe tipis khas Banyumasan digoreng setengah matang dengan bumbu daun bawang dan sambal kecap rawit.',
    price: 16000,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-12',
    category_id: 'cat-camilan',
    category_name: 'Camilan & Gorengan Hangat',
    name: 'Pisang Goreng Wijen Madu',
    description: 'Pisang kepok manis renyah dibalur madu hutan dan wijen sangrai gurih.',
    price: 20000,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-13',
    category_id: 'cat-minuman',
    category_name: 'Minuman Tradisional & Kopi',
    name: 'Es Cokelat Bumi Klasik',
    description: 'Cokelat pekat dingin creamy disajikan dengan sepotong roti sobek panggang hangat khas Bumi Upi.',
    price: 22000,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-14',
    category_id: 'cat-minuman',
    category_name: 'Minuman Tradisional & Kopi',
    name: 'Es Kunyit Asam Segar',
    description: 'Rebusan rimpang kunyit asli dan asam jawa dingin yang menyegarkan dahaga dan menyehatkan tubuh.',
    price: 18000,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-15',
    category_id: 'cat-minuman',
    category_name: 'Minuman Tradisional & Kopi',
    name: 'Bandrek Susu Gula Aren Garut',
    description: 'Minuman jahe hangat berempah dengan susu murni dan manis legit gula aren kawung khas Garut.',
    price: 18000,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'menu-16',
    category_id: 'cat-minuman',
    category_name: 'Minuman Tradisional & Kopi',
    name: 'Teh Manis Melati Dingin',
    description: 'Teh seduh tubruk wangi melati asli Jawa Barat dengan manis seimbang gula tebu alami.',
    price: 8000,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80'
  }
];

// ----------------------------------------------------------------------------
// MASTER VOUCHERS
// ----------------------------------------------------------------------------
export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'vcr-01',
    code: 'WILUJENG-UPI',
    title: 'Voucher Selamat Datang Tamu',
    description: 'Potongan Rp 15.000 untuk kunjungan pertama Anda sebagai Tamu Rumah Bumi Upi.',
    discount_type: 'nominal',
    discount_value: 15000,
    min_spend: 50000,
    quota: 500,
    claimed_count: 184,
    redeemed_count: 142,
    valid_from: '2026-05-01',
    valid_until: '2026-12-31',
    target_tier: 'Tamu',
    target_rfm_segment: 'Baru',
    is_active: true
  },
  {
    id: 'vcr-02',
    code: 'NOBAR-PERSIB',
    title: 'Voucher Nobar Persib Juara',
    description: 'Diskon 20% untuk semua menu cemilan hangat saat nobar pertandingan Persib.',
    discount_type: 'percent',
    discount_value: 20,
    min_spend: 40000,
    max_discount: 25000,
    quota: 200,
    claimed_count: 126,
    redeemed_count: 98,
    valid_from: '2026-06-01',
    valid_until: '2026-11-30',
    target_rfm_segment: 'Champions',
    is_active: true
  },
  {
    id: 'vcr-03',
    code: 'RINDU-RUMAH',
    title: 'Voucher Kangen Rumah Tamah',
    description: 'Potongan Rp 25.000 khusus untuk Anda yang sudah lama tidak singgah ke Bumi.',
    discount_type: 'nominal',
    discount_value: 25000,
    min_spend: 80000,
    quota: 300,
    claimed_count: 85,
    redeemed_count: 42,
    valid_from: '2026-07-01',
    valid_until: '2026-12-31',
    target_rfm_segment: 'Berisiko',
    is_active: true
  },
  {
    id: 'vcr-04',
    code: 'ULTAH-UPI',
    title: 'Traktiran Spesial Hari Ulang Tahun',
    description: 'Gratis 1 Porsi Es Cokelat Bumi Klasik + Pisang Goreng Madu di bulan kelahiran Anda.',
    discount_type: 'free_item',
    discount_value: 42000,
    min_spend: 50000,
    quota: 1000,
    claimed_count: 45,
    redeemed_count: 38,
    valid_from: '2026-01-01',
    valid_until: '2026-12-31',
    is_active: true
  },
  {
    id: 'vcr-05',
    code: 'KELUARGA-HEMAT',
    title: 'Apresiasi Tingkat Keluarga',
    description: 'Diskon 15% tanpa minimum belanja untuk anggota tier tertinggi Keluarga Bumi.',
    discount_type: 'percent',
    discount_value: 15,
    min_spend: 0,
    max_discount: 50000,
    quota: 500,
    claimed_count: 62,
    redeemed_count: 54,
    valid_from: '2026-08-01',
    valid_until: '2026-12-31',
    target_tier: 'Keluarga',
    target_rfm_segment: 'Champions',
    is_active: true
  }
];

// ----------------------------------------------------------------------------
// EVENTS & NOBAR
// ----------------------------------------------------------------------------
export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt-01',
    title: 'Nobar Akbar: Persib Bandung vs Persija Jakarta',
    description: 'Nonton bareng di layar proyektor Bale Utama Bumi Upi. Suasana hangat, camilan mendoan hangat, dan chant santun.',
    event_date: '2026-11-08',
    event_time: '19:00 WIB',
    max_participants: 80,
    current_participants: 64,
    linked_voucher_id: 'vcr-02',
    is_active: true,
    is_rsvp_open: true
  },
  {
    id: 'evt-02',
    title: 'Malam Keroncong & Pop Sunda Nostalgia',
    description: 'Pertunjukan musik akustik keroncong tempo doeloe di halaman rumput Bumi Upi dengan penerangan lentera.',
    event_date: '2026-11-15',
    event_time: '19:30 WIB',
    max_participants: 50,
    current_participants: 38,
    is_active: true,
    is_rsvp_open: true
  },
  {
    id: 'evt-03',
    title: 'Lokakarya Seduh Teh Melati & Rimpang Garut',
    description: 'Belajar meracik teh tubruk melati dan rempah kunyit asam bersama perajin herbal tradisional Garut.',
    event_date: '2026-11-22',
    event_time: '10:00 WIB',
    max_participants: 25,
    current_participants: 19,
    is_active: true,
    is_rsvp_open: true
  }
];

// Helper to generate Indonesian realistic names
const FIRST_NAMES = [
  'Asep', 'Cecep', 'Dadan', 'Eman', 'Ginanjar', 'Hendra', 'Iwan', 'Jajang', 'Kurniawan', 'Maman',
  'Nana', 'Oding', 'Purnama', 'Rizky', 'Suryana', 'Tata', 'Ujang', 'Wawan', 'Yayan', 'Zainal',
  'Ai', 'Cucu', 'Dewi', 'Elis', 'Fitri', 'Gita', 'Hani', 'Imas', 'Lilis', 'Marlina',
  'Neneng', 'Popon', 'Rina', 'Siti', 'Tuti', 'Wiwin', 'Yayah', 'Yuliani', 'Dian', 'Nadia'
];

const LAST_NAMES = [
  'Kusuma', 'Permana', 'Sutisna', 'Nugraha', 'Hidayat', 'Kurnia', 'Saputra', 'Hermawan', 'Pratama', 'Gunawan',
  'Suhendar', 'Sudrajat', 'Sanjaya', 'Budiman', 'Wibowo', 'Santoso', 'Ramadhan', 'Wijaya', 'Siregar', 'Mahendra',
  'Subagja', 'Supriatna', 'Iskandar', 'Somantri', 'Wiguna', 'Fauzi', 'Hakim', 'Bachtiar', 'Syahputra', 'Rustandi'
];

// Deterministic seed generation for 200 customers
export function generate200Customers(): Profile[] {
  const customers: Profile[] = [];

  // Default Primary Demo Users
  customers.push({
    id: 'usr-admin-01',
    role: 'admin',
    name: 'Teh Upi (Owner Bumi Upi)',
    email: 'admin@bumiupi.id',
    phone: '081223344550',
    is_phone_verified: true,
    telegram_chat_id: 10001,
    telegram_username: 'owner_bumiupi',
    tier: 'Keluarga',
    points_balance: 450,
    cumulative_points: 620,
    qr_code: 'BUMI-ADM-001',
    birth_date: '1985-06-15',
    menu_preferences: ['Nasi Goreng Kecombrang', 'Gulai Sapi Rempah Pasundan'],
    opt_in_promo: true,
    created_at: '2026-05-01T08:00:00+07:00'
  });

  customers.push({
    id: 'usr-kasir-01',
    role: 'kasir',
    name: 'Kang Asep (Kasir Utama)',
    email: 'kasir@bumiupi.id',
    phone: '081223344551',
    is_phone_verified: true,
    telegram_chat_id: 10002,
    telegram_username: 'kasir_bumiupi',
    tier: 'Sahabat',
    points_balance: 120,
    cumulative_points: 150,
    qr_code: 'BUMI-KSR-001',
    birth_date: '1996-03-22',
    menu_preferences: ['Tempe Mendoan Panas', 'Es Cokelat Bumi Klasik'],
    opt_in_promo: true,
    created_at: '2026-05-01T08:30:00+07:00'
  });

  customers.push({
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
    menu_preferences: ['Nasi Liwet Kastrol Komplit', 'Es Kunyit Asam Segar'],
    opt_in_promo: true,
    created_at: '2026-05-15T11:20:00+07:00'
  });

  // Generate 197 additional customers with realistic variations
  for (let i = 1; i <= 197; i++) {
    const fn = FIRST_NAMES[(i * 3 + 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 5 + 11) % LAST_NAMES.length];
    const name = `${fn} ${ln}`;
    const pad = String(i).padStart(3, '0');
    const phone = `0812${String(10000000 + i * 38291).slice(0, 8)}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`;

    // Distribution across tiers
    let tier: 'Tamu' | 'Sahabat' | 'Keluarga' = 'Tamu';
    let cumulative = 20 + ((i * 17) % 360);
    if (cumulative >= 300) {
      tier = 'Keluarga';
    } else if (cumulative >= 100) {
      tier = 'Sahabat';
    }
    const balance = Math.max(10, Math.floor(cumulative * 0.7));

    const isVerified = i % 3 !== 0;
    const tgChatId = isVerified ? 20000 + i : null;
    const tgUsername = isVerified ? `${fn.toLowerCase()}_${i}` : null;

    const bMonth = String(1 + (i % 12)).padStart(2, '0');
    const bDay = String(1 + (i % 28)).padStart(2, '0');

    customers.push({
      id: `usr-cust-${pad}`,
      role: 'customer',
      name,
      email,
      phone,
      is_phone_verified: isVerified,
      telegram_chat_id: tgChatId,
      telegram_username: tgUsername,
      tier,
      points_balance: balance,
      cumulative_points: cumulative,
      qr_code: `BUMI-CUST-${pad}`,
      birth_date: `199${i % 10}-${bMonth}-${bDay}`,
      menu_preferences: [
        MOCK_MENU_ITEMS[i % MOCK_MENU_ITEMS.length].name,
        MOCK_MENU_ITEMS[(i + 4) % MOCK_MENU_ITEMS.length].name
      ],
      opt_in_promo: i % 10 !== 0, // 90% opt in
      created_at: new Date(Date.parse('2026-05-01T00:00:00+07:00') + i * 78000000).toISOString()
    });
  }

  return customers;
}

// Deterministic seed generation for 2.140 realistic transactions spanning 6 months (May to Oct 2026)
export function generate2140Transactions(customers: Profile[]): Transaction[] {
  const transactions: Transaction[] = [];
  const onlyCustomers = customers.filter(c => c.role === 'customer');

  const startDate = new Date('2026-05-01T07:30:00+07:00').getTime();
  const endDate = new Date('2026-10-31T22:30:00+07:00').getTime();
  const totalDuration = endDate - startDate;

  // 2,140 transactions
  const TOTAL_TX = 2140;

  for (let i = 1; i <= TOTAL_TX; i++) {
    // Bias towards weekends and lunch/dinner hours
    const progress = i / TOTAL_TX;
    const rawTime = startDate + progress * totalDuration;
    const dateObj = new Date(rawTime);
    
    // Set realistic operating hours 07:00 - 23:00 WIB
    const hourMod = 11 + ((i * 7) % 11); // between 11:00 and 21:00 peak
    const minMod = (i * 13) % 60;
    dateObj.setHours(hourMod, minMod, 0, 0);

    // Pick customer: weighted so some are Champions (frequent) and some are 1-time (Baru)
    let custIndex = 0;
    if (i % 5 === 0) {
      custIndex = 2; // Dimas Kurniawan (Demo Customer) - very loyal
    } else if (i % 2 === 0) {
      // First 30 customers get high frequency (Champions & Loyal)
      custIndex = 3 + (i % 30);
    } else {
      custIndex = 3 + (i % (onlyCustomers.length - 3));
    }
    const cust = onlyCustomers[custIndex] || onlyCustomers[2];

    // Pick 2-4 items from menu
    const itemCount = 2 + (i % 3);
    const items: TransactionItem[] = [];
    let subtotal = 0;

    for (let k = 0; k < itemCount; k++) {
      const menu = MOCK_MENU_ITEMS[(i + k * 4) % MOCK_MENU_ITEMS.length];
      const qty = 1 + ((i + k) % 2); // 1 or 2
      const lineTotal = menu.price * qty;
      subtotal += lineTotal;
      items.push({
        menu_item_id: menu.id,
        item_name: menu.name,
        unit_price: menu.price,
        quantity: qty,
        subtotal: lineTotal
      });
    }

    // Apply voucher occasionally
    let discount = 0;
    let voucherId: string | null = null;
    let voucherTitle: string | undefined = undefined;

    if (i % 6 === 0 && subtotal >= 50000) {
      const vcr = MOCK_VOUCHERS[i % MOCK_VOUCHERS.length];
      voucherId = vcr.id;
      voucherTitle = vcr.title;
      if (vcr.discount_type === 'nominal') {
        discount = vcr.discount_value;
      } else if (vcr.discount_type === 'percent') {
        discount = Math.min(vcr.max_discount || 25000, Math.floor((subtotal * vcr.discount_value) / 100));
      } else {
        discount = 22000; // Free dessert
      }
    }

    const finalAmount = Math.max(0, subtotal - discount);
    const pointsEarned = Math.floor(finalAmount / 10000);

    const pad = String(i).padStart(5, '0');
    transactions.push({
      id: `tx-${pad}`,
      invoice_number: `BU-${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}-${pad}`,
      idempotency_key: `IDEMP-${pad}-${dateObj.getTime()}`,
      customer_id: cust.id,
      customer_name: cust.name,
      customer_tier: cust.tier,
      customer_phone: cust.phone,
      cashier_id: 'usr-kasir-01',
      cashier_name: 'Kang Asep (Kasir Utama)',
      subtotal,
      discount_amount: discount,
      final_amount: finalAmount,
      points_earned: pointsEarned,
      voucher_id: voucherId,
      voucher_title: voucherTitle,
      status: 'completed',
      items,
      notes: i % 15 === 0 ? 'Makan bersama keluarga besar di Bale Utama' : undefined,
      created_at: dateObj.toISOString()
    });
  }

  return transactions;
}

// Pre-computed RFM Segments from transactions
export function computeRFMScores(customers: Profile[], transactions: Transaction[]): RFMScore[] {
  const onlyCustomers = customers.filter(c => c.role === 'customer');
  const now = new Date('2026-10-31T23:59:59+07:00').getTime();

  const customerMap: Record<string, { recencyDays: number; freq: number; monetary: number; lastDate: string }> = {};

  // Initialize
  onlyCustomers.forEach(c => {
    customerMap[c.id] = {
      recencyDays: 180,
      freq: 0,
      monetary: 0,
      lastDate: c.created_at
    };
  });

  // Aggregate
  transactions.forEach(tx => {
    if (!tx.customer_id || !customerMap[tx.customer_id]) return;
    const txTime = new Date(tx.created_at).getTime();
    const diffDays = Math.max(0, Math.floor((now - txTime) / (1000 * 60 * 60 * 24)));
    
    if (diffDays < customerMap[tx.customer_id].recencyDays) {
      customerMap[tx.customer_id].recencyDays = diffDays;
      customerMap[tx.customer_id].lastDate = tx.created_at;
    }
    customerMap[tx.customer_id].freq += 1;
    customerMap[tx.customer_id].monetary += tx.final_amount;
  });

  return onlyCustomers.map(c => {
    const data = customerMap[c.id];
    const recency = data.recencyDays;
    const freq = data.freq;
    const mon = data.monetary;

    // Quintiles (1-5)
    let r = 1;
    if (recency <= 14) r = 5;
    else if (recency <= 30) r = 4;
    else if (recency <= 60) r = 3;
    else if (recency <= 90) r = 2;

    let f = 1;
    if (freq >= 15) f = 5;
    else if (freq >= 8) f = 4;
    else if (freq >= 4) f = 3;
    else if (freq >= 2) f = 2;

    let m = 1;
    if (mon >= 1500000) m = 5;
    else if (mon >= 800000) m = 4;
    else if (mon >= 400000) m = 3;
    else if (mon >= 150000) m = 2;

    // Segment Definition
    let segment: 'Champions' | 'Loyal' | 'Potensial Loyal' | 'Baru' | 'Berisiko' | 'Hampir Hilang' | 'Hilang' = 'Hilang';
    if (recency <= 21 && freq >= 8) {
      segment = 'Champions';
    } else if (freq >= 5 && recency <= 45) {
      segment = 'Loyal';
    } else if (recency <= 30 && freq >= 2 && freq <= 4) {
      segment = 'Potensial Loyal';
    } else if (recency <= 21 && freq <= 1) {
      segment = 'Baru';
    } else if (recency >= 46 && recency <= 90 && freq >= 3) {
      segment = 'Berisiko';
    } else if (recency >= 91 && recency <= 140) {
      segment = 'Hampir Hilang';
    } else {
      segment = 'Hilang';
    }

    // CLV Estimate: AOV * Purchase Frequency Annualized * 1.5 Margin Lifespan
    const aov = freq > 0 ? mon / freq : 0;
    const clv = Math.round(aov * freq * 2 * 1.25);

    return {
      customer_id: c.id,
      customer_name: c.name,
      phone: c.phone,
      tier: c.tier,
      recency_days: recency,
      frequency_count: freq,
      monetary_total: mon,
      r_score: r,
      f_score: f,
      m_score: m,
      rfm_segment: segment,
      clv_estimate: clv,
      last_visit: data.lastDate
    };
  });
}

// Customer Feedbacks
export const MOCK_FEEDBACKS: CustomerFeedback[] = [
  {
    id: 'fb-01',
    customer_id: 'usr-cust-demo',
    customer_name: 'Dimas Kurniawan',
    customer_tier: 'Sahabat',
    rating: 5,
    category: 'rasa',
    comment: 'Nasi goreng kecombrangnya wangi pisan! Serasa makan di kampung halaman nenek sendiri. Tetap pertahankan rasa autentiknya ya!',
    sentiment: 'positif',
    status: 'selesai',
    admin_response: 'Hatur nuhun pisan Kang Dimas! Ditunggu kepulangannya lagi ke Rumah Tamah!',
    created_at: '2026-10-28T20:15:00+07:00'
  },
  {
    id: 'fb-02',
    customer_id: 'usr-cust-005',
    customer_name: 'Dewi Permana',
    customer_tier: 'Keluarga',
    rating: 5,
    category: 'suasana',
    comment: 'Bale Utama sangat sejuk dan nyaman buat nobar Persib. Lampu temaram dan lagu keroncongnya bikin betah berjam-jam.',
    sentiment: 'positif',
    status: 'selesai',
    admin_response: 'Alhamdulillah, senang sekali Teh Dewi merasa nyaman di rumah.',
    created_at: '2026-10-25T14:40:00+07:00'
  },
  {
    id: 'fb-03',
    customer_id: 'usr-cust-012',
    customer_name: 'Hendra Gunawan',
    customer_tier: 'Sahabat',
    rating: 2,
    category: 'pelayanan',
    comment: 'Waktu malam minggu kemarin pesan es kunyit asam agak lama keluarnya, sekitar 25 menit baru sampai ke meja.',
    sentiment: 'negatif',
    status: 'diproses',
    admin_response: 'Mohon maaf sebesar-besarnya atas ketidaknyamanannya Kang Hendra. Kami sedang menambah staf seduh di jam sibuk akhir pekan.',
    created_at: '2026-10-26T21:05:00+07:00'
  },
  {
    id: 'fb-04',
    customer_id: 'usr-cust-033',
    customer_name: 'Lilis Suhendar',
    customer_tier: 'Tamu',
    rating: 4,
    category: 'rasa',
    comment: 'Gulai sapinya empuk sekali, kuahnya gurih. Sambal terasinya kalau bisa lebih pedas lagi ya.',
    sentiment: 'positif',
    status: 'selesai',
    admin_response: 'Hatur nuhun sarannya Teh Lilis, nanti bisa request sambal ekstra pedas ya!',
    created_at: '2026-10-22T12:30:00+07:00'
  }
];

// Reservations
export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res-01',
    customer_id: 'usr-cust-demo',
    guest_name: 'Dimas Kurniawan',
    guest_phone: '081234567890',
    guest_email: 'dimas@gmail.com',
    reservation_date: '2026-11-02',
    reservation_time: '18:30',
    guest_count: 6,
    seating_area: 'Bale Utama',
    status: 'dikonfirmasi',
    special_notes: 'Reuni keluarga kecil, minta meja dekat jendela krepyak.',
    staff_notes: 'Sudah disiapkan meja panjang No. 4',
    created_at: '2026-10-30T10:15:00+07:00'
  },
  {
    id: 'res-02',
    customer_id: 'usr-cust-008',
    guest_name: 'Siti Nurhaliza',
    guest_phone: '081239847123',
    reservation_date: '2026-11-03',
    reservation_time: '19:00',
    guest_count: 4,
    seating_area: 'Teras Jendela Krepyak',
    status: 'menunggu',
    special_notes: 'Ulang tahun adik perempuan, bawa kue sendiri.',
    created_at: '2026-10-31T09:00:00+07:00'
  },
  {
    id: 'res-03',
    customer_id: 'usr-cust-015',
    guest_name: 'Cecep Supriadi',
    guest_phone: '081248271822',
    reservation_date: '2026-11-08',
    reservation_time: '18:45',
    guest_count: 8,
    seating_area: 'Bale Utama',
    status: 'dikonfirmasi',
    special_notes: 'Nobar Persib vs Persija, minta posisi layar depan.',
    staff_notes: 'Voucher nobar sudah terhubung',
    created_at: '2026-10-29T16:20:00+07:00'
  }
];

// Active Campaigns
export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp-01',
    title: 'Win-Back: Kangen Rumah Tamah Bumi Upi',
    target_segment: 'Berisiko',
    channel: 'telegram',
    message_template: 'Sampurasun Kak {nama}! Sudah lama tidak singgah ke Bumi Upi. Ada sepiring gorengan hangat dan voucher Rp 25.000 menunggu Anda pulang. Ketik /voucher untuk klaim ya!',
    status: 'sent',
    scheduled_at: '2026-10-25T10:00:00+07:00',
    sent_at: '2026-10-25T10:05:00+07:00',
    audience_count: 42,
    delivered_count: 40,
    conversion_count: 14,
    created_at: '2026-10-24T15:00:00+07:00'
  },
  {
    id: 'cmp-02',
    title: 'Undangan Nobar Persib Juara',
    target_segment: 'Champions',
    channel: 'telegram',
    message_template: 'Wilujeng sonten Keluarga Bumi! Mari nobar laga akbar Persib vs Persija hari Minggu, 8 Nov di Bale Utama. Diskon 20% cemilan untuk anggota tercatat.',
    status: 'sent',
    scheduled_at: '2026-10-28T14:00:00+07:00',
    sent_at: '2026-10-28T14:02:00+07:00',
    audience_count: 35,
    delivered_count: 35,
    conversion_count: 22,
    created_at: '2026-10-27T11:00:00+07:00'
  }
];

// Audit Logs
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    staff_name: 'Teh Upi (Owner)',
    action: 'UPDATE_POINTS_RULE',
    target_entity: 'system_settings',
    details: 'Mengubah rasio poin: Rp 10.000 = 1 Poin Bumi',
    created_at: '2026-10-30T17:22:00+07:00'
  },
  {
    id: 'aud-02',
    staff_name: 'Kang Asep (Kasir)',
    action: 'RECORD_TRANSACTION',
    target_entity: 'transactions',
    target_id: 'tx-02140',
    details: 'Input transaksi kasir meja 3 senilai Rp 86.000 (Poin: +8)',
    created_at: '2026-10-31T20:12:00+07:00'
  },
  {
    id: 'aud-03',
    staff_name: 'Teh Upi (Owner)',
    action: 'TRIGGER_CAMPAIGN',
    target_entity: 'campaigns',
    target_id: 'cmp-02',
    details: 'Broadcast kampanye Nobar ke segmen Champions (35 penerima)',
    created_at: '2026-10-28T14:00:00+07:00'
  }
];
