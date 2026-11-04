import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/adminStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Jika ini adalah pesanan yang disinkronkan dari portal Web
    if (body.id && (body.orderNumber || body.status)) {
      adminStore.mergeLiveOrders([body]);
      return NextResponse.json({
        success: true,
        order: body,
        message: 'Pesanan Web berhasil disinkronkan ke Kasir & Dapur Admin'
      });
    }

    // 2. Pembuatan pesanan baru langsung dari Kasir POS Admin
    const result = adminStore.createOrderAtomic(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 1. Ambil pesanan live yang dibuat oleh pengguna dari portal Web (@bumi-upi/db)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dbPkg = await import('@bumi-upi/db' as any);
    if (dbPkg && typeof dbPkg.getSharedOrders === 'function') {
      const liveOrders = dbPkg.getSharedOrders();
      adminStore.mergeLiveOrders(liveOrders);
    }
  } catch {
    // fallback
  }

  // 2. Tarik langsung pesanan live dari Web Portal (Port 3000) jika sedang berjalan
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

  return NextResponse.json({
    success: true,
    orders: adminStore.orders,
    count: adminStore.orders.length
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (orderId && status) {
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
      return NextResponse.json({ success: true, orderId, status });
    }

    return NextResponse.json(
      { success: false, error: 'orderId dan status wajib disertakan' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
