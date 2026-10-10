# TRD — Technical Requirements Document

| Field | Value |
|---|---|
| Version | 0.1 (PROPOSED) |
| Traces to | `PRD.md` (FR/NFR IDs) |
| Long-form design | `docs/ai/ARCHITECTURE.md` |
| Physical schema | `BACKEND_SCHEMA.md` |

All versions below are **targets to verify on Day 0** against the actual repo/lockfile. Do not upgrade a working dependency without an ADR.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Node.js LTS | Pin in `.nvmrc` / `engines` |
| Framework | Next.js App Router, TypeScript `strict` | Server Components default |
| UI | Tailwind CSS, shadcn/ui (Radix), Lucide, `next-themes` | Tokens via CSS variables |
| Forms / validation | React Hook Form + Zod | Same Zod schema on client and server |
| DB / Auth / Storage / Realtime | Supabase (Postgres, Auth, Storage, Realtime) | `@supabase/ssr` for cookie sessions |
| Jobs | Postgres-backed queue (Supabase Queues/pgmq or `jobs` table + `SKIP LOCKED`) + Supabase Cron | ADR-006 decides |
| Payments | Stripe Node SDK, Dojo REST API | Behind `PaymentProvider` interface |
| Rate limiting | Postgres-backed or Upstash Redis | Must be shared across instances |
| Email | Resend / Postmark / SES (decide) | Behind `EmailProvider` |
| WebRTC TURN | Managed (e.g. Cloudflare/Twilio) or coturn | Short-lived credentials |
| Monitoring | Sentry (or equivalent) + structured logs | PII scrubbing on |
| Tests | Vitest, Testing Library, Playwright, pgTAP (`supabase test db`) | |
| Hosting | Vercel (app), Supabase (data) | Separate staging/prod projects |
| CI | GitHub Actions | Gates in §11 |

## 2. Code structure

```text
src/
  app/
    (auth)/login, mfa, reset-password, invite/[token]
    (dashboard)/[orgSlug]/…           # staff app, org in path, verified server-side
    (portal)/portal/…                 # customer portal (separate layout + permissions)
    api/webhooks/{stripe,dojo,github,vercel}/route.ts
    api/health/route.ts
  modules/<module>/                   # identity, organizations, clients, domains, dns, hosting,
    <m>.schemas.ts  <m>.service.ts    #  websites, deployments, payments, tasks, support, chat,
    <m>.repository.ts <m>.actions.ts  #  calls, hr, integrations, notifications, audit, jobs
    <m>.queries.ts  <m>.permissions.ts
  modules/integrations/providers/{stripe,dojo,cloudflare,vercel,github,cpanel,registrar,email,turn}/
  lib/
    env/{server,client}.ts            # Zod-validated; server.ts imports 'server-only'
    supabase/{server,client,admin}.ts # admin = secret key, 'server-only'
    authorization/                    # requireAuth, requireOrgMember, requirePermission, requireStepUp
    security/{crypto,ssrf,upload,redact,csrf}.ts
    rate-limit/  errors/  logging/  idempotency/
supabase/migrations/  supabase/tests/  supabase/seed.sql
tests/{unit,integration,security,rls,e2e}
```

**Rule TR-001:** UI components never import a provider SDK or `lib/supabase/admin`. Enforced with an ESLint `no-restricted-imports` rule.

## 3. Request pipeline (every Server Action / Route Handler)

```text
withAction(schema, permission, handler):
  1 correlationId = header or uuid
  2 user   = supabase.auth.getClaims()  → 401 if none        (never getSession() for authz)
  3 org    = resolve from route slug → verify active membership (DB), ignore client org_id
  4 perm   = has_permission(org, user, permission)           → 403
  5 stepUp = if action is high-risk: aal2 within N minutes   → 403 STEP_UP_REQUIRED
  6 rate   = limiter(key=user+action, org)                   → 429
  7 input  = schema.safeParse(raw)                           → 422 with field errors
  8 result = service(ctx, input)  (resource ownership check inside service)
  9 audit  = write audit_logs in same transaction where possible
 10 return DTO (explicit fields only)
```

| ID | Requirement |
|---|---|
| TR-010 | A single `withAction` / `withRoute` wrapper implements steps 1–10; lint forbids raw exported actions outside it |
| TR-011 | Errors map to `UNAUTHENTICATED, FORBIDDEN, STEP_UP_REQUIRED, VALIDATION_ERROR, NOT_FOUND, CONFLICT, RATE_LIMITED, PROVIDER_ERROR, TIMEOUT, INTERNAL_ERROR`; no stack traces to client |
| TR-012 | Cross-tenant lookups return `NOT_FOUND`, not `FORBIDDEN` (no existence leak) |
| TR-013 | Request body limit 1 MB default; uploads go direct to Storage via signed upload URL |

## 4. Authentication (FR-001…007)

| ID | Requirement |
|---|---|
| TR-020 | Supabase Auth email/password; cookie session via `@supabase/ssr`; middleware/proxy only refreshes session — never the only authz gate |
| TR-021 | No tokens in `localStorage`/`sessionStorage`; verify via browser storage audit in E2E |
| TR-022 | TOTP MFA via Supabase MFA; roles with `requires_mfa` blocked at aal1 |
| TR-023 | Step-up = `aal2` with MFA verified within 10 min (configurable), checked server-side from JWT `amr` |
| TR-024 | Password policy: min 12 chars, leaked-password check enabled in Supabase; hashing is Supabase's (bcrypt) — no custom hashing |
| TR-025 | Session revocation: `auth.admin.signOut(user, 'global')` + membership `status='disabled'` checked on every request |
| TR-026 | Login, reset, invite, MFA verify rate-limited per IP and per account |

## 5. Authorization model

- Tables: `roles`, `permissions`, `role_permissions`, `member_roles` (see BACKEND_SCHEMA).
- Postgres functions (`SECURITY DEFINER`, `search_path=''`, in `private` schema): `private.is_org_member(org)`, `private.has_permission(org, perm)`.
- Server helper `requirePermission(ctx, 'dns.write')` calls the same function → one source of truth.
- Resource checks: `canAccessTask`, `canAccessTicket`, `canAccessSalary` etc. in `<module>.permissions.ts`.

## 6. Tenancy & RLS

| ID | Requirement |
|---|---|
| TR-030 | Every tenant table has `organization_id uuid not null` + RLS enabled + `FORCE ROW LEVEL SECURITY` |
| TR-031 | Child rows referencing tenant parents use composite FK `(organization_id, parent_id)` to block cross-tenant links |
| TR-032 | No policy uses `using (true)` on tenant data; CI script greps migrations for it |
| TR-033 | `auth.uid()` wrapped as `(select auth.uid())` in policies for performance |
| TR-034 | Secret-key (admin) client used only in jobs/webhooks/explicit server ops, after app-level authz |
| TR-035 | Sensitive tables (`provider_credentials`, `webhook_events`, `idempotency_keys`) live in `private` schema, not exposed via Data API |

## 7. High-risk actions (step-up + audit, optional approval)

Role/permission change · reveal/rotate provider credential · NS/MX/CAA/SPF/DKIM/DMARC change · domain delete/transfer · production deploy/rollback · refund · payment provider config · salary create/mark-paid · org delete · security settings.

## 8. Payments

| ID | Requirement |
|---|---|
| TR-040 | `PaymentProvider` interface: `createPayment, getStatus, cancel?, refund?, verifyWebhook, parseEvent, capabilities()` |
| TR-041 | Amounts `bigint` minor units + ISO-4217 `char(3)`; per-org max amount config |
| TR-042 | `payment_requests` row + outbox job written in one transaction; worker calls provider with idempotency key `pr_<id>_v<attempt-group>` |
| TR-043 | Webhook route: read raw body → verify signature (Stripe `constructEvent`; Dojo per current docs) → insert `webhook_events` with `UNIQUE(provider, provider_event_id)` → 200 fast → job processes |
| TR-044 | State machine enforced in DB (trigger or check on allowed transitions); `paid` only from verified event or reconciliation |
| TR-045 | Reconciliation cron every 15 min for `pending/sent` older than 10 min |

## 9. DNS / infrastructure

| ID | Requirement |
|---|---|
| TR-050 | `DnsProvider` interface: `listRecords, createRecord, updateRecord, deleteRecord, getZone, capabilities()` |
| TR-051 | Change = `dns_change_requests` (diff, risk level, status) → approve/confirm → job applies → read-back verify → `applied`/`failed`/`uncertain` |
| TR-052 | Record validation per type (IP formats, hostname, TTL 60–86400, MX priority, CAA tag) |
| TR-053 | Provider credentials: AES-256-GCM, random 96-bit nonce, key version, key from env/KMS, decrypted only in worker |
| TR-054 | Outbound fetches (health checks, custom webhooks) through `safeFetch`: https only, DNS-resolve then block private/loopback/link-local/metadata ranges, no redirects to blocked hosts, 5 s timeout, 1 MB cap |

## 10. Realtime & WebRTC

| ID | Requirement |
|---|---|
| TR-060 | Messages persisted to `chat_messages` (RLS by membership); delivered via Realtime Postgres Changes or Broadcast with private channels + `realtime.messages` RLS |
| TR-061 | Signaling over private Broadcast channel `call:<call_id>`; only `call_participants` authorized |
| TR-062 | TURN credentials issued by server endpoint, TTL ≤ 1 h, never in env sent to client |

## 11. Quality gates (CI)

`lint` · `typecheck` · `vitest` · `supabase db reset && supabase test db` (pgTAP RLS) · `playwright` (smoke) · `next build` · `npm audit --audit-level=high` (or pnpm) · gitleaks secret scan · `productionBrowserSourceMaps: false` check · migration grep for `using (true)` / `disable row level security`.

## 12. Security headers (next.config / proxy)

`Content-Security-Policy` (nonce-based, `frame-ancestors 'none'`), `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(self), microphone=(self), geolocation=()`, remove `X-Powered-By`.

## 13. Observability

Structured JSON logs `{ts, level, correlationId, orgId, userId, action, result, durationMs}`; redaction list (password, token, secret, authorization, cookie, card, salary_amount). Sentry with `sendDefaultPii:false`. `/api/health` checks DB + queue lag.

## 14. Environment variables (names only)

```env
# public
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# server only
SUPABASE_SECRET_KEY=
ENCRYPTION_KEY=            # base64 32 bytes
ENCRYPTION_KEY_VERSION=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
DOJO_API_KEY=
DOJO_WEBHOOK_SECRET=
CLOUDFLARE_API_TOKEN=      # only if platform-level; per-org tokens are encrypted in DB
EMAIL_API_KEY=
TURN_SECRET=
SENTRY_DSN=
RATE_LIMIT_REDIS_URL=      # if Upstash chosen
```

## 15. NFR targets

| ID | Target | How verified |
|---|---|---|
| NFR-01 | 0 cross-tenant access | pgTAP + API security suite |
| NFR-02 | p95 < 800 ms on dashboard routes | k6 / Playwright trace on staging |
| NFR-03 | WCAG 2.2 AA | axe in Playwright + manual keyboard pass |
| NFR-05 | 0 secrets in bundle | grep `.next/static` for key patterns in CI |
| NFR-06 | RPO 24h / RTO 4h | quarterly restore drill to staging |

## 16. ADRs to write first
ADR-001 modular monolith · ADR-002 tenancy model (org in path, composite FKs) · ADR-003 job engine · ADR-004 provider adapters · ADR-005 payment webhook pipeline · ADR-006 secret encryption & key rotation · ADR-007 rate-limit store · ADR-008 realtime/WebRTC/TURN.
