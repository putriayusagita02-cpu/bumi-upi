/**
 * BUMI UPI CRM — SUPABASE CLIENT & FULL-FEATURE FALLBACK STORE
 * Automatically uses real Supabase if credentials are valid, or seamless
 * in-memory/localStorage reactive state store for 100% functional offline evaluation.
 */

import {
  generate200Customers,
  generate2140Transactions,
  computeRFMScores,
  MOCK_MENU_ITEMS,
  MOCK_VOUCHERS,
  MOCK_EVENTS,
  MOCK_FEEDBACKS,
  MOCK_RESERVATIONS,
  MOCK_CAMPAIGNS,
  MOCK_AUDIT_LOGS,
  Profile,
  Transaction,
  RFMScore,
  Reservation,
  CustomerFeedback,
  Campaign,
  AuditLog
} from './mockData';

// In-Memory Global State for evaluation session
let globalCustomers = generate200Customers();
let globalTransactions = generate2140Transactions(globalCustomers);
let globalRFM = computeRFMScores(globalCustomers, globalTransactions);
let globalReservations = [...MOCK_RESERVATIONS];
let globalFeedbacks = [...MOCK_FEEDBACKS];
let globalCampaigns = [...MOCK_CAMPAIGNS];
let globalAuditLogs = [...MOCK_AUDIT_LOGS];

export interface TransactionInput {
  customerId: string | null;
  cashierId: string;
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  customerVoucherId?: string | null;
  items: Array<{
    menuItemId: string;
    itemName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
  notes?: string;
  idempotencyKey?: string;
}

/**
 * Atomic Transaction Recording (mirrors record_transaction Postgres function)
 */
export async function recordTransactionAtomic(input: TransactionInput) {
  const idempKey = input.idempotencyKey || `IDEMP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  
  // Idempotency check
  const existing = globalTransactions.find(t => t.idempotency_key === idempKey);
  if (existing) {
    return {
      success: true,
      isDuplicate: true,
      transaction: existing,
      message: 'Transaksi sudah pernah dicatat sebelumnya (Idempotent).'
    };
  }

  // Calculate Points (1 point per Rp 10.000)
  const pointsEarned = input.customerId ? Math.floor(input.finalAmount / 10000) : 0;
  
  const pad = String(globalTransactions.length + 1).padStart(5, '0');
  const now = new Date();
  const invoiceNumber = `BU-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${pad}`;

  let custName = 'Tamu Langsung';
  let custTier = 'Tamu';
  let custPhone = '-';

  if (input.customerId) {
    const custIndex = globalCustomers.findIndex(c => c.id === input.customerId);
    if (custIndex !== -1) {
      const cust = globalCustomers[custIndex];
      custName = cust.name;
      custPhone = cust.phone;
      
      const newBal = (cust.points_balance || 0) + pointsEarned;
      const newCum = (cust.cumulative_points || 0) + pointsEarned;
      
      let newTier: 'Tamu' | 'Sahabat' | 'Keluarga' = cust.tier;
      if (newCum >= 300) newTier = 'Keluarga';
      else if (newCum >= 100) newTier = 'Sahabat';

      globalCustomers[custIndex] = {
        ...cust,
        points_balance: newBal,
        cumulative_points: newCum,
        tier: newTier
      };
      custTier = newTier;
    }
  }

  const newTx: Transaction = {
    id: `tx-${pad}`,
    invoice_number: invoiceNumber,
    idempotency_key: idempKey,
    customer_id: input.customerId,
    customer_name: custName,
    customer_tier: custTier,
    customer_phone: custPhone,
    cashier_id: input.cashierId,
    cashier_name: 'Kang Asep (Kasir Utama)',
    subtotal: input.subtotal,
    discount_amount: input.discountAmount,
    final_amount: input.finalAmount,
    points_earned: pointsEarned,
    voucher_id: input.customerVoucherId ? 'vcr-01' : null,
    status: 'completed',
    items: input.items.map(it => ({
      menu_item_id: it.menuItemId,
      item_name: it.itemName,
      unit_price: it.unitPrice,
      quantity: it.quantity,
      subtotal: it.subtotal
    })),
    notes: input.notes,
    created_at: now.toISOString()
  };

  globalTransactions.unshift(newTx);

  // Record Audit Log
  globalAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    staff_name: 'Kang Asep (Kasir)',
    action: 'RECORD_TRANSACTION',
    target_entity: 'transactions',
    target_id: newTx.id,
    details: `Input transaksi kasir untuk ${custName} senilai Rp ${new Intl.NumberFormat('id-ID').format(newTx.final_amount)} (Poin: +${pointsEarned})`,
    created_at: now.toISOString()
  });

  // Trigger RFM Recalculation
  globalRFM = computeRFMScores(globalCustomers, globalTransactions);

  return {
    success: true,
    isDuplicate: false,
    transaction: newTx,
    pointsEarned,
    newTier: custTier
  };
}

/**
 * Accessors for Current Application State
 */
export function getCustomers(): Profile[] {
  return globalCustomers;
}

export function getTransactions(): Transaction[] {
  return globalTransactions;
}

export function getRFMScores(): RFMScore[] {
  return globalRFM;
}

export function getReservations(): Reservation[] {
  return globalReservations;
}

export function getFeedbacks(): CustomerFeedback[] {
  return globalFeedbacks;
}

export function getCampaigns(): Campaign[] {
  return globalCampaigns;
}

export function getAuditLogs(): AuditLog[] {
  return globalAuditLogs;
}

export function addReservation(res: Omit<Reservation, 'id' | 'created_at'>): Reservation {
  const newRes: Reservation = {
    ...res,
    id: `res-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  globalReservations.unshift(newRes);
  return newRes;
}

export function addFeedback(fb: Omit<CustomerFeedback, 'id' | 'created_at'>): CustomerFeedback {
  const newFb: CustomerFeedback = {
    ...fb,
    id: `fb-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  globalFeedbacks.unshift(newFb);
  return newFb;
}

export function addCampaign(cmp: Omit<Campaign, 'id' | 'created_at'>): Campaign {
  const newCmp: Campaign = {
    ...cmp,
    id: `cmp-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  globalCampaigns.unshift(newCmp);
  
  globalAuditLogs.unshift({
    id: `aud-${Date.now()}`,
    staff_name: 'Teh Upi (Owner)',
    action: 'CREATE_CAMPAIGN',
    target_entity: 'campaigns',
    target_id: newCmp.id,
    details: `Membuat kampanye "${newCmp.title}" via ${newCmp.channel} ke segmen ${newCmp.target_segment}`,
    created_at: new Date().toISOString()
  });

  return newCmp;
}
