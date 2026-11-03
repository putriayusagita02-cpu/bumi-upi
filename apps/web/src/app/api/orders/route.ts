import { NextRequest, NextResponse } from 'next/server';
import { createOrderAtomic, orderEngine } from '../../../lib/dbBridge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      idempotencyKey,
      customerId,
      orderType,
      tableNumber,
      items,
      customerVoucherId,
      paymentMethod,
      notes,
    } = body;

    const key = idempotencyKey || `web-idemp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const result = await createOrderAtomic({
      idempotencyKey: key,
      customerId,
      orderType,
      tableNumber,
      items,
      customerVoucherId,
      paymentMethod: paymentMethod || 'qris',
      notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Gagal membuat pesanan' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (id) {
      // 1. Check shared live store first (has updated status from Kitchen / POS)
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const dbPkg = await import('@bumi-upi/db' as any);
        if (dbPkg && typeof dbPkg.getSharedOrders === 'function') {
          const sharedList = dbPkg.getSharedOrders();
          const found = sharedList.find(
            (o: any) => o.id === id || o.orderNumber === id || o.idempotencyKey === id
          );
          if (found) {
            return NextResponse.json({ success: true, order: found });
          }
        }
      } catch {
        // fallback
      }

      const order = orderEngine.getOrder(id);
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Pesanan tidak ditemukan' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, order });
    }

    return NextResponse.json({
      success: false,
      error: 'Parameter id wajib disertakan',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan internal' },
      { status: 500 }
    );
  }
}
