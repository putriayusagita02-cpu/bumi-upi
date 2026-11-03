# Dispatch — Worker M1: Monorepo Foundation & Shared UI

## Mandatory References
- Read `ORIGINAL_REQUEST.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md`
- Read `PROJECT.md`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\PROJECT.md`
- Read `survey_report.md` from `explorer_survey_2`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_survey_2\survey_report.md`
- Read `survey_report.md` from `explorer_survey_3`: `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_survey_3\survey_report.md`

## Write Ownership (Exclusive)
You exclusively own:
- `pnpm-workspace.yaml`
- Root `package.json` (monorepo scripts: `build`, `dev`, `test`, `lint`)
- `packages/ui/*` (all files in `packages/ui/`)
- Directory skeletons for `packages/db`, `apps/web`, `apps/admin`
DO NOT write to `tests/e2e/` (owned by test writer) or `.agents/teamwork/` outside your own folder.

## Task Description
1. **Tooling & Monorepo Setup**:
   - Check pnpm. If not installed, install globally: `& "C:\Program Files\nodejs\npm.cmd" install -g pnpm`. Note: On PowerShell, run with `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` or execute `.cmd` wrappers (`pnpm.cmd`, `npm.cmd`).
   - Create root `pnpm-workspace.yaml` declaring packages:
     ```yaml
     packages:
       - 'apps/*'
       - 'packages/*'
     ```
   - Update root `package.json` for monorepo workspaces with standard scripts.
2. **Build `packages/ui`**:
   - Create `packages/ui/package.json` (name: `@bumi-upi/ui`, version: `0.1.0`, main/exports, dependencies: `react`, `react-dom`, `lucide-react` or SVG icons).
   - Create `packages/ui/tsconfig.json`.
   - Implement design tokens for "Rumah Nenek Sunda":
     - Colors: Hijau Olive (`#3E4F30`), Krem Kertas (`#F5EEDC`), Terakota (`#B4532A`), Mustard (`#D4A24C`), Hitam Kopi (`#2B2625`).
     - Typography: Fraunces (serif heading), Plus Jakarta Sans (clean UI sans), Caveat (handwritten accent).
   - Implement core reusable components:
     - `Button.tsx` (variants: primary olive, secondary terakota, outline, ghost)
     - `Badge.tsx` (variants: olive, terakota, mustard, status badges)
     - `Card.tsx`
     - `Modal.tsx`
     - `Toast.tsx` & `ToastContext`
     - `OtpToastHelper.tsx` (Toast helper with auto-fill button for WhatsApp OTP console mode)
     - `MemberCard.tsx` (digital heritage membership card showing tier, points, QR code mockup)
     - `index.ts` exporting all components and tokens.
3. **Verification**:
   - Run typecheck or build for `packages/ui` using pnpm (`pnpm.cmd --filter @bumi-upi/ui build` or tsc / package validation).
   - Document commands executed and results in your `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.


## 2026-11-01T01:02:55Z
[Message] timestamp=2026-11-01T01:02:55Z sender=84903406-8a88-4b8e-8505-db2987cdbaca priority=MESSAGE_PRIORITY_HIGH content=You are worker_m1.
Your working directory is: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\worker_m1\
Read the original request file at: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\ORIGINAL_REQUEST.md
Read the project architecture file at: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\PROJECT.md
Read your assignment in: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\worker_m1\DISPATCH.md
Read survey report: C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\explorer_survey_2\survey_report.md

Your exclusive write ownership:
- pnpm-workspace.yaml
- Root package.json
- packages/ui/*
- Directory skeletons for packages/db, apps/web, apps/admin

Your task is to implement Milestone 1:
1. Tooling & Monorepo Setup (pnpm check/install, pnpm-workspace.yaml, root package.json)
2. Build packages/ui: package.json (@bumi-upi/ui), tsconfig.json, design tokens (Hijau Olive, Krem, Terakota, Mustard), components (Button, Badge, Card, Modal, Toast, OtpToastHelper, MemberCard, index.ts).
3. Verify build / typecheck using pnpm.cmd.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Document your commands, files created, and test results in handoff.md in your working directory.
When done, send a message to parent with summary and file reference.


## 2026-11-01T01:13:16Z
[Message] timestamp=2026-11-01T01:13:16Z sender=84903406-8a88-4b8e-8505-db2987cdbaca priority=MESSAGE_PRIORITY_HIGH content=**Context**: Status check worker_m1
**Content**: Bagaimana status verifikasi pnpm install dan build typecheck untuk packages/ui?
**Action**: Mohon update status di progress.md dan buat handoff.md jika telah selesai.

## 2026-11-01T01:16:08Z
[Message] timestamp=2026-11-01T01:16:08Z sender=84903406-8a88-4b8e-8505-db2987cdbaca priority=MESSAGE_PRIORITY_HIGH content=**Context**: Penyelesaian Milestone 1
**Content**: Berkas `packages/ui` dan konfigurasi monorepo sudah terverifikasi lengkap di disk (`pnpm-workspace.yaml`, tokens, Button, Badge, Modal, Toast, OtpToastHelper, MemberCard, index.ts).
**Action**: Silakan segera tuliskan laporan verifikasi ke `handoff.md` di direktori kerjamu dan kirim pesan handoff selesai ke parent.
