import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/adminStore';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Jika ini adalah pesanan yang disinkronkan dari portal Web
    if (body.id && (body.orderNumber || body.status)) {
      adminStore.mergeLiveOrders([body]);

      // Simpan ke shared layer dan kurangi stok inventaris real-time
      try {
        const dbPkg = await import('@bumi-upi/db' as any);
        if (dbPkg && typeof dbPkg.saveSharedOrder === 'function') {
          dbPkg.saveSharedOrder(body);
        }
        if (dbPkg && typeof dbPkg.deductSharedStock === 'function') {
          dbPkg.deductSharedStock(body.items || []);
        }
      } catch {}

      return NextResponse.json(
        {
          success: true,
          order: body,
          message: 'Pesanan Web berhasil disinkronkan ke Kasir & Dapur Admin'
        },
        { headers: corsHeaders }
      );
    }

    // 2. Pembuatan pesanan baru langsung dari Kasir POS Admin
    const result = adminStore.createOrderAtomic(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400, headers: corsHeaders }
      );
    }

    // Sinkronkan pengurangan stok ke data layer bersama
    try {
      const dbPkg = await import('@bumi-upi/db' as any);
      if (dbPkg && typeof dbPkg.deductSharedStock === 'function') {
        dbPkg.deductSharedStock(result.order?.items || body.items || []);
      }
    } catch {}

    return NextResponse.json(
      {
        success: true,
        order: result.order
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  // 1. Ambil pesanan live dari Supabase Database jika credentials aktif
  try {
    const dbPkg = await import('@bumi-upi/db' as any);
    if (dbPkg && dbPkg.supabaseService && typeof dbPkg.isMockMode === 'function' && !dbPkg.isMockMode()) {
      const sbOrders = await dbPkg.supabaseService.getOrders();
      if (Array.isArray(sbOrders) && sbOrders.length > 0) {
        adminStore.mergeLiveOrders(sbOrders);
      }
    }
  } catch {}

  // 2. Ambil pesanan live dari shared local storage (@bumi-upi/db)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dbPkg = await import('@bumi-upi/db' as any);
    if (dbPkg && typeof dbPkg.getSharedOrders === 'function') {
      const liveOrders = dbPkg.getSharedOrders();
      if (Array.isArray(liveOrders) && liveOrders.length > 0) {
        adminStore.mergeLiveOrders(liveOrders);
      }
    }
  } catch {
    // fallback
  }

  // 3. Tarik langsung pesanan live dari Web Portal jika sedang berjalan
  try {
    const webBase = process.env.NEXT_PUBLIC_WEB_URL || process.env.WEB_URL || 'http://127.0.0.1:3000';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${webBase}/api/orders`, {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        adminStore.mergeLiveOrders(data.orders);
      }
    }
  } catch {
    // fallback silent
  }

  return NextResponse.json(
    {
      success: true,
      orders: adminStore.orders,
      count: adminStore.orders.length
    },
    { headers: corsHeaders }
  );
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (orderId && status) {
      // Update di Supabase jika credentials aktif
      try {
        const dbPkg = await import('@bumi-upi/db' as any);
        if (dbPkg && dbPkg.supabaseService && typeof dbPkg.isMockMode === 'function' && !dbPkg.isMockMode()) {
          await dbPkg.supabaseService.updateOrderStatus(orderId, status);
        }
      } catch {}

      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const dbPkg = await import('@bumi-upi/db' as any);
        if (dbPkg && typeof dbPkg.updateSharedOrderStatus === 'function') {
          dbPkg.updateSharedOrderStatus(orderId, status);
        }
      } catch {
        // fallback
      }

      adminStore.updateOrderStatus(orderId, status);

      // Kirim pembaruan status ke portal web
      const candidateWebUrls = [
        process.env.NEXT_PUBLIC_WEB_URL,
        process.env.WEB_URL,
        'http://127.0.0.1:3000'
      ].filter(Boolean) as string[];

      for (const wUrl of candidateWebUrls) {
        try {
          fetch(`${wUrl}/api/orders`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, status }),
          }).catch(() => {});
        } catch {}
      }

      return NextResponse.json({ success: true, orderId, status }, { headers: corsHeaders });
    }

    return NextResponse.json(
      { success: false, error: 'orderId dan status wajib disertakan' },
      { status: 400, headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
