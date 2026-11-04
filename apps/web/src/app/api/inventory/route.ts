import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    let items: any[] = [];
    try {
      const dbPkg = await import('@bumi-upi/db' as any);
      if (dbPkg && typeof dbPkg.getSharedInventory === 'function') {
        items = dbPkg.getSharedInventory();
      }
    } catch {}

    return NextResponse.json(
      {
        success: true,
        items,
        timestamp: new Date().toISOString()
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal mengambil data inventaris' },
      { status: 500, headers: corsHeaders }
    );
  }
}
