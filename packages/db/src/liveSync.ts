import { Order, OrderStatus } from './types';

// In-memory fallback across reloads in the same process
const globalAny = globalThis as any;
if (!globalAny.__BUMI_LIVE_ORDERS__) {
  globalAny.__BUMI_LIVE_ORDERS__ = new Map<string, Order>();
}
const memStore: Map<string, Order> = globalAny.__BUMI_LIVE_ORDERS__;

function getSharedFilePath(): string | null {
  if (typeof window !== 'undefined') return null;
  try {
    // Dynamic require to prevent client-side bundler errors
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    return path.resolve(process.cwd(), '.data', 'live_orders.json');
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
      if (filePath && fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const item of list) {
            memStore.set(item.id, item);
          }
          return list;
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
      const filePath = getSharedFilePath();
      if (filePath) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const existing = getSharedOrders();
        const map = new Map(existing.map((o) => [o.id, o]));
        map.set(order.id, order);
        const list = Array.from(map.values());
        fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
      }
    } catch {
      // Fallback silently
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
