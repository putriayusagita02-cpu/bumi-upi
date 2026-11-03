/**
 * 105 Authoritative Catalog Items and 16 Categories for Rumah Tamah Bumi Upi
 * Source: MENU-REGULER.pdf (Garut, Jawa Barat)
 */

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  tags?: string[];
  variants?: { sizeM: number; sizeL: number };
  temps?: ('dingin' | 'panas')[];
  stock?: number;
  isAvailable?: boolean;
}

export interface MenuCategory {
  code: string;
  name: string;
  expectedCount: number;
  parent: string;
}

export const MENU_CATEGORIES: MenuCategory[] = [
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

export const CATALOG_105_ITEMS: MenuItem[] = [
  // Cemilan Cepuluh (18)
  { id: 1, name: 'Sate Aci', category: 'Cemilan Cepuluh', price: 14000, tags: [], stock: 45, isAvailable: true },
  { id: 2, name: 'Tahu Cirawraw', category: 'Cemilan Cepuluh', price: 15000, tags: [], stock: 40, isAvailable: true },
  { id: 3, name: 'Bakso Yang Ditukar', category: 'Cemilan Cepuluh', price: 20000, tags: [], stock: 35, isAvailable: true },
  { id: 4, name: 'Dimsum Ekonomis', category: 'Cemilan Cepuluh', price: 15000, tags: [], stock: 50, isAvailable: true },
  { id: 5, name: 'Dimsum Sejahtera', category: 'Cemilan Cepuluh', price: 20000, tags: [], stock: 40, isAvailable: true },
  { id: 6, name: 'Pisang Kukus', category: 'Cemilan Cepuluh', price: 17000, tags: [], stock: 30, isAvailable: true },
  { id: 7, name: 'Pisang Goreng', category: 'Cemilan Cepuluh', price: 20000, tags: [], stock: 60, isAvailable: true },
  { id: 8, name: 'Singkong Goreng', category: 'Cemilan Cepuluh', price: 20000, tags: [], stock: 50, isAvailable: true },
  { id: 9, name: 'Kentang Sosis', category: 'Cemilan Cepuluh', price: 22000, tags: [], stock: 35, isAvailable: true },
  { id: 10, name: 'Ulen Upi', category: 'Cemilan Cepuluh', price: 22000, tags: [], stock: 25, isAvailable: true },
  { id: 11, name: 'Ketan Kinca', category: 'Cemilan Cepuluh', price: 24500, tags: ['Rekomendasi'], stock: 20, isAvailable: true },
  { id: 12, name: 'Gorengan Darmaji', category: 'Cemilan Cepuluh', price: 17000, tags: [], stock: 40, isAvailable: true },
  { id: 13, name: 'Cireng Ayah Ojak', category: 'Cemilan Cepuluh', price: 17000, tags: [], stock: 55, isAvailable: true },
  { id: 14, name: 'Tahu Cabe Rewel', category: 'Cemilan Cepuluh', price: 22000, tags: ['Pedas'], stock: 30, isAvailable: true },
  { id: 15, name: 'Cireng Tahu Gejrot', category: 'Cemilan Cepuluh', price: 18000, tags: ['Favorit', 'Pedas'], stock: 45, isAvailable: true },
  { id: 16, name: 'Pagordas', category: 'Cemilan Cepuluh', price: 20000, tags: [], stock: 25, isAvailable: true },
  { id: 17, name: 'Lumpia Vietnam', category: 'Cemilan Cepuluh', price: 22000, tags: [], stock: 20, isAvailable: true },
  { id: 18, name: 'Tuangeun Bocil', category: 'Cemilan Cepuluh', price: 25000, tags: ['Untuk Anak', 'Rekomendasi'], stock: 35, isAvailable: true },

  // Ber Pepes An (4)
  { id: 19, name: 'Pepes Goreng Ayam Bule', category: 'Ber Pepes An', price: 39000, tags: [], stock: 15, isAvailable: true },
  { id: 20, name: 'Pepes Ayam Bule', category: 'Ber Pepes An', price: 39000, tags: [], stock: 15, isAvailable: true },
  { id: 21, name: 'Pepes Ayam Kampung', category: 'Ber Pepes An', price: 48000, tags: [], stock: 12, isAvailable: true },
  { id: 22, name: 'Pepes Goreng Ayam Kampung', category: 'Ber Pepes An', price: 48000, tags: [], stock: 12, isAvailable: true },

  // Emih - Emihan (6)
  { id: 23, name: 'Mie Kasep', category: 'Emih - Emihan', price: 24000, tags: ['Rekomendasi'], stock: 40, isAvailable: true },
  { id: 24, name: 'Mie Racing', category: 'Emih - Emihan', price: 25000, tags: ['Rekomendasi'], stock: 45, isAvailable: true },
  { id: 25, name: 'Mie Ebroh', category: 'Emih - Emihan', price: 25000, tags: ['Pedas'], stock: 35, isAvailable: true },
  { id: 26, name: 'Mie Chili Oil', category: 'Emih - Emihan', price: 24000, tags: [], stock: 30, isAvailable: true },
  { id: 27, name: 'Mie Anak Sekolah', category: 'Emih - Emihan', price: 27000, tags: ['Untuk Anak', 'Rekomendasi'], stock: 25, isAvailable: true },
  { id: 28, name: 'Bihun Kuwah', category: 'Emih - Emihan', price: 29000, tags: [], stock: 30, isAvailable: true },

  // Pemadam Kelaparan (7)
  { id: 29, name: 'Nasi Goreng Upiwan', category: 'Pemadam Kelaparan', price: 25000, tags: [], stock: 50, isAvailable: true },
  { id: 30, name: 'Nasi Goreng Upiwati', category: 'Pemadam Kelaparan', price: 26000, tags: [], stock: 50, isAvailable: true },
  { id: 31, name: 'Nasi Goreng Cumi Upi', category: 'Pemadam Kelaparan', price: 28000, tags: ['Favorit', 'Pedas'], stock: 35, isAvailable: true },
  { id: 32, name: 'Nasi Goreng Bunda Kornet', category: 'Pemadam Kelaparan', price: 27000, tags: [], stock: 40, isAvailable: true },
  { id: 33, name: 'Nasi Goreng Peda Kemangi', category: 'Pemadam Kelaparan', price: 27000, tags: ['Favorit', 'Pedas'], stock: 30, isAvailable: true },
  { id: 34, name: 'Nasi Goreng Omah', category: 'Pemadam Kelaparan', price: 23000, tags: [], stock: 45, isAvailable: true },
  { id: 35, name: 'Nasi Goreng Kecombrang', category: 'Pemadam Kelaparan', price: 24000, tags: [], stock: 35, isAvailable: true },

  // Tuntutan Masyarakat (8)
  { id: 36, name: 'Nasi Galo Bumi Upi', category: 'Tuntutan Masyarakat', price: 39000, tags: ['Favorit', 'Pedas'], stock: 25, isAvailable: true },
  { id: 37, name: 'Nasi Paru Serundeng', category: 'Tuntutan Masyarakat', price: 25000, tags: [], stock: 30, isAvailable: true },
  { id: 38, name: 'Nasi Dangdutan', category: 'Tuntutan Masyarakat', price: 36000, tags: ['Favorit', 'Pedas'], stock: 25, isAvailable: true },
  { id: 39, name: 'Nasi Buntut Rewel', category: 'Tuntutan Masyarakat', price: 45000, tags: ['Pedas'], stock: 20, isAvailable: true },
  { id: 40, name: 'Nasi Buntut Kebakaran', category: 'Tuntutan Masyarakat', price: 40000, tags: [], stock: 20, isAvailable: true },
  { id: 41, name: 'Nasi Ghewlaa', category: 'Tuntutan Masyarakat', price: 29000, tags: ['Rekomendasi'], stock: 30, isAvailable: true },
  { id: 42, name: 'Lidah Sambel Hejo', category: 'Tuntutan Masyarakat', price: 47000, tags: ['Rekomendasi'], stock: 22, isAvailable: true },
  { id: 43, name: 'Buntut Goreng Sambal Hejo', category: 'Tuntutan Masyarakat', price: 45000, tags: ['Rekomendasi'], stock: 18, isAvailable: true },

  // Sumber Protein (5)
  { id: 44, name: 'Nasi Ayam Ajep-Ajep', category: 'Sumber Protein', price: 24000, tags: [], stock: 35, isAvailable: true },
  { id: 45, name: 'Nasi Ayam Omongan Tetangga', category: 'Sumber Protein', price: 24000, tags: [], stock: 35, isAvailable: true },
  { id: 46, name: 'Nasi Ayam Kalasan', category: 'Sumber Protein', price: 32000, tags: [], stock: 25, isAvailable: true },
  { id: 47, name: 'Nasi Kulit Serundeng', category: 'Sumber Protein', price: 22000, tags: [], stock: 40, isAvailable: true },
  { id: 48, name: 'Bebek Sambel Hejo', category: 'Sumber Protein', price: 45000, tags: ['Rekomendasi'], stock: 15, isAvailable: true },

  // Seger Adem (9)
  { id: 49, name: 'Es Cincau Jadoel', category: 'Seger Adem', price: 19000, variants: { sizeM: 19000, sizeL: 24000 }, temps: ['dingin'], stock: 50, isAvailable: true },
  { id: 50, name: 'Es Limun', category: 'Seger Adem', price: 20000, temps: ['dingin'], stock: 40, isAvailable: true },
  { id: 51, name: 'Es Soda Gembira', category: 'Seger Adem', price: 20000, temps: ['dingin'], stock: 45, isAvailable: true },
  { id: 52, name: 'Es Cincau Hijau', category: 'Seger Adem', price: 20000, temps: ['dingin'], stock: 40, isAvailable: true },
  { id: 53, name: 'Es Jeruk / Jeruk Panas', category: 'Seger Adem', price: 18000, temps: ['dingin', 'panas'], stock: 60, isAvailable: true },
  { id: 54, name: 'Es Kelapa Muda', category: 'Seger Adem', price: 10000, temps: ['dingin'], stock: 50, isAvailable: true },
  { id: 55, name: 'Es Kelapa Jeruk', category: 'Seger Adem', price: 12000, temps: ['dingin'], stock: 40, isAvailable: true },
  { id: 56, name: 'Es Kelapa Nangka', category: 'Seger Adem', price: 18000, temps: ['dingin'], stock: 35, isAvailable: true },
  { id: 57, name: 'Es Cendol', category: 'Seger Adem', price: 18000, temps: ['dingin'], stock: 45, isAvailable: true },

  // Es Esan (3)
  { id: 58, name: 'Es Krim Bumi Upi', category: 'Es Esan', price: 22000, temps: ['dingin'], stock: 35, isAvailable: true },
  { id: 59, name: 'Es ABC', category: 'Es Esan', price: 28000, temps: ['dingin'], stock: 25, isAvailable: true },
  { id: 60, name: 'Es Teller', category: 'Es Esan', price: 30000, temps: ['dingin'], stock: 30, isAvailable: true },

  // Teh & Susu (10)
  { id: 61, name: 'Teh Tawar Jumbo', category: 'Teh & Susu', price: 18000, temps: ['dingin', 'panas'], stock: 100, isAvailable: true },
  { id: 62, name: 'Teh Manis Jumbo', category: 'Teh & Susu', price: 22000, temps: ['dingin', 'panas'], stock: 100, isAvailable: true },
  { id: 63, name: 'Teh Manis', category: 'Teh & Susu', price: 13000, temps: ['dingin', 'panas'], stock: 100, isAvailable: true },
  { id: 64, name: 'Teh Lemon', category: 'Teh & Susu', price: 20000, variants: { sizeM: 20000, sizeL: 25000 }, temps: ['dingin', 'panas'], stock: 60, isAvailable: true },
  { id: 65, name: 'Teh Sereh', category: 'Teh & Susu', price: 17000, temps: ['panas'], stock: 40, isAvailable: true },
  { id: 66, name: 'Es Cokelat Malt Dinosaurus', category: 'Teh & Susu', price: 20000, variants: { sizeM: 20000, sizeL: 25000 }, temps: ['dingin'], stock: 50, isAvailable: true },
  { id: 67, name: 'Cokelat Malt Panas', category: 'Teh & Susu', price: 20000, temps: ['panas'], stock: 40, isAvailable: true },
  { id: 68, name: 'Es Goyobod Alun - Alun', category: 'Teh & Susu', price: 18000, temps: ['dingin'], stock: 40, isAvailable: true },
  { id: 69, name: 'Teh Susu Tolak Angin', category: 'Teh & Susu', price: 23000, variants: { sizeM: 23000, sizeL: 25000 }, temps: ['dingin', 'panas'], stock: 35, isAvailable: true },
  { id: 70, name: 'Teh Tarik', category: 'Teh & Susu', price: 20000, variants: { sizeM: 20000, sizeL: 25000 }, temps: ['dingin', 'panas'], stock: 50, isAvailable: true },

  // Jejamuan (3)
  { id: 71, name: 'Es Beras Kencur', category: 'Jejamuan', price: 18000, temps: ['dingin'], stock: 35, isAvailable: true },
  { id: 72, name: 'Es Kunyit Asem', category: 'Jejamuan', price: 18000, temps: ['dingin'], stock: 35, isAvailable: true },
  { id: 73, name: 'Es Beras Kencur Jeruk', category: 'Jejamuan', price: 20000, temps: ['dingin'], stock: 30, isAvailable: true },

  // Kopi (6)
  { id: 74, name: 'Kopi Hitam', category: 'Kopi', price: 17000, variants: { sizeM: 17000, sizeL: 22000 }, temps: ['dingin', 'panas'], stock: 70, isAvailable: true },
  { id: 75, name: 'Kopi Susu', category: 'Kopi', price: 22000, variants: { sizeM: 22000, sizeL: 27000 }, temps: ['dingin', 'panas'], stock: 70, isAvailable: true },
  { id: 76, name: 'Kopi Susu Butter', category: 'Kopi', price: 22000, temps: ['panas'], stock: 40, isAvailable: true },
  { id: 77, name: 'Kopi Susu Santan', category: 'Kopi', price: 23000, variants: { sizeM: 23000, sizeL: 27000 }, temps: ['dingin', 'panas'], stock: 40, isAvailable: true },
  { id: 78, name: 'Kopi Susu Kecap', category: 'Kopi', price: 22000, variants: { sizeM: 22000, sizeL: 27000 }, temps: ['dingin', 'panas'], stock: 35, isAvailable: true },
  { id: 79, name: 'Kopi Krim Soda', category: 'Kopi', price: 23000, temps: ['dingin'], stock: 35, isAvailable: true },

  // Jus 4 U (8)
  { id: 80, name: 'Jus Tomat', category: 'Jus 4 U', price: 17000, temps: ['dingin'], stock: 30, isAvailable: true },
  { id: 81, name: 'Jus Sirsak', category: 'Jus 4 U', price: 18000, temps: ['dingin'], stock: 30, isAvailable: true },
  { id: 82, name: 'Jus Semangka', category: 'Jus 4 U', price: 20000, temps: ['dingin'], stock: 35, isAvailable: true },
  { id: 83, name: 'Jus Mangga', category: 'Jus 4 U', price: 25000, temps: ['dingin'], stock: 35, isAvailable: true },
  { id: 84, name: 'Jus Alpukat', category: 'Jus 4 U', price: 25000, temps: ['dingin'], stock: 35, isAvailable: true },
  { id: 85, name: 'Jus Tape', category: 'Jus 4 U', price: 20000, temps: ['dingin'], stock: 25, isAvailable: true },
  { id: 86, name: 'Jus Stroberi', category: 'Jus 4 U', price: 24000, temps: ['dingin'], stock: 30, isAvailable: true },
  { id: 87, name: 'Jus Jambu', category: 'Jus 4 U', price: 20000, temps: ['dingin'], stock: 30, isAvailable: true },

  // Satu Rasa Cukup (6)
  { id: 88, name: 'Roti Bakar Cokelat', category: 'Satu Rasa Cukup', price: 18000, tags: [], stock: 40, isAvailable: true },
  { id: 89, name: 'Roti Bakar Keju', category: 'Satu Rasa Cukup', price: 20000, tags: [], stock: 40, isAvailable: true },
  { id: 90, name: 'Roti Bakar Gula Klasik', category: 'Satu Rasa Cukup', price: 15000, tags: [], stock: 35, isAvailable: true },
  { id: 91, name: 'Roti Bakar Nanas', category: 'Satu Rasa Cukup', price: 18000, tags: [], stock: 30, isAvailable: true },
  { id: 92, name: 'Roti Bakar Srikaya', category: 'Satu Rasa Cukup', price: 18000, tags: [], stock: 30, isAvailable: true },
  { id: 93, name: 'Burger Gulai Upi', category: 'Satu Rasa Cukup', price: 30000, tags: [], stock: 25, isAvailable: true },

  // Roti Bakar Gurih (6)
  { id: 94, name: 'Roti Bakar Telur', category: 'Roti Bakar Gurih', price: 20000, tags: [], stock: 35, isAvailable: true },
  { id: 95, name: 'Roti Bakar Telur Keju', category: 'Roti Bakar Gurih', price: 23000, tags: [], stock: 35, isAvailable: true },
  { id: 96, name: 'Roti Bakar Kornet', category: 'Roti Bakar Gurih', price: 20000, tags: [], stock: 35, isAvailable: true },
  { id: 97, name: 'Roti Bakar Kornet Telur Keju', category: 'Roti Bakar Gurih', price: 26000, tags: [], stock: 35, isAvailable: true },
  { id: 98, name: 'Roti Bakar Kornet Telur', category: 'Roti Bakar Gurih', price: 24000, tags: [], stock: 30, isAvailable: true },
  { id: 99, name: 'Roti Bakar Kornet Keju', category: 'Roti Bakar Gurih', price: 24000, tags: [], stock: 30, isAvailable: true },

  // Dua Lebih Spesial (2)
  { id: 100, name: 'Roti Bakar 2 rasa', category: 'Dua Lebih Spesial', price: 21000, tags: [], stock: 30, isAvailable: true },
  { id: 101, name: 'Roti Bakar Mocca nougat', category: 'Dua Lebih Spesial', price: 21000, tags: [], stock: 25, isAvailable: true },

  // Pisang Bakar (4)
  { id: 102, name: 'Pisang Bakar Cokelat', category: 'Pisang Bakar', price: 20000, tags: [], stock: 35, isAvailable: true },
  { id: 103, name: 'Pisang Bakar Keju', category: 'Pisang Bakar', price: 21000, tags: [], stock: 35, isAvailable: true },
  { id: 104, name: 'Pisang Bakar Cokelat Keju', category: 'Pisang Bakar', price: 23000, tags: [], stock: 35, isAvailable: true },
  { id: 105, name: 'Pisang Bakar Double Cokelat', category: 'Pisang Bakar', price: 23000, tags: [], stock: 30, isAvailable: true }
];
