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

export async function GET() {
  try {
    let items: any[] = [];
    try {
      const dbPkg = await import('@bumi-upi/db' as any);
      if (dbPkg && typeof dbPkg.getSharedInventory === 'function') {
        items = dbPkg.getSharedInventory();
      }
    } catch {}

    // Fallback to adminStore if db package not hydrated
    if (!items || items.length === 0) {
      items = adminStore.items || [];
    } else {
      // Sync into adminStore
      adminStore.items = items;
    }

    let tersedia = 0;
    let terbatas = 0;
    let habis = 0;

    for (const item of items) {
      const s = item.stock || 0;
      if (s <= 0) habis++;
      else if (s <= 10) terbatas++;
      else tersedia++;
    }

    return NextResponse.json(
      {
        success: true,
        items,
        stats: {
          total: items.length,
          tersedia,
          terbatas,
          habis,
        },
        timestamp: new Date().toISOString()
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal memuat inventaris stok' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, itemId, newStock, delta, category, resetToFifty, staffId, staffName } = body;

    const resolvedStaffId = staffId || 'usr-admin-01';
    const resolvedStaffName = staffName || 'Owner';

    const dbPkg = await import('@bumi-upi/db' as any);

    // 1. Update single item stock directly
    if (action === 'update_stock' || action === 'set_stock') {
      const targetId = Number(itemId);
      const val = Number(newStock);
      let updatedItem = null;

      if (dbPkg && typeof dbPkg.updateSharedInventoryItem === 'function') {
        updatedItem = dbPkg.updateSharedInventoryItem(targetId, val, resolvedStaffId, resolvedStaffName);
      }

      adminStore.updateStock(targetId, val, resolvedStaffId, resolvedStaffName);

      return NextResponse.json(
        {
          success: true,
          message: `Stok menu #${targetId} berhasil diperbarui menjadi ${val} unit`,
          item: updatedItem || adminStore.items.find((i) => i.id === targetId),
          items: dbPkg?.getSharedInventory ? dbPkg.getSharedInventory() : adminStore.items
        },
        { headers: corsHeaders }
      );
    }

    // 2. Mark item out-of-stock (Quick 86)
    if (action === 'mark_out_of_stock' || action === 'habiskan') {
      const targetId = Number(itemId);
      let updatedItem = null;

      if (dbPkg && typeof dbPkg.updateSharedInventoryItem === 'function') {
        updatedItem = dbPkg.updateSharedInventoryItem(targetId, 0, resolvedStaffId, resolvedStaffName);
      }

      adminStore.updateStock(targetId, 0, resolvedStaffId, resolvedStaffName);

      return NextResponse.json(
        {
          success: true,
          message: `Menu #${targetId} berhasil ditandai HABIS (0 unit)`,
          item: updatedItem,
          items: dbPkg?.getSharedInventory ? dbPkg.getSharedInventory() : adminStore.items
        },
        { headers: corsHeaders }
      );
    }

    // 3. Quick Delta (+ / -)
    if (action === 'quick_delta') {
      const targetId = Number(itemId);
      const current = adminStore.items.find((i) => i.id === targetId)?.stock || 0;
      const nextVal = Math.max(0, current + Number(delta || 0));

      let updatedItem = null;
      if (dbPkg && typeof dbPkg.updateSharedInventoryItem === 'function') {
        updatedItem = dbPkg.updateSharedInventoryItem(targetId, nextVal, resolvedStaffId, resolvedStaffName);
      }
      adminStore.updateStock(targetId, nextVal, resolvedStaffId, resolvedStaffName);

      return NextResponse.json(
        {
          success: true,
          message: `Stok menu #${targetId} disesuaikan: ${nextVal} unit`,
          item: updatedItem,
          items: dbPkg?.getSharedInventory ? dbPkg.getSharedInventory() : adminStore.items
        },
        { headers: corsHeaders }
      );
    }

    // 4. Bulk Restock (Reset all to 50, Restock category, or Restock out-of-stock items)
    if (action === 'bulk_restock') {
      let items: any[] = [];
      if (dbPkg && typeof dbPkg.bulkRestockSharedInventory === 'function') {
        items = dbPkg.bulkRestockSharedInventory({
          resetToFifty: Boolean(resetToFifty),
          category,
          delta: delta ? Number(delta) : undefined
        });
      }

      // Sync into adminStore
      if (items.length > 0) {
        adminStore.items = items;
        adminStore.saveToStorage();
      }

      return NextResponse.json(
        {
          success: true,
          message: resetToFifty
            ? 'Seluruh 105 menu berhasil dipulihkan ke 50 unit!'
            : `Restock massal kategori "${category || 'Semua'}" berhasil diterapkan!`,
          items: adminStore.items
        },
        { headers: corsHeaders }
      );
    }

    // 5. Simulate Table Sale (Decrements stock live for testing)
    if (action === 'simulate_sale') {
      const targetId = Number(itemId || 1);
      const qty = Number(body.quantity || 2);
      if (dbPkg && typeof dbPkg.deductSharedStock === 'function') {
        dbPkg.deductSharedStock([{ productId: targetId, quantity: qty }]);
      }

      const item = adminStore.items.find((i) => i.id === targetId);
      if (item) {
        const cur = item.stock || 0;
        adminStore.updateStock(targetId, Math.max(0, cur - qty), 'sys-pos-live', 'Simulasi Meja');
      }

      return NextResponse.json(
        {
          success: true,
          message: `Simulasi penjualan meja berhasil: -${qty} unit dari menu #${targetId}`,
          items: dbPkg?.getSharedInventory ? dbPkg.getSharedInventory() : adminStore.items
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Aksi inventaris tidak dikenali' },
      { status: 400, headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
