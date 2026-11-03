/**
 * BUMI UPI CRM — RFM & CLV ANALYTICS ENGINE
 * Case Study: Rumah Tamah Bumi Upi, Garut, Jawa Barat
 * Standar Analisis CRM F&B Modern Berbasis Kuintil (Skor 1 - 5)
 */

export interface RFMSummary {
  segment: string;
  count: number;
  percentage: number;
  avgRecencyDays: number;
  avgFrequency: number;
  totalMonetary: number;
  avgMonetary: number;
  avgCLV: number;
  color: string;
  badgeBg: string;
  definition: string;
  actionRecommendation: string;
  suitableVoucherCode: string;
}

export const RFM_DEFINITIONS: Record<string, {
  definition: string;
  actionRecommendation: string;
  color: string;
  badgeBg: string;
  suitableVoucherCode: string;
}> = {
  'Champions': {
    definition: 'Pelanggan terbaik: berkunjung dalam 3 minggu terakhir, frekuensi sangat tinggi (≥8x), dan total belanja tertinggi.',
    actionRecommendation: 'Beri perlakuan VIP, traktiran spesial ulang tahun, jadikan duta rasa "Keluarga Bumi", undang ke event nobar eksklusif.',
    color: '#3E4F30',
    badgeBg: 'bg-[#3E4F30] text-white',
    suitableVoucherCode: 'KELUARGA-HEMAT'
  },
  'Loyal': {
    definition: 'Pelanggan setia: rutin berkunjung 5-7 kali dalam 45 hari terakhir, belanja stabil dan menyukai masakan andalan.',
    actionRecommendation: 'Tawarkan program naik level ke tier Keluarga, rekomendasikan menu baru seperti Nasi Liwet Kastrol Komplit.',
    color: '#8A8F5F',
    badgeBg: 'bg-[#8A8F5F] text-white',
    suitableVoucherCode: 'NOBAR-PERSIB'
  },
  'Potensial Loyal': {
    definition: 'Pelanggan berpotensi: baru 2-4 kali berkunjung dalam 30 hari terakhir dengan nilai transaksi menjanjikan.',
    actionRecommendation: 'Dorong kebiasaan berkunjung rutin lewat voucher makan siang tengah minggu dan tantangan poin berhadiah.',
    color: '#D4A24C',
    badgeBg: 'bg-[#D4A24C] text-[#3B2A1E]',
    suitableVoucherCode: 'WILUJENG-UPI'
  },
  'Baru': {
    definition: 'Pelanggan baru: baru 1 kali berkunjung dalam 21 hari terakhir, sedang mengeksplorasi suasana rumah.',
    actionRecommendation: 'Kirimkan ucapan terima kasih personal, bimbing cara mengumpulkan poin kartu digital, dan berikan voucher kunjungan kedua.',
    color: '#3B82F6',
    badgeBg: 'bg-blue-100 text-blue-900 border border-blue-300',
    suitableVoucherCode: 'WILUJENG-UPI'
  },
  'Berisiko': {
    definition: 'Pelanggan berisiko kabur: dulu langganan (≥3x), namun sudah 45-90 hari belum singgah kembali.',
    actionRecommendation: 'Kirimkan kampanye win-back hangat bernada nostalgia: "Kangen Masakan Rumah Nenek?" disertai voucher potongan Rp 25.000.',
    color: '#B4532A',
    badgeBg: 'bg-[#B4532A] text-white',
    suitableVoucherCode: 'RINDU-RUMAH'
  },
  'Hampir Hilang': {
    definition: 'Pelanggan yang hampir hilang kontak: tidak berkunjung antara 91-140 hari dengan frekuensi rendah.',
    actionRecommendation: 'Kirimkan pesan re-engagement via Telegram atau WhatsApp menanyakan kabar dan tawarkan traktiran es cokelat gratis.',
    color: '#EA580C',
    badgeBg: 'bg-orange-100 text-orange-900 border border-orange-300',
    suitableVoucherCode: 'RINDU-RUMAH'
  },
  'Hilang': {
    definition: 'Pelanggan hilang (churned): sudah lebih dari 140 hari tidak berkunjung.',
    actionRecommendation: 'Evaluasi survei feedback untuk mengetahui keluhan layanan; jalankan kampanye musiman diskon reuni komunitas.',
    color: '#6B7280',
    badgeBg: 'bg-gray-100 text-gray-800 border border-gray-300',
    suitableVoucherCode: 'RINDU-RUMAH'
  }
};

/**
 * Menghitung ringkasan statistik per segmen RFM
 */
export function calculateRFMSummary(rfmList: any[]): RFMSummary[] {
  const segmentOrder = ['Champions', 'Loyal', 'Potensial Loyal', 'Baru', 'Berisiko', 'Hampir Hilang', 'Hilang'];
  const totalCustomers = rfmList.length || 1;

  return segmentOrder.map(segName => {
    const matched = rfmList.filter(item => item.rfm_segment === segName);
    const count = matched.length;
    const percentage = Math.round((count / totalCustomers) * 100);

    const avgRecency = count > 0
      ? Math.round(matched.reduce((acc, curr) => acc + curr.recency_days, 0) / count)
      : 0;

    const avgFreq = count > 0
      ? Math.round((matched.reduce((acc, curr) => acc + curr.frequency_count, 0) / count) * 10) / 10
      : 0;

    const totalMon = matched.reduce((acc, curr) => acc + curr.monetary_total, 0);
    const avgMon = count > 0 ? Math.round(totalMon / count) : 0;
    const avgCLV = count > 0 ? Math.round(matched.reduce((acc, curr) => acc + curr.clv_estimate, 0) / count) : 0;

    const meta = RFM_DEFINITIONS[segName] || {
      definition: '-',
      actionRecommendation: '-',
      color: '#3E4F30',
      badgeBg: 'bg-slate-200 text-slate-800',
      suitableVoucherCode: 'WILUJENG-UPI'
    };

    return {
      segment: segName,
      count,
      percentage,
      avgRecencyDays: avgRecency,
      avgFrequency: avgFreq,
      totalMonetary: totalMon,
      avgMonetary: avgMon,
      avgCLV,
      color: meta.color,
      badgeBg: meta.badgeBg,
      definition: meta.definition,
      actionRecommendation: meta.actionRecommendation,
      suitableVoucherCode: meta.suitableVoucherCode
    };
  });
}
