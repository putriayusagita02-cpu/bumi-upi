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
