# Architecture

Status: **DESIGNED** (no implementation). Source requirements: MASTER_SPEC Part A, Part B §2–§3, §25–§32, §140–§154.

## 1. Style

Modular monolith: one Next.js App Router application + one Supabase project per environment. Modules are separated by folders and interfaces, not services. No microservices unless a recorded decision justifies one.

```text
Browser
  │  (cookies; publishable key only)
  ▼
Next.js App Router
  ├─ Server Components (reads)
  ├─ Server Actions (mutations from UI)
  └─ Route Handlers (webhooks, OAuth callbacks, job endpoints)
        │
        ▼
Application services  (lib/services/<module>)
  ├─ authorization  (lib/auth, lib/rbac)
  ├─ validation     (Zod schemas, lib/validation)
  └─ business rules
        │
        ▼
Data access (lib/db/<module>)  ── Supabase server client (user JWT → RLS applies)
                               └─ admin client (secret key) — only in allow-listed server modules
        │
        ▼
Supabase: Postgres (+RLS, private schema) · Auth · Realtime · Storage · Queues/Cron
        │
        ▼
Jobs/outbox workers ──► Provider adapters (lib/providers/*) ──► GitHub, Vercel, Cloudflare, cPanel, registrars, Stripe, Dojo, email, monitoring
```

## 2. Planned folder structure

```text
app/
  (auth)/            sign-in, sign-up, verify, reset, mfa
  (app)/             authenticated shell; one folder per implemented module only
  api/webhooks/<provider>/route.ts
  api/jobs/<job>/route.ts          (authenticated by job secret / Supabase cron)
components/
  ui/                shadcn primitives
  shell/             sidebar, topbar, theme toggle, org switcher
  <module>/          module components
lib/
  env/server.ts, env/client.ts     typed env (Zod); server.ts imports 'server-only'
  supabase/server.ts, client.ts, admin.ts (server-only, allow-listed)
  auth/              requireAuth, requireStepUpAuth, session helpers
  rbac/              permissions catalogue, requirePermission, canAccess*
  services/<module>/ business logic
  db/<module>/       queries
  validation/        shared Zod schemas
  providers/<name>/  adapters implementing interfaces in providers/types.ts
  jobs/              job abstraction, handlers, retry policy
  audit/             audit writer
  security/crypto/   encryptSecret, decryptSecret, rotateSecret, redactSecret
  money/             minor-unit helpers, currency
supabase/
  migrations/        ordered SQL migrations (only source of schema change)
  seed.sql           synthetic data only
  tests/             pgTAP RLS tests
tests/
  unit/ integration/ security/ e2e/
```

Rule: no route folder is created for a module before that module's vertical slice starts (Part B §1E).

## 3. Layers

| Layer | Responsibility | Rules |
| --- | --- | --- |
| Frontend | Render, forms, optimistic UX | Server Components by default; `"use client"` only for interactivity; no provider calls; no secrets |
| Server Actions / Route Handlers | Entry points | Call services only; each enforces auth independently; Route Handlers that accept cookies and mutate need CSRF/origin checks |
| Services | Business logic + authorization | `requireAuth → requireOrganizationMembership → requirePermission → canAccess* → validate → rules → write → audit` |
| Data access | SQL via Supabase client | User-scoped client by default so RLS is a second line of defence; admin client only for webhooks, jobs, audit writes to private schema |
| Database | Integrity + RLS | FKs, checks, unique, NOT NULL; RLS on every tenant table; helper functions `private.is_member(org)`, `private.has_permission(org, key)` (SECURITY DEFINER, fixed `search_path`) |

## 4. Supabase

- Keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (browser), `SUPABASE_SECRET_KEY` (server-only). No new use of legacy anon/service_role names.
- Auth: `@supabase/ssr` cookie sessions; middleware refreshes session; server code validates the user with `auth.getUser()`/claims verification, never trusting unverified cookie data.
- MFA: Supabase TOTP; step-up checks `aal2` on the server for high-risk actions.
- Schemas: `public` (RLS-protected app tables), `private` (secrets, webhook events, idempotency keys, security events, integration tokens — not exposed via the Data API).
- Storage: private buckets; object paths prefixed by `organization_id`; Storage RLS policies mirror table policies; signed URLs with short TTL.
- Realtime: private channels with Realtime authorization policies; Postgres Changes only on tables whose RLS is verified.
- Queues/cron: Supabase Queues (pgmq) + pg_cron where available on plan; wrapped by `lib/jobs` so it can be replaced.

## 5. RBAC / RLS

- Tables: `roles`, `permissions`, `role_permissions`, `member_roles` (custom roles per org; built-in roles seeded).
- Permission keys: Part B §18. App check and DB check use the same catalogue.
- RLS predicate pattern: `organization_id` membership AND permission AND (assignment/ownership where relevant). Customer users use separate predicates via `customer_users`.
- High-risk matrix (Part B §173B) implemented once in `lib/rbac/high-risk.ts`.

## 6. Provider layer

Interfaces: `RepositoryProvider`, `HostingProvider`, `DnsProvider`, `RegistrarProvider`, `PaymentProvider`, `EmailProvider`, `MonitoringProvider`. Each adapter declares capabilities; unsupported operations return a typed `UNSUPPORTED` result, never a simulated success. Connection status is set only by a real connection test.

## 7. Payments

`payment_requests` (internal) → `PaymentProvider.createPaymentLink` (idempotency key) → provider-hosted page → signed webhook → `private.webhook_events` (unique provider event ID) → job processes → `payment_events` + status transition (transactional, allowed transitions only) → notification. Reconciliation job compares provider state. Refunds: permission + step-up (+ approval). No card data stored.

## 8. Jobs, outbox, webhooks

- Outbox row written in the same transaction as the business change.
- Job states: queued, running, succeeded, failed, retrying, cancelled, dead_letter; exponential backoff with jitter; max attempts; correlation ID.
- Webhooks: verify signature on raw body → store → 2xx quickly → process asynchronously; idempotent by event ID.

## 9. Realtime & WebRTC

- Chat/presence/typing over Supabase Realtime private channels.
- WebRTC V1: 1-to-1 mesh; signaling over authorized Realtime channel; STUN + TURN (credentials short-lived, issued server-side). Group calls require SFU (future decision).

## 10. Storage & files

Private buckets per domain (documents, ticket attachments, chat attachments, employee documents). Validate type/size server-side; scanning approach OD-7.

## 11. Monitoring & observability

Structured JSON logs with correlation IDs; redaction of secret-like fields; job run table; provider error records; health-check jobs for websites/SSL/domains; error tracking provider TBD (COST_MATRIX).

## 12. Deployment & environments

LOCAL (Supabase CLI local stack) → TEST (CI, ephemeral local stack) → STAGING (separate Supabase project, Vercel preview/staging) → PRODUCTION (separate Supabase project). Migrations applied by CI per environment; never hand-edited in production. See `ENVIRONMENT_MATRIX.md`.

## 13. Testing strategy

| Level | Tooling (proposed, confirm at Day 1) | Scope |
| --- | --- | --- |
| Unit | Vitest | services, validation, money, crypto, permission logic |
| DB/RLS | pgTAP via Supabase CLI | tenant isolation, permission predicates, customer predicates |
| Integration | Vitest against local Supabase | services + DB, webhooks with signed fixtures |
| E2E | Playwright | auth, infra MVP journeys, payment test-mode flows |
| Security | dedicated suite | IDOR, step-up enforcement, secret leakage in responses |

CI gate: lint, typecheck, unit, RLS, integration, build on every PR.
