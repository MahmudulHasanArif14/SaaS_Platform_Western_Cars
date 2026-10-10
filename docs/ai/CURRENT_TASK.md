# CURRENT TASK

## Stage

Phase 1 — T-103: Security headers + CSP nonce, `poweredByHeader:false`, no browser source maps (SEC-D03, SEC-D06)

## Status

IMPLEMENTED, locally verified — NOT yet COMPLETED (2026-10-11).

Acceptance criterion ("header test passes") passes locally. Not complete because the work is uncommitted on
`feature/t-103-security-headers` and CI has not run on GitHub.

Previous tasks: T-100 COMPLETED (PR #1, `3c6b99c`). T-101 COMPLETED (PR #5, `e65fc07`). T-102 COMPLETED (PR #6,
`298f468`; CI runs 38092060412 on the PR and 38092152082 on `main` green, both jobs).

## Scope delivered

| Item | Evidence |
|---|---|
| CSP and static header builders (pure, unit tested) | `src/lib/security/headers.ts` |
| Per-request nonce + `Content-Security-Policy` on every non-static request | `src/proxy.ts` |
| HSTS, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options on every response | `next.config.ts` `headers()` |
| `poweredByHeader: false`, `productionBrowserSourceMaps: false` | `next.config.ts` |
| Nonce passed to `next-themes` (ISSUE-008) and to Radix's scroll-lock style | `src/app/layout.tsx`, `src/components/{theme-provider,style-nonce}.tsx` |
| Preview routes blocked in the proxy in production (ISSUE-009) | `src/proxy.ts`, `src/lib/preview-routes.ts` |
| Every E2E test fails on any CSP violation | `tests/e2e/fixtures.ts` |

## Policy (production build)

```text
default-src 'self'; script-src 'self' 'nonce-…' 'strict-dynamic'; style-src 'self' 'nonce-…';
style-src-elem 'self' 'nonce-…' <2 sonner hashes>; style-src-attr 'unsafe-inline'; img-src 'self' blob: data:;
font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';
frame-ancestors 'none'; upgrade-insecure-requests (staging / production only)
```

`next dev` only: `'unsafe-eval'` for scripts and `style-src 'self' 'unsafe-inline'`.
Deviations from a fully strict policy are recorded in `DECISIONS.md` (2026-10-11).

## Consequences to know about

- Every route is now rendered per request (`ƒ` in the build output). No route is static (ISSUE-010).
- `notFound()` in a layout answers HTTP 200 on a streamed route. Access decisions that need a status code or
  must keep content out of the response belong in `src/proxy.ts` (ISSUE-009). Relevant to T-104.
- Supabase, Stripe, Sentry and any other third-party origin must be added to `connect-src` / `img-src` /
  `frame-src` with the module that needs it. Today the policy allows same-origin only.

## Checks run locally (2026-10-11, `298f468` + working tree, Node v22.23.3)

| Check | Result |
|---|---|
| `npm run format:check` · `lint` · `typecheck` | PASS |
| `npm test` | PASS — 5 files, 47 tests |
| `npm run build` | PASS — 6 routes, all dynamic, proxy active |
| `npm run test:e2e` | PASS — 40 tests (11 new header tests; the 29 existing tests now also assert 0 CSP violations) |
| `npm run check:bundle` | PASS — 37 files |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| Production build (`APP_ENV=production`, fake test values), `curl` | `/` 200 with all headers and `upgrade-insecure-requests`; `/design-system`, `/design-system/data-table`, `/Design-System`, `/design%2Dsystem`, `/design-system%2Fstates` 404 with no page content; same with `RSC`, `next-router-prefetch` and `purpose: prefetch` request headers; 0 `.map` files in `.next/static` |
| `next dev` | 3 pages + confirm dialog loaded in Chromium, 0 CSP violations |
| GitHub Actions | NOT RUN — not pushed |

Not verified: browsers other than Chromium (Safari < 15.4 and Firefox < 108 ignore `style-src-elem` /
`style-src-attr` and fall back to the stricter `style-src`), securityheaders.com (no deployed URL), behaviour
behind a CDN or on Vercel.

## Remaining to mark COMPLETED

1. Commit, push, PR; confirm CI green. Needs owner go-ahead.

## Open items

- ISSUE-007 (border contrast), ISSUE-009, ISSUE-010 — see `KNOWN_ISSUES.md`.
- No CSP violation reporting endpoint (`report-to`); add with monitoring.
- HSTS is sent with `preload` as TRD §12 specifies. Do not submit the domain to the preload list until every
  subdomain is confirmed https-only.
- Dependabot PRs #2–#4 open (owner to review): `typescript` 7.0.2 — CI fails; `eslint` 10.12.0 — CI passes;
  `@types/node` 26.6.4 — conflicts with the Node 22 pin.
- `.claude/settings.json` still allowlists `pnpm …` (ISSUE-004b).
- No production/staging environment exists; `APP_ENV` must be set there when one is created.
- ADR-002..008 `Decision: PENDING`. `docs/ai/COST_MATRIX.md` missing (ISSUE-006).

## Recommended next task (NOT STARTED — requires explicit instruction)

**T-104** — Supabase clients (`server`, `client`, `admin`), session refresh proxy, login/logout/reset pages.
Satisfies TR-020, SEC-C03. Done when: E2E login; no tokens in storage. Needs the Supabase CLI installed locally
(KNOWN_ISSUES §20), Supabase origins added to the CSP, and the session refresh merged into the existing
`src/proxy.ts`.

## Do NOT implement yet

Domain CRUD · DNS · Hosting · Payments · Stripe · Dojo · CRM · Staff chat · WebRTC · HR · Salary.
