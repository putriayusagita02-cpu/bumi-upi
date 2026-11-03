const path = require('path');
const assert = require('assert');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const ui = require(path.resolve(__dirname, '../../../packages/ui/dist/index.js'));

console.log('--- INDEPENDENT AUDIT ADVERSARIAL VERIFICATION ---');

// 1. MemberCard null / undefined / NaN resilience
console.log('1. Testing MemberCard null/undefined/NaN edge cases...');

// points: null -> safePoints = 0
const htmlNull = ReactDOMServer.renderToString(React.createElement(ui.MemberCard, {
  name: null,
  points: null,
  tier: 'InvalidTier'
}));
assert.ok(htmlNull.includes('0</span>'), 'Must display 0 points for points=null');
assert.ok(htmlNull.includes('Tamu Setia'), 'Must display fallback name');
assert.ok(htmlNull.includes('Sahabat'), 'Must fallback to default tier Sahabat');

// points: NaN -> safePoints = 0
const htmlNaN = ReactDOMServer.renderToString(React.createElement(ui.MemberCard, {
  name: '',
  points: NaN,
  tier: 'Sahabat'
}));
assert.ok(htmlNaN.includes('0</span>'), 'Must display 0 points for points=NaN');

// points: undefined -> default parameter points = 142 is used
const htmlUndef = ReactDOMServer.renderToString(React.createElement(ui.MemberCard, {
  name: 'Default User',
  points: undefined
}));
assert.ok(htmlUndef.includes('142</span>'), 'Must use default 142 points for points=undefined');

console.log('✔ MemberCard null/NaN/default parameter resilience PASS');

// 2. OtpToastHelper negative timer & null clamping
console.log('2. Testing OtpToastHelper negative & bad expiration clamping...');
[-999, -1, 0, null, NaN].forEach((badExp) => {
  const html = ReactDOMServer.renderToString(React.createElement(ui.OtpToastHelper, {
    otpCode: '998877',
    expiresInSeconds: badExp
  }));
  assert.ok(html.includes('0:00 WIB') || html.includes('0:00<!-- --> WIB'), 'Must clamp to 0:00 WIB for ' + badExp);
  assert.ok(!html.includes('-%'), 'Must not format negative percentages');
  assert.ok(!html.includes('-1:'), 'Must not have negative minute format');
  assert.ok(!html.includes(':-'), 'Must not have negative second format');
});
console.log('✔ OtpToastHelper timer clamping PASS');

// 3. Variant fallbacks
console.log('3. Testing Component variant/size fallbacks...');
['invalid', null, undefined].forEach((badVariant) => {
  const btnHtml = ReactDOMServer.renderToString(React.createElement(ui.Button, { variant: badVariant, size: badVariant }, 'Btn'));
  assert.ok(btnHtml.includes('Btn'), 'Button must render fallback for ' + badVariant);
  
  const badgeHtml = ReactDOMServer.renderToString(React.createElement(ui.Badge, { variant: badVariant, size: badVariant }, 'Bdg'));
  assert.ok(badgeHtml.includes('Bdg'), 'Badge must render fallback for ' + badVariant);
  
  const cardHtml = ReactDOMServer.renderToString(React.createElement(ui.Card, { variant: badVariant }, 'Crd'));
  assert.ok(cardHtml.includes('Crd'), 'Card must render fallback for ' + badVariant);
  
  const modalHtml = ReactDOMServer.renderToString(React.createElement(ui.Modal, { isOpen: true, onClose: () => {}, size: badVariant }, 'Mdl'));
  assert.ok(modalHtml.includes('Mdl'), 'Modal must render fallback for ' + badVariant);
});
console.log('✔ Component fallbacks PASS');

// 4. Runtime Deep Freeze
console.log('4. Testing deepFreeze enforcement...');
assert.strictEqual(Object.isFrozen(ui.tokens.colors), true, 'tokens.colors must be frozen');
assert.strictEqual(Object.isFrozen(ui.tokens.colors.olive), true, 'tokens.colors.olive must be frozen');
assert.strictEqual(Object.isFrozen(ui.tokens.colors.tiers.tamu), true, 'tokens.colors.tiers.tamu must be frozen');
assert.strictEqual(Object.isFrozen(ui.tokens.shadows), true, 'tokens.shadows must be frozen');
assert.strictEqual(Object.isFrozen(ui.tokens.borderRadius), true, 'tokens.borderRadius must be frozen');
assert.throws(() => {
  'use strict';
  ui.tokens.colors.olive.DEFAULT = '#000000';
}, /read only|frozen|extensible/i);
console.log('✔ Runtime deep freeze PASS');

console.log('--- ALL INDEPENDENT AUDIT CHECKS PASSED EMPIRICALLY ---');
