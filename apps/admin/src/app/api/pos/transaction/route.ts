import { NextRequest, NextResponse } from 'next/server';
import { adminStore } from '@/lib/adminStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
