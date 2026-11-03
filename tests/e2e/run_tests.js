#!/usr/bin/env node
/**
 * Unified E2E Test Suite Runner for Bumi Upi Monorepo
 * Executes Tiers 1-4 tests, aggregates metrics, and formats execution reports.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const TIERS = [
  {
    id: 1,
    name: 'Tier 1 — Feature Coverage (Isolation Testing)',
    file: 'tests/e2e/tiers/tier1_features.test.js',
    scope: 'Features F1 - F7 (Monorepo, UI tokens, Migrations, Mock store, 105 Catalog, WhatsApp OTP, Demo Credentials)'
  },
  {
    id: 2,
    name: 'Tier 2 — Boundary & Corner Cases',
    file: 'tests/e2e/tiers/tier2_boundaries.test.js',
    scope: 'Boundaries B1 - B7 (Cart empty/overflow, Phone normalization, OTP invalidation, Stock bounds, Voucher limits, Precision, Idempotency)'
  },
  {
    id: 3,
    name: 'Tier 3 — Cross-Feature Interactions',
    file: 'tests/e2e/tiers/tier3_interactions.test.js',
    scope: 'Multi-Step Chains 1 - 6 (OTP -> Cart -> Voucher -> Order -> Stock -> Struk -> KDS -> Tier Upgrade -> RFM -> Concurrency)'
  },
  {
    id: 4,
    name: 'Tier 4 — Real-World Application Scenarios',
    file: 'tests/e2e/tiers/tier4_application.test.js',
    scope: 'Scenarios 1 - 5 (Table 4 dine-in, POS fast cashier, VIP Sahabat birthday, KDS lifecycle, Offline zero-credential run)'
  }
];

// Parse CLI flags
const args = process.argv.slice(2);
let selectedTier = 'all';
for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    selectedTier = arg.split('=')[1];
  }
}

function runCommand(cmd, cmdArgs, cwd) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const proc = spawn(cmd, cmdArgs, {
      cwd,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      resolve({
        code,
        duration: Date.now() - startTime,
        stdout,
        stderr
      });
    });
  });
}

function parseTestCounts(output) {
  let pass = 0;
  let fail = 0;
  let total = 0;

  const passMatch = output.match(/ℹ pass (\d+)/);
  if (passMatch) pass = parseInt(passMatch[1], 10);

  const failMatch = output.match(/ℹ fail (\d+)/);
  if (failMatch) fail = parseInt(failMatch[1], 10);

  const totalMatch = output.match(/ℹ tests (\d+)/);
  if (totalMatch) total = parseInt(totalMatch[1], 10);

  return { pass, fail, total: total || (pass + fail) };
}

async function main() {
  console.log('\n======================================================================');
  console.log('🌿 BUMI UPI — DUAL TRACK E2E TEST RUNNER (TIERS 1 - 4)');
  console.log('======================================================================');
  console.log(`Directory : ${PROJECT_ROOT}`);
  console.log(`Node.js   : ${process.version}`);
  console.log(`Target    : ${selectedTier === 'all' ? 'All Tiers (1 to 4)' : `Tier ${selectedTier}`}`);
  console.log('----------------------------------------------------------------------\n');

  const tiersToRun = selectedTier === 'all'
    ? TIERS
    : TIERS.filter(t => String(t.id) === selectedTier);

  if (tiersToRun.length === 0) {
    console.error(`Error: Unknown tier "${selectedTier}". Valid options: 1, 2, 3, 4, all`);
    process.exit(1);
  }

  const results = [];
  let totalOverallPass = 0;
  let totalOverallFail = 0;
  let totalOverallTests = 0;
  let allSuccess = true;

  for (const tier of tiersToRun) {
    process.stdout.write(`⏳ Running ${tier.name}... `);
    const runRes = await runCommand('node', ['--test', tier.file], PROJECT_ROOT);

    const counts = parseTestCounts(runRes.stdout + runRes.stderr);
    const passed = runRes.code === 0 && counts.fail === 0;

    if (!passed) allSuccess = false;
    totalOverallPass += counts.pass;
    totalOverallFail += counts.fail;
    totalOverallTests += counts.total;

    results.push({
      tier: tier.id,
      name: tier.name,
      file: tier.file,
      passed,
      counts,
      duration: runRes.duration,
      output: runRes.stdout + runRes.stderr
    });

    if (passed) {
      console.log(`\x1b[32mPASSED\x1b[0m (${counts.pass}/${counts.total} tests in ${runRes.duration}ms)`);
    } else {
      console.log(`\x1b[31mFAILED\x1b[0m (${counts.fail} failed in ${runRes.duration}ms)`);
      console.log('--- Error Details ---');
      console.log(runRes.stderr || runRes.stdout);
      console.log('---------------------');
    }
  }

  // Print Summary Table
  console.log('\n======================================================================');
  console.log('📊 TEST EXECUTION SUMMARY REPORT');
  console.log('======================================================================');
  console.log('| Tier | Tier Description                       | Passed | Failed | Total | Status | Time   |');
  console.log('|------|----------------------------------------|--------|--------|-------|--------|--------|');

  for (const r of results) {
    const tierTag = `T${r.tier}`.padEnd(4, ' ');
    const desc = r.name.slice(0, 38).padEnd(38, ' ');
    const pStr = String(r.counts.pass).padStart(6, ' ');
    const fStr = String(r.counts.fail).padStart(6, ' ');
    const tStr = String(r.counts.total).padStart(5, ' ');
    const status = r.passed ? '\x1b[32mPASS\x1b[0m  ' : '\x1b[31mFAIL\x1b[0m  ';
    const time = `${r.duration}ms`.padEnd(6, ' ');
    console.log(`| ${tierTag} | ${desc} | ${pStr} | ${fStr} | ${tStr} | ${status} | ${time} |`);
  }

  console.log('----------------------------------------------------------------------');
  console.log(`Total Test Cases Executed : ${totalOverallTests}`);
  console.log(`Total Passed              : \x1b[32m${totalOverallPass}\x1b[0m`);
  console.log(`Total Failed              : ${totalOverallFail > 0 ? `\x1b[31m${totalOverallFail}\x1b[0m` : '0'}`);
  console.log(`Success Rate              : ${totalOverallTests > 0 ? ((totalOverallPass / totalOverallTests) * 100).toFixed(1) : 0}%`);
  console.log('======================================================================\n');

  if (!allSuccess) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Runner Error:', err);
  process.exit(1);
});
