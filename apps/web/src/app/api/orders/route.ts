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

    const createdOrder = result.order || orderEngine.getOrder(result.orderId) || {
      id: result.orderId || `ord-${Date.now()}`,
      orderNumber: result.orderNumber || `BU-ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0001`,
      idempotencyKey: key,
      customerId,
      orderType: orderType || 'dine_in',
      tableNumber: tableNumber || 'Meja 01',
      status: result.status || 'confirmed',
      subtotal: result.subtotal || 0,
      discountAmount: result.discountAmount || 0,
      finalAmount: result.finalAmount || 0,
      pointsEarned: result.pointsEarned || 0,
      paymentMethod: paymentMethod || 'qris',
      paymentStatus: 'paid',
      items: items || [],
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    // 1. Simpan ke data layer bersama (@bumi-upi/db)
    try {
      const dbPkg = await import('@bumi-upi/db' as any);
      if (dbPkg && typeof dbPkg.saveSharedOrder === 'function') {
        dbPkg.saveSharedOrder(createdOrder);
      }
    } catch {}

    // 2. Notifikasi langsung ke Admin POS / Dapur KDS jika server admin sedang aktif
    try {
      const adminUrl = process.env.ADMIN_URL || 'http://127.0.0.1:3001';
      fetch(`${adminUrl}/api/pos/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdOrder),
      }).catch(() => {});
    } catch {}

    return NextResponse.json({
      success: true,
      ...result,
      order: createdOrder,
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
    const customerId = url.searchParams.get('customerId');

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

    // 2. Return list of orders for customer history
    let sharedOrders: any[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const dbPkg = await import('@bumi-upi/db' as any);
      if (dbPkg && typeof dbPkg.getSharedOrders === 'function') {
        sharedOrders = dbPkg.getSharedOrders();
      }
    } catch {
      // fallback
    }

    const localOrders = orderEngine.getCustomerOrders(customerId || undefined);
    const mergedMap = new Map();
    for (const o of [...sharedOrders, ...localOrders]) {
      if (!customerId || o.customerId === customerId || customerId === 'all') {
        mergedMap.set(o.id, o);
      }
    }

    const list = Array.from(mergedMap.values()).sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      orders: list,
      count: list.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan internal' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Parameter id dan status wajib disertakan' },
        { status: 400 }
      );
    }

    // 1. Update in shared live store
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const dbPkg = await import('@bumi-upi/db' as any);
      if (dbPkg && typeof dbPkg.updateSharedOrderStatus === 'function') {
        dbPkg.updateSharedOrderStatus(id, status);
      }
    } catch {
      // fallback
    }

    // 2. Update in local order engine
    const updated = orderEngine.updateOrderStatus(id, status);

    return NextResponse.json({
      success: true,
      order: updated,
      status,
      message: `Status pesanan berhasil diperbarui menjadi ${status}`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal memperbarui status pesanan' },
      { status: 500 }
    );
  }
}
