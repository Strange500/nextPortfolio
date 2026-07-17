# Plan 001: Upgrade Next.js to address critical vulnerabilities

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 20775be..HEAD -- package.json pnpm-lock.yaml package-lock.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `20775be`, 2026-07-17
- **Issue**: https://github.com/Strange500/nextPortfolio/issues/17

## Why this matters

The repository is currently pinned to `next@15.1.2`, which has known critical vulnerabilities including DoS and cache poisoning (CVE-2025-66478). Other dependencies like `glob` and `picomatch` also have vulnerabilities. Upgrading them resolves the security advisories and ensures the application is running safely.

## Current state

- `package.json` — The main dependency list.
- `package.json:23`: `"next": "15.1.2",`

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Audit     | `npm audit`              | Zero critical/high vulnerabilities for production code |
| Install   | `npm install`            | exit 0              |
| Typecheck | `npx tsc --noEmit`       | exit 0, no errors   |

## Scope

**In scope**:
- `package.json`
- `package-lock.json`
- `pnpm-lock.yaml` (if present, to remove or update)

**Out of scope**:
- Changing any application code in `app/` or `components/`.

## Git workflow

- Branch: `advisor/001-upgrade-nextjs-security`
- Commit message: `chore: update next.js to fix security vulnerabilities`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Update Next.js

Run `npm install next@latest` to upgrade next to the latest stable version and update the `package.json`.
Alternatively, `npm audit fix` may upgrade it if possible.

**Verify**: `npm list next` → displays a version without critical CVEs (e.g. >= 15.1.3 or 16.x).

### Step 2: Fix remaining vulnerabilities

Run `npm audit fix` to resolve other transitive vulnerabilities (like `glob` and `picomatch`).

**Verify**: `npm audit --omit=dev` → 0 vulnerabilities.

## Test plan

- No new tests needed, but the application must still build and typecheck.
- Verification: `npx tsc --noEmit` → passes.

## Done criteria

- [ ] `package.json` reflects the updated `next` version.
- [ ] `npm audit --omit=dev` shows 0 critical/high vulnerabilities.
- [ ] No files outside the in-scope list are modified (`git status`).
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back (do not improvise) if:
- `npm audit fix` introduces breaking changes requiring code modifications.
- The build or typecheck fails after upgrading Next.js.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- Security updates should be run regularly via `npm audit` or Dependabot.
