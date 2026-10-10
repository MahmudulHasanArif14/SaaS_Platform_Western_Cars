# ADR-001 — Modular monolith

| Field | Value |
|---|---|
| Status | ACCEPTED (layout implemented in T-100; owner confirmation of the record still open) |
| Date | 2026-10-10 |
| Deciders | Architecture fixed by project `CLAUDE.md`; `src/` sub-decision taken in T-100 |
| Related | TRD §2, `docs/ai/ARCHITECTURE.md`, T-100 |

## Context

The platform spans many domains (infrastructure, payments, operations, chat, HR). On Day 0 the repo was a single Next.js 16.4.0 app with only the create-next-app starter (`app/`, no `src/`, no modules), while `CLAUDE.md` and TRD §2 assume `src/app`, `src/modules`, `src/lib`.

## Options

1. Modular monolith: one Next.js app, `modules/<module>` boundaries enforced by lint.
2. Monorepo with separate packages/apps.
3. Separate services per domain.

Sub-question: keep root `app/` or move to `src/app` as the docs assume.

## Decision

Option 1 — modular monolith, as required by `CLAUDE.md` ("Use a modular monolith").

Application code lives under `src/` (`src/app`, later `src/modules`, `src/lib`, `src/components`); `@/*` maps to `./src/*`. Tests live in root `tests/`.

## Consequences

- Security: the UI/server boundary is enforced by ESLint `no-restricted-imports` on `src/app/**` and `src/components/**` (TR-001) and proven by `tests/security/lint-guards.test.ts`. Lint is a guard, not a control — server-side authorization and RLS remain mandatory.
- Cost: none.
- Migration: `app/*` moved to `src/app/*` (git renames, 4 files) while the app was still the starter; no imports needed changing. Docs and repo layout now agree.
