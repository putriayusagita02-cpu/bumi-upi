const assert = require('assert');
const React = require('react');
const ui = require('./dist/index.js');

console.log('--- RUNNING @bumi-upi/ui VERIFICATION ---');

// 1. Verify Tokens
console.log('1. Checking Design Tokens...');
assert.strictEqual(ui.colors.olive.DEFAULT, '#3E4F30', 'Olive default color mismatch');
assert.strictEqual(ui.colors.krem.DEFAULT, '#F5EEDC', 'Krem default color mismatch');
assert.strictEqual(ui.colors.terakota.DEFAULT, '#B4532A', 'Terakota default color mismatch');
assert.strictEqual(ui.colors.mustard.DEFAULT, '#D4A24C', 'Mustard default color mismatch');
assert.strictEqual(ui.colors.kopi.DEFAULT, '#2B2625', 'Hitam Kopi color mismatch');
assert.ok(ui.colors.tiers.tamu, 'Tamu tier tokens missing');
assert.ok(ui.colors.tiers.sahabat, 'Sahabat tier tokens missing');
assert.ok(ui.colors.tiers.keluarga, 'Keluarga tier tokens missing');
assert.ok(ui.typography.fonts.serif.includes('Fraunces'), 'Fraunces font missing');
assert.ok(ui.typography.fonts.sans.includes('Plus Jakarta Sans'), 'Plus Jakarta Sans font missing');
assert.ok(ui.typography.fonts.handwriting.includes('Caveat'), 'Caveat font missing');
assert.ok(ui.borderRadius.vintage, 'Vintage radius missing');
assert.ok(ui.shadows.warm, 'Warm shadow missing');
console.log('✔ Design tokens verified.');

// 2. Verify Component Exports
console.log('2. Checking Component Exports...');
assert.ok(ui.Button, 'Button component missing');
assert.ok(ui.Badge, 'Badge component missing');
assert.ok(ui.Card, 'Card component missing');
assert.ok(ui.CardHeader, 'CardHeader component missing');
assert.ok(ui.CardTitle, 'CardTitle component missing');
assert.ok(ui.CardDescription, 'CardDescription component missing');
assert.ok(ui.CardContent, 'CardContent component missing');
assert.ok(ui.CardFooter, 'CardFooter component missing');
assert.ok(ui.Modal, 'Modal component missing');
assert.ok(ui.ToastProvider, 'ToastProvider missing');
assert.ok(ui.useToast, 'useToast hook missing');
assert.ok(ui.OtpToastHelper, 'OtpToastHelper component missing');
assert.ok(ui.MemberCard, 'MemberCard component missing');
console.log('✔ All component exports verified.');

// 3. Verify Component Element Creation
console.log('3. Checking React Element Instantiation...');
const btnElem = React.createElement(ui.Button, { variant: 'primary', size: 'md' }, 'Pesan Sekarang');
assert.ok(btnElem, 'Button element creation failed');

const badgeElem = React.createElement(ui.Badge, { variant: 'tier-sahabat', dot: true }, 'Sahabat');
assert.ok(badgeElem, 'Badge element creation failed');

const cardElem = React.createElement(
  ui.Card,
  { variant: 'surface', hoverable: true },
  React.createElement(ui.CardHeader, null, React.createElement(ui.CardTitle, null, 'Sate Aci')),
  React.createElement(ui.CardContent, null, 'Camilan khas Garut'),
  React.createElement(ui.CardFooter, null, 'Rp 14.000')
);
assert.ok(cardElem, 'Card element creation failed');

const modalElem = React.createElement(
  ui.Modal,
  { isOpen: true, onClose: () => {}, title: 'Detail Menu' },
  'Pilihan varian'
);
assert.ok(modalElem, 'Modal element creation failed');

const otpHdrElem = React.createElement(ui.OtpToastHelper, {
  otpCode: '839201',
  phone: '081234567890',
  onAutoFill: (code) => console.log('Autofill called with', code),
});
assert.ok(otpHdrElem, 'OtpToastHelper element creation failed');

const memberElem = React.createElement(ui.MemberCard, {
  name: 'Dimas Kurniawan',
  tier: 'Sahabat',
  points: 142,
});
assert.ok(memberElem, 'MemberCard element creation failed');

console.log('✔ Component elements instantiated successfully.');
console.log('--- ALL @bumi-upi/ui VERIFICATIONS PASSED ---');
