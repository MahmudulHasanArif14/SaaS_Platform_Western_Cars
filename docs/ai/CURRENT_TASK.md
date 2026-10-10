# CURRENT TASK

## Stage

Phase 1 — T-100: Tooling and CI skeleton

## Status

IMPLEMENTED, locally verified — NOT yet COMPLETED (2026-10-10).

The acceptance criterion is "CI green on empty app". The workflow has never run on GitHub: the work is
uncommitted on `feature/t-100-tooling-ci` and has not been pushed. Committing and pushing need owner go-ahead.

## Scope delivered

| Item | Evidence |
|---|---|
| Strict TS (`noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`) | `tsconfig.json` |
| `src/` layout, `@/*` → `./src/*` | `src/app/*`, ADR-001 (ACCEPTED) |
| ESLint `no-restricted-imports` for admin client / provider adapters / provider SDKs in UI code (TR-001) | `eslint.config.mjs` |
| ESLint `react/no-danger` (no `dangerouslySetInnerHTML`) | `eslint.config.mjs` |
| Guards proven by tests | `tests/security/lint-guards.test.ts` (6 tests) |
| Prettier + `eslint-config-prettier` | `.prettierrc.json`, `.prettierignore` |
| Vitest | `vitest.config.mts`, `npm test` |
| Playwright (runs against a production build) | `playwright.config.ts`, `tests/e2e/smoke.spec.ts` |
| GitHub Actions: quality job + E2E job | `.github/workflows/ci.yml` |
| Audit gate (production deps) + weekly Dependabot (SEC-D05) | `ci.yml`, `.github/dependabot.yml` |
| Node pinned | `.nvmrc` (22), `engines.node >=22.12.0` |
| Scripts `typecheck`, `format`, `format:check`, `test`, `test:watch`, `test:e2e` | `package.json`, `CLAUDE.md` |

## Checks run locally (2026-10-10, `154af40` + working tree, Node v22.23.3, npm 10.9.9)

| Check | Result |
|---|---|
| `npm run format:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 1 file, 6 tests |
| `npm run build` | PASS — routes `/`, `/_not-found`; workspace-root warning gone |
| `npm run test:e2e` | PASS — 2 tests (chromium) |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| `npm audit` (full tree) | FAIL — 5 high, dev lint chain (ISSUE-002, not gated) |
| GitHub Actions run | NOT RUN — not pushed |

## Remaining to mark COMPLETED

1. Commit the T-100 changes (owner go-ahead).
2. Push the branch / open a PR and confirm both CI jobs are green.
3. If CI fails on Linux, fix and re-verify.

## Open items

- `.claude/settings.json` still allowlists `pnpm …` commands; package manager is npm (ISSUE-004b) — left for the owner.
- Dependabot will open PRs once the branch is merged to `main`.
- ADR-002..008 still `Decision: PENDING`. `docs/ai/COST_MATRIX.md` still missing (ISSUE-006).
- Org-creation mode (self-serve vs operator-provisioned) open before T-107.

## Recommended next task (NOT STARTED — requires explicit instruction)

**T-101** — `lib/env` server/client Zod validation + `.env.example`. Satisfies TR §14, SEC-C02.
Done when: build fails on a missing server var in prod mode. Also fixes ISSUE-003 (`!.env.example` in `.gitignore`).
Adds a runtime dependency (Zod) — record in `DECISIONS.md`.

## Do NOT implement yet

Domain CRUD · DNS · Hosting · Payments · Stripe · Dojo · CRM · Staff chat · WebRTC · HR · Salary.
