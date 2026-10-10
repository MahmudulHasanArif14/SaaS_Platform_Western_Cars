# DOC PROMPTS — regenerate or refresh one document at a time

Common preamble (prepend to every prompt below):

```text
Read CLAUDE.md and docs/README.md. Inspect the repository before writing; separate
VERIFIED (cite file) from PROPOSED. Do not change application code, install packages or
create migrations. Keep the document's existing IDs stable (FR-, TR-, FLOW-, TBL-, SEC-, T-).
Update only the target file. Report Changed · Validated · Remaining.
```

---

## 1. PRD — `docs/product/PRD.md`
```text
Update the PRD. Sections: problem, vision, goals/non-goals, personas (with "must never"),
release scope R0–R5 with gates, functional requirements as FR-xxx tables (M/S/C priority),
NFR summary, success metrics with numeric targets, assumptions, open decisions (owner + needed-by),
out of scope (AI builder → AI_WEBSITE_BUILDER_SPEC.md). User-facing outcomes only — no libraries.
```

## 2. TRD — `docs/technical/TRD.md`
```text
Update the TRD from PRD + docs/ai/ARCHITECTURE.md. Stack table with VERIFIED versions from the
lockfile; code structure; request pipeline (auth → org → permission → step-up → rate limit →
validate → service → audit → DTO); TR-xxx tables for auth, tenancy/RLS, high-risk actions,
payments, DNS, realtime/WebRTC, CI gates, security headers, observability, env var NAMES only,
NFR targets with verification method, ADR list. Each TR traces to FR/NFR IDs.
```

## 3. APP FLOW — `docs/technical/APP_FLOW.md`
```text
Update app flows using the real route structure. For each FLOW-xx: actor, screens/routes,
steps, server checks (permission, step-up, validation), resulting states, failure paths.
Use Mermaid for the navigation map, DNS change sequence and payment flow. End with the
standard screen states table (loading/empty/error/forbidden/not-found/pending/destructive).
```

## 4. UI/UX DESIGN BRIEF — `docs/design/UI_UX_DESIGN_BRIEF.md`
```text
Use the frontend-design skill. Update the brief: product feel, principles, audience, visual
direction (type, scale, spacing, radius, elevation, icons, motion), semantic colour tokens for
dark + light with contrast ≥ 4.5:1, layout (shell, page, detail, mobile), signature components,
top 10 screens, microcopy rules, WCAG 2.2 AA requirements, design deliverables, anti-patterns.
Align with existing Tailwind/shadcn config if present. Distinctive, calm, not template-like.
```

## 5. BACKEND SCHEMA — `docs/technical/BACKEND_SCHEMA.md`
```text
Update the physical schema proposal from docs/ai/DATA_MODEL.md and existing migrations.
Conventions; phase→migration map; SQL for each table (PK, organization_id, composite FKs
(organization_id, id), check constraints, indexes); private schema for secrets/webhooks/
idempotency/helpers (security definer, search_path=''); RLS policies using
private.has_permission(); payment state-transition trigger; customer vs internal visibility;
storage path rules; pgTAP 5-case template. Label as PROPOSED — not a migration.
```

## 6. IMPLEMENTATION PLAN — `docs/plan/IMPLEMENTATION_PLAN.md`
```text
Update the plan from ROADMAP.md + WORKSPACE_STATE.md. Phases → tasks T-xxx sized for one
session each, with satisfies (FR/TR/SEC) and done-when. Definition of Done, phase gates,
Mermaid dependency graph of the critical path, plan-level risk register. Mark tasks already
done in the repo as DONE with evidence. Don't authorize tasks — CURRENT_TASK.md does that.
```

## 7. SECURITY CHECKLIST — `docs/security/SECURITY_CHECKLIST.md`
```text
Update the checklist. Groups:
A Injection & input: SQL injection, input validation, XSS, CSRF, file upload validation, SSRF,
  open redirect, CSV/header injection.
B AuthN/AuthZ: BOLA/IDOR fixed, function-level auth, rate limiting, password hashing, MFA +
  step-up, server-side permissions, RLS enabled on every table, session security, separation of
  duties, privilege escalation.
C Secrets & tokens: JWT signing keys, API secrets server-only, no tokens in localStorage,
  default credentials changed, encrypted provider credentials, secret scanning, rotation runbook.
D Config & hygiene: CORS, webhook signatures, no exposed source maps, sensitive data out of logs,
  vulnerable dependencies updated, security headers, error leakage, env separation, Supabase
  hardening, agent-skills review.
Each row: ID · check · how · verify (concrete test) · status · evidence. Add release-gate list.
```

## 8. Existing docs/ai files (refresh)
```text
Refresh docs/ai/<FILE>.md following the instructions at the bottom of that file
(PROJECT_CONTEXT, ARCHITECTURE, DATA_MODEL, THREAT_MODEL, ROADMAP, INTEGRATION_STATUS,
KNOWN_ISSUES, PRODUCTION_READINESS, WORKSPACE_STATE, CURRENT_TASK). Move those trailing
"Create or update…" instructions into this prompts file and delete them from the doc body.
```

## 9. Design system / screen inventory
```text
Run the instructions in docs/design/DESIGN_SYSTEM.md (resp. SCREEN_INVENTORY.md) — they are
prompts, not finished docs. Replace the prompt text with the generated document. Reuse tokens
from UI_UX_DESIGN_BRIEF.md so the two never disagree.
```

## 10. Runbooks
```text
Create docs/runbooks/DEPLOYMENT.md, INCIDENT_RESPONSE.md, DISASTER_RECOVERY.md from TRD and
SECURITY_BASELINE: preconditions, step-by-step commands, verification, rollback, owners,
secret-rotation steps (names only). Mark untested procedures UNTESTED.
```
