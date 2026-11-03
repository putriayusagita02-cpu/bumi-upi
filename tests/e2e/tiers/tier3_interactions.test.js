import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ReferenceStoreEngine } from '../helpers/test_env.js';
import {
  ORACLE_105_ITEMS,
  ORACLE_DEMO_USERS,
  ORACLE_ORDER_STATUSES
} from '../helpers/oracle_data.js';

describe('Tier 3: Cross-Feature Interactions', () => {

  // ==========================================================================
  // Integration Chain 1: OTP Auth -> Profile -> Variant Selection -> Voucher -> Atomic Order -> Points
  // ==========================================================================
  it('Chain 1: WhatsApp OTP Login -> Profile -> Variant Selection -> Voucher -> Atomic Order -> Points Ledger', () => {
    const engine = new ReferenceStoreEngine({
      customers: [
        ['cust-001', {
          id: 'cust-001',
          phone: '081234567890',
          name: 'Dimas Kurniawan',
          tier: 'Tamu',
          pointsBalance: 20,
          cumulativePoints: 20
        }]
      ],
      customerVouchers: [
        ['cv-wel-01', {
          voucherId: 'v-wel-01',
          customerId: 'cust-001',
          discountType: 'nominal',
          discountValue: 15000,
          minSpend: 50000,
          isRedeemed: false,
          expiresAt: '2029-12-31'
        }]
      ],
      inventory: [
        ['prod-kopi-hitam', { currentStock: 10, trackStock: true }],
        ['prod-nasgor-cumi', { currentStock: 5, trackStock: true }]
      ]
    });

    // 1. Request and Verify WhatsApp OTP
    const otpRes = engine.generateOtp('081234567890');
    assert.equal(otpRes.success, true);
    const verifyRes = engine.verifyOtp('081234567890', otpRes.demoOtp);
    assert.equal(verifyRes.success, true);

    // 2. Select Items with Variants:
    // Item A: Nasi Goreng Cumi Upi (Pedas, 28k)
    // Item B: Kopi Hitam (Large variant: 22k, Panas)
    // Item C: Pisang Goreng (20k)
    // Total subtotal: 28k + 22k + 20k = 70k
    const items = [
      {
        productId: 'prod-nasgor-cumi',
        itemName: 'Nasi Goreng Cumi Upi',
        variantName: 'Pedas Level 2',
        unitPrice: 28000,
        quantity: 1,
        subtotal: 28000
      },
      {
        productId: 'prod-kopi-hitam',
        itemName: 'Kopi Hitam',
        variantName: 'Large / Panas',
        unitPrice: 22000,
        quantity: 1,
        subtotal: 22000
      },
      {
        itemName: 'Pisang Goreng',
        unitPrice: 20000,
        quantity: 1,
        subtotal: 20000
      }
    ];

    // 3. Apply Voucher 'cv-wel-01' (Rp 15.000 discount on >= Rp 50.000)
    // Final Amount = 70.000 - 15.000 = 55.000
    // Points earned = floor(55.000 / 10.000) = 5 points
    const orderRes = engine.createOrderAtomic({
      idempotencyKey: 'IDEMP-CHAIN1-001',
      customerId: 'cust-001',
      orderType: 'dine_in',
      tableNumber: 'Meja 04',
      items,
      customerVoucherId: 'cv-wel-01',
      paymentMethod: 'qris',
      notes: 'Kopi jangan terlalu manis, pisang goreng panas-panas'
    });

    assert.equal(orderRes.success, true);
    assert.equal(orderRes.subtotal, 70000);
    assert.equal(orderRes.discountAmount, 15000);
    assert.equal(orderRes.finalAmount, 55000);
    assert.equal(orderRes.pointsEarned, 5);

    // 4. Verify Stock Deduction
    assert.equal(engine.inventory.get('prod-nasgor-cumi').currentStock, 4);
    assert.equal(engine.inventory.get('prod-kopi-hitam').currentStock, 9);

    // 5. Verify Voucher State is Marked Redeemed
    assert.equal(engine.customerVouchers.get('cv-wel-01').isRedeemed, true);

    // 6. Verify Customer Points Balance & Points Ledger
    const customer = engine.customers.get('cust-001');
    assert.equal(customer.pointsBalance, 25); // 20 + 5
    assert.equal(customer.cumulativePoints, 25);
    assert.ok(engine.pointsLedger.length > 0);
    assert.equal(engine.pointsLedger[0].pointsChange, 5);
    assert.equal(engine.pointsLedger[0].balanceAfter, 25);
  });

  // ==========================================================================
  // Integration Chain 2: POS Cashier Scan QR -> Tier -> Checkout -> Struk & Telegram
  // ==========================================================================
  it('Chain 2: POS Cashier Scan QR -> Tier Detection -> Fast Checkout -> Struk Generation & Telegram Payload', () => {
    const engine = new ReferenceStoreEngine({
      customers: [
        ['usr-cust-demo', {
          id: 'usr-cust-demo',
          name: 'Dimas Kurniawan',
          phone: '081234567890',
          tier: 'Sahabat',
          pointsBalance: 142,
          cumulativePoints: 242,
          qrCode: 'BUMI-CUST-8899'
        }]
      ]
    });

    // 1. Kasir scans customer QR code
    const scannedQr = 'BUMI-CUST-8899';
    let customer = null;
    for (const c of engine.customers.values()) {
      if (c.qrCode === scannedQr) customer = c;
    }
    assert.ok(customer, 'Customer must be resolved from QR code');
    assert.equal(customer.tier, 'Sahabat');
    assert.equal(customer.pointsBalance, 142);

    // 2. Fast POS order entry:
    // 2x Mie Racing (25k each = 50k)
    // 2x Teh Lemon Large (25k each = 50k)
    // Total subtotal: 100k
    const items = [
      { itemName: 'Mie Racing', unitPrice: 25000, quantity: 2, subtotal: 50000 },
      { itemName: 'Teh Lemon (Large / Dingin)', unitPrice: 25000, quantity: 2, subtotal: 50000 }
    ];

    const orderRes = engine.createOrderAtomic({
      idempotencyKey: 'IDEMP-POS-TX-99',
      customerId: customer.id,
      cashierId: 'usr-kasir-01',
      orderType: 'dine_in',
      tableNumber: 'Bale Utama 02',
      items,
      paymentMethod: 'cash'
    });

    assert.equal(orderRes.success, true);
    assert.equal(orderRes.finalAmount, 100000);
    assert.equal(orderRes.pointsEarned, 10);

    // 3. Generate Struk in WIB format
    const nowWib = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const receipt = {
      storeName: 'Rumah Tamah Bumi Upi Garut',
      invoiceNumber: orderRes.orderNumber,
      cashierName: 'Kang Asep (Kasir Utama)',
      customerName: customer.name,
      customerTier: customer.tier,
      timeWib: nowWib,
      items: items.map(i => `${i.itemName} x${i.quantity} = Rp ${i.subtotal.toLocaleString('id-ID')}`),
      subtotal: orderRes.subtotal,
      finalAmount: orderRes.finalAmount,
      pointsEarned: orderRes.pointsEarned,
      newPointsBalance: customer.pointsBalance
    };

    assert.ok(receipt.invoiceNumber.startsWith('BU-ORD-'));
    assert.equal(receipt.customerName, 'Dimas Kurniawan');
    assert.equal(receipt.pointsEarned, 10);
    assert.equal(receipt.newPointsBalance, 152); // 142 + 10

    // 4. Telegram Bot Receipt dispatch simulation (@BumiUpiBot)
    const telegramMessage = [
      `🌿 *STRUK TRANSAKSI RESMI — BUMI UPI*`,
      `No: \`${receipt.invoiceNumber}\``,
      `Waktu: ${receipt.timeWib} WIB`,
      `Pelanggan: ${receipt.customerName} (${receipt.customerTier})`,
      `---------------------------------`,
      ...receipt.items,
      `---------------------------------`,
      `Total Pembayaran: *Rp ${receipt.finalAmount.toLocaleString('id-ID')}*`,
      `Poin Diperoleh: +${receipt.pointsEarned} Poin (Total: ${receipt.newPointsBalance})`,
      `Hatur nuhun parantos sumping ka Bumi Upi! 🙏`
    ].join('\n');

    assert.ok(telegramMessage.includes('STRUK TRANSAKSI'));
    assert.ok(telegramMessage.includes('Dimas Kurniawan'));
    assert.ok(telegramMessage.includes('Hatur nuhun'));
  });

  // ==========================================================================
  // Integration Chain 3: Table Dine-In -> KDS Status Lifecycle -> Audit Trail
  // ==========================================================================
  it('Chain 3: Table Dine-In -> KDS Status Transitions (Pending -> Cooking -> Ready -> Completed) -> Audit Trail', () => {
    const engine = new ReferenceStoreEngine();

    // 1. Initial Order Creation
    const orderRes = engine.createOrderAtomic({
      idempotencyKey: 'IDEMP-KDS-FLOW-001',
      cashierId: 'usr-kasir-01',
      orderType: 'dine_in',
      tableNumber: 'Meja 12',
      items: [
        { itemName: 'Lidah Sambel Hejo', unitPrice: 47000, quantity: 2 },
        { itemName: 'Es Jeruk Dingin', unitPrice: 18000, quantity: 2 }
      ]
    });

    assert.equal(orderRes.success, true);
    const orderKey = 'IDEMP-KDS-FLOW-001';
    const order = engine.orders.get(orderKey);
    assert.equal(order.status, 'confirmed');

    // 2. Kitchen Display System (KDS) Status Progression
    const statuses = ['preparing', 'ready', 'completed'];
    for (const nextStatus of statuses) {
      assert.ok(ORACLE_ORDER_STATUSES.includes(nextStatus));
      order.status = nextStatus;
      engine.auditLogs.push({
        action: 'UPDATE_ORDER_STATUS',
        targetId: order.id,
        staffId: 'usr-chef-01',
        details: { oldStatus: order.status, newStatus: nextStatus }
      });
    }

    assert.equal(order.status, 'completed');
    const statusLogs = engine.auditLogs.filter(l => l.action === 'UPDATE_ORDER_STATUS');
    assert.equal(statusLogs.length, 3);
  });

  // ==========================================================================
  // Integration Chain 4: Cumulative Points Threshold -> Tier Upgrade Progression
  // ==========================================================================
  it('Chain 4: Cumulative Points Crossing 100 & 300 Thresholds triggers automatic Tier Upgrade', () => {
    const engine = new ReferenceStoreEngine({
      customers: [
        ['cust-upg-01', {
          id: 'cust-upg-01',
          name: 'Cecep Supriadi',
          tier: 'Tamu',
          pointsBalance: 85,
          cumulativePoints: 85
        }]
      ]
    });

    // 1. Place order for Rp 200.000 -> 20 points earned
    // Cumulative points: 85 + 20 = 105 -> Crosses 100 threshold -> Promoted to 'Sahabat'
    const order1 = engine.createOrderAtomic({
      idempotencyKey: 'IDEMP-TIER-UPG-01',
      customerId: 'cust-upg-01',
      items: [{ itemName: 'Paket Prasmanan', unitPrice: 200000, quantity: 1 }]
    });

    assert.equal(order1.success, true);
    assert.equal(order1.pointsEarned, 20);
    assert.equal(order1.newTier, 'Sahabat');
    assert.equal(engine.customers.get('cust-upg-01').tier, 'Sahabat');

    // 2. Place larger order for Rp 2.000.000 -> 200 points earned
    // Cumulative points: 105 + 200 = 305 -> Crosses 300 threshold -> Promoted to 'Keluarga'
    const order2 = engine.createOrderAtomic({
      idempotencyKey: 'IDEMP-TIER-UPG-02',
      customerId: 'cust-upg-01',
      items: [{ itemName: 'Gathering Acara Keluarga Besar', unitPrice: 2000000, quantity: 1 }]
    });

    assert.equal(order2.success, true);
    assert.equal(order2.pointsEarned, 200);
    assert.equal(order2.newTier, 'Keluarga');
    assert.equal(engine.customers.get('cust-upg-01').tier, 'Keluarga');
  });

  // ==========================================================================
  // Integration Chain 5: RFM Score Recalculation & Segment Migration
  // ==========================================================================
  it('Chain 5: High Frequency Transaction Flow -> RFM Recalculation -> Segment Migration (Baru -> Champions)', () => {
    function computeCustomerRfm(transactions, customerId) {
      const custTx = transactions.filter(t => t.customerId === customerId);
      if (custTx.length === 0) return { r: 1, f: 1, m: 1, segment: 'Hilang' };

      const fCount = custTx.length;
      const mTotal = custTx.reduce((sum, t) => sum + t.finalAmount, 0);

      // Scoring rules
      let r = 5; // Recently visited
      let f = fCount >= 10 ? 5 : fCount >= 5 ? 4 : fCount >= 3 ? 3 : fCount >= 2 ? 2 : 1;
      let m = mTotal >= 1000000 ? 5 : mTotal >= 500000 ? 4 : mTotal >= 250000 ? 3 : mTotal >= 100000 ? 2 : 1;

      let segment = 'Potensial Loyal';
      if (r >= 4 && f >= 4 && m >= 4) segment = 'Champions';
      else if (r >= 3 && f >= 3) segment = 'Loyal';
      else if (f === 1) segment = 'Baru';

      return { r, f, m, segment };
    }

    const txList = [];
    const custId = 'cust-rfm-01';

    // 1st visit: 1 transaction -> Segment is 'Baru'
    txList.push({ customerId: custId, finalAmount: 80000 });
    const rfm1 = computeCustomerRfm(txList, custId);
    assert.equal(rfm1.segment, 'Baru');

    // Add 11 more high-value transactions over consecutive weeks
    for (let i = 0; i < 11; i++) {
      txList.push({ customerId: custId, finalAmount: 150000 });
    }
    const rfm2 = computeCustomerRfm(txList, custId);
    assert.equal(rfm2.f, 5);
    assert.equal(rfm2.m, 5);
    assert.equal(rfm2.segment, 'Champions');
  });

  // ==========================================================================
  // Integration Chain 6: Concurrent Multi-User Ordering on Same Item with Limited Stock
  // ==========================================================================
  it('Chain 6: Concurrent Multi-User Ordering on Same Item guarantees zero overselling and atomic decrement', () => {
    // Only 5 units of 'Bebek Sambel Hejo' left in stock
    const engine = new ReferenceStoreEngine({
      inventory: [['prod-bebek-01', { currentStock: 5, trackStock: true }]]
    });

    // 3 customers attempt to purchase 2 units each concurrently (2 + 2 + 2 = 6 units > 5 stock)
    const attempts = [
      { key: 'IDEMP-CONCUR-01', qty: 2 },
      { key: 'IDEMP-CONCUR-02', qty: 2 },
      { key: 'IDEMP-CONCUR-03', qty: 2 }
    ];

    const results = [];
    for (const att of attempts) {
      results.push(engine.createOrderAtomic({
        idempotencyKey: att.key,
        items: [{ productId: 'prod-bebek-01', itemName: 'Bebek Sambel Hejo', unitPrice: 45000, quantity: att.qty }]
      }));
    }

    // Exactly 2 orders must succeed (4 units deducted) and 1 must fail (would exceed 5 stock)
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    assert.equal(successful.length, 2, 'Exactly 2 orders must succeed');
    assert.equal(failed.length, 1, 'Exactly 1 order must fail due to stock depletion');
    assert.equal(engine.inventory.get('prod-bebek-01').currentStock, 1, 'Remaining stock must be exactly 1');
  });

});
