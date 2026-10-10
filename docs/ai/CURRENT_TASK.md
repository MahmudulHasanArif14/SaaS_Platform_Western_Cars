# CURRENT TASK

## Previous Task

DAY 0 — Architecture and Repository Discovery — **COMPLETED 2026-10-10** (documentation; see SESSION_LOG SESSION-001).

Acceptance criteria:
- Repository understood — done (docs only, no code)
- Existing functionality documented — PROJECT_CONTEXT.md
- Architecture documented — ARCHITECTURE.md
- Security boundaries — SECURITY_BASELINE.md, THREAT_MODEL.md (pre-existing), ARCHITECTURE.md §3–§5
- Database domains — DATA_MODEL.md (pre-existing)
- Development phases — ROADMAP.md §0
- External dependencies — COST_MATRIX.md, MASTER_SPEC A12/A18
- Check results — N/A recorded (no project to run)

## Next Recommended Task (NOT AUTHORIZED — requires explicit instruction)

### DAY 1 — Foundation, UI shell, theme system, authentication

Scope:
1. Read current official docs: Next.js (App Router), Supabase SSR/Auth/MFA, shadcn/ui, Tailwind. Record versions.
2. Scaffold Next.js + TypeScript (strict) + pnpm; ESLint; Vitest; Playwright config.
3. Tailwind + shadcn/ui + semantic design tokens; dark/light/system theme with persistence.
4. App shell: sidebar (permission-aware, only implemented modules), topbar, theme toggle, toasts, skeleton/empty/error states.
5. `lib/env/server.ts` + `client.ts` (Zod), `.env.example`.
6. Supabase SSR clients (server/browser), middleware session refresh, sign-in/up, email verification, reset, sign-out, protected routes.
7. Supabase CLI local stack + first migration only if needed for `profiles`.
8. CI: lint, typecheck, unit, build.

Out of scope: orgs/RBAC (Day 2), RLS hardening (Day 3), any business module.

Needs from owner: a Supabase project for STAGING (or approval to work against local stack only).

Acceptance: app runs locally; auth flows work against local Supabase; both themes pass contrast check; lint/typecheck/test/build pass in CI.
