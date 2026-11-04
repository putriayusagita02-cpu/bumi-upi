/**
 * 200 Customer Profiles with RFM Quintile Scoring and 7 Authentic Segments
 * Segments: Juara, Setia, Potensial, Butuh Perhatian, Hampir Lepas, Berisiko, Tertidur
 */

export type RfmSegment =
  | 'Juara'
  | 'Setia'
  | 'Potensial'
  | 'Butuh Perhatian'
  | 'Hampir Lepas'
  | 'Berisiko'
  | 'Tertidur';

export type CustomerTier = 'Tamu' | 'Sahabat' | 'Keluarga';

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: CustomerTier;
  pointsBalance: number;
  cumulativePoints: number;
  qrCode: string;
  recencyDays: number; // Days since last visit
  frequencyCount: number; // Number of visits
  monetaryTotal: number; // Total spend in IDR
  rScore: number; // 1 - 5
  fScore: number; // 1 - 5
  mScore: number; // 1 - 5
  rfmScore: string; // e.g. "555"
  segment: RfmSegment;
  clvEstimate: number; // Customer Lifetime Value (IDR)
  lastVisitWib: string;
}

export interface SegmentSummary {
  name: RfmSegment;
  count: number;
  percentage: number;
  avgSpend: number;
  actionRecommendation: string;
  colorClass: string;
}

// Indonesian Sundanese names generator seed
const SUNDA_FIRST_NAMES = [
  'Asep', 'Dadang', 'Cecep', 'Ujang', 'Agah', 'Encep', 'Jajang', 'Tata', 'Maman', 'Iwan',
  'Nining', 'Ceu Popon', 'Imas', 'Siti', 'Ai', 'Euis', 'Neneng', 'Kokom', 'Tati', 'Iis',
  'Dimas', 'Budi', 'Rizky', 'Fajar', 'Aditya', 'Ghani', 'Putri', 'Salsa', 'Annisa', 'Dewi'
];
const SUNDA_LAST_NAMES = [
  'Kurniawan', 'Permana', 'Suryana', 'Hidayat', 'Kusnadi', 'Sunandar', 'Sutisna', 'Wiratama',
  'Nugraha', 'Suherman', 'Setiawan', 'Pratama', 'Gunawan', 'Subagja', 'Maulana', 'Firmansyah',
  'Saputra', 'Iskandar', 'Sanjaya', 'Rustandi'
];

function generate200Customers(): CustomerProfile[] {
  const list: CustomerProfile[] = [];

  // Customer #1: Official Demo Customer (Dimas Kurniawan)
  list.push({
    id: 'usr-cust-demo',
    name: 'Dimas Kurniawan',
    phone: '081234567890',
    email: 'customer@bumiupi.id',
    tier: 'Sahabat',
    pointsBalance: 142,
    cumulativePoints: 242,
    qrCode: 'BUMI-CUST-8899',
    recencyDays: 3,
    frequencyCount: 14,
    monetaryTotal: 1850000,
    rScore: 5,
    fScore: 4,
    mScore: 4,
    rfmScore: '544',
    segment: 'Setia',
    clvEstimate: 4200000,
    lastVisitWib: '28 Okt 2026, 14:30 WIB'
  });

  // Predefined distribution targets for 200 customers
  // Juara: ~30, Setia: ~45, Potensial: ~35, Butuh Perhatian: ~30, Hampir Lepas: ~25, Berisiko: ~20, Tertidur: ~15
  const segmentPlan: { seg: RfmSegment; count: number; rRange: [number, number]; fRange: [number, number]; mRange: [number, number] }[] = [
    { seg: 'Juara', count: 29, rRange: [1, 7], fRange: [16, 35], mRange: [2500000, 6000000] },
    { seg: 'Setia', count: 44, rRange: [4, 18], fRange: [10, 20], mRange: [1400000, 3200000] },
    { seg: 'Potensial', count: 35, rRange: [2, 12], fRange: [4, 9], mRange: [600000, 1600000] },
    { seg: 'Butuh Perhatian', count: 30, rRange: [15, 35], fRange: [3, 6], mRange: [400000, 950000] },
    { seg: 'Hampir Lepas', count: 25, rRange: [40, 75], fRange: [5, 12], mRange: [750000, 1900000] },
    { seg: 'Berisiko', count: 21, rRange: [60, 120], fRange: [8, 22], mRange: [1200000, 3500000] },
    { seg: 'Tertidur', count: 15, rRange: [90, 180], fRange: [1, 3], mRange: [120000, 380000] }
  ];

  let idCounter = 2;
  for (const group of segmentPlan) {
    for (let i = 0; i < group.count; i++) {
      const fName = SUNDA_FIRST_NAMES[(idCounter * 7 + i) % SUNDA_FIRST_NAMES.length];
      const lName = SUNDA_LAST_NAMES[(idCounter * 11 + i) % SUNDA_LAST_NAMES.length];
      const fullName = `${fName} ${lName}`;
      const phoneDigits = String(10000000 + (idCounter * 1234567) % 89999999);
      const phone = `0812${phoneDigits}`;
      const email = `${fName.toLowerCase().replace(/[^a-z]/g, '')}.${lName.toLowerCase()}@gmail.com`;

      const recency = Math.floor(group.rRange[0] + ((idCounter * 13) % (group.rRange[1] - group.rRange[0] + 1)));
      const freq = Math.floor(group.fRange[0] + ((idCounter * 17) % (group.fRange[1] - group.fRange[0] + 1)));
      const monetary = Math.floor(group.mRange[0] + ((idCounter * 7391) % (group.mRange[1] - group.mRange[0] + 1)));

      // Quintile scoring logic (1-5)
      let rScore = 1;
      if (recency <= 7) rScore = 5;
      else if (recency <= 20) rScore = 4;
      else if (recency <= 45) rScore = 3;
      else if (recency <= 90) rScore = 2;

      let fScore = 1;
      if (freq >= 15) fScore = 5;
      else if (freq >= 9) fScore = 4;
      else if (freq >= 5) fScore = 3;
      else if (freq >= 2) fScore = 2;

      let mScore = 1;
      if (monetary >= 2500000) mScore = 5;
      else if (monetary >= 1500000) mScore = 4;
      else if (monetary >= 750000) mScore = 3;
      else if (monetary >= 350000) mScore = 2;

      const rfmScore = `${rScore}${fScore}${mScore}`;
      const pointsTotal = Math.floor(monetary / 10000);
      const pointsBalance = Math.floor(pointsTotal * 0.4);

      let tier: CustomerTier = 'Tamu';
      if (pointsTotal >= 300) tier = 'Keluarga';
      else if (pointsTotal >= 100) tier = 'Sahabat';

      // CLV estimate calculation
      const aov = Math.round(monetary / Math.max(1, freq));
      const clvEstimate = Math.round(aov * freq * 1.8);

      const dayOffset = recency;
      const visitDate = new Date(Date.now() - dayOffset * 24 * 3600 * 1000);
      const lastVisitWib = `${visitDate.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][visitDate.getMonth()]} 2026, ${String((idCounter * 3) % 12 + 10).padStart(2, '0')}:${String((idCounter * 7) % 60).padStart(2, '0')} WIB`;

      list.push({
        id: `usr-cust-${String(idCounter).padStart(3, '0')}`,
        name: fullName,
        phone,
        email,
        tier,
        pointsBalance,
        cumulativePoints: pointsTotal,
        qrCode: `BUMI-CUST-${String(2000 + idCounter)}`,
        recencyDays: recency,
        frequencyCount: freq,
        monetaryTotal: monetary,
        rScore,
        fScore,
        mScore,
        rfmScore,
        segment: group.seg,
        clvEstimate,
        lastVisitWib
      });

      idCounter++;
    }
  }

  return list;
}

export const INITIAL_CUSTOMERS: CustomerProfile[] = generate200Customers();

export interface SegmentMeta {
  title: string;
  desc: string;
  objective: string;
  action: string;
  sopRestoran: string[];
  incentive: string;
  waTemplate: string;
  roiImpact: string;
  color: string;
  badgeBg: string;
}

export const SEGMENT_DEFINITIONS: Record<RfmSegment, SegmentMeta> = {
  Juara: {
    title: 'Juara (Champions VIP)',
    desc: 'Pelanggan VIP terbaik yang sangat sering datang (16-35x), belanja terbesar (> Rp 2.5jt), dan baru berkunjung dalam 7 hari terakhir.',
    objective: 'Pertahankan retensi 100%, berikan kenyamanan eksklusif, dan jadikan Brand Ambassador sukarela.',
    action: 'Berikan Free Compliment Meja (Surabi Kinca Haneut / Ulen Upi), Priority Table Booking tanpa antre, dan sambutan hangat langsung dari Owner / Chef.',
    sopRestoran: [
      '1. Kasir / Hostess mengenali status VIP otomatis saat kartu dipindai dan mengarahkan ke meja utama Bale Garut tanpa batas antrean.',
      '2. Dapur mengeluarkan compliment meja gratis "Surabi Kinca Haneut" atau "Ulen Upi Gurih" otomatis saat duduk (struk POS Rp 0 disubsidi resto).',
      '3. Owner atau Head Waiter menyapa meja dalam 10 menit pertama untuk memastikan kepuasan cita rasa hidangan.'
    ],
    incentive: 'Free Dessert Tradisional Meja + Fast-Track Priority Table Booking akhir pekan.',
    waTemplate: 'Sampurasun Kak [Nama] tercinta! Hatur nuhun selalu mempercayakan santapan keluarga di Bumi Upi Garut. Akhir pekan ini meja favorit Akang/Teteh sudah kami siapkan + traktiran Surabi Kinca Haneut dari Dapur Nenek langsung di meja. Ditunggu kehadirannya ya Kak!',
    roiImpact: 'Menjaga 29 pelanggan Juara mengamankan omzet tahunan lebih dari Rp 105.000.000.',
    color: '#3E4F30',
    badgeBg: 'bg-olive-100 text-olive-800 border-olive-300'
  },
  Setia: {
    title: 'Setia (Loyal Regulars)',
    desc: 'Pelanggan reguler yang konsisten berkunjung (10-20x) dengan nilai belanja stabil (Rp 1.4jt - 3.2jt), menjadi tulang punggung omzet resto.',
    objective: 'Dorong kunjungan di hari kerja (Weekday Lunch Booster) dan dorong upgrade ke Tier Keluarga.',
    action: 'Tawarkan program "Kamis Manis Dobel Poin", voucher upgrade gratis ke Paket Liwet Kastrol Komplit pada hari kerja, dan voucher ulang tahun keluarga.',
    sopRestoran: [
      '1. Kasir POS otomatis menawarkan promo upgrade Liwet Kastrol Komplit untuk kedatangan Selasa–Kamis.',
      '2. Staf menginformasikan perolehan 2x Poin Reward untuk setiap pemesanan lauk ayam kampung atau gurame.',
      '3. Sistem mengirimkan pengingat penukaran voucher traktiran saat poin loyalty mendekati ambang reward.'
    ],
    incentive: 'Upgrade Gratis Liwet Kastrol Komplit (Selasa-Kamis) + 2x Poin Loyalitas.',
    waTemplate: 'Halo Sahabat Setia Bumi Upi, Kak [Nama]! Spesial untuk Kakak, nikmati Upgrade Gratis ke Paket Nasi Liwet Kastrol Komplit untuk santap siang hari kerja (Senin-Kamis) cukup tunjukkan pesan ini ke kasir. Yuk botram hangat bersama rekan dan keluarga!',
    roiImpact: 'Meningkatkan okupansi meja hari kerja di jam makan siang sebesar +28%.',
    color: '#8A8F5F',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  Potensial: {
    title: 'Potensial (Potential Loyalists)',
    desc: 'Pelanggan baru atau reguler (4-9x kunjungan) dengan nilai belanja cukup tinggi (Rp 600rb - 1.6jt) dan potensi besar menjadi pelanggan setia.',
    objective: 'Bentuk kebiasaan berkunjung rutin (habit formation) dan tingkatkan AOV lewat cross-selling hidangan khas.',
    action: 'Berikan kupon traktiran Tahu Cirawraw renyah untuk kunjungan ke-2, diskon 50% minuman signature, dan undang ke VIP WhatsApp Promo.',
    sopRestoran: [
      '1. Kasir mencetak struk dengan stempel "Kupon Traktiran Tahu Cirawraw Kunjungan Ke-2 (Masa Berlaku 14 Hari)".',
      '2. Pramusaji merekomendasikan pairing minuman signature (Kopi Susu Aren Santan Garut / Es Cincau Jadoel) dengan potongan harga 50%.',
      '3. Petugas kasir mengajak pelanggan menyimpan nomor WhatsApp resmi resto untuk info menu spesial mingguan.'
    ],
    incentive: 'Diskon 50% Minuman Signature Sunda + Voucher Gratis Tahu Cirawraw Kunjungan Ke-2.',
    waTemplate: 'Hatur nuhun Kak [Nama] sudah mampir ke Bumi Upi Garut! Bagaimana rasa sambel dan liwetnya kemarin? Untuk kedatangan berikutnya dalam 14 hari ke depan, kami traktir 1 Porsi Tahu Cirawraw Renyah gratis ya! Cukup tunjukkan WhatsApp ini ke kasir.',
    roiImpact: 'Meningkatkan konversi repeat order dari 35% menjadi 62% dalam 14 hari pertama.',
    color: '#D4A24C',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  'Butuh Perhatian': {
    title: 'Butuh Perhatian (Need Attention)',
    desc: 'Pelanggan dengan frekuensi dan nilai belanja di atas rata-rata yang sudah 15-35 hari belum berkunjung kembali.',
    objective: 'Re-engagement cepat sebelum pelanggan lupa cita rasa Bumi Upi atau terbiasa makan di tempat lain.',
    action: 'Kirimkan pesan personal "Kami Rindu di Bumi Upi" via WhatsApp dengan voucher potongan Rp 25.000 berlaku 7 hari, plus survei kepuasan rasa.',
    sopRestoran: [
      '1. Sistem CRM memicu pengiriman pesan pengingat ramah otomatis di hari ke-18 sejak kunjungan terakhir.',
      '2. Kasir POS siap memvalidasi kode voucher potongan Rp 25.000 tanpa syarat minimal belanja rumit.',
      '3. Kasir menanyakan masukan singkat tentang rasa masakan untuk memastikan tidak ada kendala kualitas hidangan di kunjungan sebelumnya.'
    ],
    incentive: 'Voucher Potongan Langsung Rp 25.000 (Berlaku 7 Hari) + Es Teh Manis Jumbo Meja.',
    waTemplate: 'Sampurasun Kak [Nama]! Meja kayu favorit dan wangi liwet kastrol Bumi Upi sudah kangen nih sama Kakak. Ini kami kirimkan Voucher Khusus Potongan Rp 25.000 yang berlaku sampai hari Minggu ini. Yuk luangkan waktu mampir santai sore ini!',
    roiImpact: 'Menyelamatkan 40% pelanggan yang berpotensi meluncur ke segmen Berisiko.',
    color: '#634E3F',
    badgeBg: 'bg-stone-200 text-stone-800 border-stone-300'
  },
  'Hampir Lepas': {
    title: 'Hampir Lepas (About to Sleep)',
    desc: 'Pelanggan bernilai yang sudah 40-75 hari tidak berkunjung (recency menurun tajam), rentan beralih permanen.',
    objective: 'Bangkitkan kembali minat berkunjung melalui menu baru yang menggugah selera dan paket makan beramai-ramai yang hemat.',
    action: 'Luncurkan promo Paket Botram Berempat Hemat Rp 149.000, kirim video racikan menu baru, dan beri pengingat poin reward yang akan kedaluwarsa.',
    sopRestoran: [
      '1. Kirim pesan visual foto hidangan signature (Ayam Bakar Madu Pasundan & Gurame Sambal Honje) via WhatsApp broadcast.',
      '2. Tawarkan jaminan kepuasan rasa Masakan Tradisional Garut.',
      '3. Sertakan pengingat bahwa poin loyalitas yang dimiliki dapat langsung ditukarkan dengan hidangan lauk gratis.'
    ],
    incentive: 'Paket Botram Hemat Berempat Rp 149.000 + 1 Pitcher Teh Lemon Sereh Segar.',
    waTemplate: 'Halo Kak [Nama], sudah lama sekali tidak jumpa di Bumi Upi Garut! Dapur kami baru saja merilis racikan baru Ayam Bakar Madu Pasundan yang harum legit. Khusus Kakak, nikmati Paket Makan Berempat hanya Rp 149rb + Gratis 1 Pitcher Minuman Segar. Yuk ajak sahabat reuni kecil di sini!',
    roiImpact: 'Reaktivasi 20% basis data menghasilkan tambahan omzet Rp 24.000.000 dari transaksi meja botram.',
    color: '#B4532A',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  Berisiko: {
    title: 'Berisiko (At Risk Big Spenders)',
    desc: 'Dahulu pembelanja besar (frekuensi 8-22x, total belanja Rp 1.2jt - 3.5jt), tetapi sudah 2 sampai 4 bulan tidak pernah mampir sama sekali.',
    objective: 'Rebut kembali pelanggan bernilai tinggi melalui pendekatan personal level manajemen / Owner dan atasi potensi keluhan.',
    action: 'Hubungi secara personal via WhatsApp ramah dari Manajemen/Owner, tawarkan Traktiran Meja Rp 50.000 TANPA syarat minimal belanja, dan reservasi meja utama.',
    sopRestoran: [
      '1. Manajer resto memeriksa riwayat pesanan pelanggan terdahulu untuk mengetahui hidangan favorit keluarga.',
      '2. Kirim pesan personal tulus menanyakan kabar dan feedback tanpa kesan memaksa berjualan.',
      '3. Jika pelanggan mengonfirmasi datang, staf menyambut di pintu masuk dan memberikan meja terbaik dengan complimentary buah segar.'
    ],
    incentive: 'Voucher Traktiran Makan Rp 50.000 Tanpa Minimum Belanja + Free Dessert Kelapa Muda.',
    waTemplate: 'Salam hangat dari Manajemen Bumi Upi Garut untuk Kak [Nama]. Kami sangat merindukan kehadiran Kakak yang dahulu sering mampir bersama keluarga. Bila ada pelayanan atau cita rasa kami yang kurang berkenan di masa lalu, mohon dimaafkan ya Kak. Kami ingin mentraktir Kakak Voucher Rp 50.000 tanpa syarat belanja apa pun untuk santap siang berikutnya. Semoga berkenan mampir kembali.',
    roiImpact: 'Mengembalikan 15-25% pelanggan bernilai tinggi dengan potensi omzet kembali hingga Rp 45.000.000/tahun.',
    color: '#9E4520',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  Tertidur: {
    title: 'Tertidur (Hibernating / Dormant)',
    desc: 'Kunjungan terakhir sangat lama (> 90-180 hari), frekuensi rendah (1-3x), dan nilai transaksi kecil (< Rp 380rb).',
    objective: 'Re-aktivasi dengan biaya promosi rendah (low CAC) atau bersihkan database agar tidak dianggap mengirim spam.',
    action: 'Kirimkan kampanye "Surat Rindu Nenek Garut" berhadiah Beli 1 Makanan Utama Gratis 1 Minuman Tradisional (Bajigur / Bandrek / Cincau), atau bersihkan nomor inaktif.',
    sopRestoran: [
      '1. Jadwalkan blast pesan triwulanan dengan pesan bertema nostalgia dan kehangatan Garut tempo doeloe.',
      '2. Tawarkan menu entri yang ringan dan mudah disukai anak muda/keluarga.',
      '3. Sertakan opsi sederhana: jika nomor sudah tidak aktif atau pelanggan telah pindah kota, data dapat diarsipkan.'
    ],
    incentive: 'Promo Beli 1 Hidangan Utama Gratis 1 Minuman Tradisional (Bajigur / Bandrek / Es Cincau).',
    waTemplate: 'Sampurasun Kak [Nama]! Ada salam rindu dari Garut. Kapan terakhir kali santai menghirup sejuknya udara Bumi Upi? Minggu ini ada promo spesial: Beli hidangan utama apa saja, kami traktir minuman tradisional favorit Kakak. Ditunggu mampirnya ya Kak!',
    roiImpact: 'Membangkitkan 5-10% pelanggan pasif menjadi aktif kembali dengan biaya promosi mendekati Rp 0.',
    color: '#6B7280',
    badgeBg: 'bg-gray-100 text-gray-700 border-gray-300'
  }
};
