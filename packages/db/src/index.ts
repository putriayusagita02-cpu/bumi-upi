/**
 * BUMI UPI CRM & ORDERING MONOREPO
 * Unified Data Layer & Database Package Entry Point
 * Location: packages/db/src/index.ts
 */

export const DB_MODULE_NAME = '@bumi-upi/db';

// 1. Domain Types
export * from './types';

// 2. Authoritative 105 Items & 16 Categories Catalog Seed
export {
  CATALOG_CATEGORIES,
  MENU_CATEGORIES,
  CATALOG_105_ITEMS
} from './seedCatalog105';

// 3. Supabase Client & Dual-Mode Detection
export {
  isMockMode,
  getSupabaseClient,
  supabase
} from './supabaseClient';

export {
  supabaseService,
  type SuratRinduInput,
  type DiningTableRecord
} from './supabaseService';

// 4. RFM Engine & Segmentation
export {
  RFM_SEGMENT_MAP,
  RFM_INDO_TO_ENG_MAP,
  classifyRfmSegment,
  computeRScore,
  computeFScore,
  computeMScore,
  computeCustomerRfm,
  computeAllRfmScores,
  generateRfmSummary
} from './rfmEngine';

// 5. In-Memory Mock Store & Repository Functions (Zero-Credential Dual Mode)
export {
  MockStore,
  mockStore,
  generate200Customers,
  generate2140Transactions,
  INITIAL_VOUCHERS,
  getMenuCatalog,
  getMenuItem,
  createOrderAtomic,
  getCustomerProfile,
  sendOtp,
  verifyOtp,
  getRfmSegments,
  getTransactions,
  updateStock
} from './mockStore';

// 6. Cross-App Live Order, Customer & Real-Time Inventory Sync Bridge (Web <-> Admin POS, Kitchen & CRM)
export {
  getSharedOrders,
  saveSharedOrder,
  updateSharedOrderStatus,
  getSharedCustomers,
  saveSharedCustomer,
  getSharedInventory,
  saveSharedInventory,
  updateSharedInventoryItem,
  deductSharedStock,
  bulkRestockSharedInventory,
  getSharedInventoryMetrics
} from './liveSync';
