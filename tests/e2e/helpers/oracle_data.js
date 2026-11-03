/**
 * Authoritative Oracle Data & Specifications
 * Source Documents:
 * - MENU-REGULER.pdf (Garut, Jawa Barat)
 * - PROJECT.md (Architecture & Feature Inventory)
 * - spec_miner_survey_1 / explorer_survey_2 / explorer_survey_3
 */

export const ORACLE_CATEGORIES = [
  { code: 'cat-cemilan', name: 'Cemilan Cepuluh', expectedCount: 18, parent: 'Camilan Tradisional' },
  { code: 'cat-pepes', name: 'Ber Pepes An', expectedCount: 4, parent: 'Lauk Pauk & Pepes' },
  { code: 'cat-mie', name: 'Emih - Emihan', expectedCount: 6, parent: 'Nasi & Makanan Utama' },
  { code: 'cat-nasgor', name: 'Pemadam Kelaparan', expectedCount: 7, parent: 'Nasi & Makanan Utama' },
  { code: 'cat-nasi-spesial', name: 'Tuntutan Masyarakat', expectedCount: 8, parent: 'Nasi & Makanan Utama' },
  { code: 'cat-protein', name: 'Sumber Protein', expectedCount: 5, parent: 'Lauk Pauk & Pepes' },
  { code: 'cat-seger', name: 'Seger Adem', expectedCount: 9, parent: 'Minuman Tradisional & Dingin' },
  { code: 'cat-es', name: 'Es Esan', expectedCount: 3, parent: 'Minuman Tradisional & Dingin' },
  { code: 'cat-teh', name: 'Teh & Susu', expectedCount: 10, parent: 'Minuman Tradisional & Dingin' },
  { code: 'cat-jamu', name: 'Jejamuan', expectedCount: 3, parent: 'Minuman Tradisional & Dingin' },
  { code: 'cat-kopi', name: 'Kopi', expectedCount: 6, parent: 'Kopi & Cokelat' },
  { code: 'cat-jus', name: 'Jus 4 U', expectedCount: 8, parent: 'Minuman Tradisional & Dingin' },
  { code: 'cat-roti-manis', name: 'Satu Rasa Cukup', expectedCount: 6, parent: 'Roti & Pisang Bakar' },
  { code: 'cat-roti-gurih', name: 'Roti Bakar Gurih', expectedCount: 6, parent: 'Roti & Pisang Bakar' },
  { code: 'cat-roti-spesial', name: 'Dua Lebih Spesial', expectedCount: 2, parent: 'Roti & Pisang Bakar' },
  { code: 'cat-pisang', name: 'Pisang Bakar', expectedCount: 4, parent: 'Roti & Pisang Bakar' }
];

export const ORACLE_105_ITEMS = [
  // Cemilan Cepuluh (18)
  { id: 1, name: 'Sate Aci', category: 'Cemilan Cepuluh', price: 14000, tags: [] },
  { id: 2, name: 'Tahu Cirawraw', category: 'Cemilan Cepuluh', price: 15000, tags: [] },
  { id: 3, name: 'Bakso Yang Ditukar', category: 'Cemilan Cepuluh', price: 20000, tags: [] },
  { id: 4, name: 'Dimsum Ekonomis', category: 'Cemilan Cepuluh', price: 15000, tags: [] },
  { id: 5, name: 'Dimsum Sejahtera', category: 'Cemilan Cepuluh', price: 20000, tags: [] },
  { id: 6, name: 'Pisang Kukus', category: 'Cemilan Cepuluh', price: 17000, tags: [] },
  { id: 7, name: 'Pisang Goreng', category: 'Cemilan Cepuluh', price: 20000, tags: [] },
  { id: 8, name: 'Singkong Goreng', category: 'Cemilan Cepuluh', price: 20000, tags: [] },
  { id: 9, name: 'Kentang Sosis', category: 'Cemilan Cepuluh', price: 22000, tags: [] },
  { id: 10, name: 'Ulen Upi', category: 'Cemilan Cepuluh', price: 22000, tags: [] },
  { id: 11, name: 'Ketan Kinca', category: 'Cemilan Cepuluh', price: 24500, tags: ['Rekomendasi'] },
  { id: 12, name: 'Gorengan Darmaji', category: 'Cemilan Cepuluh', price: 17000, tags: [] },
  { id: 13, name: 'Cireng Ayah Ojak', category: 'Cemilan Cepuluh', price: 17000, tags: [] },
  { id: 14, name: 'Tahu Cabe Rewel', category: 'Cemilan Cepuluh', price: 22000, tags: ['Pedas'] },
  { id: 15, name: 'Cireng Tahu Gejrot', category: 'Cemilan Cepuluh', price: 18000, tags: ['Favorit', 'Pedas'] },
  { id: 16, name: 'Pagordas', category: 'Cemilan Cepuluh', price: 20000, tags: [] },
  { id: 17, name: 'Lumpia Vietnam', category: 'Cemilan Cepuluh', price: 22000, tags: [] },
  { id: 18, name: 'Tuangeun Bocil', category: 'Cemilan Cepuluh', price: 25000, tags: ['Untuk Anak', 'Rekomendasi'] },

  // Ber Pepes An (4)
  { id: 19, name: 'Pepes Goreng Ayam Bule', category: 'Ber Pepes An', price: 39000, tags: [] },
  { id: 20, name: 'Pepes Ayam Bule', category: 'Ber Pepes An', price: 39000, tags: [] },
  { id: 21, name: 'Pepes Ayam Kampung', category: 'Ber Pepes An', price: 48000, tags: [] },
  { id: 22, name: 'Pepes Goreng Ayam Kampung', category: 'Ber Pepes An', price: 48000, tags: [] },

  // Emih - Emihan (6)
  { id: 23, name: 'Mie Kasep', category: 'Emih - Emihan', price: 24000, tags: ['Rekomendasi'] },
  { id: 24, name: 'Mie Racing', category: 'Emih - Emihan', price: 25000, tags: ['Rekomendasi'] },
  { id: 25, name: 'Mie Ebroh', category: 'Emih - Emihan', price: 25000, tags: ['Pedas'] },
  { id: 26, name: 'Mie Chili Oil', category: 'Emih - Emihan', price: 24000, tags: [] },
  { id: 27, name: 'Mie Anak Sekolah', category: 'Emih - Emihan', price: 27000, tags: ['Untuk Anak', 'Rekomendasi'] },
  { id: 28, name: 'Bihun Kuwah', category: 'Emih - Emihan', price: 29000, tags: [] },

  // Pemadam Kelaparan (7)
  { id: 29, name: 'Nasi Goreng Upiwan', category: 'Pemadam Kelaparan', price: 25000, tags: [] },
  { id: 30, name: 'Nasi Goreng Upiwati', category: 'Pemadam Kelaparan', price: 26000, tags: [] },
  { id: 31, name: 'Nasi Goreng Cumi Upi', category: 'Pemadam Kelaparan', price: 28000, tags: ['Favorit', 'Pedas'] },
  { id: 32, name: 'Nasi Goreng Bunda Kornet', category: 'Pemadam Kelaparan', price: 27000, tags: [] },
  { id: 33, name: 'Nasi Goreng Peda Kemangi', category: 'Pemadam Kelaparan', price: 27000, tags: ['Favorit', 'Pedas'] },
  { id: 34, name: 'Nasi Goreng Omah', category: 'Pemadam Kelaparan', price: 23000, tags: [] },
  { id: 35, name: 'Nasi Goreng Kecombrang', category: 'Pemadam Kelaparan', price: 24000, tags: [] },

  // Tuntutan Masyarakat (8)
  { id: 36, name: 'Nasi Galo Bumi Upi', category: 'Tuntutan Masyarakat', price: 39000, tags: ['Favorit', 'Pedas'] },
  { id: 37, name: 'Nasi Paru Serundeng', category: 'Tuntutan Masyarakat', price: 25000, tags: [] },
  { id: 38, name: 'Nasi Dangdutan', category: 'Tuntutan Masyarakat', price: 36000, tags: ['Favorit', 'Pedas'] },
  { id: 39, name: 'Nasi Buntut Rewel', category: 'Tuntutan Masyarakat', price: 45000, tags: ['Pedas'] },
  { id: 40, name: 'Nasi Buntut Kebakaran', category: 'Tuntutan Masyarakat', price: 40000, tags: [] },
  { id: 41, name: 'Nasi Ghewlaa', category: 'Tuntutan Masyarakat', price: 29000, tags: ['Rekomendasi'] },
  { id: 42, name: 'Lidah Sambel Hejo', category: 'Tuntutan Masyarakat', price: 47000, tags: ['Rekomendasi'] },
  { id: 43, name: 'Buntut Goreng Sambal Hejo', category: 'Tuntutan Masyarakat', price: 45000, tags: ['Rekomendasi'] },

  // Sumber Protein (5)
  { id: 44, name: 'Nasi Ayam Ajep-Ajep', category: 'Sumber Protein', price: 24000, tags: [] },
  { id: 45, name: 'Nasi Ayam Omongan Tetangga', category: 'Sumber Protein', price: 24000, tags: [] },
  { id: 46, name: 'Nasi Ayam Kalasan', category: 'Sumber Protein', price: 32000, tags: [] },
  { id: 47, name: 'Nasi Kulit Serundeng', category: 'Sumber Protein', price: 22000, tags: [] },
  { id: 48, name: 'Bebek Sambel Hejo', category: 'Sumber Protein', price: 45000, tags: ['Rekomendasi'] },

  // Seger Adem (9)
  { id: 49, name: 'Es Cincau Jadoel', category: 'Seger Adem', price: 19000, variants: { sizeM: 19000, sizeL: 24000 }, temps: ['dingin'] },
  { id: 50, name: 'Es Limun', category: 'Seger Adem', price: 20000, temps: ['dingin'] },
  { id: 51, name: 'Es Soda Gembira', category: 'Seger Adem', price: 20000, temps: ['dingin'] },
  { id: 52, name: 'Es Cincau Hijau', category: 'Seger Adem', price: 20000, temps: ['dingin'] },
  { id: 53, name: 'Es Jeruk / Jeruk Panas', category: 'Seger Adem', price: 18000, temps: ['dingin', 'panas'] },
  { id: 54, name: 'Es Kelapa Muda', category: 'Seger Adem', price: 10000, temps: ['dingin'] },
  { id: 55, name: 'Es Kelapa Jeruk', category: 'Seger Adem', price: 12000, temps: ['dingin'] },
  { id: 56, name: 'Es Kelapa Nangka', category: 'Seger Adem', price: 18000, temps: ['dingin'] },
  { id: 57, name: 'Es Cendol', category: 'Seger Adem', price: 18000, temps: ['dingin'] },

  // Es Esan (3)
  { id: 58, name: 'Es Krim Bumi Upi', category: 'Es Esan', price: 22000, temps: ['dingin'] },
  { id: 59, name: 'Es ABC', category: 'Es Esan', price: 28000, temps: ['dingin'] },
  { id: 60, name: 'Es Teller', category: 'Es Esan', price: 30000, temps: ['dingin'] },

  // Teh & Susu (10)
  { id: 61, name: 'Teh Tawar Jumbo', category: 'Teh & Susu', price: 18000, temps: ['dingin', 'panas'] },
  { id: 62, name: 'Teh Manis Jumbo', category: 'Teh & Susu', price: 22000, temps: ['dingin', 'panas'] },
  { id: 63, name: 'Teh Manis', category: 'Teh & Susu', price: 13000, temps: ['dingin', 'panas'] },
  { id: 64, name: 'Teh Lemon', category: 'Teh & Susu', price: 20000, variants: { sizeM: 20000, sizeL: 25000 }, temps: ['dingin', 'panas'] },
  { id: 65, name: 'Teh Sereh', category: 'Teh & Susu', price: 17000, temps: ['panas'] },
  { id: 66, name: 'Es Cokelat Malt Dinosaurus', category: 'Teh & Susu', price: 20000, variants: { sizeM: 20000, sizeL: 25000 }, temps: ['dingin'] },
  { id: 67, name: 'Cokelat Malt Panas', category: 'Teh & Susu', price: 20000, temps: ['panas'] },
  { id: 68, name: 'Es Goyobod Alun - Alun', category: 'Teh & Susu', price: 18000, temps: ['dingin'] },
  { id: 69, name: 'Teh Susu Tolak Angin', category: 'Teh & Susu', price: 23000, variants: { sizeM: 23000, sizeL: 25000 }, temps: ['dingin', 'panas'] },
  { id: 70, name: 'Teh Tarik', category: 'Teh & Susu', price: 20000, variants: { sizeM: 20000, sizeL: 25000 }, temps: ['dingin', 'panas'] },

  // Jejamuan (3)
  { id: 71, name: 'Es Beras Kencur', category: 'Jejamuan', price: 18000, temps: ['dingin'] },
  { id: 72, name: 'Es Kunyit Asem', category: 'Jejamuan', price: 18000, temps: ['dingin'] },
  { id: 73, name: 'Es Beras Kencur Jeruk', category: 'Jejamuan', price: 20000, temps: ['dingin'] },

  // Kopi (6)
  { id: 74, name: 'Kopi Hitam', category: 'Kopi', price: 17000, variants: { sizeM: 17000, sizeL: 22000 }, temps: ['dingin', 'panas'] },
  { id: 75, name: 'Kopi Susu', category: 'Kopi', price: 22000, variants: { sizeM: 22000, sizeL: 27000 }, temps: ['dingin', 'panas'] },
  { id: 76, name: 'Kopi Susu Butter', category: 'Kopi', price: 22000, temps: ['panas'] },
  { id: 77, name: 'Kopi Susu Santan', category: 'Kopi', price: 23000, variants: { sizeM: 23000, sizeL: 27000 }, temps: ['dingin', 'panas'] },
  { id: 78, name: 'Kopi Susu Kecap', category: 'Kopi', price: 22000, variants: { sizeM: 22000, sizeL: 27000 }, temps: ['dingin', 'panas'] },
  { id: 79, name: 'Kopi Krim Soda', category: 'Kopi', price: 23000, temps: ['dingin'] },

  // Jus 4 U (8)
  { id: 80, name: 'Jus Tomat', category: 'Jus 4 U', price: 17000, temps: ['dingin'] },
  { id: 81, name: 'Jus Sirsak', category: 'Jus 4 U', price: 18000, temps: ['dingin'] },
  { id: 82, name: 'Jus Semangka', category: 'Jus 4 U', price: 20000, temps: ['dingin'] },
  { id: 83, name: 'Jus Mangga', category: 'Jus 4 U', price: 25000, temps: ['dingin'] },
  { id: 84, name: 'Jus Alpukat', category: 'Jus 4 U', price: 25000, temps: ['dingin'] },
  { id: 85, name: 'Jus Tape', category: 'Jus 4 U', price: 20000, temps: ['dingin'] },
  { id: 86, name: 'Jus Stroberi', category: 'Jus 4 U', price: 24000, temps: ['dingin'] },
  { id: 87, name: 'Jus Jambu', category: 'Jus 4 U', price: 20000, temps: ['dingin'] },

  // Satu Rasa Cukup (6)
  { id: 88, name: 'Roti Bakar Cokelat', category: 'Satu Rasa Cukup', price: 18000, tags: [] },
  { id: 89, name: 'Roti Bakar Keju', category: 'Satu Rasa Cukup', price: 20000, tags: [] },
  { id: 90, name: 'Roti Bakar Gula Klasik', category: 'Satu Rasa Cukup', price: 15000, tags: [] },
  { id: 91, name: 'Roti Bakar Nanas', category: 'Satu Rasa Cukup', price: 18000, tags: [] },
  { id: 92, name: 'Roti Bakar Srikaya', category: 'Satu Rasa Cukup', price: 18000, tags: [] },
  { id: 93, name: 'Burger Gulai Upi', category: 'Satu Rasa Cukup', price: 30000, tags: [] },

  // Roti Bakar Gurih (6)
  { id: 94, name: 'Roti Bakar Telur', category: 'Roti Bakar Gurih', price: 20000, tags: [] },
  { id: 95, name: 'Roti Bakar Telur Keju', category: 'Roti Bakar Gurih', price: 23000, tags: [] },
  { id: 96, name: 'Roti Bakar Kornet', category: 'Roti Bakar Gurih', price: 20000, tags: [] },
  { id: 97, name: 'Roti Bakar Kornet Telur Keju', category: 'Roti Bakar Gurih', price: 26000, tags: [] },
  { id: 98, name: 'Roti Bakar Kornet Telur', category: 'Roti Bakar Gurih', price: 24000, tags: [] },
  { id: 99, name: 'Roti Bakar Kornet Keju', category: 'Roti Bakar Gurih', price: 24000, tags: [] },

  // Dua Lebih Spesial (2)
  { id: 100, name: 'Roti Bakar 2 rasa', category: 'Dua Lebih Spesial', price: 21000, tags: [] },
  { id: 101, name: 'Roti Bakar Mocca nougat', category: 'Dua Lebih Spesial', price: 21000, tags: [] },

  // Pisang Bakar (4)
  { id: 102, name: 'Pisang Bakar Cokelat', category: 'Pisang Bakar', price: 20000, tags: [] },
  { id: 103, name: 'Pisang Bakar Keju', category: 'Pisang Bakar', price: 21000, tags: [] },
  { id: 104, name: 'Pisang Bakar Cokelat Keju', category: 'Pisang Bakar', price: 23000, tags: [] },
  { id: 105, name: 'Pisang Bakar Double Cokelat', category: 'Pisang Bakar', price: 23000, tags: [] }
];

export const ORACLE_TOKENS = {
  colors: {
    olive: '#3E4F30',
    krem: '#F5EEDC',
    terakota: '#B4532A',
    mustard: '#D4A24C'
  },
  fonts: ['Fraunces', 'Caveat', 'Plus Jakarta Sans']
};

export const ORACLE_DEMO_USERS = {
  admin: {
    email: 'putriayusagita02@gmail.com',
    password: 'BumiUpiAdmin2026!',
    role: 'admin',
    name: 'Teh Upi (Owner Bumi Upi)'
  },
  kasir: {
    email: 'kasir@bumiupi.id',
    passwordCandidates: ['kasir2026', 'kasir2026!', 'BumiUpiKasir2026!'],
    role: 'kasir',
    name: 'Kang Asep (Kasir Utama)'
  },
  customer: {
    email: 'customer@bumiupi.id',
    phone: '081234567890',
    passwordCandidates: ['tamu2026', 'tamu2026!', 'BumiUpiTamu2026!'],
    role: 'customer',
    name: 'Dimas Kurniawan',
    tier: 'Sahabat',
    points: 142
  }
};

export const ORACLE_RFM_SEGMENTS = [
  'Champions',
  'Loyal',
  'Potensial Loyal',
  'Baru',
  'Berisiko',
  'Hampir Hilang',
  'Hilang'
];

export const ORACLE_TIER_RULES = {
  pointsPerRupiah: 10000, // 1 point per Rp 10.000
  thresholds: {
    tamu: 0,
    sahabat: 100,
    keluarga: 300
  }
};

export const ORACLE_ORDER_STATUSES = [
  'pending_payment',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'cancelled'
];
