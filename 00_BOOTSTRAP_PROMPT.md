# 00 — Bootstrap prompt (paste once into Claude Code at the repo root)

```text
You are acting as a system designer and senior engineer for the
"Company Infrastructure & Operations Platform" (Next.js App Router + TypeScript + Supabase,
modular monolith, multi-tenant).

TASK: DAY 0 — Repository discovery and documentation initialization. No feature code.

1. Read, in this order and only these first:
   CLAUDE.md → docs/ai/CURRENT_TASK.md → docs/ai/WORKSPACE_STATE.md → docs/README.md
2. Inspect (do not modify): package.json + lockfile, next.config.*, tsconfig.json, eslint config,
   src/ or app/, supabase/ (config, migrations), middleware/proxy, .env.example, .gitignore,
   existing tests, CI files, vercel.json. Detect the package manager from the lockfile.
3. Run and record PASS/FAIL/NOT RUN with reasons:
   git status; git branch --show-current; git log --oneline -10;
   <pm> install; <pm> run lint; typecheck; <pm> test; <pm> run build;
   supabase status (only if supabase/ exists).
4. Fill docs/ai/WORKSPACE_STATE.md with VERIFIED facts only. Mark unknowns UNKNOWN.
5. Reconcile the planning docs with reality — update, don't rewrite:
   docs/product/PRD.md, docs/technical/TRD.md, docs/technical/APP_FLOW.md,
   docs/technical/BACKEND_SCHEMA.md, docs/design/UI_UX_DESIGN_BRIEF.md,
   docs/plan/IMPLEMENTATION_PLAN.md, docs/security/SECURITY_CHECKLIST.md.
   Where the repo already has something (stack, versions, routes, tables), replace the
   "PROPOSED" assumption with the verified value and cite the file.
6. Create docs/ai/decisions/ADR-001..008 stubs listed in TRD §16 (Context, Options, Decision=PENDING).
7. Run `npx skills add vercel-labs/agent-skills`, show me the diff of what was added,
   and do NOT commit it until I approve.
8. List PRD open decisions D1–D8 that block Phase 1 and ask me only those that block T-100..T-111.
9. Update CURRENT_TASK.md (status + evidence), SESSION_LOG.md (one entry), KNOWN_ISSUES.md
   (only verified issues). Set the recommended next task to T-100 but do not start it.

Rules: smallest change; never write secrets into docs; never mark anything
CONNECTED/VERIFIED/PASS without evidence; don't install app dependencies; stop when done.

Final report format: Changed · Validated · Remaining · Next Step.
```

## Per-session prompt (every later session)

```text
Read CLAUDE.md, docs/ai/CURRENT_TASK.md and docs/ai/WORKSPACE_STATE.md.
Do only the current task (<T-ID>). Read only the doc sections it cites (FR/TR/SEC/FLOW/TBL IDs).
Plan briefly → implement → run lint/typecheck/tests/build (+ supabase test db if schema changed)
→ review git diff → update CURRENT_TASK, WORKSPACE_STATE, SESSION_LOG, SECURITY_CHECKLIST evidence.
Report Changed · Validated · Remaining · Next Step. Stop.
```

## Security review prompt (before each release gate)

```text
Act as an application security reviewer. Using docs/security/SECURITY_CHECKLIST.md,
check each item against the actual code/config/tests. For every item output:
ID · status (NOT_STARTED/IMPLEMENTED/TESTED/VERIFIED) · evidence path · gap · fix.
Specifically test: SQL injection, input validation, XSS, CSRF, file upload, SSRF, BOLA/IDOR,
rate limiting, password hashing, MFA/step-up, server-side permissions, RLS on every table,
JWT/key handling, server-only secrets, no tokens in localStorage, default credentials,
CORS, webhook signatures, exposed source maps, log redaction, vulnerable dependencies.
Do not mark anything VERIFIED without a passing test or config evidence. Do not fix yet — report.
```
