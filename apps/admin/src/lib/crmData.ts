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

export const SEGMENT_DEFINITIONS: Record<RfmSegment, { desc: string; action: string; color: string; badgeBg: string }> = {
  Juara: {
    desc: 'Pelanggan terbaik, paling sering datang, dan berbelanja paling banyak.',
    action: 'Berikan apresiasi VIP eksklusif, cicipi menu baru gratis, jadikan duta promosi.',
    color: '#3E4F30',
    badgeBg: 'bg-olive-100 text-olive-800 border-olive-300'
  },
  Setia: {
    desc: 'Pelanggan reguler yang konsisten berkunjung dengan nilai belanja stabil.',
    action: 'Tawarkan program loyalitas tier Sahabat/Keluarga dan diskon paket keluarga.',
    color: '#8A8F5F',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  Potensial: {
    desc: 'Pelanggan baru atau reguler dengan belanja cukup tinggi dan prospek bagus.',
    action: 'Rekomendasikan menu pelengkap & voucher sambutan kunjungan berikutnya.',
    color: '#D4A24C',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  'Butuh Perhatian': {
    desc: 'Pelanggan dengan frekuensi dan nilai belanja di atas rata-rata yang mulai jarang mampir.',
    action: 'Kirimkan pesan personal via Telegram/WA dan voucher diskon terbatas waktu.',
    color: '#634E3F',
    badgeBg: 'bg-stone-200 text-stone-800 border-stone-300'
  },
  'Hampir Lepas': {
    desc: 'Pelanggan bernilai yang sudah lama tidak berkunjung (recency menurun).',
    action: 'Luncurkan kampanye "Kangen Masakan Nenek" dengan penawaran menu favorit.',
    color: '#B4532A',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  Berisiko: {
    desc: 'Dahulu pembelanja besar dan sering mampir, tetapi tidak pernah datang belakangan ini.',
    action: 'Hubungi via WhatsApp secara langsung dari Teh Upi dengan penawaran spesial.',
    color: '#9E4520',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  Tertidur: {
    desc: 'Kunjungan terakhir sangat lama, frekuensi rendah, dan nilai transaksi kecil.',
    action: 'Re-aktivasi dengan promo nobar atau voucher minuman gratis sekali datang.',
    color: '#6B7280',
    badgeBg: 'bg-gray-100 text-gray-700 border-gray-300'
  }
};
