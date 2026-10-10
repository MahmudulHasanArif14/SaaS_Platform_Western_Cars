# CURRENT TASK

## Stage

DAY 0 — Architecture and Repository Discovery (T-000)

## Status

COMPLETED (discovery scope) — 2026-10-10, with the open items listed below.

No task is currently authorized. The next task below is a recommendation only.

## Evidence

| Acceptance criterion | Result | Evidence |
|---|---|---|
| Repository understood | MET | `docs/ai/WORKSPACE_STATE.md` |
| Existing functionality documented | MET | create-next-app starter only; routes `/`, `/_not-found` (WORKSPACE_STATE) |
| Architecture documented | MET (target design, nothing built) | `docs/ai/ARCHITECTURE.md`, `docs/technical/TRD.md` §1.1 |
| Security boundaries documented | MET (rules/threats, no controls built) | `SECURITY_BASELINE.md`, `THREAT_MODEL.md`, `docs/security/SECURITY_CHECKLIST.md` (all NOT_STARTED) |
| Database domains documented | MET (proposal, no migrations) | `DATA_MODEL.md`, `docs/technical/BACKEND_SCHEMA.md` |
| Development phases documented | MET | `ROADMAP.md`, `docs/plan/IMPLEMENTATION_PLAN.md` |
| External dependencies documented | MET (none connected) | `INTEGRATION_STATUS.md` |
| lint/typecheck/test/build results recorded | MET | table below |

Checks run on commit `c7997c8` + working tree (npm 10.9.9, Node v22.23.3):

| Check | Result |
|---|---|
| `npm install` | PASS (lockfile unchanged) |
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS (no `typecheck` script) |
| `npm test` | FAIL — no `test` script, no test framework |
| `npm run build` | PASS (Next.js 16.4.0, Turbopack) |
| `npm audit` | FAIL — 5 high in dev lint chain (ISSUE-002) |
| `supabase status` | NOT RUN — no `supabase/` directory, CLI not installed |

## Open items (not done in Day 0)

- `docs/ai/COST_MATRIX.md` (listed in the original Day 0 required output) does not exist.
- ADR-001..008 are stubs with `Decision: PENDING` (`docs/ai/decisions/`).
- PRD decision D1 ANSWERED 2026-10-10: SaaS with multi-tenancy foundation (recorded in PRD §10, ADR-002 context).
  Sub-question still open before T-107: self-serve vs operator-provisioned org creation.
- Agent skills: 5 approved and committed (`9227aab`, branch `chore/agent-skills`); 4 removed.
- Day 0 docs and ADR stubs are still uncommitted.
- Issues found: `docs/ai/KNOWN_ISSUES.md` ISSUE-001..006.

## Recommended next task (NOT STARTED — requires explicit instruction)

**T-100** — Strict TS, ESLint rules (`no-restricted-imports` for admin/provider SDKs, no
`dangerouslySetInnerHTML`), Prettier, Vitest, Playwright, GitHub Actions skeleton.
Satisfies TR-001, SEC-D05. Done when: CI green on empty app. See `docs/plan/IMPLEMENTATION_PLAN.md` Phase 1.

Inputs T-100 needs (from Day 0):

- Package manager is npm; add `typecheck`, `test`, `test:e2e` scripts and update `CLAUDE.md` commands.
- Decide `src/` vs root `app/` (ADR-001) before adding structure.
- Decide how the `npm audit` gate treats ISSUE-002.
- Read `node_modules/next/dist/docs/` first (Next.js 16.4.0, per `AGENTS.md`).
- New dev dependencies must be recorded in `docs/ai/DECISIONS.md`.

## Do NOT implement yet

Domain CRUD · DNS · Hosting · Payments · Stripe · Dojo · CRM · Staff chat · WebRTC · HR · Salary.
