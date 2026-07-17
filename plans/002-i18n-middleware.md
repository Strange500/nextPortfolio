# Plan 002: Refactor i18n to server-side middleware

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 20775be..HEAD -- app/page.tsx app/layout.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `20775be`, 2026-07-17
- **Issue**: https://github.com/Strange500/nextPortfolio/issues/18

## Why this matters

The root page (`app/page.tsx`) uses a client-side `useEffect` to redirect users to `/en` or `/fr`. This causes a flicker, hurts SEO, and slows down initial load time. Furthermore, `app/layout.tsx` is located at the root and injects a script tag to dynamically change `document.documentElement.lang`, which is an anti-pattern that causes hydration warnings and accessibility issues. Moving i18n resolution to Next.js Middleware and moving the layout into `[lang]` properly fixes these issues.

## Current state

- `app/page.tsx` — Redirects on client:
  ```tsx
  useEffect(() => {
    const isFrench = navigator.languages ? navigator.languages.some(lang => lang.startsWith('fr')) : navigator.language.startsWith('fr')
    if (isFrench) { router.replace('/fr') } else { router.replace('/en') }
  }, [router])
  ```
- `app/layout.tsx` — Injects script:
  ```tsx
  <script dangerouslySetInnerHTML={{ __html: `
    try {
      if (window.location.pathname.startsWith('/fr')) {
        document.documentElement.lang = 'fr';
      }
    } catch (e) {}
  `}} />
  ```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Build     | `npm run build`          | exit 0              |
| Typecheck | `npx tsc --noEmit`       | exit 0, no errors   |

## Scope

**In scope**:
- `middleware.ts` (create)
- `app/layout.tsx` (move to `app/[lang]/layout.tsx` and modify)
- `app/page.tsx` (remove or replace)

**Out of scope**:
- Rewriting content within `app/[lang]/page.tsx`

## Git workflow

- Branch: `advisor/002-i18n-middleware`
- Commit message: `refactor: move i18n redirect to middleware and layout to [lang]`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create Middleware

Create `middleware.ts` in the project root. It should check the `Accept-Language` header (or a cookie) and rewrite or redirect the root `/` to `/en` or `/fr`. Follow Next.js documentation for basic i18n middleware.

**Verify**: `npx tsc --noEmit` → passes.

### Step 2: Move Layout and Inject Lang

Move `app/layout.tsx` to `app/[lang]/layout.tsx`. Update the layout to receive `{ params }` so it can extract `lang` from the URL, and apply it to `<html lang={params.lang}>`. Remove the `dangerouslySetInnerHTML` script block entirely.

**Verify**: File moved successfully and `npx tsc --noEmit` passes.

### Step 3: Remove client-side redirect

Delete `app/page.tsx` completely (or leave a basic server-side redirect if middleware only rewrites). Let middleware handle the root route `/` to `/[lang]`.

**Verify**: `npm run build` → succeeds without missing page errors.

## Test plan

- No test suite exists.
- Verification: The Next.js build succeeds, and `npx tsc --noEmit` passes.

## Done criteria

- [ ] `middleware.ts` exists and handles i18n routing.
- [ ] `app/layout.tsx` is moved to `app/[lang]/layout.tsx`.
- [ ] `<html>` tag uses the `lang` param from props instead of a `<script>`.
- [ ] `app/page.tsx` is removed or no longer uses `useEffect` for redirection.
- [ ] `npx tsc --noEmit` exits 0.

## STOP conditions

Stop and report back (do not improvise) if:
- Moving the layout breaks Next.js static export (`output: 'export'`) in a way that requires architectural changes (static exports often conflict with middleware). Note: If `output: 'export'` is strictly required, middleware won't work in Next.js statically exported sites! (If true, report this immediately).

## Maintenance notes

- If `output: 'export'` is strictly required (which it seems it is from `next.config.ts`), Next.js Middleware *is not supported*. The executor must verify this in Step 1. If unsupported, the fix might instead require `generateStaticParams` for `[lang]` and keeping `app/page.tsx` as a purely static HTML meta-refresh or maintaining the client redirect but making it cleaner.
