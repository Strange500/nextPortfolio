# Plan 003: Implement PROJECTS_FILE_PATH overrides

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 20775be..HEAD -- lib/loadProjects.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `20775be`, 2026-07-17
- **Issue**: https://github.com/Strange500/nextPortfolio/issues/19

## Why this matters

The `README.md` clearly advertises that users can use a custom projects JSON file by passing `PROJECTS_FILE_PATH=...` to the build. However, `lib/loadProjects.ts` currently imports `data/projects.json` statically. When users attempt to follow the documentation, it silently fails to use their data. This aligns the implementation with the documented intent.

## Current state

- `lib/loadProjects.ts` — Statically loads files:
  ```ts
  import enProjects from '@/data/projects.json';
  import frProjects from '@/data/projects_fr.json';

  export async function loadProjects(lang: string = 'en'): Promise<Project[]> {
    return (lang === 'fr' ? frProjects : enProjects) as Project[];
  }
  ```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Build     | `npm run build`          | exit 0              |
| Typecheck | `npx tsc --noEmit`       | exit 0, no errors   |

## Scope

**In scope**:
- `lib/loadProjects.ts`

**Out of scope**:
- Any other files.

## Git workflow

- Branch: `advisor/003-projects-file-env-var`
- Commit message: `fix: honor PROJECTS_FILE_PATH environment variable as documented`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Read the env var in loadProjects

Modify `lib/loadProjects.ts` to check `process.env.PROJECTS_FILE_PATH`.
If it exists, use `fs.readFileSync` (imported from `fs`) to read and `JSON.parse` the custom file.
If it fails to read or parse, or if it doesn't exist, gracefully fallback to the statically imported JSON data as instructed by the README ("gracefully fall back to the default projects").

**Verify**: `npx tsc --noEmit` → passes.

## Test plan

- No test suite exists.
- Verification: `npm run build` should pass. Setting `PROJECTS_FILE_PATH=./nonexistent.json npm run build` should also pass without crashing.

## Done criteria

- [ ] `lib/loadProjects.ts` reads `process.env.PROJECTS_FILE_PATH` using `fs.readFileSync`.
- [ ] Application falls back gracefully if the path is invalid.
- [ ] `npx tsc --noEmit` exits 0.

## STOP conditions

Stop and report back (do not improvise) if:
- `fs` imports are blocked because `loadProjects.ts` is used in a Client Component. (Next.js server components can use `fs`, but if imported directly in a client component, it will break. Note: it is only imported in server components currently.)

## Maintenance notes

- Since the app is built statically, `PROJECTS_FILE_PATH` only takes effect during `npm run build`.
