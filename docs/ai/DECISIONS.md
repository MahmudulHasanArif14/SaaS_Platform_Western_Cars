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
