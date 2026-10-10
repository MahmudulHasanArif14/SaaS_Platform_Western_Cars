# SECURITY CHECKLIST — Release evidence

Rules live in `docs/ai/SECURITY_BASELINE.md`; threats in `THREAT_MODEL.md`. This file is **tickable evidence**.
A box is ticked only with a link to a passing test, CI job, config screenshot or PR. Status: `NOT_STARTED | IMPLEMENTED | TESTED | VERIFIED`.

Day 0 (2026-10-10): every check is `NOT_STARTED` — the repo has no auth, database, API routes, tests or CI to
verify against (`docs/ai/WORKSPACE_STATE.md`). No secrets or `.env*` files are present in the repo.

| Column | Meaning |
|---|---|
| How | The control |
| Verify | The test that proves it |
| Evidence | Test path / CI run / PR link |

---

## A. Injection & input

| ID | Check | How | Verify | Status | Evidence |
|---|---|---|---|---|---|
| SEC-A01 | **SQL injection** | Supabase query builder / RPC with typed params only; no string-built SQL; `.or()`/`.filter()` never fed raw user strings; DB functions use `format('%I', …)`/params, never `EXECUTE` concat | Unit tests with `' OR 1=1--`, `%`, `\`, unicode in every search/filter; grep CI for `execute ` + `||` in migrations | NOT_STARTED | |
| SEC-A02 | **Input validation everywhere** | Zod schema on every Server Action, Route Handler, webhook payload, query/search params; `.strict()` objects; length/format limits | Contract tests send extra fields, wrong types, oversize strings → 422 | NOT_STARTED | |
| SEC-A03 | **XSS** | React escaping only; no `dangerouslySetInnerHTML` (lint rule); if rich text/markdown: sanitize with DOMPurify server-side, allowlist tags; `href` must be http(s)/mailto; nonce-based CSP | Playwright injects `<img src=x onerror=alert(1)>`, `javascript:` links into chat, ticket, task, profile → no execution; CSP header test | NOT_STARTED | |
| SEC-A04 | **CSRF** | Cookies `SameSite=Lax`, `Secure`, `HttpOnly`; Server Actions rely on Next origin check — set `serverActions.allowedOrigins` explicitly; Route Handlers that mutate check `Origin` == app URL; webhooks exempt but signature-verified | Cross-origin POST from test page → 403 | NOT_STARTED | |
| SEC-A05 | **File upload validation** | Size limit per bucket; allowlist MIME **and** magic-byte sniff (`file-type`); extension allowlist; server-generated path `org/<id>/<module>/<uuid>.<ext>`; private buckets; `Content-Disposition: attachment` for non-images; no SVG/HTML inline; optional AV scan | Upload `.exe` renamed `.png`, 50 MB file, `../../` filename, SVG with script → all rejected | NOT_STARTED | |
| SEC-A06 | **SSRF** | All server-side outbound fetches of user-influenced URLs via `safeFetch`: https only, resolve DNS and block 127/8, 10/8, 172.16/12, 192.168/16, 169.254/16 (metadata), ::1, fc00::/7, fe80::/10; re-check after redirects (max 3); 5 s timeout; 1 MB cap; provider APIs use fixed base URLs | Unit tests for each blocked range, DNS-rebinding hostname, redirect to localhost, `http://`, decimal/hex IP encodings | NOT_STARTED | |
| SEC-A07 | Open redirect | `next=` param must be relative path starting with `/` and not `//` | Test `?next=//evil.com`, `https://evil.com` | NOT_STARTED | |
| SEC-A08 | Header/CSV injection | Exports prefix cells starting `= + - @` with `'`; strip CR/LF from email headers | Unit tests | NOT_STARTED | |

## B. Authentication & authorization

| ID | Check | How | Verify | Status | Evidence |
|---|---|---|---|---|---|
| SEC-B01 | **Broken Object Level Authorization (BOLA/IDOR) fixed** | Every read/write resolves resource → checks `organization_id` from verified membership + permission + ownership/assignment; cross-tenant returns 404 | Security suite: user A requests every resource type by B's IDs (GET/PATCH/DELETE/actions) → 404/denied; sequential/guessed IDs | NOT_STARTED | |
| SEC-B02 | Broken function-level auth | Each action declares permission in `withAction`; lint fails if missing | Viewer calls every mutating action → 403 | NOT_STARTED | |
| SEC-B03 | **Rate limiting** | Shared store (Postgres/Redis), per IP + per user + per org: login 5/15 min, reset 3/h, invite 20/h, payment-link 30/h, uploads, search, webhooks, call init | Burst tests → 429 with `Retry-After`; works across 2 instances | NOT_STARTED | |
| SEC-B04 | **Passwords securely hashed** | Supabase Auth only (bcrypt); no app password columns; min length 12; leaked-password protection on; no passwords in logs | Schema grep for `password` columns; Supabase Auth settings screenshot | NOT_STARTED | |
| SEC-B05 | **Multi-factor auth** | Supabase TOTP MFA; required for roles with `requires_mfa`; step-up (`aal2` recent) for high-risk actions server-side; recovery path documented | Test: aal1 user blocked from admin routes; high-risk action without fresh MFA → `STEP_UP_REQUIRED` | NOT_STARTED | |
| SEC-B06 | **Permissions enforced server-side** | `requirePermission` in service layer + RLS; UI checks are cosmetic; client-sent `role`, `organization_id`, `amount`, `provider` ignored/re-derived | Tamper tests via direct HTTP with modified fields | NOT_STARTED | |
| SEC-B07 | **RLS enabled** on every public table | `enable` + `force row level security`; no `using (true)` on tenant data; Supabase Security Advisor clean | CI query: `select relname from pg_class where relnamespace='public'::regnamespace and relkind='r' and not relrowsecurity` → 0 rows; pgTAP 5-case template per table | NOT_STARTED | |
| SEC-B08 | Session security | `getClaims()/getUser()` for authz (never `getSession()` server-side); disabled member blocked on next request; global sign-out on offboarding | Test disabled user's existing cookie → 401 | NOT_STARTED | |
| SEC-B09 | Separation of duties | Requester ≠ approver for refunds, salary, HIGH DNS, prod deploy | DB check constraint + test | NOT_STARTED | |
| SEC-B10 | Privilege escalation | Users can't grant permissions they don't hold; can't edit own roles | Test | NOT_STARTED | |

## C. Secrets & tokens

| ID | Check | How | Verify | Status | Evidence |
|---|---|---|---|---|---|
| SEC-C01 | **JWT secrets secure** | Use Supabase asymmetric JWT signing keys (verify via JWKS); never hand-roll JWTs; if any app-signed tokens (invites) use random 32-byte tokens stored hashed, not JWTs | Config review; no `jsonwebtoken` signing with static secret in code | NOT_STARTED | |
| SEC-C02 | **API secrets server-only** | Secrets only in `lib/env/server.ts` (`import 'server-only'`); never `NEXT_PUBLIC_`; secret key client only in `lib/supabase/admin.ts` | CI: build then grep `.next/static/**` for `sk_live`, `sk_test`, `sb_secret_`, `whsec_`, env names → 0 hits | NOT_STARTED | |
| SEC-C03 | **No tokens in localStorage** | `@supabase/ssr` cookie storage; remove any legacy `localStorage` auth keys on load; no provider tokens client-side | E2E: after login assert `localStorage` and `sessionStorage` contain no `sb-`/token keys | NOT_STARTED | |
| SEC-C04 | **Default credentials changed** | No seeded admin with known password in staging/prod; seed users only in local; Supabase dashboard/DB passwords rotated from defaults; Postgres `postgres` password strong; Studio not public | Checklist sign-off per environment | NOT_STARTED | |
| SEC-C05 | Provider credentials encrypted | AES-256-GCM, key versioning, decrypt only in worker, `last4` display only | Unit tests encrypt/decrypt/tamper; DB check no plaintext | NOT_STARTED | |
| SEC-C06 | Secret scanning | gitleaks in CI + pre-commit; GitHub secret scanning + push protection on | CI job green | NOT_STARTED | |
| SEC-C07 | Rotation runbook | Steps to rotate Supabase keys, Stripe/Dojo keys, webhook secrets, encryption key | Runbook exists + dry run | NOT_STARTED | |

## D. Config & hygiene

| ID | Check | How | Verify | Status | Evidence |
|---|---|---|---|---|---|
| SEC-D01 | **CORS settings** | Route Handlers do not send `Access-Control-Allow-Origin: *`; only explicit origins if any cross-origin API exists; Supabase allowed redirect URLs = exact app URLs | `curl -H "Origin: https://evil.com" -I` → no ACAO header | NOT_STARTED | |
| SEC-D02 | **Webhook signatures** | Stripe `constructEvent(rawBody, sig, secret)` with tolerance; Dojo signature per current docs; reject unsigned; dedupe by event ID; respond 2xx only after persisting | Tests: forged sig → 400; replayed event → processed once; old timestamp → rejected | NOT_STARTED | |
| SEC-D03 | **Source maps not exposed** | `productionBrowserSourceMaps: false`; if Sentry uploads maps, delete after upload (`deleteSourcemapsAfterUpload`) | `curl https://app/_next/static/**/*.js.map` → 404 | NOT_STARTED | |
| SEC-D04 | **Sensitive data removed from logs** | Logger redaction paths (password, token, secret, authorization, cookie, card, iban, salary); Sentry `sendDefaultPii:false` + `beforeSend` scrub; no request bodies logged on auth/payment routes | Unit test logger redaction; review Sentry event sample | NOT_STARTED | |
| SEC-D05 | **Vulnerable dependencies updated** | Lockfile committed; `pnpm audit --audit-level=high` (or npm) in CI; Dependabot/Renovate weekly; review new deps (ADR) | CI job green; 0 high/critical | NOT_STARTED | Day 0: `package-lock.json` committed (npm). `npm audit` = 5 high (ISSUE-002). No CI, no Dependabot/Renovate. |
| SEC-D06 | Security headers | CSP (nonce), HSTS, nosniff, Referrer-Policy, Permissions-Policy, `frame-ancestors 'none'`, `poweredByHeader:false` | securityheaders.com / test asserting headers | NOT_STARTED | |
| SEC-D07 | Error leakage | Production errors show safe message + correlation ID, no stack/SQL | Force error in staging → inspect response | NOT_STARTED | |
| SEC-D08 | Environment separation | Live payment keys only in prod; staging uses separate Supabase project | Env audit | NOT_STARTED | |
| SEC-D09 | Supabase hardening | Data API not exposing `private`; email confirm on; OTP expiry short; SMTP custom; Network restrictions where plan allows; PITR/backups configured | Settings review | NOT_STARTED | |
| SEC-D10 | Agent skills reviewed | `npx skills add vercel-labs/agent-skills` output reviewed in diff; only used skills committed; no unreviewed scripts | PR review | NOT_STARTED | 2026-10-10: owner approved 5 markdown-only skills (commit `9227aab`, branch `chore/agent-skills`); 4 others (`deploy-to-vercel`, `vercel-optimize`, `vercel-cli-with-tokens`, `vercel-react-native-skills`) removed, not committed. Line-by-line review of the 5 not done. |

## E. Release gate

Production is blocked while any of these is not VERIFIED: A01–A06, B01, B03–B07, C02, C03, C04, D02, D03, D04, D05.

Sign-off:
```text
Release:            Commit:
Verified by:        Date:
Open exceptions (ID, reason, owner, expiry):
```
