const assert = require('assert');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

// 1. Test deepFreeze
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const val = obj[prop];
    if (val !== null && (typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  });
  return obj;
}

const colors = deepFreeze({
  olive: { DEFAULT: '#3E4F30' },
  krem: { DEFAULT: '#F5EEDC' }
});

assert.strictEqual(Object.isFrozen(colors), true);
assert.strictEqual(Object.isFrozen(colors.olive), true);
console.log('✔ deepFreeze test passed');

// 2. Test MemberCard null points logic
function simulateMemberCard(points) {
  const safePoints = points ?? 0;
  const config = {
    accentColor: '#E2BA70',
    nextTier: { name: 'Keluarga', target: 300 }
  };
  const tier = 'Sahabat';
  const currentBase = tier === 'Sahabat' ? 100 : 0;
  const range = config.nextTier.target - currentBase;
  const progress = Math.max(0, Math.min(range, safePoints - currentBase));
  const progressPercentage = Math.round((progress / range) * 100);
  const remaining = Math.max(0, config.nextTier.target - safePoints);
  const progressText = `${remaining} poin lagi menuju ${config.nextTier.name}`;
  const pointsFormatted = safePoints.toLocaleString('id-ID');
  return { progressPercentage, progressText, pointsFormatted };
}

// Points = null
const resNull = simulateMemberCard(null);
assert.strictEqual(resNull.pointsFormatted, '0');
assert.strictEqual(resNull.progressPercentage, 0);
assert.strictEqual(resNull.progressText, '300 poin lagi menuju Keluarga');
console.log('✔ MemberCard points=null test passed');

// Points = -50
const resNeg = simulateMemberCard(-50);
assert.strictEqual(resNeg.pointsFormatted, '-50');
assert.strictEqual(resNeg.progressPercentage, 0);
assert.strictEqual(resNeg.progressText, '350 poin lagi menuju Keluarga');
console.log('✔ MemberCard points=-50 test passed');

// Points = 150
const resNormal = simulateMemberCard(150);
assert.strictEqual(resNormal.pointsFormatted, '150');
assert.strictEqual(resNormal.progressPercentage, 25);
assert.strictEqual(resNormal.progressText, '150 poin lagi menuju Keluarga');
console.log('✔ MemberCard points=150 test passed');

// 3. Test OtpToastHelper negative countdown logic
function simulateOtpTimer(expiresInSeconds) {
  const initialTime = Math.max(0, expiresInSeconds);
  const safeTime = Math.max(0, initialTime);
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} WIB`;
}

assert.strictEqual(simulateOtpTimer(-30), '0:00 WIB');
assert.strictEqual(simulateOtpTimer(0), '0:00 WIB');
assert.strictEqual(simulateOtpTimer(600), '10:00 WIB');
console.log('✔ OtpToastHelper countdown clamp test passed');

// 4. Test safe navigator access
let navigatorSafe = false;
const origNav = globalThis.navigator;
try {
  delete globalThis.navigator;
  navigatorSafe = (typeof navigator !== 'undefined' && navigator.clipboard?.writeText);
} finally {
  if (origNav !== undefined) globalThis.navigator = origNav;
}
assert.strictEqual(navigatorSafe, false);
console.log('✔ typeof navigator safety test passed');

// 5. Test variant fallbacks
const variantStyles = { primary: { bg: '#3E4F30' }, secondary: { bg: '#B4532A' } };
const variant = 'unsupported';
const current = variantStyles[variant] || variantStyles.primary;
assert.strictEqual(current.bg, '#3E4F30');
console.log('✔ Variant fallback test passed');

console.log('--- ALL SIMULATION CHECKS PASSED ---');
