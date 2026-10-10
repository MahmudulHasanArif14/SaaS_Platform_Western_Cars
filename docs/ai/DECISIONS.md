## Architectural Decision Rule

Do not make major architectural changes silently.

Record a decision when changing:

- database architecture
- authentication architecture
- authorization model
- encryption strategy
- payment architecture
- provider abstraction
- job architecture
- realtime architecture
- WebRTC architecture
- deployment architecture
- storage architecture

Each decision should include:

Decision
Reason
Alternatives considered
Security impact
Cost impact
Migration impact
Date

---

## Decision log

### 2026-10-10 — Source layout (T-100)

Decision: Modular monolith with code under `src/`, `@/*` → `./src/*`. Full record: `decisions/ADR-001-modular-monolith.md`.

### 2026-10-10 — Dev tooling dependencies (T-100)

Decision: Add dev-only dependencies. No runtime dependency added.

| Package | Why |
|---|---|
| `prettier`, `eslint-config-prettier` | One formatter; turns off ESLint rules that conflict with it |
| `vitest` | Unit / integration / security test runner (`npm test`) |
| `@playwright/test` | E2E tests against a production build (`npm run test:e2e`) |
| `@types/node` ^20 → ^22 | Match the pinned runtime (`.nvmrc` 22, `engines.node >=22.12.0`, required by Vitest 5) |

Alternatives considered: Jest (needs extra transform setup for ESM/TS); Biome (would replace the existing `eslint-config-next` setup).
Security impact: dev-only; not shipped. `npm audit --omit=dev` = 0 vulnerabilities.
Cost impact: none. Migration impact: none.

### 2026-10-10 — CI audit gate scope (T-100, ISSUE-002)

Decision: CI fails on `npm audit --omit=dev --audit-level=high` (production dependencies only).
Reason: the 5 high advisories (`braces` → … → `eslint-config-next` 16.4.0) are in the lint toolchain, are not shipped, and have no non-breaking fix (`npm audit fix --force` downgrades `eslint-config-next` to 14.x).
Alternatives considered: full-tree gate (CI permanently red); npm `overrides` for `braces` (unverified against `micromatch`'s pinned range).
Security impact: dev-chain advisories are not gated; tracked as ISSUE-002 and by weekly Dependabot. Revisit when upstream ships a fix, then widen the gate to the full tree.
Cost impact: none. Migration impact: none.

### 2026-10-10 — Zod runtime dependency (T-101)

Decision: Add `zod` (^4.6.5) as a runtime dependency for environment validation; it is also the planned
validator for server-action / route-handler input (TRD §3).
Alternatives considered: hand-written checks (no shared validator for later input validation); `@t3-oss/env-nextjs`
(extra dependency on top of Zod for what is ~100 lines here).
Security impact: none negative; `npm audit --omit=dev` = 0 vulnerabilities after install.
Cost impact: none. Migration impact: none.

### 2026-10-10 — Environment validation model (T-101)

Decision: `APP_ENV` (`local` | `test` | `staging` | `production`, default `local`) selects strictness.
`staging` and `production` require every validated variable and an https app URL; `local` and `test` only check
the format of what is set. Validation runs in `next.config.ts`, so `next build`, `next start` and `next dev` fail
fast. `VERCEL_ENV=production` without `APP_ENV=production` is rejected so a production deploy cannot fall back to
the lenient rules. Only variables with an imminent consumer are validated; the rest of TRD §14 joins the schema
with its module.
Reason: `NODE_ENV` is `production` for every `next build` (including CI and E2E), so it cannot distinguish a real
deployment from a local/CI build; requiring secrets there would force placeholder secrets into CI.
Alternatives considered: key strictness on `NODE_ENV` (see reason); validate in `instrumentation.ts` only
(runtime, not build time).
Security impact: missing or malformed configuration stops the build instead of surfacing at runtime; error
messages contain variable names only. Residual risk: a non-Vercel production host with `APP_ENV` unset gets the
lenient rules — set `APP_ENV` explicitly in every deployed environment.
Cost impact: none. Migration impact: deployed environments must define `APP_ENV`.

### 2026-10-10 — UI dependencies (T-102)

Decision: Adopt shadcn/ui (`radix-nova` style, Radix base) as generated source in `src/components/ui`, with:

| Package | Type | Why |
|---|---|---|
| `radix-ui`, `class-variance-authority`, `cn`, `tw-animate-css` | runtime | Required by the generated shadcn components (`cn` is shadcn's class merger) |
| `lucide-react` | runtime | Icon set named in the design brief |
| `cmdk` | runtime | Command menu (⌘K) |
| `sonner` | runtime | Toasts |
| `next-themes` | runtime | Light / dark / system switching without flash |
| `@tanstack/react-table` 9 | runtime | Table engine named in the brief; v9 API (`useTable`, `tableFeatures`) |
| `shadcn` | dev | CLI, and `shadcn/tailwind.css` imported at build time |
| `@axe-core/playwright` | dev | Automated WCAG checks in E2E |

`shadcn` was installed by its own CLI as a runtime dependency; moved to dev because it pulls the CLI toolchain
(`ts-morph`, `fast-glob` → `braces`, GHSA-vfj7-8cjw-p6xm) and failed the production audit gate. It is only needed
at build time.
Alternatives considered: hand-written primitives (accessibility cost); Base UI variant (Radix is the documented
stack); a custom table (the brief names TanStack).
Security impact: `npm audit --omit=dev` = 0 vulnerabilities. No component uses `dangerouslySetInnerHTML`.
Cost impact: none. Migration impact: none.

### 2026-10-10 — Token mapping and preview routes (T-102)

Decision: The brief's tokens are the source of truth in `globals.css`; shadcn's semantic names are aliases of them.
Two contrast deviations from the brief: dark `--primary-foreground` and `--danger-foreground` are near-black, and
status colours are not used as body-text colours. The app shell is mounted only on `/design-system/**`, which
returns 404 when `APP_ENV=production`; the real `(dashboard)/[orgSlug]` layout waits for auth and org resolution.
Reason: axe-verified AA contrast; no unauthenticated "app" pages that imply functionality that does not exist.
Security impact: preview routes contain sample content only and are not served in production.
Cost impact: none. Migration impact: none.

### 2026-10-11 — Content Security Policy and dynamic rendering (T-103)

Decision: A per-request nonce CSP is set in `src/proxy.ts` (`script-src 'self' 'nonce-…' 'strict-dynamic'`), with
the static headers of TRD §12 in `next.config.ts`. To make the nonce usable, the root layout sets
`instant = false` and reads `headers()`, so every route is rendered per request. `cacheComponents` stays enabled.
Three deliberate relaxations, all on styles, none on scripts:

| Relaxation | Why |
|---|---|
| `style-src-attr 'unsafe-inline'` | React renders the `style` prop as an attribute on the server (sidebar width variables, toasts, Radix). `<style>` elements and stylesheets stay nonce-only |
| Two `sha256-…` hashes in `style-src-elem` | `sonner` injects its stylesheet from JavaScript and has no nonce option. A unit test recomputes the hashes from the installed package |
| `'unsafe-eval'` and `style-src 'unsafe-inline'` under `next dev` only | Required by React's dev tooling (Next.js CSP guide) |

`upgrade-insecure-requests` is sent only when `APP_ENV` is `staging` or `production`, so local http keeps working.
The proxy also runs on prefetch requests (the Next.js guide excludes them) because it enforces the production
block on preview routes and a request header must not be able to skip it.
New runtime dependency: `get-nonce` ^1.0.1 — already installed as a dependency of Radix's scroll lock; made direct
so the app can hand it the nonce (`src/components/style-nonce.tsx`).
Alternatives considered: `style-src 'unsafe-inline'` (simpler, allows injected `<style>` elements); hash-based CSP
via experimental SRI (keeps static rendering, but TRD §12 specifies a nonce and the feature is experimental);
disabling `cacheComponents` (not needed — `instant = false` is the documented opt-out).
Security impact: inline scripts, inline event handlers and injected `<style>` elements are blocked (E2E tests).
Residual: an HTML-injection bug could still set inline `style` attributes; `img-src` / `connect-src` limit what
those can load. No violation reporting yet.
Cost impact: no static HTML; every page view is server-rendered (KNOWN_ISSUES ISSUE-010).
Migration impact: every new third-party origin must be added to the policy in `src/lib/security/headers.ts`.

### 2026-10-11 — Supabase Auth integration shape (T-104)

Decision:

1. All authentication runs on the server (Server Actions + `/auth/confirm`). Session cookies are forced
   `HttpOnly`, `SameSite=Lax` and, when deployed, `Secure`. `@supabase/ssr` leaves them readable by JavaScript by
   default so its browser client can use them; here the browser client is therefore anonymous.
2. The proxy refreshes the session and makes the first access decision for protected routes (status must be set
   before streaming, ISSUE-009). Pages, actions and data functions call `requireAuth()` / `getCurrentUser()`
   again; the proxy is never the only gate (TR-020).
3. Identity comes from `auth.getClaims()` only.
4. Public sign-up is disabled. Accounts are created by an administrator until invitations exist (T-107).
5. Provider error messages are never shown; wrong password, unknown email, unconfirmed and banned accounts give
   the same answer.
6. The local Supabase CLI stack is the backend for development, CI and E2E. E2E helpers refuse a non-local URL.

New dependencies: `@supabase/supabase-js`, `@supabase/ssr` (runtime, the documented SSR integration);
`supabase` (dev, CLI used by CI and local development).
Alternatives considered: readable cookies with a browser client (the documented default; a script-injection bug
could then read the refresh token); a hosted project for tests (tests create and delete users; costs a project
slot); gating in layouts only (returns 200 and leaks the payload, ISSUE-009).
Security impact: tokens are not reachable from JavaScript. Consequence: Realtime (chat, presence) cannot use the
browser client's session — it will need a short-lived token issued by a server endpoint. To be designed with
ADR-008.
Cost impact: none now. Migration impact: hosted projects need the recovery email template, sign-up and password
settings applied in the dashboard or with `supabase config push`.
