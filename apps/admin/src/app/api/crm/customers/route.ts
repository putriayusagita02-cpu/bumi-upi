import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/adminStore';
import { INITIAL_CUSTOMERS, CustomerProfile } from '@/lib/crmData';

export async function GET() {
  const mergedMap = new Map<string, CustomerProfile>();

  // 1. Muat pelanggan bawaan (10 profil awal)
  for (const c of INITIAL_CUSTOMERS) {
    mergedMap.set(c.id, c);
    if (c.phone) mergedMap.set(c.phone, c);
  }

  // 2. Muat dari adminStore di memori
  for (const c of adminStore.customers) {
    mergedMap.set(c.id, c);
    if (c.phone) mergedMap.set(c.phone, c);
  }

  // 3. Ambil member baru yang terdaftar dari @bumi-upi/db shared live store
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dbPkg = await import('@bumi-upi/db' as any);
    if (dbPkg && typeof dbPkg.getSharedCustomers === 'function') {
      const liveCust = dbPkg.getSharedCustomers();
      for (const lc of liveCust) {
        const profile: CustomerProfile = {
          id: lc.id || `cust-${Date.now()}`,
          name: lc.name || 'Member Baru',
          email: lc.email || '',
          phone: lc.phone || '',
          tier: (lc.tier || 'Tamu') as any,
          pointsBalance: lc.pointsBalance !== undefined ? lc.pointsBalance : (lc.points_balance || 50),
          cumulativePoints: lc.cumulativePoints !== undefined ? lc.cumulativePoints : (lc.cumulative_points || 50),
          qrCode: lc.qrCode || lc.qrValue || `BUMI-CUST-${lc.phone ? lc.phone.slice(-4) : '9999'}`,
          recencyDays: lc.recencyDays || 0,
          frequencyCount: lc.frequencyCount || 0,
          monetaryTotal: lc.monetaryTotal || 0,
          rScore: 3,
          fScore: 3,
          mScore: 3,
          rfmScore: '333',
          segment: (lc.segment || lc.rfmSegment || 'Potensial') as any,
          clvEstimate: lc.clvEstimate || lc.clvValue || 150000,
          lastVisitWib: lc.lastVisitWib || 'Baru Saja'
        };
        mergedMap.set(profile.id, profile);
        if (profile.phone) mergedMap.set(profile.phone, profile);
      }
    }
  } catch {}

  const list = Array.from(new Set(mergedMap.values()));

  return NextResponse.json({
    success: true,
    customers: list,
    count: list.length
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || (!body.phone && !body.email && !body.name)) {
      return NextResponse.json({ success: false, error: 'Data pelanggan tidak lengkap' }, { status: 400 });
    }

    const profile: CustomerProfile = {
      id: body.id || `cust-${Date.now()}`,
      name: body.name || 'Member Baru',
      email: body.email || '',
      phone: body.phone || '',
      tier: (body.tier || 'Tamu') as any,
      pointsBalance: body.pointsBalance !== undefined ? body.pointsBalance : 50,
      cumulativePoints: body.cumulativePoints !== undefined ? body.cumulativePoints : 50,
      qrCode: body.qrCode || body.qrValue || `BUMI-CUST-${body.phone ? body.phone.slice(-4) : '9999'}`,
      recencyDays: 0,
      frequencyCount: body.frequencyCount || 0,
      monetaryTotal: body.monetaryTotal || 0,
      rScore: 3,
      fScore: 3,
      mScore: 3,
      rfmScore: '333',
      segment: (body.segment || body.rfmSegment || 'Potensial') as any,
      clvEstimate: body.clvEstimate || body.clvValue || 150000,
      lastVisitWib: 'Baru Saja'
    };

    // Simpan ke data layer bersama
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const dbPkg = await import('@bumi-upi/db' as any);
      if (dbPkg && typeof dbPkg.saveSharedCustomer === 'function') {
        dbPkg.saveSharedCustomer(profile);
      }
    } catch {}

    // Tambahkan ke adminStore
    const exists = adminStore.customers.some((c) => c.id === profile.id || (profile.phone && c.phone === profile.phone));
    if (!exists) {
      adminStore.customers.unshift(profile);
      adminStore.saveToStorage();
    }

    return NextResponse.json({
      success: true,
      customer: profile,
      message: 'Member baru berhasil dicatat di CRM Staf'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
