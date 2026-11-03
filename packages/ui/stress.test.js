const assert = require('assert');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

// Import compiled UI library
const ui = require('./dist/index.js');

console.log('========================================================');
console.log('       @BUMI-UPI/UI ADVERSARIAL STRESS TEST SUITE       ');
console.log('========================================================\n');

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  findings: []
};

function test(name, fn) {
  results.total++;
  try {
    fn();
    results.passed++;
    console.log(`[PASS] ${name}`);
  } catch (err) {
    results.failed++;
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    results.findings.push({ name, error: err.message, stack: err.stack });
  }
}

// ---------------------------------------------------------------------
// SUITE 1: Design Tokens Immutability & Hex Format Completeness
// ---------------------------------------------------------------------
console.log('--- 1. TESTING TOKENS IMMUTABILITY & COMPLETENESS ---');

const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function validateHexRecursive(obj, path = 'colors') {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = `${path}.${key}`;
    if (typeof value === 'object' && value !== null) {
      validateHexRecursive(value, currentPath);
    } else if (typeof value === 'string') {
      if (value.startsWith('#')) {
        assert.ok(
          hexRegex.test(value),
          `Invalid hex code at ${currentPath}: "${value}"`
        );
      }
    }
  }
}

test('Tokens: All color values are valid hex codes', () => {
  assert.ok(ui.colors, 'colors export missing');
  validateHexRecursive(ui.colors);
});

test('Tokens: Core heritage palette presence and values', () => {
  assert.strictEqual(ui.colors.olive.DEFAULT, '#3E4F30');
  assert.strictEqual(ui.colors.krem.DEFAULT, '#F5EEDC');
  assert.strictEqual(ui.colors.terakota.DEFAULT, '#B4532A');
  assert.strictEqual(ui.colors.mustard.DEFAULT, '#D4A24C');
  assert.strictEqual(ui.colors.kopi.DEFAULT, '#2B2625');
  assert.strictEqual(ui.colors.sage.DEFAULT, '#8A8F5F');
  assert.ok(ui.colors.tiers.tamu.bg, 'Tier tamu color missing');
  assert.ok(ui.colors.tiers.sahabat.bg, 'Tier sahabat color missing');
  assert.ok(ui.colors.tiers.keluarga.bg, 'Tier keluarga color missing');
});

test('Tokens: Immutability check (Runtime Object Freeze)', () => {
  assert.strictEqual(Object.isFrozen(ui.colors), true, 'ui.colors should be frozen');
  assert.strictEqual(Object.isFrozen(ui.colors.olive), true, 'ui.colors.olive should be frozen');
  assert.strictEqual(Object.isFrozen(ui.tokens), true, 'ui.tokens should be frozen');
});

// ---------------------------------------------------------------------
// SUITE 2: Component SSR & Boundary Props Handling
// ---------------------------------------------------------------------
console.log('\n--- 2. TESTING COMPONENT SSR & BOUNDARY PROPS ---');

test('Button: Standard variants and sizes SSR render', () => {
  const variants = ['primary', 'secondary', 'outline', 'ghost', 'mustard'];
  const sizes = ['sm', 'md', 'lg'];
  
  for (const variant of variants) {
    for (const size of sizes) {
      const html = ReactDOMServer.renderToString(
        React.createElement(ui.Button, { variant, size }, 'Test Button')
      );
      assert.ok(html.includes('Test Button'), `Failed for variant=${variant}, size=${size}`);
    }
  }
});

test('Button: Edge props (empty children, huge string, isLoading, disabled)', () => {
  // Empty children
  const htmlEmpty = ReactDOMServer.renderToString(
    React.createElement(ui.Button, null, '')
  );
  assert.ok(htmlEmpty.includes('<button'), 'Button with empty child failed');

  // Huge string (50,000 chars)
  const hugeText = 'A'.repeat(50000);
  const htmlHuge = ReactDOMServer.renderToString(
    React.createElement(ui.Button, null, hugeText)
  );
  assert.ok(htmlHuge.includes(hugeText), 'Button with huge string failed');

  // Loading state with spinner svg
  const htmlLoading = ReactDOMServer.renderToString(
    React.createElement(ui.Button, { isLoading: true }, 'Saving')
  );
  assert.ok(htmlLoading.includes('animate-spin'), 'Loading spinner missing');
  assert.ok(htmlLoading.includes('disabled'), 'Loading button should have disabled attribute');
});

test('Button: Unsupported variant crash resilience', () => {
  let crashed = false;
  let html = '';
  try {
    html = ReactDOMServer.renderToString(
      React.createElement(ui.Button, { variant: 'unsupported_variant' }, 'Crash Test')
    );
  } catch (err) {
    crashed = true;
    console.log(`       ⚠️ Button crashes when variant is invalid: ${err.message}`);
  }
  assert.strictEqual(crashed, false, 'Button should not crash on invalid variant');
  assert.ok(html.includes('Crash Test'), 'Button text should render');
});

test('Badge: All variants and sizes SSR render', () => {
  const variants = [
    'olive', 'terakota', 'mustard', 'sage', 'kopi',
    'tier-tamu', 'tier-sahabat', 'tier-keluarga',
    'success', 'warning', 'error', 'info'
  ];
  for (const v of variants) {
    const html = ReactDOMServer.renderToString(
      React.createElement(ui.Badge, { variant: v, dot: true }, 'Badge Label')
    );
    assert.ok(html.includes('Badge Label'), `Badge failed for variant=${v}`);
  }
});

test('Badge: Unsupported variant crash resilience', () => {
  let crashed = false;
  let html = '';
  try {
    html = ReactDOMServer.renderToString(
      React.createElement(ui.Badge, { variant: 'unsupported_variant' }, 'Crash Test')
    );
  } catch (err) {
    crashed = true;
    console.log(`       ⚠️ Badge crashes when variant is invalid: ${err.message}`);
  }
  assert.strictEqual(crashed, false, 'Badge should not crash on invalid variant');
  assert.ok(html.includes('Crash Test'), 'Badge text should render');
});

test('Card suite: Nested composition and edge children', () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(
      ui.Card,
      { variant: 'surface', hoverable: true },
      React.createElement(
        ui.CardHeader,
        { action: React.createElement('button', null, 'Edit') },
        React.createElement(ui.CardTitle, { as: 'h2' }, 'Nasi Liwet'),
        React.createElement(ui.CardDescription, null, 'Gurih daun salam')
      ),
      React.createElement(ui.CardContent, null, React.createElement('p', null, 'Isian lengkap')),
      React.createElement(ui.CardFooter, null, 'Rp 35.000')
    )
  );
  assert.ok(html.includes('Nasi Liwet'), 'Card missing title');
  assert.ok(html.includes('Rp 35.000'), 'Card missing footer');
});

test('Modal: SSR rendering (isOpen=false returns empty string, isOpen=true renders overlay)', () => {
  const htmlClosed = ReactDOMServer.renderToString(
    React.createElement(ui.Modal, { isOpen: false, onClose: () => {} }, 'Hidden')
  );
  assert.strictEqual(htmlClosed, '', 'Closed modal should render empty string');

  const htmlOpen = ReactDOMServer.renderToString(
    React.createElement(
      ui.Modal,
      {
        isOpen: true,
        onClose: () => {},
        title: 'Detail Pesanan',
        description: 'Meja 04',
        footer: React.createElement('button', null, 'Bayar')
      },
      'Daftar menu...'
    )
  );
  assert.ok(htmlOpen.includes('Detail Pesanan'), 'Modal missing title');
  assert.ok(htmlOpen.includes('role="dialog"'), 'Modal missing dialog role');
  assert.ok(htmlOpen.includes('Bayar'), 'Modal missing footer');
});

test('Toast: Context provider and hook validation', () => {
  let threwExpected = false;
  function BadComponent() {
    ui.useToast();
    return React.createElement('div');
  }
  try {
    ReactDOMServer.renderToString(React.createElement(BadComponent));
  } catch (err) {
    if (err.message.includes('useToast must be used within a ToastProvider')) {
      threwExpected = true;
    }
  }
  assert.ok(threwExpected, 'useToast outside provider did not throw expected error');

  let hookContext = null;
  function GoodComponent() {
    hookContext = ui.useToast();
    return React.createElement('div', null, 'Toast Consumer');
  }
  const html = ReactDOMServer.renderToString(
    React.createElement(ui.ToastProvider, null, React.createElement(GoodComponent))
  );
  assert.ok(html.includes('Toast Consumer'));
  assert.ok(hookContext !== null, 'Hook context not populated');
  assert.strictEqual(typeof hookContext.showToast, 'function');
  assert.strictEqual(typeof hookContext.toast.otp, 'function');
});

// ---------------------------------------------------------------------
// SUITE 3: OtpToastHelper Adversarial Stress
// ---------------------------------------------------------------------
console.log('\n--- 3. TESTING OtpToastHelper ADVERSARIAL STRESS ---');

test('OtpToastHelper: Normal OTP render', () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(ui.OtpToastHelper, {
      otpCode: '839201',
      phone: '081234567890',
      expiresInSeconds: 600,
    })
  );
  assert.ok(html.includes('839201'), 'OTP code missing');
  assert.ok(html.includes('081234567890'), 'Phone missing');
  assert.ok(html.includes('10:00'), 'Expires time 10:00 missing');
});

test('OtpToastHelper: Extreme & Malformed OTP Codes', () => {
  const malformedCodes = [
    '',                                  // empty string
    '000000',                            // all zeros
    'ABCDEF',                            // alphabetic
    '99999999999999999999',              // 20-digit string
    '<script>alert("xss")</script>',     // injection attempt
    '🔑🌿☕',                            // emojis
  ];

  for (const code of malformedCodes) {
    const html = ReactDOMServer.renderToString(
      React.createElement(ui.OtpToastHelper, {
        otpCode: code,
        phone: '081234567890',
      })
    );
    assert.ok(html.includes('WhatsApp OTP Demo Helper'), `Failed rendering code: ${code}`);
  }
});

test('OtpToastHelper: Expiration Timestamps & Negative Edge Case Discovery', () => {
  // Test 0 seconds
  const html0 = ReactDOMServer.renderToString(
    React.createElement(ui.OtpToastHelper, {
      otpCode: '123456',
      expiresInSeconds: 0,
    })
  );
  assert.ok(html0.includes('0:00'), '0 seconds did not format to 0:00');

  // Test Negative Seconds (e.g. -30s)
  const htmlNeg = ReactDOMServer.renderToString(
    React.createElement(ui.OtpToastHelper, {
      otpCode: '123456',
      expiresInSeconds: -30,
    })
  );
  assert.ok(htmlNeg.includes('0:00<!-- --> WIB') || htmlNeg.includes('0:00 WIB'), 'Negative timer should clamp to 0:00 WIB');
  assert.ok(!htmlNeg.includes('-1:0-30'), 'Negative timer should not format to negative string');

  // Test very large seconds (24h = 86400s)
  const htmlLarge = ReactDOMServer.renderToString(
    React.createElement(ui.OtpToastHelper, {
      otpCode: '123456',
      expiresInSeconds: 86400,
    })
  );
  assert.ok(htmlLarge.includes('1440:00'), 'Large seconds did not format correctly');
});

test('OtpToastHelper: Missing optional callbacks and props', () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(ui.OtpToastHelper, {
      otpCode: '554433',
    })
  );
  assert.ok(html.includes('554433'));
  assert.ok(!html.includes('Tutup helper OTP'), 'Close button rendered when onClose is omitted');
});

test('OtpToastHelper: Undeclared navigator reference risk', () => {
  // Check code pattern: if navigator is undeclared in non-browser environment
  // Optional chaining navigator?. throws ReferenceError if navigator identifier is not defined.
  let throwsOnUndeclared = false;
  try {
    const check = () => {
      // In JS, evaluating an undeclared identifier with ?. throws ReferenceError
      eval('undeclared_global_ident?.foo?.bar');
    };
    check();
  } catch (e) {
    throwsOnUndeclared = (e instanceof ReferenceError);
  }
  assert.ok(throwsOnUndeclared, 'Undeclared identifier does throw ReferenceError');
  console.log('       ⚠️ Notice: OtpToastHelper uses "if (navigator?.clipboard?.writeText)" directly; in environments without global navigator this would throw ReferenceError.');
});

// ---------------------------------------------------------------------
// SUITE 4: MemberCard Adversarial Edge Cases
// ---------------------------------------------------------------------
console.log('\n--- 4. TESTING MemberCard ADVERSARIAL STRESS ---');

test('MemberCard: 0 points (Tamu tier boundary)', () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(ui.MemberCard, {
      name: 'Budi Santoso',
      tier: 'Tamu',
      points: 0,
    })
  );
  assert.ok(html.includes('0</span>'), 'Points display 0 missing');
  assert.ok(html.includes('100 poin lagi menuju Sahabat'), 'Remaining text for 0 points incorrect');
  assert.ok(html.includes('width:0%'), 'Progress bar should be 0%');
});

test('MemberCard: Negative points (e.g. -50)', () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(ui.MemberCard, {
      name: 'Agus Subagja',
      tier: 'Tamu',
      points: -50,
    })
  );
  assert.ok(html.includes('-50</span>'), 'Negative points formatted');
  assert.ok(html.includes('150 poin lagi menuju Sahabat'), 'Remaining text for negative points calculation');
  assert.ok(html.includes('width:0%'), 'Progress bar clamped to 0%');
});

test('MemberCard: Sahabat tier normal range (e.g. 150 points)', () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(ui.MemberCard, {
      name: 'Siti Rohmah',
      tier: 'Sahabat',
      points: 150,
    })
  );
  assert.ok(html.includes('width:25%'), 'Progress bar should be 25%');
  assert.ok(html.includes('150 poin lagi menuju Keluarga'), 'Remaining text incorrect');
});

test('MemberCard: Sahabat tier underflow (points 50 < 100)', () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(ui.MemberCard, {
      name: 'Rian Hidayat',
      tier: 'Sahabat',
      points: 50,
    })
  );
  assert.ok(html.includes('width:0%'), 'Progress bar should be clamped to 0%');
  assert.ok(html.includes('250 poin lagi menuju Keluarga'), 'Remaining text incorrect');
});

test('MemberCard: Extreme points (1,000,000 points)', () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(ui.MemberCard, {
      name: 'Sultan Garut',
      tier: 'Keluarga',
      points: 1000000,
    })
  );
  assert.ok(html.includes('1.000.000'), 'Formatted indonesian point thousands separator missing');
  assert.ok(html.includes('Tier Tertinggi'), 'Keluarga tier text missing');
  assert.ok(html.includes('width:100%'), 'Keluarga progress bar should be 100%');
});

test('MemberCard: Tier overflow in Sahabat (points 500 >= 300)', () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(ui.MemberCard, {
      name: 'Overachiever User',
      tier: 'Sahabat',
      points: 500,
    })
  );
  assert.ok(html.includes('width:100%'), 'Progress bar should be clamped at 100%');
  assert.ok(html.includes('0 poin lagi menuju Keluarga'), 'Remaining points should clamp to 0');
});

test('MemberCard: Invalid tier fallback', () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(ui.MemberCard, {
      name: 'Unknown Tier User',
      tier: 'VIP_PLATINUM_UNKNOWN',
      points: 100,
    })
  );
  assert.ok(html.includes('Sahabat'), 'Should fallback to default tier Sahabat');
});

test('MemberCard: Extreme name lengths and XSS payload string', () => {
  const longName = 'Raden Mas '.repeat(100);
  const htmlLong = ReactDOMServer.renderToString(
    React.createElement(ui.MemberCard, {
      name: longName,
    })
  );
  assert.ok(htmlLong.includes('truncate'), 'Truncate class missing on long name');

  const xssName = '<img src=x onerror=alert(1)>';
  const htmlXss = ReactDOMServer.renderToString(
    React.createElement(ui.MemberCard, {
      name: xssName,
    })
  );
  assert.ok(htmlXss.includes('&lt;img src=x onerror=alert(1)&gt;'), 'React SSR should escape HTML');
});

test('MemberCard: Crash test with null points (Resilience Verification)', () => {
  let crashed = false;
  let html = '';
  try {
    html = ReactDOMServer.renderToString(
      React.createElement(ui.MemberCard, {
        name: 'Null Points User',
        points: null,
      })
    );
  } catch (err) {
    crashed = true;
    console.log(`       ⚠️ Unexpected crash: Passing points=null throws "${err.message}".`);
  }
  assert.strictEqual(crashed, false, 'MemberCard must not crash when points=null');
  assert.ok(html.includes('0</span>'), 'Points display should render 0');
});

// ---------------------------------------------------------------------
// SUMMARY REPORT
// ---------------------------------------------------------------------
console.log('\n========================================================');
console.log(`TOTAL TESTS: ${results.total}`);
console.log(`PASSED:      ${results.passed}`);
console.log(`FAILED:      ${results.failed}`);
console.log('========================================================');

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
