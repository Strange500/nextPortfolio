# Plan 004: Standardize package manager lockfiles

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 20775be..HEAD -- package-lock.json pnpm-lock.yaml pnpm-workspace.yaml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `20775be`, 2026-07-17
- **Issue**: https://github.com/Strange500/nextPortfolio/issues/20

## Why this matters

The repository contains both `package-lock.json` and `pnpm-lock.yaml` (plus `pnpm-workspace.yaml`). This split-brain state confuses continuous integration, editor integrations, and new contributors. Since the `README.md` explicitly documents using `npm install`, standardizing on npm by removing pnpm artifacts resolves the ambiguity.

## Current state

- `package-lock.json` exists.
- `pnpm-lock.yaml` exists.
- `pnpm-workspace.yaml` exists.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm install`            | exit 0              |
| Check     | `ls pnpm-lock.yaml`      | exit >0 (not found) |

## Scope

**In scope**:
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`

**Out of scope**:
- `package.json`

## Git workflow

- Branch: `advisor/004-standardize-package-manager`
- Commit message: `chore: remove pnpm lockfiles to standardize on npm`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove pnpm files

Delete `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

**Verify**: `ls pnpm-lock.yaml` → No such file or directory.

### Step 2: Ensure npm works

Run `npm install` to ensure the standard lockfile is up to date and nothing is broken.

**Verify**: `npm install` exits 0.

## Test plan

- Verification: `npm run build` succeeds after removal.

## Done criteria

- [ ] `pnpm-lock.yaml` is deleted.
- [ ] `pnpm-workspace.yaml` is deleted.
- [ ] `package-lock.json` remains and works cleanly via `npm install`.

## STOP conditions

Stop and report back (do not improvise) if:
- Deleting `pnpm-workspace.yaml` breaks local dependencies (e.g. `wasm-cube`) that relied on pnpm workspaces. If `npm install` fails after removal because of workspaces, STOP and report. (Note: `npm` has its own workspaces, so verify it works).

## Maintenance notes

- Do not use `pnpm install` in this repository to prevent the lockfile from returning.
