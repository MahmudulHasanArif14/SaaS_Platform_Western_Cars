# Project Context

## Purpose

Multi-tenant internal company operations platform: infrastructure management (domains, DNS, hosting, websites, deployments, SSL), payments (Stripe, Dojo), CRM, tasks/projects, support + customer portal, staff management, chat/calls, HR and salary records, audit and security. A separate customer-facing AI Website Builder is a later, gated product (MASTER_SPEC A17).

Full specification: `docs/ai/MASTER_SPEC.md` (Part A = product spec, Part B = implementation rules).

## Current stage

- Stage: **DAY 0 — Architecture & repository discovery** (documentation only)
- Next stage: DAY 1 — Foundation, UI shell, theme system, authentication (not started; requires authorization)

## Verified repository state (2026-10-10, commit `3b7f3c9`)

| Item | State |
| --- | --- |
| Application code | None |
| `package.json` / lockfile | None — package manager not yet chosen in code; `.claude/settings.json` allow-lists `pnpm` |
| Next.js / React / TypeScript | Not installed |
| Supabase packages / `supabase/` dir / migrations | None |
| Auth implementation | None |
| API routes / Server Actions / middleware | None |
| Tests | None |
| Deployment config | None |
| CI | None |
| `.env*` files | None present |
| Docs | `CLAUDE.md`, `docs/ai/*` (this set) |

lint / typecheck / test / build: **not runnable** (no project). Recorded as N/A, not as pass.

## Stack (planned — see ARCHITECTURE.md)

Next.js App Router · TypeScript · Tailwind CSS · shadcn/ui · Lucide · React Hook Form · Zod · Supabase (Postgres, Auth, RLS, Realtime, Storage, queues/cron) · pnpm.

Versions to be pinned at Day 1 from current stable releases after checking official docs.

## Delivery order

Foundation/security/UI → Domains → DNS → Hosting → Websites/environments → SSL/health → Payments (generic → Stripe → Dojo) → CRM → Projects/Tasks → Support → Customer portal → Staff → Chat/Realtime → WebRTC → HR/Salary → Advanced integrations → Monitoring/Incidents → Hardening/Release. See `ROADMAP.md` §0.

## Key constraints

- No fake data, fake integrations, or fake "connected" states.
- Secrets server-only, encrypted at rest; elevated Supabase key never in the browser.
- Every mutation: auth → membership → permission → resource access → validation → business rules.
- High-risk actions: step-up + audit (+ approval where configured).
- Stop after each task; next task requires explicit authorization.
