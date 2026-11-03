# Handoff Report — Explorer M1 Iteration 2 (Root Cause & Defensive Patterns)

## Synthesis & Consensus Summary
- **Consensus**: Both Challenger (`challenger_m1_1`) and this Explorer confirm that `MemberCard.tsx:203` crashes on `points = null`, `OtpToastHelper.tsx:21, 42-44` corrupts negative time strings into `-1:0-30 WIB`, and `OtpToastHelper.tsx:35, 138` risks `ReferenceError` on undeclared `navigator`. Furthermore, `Button.tsx`, `Badge.tsx`, and `Card.tsx` crash on undefined variant lookups.
- **Resolved Conflicts / Added Insights**:
  1. *Negative Points Behavior in MemberCard*: Coalescing `points` via `points ?? 0` or clamping `Math.max(0, points)` must distinguish between legitimate negative numbers (e.g. debt/penalties, as tested in `stress.test.js` where `-50` displays as `"-50"`) and `null`/`undefined`/`NaN`. Clamping to `0` unconditionally would break test suite assertion 20. The recommended pattern is: `typeof points === 'number' && !Number.isNaN(points) ? points : 0`.
  2. *Tier Inconsistency Bug Discovered*: In `MemberCard.tsx:67-73`, an invalid tier falls back to `tierConfig.Sahabat`, but the progress baseline condition checks `tier === 'Sahabat'` (which is `false`), calculating progress against a 0 base instead of 100. The fix resolves `safeTier` first, aligning progress math with visual styling.
  3. *Undeclared Global Identifier in JS*: Optional chaining (`navigator?.clipboard`) does NOT protect against undeclared variables in JavaScript. The only safe idiom is `typeof navigator !== 'undefined'`.
- **Dissenting Views**: None.
- **Gaps**: None identified within Milestone 1 UI scope.

---

## 1. Observation

### Observation 1: `MemberCard.tsx:203` Crash on `points = null`
- **File & Line**: `packages/ui/src/components/MemberCard.tsx:21, 203`
  ```tsx
  // Line 21: Default parameter only applies to undefined, not null
  export const MemberCard: React.FC<MemberCardProps> = ({
    ...
    points = 142,
  }) => {
  ...
  // Line 203: Unchecked method call on points
  <span className="text-2xl font-black tracking-tight" style={{ color: config.accentColor }}>
    {points.toLocaleString('id-ID')}
  </span>
  ```
- **Reproduction Command**:
  ```powershell
  Set-Location "C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\packages\ui"
  node -e "const ReactDOMServer = require('react-dom/server'); const ui = require('./dist/index.js'); const React = require('react'); ReactDOMServer.renderToString(React.createElement(ui.MemberCard, { name: 'Test', points: null }));"
  ```
- **Verbatim Error**:
  ```
  TypeError: Cannot read properties of null (reading 'toLocaleString')
      at MemberCard (C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\packages\ui\dist\components\MemberCard.js:77:24)
  ```

### Observation 2: Inconsistent Tier Progress Calculation on Unrecognized Tier
- **File & Line**: `packages/ui/src/components/MemberCard.tsx:67, 73-76`
  ```tsx
  const config = tierConfig[tier] || tierConfig.Sahabat;
  ...
  if (config.nextTier) {
    const currentBase = tier === 'Sahabat' ? 100 : 0;
    const range = config.nextTier.target - currentBase;
    const progress = Math.max(0, Math.min(range, points - currentBase));
  ```
- When `tier = 'INVALID'` or unrecognized, `config` falls back to `Sahabat` (target: 300), but `tier === 'Sahabat'` evaluates to `false`. `currentBase` becomes `0` instead of `100`, making `range = 300` instead of `200`. For `points = 150`, progress calculates as `50%` instead of `25%`.

### Observation 3: `OtpToastHelper.tsx:21, 42-44` Malformed String on Negative Expiration
- **File & Line**: `packages/ui/src/components/OtpToastHelper.tsx:21, 42-44`
  ```tsx
  const [timeLeft, setTimeLeft] = useState(expiresInSeconds);
  ...
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  ```
- **Reproduction Command**:
  ```powershell
  Set-Location "C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\packages\ui"
  node -e "const ReactDOMServer = require('react-dom/server'); const ui = require('./dist/index.js'); const React = require('react'); const html = ReactDOMServer.renderToString(React.createElement(ui.OtpToastHelper, { otpCode: '123456', expiresInSeconds: -30 })); console.log(html);"
  ```
- **Verbatim Output**:
  ```html
  <span>Masa berlaku kode:</span><span class="font-medium text-[#2B2625]">-1:0-30<!-- --> WIB</span>
  ```
- When `timeLeft = -30`: `Math.floor(-30 / 60)` evaluates to `-1`, `-30 % 60` evaluates to `-30`. Because `-30 < 10` is `true`, it prepends `'0'`, yielding `"-1:0-30"`.

### Observation 4: `OtpToastHelper.tsx:35, 138` Undeclared Global `navigator` Access
- **File & Line**: `packages/ui/src/components/OtpToastHelper.tsx:35, 138`
  ```tsx
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(otpCode).catch(() => {});
  }
  ```
- **Reproduction Command**:
  ```powershell
  node -e "delete globalThis.navigator; try { eval('navigator?.clipboard?.writeText'); } catch (e) { console.error(e.name, e.message); }"
  ```
- **Verbatim Error**:
  ```
  ReferenceError navigator is not defined
  ```
- In ECMAScript, optional chaining `?.` guards property access on `null` or `undefined` objects, but does NOT prevent a `ReferenceError` when the root variable identifier itself is undeclared in the global/lexical scope.

### Observation 5: Missing Variant Fallbacks in `Button`, `Badge`, `Card`
- **File & Lines**:
  - `packages/ui/src/components/Button.tsx:88`: `const currentVariant = variantStyles[variant];`
  - `packages/ui/src/components/Badge.tsx:122`: `const currentVariant = variantStyles[variant];`
  - `packages/ui/src/components/Card.tsx:42`: `const selected = variantStyles[variant];`
- **Reproduction Command**:
  ```powershell
  Set-Location "C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\packages\ui"
  node -e "const ReactDOMServer = require('react-dom/server'); const ui = require('./dist/index.js'); const React = require('react'); try { ReactDOMServer.renderToString(React.createElement(ui.Button, { variant: 'invalid' })); } catch(e) { console.log('Button:', e.message); } try { ReactDOMServer.renderToString(React.createElement(ui.Badge, { variant: 'invalid' })); } catch(e) { console.log('Badge:', e.message); } try { ReactDOMServer.renderToString(React.createElement(ui.Card, { variant: 'invalid' })); } catch(e) { console.log('Card:', e.message); }"
  ```
- **Verbatim Error**:
  ```
  Button: Cannot read properties of undefined (reading 'className')
  Badge: Cannot read properties of undefined (reading 'bg')
  Card: Cannot read properties of undefined (reading 'bg')
  ```

---

## 2. Logic Chain

1. **MemberCard Null Dereference**:
   - ES6 destructuring assignment default `points = 142` triggers strictly on `undefined`. When a database record or API response returns `{ points: null }`, `points` remains `null`.
   - At line 203, invoking `.toLocaleString('id-ID')` directly on `null` triggers an unhandled `TypeError`.
   - To make `MemberCard` bulletproof, `points` must be sanitized to `safePoints`:
     `const safePoints = typeof points === 'number' && !Number.isNaN(points) ? points : 0;`
     This preserves valid negative points (e.g. `-50` as expected in `stress.test.js:355`), while gracefully converting `null`, `undefined`, and `NaN` to `0`.
   - In addition, resolving `safeTier = (tier && tier in tierConfig) ? tier : 'Sahabat'` ensures that both the visual configuration and progress calculations remain 100% consistent even when given unexpected tier strings.

2. **OtpToastHelper Countdown Clamping**:
   - Expiration seconds can be negative if a client receives an already-expired OTP or experiences clock skew.
   - Initializing `timeLeft` with `Math.max(0, Math.floor(expiresInSeconds || 0))` clamps negative or invalid inputs at the state boundary.
   - Adding defensive clamping in the formatting logic `const safeTime = Math.max(0, Math.floor(timeLeft || 0))` ensures that arithmetic operations `Math.floor(safeTime / 60)` and `safeTime % 60` operate strictly on non-negative integers, outputting valid formats such as `"0:00 WIB"`.

3. **Safe Global Access Pattern for `navigator`**:
   - `typeof` is the only safe JavaScript operator that never throws a `ReferenceError` on undeclared identifiers.
   - Guarding clipboard access with:
     `typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function'`
     guarantees safe execution across Node.js SSR, test runners, and Web Workers.
   - Encapsulating this into an async `copyToClipboard` helper deduplicates code between the auto-fill handler and the copy button. Adding timer cleanup on unmount prevents memory leaks.

4. **Component Variant Fallback Pattern**:
   - Components receiving dynamic strings (e.g., from DB status or query parameters) must not crash when an unrecognized string is supplied.
   - The pattern `(variant && variant in variantStyles) ? variantStyles[variant] : variantStyles.defaultVariant` ensures graceful fallback to design system defaults.

---

## 3. Caveats
- No caveats regarding reproducibility: all defects were reproduced with 100% determinism via standalone node commands and the project test harness.
- Implementation code was NOT modified directly, strictly adhering to the Explorer read-only role. All proposals are provided as a unified `.patch` file and structured snippets ready for Worker implementation.

---

## 4. Conclusion & Actionable Recommendations

### Recommendation 1: Patch `packages/ui/src/components/MemberCard.tsx`
Apply defensive tier resolution, points normalization, and safe text fallbacks:
```tsx
// 1. Resolve safe tier
const safeTier: MembershipTier = (tier && tier in tierConfig) ? tier : 'Sahabat';
const config = tierConfig[safeTier];

// 2. Normalize points safely (handles null, undefined, NaN; preserves valid numbers)
const safePoints = typeof points === 'number' && !Number.isNaN(points) ? points : 0;

// 3. Progress calculation with safe values
let progressPercentage = 100;
let progressText = 'Tier Tertinggi';
if (config.nextTier) {
  const currentBase = safeTier === 'Sahabat' ? 100 : 0;
  const range = config.nextTier.target - currentBase;
  const progress = Math.max(0, Math.min(range, safePoints - currentBase));
  progressPercentage = Math.round((progress / range) * 100);
  const remaining = Math.max(0, config.nextTier.target - safePoints);
  progressText = `${remaining} poin lagi menuju ${config.nextTier.name}`;
}

// 4. In JSX render:
{safePoints.toLocaleString('id-ID')}
{name || 'Tamu Setia'}
```

### Recommendation 2: Patch `packages/ui/src/components/OtpToastHelper.tsx`
Apply clamped initial countdown, safe clipboard accessor, and clamped display formatting:
```tsx
// 1. Clamp initial seconds safely
const safeInitialSeconds = typeof expiresInSeconds === 'number' && !Number.isNaN(expiresInSeconds)
  ? Math.max(0, Math.floor(expiresInSeconds))
  : 0;
const [timeLeft, setTimeLeft] = useState(safeInitialSeconds);
const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// 2. Timer cleanup on unmount
useEffect(() => {
  return () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  };
}, []);

// 3. Safe environment-agnostic clipboard helper
const copyToClipboard = async (text: string) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
    }
  } catch {
    // Silently handle clipboard write rejections
  }
  setCopied(true);
  if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
};

// 4. Clamped time formatting
const safeTime = Math.max(0, Math.floor(timeLeft || 0));
const minutes = Math.floor(safeTime / 60);
const seconds = safeTime % 60;
const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

// 5. Connect handlers
const handleFill = () => {
  if (onAutoFill) onAutoFill(otpCode);
  copyToClipboard(otpCode);
};
// In "Salin" button: onClick={() => copyToClipboard(otpCode)}
```

### Recommendation 3: Patch `Button.tsx`, `Badge.tsx`, `Card.tsx`
Add fallback lookups:
```tsx
// Button.tsx:
const currentVariant = (variant && variant in variantStyles) ? variantStyles[variant] : variantStyles.primary;
const currentSize = (size && size in sizeClasses) ? sizeClasses[size] : sizeClasses.md;

// Badge.tsx:
const currentVariant = (variant && variant in variantStyles) ? variantStyles[variant] : variantStyles.olive;
const currentSize = (size && size in sizeClasses) ? sizeClasses[size] : sizeClasses.md;

// Card.tsx:
const selected = (variant && variant in variantStyles) ? variantStyles[variant] : variantStyles.default;
```

### Patch File Location:
A unified, machine-applicable patch file has been generated and saved to:
`C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_m1_iter2_2\proposed_fixes.patch`

---

## 5. Verification Method

To independently verify the proposed fixes after applying the patch:

```powershell
Set-Location "C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\packages\ui"

# 1. Compile TypeScript package
pnpm run build

# 2. Run existing unit test harness
pnpm run test

# 3. Run full adversarial stress test harness
node stress.test.js

# 4. Verify MemberCard with null points (must render '0' without error)
node -e "const ReactDOMServer = require('react-dom/server'); const ui = require('./dist/index.js'); const React = require('react'); const html = ReactDOMServer.renderToString(React.createElement(ui.MemberCard, { name: 'Test', points: null })); console.log('MemberCard null test:', html.includes('0</span>') ? 'PASS' : 'FAIL');"

# 5. Verify OtpToastHelper negative countdown (must render '0:00 WIB')
node -e "const ReactDOMServer = require('react-dom/server'); const ui = require('./dist/index.js'); const React = require('react'); const html = ReactDOMServer.renderToString(React.createElement(ui.OtpToastHelper, { otpCode: '123456', expiresInSeconds: -30 })); console.log('OtpToastHelper negative test:', html.includes('0:00') && !html.includes('-1:0-30') ? 'PASS' : 'FAIL');"

# 6. Verify Button/Badge/Card invalid variant fallbacks
node -e "const ReactDOMServer = require('react-dom/server'); const ui = require('./dist/index.js'); const React = require('react'); ReactDOMServer.renderToString(React.createElement(ui.Button, { variant: 'invalid' })); ReactDOMServer.renderToString(React.createElement(ui.Badge, { variant: 'invalid' })); ReactDOMServer.renderToString(React.createElement(ui.Card, { variant: 'invalid' })); console.log('Component variant fallbacks: PASS');"
```

### Invalidation Conditions:
- `MemberCard` throws `TypeError` when `points = null`.
- `OtpToastHelper` outputs any negative time string (e.g. `-1:0-30`) when `expiresInSeconds < 0`.
- Calling `OtpToastHelper` clipboard routines throws `ReferenceError: navigator is not defined` when `navigator` is undeclared.
- Passing an unrecognized `variant` to `Button`, `Badge`, or `Card` throws `TypeError`.
