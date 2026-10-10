# ENVIRONMENT MATRIX

| Environment | Supabase | Payments | Provider APIs | Deployment | Data |
| ----------- | -------- | -------- | ------------- | ---------- | ---- |
| LOCAL | Supabase CLI local stack | Stripe test mode / Dojo sandbox | sandbox/test accounts | `pnpm dev` | Synthetic seed only |
| TEST | Ephemeral local stack in CI | Signed fixtures; no network calls to live providers | mocked at adapter boundary + contract fixtures | CI | Synthetic |
| STAGING | Separate Supabase project | Test mode / sandbox | staging/test accounts | Vercel preview/staging | Synthetic or anonymised |
| PRODUCTION | Separate Supabase project | Live | Live | Vercel production | Real |

## Rules

- No production credentials outside PRODUCTION; no live payment keys outside PRODUCTION.
- Development never points at the production database.
- Each environment has its own encryption key (`ENCRYPTION_KEY`, versioned) and webhook secrets.
- Migrations reach STAGING before PRODUCTION; production migrations applied by CI only after staging verification.

## Current state (2026-10-10)

| Environment | Exists | Notes |
| --- | --- | --- |
| LOCAL | NO | No project scaffold yet. Docker available in the Claude cloud workspace (local stack feasibility to confirm at Day 1). |
| TEST | NO | No CI. |
| STAGING | NO | No Supabase project or Vercel project recorded. |
| PRODUCTION | NO | — |
