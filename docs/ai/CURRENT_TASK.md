# CURRENT TASK

## Stage

Phase 1 — T-101: Environment validation (`lib/env`) + `.env.example`

## Status

IMPLEMENTED, locally verified — NOT yet COMPLETED (2026-10-10).

The acceptance criterion ("build fails on missing server var in prod mode") passes locally. Not complete because
the new CI steps have not yet run green on GitHub (branch `feature/t-101-env-validation`).

Previous task: T-100 COMPLETED 2026-10-10 — PR #1 merged to `main` as `3c6b99c`; CI runs 38038898143 (PR) and
38038935415 (`main`) green on both jobs.

## Scope delivered

| Item | Evidence |
|---|---|
| Zod schemas + parsers, no side effects | `src/lib/env/schema.ts` |
| Server env (`import "server-only"`) | `src/lib/env/server.ts` |
| Client env (static `NEXT_PUBLIC_*` references) | `src/lib/env/client.ts` |
| Validation at build / start / dev | `next.config.ts` calls `validateEnv(process.env)` |
| `APP_ENV` = local, test, staging, production (default local); staging/production require all variables and an https app URL | `schema.ts`, `tests/unit/env.test.ts` |
| `VERCEL_ENV=production` requires `APP_ENV=production` | `schema.ts`, test |
| Secret key rejected in `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `schema.ts`, test |
| Error messages list names only, never values | test |
| ESLint: no raw `process.env` in `src/**` outside `src/lib/env` | `eslint.config.mjs`, `tests/security/lint-guards.test.ts` |
| Client-bundle secret scan (SEC-C02) | `scripts/check-client-bundle.mjs`, `npm run check:bundle` |
| CI: build-must-fail step + bundle scan | `.github/workflows/ci.yml` |
| `.env.example` (names only) + `!.env.example` in `.gitignore` (ISSUE-003) | `.env.example`, `.gitignore` |
| Zod runtime dependency recorded | `DECISIONS.md` |

Validated now: `APP_ENV`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SECRET_KEY`. The other TRD §14 names are added to the schema when their module is built.

## Checks run locally (2026-10-10, `3c6b99c` + working tree, Node v22.23.3)

| Check | Result |
|---|---|
| `npm run format:check` · `lint` · `typecheck` | PASS |
| `npm test` | PASS — 2 files, 23 tests |
| `APP_ENV=production npm run build`, no variables | FAILS as required — lists the 4 missing names |
| Same, only `SUPABASE_SECRET_KEY` missing | FAILS as required |
| Same, complete (fake test values) | PASS |
| `npm run build` (default, local) | PASS, no warnings |
| `npm run check:bundle` | PASS — 23 files; a planted `sb_secret_` string was detected (exit 1) |
| Probe: `lib/env/server` imported from a server component / a client component | builds / build fails (`server-only`) — probe reverted |
| `npm run test:e2e` | PASS — 2 tests |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| GitHub Actions | NOT RUN yet for T-101 |

## Remaining to mark COMPLETED

1. Open a PR for `feature/t-101-env-validation`; confirm CI green including the two new steps.

## Open items

- Nothing consumes `serverEnv` / `clientEnv` yet (first consumer: Supabase clients, T-104/T-105). Supabase
  variables are optional in local/test until then.
- No production/staging environment exists; `APP_ENV` must be set there when one is created.
- Dependabot PRs open (owner to review): `typescript` 7.0.2 — CI fails; `eslint` 10.12.0 — CI passes;
  `@types/node` 26.6.4 — conflicts with the Node 22 pin.
- `.claude/settings.json` still allowlists `pnpm …` (ISSUE-004b).
- ADR-002..008 `Decision: PENDING`. `docs/ai/COST_MATRIX.md` missing (ISSUE-006).

## Recommended next task (NOT STARTED — requires explicit instruction)

**T-102** — Design tokens, `next-themes`, app shell (sidebar, topbar, ⌘K stub), base components.
Done when: light/dark/mobile screenshots; axe clean. See `docs/plan/IMPLEMENTATION_PLAN.md` Phase 1.

## Do NOT implement yet

Domain CRUD · DNS · Hosting · Payments · Stripe · Dojo · CRM · Staff chat · WebRTC · HR · Salary.
