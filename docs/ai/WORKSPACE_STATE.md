# WORKSPACE STATE

Verified facts only (tools run on 2026-10-11). Anything not verified is marked `UNKNOWN`.

## Git

| Field | Value |
|---|---|
| Branch | `feature/t-103-security-headers` (local, from `origin/main`; not pushed) |
| Commit | `298f468` — merge of PR #6 (`feature/t-102-app-shell`) into `main` |
| Remote | `origin` → `github.com/MahmudulHasanArif14/SaaS_Platform_Western_Cars` |
| Working tree | DIRTY — all of T-103 and the T-102 completion doc updates are uncommitted |

Uncommitted:

- T-103 code: `src/proxy.ts`, `src/lib/security/headers.ts`, `src/lib/preview-routes.ts`, `src/lib/env/runtime.ts`,
  `src/components/{style-nonce,theme-provider}.tsx`, `src/app/layout.tsx`, `next.config.ts`,
  `tests/e2e/{fixtures.ts,security-headers.spec.ts,design-system.spec.ts,smoke.spec.ts}`,
  `tests/unit/{security-headers,preview-routes}.test.ts`, `package.json`, `package-lock.json`
- Docs: `docs/ai/*`, `docs/security/SECURITY_CHECKLIST.md`
- Deleted (pre-existing, not by these sessions): `public/{file,globe,next,vercel,window}.svg`
- `graphify-out/cache/last_query_stamp` (tool side effect)

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
| Next config flags | `cacheComponents: true`, `partialPrefetching: true`, `turbopack.root: __dirname`, `poweredByHeader: false`, `productionBrowserSourceMaps: false`, `headers()` | `next.config.ts` |
| Path alias | `@/*` → `./src/*` | `tsconfig.json`, `vitest.config.mts` |
| Supabase CLI | NOT INSTALLED | shell (Day 0) |
| Vercel CLI | NOT INSTALLED | session hook |

Runtime dependencies: Zod 4.6.5 (T-101); added in T-102 — `radix-ui`, `class-variance-authority`, `cn`, `cmdk`,
`lucide-react`, `next-themes`, `sonner`, `tw-animate-css`, `@tanstack/react-table` 9.2.8; added in T-103 —
`get-nonce` 1.0.1 (already installed as a Radix dependency). Dev: `shadcn` (CLI + its
`tailwind.css`), `@axe-core/playwright`.

Not installed: Supabase JS / `@supabase/ssr`, React Hook Form,
Stripe SDK, Testing Library, Sentry.

## Repository contents

| Area | State |
|---|---|
| App code | `src/app`: root layout (reads the CSP nonce; theme, tooltip, toaster), `/` (foundation notice), `not-found`, `error`, `/design-system/**` preview (404 when `APP_ENV=production`, enforced in the proxy) |
| Routes | `/`, `/_not-found`, `/design-system`, `/design-system/{components,data-table,states}` (all dynamic since T-103) — from build output |
| `src/proxy.ts` | Per-request nonce + CSP; blocks preview routes in production. Runs on everything except `_next/static`, `_next/image`, `favicon.ico` |
| `src/lib/security` | `headers.ts` (CSP builder, static headers, nonce) |
| `src/lib/env` | `schema.ts`, `server.ts`, `client.ts`; validated from `next.config.ts`. No consumers yet |
| `src/components` | `ui/*` (shadcn), `app-shell/*`, `data-table`, `status-badge`, `state-view`, `confirm-dialog`, `style-nonce`, theme provider/toggle |
| `src/modules` | DOES NOT EXIST yet |
| Auth / API routes / server actions | NONE |
| `supabase/` (config, migrations, RLS policies, seed) | DOES NOT EXIST |
| Tests | unit: `env` (16), `navigation` (4), `security-headers` (10), `preview-routes` (10); security: `lint-guards` (7); e2e: `smoke` (2), `design-system` (27, axe + screenshots), `security-headers` (11); every e2e test asserts 0 CSP violations. No integration or RLS tests |
| CI | `.github/workflows/ci.yml` (quality + e2e jobs), `.github/dependabot.yml` — green on PR #1 and `main` |
| `vercel.json` / `vercel.ts` | NONE |
| `.env.example` / `.env*` | `.env.example` committed (names only). No other `.env*` files |
| `.gitignore` | ignores `.env*`, allows `.env.example` |
| `public/` | empty (5 starter SVG deletions still uncommitted; no longer referenced) |

## Commands (verified from `package.json`)

`npm run dev` · `npm run build` · `npm run start` · `npm run lint` · `npm run typecheck` ·
`npm run format` · `npm run format:check` · `npm test` · `npm run test:watch` · `npm run test:e2e` · `npm run check:bundle`

## Last verification (2026-10-11; local on `298f468` + T-103 tree)

| Check | Command | Result | Notes |
|---|---|---|---|
| format | `npm run format:check` | PASS | |
| lint | `npm run lint` | PASS | exit 0, no findings |
| typecheck | `npm run typecheck` | PASS | `next typegen && tsc --noEmit` |
| unit/security | `npm test` | PASS | 5 files, 47 tests |
| env gate | `APP_ENV=production npm run build` without variables | FAILS as required | passes with complete fake test values |
| bundle scan | `npm run check:bundle` | PASS | 37 files |
| build | `npm run build` | PASS | 6 dynamic routes + proxy |
| e2e + axe + headers | `npm run test:e2e` | PASS | 40 tests, chromium, production build; 0 axe violations; 0 CSP violations |
| production probe | `APP_ENV=production` build + `curl` | PASS | headers on `/`; preview routes 404 incl. encoded / prefetch / RSC variants; 0 `.map` files |
| audit (prod) | `npm audit --omit=dev --audit-level=high` | PASS | 0 vulnerabilities |
| audit (full) | `npm audit` | FAIL | 5 high in dev lint chain (ISSUE-002) |
| CI on GitHub | runs 38092060412 (PR #6), 38092152082 (`main`, `298f468`) | PASS | T-102 tree; T-103 NOT RUN on GitHub |
| supabase / RLS tests | — | NOT RUN | none exist |

## Environments / deployment / integrations

| Item | State |
|---|---|
| Local env vars | none defined; none required when `APP_ENV` is local/test |
| Database | NONE (no Supabase project linked in repo) |
| Deployment | UNKNOWN — no deploy config in repo; no evidence of a Vercel project |
| Staging / production | UNKNOWN — no evidence either exists |
| External integrations | NONE implemented; all `NOT_STARTED` |
| Production access | NOT USED |

## Completed milestones (with evidence)

- T-000 repository inventory + checks (commit `154af40`).
- T-100 tooling + CI skeleton — PR #1 merged to `main` as `3c6b99c` (2026-10-10); CI green.
- T-101 env validation — PR #5 merged to `main` as `e65fc07` (2026-10-10); CI green.
- T-102 design tokens, theming, app shell, base components — PR #6 merged to `main` as `298f468` (2026-10-10); CI green.
- ADR-001 ACCEPTED (modular monolith, `src/`); ADR-002..008 `Decision: PENDING`.

## Current task

T-103 — implemented and locally verified; not COMPLETED until CI is green on GitHub. See `CURRENT_TASK.md`.

## Blockers

- T-103 completion: commit + push + PR need owner go-ahead.
- Org-creation mode (self-serve vs provisioned) open before T-107.
- Supabase CLI not installed — required from T-104/T-105.

## Docs vs. implementation discrepancies

1. `.claude/settings.json` allows `pnpm lint/test/typecheck/build`; the package manager is npm (ISSUE-004b).
2. `docs/ai/COST_MATRIX.md` (Day 0 required output) does not exist (ISSUE-006).
3. Several `docs/ai/*.md` files end with leftover generation-prompt text (ISSUE-006).
4. Open Dependabot PRs: `typescript` 7.0.2 (CI failing), `eslint` 10.12.0, `@types/node` 26.6.4 (conflicts with Node 22 pin).

## Last updated

2026-10-11
