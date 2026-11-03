/**
 * BUMI UPI CRM & ORDERING MONOREPO
 * RFM Analytics & Customer Lifetime Value (CLV) Computation Engine
 * Location: packages/db/src/rfmEngine.ts
 */

import type {
  Profile,
  Order,
  RFMScore,
  RFMSummary,
  RfmSegment,
  RfmSegmentEnglish,
  RfmSegmentIndonesian
} from './types';

export const RFM_SEGMENT_MAP: Record<RfmSegmentEnglish, RfmSegmentIndonesian> = {
  'Champions': 'Juara',
  'Loyal': 'Setia',
  'Potensial Loyal': 'Potensial',
  'Baru': 'Butuh Perhatian',
  'Berisiko': 'Berisiko',
  'Hampir Hilang': 'Hampir Lepas',
  'Hilang': 'Tertidur'
};

export const RFM_INDO_TO_ENG_MAP: Record<RfmSegmentIndonesian, RfmSegmentEnglish> = {
  'Juara': 'Champions',
  'Setia': 'Loyal',
  'Potensial': 'Potensial Loyal',
  'Butuh Perhatian': 'Baru',
  'Hampir Lepas': 'Hampir Hilang',
  'Berisiko': 'Berisiko',
  'Tertidur': 'Hilang'
};

export function classifyRfmSegment(r: number, f: number, m: number, recencyDays?: number, frequencyCount?: number): RfmSegmentEnglish {
  // If raw metrics provided, apply specific F&B industry rules
  if (recencyDays !== undefined && frequencyCount !== undefined) {
    if (recencyDays <= 21 && frequencyCount >= 8) return 'Champions';
    if (frequencyCount >= 5 && recencyDays <= 45) return 'Loyal';
    if (recencyDays <= 30 && frequencyCount >= 2 && frequencyCount <= 4) return 'Potensial Loyal';
    if (recencyDays <= 21 && frequencyCount <= 1) return 'Baru';
    if (recencyDays >= 46 && recencyDays <= 90 && frequencyCount >= 3) return 'Berisiko';
    if (recencyDays >= 91 && recencyDays <= 140) return 'Hampir Hilang';
    if (recencyDays > 140) return 'Hilang';
  }

  // Fallback to RFM 1-5 score matrix
  if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
  if (r >= 3 && f >= 3) return 'Loyal';
  if (r >= 4 && f <= 2) return 'Baru';
  if (r <= 2 && f >= 3) return 'Berisiko';
  if (r <= 2 && f <= 2 && m <= 2) return 'Hilang';
  if (r <= 2 && f <= 3) return 'Hampir Hilang';
  return 'Potensial Loyal';
}

export function computeRScore(days: number): number {
  if (days <= 14) return 5;
  if (days <= 30) return 4;
  if (days <= 60) return 3;
  if (days <= 90) return 2;
  return 1;
}

export function computeFScore(count: number): number {
  if (count >= 15) return 5;
  if (count >= 8) return 4;
  if (count >= 4) return 3;
  if (count >= 2) return 2;
  return 1;
}

export function computeMScore(total: number): number {
  if (total >= 1500000) return 5;
  if (total >= 800000) return 4;
  if (total >= 400000) return 3;
  if (total >= 150000) return 2;
  return 1;
}

export function computeCustomerRfm(
  customer: Profile,
  transactions: Order[],
  asOfDate: Date = new Date('2026-11-01T00:00:00+07:00')
): RFMScore {
  const custTx = transactions.filter(
    (t) => (t.customerId === customer.id || t.customerPhone === customer.phone) && t.status !== 'cancelled'
  );

  const asOfTime = asOfDate.getTime();
  let recencyDays = 180;
  let frequencyCount = custTx.length;
  let monetaryTotal = 0;
  let lastVisit = customer.created_at;

  if (custTx.length > 0) {
    let latestTxTime = 0;
    for (const tx of custTx) {
      monetaryTotal += tx.finalAmount;
      const tTime = new Date(tx.createdAt).getTime();
      if (tTime > latestTxTime) {
        latestTxTime = tTime;
        lastVisit = tx.createdAt;
      }
    }
    const diffMs = Math.max(0, asOfTime - latestTxTime);
    recencyDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  const rScore = computeRScore(recencyDays);
  const fScore = computeFScore(frequencyCount);
  const mScore = computeMScore(monetaryTotal);
  const segment = classifyRfmSegment(rScore, fScore, mScore, recencyDays, frequencyCount);

  // CLV Estimation
  const aov = frequencyCount > 0 ? monetaryTotal / frequencyCount : 0;
  const annualFreq = frequencyCount * 2; // annualized from 6mo window
  const lifespanYears = 1.5;
  const clvEstimate = Math.round(aov * annualFreq * lifespanYears);

  return {
    customer_id: customer.id,
    customer_name: customer.name,
    phone: customer.phone,
    tier: customer.tier,
    recency_days: recencyDays,
    frequency_count: frequencyCount,
    monetary_total: monetaryTotal,
    r_score: rScore,
    f_score: fScore,
    m_score: mScore,
    rfm_segment: segment,
    clv_estimate: clvEstimate,
    last_visit: lastVisit
  };
}

export function computeAllRfmScores(
  customers: Profile[],
  transactions: Order[],
  asOfDate: Date = new Date('2026-11-01T00:00:00+07:00')
): RFMScore[] {
  const onlyCustomers = customers.filter((c) => c.role === 'customer');
  return onlyCustomers.map((cust) => computeCustomerRfm(cust, transactions, asOfDate));
}

export function generateRfmSummary(rfmScores: RFMScore[], transactions: Order[]): RFMSummary {
  const totalCustomers = rfmScores.length;
  const totalTransactions = transactions.filter((t) => t.status !== 'cancelled').length;
  const totalRevenue = rfmScores.reduce((acc, curr) => acc + curr.monetary_total, 0);
  const averageAOV = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  const segmentOrder: RfmSegmentEnglish[] = [
    'Champions',
    'Loyal',
    'Potensial Loyal',
    'Baru',
    'Berisiko',
    'Hampir Hilang',
    'Hilang'
  ];

  const segments: RFMSummary['segments'] = {};

  for (const seg of segmentOrder) {
    const matching = rfmScores.filter((s) => s.rfm_segment === seg);
    const count = matching.length;
    const percentage = totalCustomers > 0 ? Number(((count / totalCustomers) * 100).toFixed(1)) : 0;
    const segRevenue = matching.reduce((acc, curr) => acc + curr.monetary_total, 0);
    const segFreq = matching.reduce((acc, curr) => acc + curr.frequency_count, 0);
    const segRec = matching.reduce((acc, curr) => acc + curr.recency_days, 0);
    const clvTotal = matching.reduce((acc, curr) => acc + curr.clv_estimate, 0);

    segments[seg] = {
      name: seg,
      labelSunda: RFM_SEGMENT_MAP[seg],
      count,
      percentage,
      monetaryTotal: segRevenue,
      avgMonetary: count > 0 ? Math.round(segRevenue / count) : 0,
      avgFrequency: count > 0 ? Number((segFreq / count).toFixed(1)) : 0,
      avgRecency: count > 0 ? Math.round(segRec / count) : 0,
      clvTotal
    };
  }

  return {
    totalCustomers,
    totalTransactions,
    totalRevenue,
    averageAOV,
    segments
  };
}
