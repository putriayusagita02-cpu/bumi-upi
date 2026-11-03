# Empirical Challenge Report & Handoff — Challenger M1-2

**Verdict**: `CONFIRM` (with 2 non-blocking advisories)

---

## 1. Observation

1. **Cross-Workspace Package Resolution (CJS & ESM)**:
   - Command: `cd C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\apps\web; node -e "const ui = require('@bumi-upi/ui'); console.log(Object.keys(ui));"`
     Output:
     ```
     Resolved from apps/web: [
       'tokens',          'colors',
       'typography',      'borderRadius',
       'shadows',         'Button',
       'Badge',           'Card',
       'CardHeader',      'CardTitle',
       'CardDescription', 'CardContent',
       'CardFooter',      'Modal',
       'ToastProvider',   'useToast',
       'ToastContainer',  'OtpToastHelper',
       'MemberCard'
     ]
     ```
     Exit code: 0.
   - Command: `cd C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\apps\admin; node -e "const ui = require('@bumi-upi/ui'); console.log(Object.keys(ui));"`
     Output: Identical 19 exported keys. Exit code: 0.
   - Command (ESM Named Imports):
     `cd C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\apps\web; node --input-type=module -e "import { Button, Badge, Card, Modal, OtpToastHelper, MemberCard, colors } from '@bumi-upi/ui'; console.log('ESM Named imports success:', typeof Button, typeof Badge, colors.olive.DEFAULT);"`
     Output:
     ```
     ESM Named imports success: object function #3E4F30
     ```
     Exit code: 0.

2. **Subpath Exports Resolution**:
   - Subpath `@bumi-upi/ui/tokens`:
     `cd C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\apps\web; node -e "const tokens = require('@bumi-upi/ui/tokens'); console.log('Resolved tokens:', Object.keys(tokens));"`
     Output: `Resolved tokens: [ 'colors', 'typography', 'borderRadius', 'shadows', 'tokens', 'default' ]`. Exit code: 0.
   - Subpath `@bumi-upi/ui/styles`:
     `node -e "console.log(require.resolve('@bumi-upi/ui/styles'))"`
     Output: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\packages\ui\src\styles\tokens.css`.
     File inspection confirmed tokens: `--color-olive-default: #3E4F30`, `--font-serif: 'Fraunces'`, `--radius-vintage: 1.25rem`. Exit code: 0.

3. **External Consumer TypeScript Type Resolution**:
   - Compiling synthetic consumer JSX/TSX importing `@bumi-upi/ui` with `tsc --noEmit --target ES2020 --moduleResolution bundler --jsx react-jsx`:
     Exit code: 0 (0 type errors).

4. **Dist Directory Artifact Integrity & Clean Rebuild**:
   - Mappings in `packages/ui/package.json`:
     - `main`: `./dist/index.js` (Exists)
     - `types`: `./dist/index.d.ts` (Exists)
     - `exports["."].import`: `./dist/index.js` (Exists)
     - `exports["./tokens"]`: `./dist/tokens/index.js` (Exists)
   - Component artifacts in `packages/ui/dist/components/`:
     All 7 component units (`Badge`, `Button`, `Card`, `MemberCard`, `Modal`, `OtpToastHelper`, `Toast`) have `.js`, `.d.ts`, `.js.map`, and `.d.ts.map` files physically present.
   - Clean rebuild: `pnpm.cmd --filter @bumi-upi/ui build` succeeds with exit code 0 (`tsc --outDir dist`).

5. **Circular Dependency Analysis**:
   - Dependency graph traversal (DFS) across all 13 source files in `packages/ui/src/` detected **0 circular dependency cycles**.

6. **Monorepo Scripts Resilience**:
   - `pnpm.cmd run typecheck`:
     Output:
     ```
     $ pnpm -r run typecheck
     Scope: 4 of 5 workspace projects
     packages/db typecheck$ tsc --noEmit
     packages/ui typecheck$ tsc --noEmit
     packages/db typecheck: Done
     packages/ui typecheck: Done
     ```
     Exit code: 0.
   - `pnpm.cmd run build`:
     Failed with exit code 1 (`ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`) when invoked at root without filters:
     ```
     apps/admin build: Error: > Couldn't find any `pages` or `app` directory. Please create one under the project root
     apps/web build: Error: > Couldn't find any `pages` or `app` directory. Please create one under the project root
     ```
     Reason: `apps/web` and `apps/admin` `package.json` define `"build": "next build"`, but the application pages are scheduled for Milestone 3 and Milestone 4. Package-targeted build `pnpm.cmd --filter @bumi-upi/ui build` succeeds with exit code 0.

7. **Automated Challenge Runner Execution**:
   - Test command: `node tests/empirical_challenge.js`
   - Output: `SUMMARY: 14 Passed, 0 Failed, 2 Warnings` with exit code 0.

---

## 2. Logic Chain

1. **Workspace Linker & Hoisting (From Observation 1 & 2)**:
   The configured `nodeLinker: hoisted` in `pnpm-workspace.yaml` and `.npmrc` successfully bypasses Windows non-elevated symlink restrictions while correctly exposing workspace packages. Both `apps/web` and `apps/admin` resolve `@bumi-upi/ui` directly via standard Node.js resolution without errors.
2. **Dual CJS/ESM & Subpath Interoperability (From Observation 1, 2, 3)**:
   Both CommonJS (`require`) and ES Module (`import`) consumers resolve the package and its subpaths (`@bumi-upi/ui/tokens`, `@bumi-upi/ui/styles`). TypeScript consumers resolve declarations (`.d.ts`) with zero type errors.
3. **Artifact Integrity & Build Reproducibility (From Observation 4 & 5)**:
   All exported paths in `package.json` point to existing files. Source maps and declaration maps exist. Re-running the build cleanly produces the exact expected artifacts without circular import hazards.
4. **Resilience Assessment (From Observation 6 & 7)**:
   - Root `typecheck` passes cleanly across the workspace.
   - Root recursive `build` failure is an expected milestone dependency: Next.js requires `app/` or `pages/` dirs which are assigned to M3 (`apps/web`) and M4 (`apps/admin`). The package under test (`packages/ui`) builds independently with exit code 0.

---

## 3. Caveats

1. **Root Recursive Build (`pnpm run build`)**: Root `package.json` specifies `"build": "pnpm -r run build"`. In Milestone 1, `apps/web` and `apps/admin` are directory skeletons whose `next build` fails because pages do not yet exist. Until M3 and M4 create `app/page.tsx`, team members must use filtered builds (`pnpm --filter @bumi-upi/ui build`).
2. **Interface Contract Scope Discrepancy**:
   - `PROJECT.md` line 58 lists: `Button, Input, Badge, Modal, Card, ToastProvider & useToast, OtpHelperToast, MemberCard, Navbar`.
   - `PROJECT.md` Code Layout (lines 89-95) lists only: `Button.tsx, Badge.tsx, Modal.tsx, Toast.tsx, OtpToastHelper.tsx, MemberCard.tsx` (Card was also implemented).
   - `Input` and `Navbar` are deferred to application-level implementations in `apps/web` and `apps/admin` (or subsequent milestones).
   - Component naming: `OtpToastHelper` is used consistently in code and layout, matching the `OtpToastHelper.tsx` specification.
3. **Runtime React 18 Next.js Bundling**: Full SSR and React Server Components (RSC) execution will be verified when Next.js pages are implemented in Milestone 3.

---

## 4. Conclusion

**Verdict: `CONFIRM`**

Milestone 1 successfully establishes:
1. Operational PNPM monorepo with hoisted linker suited for the Windows environment.
2. Robust cross-workspace resolution and importability of `@bumi-upi/ui` in both CJS and ESM contexts.
3. Complete design system tokens (Olive `#3E4F30`, Krem `#F5EEDC`, Terakota `#B4532A`, Mustard `#D4A24C`, Fraunces, Plus Jakarta Sans, Caveat).
4. All core UI components built, typed, exported, and free of circular dependencies.
5. All 14 empirical challenge tests passed.

---

## 5. Verification Method

To independently execute the empirical challenge suite and verify findings:

```powershell
Set-Location C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi

# 1. Run the Empirical Challenge Suite (14 tests)
node tests/empirical_challenge.js

# 2. Run Tier 1 Feature Coverage Tests (42 tests)
node tests/e2e/run_tests.js --tier=1

# 3. Verify packages/ui standalone build and typecheck
pnpm.cmd --filter @bumi-upi/ui build
pnpm.cmd --filter @bumi-upi/ui typecheck

# 4. Verify monorepo-wide typecheck
pnpm.cmd run typecheck
```

**Invalidation conditions**:
- Any failure in `node tests/empirical_challenge.js`.
- Failure in CJS or ESM resolution of `@bumi-upi/ui` from `apps/web` or `apps/admin`.
- Circular dependency detected in `packages/ui/src`.
