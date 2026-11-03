import { MenuCategory, MenuItem, Voucher, CustomerProfile } from './types';

export const CATEGORIES: MenuCategory[] = [
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
  { code: 'cat-pisang', name: 'Pisang Bakar', expectedCount: 4, parent: 'Roti & Pisang Bakar' },
];

export const MENU_ITEMS: MenuItem[] = [
  // Cemilan Cepuluh (18)
  { id: 1, name: 'Sate Aci', category: 'Cemilan Cepuluh', price: 14000, tags: [], description: 'Kenyal gurih tusuk aci bumbu kacang khas Garut.' },
  { id: 2, name: 'Tahu Cirawraw', category: 'Cemilan Cepuluh', price: 15000, tags: [], description: 'Tahu renyah isi sayur pedas gurih tabur cabai rawit.' },
  { id: 3, name: 'Bakso Yang Ditukar', category: 'Cemilan Cepuluh', price: 20000, tags: [], description: 'Bakso goreng gurih kriuk dengan saus cocolan nikmat.' },
  { id: 4, name: 'Dimsum Ekonomis', category: 'Cemilan Cepuluh', price: 15000, tags: [], description: 'Dimsum ayam lembut 4 pcs dengan saus cabai asam manis.' },
  { id: 5, name: 'Dimsum Sejahtera', category: 'Cemilan Cepuluh', price: 20000, tags: [], description: 'Dimsum spesial porsi mantap topping wortel & udang.' },
  { id: 6, name: 'Pisang Kukus', category: 'Cemilan Cepuluh', price: 17000, tags: [], description: 'Pisang kepok manis alami dikukus hangat lembut.' },
  { id: 7, name: 'Pisang Goreng', category: 'Cemilan Cepuluh', price: 20000, tags: [], description: 'Pisang goreng tepung renyah keemasan khas warung priangan.' },
  { id: 8, name: 'Singkong Goreng', category: 'Cemilan Cepuluh', price: 20000, tags: [], description: 'Singkong empuk merekah bumbu rempah bawang gurih.' },
  { id: 9, name: 'Kentang Sosis', category: 'Cemilan Cepuluh', price: 22000, tags: [], description: 'Kombinasi french fries gurih renyah & sosis goreng.' },
  { id: 10, name: 'Ulen Upi', category: 'Cemilan Cepuluh', price: 22000, tags: [], description: 'Ulen ketan bakar kelapa gurih khas dapur nenek Bumi Upi.' },
  { id: 11, name: 'Ketan Kinca', category: 'Cemilan Cepuluh', price: 24500, tags: ['Rekomendasi'], description: 'Ketan kukus pulen disiram saus kinca gula aren wangi pandan.' },
  { id: 12, name: 'Gorengan Darmaji', category: 'Cemilan Cepuluh', price: 17000, tags: [], description: 'Aneka gorengan hangat bala-bala, gehu, dan tempe renyah.' },
  { id: 13, name: 'Cireng Ayah Ojak', category: 'Cemilan Cepuluh', price: 17000, tags: [], description: 'Cireng renyah kenyal dengan cocolan bumbu rujak pedas legit.' },
  { id: 14, name: 'Tahu Cabe Rewel', category: 'Cemilan Cepuluh', price: 22000, tags: ['Pedas'], description: 'Tahu krispi ditumis cabai garam bawang rewel nampol.' },
  { id: 15, name: 'Cireng Tahu Gejrot', category: 'Cemilan Cepuluh', price: 18000, tags: ['Favorit', 'Pedas'], description: 'Paduan kenyal cireng dan tahu kuah asam pedas gejrot.' },
  { id: 16, name: 'Pagordas', category: 'Cemilan Cepuluh', price: 20000, tags: [], description: 'Pangsit goreng pedas dengan isian ayam cincang bumbu resep rahasia.' },
  { id: 17, name: 'Lumpia Vietnam', category: 'Cemilan Cepuluh', price: 22000, tags: [], description: 'Lumpia basah sayur segar udang disajikan dengan saus hoisin kacang.' },
  { id: 18, name: 'Tuangeun Bocil', category: 'Cemilan Cepuluh', price: 25000, tags: ['Untuk Anak', 'Rekomendasi'], description: 'Nugget ayam mini, sosis mekar, dan kentang goreng renyah favorit anak.' },

  // Ber Pepes An (4)
  { id: 19, name: 'Pepes Goreng Ayam Bule', category: 'Ber Pepes An', price: 39000, tags: [], description: 'Pepes bumbu rempah kemangi lalu digoreng gurih berkulit.' },
  { id: 20, name: 'Pepes Ayam Bule', category: 'Ber Pepes An', price: 39000, tags: [], description: 'Pepes ayam negeri kukus bumbu kuning wangi daun kemangi & sereh.' },
  { id: 21, name: 'Pepes Ayam Kampung', category: 'Ber Pepes An', price: 48000, tags: [], description: 'Ayam kampung asli kukus rempah lembut kaya aroma tradisi Garut.' },
  { id: 22, name: 'Pepes Goreng Ayam Kampung', category: 'Ber Pepes An', price: 48000, tags: [], description: 'Ayam kampung pepes khas digoreng sebentar untuk sensasi renyah luar biasa.' },

  // Emih - Emihan (6)
  { id: 23, name: 'Mie Kasep', category: 'Emih - Emihan', price: 24000, tags: ['Rekomendasi'], description: 'Mie ayam manis gurih topping ayam cincang dan kuah kaldu segar.' },
  { id: 24, name: 'Mie Racing', category: 'Emih - Emihan', price: 25000, tags: ['Rekomendasi'], description: 'Mie pedas cepat saji berlevel cabai ekstra bikin melek.' },
  { id: 25, name: 'Mie Ebroh', category: 'Emih - Emihan', price: 25000, tags: ['Pedas'], description: 'Mie kuah kental telur melimpah (ebroh) dengan taburan daun bawang dan cabai rawit.' },
  { id: 26, name: 'Mie Chili Oil', category: 'Emih - Emihan', price: 24000, tags: [], description: 'Mie kenyal dibalut chili oil wangi rempah dan minyak wijen panggang.' },
  { id: 27, name: 'Mie Anak Sekolah', category: 'Emih - Emihan', price: 27000, tags: ['Untuk Anak', 'Rekomendasi'], description: 'Mie kuah sosis baso gurih ramah anak tanpa bumbu pedas.' },
  { id: 28, name: 'Bihun Kuwah', category: 'Emih - Emihan', price: 29000, tags: [], description: 'Bihun kuah kaldu ayam bening sedap disajikan dengan suwiran ayam & sayuran.' },

  // Pemadam Kelaparan (7)
  { id: 29, name: 'Nasi Goreng Upiwan', category: 'Pemadam Kelaparan', price: 25000, tags: [], description: 'Nasi goreng bumbu merah gurih dengan telur mata sapi dan acar.' },
  { id: 30, name: 'Nasi Goreng Upiwati', category: 'Pemadam Kelaparan', price: 26000, tags: [], description: 'Nasi goreng kecap manis harum terasi Garut disajikan porsi kenyang.' },
  { id: 31, name: 'Nasi Goreng Cumi Upi', category: 'Pemadam Kelaparan', price: 28000, tags: ['Favorit', 'Pedas'], description: 'Nasi goreng tinta cumi hitam gurih pedas kaya rasa laut segar.' },
  { id: 32, name: 'Nasi Goreng Bunda Kornet', category: 'Pemadam Kelaparan', price: 27000, tags: [], description: 'Nasi goreng kornet sapi resep hangat bunda bertabur bawang goreng.' },
  { id: 33, name: 'Nasi Goreng Peda Kemangi', category: 'Pemadam Kelaparan', price: 27000, tags: ['Favorit', 'Pedas'], description: 'Ikan peda asin gurih dipadukan harum daun kemangi segar.' },
  { id: 34, name: 'Nasi Goreng Omah', category: 'Pemadam Kelaparan', price: 23000, tags: [], description: 'Nasi goreng putih sederhana ala omah dengan potongan wortel & telur orek.' },
  { id: 35, name: 'Nasi Goreng Kecombrang', category: 'Pemadam Kelaparan', price: 24000, tags: [], description: 'Aroma wangi bunga kecombrang asli Priangan menyatu dalam nasi goreng hangat.' },

  // Tuntutan Masyarakat (8)
  { id: 36, name: 'Nasi Galo Bumi Upi', category: 'Tuntutan Masyarakat', price: 39000, tags: ['Favorit', 'Pedas'], description: 'Paket nasi galo komplit dengan aneka lauk gurih dan sambal khas.' },
  { id: 37, name: 'Nasi Paru Serundeng', category: 'Tuntutan Masyarakat', price: 25000, tags: [], description: 'Paru sapi empuk bumbu rempah ditaburi serundeng kelapa wangi manis gurih.' },
  { id: 38, name: 'Nasi Dangdutan', category: 'Tuntutan Masyarakat', price: 36000, tags: ['Favorit', 'Pedas'], description: 'Paket nasi ceria menggoyang lidah dengan lauk pedas mantap.' },
  { id: 39, name: 'Nasi Buntut Rewel', category: 'Tuntutan Masyarakat', price: 45000, tags: ['Pedas'], description: 'Buntut sapi lembut dimasak kuah cabai rewel ekstra pedas menyengat.' },
  { id: 40, name: 'Nasi Buntut Kebakaran', category: 'Tuntutan Masyarakat', price: 40000, tags: [], description: 'Buntut bakar karamelisasi kecap rempah disajikan dengan sup kaldu hangat.' },
  { id: 41, name: 'Nasi Ghewlaa', category: 'Tuntutan Masyarakat', price: 29000, tags: ['Rekomendasi'], description: 'Nasi rames khas Jawa Barat lauk lengkap bikin ketagihan.' },
  { id: 42, name: 'Lidah Sambel Hejo', category: 'Tuntutan Masyarakat', price: 47000, tags: ['Rekomendasi'], description: 'Lidah sapi empuk disiram ulekan sambal hejo tomat hijau Garut.' },
  { id: 43, name: 'Buntut Goreng Sambal Hejo', category: 'Tuntutan Masyarakat', price: 45000, tags: ['Rekomendasi'], description: 'Buntut goreng renyah di luar lembut di dalam disajikan sambal hejo pedas segar.' },

  // Sumber Protein (5)
  { id: 44, name: 'Nasi Ayam Ajep-Ajep', category: 'Sumber Protein', price: 24000, tags: [], description: 'Ayam goreng bumbu rempah pasundan dengan lalapan segar.' },
  { id: 45, name: 'Nasi Ayam Omongan Tetangga', category: 'Sumber Protein', price: 24000, tags: [], description: 'Ayam goreng krispi dengan sambal pedas ceplas-ceplos membakar semangat.' },
  { id: 46, name: 'Nasi Ayam Kalasan', category: 'Sumber Protein', price: 32000, tags: [], description: 'Ayam kalasan manis legit bertabur kremesan renyah gurih.' },
  { id: 47, name: 'Nasi Kulit Serundeng', category: 'Sumber Protein', price: 22000, tags: [], description: 'Kulit ayam goreng krispi kriuk diselimuti serundeng kelapa wangi.' },
  { id: 48, name: 'Bebek Sambel Hejo', category: 'Sumber Protein', price: 45000, tags: ['Rekomendasi'], description: 'Bebek goreng empuk tanpa bau amis disiram sambal hijau segar aromatik.' },

  // Seger Adem (9)
  { id: 49, name: 'Es Cincau Jadoel', category: 'Seger Adem', price: 19000, variants: { sizeM: 19000, sizeL: 24000 }, temps: ['dingin'], description: 'Cincau hitam kenyal disiram santan segar dan gula kelapa aren.' },
  { id: 50, name: 'Es Limun', category: 'Seger Adem', price: 20000, temps: ['dingin'], description: 'Minuman soda limun asam manis dingin bernostalgia tempo dulu.' },
  { id: 51, name: 'Es Soda Gembira', category: 'Seger Adem', price: 20000, temps: ['dingin'], description: 'Soda bening campur sirup coco pandan merah manis susu kental.' },
  { id: 52, name: 'Es Cincau Hijau', category: 'Seger Adem', price: 20000, temps: ['dingin'], description: 'Cincau hijau alami peras daun asli dingin melegakan tenggorokan.' },
  { id: 53, name: 'Es Jeruk / Jeruk Panas', category: 'Seger Adem', price: 18000, temps: ['dingin', 'panas'], description: 'Perasan jeruk asli segar, bisa dingin menyegarkan atau panas menghangatkan.' },
  { id: 54, name: 'Es Kelapa Muda', category: 'Seger Adem', price: 10000, temps: ['dingin'], description: 'Air kelapa muda murni lengkap dengan serutan daging kelapa segar.' },
  { id: 55, name: 'Es Kelapa Jeruk', category: 'Seger Adem', price: 12000, temps: ['dingin'], description: 'Kombinasi manis gurih kelapa muda dan asam manis perasan jeruk.' },
  { id: 56, name: 'Es Kelapa Nangka', category: 'Seger Adem', price: 18000, temps: ['dingin'], description: 'Kelapa muda segar ditambah aroma harum potongan buah nangka manis.' },
  { id: 57, name: 'Es Cendol', category: 'Seger Adem', price: 18000, temps: ['dingin'], description: 'Cendol kenyal tepung beras hijau, santan gurih, dan gula merah kental.' },

  // Es Esan (3)
  { id: 58, name: 'Es Krim Bumi Upi', category: 'Es Esan', price: 22000, temps: ['dingin'], description: 'Es krim puter tradisional rasa vanila, cokelat, dan nangka.' },
  { id: 59, name: 'Es ABC', category: 'Es Esan', price: 28000, temps: ['dingin'], description: 'Air Batu Campur dengan serutan es, kacang merah, jagung manis, dan sirup.' },
  { id: 60, name: 'Es Teller', category: 'Es Esan', price: 30000, temps: ['dingin'], description: 'Alpukat mentega, kelapa muda, nangka harum dalam kuah santan susu kental.' },

  // Teh & Susu (10)
  { id: 61, name: 'Teh Tawar Jumbo', category: 'Teh & Susu', price: 18000, temps: ['dingin', 'panas'], description: 'Seduhan teh melati khas Garut porsi jumbo mantap.' },
  { id: 62, name: 'Teh Manis Jumbo', category: 'Teh & Susu', price: 22000, temps: ['dingin', 'panas'], description: 'Teh manis wangi melati gula tebu asli gelas besar.' },
  { id: 63, name: 'Teh Manis', category: 'Teh & Susu', price: 13000, temps: ['dingin', 'panas'], description: 'Teh manis standar hangat atau dingin penghilang dahaga.' },
  { id: 64, name: 'Teh Lemon', category: 'Teh & Susu', price: 20000, variants: { sizeM: 20000, sizeL: 25000 }, temps: ['dingin', 'panas'], description: 'Seduhan teh segar dipadukan perasan buah lemon asli kaya vitamin C.' },
  { id: 65, name: 'Teh Sereh', category: 'Teh & Susu', price: 17000, temps: ['panas'], description: 'Seduhan sereh wangi hangat herbal pelega pernapasan.' },
  { id: 66, name: 'Es Cokelat Malt Dinosaurus', category: 'Teh & Susu', price: 20000, variants: { sizeM: 20000, sizeL: 25000 }, temps: ['dingin'], description: 'Es cokelat pekat malt ditaburi bubuk cokelat menggunung di atasnya.' },
  { id: 67, name: 'Cokelat Malt Panas', category: 'Teh & Susu', price: 20000, temps: ['panas'], description: 'Cokelat malt hangat kental cocok dinikmati saat udara sejuk Garut.' },
  { id: 68, name: 'Es Goyobod Alun - Alun', category: 'Teh & Susu', price: 18000, temps: ['dingin'], description: 'Goyobod hunkwe kenyal khas alun-alun Garut berpadu kuah santan manis.' },
  { id: 69, name: 'Teh Susu Tolak Angin', category: 'Teh & Susu', price: 23000, variants: { sizeM: 23000, sizeL: 25000 }, temps: ['dingin', 'panas'], description: 'Racikan unik teh susu gurih dengan sentuhan mint herbal tolak angin menyegarkan.' },
  { id: 70, name: 'Teh Tarik', category: 'Teh & Susu', price: 20000, variants: { sizeM: 20000, sizeL: 25000 }, temps: ['dingin', 'panas'], description: 'Teh susu ditarik busa lembut bertekstur kental harum.' },

  // Jejamuan (3)
  { id: 71, name: 'Es Beras Kencur', category: 'Jejamuan', price: 18000, temps: ['dingin'], description: 'Racikan beras kencur alami penambah nafsu makan dan penghangat stamina.' },
  { id: 72, name: 'Es Kunyit Asem', category: 'Jejamuan', price: 18000, temps: ['dingin'], description: 'Kunyit asem segar pereda lelah buatan tangan warisan nenek.' },
  { id: 73, name: 'Es Beras Kencur Jeruk', category: 'Jejamuan', price: 20000, temps: ['dingin'], description: 'Perpaduan segar beras kencur tradisional ditambah sentuhan jeruk asam manis.' },

  // Kopi (6)
  { id: 74, name: 'Kopi Hitam', category: 'Kopi', price: 17000, variants: { sizeM: 17000, sizeL: 22000 }, temps: ['dingin', 'panas'], description: 'Kopi tubruk robusta-arabika lokal Garut rasa pekat dan aroma tebal.' },
  { id: 75, name: 'Kopi Susu', category: 'Kopi', price: 22000, variants: { sizeM: 22000, sizeL: 27000 }, temps: ['dingin', 'panas'], description: 'Kopi espreso lokal campur susu kental manis legit pas di lidah.' },
  { id: 76, name: 'Kopi Susu Butter', category: 'Kopi', price: 22000, temps: ['panas'], description: 'Kopi susu hangat dicampur mentega gurih creamy ala kopitiam klasik.' },
  { id: 77, name: 'Kopi Susu Santan', category: 'Kopi', price: 23000, variants: { sizeM: 23000, sizeL: 27000 }, temps: ['dingin', 'panas'], description: 'Kopi gurih santan kelapa khas pedesaan Jawa Barat.' },
  { id: 78, name: 'Kopi Susu Kecap', category: 'Kopi', price: 22000, variants: { sizeM: 22000, sizeL: 27000 }, temps: ['dingin', 'panas'], description: 'Inovasi khas Bumi Upi sentuhan karamel manis kecap premium.' },
  { id: 79, name: 'Kopi Krim Soda', category: 'Kopi', price: 23000, temps: ['dingin'], description: 'Kopi dingin bersoda dengan float es krim lembut menggelitik di lidah.' },

  // Jus 4 U (8)
  { id: 80, name: 'Jus Tomat', category: 'Jus 4 U', price: 17000, temps: ['dingin'], description: 'Jus tomat segar kebun Garut kaya likopen.' },
  { id: 81, name: 'Jus Sirsak', category: 'Jus 4 U', price: 18000, temps: ['dingin'], description: 'Daging sirsak manis asam kental menyegarkan siang hari.' },
  { id: 82, name: 'Jus Semangka', category: 'Jus 4 U', price: 20000, temps: ['dingin'], description: 'Semangka merah segar tanpa biji murni pelepas dahaga.' },
  { id: 83, name: 'Jus Mangga', category: 'Jus 4 U', price: 25000, temps: ['dingin'], description: 'Mangga manis harum matang pohon tekstur kental nikmat.' },
  { id: 84, name: 'Jus Alpukat', category: 'Jus 4 U', price: 25000, temps: ['dingin'], description: 'Alpukat mentega lembut disiram lelehan cokelat kental manis.' },
  { id: 85, name: 'Jus Tape', category: 'Jus 4 U', price: 20000, temps: ['dingin'], description: 'Jus tape peuyeum manis legit berkarakter khas Priangan.' },
  { id: 86, name: 'Jus Stroberi', category: 'Jus 4 U', price: 24000, temps: ['dingin'], description: 'Stroberi segar lereng Gunung Guntur dengan rasa manis asam alami.' },
  { id: 87, name: 'Jus Jambu', category: 'Jus 4 U', price: 20000, temps: ['dingin'], description: 'Jambu biji merah disaring halus kaya vitamin C.' },

  // Satu Rasa Cukup (6)
  { id: 88, name: 'Roti Bakar Cokelat', category: 'Satu Rasa Cukup', price: 18000, tags: [], description: 'Roti tawar tebal bakar mentega dengan selai cokelat meleleh.' },
  { id: 89, name: 'Roti Bakar Keju', category: 'Satu Rasa Cukup', price: 20000, tags: [], description: 'Roti bakar isi keju cheddar parut melimpah susu kental manis.' },
  { id: 90, name: 'Roti Bakar Gula Klasik', category: 'Satu Rasa Cukup', price: 15000, tags: [], description: 'Roti bakar oles mentega tebal dan taburan gula pasir renyah.' },
  { id: 91, name: 'Roti Bakar Nanas', category: 'Satu Rasa Cukup', price: 18000, tags: [], description: 'Roti bakar selai nanas segar asam manis buatan sendiri.' },
  { id: 92, name: 'Roti Bakar Srikaya', category: 'Satu Rasa Cukup', price: 18000, tags: [], description: 'Selai srikaya wangi telur dan pandan dibakar harum di atas arang.' },
  { id: 93, name: 'Burger Gulai Upi', category: 'Satu Rasa Cukup', price: 30000, tags: [], description: 'Roti burger panggang isi patty sapi disiram saus gulai rempah khas.' },

  // Roti Bakar Gurih (6)
  { id: 94, name: 'Roti Bakar Telur', category: 'Roti Bakar Gurih', price: 20000, tags: [], description: 'Roti bakar gurih dengan telur dadar daun bawang dan mayones.' },
  { id: 95, name: 'Roti Bakar Telur Keju', category: 'Roti Bakar Gurih', price: 23000, tags: [], description: 'Perpaduan telur dadar gurih dan lumeran keju cheddar gurih.' },
  { id: 96, name: 'Roti Bakar Kornet', category: 'Roti Bakar Gurih', price: 20000, tags: [], description: 'Roti bakar isi tumis kornet sapi bumbu lada bawang bombay.' },
  { id: 97, name: 'Roti Bakar Kornet Telur Keju', category: 'Roti Bakar Gurih', price: 26000, tags: [], description: 'Pilihan terlengkap kornet gurih, telur dadar, dan limpahan keju.' },
  { id: 98, name: 'Roti Bakar Kornet Telur', category: 'Roti Bakar Gurih', price: 24000, tags: [], description: 'Kombinasi padat gizi kornet sapi dan telur dadar renyah.' },
  { id: 99, name: 'Roti Bakar Kornet Keju', category: 'Roti Bakar Gurih', price: 24000, tags: [], description: 'Roti bakar kornet sapi gurih berpadu asin gurih keju parut.' },

  // Dua Lebih Spesial (2)
  { id: 100, name: 'Roti Bakar 2 rasa', category: 'Dua Lebih Spesial', price: 21000, tags: [], description: 'Kombinasi 2 pilihan selai favorit (Cokelat-Keju / Nanas-Cokelat).' },
  { id: 101, name: 'Roti Bakar Mocca nougat', category: 'Dua Lebih Spesial', price: 21000, tags: [], description: 'Krim moka harum lembut ditaburi remahan nougat kacang karamel renyah.' },

  // Pisang Bakar (4)
  { id: 102, name: 'Pisang Bakar Cokelat', category: 'Pisang Bakar', price: 20000, tags: [], description: 'Pisang uli bakar wangi arang disiram saus cokelat manis.' },
  { id: 103, name: 'Pisang Bakar Keju', category: 'Pisang Bakar', price: 21000, tags: [], description: 'Pisang bakar manis bertabur keju cheddar gurih susu kental.' },
  { id: 104, name: 'Pisang Bakar Cokelat Keju', category: 'Pisang Bakar', price: 23000, tags: [], description: 'Perpaduan klasik paling dicari: cokelat manis dan keju gurih.' },
  { id: 105, name: 'Pisang Bakar Double Cokelat', category: 'Pisang Bakar', price: 23000, tags: [], description: 'Untuk pecinta cokelat sejati: selai cokelat plus taburan meises melimpah.' },
];

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'vouch-tamu-15k',
    code: 'BUMIWELCOME',
    title: 'Voucher Selamat Datang Tamu',
    description: 'Potongan Rp 15.000 untuk kunjungan hangat pertamamu di Bumi Upi.',
    discountType: 'nominal',
    discountValue: 15000,
    minSpend: 50000,
    expiresAt: '2026-12-31T23:59:59Z',
  },
  {
    id: 'vouch-nobar-20pct',
    code: 'PERSIBJUARA',
    title: 'Voucher Nobar Persib Juara',
    description: 'Diskon 20% cemilan & minuman saat nonton bareng di Bale Utama.',
    discountType: 'percent',
    discountValue: 20,
    minSpend: 40000,
    maxDiscount: 20000,
    expiresAt: '2026-12-31T23:59:59Z',
  },
  {
    id: 'vouch-ultah-30k',
    code: 'ULTAHSUNDA',
    title: 'Voucher Traktiran Ulang Tahun',
    description: 'Potongan spesial Rp 30.000 di hari bahagiamu bersama Keluarga Bumi.',
    discountType: 'nominal',
    discountValue: 30000,
    minSpend: 75000,
    expiresAt: '2026-12-31T23:59:59Z',
  },
];

export const DEMO_CUSTOMER: CustomerProfile = {
  id: 'cust-dimas-001',
  name: 'Dimas Kurniawan',
  email: 'customer@bumiupi.id',
  phone: '081234567890',
  tier: 'Sahabat',
  pointsBalance: 142,
  cumulativePoints: 142,
  memberId: 'BUMI-CUST-8899',
  qrValue: 'BUMI-CUST-8899-QR',
  birthDate: '1995-10-15',
  favoritePreferences: 'Nasi Goreng Kecombrang, Es Cincau Jadoel, Suka Pedas Sedang',
};

export const DEMO_CUSTOMERS_LIST: CustomerProfile[] = [
  DEMO_CUSTOMER,
  {
    id: 'cust-siti-002',
    name: 'Teh Siti Rahmawati',
    email: 'siti.rahmawati@gmail.com',
    phone: '081987654321',
    tier: 'Tamu',
    pointsBalance: 35,
    cumulativePoints: 35,
    memberId: 'BUMI-CUST-1042',
    qrValue: 'BUMI-CUST-1042-QR',
    birthDate: '2001-04-20',
    favoritePreferences: 'Ulen Upi Kinca, Es Cokelat Malt, Pisang Bakar Keju',
  },
  {
    id: 'cust-ahmad-003',
    name: 'Kang Ahmad Fauzi',
    email: 'ahmad.fauzi@garut.id',
    phone: '081333444555',
    tier: 'Keluarga',
    pointsBalance: 520,
    cumulativePoints: 520,
    memberId: 'BUMI-CUST-0077',
    qrValue: 'BUMI-CUST-0077-QR',
    birthDate: '1988-12-05',
    favoritePreferences: 'Lidah Sambel Hejo, Kopi Hitam Garut Panas, Pepes Ayam',
  },
  {
    id: 'cust-putri-004',
    name: 'Putri Ayu Sagita',
    email: 'putriayusagita02@gmail.com',
    phone: '081299988877',
    tier: 'Keluarga',
    pointsBalance: 750,
    cumulativePoints: 750,
    memberId: 'BUMI-CUST-0001',
    qrValue: 'BUMI-CUST-0001-QR',
    birthDate: '1996-08-17',
    favoritePreferences: 'Mie Kasep Kuah, Es Goyobod Alun-alun, Seger Adem',
  },
];
