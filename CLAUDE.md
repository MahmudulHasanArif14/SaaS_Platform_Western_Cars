# CLAUDE.md — Operating Manual

Keep this file short. Detail lives in `docs/`.

## Project
Multi-tenant company infrastructure & operations platform (domains, DNS, hosting, deployments,
payments, CRM, tasks, support, chat/WebRTC, HR/salary). Modular monolith: Next.js App Router + Supabase.

## Current stage
See `docs/ai/CURRENT_TASK.md`. Work on that task only. Do not start the next one.

## Session start
1. Read this file → `docs/ai/CURRENT_TASK.md` → `docs/ai/WORKSPACE_STATE.md`.
2. `git status`, `git branch --show-current`.
3. Grep for the relevant code; read only what the task touches.

## Where things live
- Routes/UI: `src/app/**` (Server Components by default; `"use client"` only for interactivity)
- Business logic: `src/modules/<module>/*.service.ts`
- Authorization: `src/lib/authorization/*` (`requireAuth`, `requirePermission`, `requireStepUp`)
- Supabase clients: `src/lib/supabase/{server,client,admin}.ts` (`admin` is server-only)
- Provider adapters: `src/modules/integrations/providers/<provider>/*`
- Env access: `src/lib/env/{server,client}.ts` only — never raw `process.env` elsewhere
- Migrations: `supabase/migrations/*` — every schema change is a migration
- Tests: `tests/{unit,integration,security,rls,e2e}`

## Commands (replace with real scripts after Day 0)
`<pm> run lint` · `<pm> run typecheck` · `<pm> test` · `<pm> run test:e2e` · `<pm> run build`
`supabase db reset` · `supabase migration new <name>` · `supabase test db`

## Hard rules
- Never expose secrets to the browser or use `NEXT_PUBLIC_` for secrets.
- Never trust client-supplied `organization_id`, role, amount, provider or ownership.
- Authorization is enforced server-side AND by RLS. UI hiding is not security.
- Never use `getSession()` for authorization on the server — use `getClaims()`/`getUser()`.
- No tokens in `localStorage`; sessions live in httpOnly cookies via `@supabase/ssr`.
- Never store card data. Verify every webhook signature. Dedupe by provider event ID.
- No fake success: "link created" ≠ "paid", "token saved" ≠ "connected".
- No `select('*')` on sensitive tables. Return DTOs.
- Don't add dependencies without recording why in `docs/ai/DECISIONS.md`.

## Session end
Update `CURRENT_TASK.md`, `WORKSPACE_STATE.md`, `SESSION_LOG.md` (+ KNOWN_ISSUES / INTEGRATION_STATUS /
PRODUCTION_READINESS if changed). Report: Changed · Validated · Remaining · Next Step.

## Git
Conventional commits (`feat(dns): …`, `fix(rls): …`). Small commits. Branches `feature/*`, `fix/*`.
