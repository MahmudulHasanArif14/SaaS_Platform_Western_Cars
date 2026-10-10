# WORKSPACE STATE

Verified facts only (tools run on 2026-10-10). Anything not verified is marked `UNKNOWN`.

## Git

| Field | Value |
|---|---|
| Branch | `feature/t-100-tooling-ci` (local; not pushed) |
| Commit | `154af40` — `docs: record Day 0 discovery, ADR stubs and D1 decision` |
| Remote | `origin` → `github.com/MahmudulHasanArif14/SaaS_Platform_Western_Cars` |
| Working tree | DIRTY — all of T-100 is uncommitted |

Uncommitted (T-100):

- Modified: `.gitignore`, `eslint.config.mjs`, `next.config.ts`, `package.json`, `package-lock.json`, `tsconfig.json`, `CLAUDE.md`
- Renamed (staged): `app/{favicon.ico,globals.css,layout.tsx,page.tsx}` → `src/app/`
- New: `.github/workflows/ci.yml`, `.github/dependabot.yml`, `.nvmrc`, `.prettierrc.json`, `.prettierignore`,
  `playwright.config.ts`, `vitest.config.mts`, `tests/e2e/smoke.spec.ts`, `tests/security/lint-guards.test.ts`
- Docs: `docs/ai/{CURRENT_TASK,WORKSPACE_STATE,SESSION_LOG,ROADMAP,KNOWN_ISSUES,DECISIONS,PRODUCTION_READINESS}.md`,
  `docs/ai/decisions/ADR-001-modular-monolith.md`, `docs/security/SECURITY_CHECKLIST.md`
- Deleted (pre-existing, not by these sessions): `public/{file,globe,next,vercel,window}.svg`

## Toolchain

| Item | Value | Evidence |
|---|---|---|
| Package manager | npm 10.9.9 | `package-lock.json`; `npm -v` |
| Node.js | v22.23.3; pinned by `.nvmrc` (22) and `engines.node >=22.12.0` | `node -v`; `package.json` |
| Next.js | 16.4.0, App Router, Turbopack | `package.json`; build output |
| React / React DOM | 19.3.0 | `package.json` |
| TypeScript | `^5`, `strict` + `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch` | `tsconfig.json` |
| Tailwind CSS | `^4` via `@tailwindcss/turbopack` loader | `next.config.ts` |
| ESLint | `^9` flat config; `eslint-config-next` 16.4.0 + `eslint-config-prettier`; TR-001 and `react/no-danger` rules | `eslint.config.mjs` |
| Prettier | 3.9.9, default options | `.prettierrc.json` |
| Vitest | 5.0.3, node environment, `tests/{unit,integration,security}/**/*.test.{ts,tsx}` | `vitest.config.mts` |
| Playwright | 1.64.0, chromium, runs `npm run build && npm run start` on 127.0.0.1:3000 | `playwright.config.ts` |
| Next config flags | `cacheComponents: true`, `partialPrefetching: true`, `turbopack.root: __dirname` | `next.config.ts` |
| Path alias | `@/*` → `./src/*` | `tsconfig.json`, `vitest.config.mts` |
| Supabase CLI | NOT INSTALLED | shell (Day 0) |
| Vercel CLI | NOT INSTALLED | session hook |

Not installed: Supabase JS / `@supabase/ssr`, shadcn/ui, Radix, Lucide, `next-themes`, Zod, React Hook Form,
Stripe SDK, Testing Library, Sentry.

## Repository contents

| Area | State |
|---|---|
| App code | `src/app/{layout.tsx,page.tsx,globals.css,favicon.ico}` — unmodified create-next-app starter |
| Routes | `/` and `/_not-found` only (both static) — from build output |
| `src/modules`, `src/lib`, `src/components` | DO NOT EXIST yet |
| Auth / middleware / proxy / API routes / server actions | NONE |
| `supabase/` (config, migrations, RLS policies, seed) | DOES NOT EXIST |
| Tests | `tests/security/lint-guards.test.ts` (6), `tests/e2e/smoke.spec.ts` (2). No unit, integration or RLS tests |
| CI | `.github/workflows/ci.yml` (quality + e2e jobs), `.github/dependabot.yml` — never run on GitHub |
| `vercel.json` / `vercel.ts` | NONE |
| `.env.example` / `.env*` | NONE present |
| `.gitignore` | ignores `.env*` with no `!.env.example` exception (ISSUE-003) |
| `public/` | empty (5 starter SVGs deleted, uncommitted) |

## Commands (verified from `package.json`)

`npm run dev` · `npm run build` · `npm run start` · `npm run lint` · `npm run typecheck` ·
`npm run format` · `npm run format:check` · `npm test` · `npm run test:watch` · `npm run test:e2e`

## Last verification (2026-10-10, commit `154af40` + working tree)

| Check | Command | Result | Notes |
|---|---|---|---|
| format | `npm run format:check` | PASS | |
| lint | `npm run lint` | PASS | exit 0, no findings |
| typecheck | `npm run typecheck` | PASS | `next typegen && tsc --noEmit` |
| unit/security | `npm test` | PASS | 1 file, 6 tests |
| build | `npm run build` | PASS | no warnings; routes `/`, `/_not-found` |
| e2e | `npm run test:e2e` | PASS | 2 tests, chromium, against production build |
| audit (prod) | `npm audit --omit=dev --audit-level=high` | PASS | 0 vulnerabilities |
| audit (full) | `npm audit` | FAIL | 5 high in dev lint chain (ISSUE-002) |
| CI on GitHub | — | NOT RUN | branch not pushed |
| supabase / RLS tests | — | NOT RUN | none exist |

## Environments / deployment / integrations

| Item | State |
|---|---|
| Local env vars | none defined; none required by current code |
| Database | NONE (no Supabase project linked in repo) |
| Deployment | UNKNOWN — no deploy config in repo; no evidence of a Vercel project |
| Staging / production | UNKNOWN — no evidence either exists |
| External integrations | NONE implemented; all `NOT_STARTED` |
| Production access | NOT USED |

## Completed milestones (with evidence)

- T-000 repository inventory + checks (commit `154af40`).
- ADR-001 ACCEPTED (modular monolith, `src/`); ADR-002..008 `Decision: PENDING`.

## Current task

T-100 — implemented and locally verified; not COMPLETED until CI is green on GitHub. See `CURRENT_TASK.md`.

## Blockers

- T-100 completion: commit + push need owner go-ahead.
- Org-creation mode (self-serve vs provisioned) open before T-107.
- Supabase CLI not installed — required from T-104/T-105.

## Docs vs. implementation discrepancies

1. `.claude/settings.json` allows `pnpm lint/test/typecheck/build`; the package manager is npm (ISSUE-004b).
2. `docs/ai/COST_MATRIX.md` (Day 0 required output) does not exist (ISSUE-006).
3. Several `docs/ai/*.md` files end with leftover generation-prompt text (ISSUE-006).

## Last updated

2026-10-10
