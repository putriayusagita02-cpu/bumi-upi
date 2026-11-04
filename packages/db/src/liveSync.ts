import { Order, OrderStatus } from './types';
import { CATALOG_105_ITEMS } from './seedCatalog105';

// In-memory fallback across reloads in the same process
const globalAny = globalThis as any;
if (!globalAny.__BUMI_LIVE_ORDERS__) {
  globalAny.__BUMI_LIVE_ORDERS__ = new Map<string, Order>();
}
const memStore: Map<string, Order> = globalAny.__BUMI_LIVE_ORDERS__;

if (!globalAny.__BUMI_LIVE_CUSTOMERS__) {
  globalAny.__BUMI_LIVE_CUSTOMERS__ = new Map<string, any>();
}
const customerMemStore: Map<string, any> = globalAny.__BUMI_LIVE_CUSTOMERS__;

// Live Inventory Store (105 items across 16 categories)
if (!globalAny.__BUMI_LIVE_INVENTORY__) {
  const invMap = new Map<string | number, any>();
  for (const it of CATALOG_105_ITEMS) {
    invMap.set(it.id, {
      ...it,
      stock: (it as any).stock !== undefined ? (it as any).stock : 45,
      isAvailable: ((it as any).stock !== undefined ? (it as any).stock : 45) > 0,
      updatedAt: new Date().toISOString()
    });
  }
  globalAny.__BUMI_LIVE_INVENTORY__ = invMap;
}
const inventoryMemStore: Map<string | number, any> = globalAny.__BUMI_LIVE_INVENTORY__;

function getSharedInventoryFilePath(): string | null {
  if (typeof window !== 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const os = require('os');

    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      return path.resolve(os.tmpdir(), 'bumi_upi_live_inventory.json');
    }

    let current = process.cwd();
    for (let i = 0; i < 5; i++) {
      const hasWorkspace = fs.existsSync(path.resolve(current, 'pnpm-workspace.yaml'));
      const hasPkgDb = fs.existsSync(path.resolve(current, 'packages', 'db'));
      const hasDataDir = fs.existsSync(path.resolve(current, '.data'));

      if (hasWorkspace || hasPkgDb || hasDataDir) {
        const rootData = path.resolve(current, '.data');
        if (!fs.existsSync(rootData)) {
          try { fs.mkdirSync(rootData, { recursive: true }); } catch {}
        }
        return path.resolve(rootData, 'live_inventory.json');
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }

    return path.resolve(os.tmpdir(), 'bumi_upi_live_inventory.json');
  } catch {
    return null;
  }
}

function getTmpInventoryMirrorPath(): string | null {
  if (typeof window !== 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const os = require('os');
    return path.resolve(os.tmpdir(), 'bumi_upi_live_inventory.json');
  } catch {
    return null;
  }
}

/**
 * Retrieve all 105 shared inventory items with live stock counts
 */
export function getSharedInventory(): any[] {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      const candidatePaths = [getSharedInventoryFilePath(), getTmpInventoryMirrorPath()].filter(Boolean) as string[];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          try {
            const raw = fs.readFileSync(p, 'utf-8');
            const list = JSON.parse(raw);
            if (Array.isArray(list) && list.length > 0) {
              for (const item of list) {
                if (item.id) {
                  inventoryMemStore.set(item.id, {
                    ...inventoryMemStore.get(item.id),
                    ...item
                  });
                }
              }
            }
          } catch {}
        }
      }
    } catch {}
  }
  return Array.from(inventoryMemStore.values()).sort((a, b) => a.id - b.id);
}

/**
 * Persist the entire inventory map to disk / temp mirror
 */
export function saveSharedInventory(items: any[]): void {
  for (const it of items) {
    if (it.id) inventoryMemStore.set(it.id, it);
  }

  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require('path');

      const all = getSharedInventory();
      const serialized = JSON.stringify(all, null, 2);
      const targetPaths = [getSharedInventoryFilePath(), getTmpInventoryMirrorPath()].filter(Boolean) as string[];

      for (const target of targetPaths) {
        try {
          const dir = path.dirname(target);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(target, serialized, 'utf-8');
        } catch {}
      }
    } catch {}
  }
}

/**
 * Update stock count for an individual item with real-time persistence
 */
export function updateSharedInventoryItem(
  itemId: number,
  newStock: number,
  staffId = 'usr-admin-01',
  staffName = 'Owner'
): any {
  getSharedInventory(); // ensure hydrated
  const item = inventoryMemStore.get(itemId);
  if (!item) return null;

  const oldStock = item.stock || 0;
  const clamped = Math.max(0, newStock);
  item.stock = clamped;
  item.isAvailable = clamped > 0;
  item.updatedAt = new Date().toISOString();
  item.lastModifiedBy = `${staffName} (${staffId})`;

  inventoryMemStore.set(itemId, item);
  saveSharedInventory([item]);

  return { ...item, oldStock };
}

/**
 * Atomic stock deduction for ordered items in real time
 */
export function deductSharedStock(orderedItems: any[]): boolean {
  if (!Array.isArray(orderedItems) || orderedItems.length === 0) return false;
  getSharedInventory(); // ensure hydrated

  const updated: any[] = [];
  for (const ordItem of orderedItems) {
    const rawId = ordItem.productId || ordItem.id || ordItem.itemId;
    const qty = ordItem.quantity || ordItem.qty || 1;
    if (!rawId) continue;

    const itemId = Number(rawId);
    let target = inventoryMemStore.get(itemId);
    if (!target) {
      // Try finding by name if id didn't match numeric
      const byName = Array.from(inventoryMemStore.values()).find(
        (i) => i.name.toLowerCase() === (ordItem.name || ordItem.itemName || '').toLowerCase()
      );
      if (byName) target = byName;
    }

    if (target) {
      const cur = target.stock !== undefined ? target.stock : 45;
      const nextStock = Math.max(0, cur - qty);
      target.stock = nextStock;
      target.isAvailable = nextStock > 0;
      target.updatedAt = new Date().toISOString();
      inventoryMemStore.set(target.id, target);
      updated.push(target);
    }
  }

  if (updated.length > 0) {
    saveSharedInventory(updated);
    return true;
  }
  return false;
}

/**
 * Bulk restock helper (e.g. Restock category, Reset all to 50, or Restock out-of-stock)
 */
export function bulkRestockSharedInventory(options: {
  resetToFifty?: boolean;
  category?: string;
  delta?: number;
  itemIds?: number[];
}): any[] {
  getSharedInventory();
  const all = Array.from(inventoryMemStore.values());
  const updated: any[] = [];

  for (const it of all) {
    let shouldUpdate = false;
    let nextStock = it.stock ?? 45;

    if (options.resetToFifty) {
      nextStock = 50;
      shouldUpdate = true;
    } else if (options.category && it.category === options.category) {
      nextStock = Math.max(0, (it.stock ?? 0) + (options.delta || 20));
      shouldUpdate = true;
    } else if (options.itemIds && options.itemIds.includes(it.id)) {
      nextStock = Math.max(0, (it.stock ?? 0) + (options.delta || 25));
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      it.stock = nextStock;
      it.isAvailable = nextStock > 0;
      it.updatedAt = new Date().toISOString();
      inventoryMemStore.set(it.id, it);
      updated.push(it);
    }
  }

  if (updated.length > 0) {
    saveSharedInventory(updated);
  }
  return getSharedInventory();
}

function getSharedCustomerFilePath(): string | null {
  if (typeof window !== 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const os = require('os');

    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      return path.resolve(os.tmpdir(), 'bumi_upi_live_customers.json');
    }

    let current = process.cwd();
    for (let i = 0; i < 5; i++) {
      const hasWorkspace = fs.existsSync(path.resolve(current, 'pnpm-workspace.yaml'));
      const hasPkgDb = fs.existsSync(path.resolve(current, 'packages', 'db'));
      const hasDataDir = fs.existsSync(path.resolve(current, '.data'));

      if (hasWorkspace || hasPkgDb || hasDataDir) {
        const rootData = path.resolve(current, '.data');
        if (!fs.existsSync(rootData)) {
          try { fs.mkdirSync(rootData, { recursive: true }); } catch {}
        }
        return path.resolve(rootData, 'live_customers.json');
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }

    return path.resolve(os.tmpdir(), 'bumi_upi_live_customers.json');
  } catch {
    return null;
  }
}

function getTmpCustomerMirrorPath(): string | null {
  if (typeof window !== 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const os = require('os');
    return path.resolve(os.tmpdir(), 'bumi_upi_live_customers.json');
  } catch {
    return null;
  }
}

/**
 * Retrieve all shared live registered customers
 */
export function getSharedCustomers(): any[] {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      const candidatePaths = [getSharedCustomerFilePath(), getTmpCustomerMirrorPath()].filter(Boolean) as string[];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          try {
            const raw = fs.readFileSync(p, 'utf-8');
            const list = JSON.parse(raw);
            if (Array.isArray(list) && list.length > 0) {
              for (const cust of list) {
                const key = cust.id || cust.phone || cust.email;
                if (key) customerMemStore.set(key, cust);
              }
            }
          } catch {}
        }
      }
    } catch {}
  }
  return Array.from(customerMemStore.values());
}

/**
 * Save a newly registered customer to the shared live store
 */
export function saveSharedCustomer(customer: any): void {
  if (!customer) return;
  const key = customer.id || customer.phone || customer.email || `cust-${Date.now()}`;
  customerMemStore.set(key, customer);

  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require('path');

      const existing = getSharedCustomers();
      const map = new Map(existing.map((c) => [c.id || c.phone, c]));
      map.set(customer.id || customer.phone, customer);
      const list = Array.from(map.values());
      const serialized = JSON.stringify(list, null, 2);

      const targetPaths = [getSharedCustomerFilePath(), getTmpCustomerMirrorPath()].filter(Boolean) as string[];

      for (const target of targetPaths) {
        try {
          const dir = path.dirname(target);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(target, serialized, 'utf-8');
        } catch {}
      }
    } catch {}
  }
}

function getSharedFilePath(): string | null {
  if (typeof window !== 'undefined') return null;
  try {
    // Dynamic require to prevent client-side bundler errors
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const os = require('os');

    // 1. If running on Vercel or read-only cloud lambda, use tmpdir
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      return path.resolve(os.tmpdir(), 'bumi_upi_live_orders.json');
    }

    // 2. Locate monorepo root (.data / pnpm-workspace.yaml / packages/db) upward from process.cwd()
    let current = process.cwd();
    for (let i = 0; i < 5; i++) {
      const hasWorkspace = fs.existsSync(path.resolve(current, 'pnpm-workspace.yaml'));
      const hasPkgDb = fs.existsSync(path.resolve(current, 'packages', 'db'));
      const hasDataDir = fs.existsSync(path.resolve(current, '.data'));

      if (hasWorkspace || hasPkgDb || hasDataDir) {
        const rootData = path.resolve(current, '.data');
        if (!fs.existsSync(rootData)) {
          try {
            fs.mkdirSync(rootData, { recursive: true });
          } catch {}
        }
        return path.resolve(rootData, 'live_orders.json');
      }

      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }

    // 3. Fallback to os.tmpdir() shared across all node processes on this host
    return path.resolve(os.tmpdir(), 'bumi_upi_live_orders.json');
  } catch {
    return null;
  }
}

function getTmpMirrorPath(): string | null {
  if (typeof window !== 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const os = require('os');
    return path.resolve(os.tmpdir(), 'bumi_upi_live_orders.json');
  } catch {
    return null;
  }
}

/**
 * Retrieve all shared live orders from file storage or memory
 */
export function getSharedOrders(): Order[] {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      const filePath = getSharedFilePath();
      const tmpPath = getTmpMirrorPath();

      const candidatePaths = [filePath, tmpPath].filter(Boolean) as string[];

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          try {
            const raw = fs.readFileSync(p, 'utf-8');
            const list = JSON.parse(raw);
            if (Array.isArray(list) && list.length > 0) {
              for (const item of list) {
                memStore.set(item.id, item);
              }
            }
          } catch {}
        }
      }
    } catch {
      // Fallback to memory
    }
  }
  return Array.from(memStore.values());
}

/**
 * Save or update an order in the shared storage
 */
export function saveSharedOrder(order: Order): void {
  memStore.set(order.id, order);

  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require('path');

      const existing = getSharedOrders();
      const map = new Map(existing.map((o) => [o.id, o]));
      map.set(order.id, order);
      const list = Array.from(map.values());
      const serialized = JSON.stringify(list, null, 2);

      const targetPaths = [getSharedFilePath(), getTmpMirrorPath()].filter(Boolean) as string[];

      for (const target of targetPaths) {
        try {
          const dir = path.dirname(target);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(target, serialized, 'utf-8');
        } catch {
          // Continue to next path if one fails
        }
      }
    } catch {
      // Fallback silently to in-memory store
    }
  }
}

/**
 * Update the status of an existing shared order
 */
export function updateSharedOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const all = getSharedOrders();
  const target = all.find((o) => o.id === orderId);
  if (!target) return null;

  target.status = status;
  target.updatedAt = new Date().toISOString();
  saveSharedOrder(target);
  return target;
}
