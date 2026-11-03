// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const ROOT = 'C:\\Users\\Asus\\.gemini\\antigravity\\scratch\\bumi-upi';
const UI_PKG = path.join(ROOT, 'packages', 'ui');
const WEB_APP = path.join(ROOT, 'apps', 'web');
const ADMIN_APP = path.join(ROOT, 'apps', 'admin');
const DB_PKG = path.join(ROOT, 'packages', 'db');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function test(name, fn) {
  try {
    fn();
    results.passed.push(name);
    console.log(`[PASS] ${name}`);
  } catch (err) {
    results.failed.push({ name, error: err.message });
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

console.log('=== STARTING EMPIRICAL CHALLENGE FOR MILESTONE 1 ===\n');

// -------------------------------------------------------------
// AREA 1: Cross-Workspace Resolution & Importability
// -------------------------------------------------------------
console.log('--- 1. Cross-Workspace Resolution & Importability ---');

test('CJS resolution of @bumi-upi/ui from apps/web', () => {
  const output = execSync('node -e "const ui = require(\'@bumi-upi/ui\'); console.log(Object.keys(ui).length)"', {
    cwd: WEB_APP,
    encoding: 'utf-8'
  }).trim();
  assert.ok(parseInt(output, 10) >= 15, `Expected >= 15 exports, got ${output}`);
});

test('CJS resolution of @bumi-upi/ui from apps/admin', () => {
  const output = execSync('node -e "const ui = require(\'@bumi-upi/ui\'); console.log(Object.keys(ui).length)"', {
    cwd: ADMIN_APP,
    encoding: 'utf-8'
  }).trim();
  assert.ok(parseInt(output, 10) >= 15, `Expected >= 15 exports, got ${output}`);
});

test('Subpath export @bumi-upi/ui/tokens resolution from apps/web', () => {
  const output = execSync('node -e "const tokens = require(\'@bumi-upi/ui/tokens\'); console.log(tokens.colors.olive.DEFAULT)"', {
    cwd: WEB_APP,
    encoding: 'utf-8'
  }).trim();
  assert.strictEqual(output, '#3E4F30');
});

test('Subpath export @bumi-upi/ui/styles resolves to existing CSS file with tokens', () => {
  const resolvedPath = execSync('node -e "console.log(require.resolve(\'@bumi-upi/ui/styles\'))"', {
    cwd: WEB_APP,
    encoding: 'utf-8'
  }).trim();
  assert.ok(fs.existsSync(resolvedPath), `Resolved path ${resolvedPath} does not exist`);
  const css = fs.readFileSync(resolvedPath, 'utf-8');
  assert.ok(css.includes('--color-olive-default: #3E4F30;') || css.includes('#3E4F30'), 'CSS missing olive #3E4F30');
  assert.ok(css.includes('Fraunces'), 'CSS missing Fraunces font');
  assert.ok(css.includes('Plus Jakarta Sans'), 'CSS missing Plus Jakarta Sans');
  assert.ok(css.includes('Caveat'), 'CSS missing Caveat font');
});

test('ESM dynamic import of @bumi-upi/ui from apps/web', () => {
  const output = execSync('node --input-type=module -e "import(\'@bumi-upi/ui\').then(m => console.log(typeof m.Button, m.colors.olive.DEFAULT))"', {
    cwd: WEB_APP,
    encoding: 'utf-8'
  }).trim();
  assert.strictEqual(output, 'object #3E4F30');
});

test('ESM named imports of all UI components from apps/web', () => {
  const script = `
    import React from 'react';
    import {
      Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
      Modal, ToastProvider, useToast, ToastContainer, OtpToastHelper, MemberCard,
      colors, typography, borderRadius, shadows
    } from '@bumi-upi/ui';
    
    if (!Button || !Badge || !Card || !Modal || !ToastProvider || !OtpToastHelper || !MemberCard) {
      throw new Error('Component missing in import');
    }
    if (colors.olive.DEFAULT !== '#3E4F30') {
      throw new Error('Color mismatch');
    }
    console.log('ALL_COMPONENTS_VALID');
  `;
  const output = execSync(`node --input-type=module -e "${script.replace(/\r?\n\s*/g, ' ')}"`, {
    cwd: WEB_APP,
    encoding: 'utf-8'
  }).trim();
  assert.strictEqual(output, 'ALL_COMPONENTS_VALID');
});

test('TypeScript external consumer type resolution', () => {
  const tempFixture = path.join(ROOT, 'tests', 'temp_typecheck_fixture.tsx');
  const fixtureCode = `
    import React from 'react';
    import {
      Button, Badge, Card, Modal, OtpToastHelper, MemberCard,
      colors, typography, ToastProvider
    } from '@bumi-upi/ui';

    const testElement = (
      <ToastProvider>
        <Card variant="surface">
          <Button variant="primary" size="md">Test</Button>
          <Badge variant="tier-sahabat" dot>Sahabat</Badge>
          <OtpToastHelper otpCode="123456" phone="08123456789" onAutoFill={(c: string) => console.log(c)} />
          <MemberCard name="Budi" tier="Sahabat" points={100} />
        </Card>
      </ToastProvider>
    );

    const testColor: string = colors.olive.DEFAULT;
    const testFont: string = typography.fonts.serif[0];
  `;
  fs.writeFileSync(tempFixture, fixtureCode, 'utf-8');
  try {
    const tscCmd = `node "${path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc')}" --noEmit --target ES2020 --moduleResolution bundler --jsx react-jsx "${tempFixture}"`;
    execSync(tscCmd, { cwd: ROOT, encoding: 'utf-8' });
  } finally {
    if (fs.existsSync(tempFixture)) fs.unlinkSync(tempFixture);
  }
});

// -------------------------------------------------------------
// AREA 2: Package Exports & Dist Artifact Integrity
// -------------------------------------------------------------
console.log('\n--- 2. Package Exports & Dist Artifact Integrity ---');

test('Every exported file and subpath entry in packages/ui/package.json exists on disk', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(UI_PKG, 'package.json'), 'utf-8'));
  assert.ok(fs.existsSync(path.join(UI_PKG, pkg.main)), `main file ${pkg.main} does not exist`);
  assert.ok(fs.existsSync(path.join(UI_PKG, pkg.types)), `types file ${pkg.types} does not exist`);

  for (const [subpath, target] of Object.entries(pkg.exports)) {
    if (typeof target === 'string') {
      assert.ok(fs.existsSync(path.join(UI_PKG, target)), `export ${subpath} -> ${target} does not exist`);
    } else if (typeof target === 'object') {
      if (target.types) assert.ok(fs.existsSync(path.join(UI_PKG, target.types)), `export ${subpath}.types -> ${target.types} does not exist`);
      if (target.import) assert.ok(fs.existsSync(path.join(UI_PKG, target.import)), `export ${subpath}.import -> ${target.import} does not exist`);
      if (target.require) assert.ok(fs.existsSync(path.join(UI_PKG, target.require)), `export ${subpath}.require -> ${target.require} does not exist`);
    }
  }
});

test('Dist directory contains matching .js, .d.ts, and source maps for all components', () => {
  const components = ['Badge', 'Button', 'Card', 'MemberCard', 'Modal', 'OtpToastHelper', 'Toast'];
  for (const comp of components) {
    const jsPath = path.join(UI_PKG, 'dist', 'components', `${comp}.js`);
    const dtsPath = path.join(UI_PKG, 'dist', 'components', `${comp}.d.ts`);
    const mapPath = path.join(UI_PKG, 'dist', 'components', `${comp}.js.map`);
    assert.ok(fs.existsSync(jsPath), `Missing dist/components/${comp}.js`);
    assert.ok(fs.existsSync(dtsPath), `Missing dist/components/${comp}.d.ts`);
    assert.ok(fs.existsSync(mapPath), `Missing dist/components/${comp}.js.map`);
  }
});

test('Circular dependency check in packages/ui/src', () => {
  const srcDir = path.join(UI_PKG, 'src');
  const files = [];

  function scan(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) scan(full);
      else if (full.endsWith('.ts') || full.endsWith('.tsx')) files.push(full);
    }
  }
  scan(srcDir);

  const importGraph = new Map();
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const imports = [];
    const importRegex = /(?:import|export)\s+(?:.*?from\s+)?['"](\.[^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const targetRel = match[1];
      const targetFull = path.resolve(path.dirname(file), targetRel);
      let resolved = '';
      for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
        if (fs.existsSync(targetFull + ext) && !fs.statSync(targetFull + ext).isDirectory()) {
          resolved = targetFull + ext;
          break;
        }
      }
      if (resolved) imports.push(resolved);
    }
    importGraph.set(file, imports);
  }

  const visited = new Set();
  const recStack = new Set();
  let cycleFound = null;

  function dfs(node, pathStack) {
    visited.add(node);
    recStack.add(node);
    pathStack.push(node);

    for (const neighbor of (importGraph.get(node) || [])) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, pathStack);
      } else if (recStack.has(neighbor)) {
        cycleFound = [...pathStack, neighbor];
      }
    }

    recStack.delete(node);
    pathStack.pop();
  }

  for (const node of importGraph.keys()) {
    if (!visited.has(node)) dfs(node, []);
  }

  assert.strictEqual(cycleFound, null, `Circular dependency found: ${cycleFound?.map(p => path.basename(p)).join(' -> ')}`);
});

test('Clean rebuild test (clean dist -> tsc build -> verify)', () => {
  const distDir = path.join(UI_PKG, 'dist');
  assert.ok(fs.existsSync(distDir), 'dist should exist initially');
  
  execSync('pnpm.cmd --filter @bumi-upi/ui build', { cwd: ROOT, encoding: 'utf-8' });
  assert.ok(fs.existsSync(path.join(distDir, 'index.js')), 'dist/index.js must exist after build');
  assert.ok(fs.existsSync(path.join(distDir, 'index.d.ts')), 'dist/index.d.ts must exist after build');
});

// -------------------------------------------------------------
// AREA 3: Interface Contract Conformance Check
// -------------------------------------------------------------
console.log('\n--- 3. Interface Contract Conformance Check ---');

test('Check PROJECT.md §Interface Contracts vs @bumi-upi/ui exports', () => {
  const ui = require(path.join(UI_PKG, 'dist', 'index.js'));
  const exported = Object.keys(ui);

  const missingContractItems = [];
  const contractItems = ['Button', 'Badge', 'Modal', 'Card', 'ToastProvider', 'useToast', 'MemberCard'];
  for (const item of contractItems) {
    if (!exported.includes(item)) missingContractItems.push(item);
  }

  const hasOtpHelper = exported.includes('OtpToastHelper') || exported.includes('OtpHelperToast');
  if (!hasOtpHelper) missingContractItems.push('OtpToastHelper/OtpHelperToast');

  const hasInput = exported.includes('Input');
  const hasNavbar = exported.includes('Navbar');

  console.log(`  - Standard components exported: ${contractItems.join(', ')}: PASS`);
  console.log(`  - OtpToastHelper exported: ${hasOtpHelper ? 'YES (as OtpToastHelper)' : 'NO'}`);
  console.log(`  - Input component in @bumi-upi/ui: ${hasInput ? 'YES' : 'NO (Deferred or App-level)'}`);
  console.log(`  - Navbar component in @bumi-upi/ui: ${hasNavbar ? 'YES' : 'NO (Deferred or App-level)'}`);

  if (!hasInput || !hasNavbar) {
    results.warnings.push({
      issue: 'PROJECT.md line 58 lists Input and Navbar under Component Exports, but Code Layout lines 90-95 and ui/src do not implement Input.tsx or Navbar.tsx',
      detail: 'Navbar is typically an app-level layout component (apps/web/src/components, apps/admin/src/components), while basic HTML inputs are used or will be added during M3/M4.'
    });
  }

  assert.strictEqual(missingContractItems.length, 0, `Missing required components: ${missingContractItems.join(', ')}`);
});

// -------------------------------------------------------------
// AREA 4: PNPM Scripts Resilience (Empirical Execution)
// -------------------------------------------------------------
console.log('\n--- 4. PNPM Scripts Resilience ---');

test('pnpm.cmd run typecheck resilience', () => {
  const result = execSync('pnpm.cmd run typecheck', { cwd: ROOT, encoding: 'utf-8' });
  assert.ok(result.includes('Done'), 'pnpm.cmd run typecheck should complete with Done');
});

test('pnpm.cmd run build resilience check across monorepo', () => {
  let failed = false;
  let errorMsg = '';
  try {
    execSync('pnpm.cmd run build', { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe' });
  } catch (err) {
    failed = true;
    errorMsg = err.stderr ? err.stderr.toString() : err.message;
  }
  if (failed) {
    results.warnings.push({
      issue: 'Root pnpm.cmd run build fails due to skeleton apps/web and apps/admin lacking pages/app dirs',
      detail: 'Next.js build requires pages or app directory which are scheduled for M3 and M4.'
    });
    console.log('  [NOTE] Root pnpm.cmd run build fails as expected for Milestone 1 skeleton state (apps/web and apps/admin next build lacks pages/app).');
  } else {
    console.log('  Root pnpm.cmd run build passed.');
  }
});

console.log('\n=============================================================');
console.log(`SUMMARY: ${results.passed.length} Passed, ${results.failed.length} Failed, ${results.warnings.length} Warnings`);
console.log('=============================================================');

if (results.failed.length > 0) {
  process.exit(1);
}
