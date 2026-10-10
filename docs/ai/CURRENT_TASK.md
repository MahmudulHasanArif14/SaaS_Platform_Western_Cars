# CURRENT TASK

## Stage

Phase 1 — T-104: Supabase clients (`server`, `client`, `admin`), session refresh proxy, login/logout/reset pages
(TR-020, TR-021, SEC-C03)

## Status

IMPLEMENTED — NOT COMPLETED, acceptance criterion NOT yet met (2026-10-11).

Acceptance criterion: "E2E login; no tokens in storage". The E2E tests for it exist but have **never run against a
real Supabase Auth server**: this machine has no Docker, so the local Supabase stack cannot start. They were run
against a throwaway stand-in for the Auth HTTP API (not committed), which exercises this app's code but proves
nothing about Supabase. The first real run will be in CI, which starts the local stack.

Work is uncommitted on `feature/t-104-supabase-auth` (from `main` `9323a46`).

Previous tasks: T-100 (PR #1), T-101 (PR #5), T-102 (PR #6), T-103 (PR #7, `9323a46`) — all COMPLETED, CI green.

## Scope delivered

| Item | Evidence |
|---|---|
| Supabase clients: per-request server client, anonymous browser client, secret-key admin client | `src/lib/supabase/{server,client,admin,config,cookies}.ts` |
| Session refresh in the proxy, merged with the CSP nonce and route decisions | `src/lib/supabase/proxy.ts`, `src/proxy.ts` |
| `getCurrentUser()` / `requireAuth()` from the verified token (`getClaims`) | `src/lib/authorization/index.ts` |
| Auth service + Zod schemas; generic errors (no account enumeration) | `src/modules/auth/*` |
| Pages: `/login`, `/forgot-password`, `/reset-password`, `/account`; `/auth/confirm` route; sign-out action | `src/app/(auth)/**`, `src/app/auth/confirm/route.ts`, `src/app/account/page.tsx` |
| Protected routes redirect in the proxy before rendering (ISSUE-009) and again in the page | `src/lib/routes.ts`, `src/proxy.ts` |
| Safe `next=` redirect (SEC-A07) | `src/lib/security/redirect.ts` |
| Session cookies forced `HttpOnly`, `SameSite=Lax`, `Secure` when deployed | `src/lib/supabase/cookies.ts` |
| Supabase origin added to CSP `connect-src` | `src/lib/security/headers.ts` |
| Local Supabase config: public sign-up off, 12-character minimum, token-hash recovery email | `supabase/config.toml`, `supabase/templates/recovery.html` |
| CI starts the local Supabase stack for the E2E job | `.github/workflows/ci.yml`, `scripts/supabase-local-env.mjs` |
| Form field with 3:1 control border (ISSUE-007); primary button hover contrast fix | `src/components/form-field.tsx`, `src/app/globals.css`, `src/components/ui/button.tsx` |

## Not included

- Sign-up and invitations (FLOW-02: T-105 / T-107). Accounts are created by an administrator in Supabase.
- MFA and step-up (TR-022, TR-023). Membership / disabled-account checks (TR-025) — no tables yet (T-105).
- App-level rate limiting (TR-026): ADR-007 is still PENDING. Only Supabase's own Auth rate limits apply (ISSUE-011).
- Audit log entries for sign-in / sign-out (audit writer is T-106).
- Hosted Supabase project: none exists for this app. Nothing was created or changed in the owner's Supabase account.

## Checks run locally (2026-10-11, `9323a46` + working tree, Node v22.23.3)

| Check | Result |
|---|---|
| `npm run format:check` · `lint` · `typecheck` | PASS |
| `npm test` | PASS — 9 files, 135 tests |
| `npm run build` | PASS — 11 routes, all dynamic, proxy active |
| `npm run test:e2e` (no Supabase configured) | PASS — 52 passed, 7 SKIPPED (the 7 need Supabase Auth); 0 axe and 0 CSP violations |
| Same suite against a stand-in Auth API (scratch script, not Supabase) | 57 passed, 2 skipped (reset-by-email needs the local mailbox; "not configured" does not apply) |
| Token refresh in the proxy, stand-in API with 3-second tokens | Session kept, cookies rotated, `HttpOnly`, `Cache-Control: private, no-store` |
| Production build (`APP_ENV=production`, fake values), `curl` | `/account` 307 to `/login?next=%2Faccount` with no page content, incl. `RSC` / prefetch headers and a forged `alg: none` session cookie; `/design-system` 404; cross-origin Server Action POST rejected; `connect-src` lists the Supabase origin |
| `npm run check:bundle` · `npm audit --omit=dev --audit-level=high` | PASS — 40 files · 0 vulnerabilities |
| Real Supabase Auth (local stack) | NOT RUN — no Docker on this machine |
| GitHub Actions | NOT RUN — not pushed |

Bugs found by the tests and fixed in this task: open redirect through `/..//host` in the `next` guard; Supabase
client reading the clock before the render was tied to a request (`connection()` added); primary button hover
below 4.5:1 in both themes; a toast accessibility check racing the fade-in animation.

## Remaining to mark COMPLETED

1. Run the 7 skipped E2E tests against real Supabase Auth. Either:
   - push and let CI run them (the workflow change is untested — expect at least one iteration), or
   - install Docker Desktop, then `npx supabase start`, `node scripts/supabase-local-env.mjs > .env.local`,
     `npm run test:e2e`.
2. Commit, push, PR; CI green. Needs owner go-ahead.

## Open items

- ISSUE-009 (MITIGATED), ISSUE-010, ISSUE-011, ISSUE-012 — see `KNOWN_ISSUES.md`. ISSUE-007 RESOLVED.
- A dev server was already listening on port 3000 during this session (not started by the agent). E2E was run
  with `E2E_PORT=3310`.
- When a hosted Supabase project is created: set the recovery email template, disable public sign-up, set the
  12-character minimum and leaked-password protection, and site URL — the dashboard does not read `config.toml`
  unless `supabase config push` is used.
- Dependabot PRs #2–#4 open (owner to review). `.claude/settings.json` still allowlists `pnpm …` (ISSUE-004b).
- ADR-002..008 `Decision: PENDING`. `docs/ai/COST_MATRIX.md` missing (ISSUE-006).

## Recommended next task (NOT STARTED — requires explicit instruction)

**T-105** — Migration 0001 (orgs, profiles, members, RBAC, invitations, audit) + seed permissions/system roles +
pgTAP. Satisfies TR-030..035, SEC-B07. Done when: `supabase test db` green. Needs Docker for the local stack.

## Do NOT implement yet

Domain CRUD · DNS · Hosting · Payments · Stripe · Dojo · CRM · Staff chat · WebRTC · HR · Salary.
