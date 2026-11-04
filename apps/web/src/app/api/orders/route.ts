import { NextRequest, NextResponse } from 'next/server';
import { createOrderAtomic, orderEngine } from '../../../lib/dbBridge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      idempotencyKey,
      customerId,
      customerName,
      customerPhone,
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

    const resolvedCustName = customerName || (result.order as any)?.customerName || (customerId ? 'Pelanggan Member' : 'Tamu Mandiri (Web)');
    const resolvedCustPhone = customerPhone || (result.order as any)?.customerPhone || '';

    const createdOrder = {
      ...(result.order || orderEngine.getOrder(result.orderId) || {}),
      id: result.orderId || (result.order as any)?.id || `ord-${Date.now()}`,
      orderNumber: result.orderNumber || (result.order as any)?.orderNumber || `BU-ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0001`,
      idempotencyKey: key,
      customerId,
      customerName: resolvedCustName,
      customerPhone: resolvedCustPhone,
      orderType: orderType || 'dine_in',
      tableNumber: tableNumber || 'Meja 01',
      status: result.status || (result.order as any)?.status || 'confirmed',
      subtotal: result.subtotal || (result.order as any)?.subtotal || 0,
      discountAmount: result.discountAmount || (result.order as any)?.discountAmount || 0,
      finalAmount: result.finalAmount || (result.order as any)?.finalAmount || 0,
      pointsEarned: result.pointsEarned || (result.order as any)?.pointsEarned || 0,
      paymentMethod: paymentMethod || 'qris',
      paymentStatus: 'paid',
      items: items || (result.order as any)?.items || [],
      notes: notes || '',
      createdAt: (result.order as any)?.createdAt || new Date().toISOString()
    };

    // 1. Simpan ke Supabase Database jika credentials aktif
    try {
      const dbPkg = await import('@bumi-upi/db' as any);
      if (dbPkg && dbPkg.supabaseService && typeof dbPkg.isMockMode === 'function' && !dbPkg.isMockMode()) {
        await dbPkg.supabaseService.createOrderAtomic({
          idempotencyKey: key,
          customerId,
          orderType,
          tableNumber,
          items,
          customerVoucherId,
          paymentMethod: paymentMethod || 'qris',
          notes,
        });
      }
    } catch {}

    // 2. Simpan ke data layer bersama (@bumi-upi/db)
    try {
      const dbPkg = await import('@bumi-upi/db' as any);
      if (dbPkg && typeof dbPkg.saveSharedOrder === 'function') {
        dbPkg.saveSharedOrder(createdOrder);
      }
    } catch {}

    // 3. Notifikasi langsung ke Admin POS / Dapur KDS (prioritaskan URL Vercel Live jika ada)
    const candidateAdminUrls = [
      process.env.ADMIN_URL,
      process.env.NEXT_PUBLIC_ADMIN_URL,
      'https://bumi-upi-admin.vercel.app',
      'http://127.0.0.1:3001'
    ].filter(Boolean) as string[];

    for (const aUrl of candidateAdminUrls) {
      try {
        fetch(`${aUrl}/api/pos/transaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createdOrder),
        }).catch(() => {});
      } catch {}
    }

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
      // 1. Cek Supabase Database terlebih dahulu jika kredensial aktif
      try {
        const dbPkg = await import('@bumi-upi/db' as any);
        if (dbPkg && dbPkg.getSupabaseClient && typeof dbPkg.isMockMode === 'function' && !dbPkg.isMockMode()) {
          const client = dbPkg.getSupabaseClient();
          if (client) {
            const isUUID = id.includes('-');
            const query = client.from('orders').select('*, order_items(*)');
            const { data } = isUUID ? await query.eq('id', id).maybeSingle() : await query.eq('order_number', id).maybeSingle();
            if (data) {
              const mapped = {
                id: data.id,
                orderNumber: data.order_number,
                status: data.status,
                orderType: data.order_type,
                tableNumber: data.table_number,
                subtotal: data.subtotal,
                discountAmount: data.discount_amount,
                finalAmount: data.final_amount,
                pointsEarned: data.points_earned,
                paymentMethod: data.payment_method,
                paymentStatus: data.payment_status,
                items: (data.order_items || []).map((it: any) => ({
                  productId: it.menu_item_id,
                  itemName: it.item_name,
                  unitPrice: it.unit_price,
                  quantity: it.quantity,
                  subtotal: it.subtotal
                })),
                createdAt: data.created_at
              };
              return NextResponse.json({ success: true, order: mapped });
            }
          }
        }
      } catch {}

      // 2. Tarik langsung dari server Admin KDS/POS (baik di Vercel maupun lokal)
      const candidateAdminUrls = [
        process.env.ADMIN_URL,
        process.env.NEXT_PUBLIC_ADMIN_URL,
        'https://bumi-upi-admin.vercel.app',
        'http://127.0.0.1:3001'
      ].filter(Boolean) as string[];

      for (const aUrl of candidateAdminUrls) {
        try {
          const controller = new AbortController();
          const toId = setTimeout(() => controller.abort(), 1500);
          const res = await fetch(`${aUrl}/api/pos/transaction`, {
            signal: controller.signal,
            cache: 'no-store'
          });
          clearTimeout(toId);
          if (res.ok) {
            const d = await res.json();
            if (d.success && Array.isArray(d.orders)) {
              const matched = d.orders.find((o: any) => o.id === id || o.orderNumber === id || o.idempotencyKey === id);
              if (matched) {
                return NextResponse.json({ success: true, order: matched });
              }
            }
          }
        } catch {}
      }

      // 3. Cek shared live store lokal (@bumi-upi/db)
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

      // 4. Cek local orderEngine
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

    const phone = url.searchParams.get('phone');
    const localOrders = orderEngine.getCustomerOrders(customerId || undefined);
    const mergedMap = new Map();

    const normPhone = (p?: string) => (p || '').replace(/\D/g, '').replace(/^0/, '62');
    const targetPhone = normPhone(phone || '');
    const targetCustId = (customerId || '').trim();

    for (const o of [...sharedOrders, ...localOrders]) {
      // If customerId is 'all', return all
      if (targetCustId === 'all') {
        mergedMap.set(o.id, o);
        continue;
      }

      // If specific customer filter is requested
      if (targetCustId || targetPhone) {
        const matchId = targetCustId && o.customerId && String(o.customerId).trim() === targetCustId;
        const ordPhone = normPhone(o.customerPhone);
        const matchPhone = targetPhone && ordPhone && targetPhone === ordPhone;

        if (matchId || matchPhone) {
          mergedMap.set(o.id, o);
        }
      } else {
        // If no filter requested, return all (fallback)
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

    // 1. Update di Supabase jika credentials aktif
    try {
      const dbPkg = await import('@bumi-upi/db' as any);
      if (dbPkg && dbPkg.supabaseService && typeof dbPkg.isMockMode === 'function' && !dbPkg.isMockMode()) {
        await dbPkg.supabaseService.updateOrderStatus(id, status);
      }
    } catch {}

    // 2. Kirim update ke server Admin POS / KDS
    const candidateAdminUrls = [
      process.env.ADMIN_URL,
      process.env.NEXT_PUBLIC_ADMIN_URL,
      'https://bumi-upi-admin.vercel.app',
      'http://127.0.0.1:3001'
    ].filter(Boolean) as string[];

    for (const aUrl of candidateAdminUrls) {
      try {
        fetch(`${aUrl}/api/pos/transaction`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: id, status }),
        }).catch(() => {});
      } catch {}
    }

    // 3. Update in shared live store
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const dbPkg = await import('@bumi-upi/db' as any);
      if (dbPkg && typeof dbPkg.updateSharedOrderStatus === 'function') {
        dbPkg.updateSharedOrderStatus(id, status);
      }
    } catch {
      // fallback
    }

    // 4. Update in local order engine
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
