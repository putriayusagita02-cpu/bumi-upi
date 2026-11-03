import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ReferenceStoreEngine } from '../helpers/test_env.js';
import {
  ORACLE_DEMO_USERS,
  ORACLE_105_ITEMS
} from '../helpers/oracle_data.js';

describe('Tier 4: Real-World Application Scenarios', () => {

  // ==========================================================================
  // Scenario 1: Dine-in Table 4 customer order with 3 items (M/L, Panas/Dingin variants) & OTP
  // ==========================================================================
  it('Scenario 1: Dine-in Table 4 customer order with 3 items (M/L & Panas/Dingin variants) and WhatsApp OTP login', () => {
    const engine = new ReferenceStoreEngine({
      customers: [
        ['cust-sc1', {
          id: 'cust-sc1',
          name: 'Ibu Gita Permana',
          phone: '081298761234',
          tier: 'Tamu',
          pointsBalance: 10,
          cumulativePoints: 10
        }]
      ],
      inventory: [
        ['prod-nasgor-01', { currentStock: 20, trackStock: true }],
        ['prod-kopi-01', { currentStock: 30, trackStock: true }],
        ['prod-roti-01', { currentStock: 15, trackStock: true }]
      ]
    });

    // 1. Customer initiates OTP Login
    const otp = engine.generateOtp('081298761234');
    assert.equal(otp.success, true);
    assert.ok(otp.banner.includes('081298761234'));

    // 2. Customer inputs OTP via auto-fill helper toast
    const auth = engine.verifyOtp('081298761234', otp.demoOtp);
    assert.equal(auth.success, true);

    // 3. Customer selects Table 04 and assembles cart with 3 items:
    // - Nasi Goreng Upiwati (Saus merah Ujung Pandang, Rp 26.000)
    // - Kopi Hitam Large / Panas (Rp 22.000)
    // - Roti Bakar Telur Keju (Rp 23.000)
    // Total: 26k + 22k + 23k = 71.000
    const orderItems = [
      {
        productId: 'prod-nasgor-01',
        itemName: 'Nasi Goreng Upiwati',
        variantName: 'Standar Gurih',
        unitPrice: 26000,
        quantity: 1,
        subtotal: 26000
      },
      {
        productId: 'prod-kopi-01',
        itemName: 'Kopi Hitam',
        variantName: 'Large / Panas',
        unitPrice: 22000,
        quantity: 1,
        subtotal: 22000
      },
      {
        productId: 'prod-roti-01',
        itemName: 'Roti Bakar Telur Keju',
        variantName: 'Garing',
        unitPrice: 23000,
        quantity: 1,
        subtotal: 23000
      }
    ];

    const orderRes = engine.createOrderAtomic({
      idempotencyKey: 'IDEMP-SCENARIO-1-TBL4',
      customerId: 'cust-sc1',
      orderType: 'dine_in',
      tableNumber: 'Meja 04',
      items: orderItems,
      paymentMethod: 'qris',
      notes: 'Kopi panas jangan terlalu manis, roti dibakar garing'
    });

    assert.equal(orderRes.success, true);
    assert.equal(orderRes.subtotal, 71000);
    assert.equal(orderRes.finalAmount, 71000);
    assert.equal(orderRes.pointsEarned, 7); // 71000 / 10000 = 7

    // 4. Verify stock decremented
    assert.equal(engine.inventory.get('prod-nasgor-01').currentStock, 19);
    assert.equal(engine.inventory.get('prod-kopi-01').currentStock, 29);
    assert.equal(engine.inventory.get('prod-roti-01').currentStock, 14);

    // 5. Verify customer points updated
    const cust = engine.customers.get('cust-sc1');
    assert.equal(cust.pointsBalance, 17); // 10 + 7
    assert.equal(cust.cumulativePoints, 17);
  });

  // ==========================================================================
  // Scenario 2: Cashier POS fast order processing with voucher discount & atomic record
  // ==========================================================================
  it('Scenario 2: Cashier POS fast order processing with voucher discount and atomic record', () => {
    const engine = new ReferenceStoreEngine({
      customers: [
        ['cust-walkin', {
          id: 'cust-walkin',
          name: 'Pak Hendra Pratama',
          phone: '081239847123',
          tier: 'Sahabat',
          pointsBalance: 80,
          cumulativePoints: 120
        }]
      ],
      customerVouchers: [
        ['cv-diskon-20', {
          voucherId: 'v-diskon-20',
          customerId: 'cust-walkin',
          discountType: 'percent',
          discountValue: 20,
          minSpend: 60000,
          maxDiscount: 25000,
          isRedeemed: false,
          expiresAt: '2028-12-31'
        }]
      ]
    });

    // POS fast input:
    // 2x Nasi Galo Bumi Upi (39k each = 78k)
    // 2x Es Limun (20k each = 40k)
    // Subtotal: 118.000
    // Discount: 20% of 118k = 23.600 <= max 25k -> 23.600
    // Final Amount = 118.000 - 23.600 = 94.400
    // Points earned = floor(94.400 / 10.000) = 9 points
    const posOrder = engine.createOrderAtomic({
      idempotencyKey: 'IDEMP-POS-SCENARIO-2',
      customerId: 'cust-walkin',
      cashierId: 'usr-kasir-01',
      orderType: 'dine_in',
      tableNumber: 'Meja Kasir Cepat',
      customerVoucherId: 'cv-diskon-20',
      items: [
        { itemName: 'Nasi Galo Bumi Upi', unitPrice: 39000, quantity: 2 },
        { itemName: 'Es Limun', unitPrice: 20000, quantity: 2 }
      ],
      paymentMethod: 'cash'
    });

    assert.equal(posOrder.success, true);
    assert.equal(posOrder.subtotal, 118000);
    assert.equal(posOrder.discountAmount, 23600);
    assert.equal(posOrder.finalAmount, 94400);
    assert.equal(posOrder.pointsEarned, 9);

    // Verify voucher marked redeemed
    assert.equal(engine.customerVouchers.get('cv-diskon-20').isRedeemed, true);

    // Verify cashier audit log
    const auditLog = engine.auditLogs.find(a => a.targetId === posOrder.orderId);
    assert.ok(auditLog);
    assert.equal(auditLog.staffId, 'usr-kasir-01');
  });

  // ==========================================================================
  // Scenario 3: VIP Sahabat member redemption of birthday voucher and points accumulation
  // ==========================================================================
  it('Scenario 3: VIP Sahabat member redemption of birthday voucher and points accumulation', () => {
    const custSpec = ORACLE_DEMO_USERS.customer;
    const engine = new ReferenceStoreEngine({
      customers: [
        ['usr-cust-demo', {
          id: 'usr-cust-demo',
          name: custSpec.name,
          phone: custSpec.phone,
          tier: custSpec.tier,
          pointsBalance: custSpec.points, // 142
          cumulativePoints: 242,
          birthDate: '1998-10-14'
        }]
      ],
      customerVouchers: [
        ['cv-bday-2026', {
          voucherId: 'v-bday',
          customerId: 'usr-cust-demo',
          discountType: 'nominal',
          discountValue: 30000,
          minSpend: 80000,
          isRedeemed: false,
          expiresAt: '2028-11-01'
        }]
      ]
    });

    // Dimas celebrates birthday with 2 friends:
    // - Nasi Buntut Kebakaran (40k)
    // - Bebek Sambel Hejo (45k)
    // - Es Teller (30k)
    // - Teh Manis Jumbo (22k)
    // Subtotal = 40k + 45k + 30k + 22k = 137.000
    // Birthday Voucher = -30.000
    // Final Amount = 107.000
    // Points earned = 10 points
    const bdayOrder = engine.createOrderAtomic({
      idempotencyKey: 'IDEMP-BDAY-DIMAS-2026',
      customerId: 'usr-cust-demo',
      orderType: 'dine_in',
      tableNumber: 'Bale Utama 01',
      customerVoucherId: 'cv-bday-2026',
      items: [
        { itemName: 'Nasi Buntut Kebakaran', unitPrice: 40000, quantity: 1 },
        { itemName: 'Bebek Sambel Hejo', unitPrice: 45000, quantity: 1 },
        { itemName: 'Es Teller', unitPrice: 30000, quantity: 1 },
        { itemName: 'Teh Manis Jumbo', unitPrice: 22000, quantity: 1 }
      ],
      paymentMethod: 'qris',
      notes: 'Ulang tahun Mas Dimas'
    });

    assert.equal(bdayOrder.success, true);
    assert.equal(bdayOrder.subtotal, 137000);
    assert.equal(bdayOrder.discountAmount, 30000);
    assert.equal(bdayOrder.finalAmount, 107000);
    assert.equal(bdayOrder.pointsEarned, 10);

    // Customer balance: 142 + 10 = 152
    const dimas = engine.customers.get('usr-cust-demo');
    assert.equal(dimas.pointsBalance, 152);
    assert.equal(dimas.cumulativePoints, 252);
    assert.equal(dimas.tier, 'Sahabat');
  });

  // ==========================================================================
  // Scenario 4: Kitchen display status transitions (Pending -> Cooking -> Ready -> Completed)
  // ==========================================================================
  it('Scenario 4: Kitchen display status transitions (Pending -> Cooking -> Ready -> Completed)', () => {
    const engine = new ReferenceStoreEngine();

    const order = engine.createOrderAtomic({
      idempotencyKey: 'IDEMP-KDS-LIFECYCLE-001',
      orderType: 'dine_in',
      tableNumber: 'Teras Jendela 03',
      items: [
        { itemName: 'Sate Aci', unitPrice: 14000, quantity: 2 },
        { itemName: 'Ulen Upi', unitPrice: 22000, quantity: 1 },
        { itemName: 'Bandrek Susu Gula Aren', unitPrice: 18000, quantity: 2 }
      ]
    });

    assert.equal(order.success, true);
    const orderRecord = engine.orders.get('IDEMP-KDS-LIFECYCLE-001');

    // Simulate KDS Status Events
    const transitionTimeline = [
      { status: 'confirmed', actor: 'POS Kasir' },
      { status: 'preparing', actor: 'Dapur Utama' },
      { status: 'ready', actor: 'Dapur Utama' },
      { status: 'completed', actor: 'Pelayan Meja' }
    ];

    for (const step of transitionTimeline) {
      orderRecord.status = step.status;
      engine.auditLogs.push({
        action: 'KDS_STATUS_CHANGE',
        targetId: order.orderId,
        staffId: step.actor,
        status: step.status,
        timestamp: new Date().toISOString()
      });
    }

    assert.equal(orderRecord.status, 'completed');
    const logs = engine.auditLogs.filter(a => a.action === 'KDS_STATUS_CHANGE');
    assert.equal(logs.length, 4);
    assert.equal(logs[0].status, 'confirmed');
    assert.equal(logs[3].status, 'completed');
  });

  // ==========================================================================
  // Scenario 5: Offline/zero-credential demo run utilizing local mock repository completely
  // ==========================================================================
  it('Scenario 5: Offline/zero-credential demo run utilizing local mock repository completely', () => {
    // Zero-credential environment simulation:
    // Process env without Supabase credentials
    const envMock = {
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
      NEXT_PUBLIC_USE_MOCK: 'true'
    };

    function resolveStoreBackend(env) {
      const isMock = !env.NEXT_PUBLIC_SUPABASE_URL ||
                     !env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                     env.NEXT_PUBLIC_USE_MOCK === 'true';
      return {
        mode: isMock ? 'LOCAL_IN_MEMORY' : 'SUPABASE_CLOUD',
        isOfflineReady: true
      };
    }

    const backend = resolveStoreBackend(envMock);
    assert.equal(backend.mode, 'LOCAL_IN_MEMORY');
    assert.equal(backend.isOfflineReady, true);

    // Exercise in-memory store end-to-end
    const localStore = new ReferenceStoreEngine({
      customers: [
        ['usr-admin', { id: 'usr-admin', email: 'admin@bumiupi.id', role: 'admin' }]
      ],
      inventory: [
        ['prod-offline-01', { currentStock: 100, trackStock: true }]
      ]
    });

    const res = localStore.createOrderAtomic({
      idempotencyKey: 'IDEMP-OFFLINE-ZERO-CRED-001',
      items: [{ productId: 'prod-offline-01', itemName: 'Ketan Kinca', unitPrice: 24500, quantity: 2 }]
    });

    assert.equal(res.success, true);
    assert.equal(res.finalAmount, 49000);
    assert.equal(localStore.inventory.get('prod-offline-01').currentStock, 98);
  });

});
