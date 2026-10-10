# Project Documentation Kit — Company Infrastructure & Operations Platform

This kit is the planning layer for the platform. It sits **on top of** the AI-workflow docs you already have
(`docs/ai/*`) and fills the gaps: PRD, TRD, App Flow, UI/UX Design Brief, Backend Schema,
Implementation Plan and Security Checklist.

> Status of everything in this kit: **PROPOSED**. Nothing here proves code exists.
> The repository, migrations and test results are the source of truth (see `docs/ai/WORKSPACE_STATE.md`).

---

## 1. Folder layout

```text
<repo-root>/
├── CLAUDE.md                          # short operating manual (template in this kit)
├── SETUP.md                           # how to install this kit + agent skills
├── docs/
│   ├── product/
│   │   ├── PRD.md                     # WHAT and WHY — users, scope, requirements, success metrics
│   │   └── AI_WEBSITE_BUILDER_SPEC.md # FUTURE product (P9) — not authorized yet
│   ├── technical/
│   │   ├── TRD.md                     # HOW — stack, NFRs, contracts, constraints
│   │   ├── APP_FLOW.md                # every user journey as screens → actions → server → states
│   │   └── BACKEND_SCHEMA.md          # tables, keys, constraints, RLS, indexes (proposed SQL)
│   ├── design/
│   │   ├── UI_UX_DESIGN_BRIEF.md      # visual direction, tokens, layout, components, a11y
│   │   ├── DESIGN_SYSTEM.md           # (existing prompt) detailed token/component spec
│   │   └── SCREEN_INVENTORY.md        # (existing prompt) route-by-route screen list
│   ├── plan/
│   │   └── IMPLEMENTATION_PLAN.md     # phases → milestones → tasks with exit gates
│   ├── security/
│   │   └── SECURITY_CHECKLIST.md      # verifiable release checklist (injection, auth, secrets, hygiene)
│   ├── ai/                            # (you already have these)
│   │   ├── PROJECT_CONTEXT.md  MASTER_SPEC.md  ARCHITECTURE.md  DATA_MODEL.md
│   │   ├── THREAT_MODEL.md  SECURITY_BASELINE.md  ROADMAP.md  CURRENT_TASK.md
│   │   ├── WORKSPACE_STATE.md  INTEGRATION_STATUS.md  KNOWN_ISSUES.md
│   │   ├── PRODUCTION_READINESS.md  ENVIRONMENT_MATRIX.md  SESSION_LOG.md
│   │   ├── DECISIONS.md  COST_MATRIX.md
│   │   └── decisions/ADR-XXX-*.md
│   └── runbooks/
│       ├── DEPLOYMENT.md  INCIDENT_RESPONSE.md  DISASTER_RECOVERY.md
└── prompts/
    ├── 00_BOOTSTRAP_PROMPT.md         # paste once into Claude Code to start Day 0
    └── DOC_PROMPTS.md                 # one prompt per document (regenerate / refresh)
```

## 2. Which document answers which question

| Question | Document | Owner role |
|---|---|---|
| What are we building, for whom, and how do we know it worked? | `product/PRD.md` | Product |
| Which technologies, limits, contracts and NFRs? | `technical/TRD.md` | Tech lead |
| What does the user click, and what happens on the server? | `technical/APP_FLOW.md` | Product + Eng |
| What does it look like? | `design/UI_UX_DESIGN_BRIEF.md` | Design |
| What are the tables and who can read them? | `technical/BACKEND_SCHEMA.md` | Backend |
| In what order do we build it? | `plan/IMPLEMENTATION_PLAN.md` | Tech lead |
| Is it safe to ship? | `security/SECURITY_CHECKLIST.md` | Security |
| What is the one task allowed right now? | `ai/CURRENT_TASK.md` | Whoever is working |
| What actually exists in the repo? | `ai/WORKSPACE_STATE.md` | Verified by tools |

## 3. Overlap rules (keep docs from duplicating each other)

- **PRD** states requirements as user-facing outcomes. It does not choose libraries.
- **TRD** turns PRD requirements into technical requirements with IDs (`TR-xxx`) that trace back to `FR-xxx`.
- **ARCHITECTURE.md** (existing) is the long-form design; **TRD** is the short contract list.
- **DATA_MODEL.md** (existing) is the logical model; **BACKEND_SCHEMA.md** is the physical proposal (SQL, RLS).
- **SECURITY_BASELINE.md** = rules. **THREAT_MODEL.md** = threats. **SECURITY_CHECKLIST.md** = tickable evidence.
- **ROADMAP.md** = phases. **IMPLEMENTATION_PLAN.md** = task-level breakdown with exit gates.

## 4. Session reading order for Claude (token-efficient)

1. `CLAUDE.md`
2. `docs/ai/CURRENT_TASK.md`
3. `docs/ai/WORKSPACE_STATE.md`
4. Only the sections of other docs the task touches (grep, don't read whole files).

## 5. Traceability IDs

| Prefix | Meaning | Lives in |
|---|---|---|
| `FR-` | Functional requirement | PRD |
| `NFR-` | Non-functional requirement | PRD / TRD |
| `TR-` | Technical requirement | TRD |
| `FLOW-` | App flow | APP_FLOW |
| `TBL-` | Table | BACKEND_SCHEMA |
| `SEC-` | Security check | SECURITY_CHECKLIST |
| `THREAT-` | Threat | THREAT_MODEL |
| `T-` | Implementation task | IMPLEMENTATION_PLAN |
| `ADR-` | Decision | ai/decisions |

A task (`T-`) must cite the `FR`/`TR`/`SEC` IDs it satisfies. A PR description cites the `T-` ID.
