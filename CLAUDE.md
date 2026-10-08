# PROJECT OPERATING RULES

## Project

This repository is a production-grade multi-tenant company management platform.

The complete product specification is:

```text
docs/ai/MASTER_SPEC.md
```

Do not repeatedly reproduce the full specification in responses.

---

## Before Every Task

Read:

```text
CLAUDE.md
docs/ai/CURRENT_TASK.md
docs/ai/PROJECT_CONTEXT.md
docs/ai/ROADMAP.md
docs/ai/KNOWN_ISSUES.md
```

Then read only the relevant sections of:

```text
docs/ai/MASTER_SPEC.md
docs/ai/DATA_MODEL.md
docs/ai/SECURITY_BASELINE.md
docs/ai/DECISIONS.md
docs/ai/INTEGRATION_STATUS.md
```

Do not scan the entire repository unless necessary.

---

## Core Architecture

Use a modular monolith.

Primary stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase RLS
- Supabase Realtime
- Supabase Storage where appropriate

Keep business logic server-side.

Keep provider integrations behind adapters.

Keep secrets server-side.

---

## Security Rules

Never:

- expose secrets to browser code
- expose elevated Supabase credentials to clients
- trust frontend authorization
- disable RLS to solve a query problem
- store plaintext credentials
- commit secrets
- trust unverified webhooks
- expose salary information to unauthorized users
- allow cross-tenant access
- log tokens or secrets
- use production credentials during local development

Every mutation must verify:

1. Authentication
2. Organization membership
3. Permission
4. Resource access
5. Input validation
6. Business rules

High-risk operations must enforce step-up authentication and/or approval where required.

---

## Development Rules

Do not implement the entire application in one session.

Work in small vertical slices.

For every feature:

```text
Database
→ RLS
→ Permission
→ Server/business logic
→ Validation
→ UI
→ Audit
→ Tests
```

Keep the application runnable after every major stage.

Do not rewrite working code unnecessarily.

Do not add dependencies without a real reason.

Do not add infrastructure merely because it is architecturally interesting.

---

## UI Rules

The product must have a polished professional SaaS UI from the beginning.

Support:

- Dark mode
- Light mode
- System preference
- Responsive desktop/tablet/mobile
- Accessible components
- Loading states
- Empty states
- Error states
- Skeletons
- Toasts
- Confirmation dialogs

Use the established design system consistently.

Do not postpone UI quality until the end.

---

## Feature Priority

Implement in this order unless a technical dependency requires otherwise:

```text
1. Foundation + Security + UI
2. Domain Management
3. DNS Management
4. Hosting Management
5. Website / Environment Management
6. Generic Payment Architecture
7. Payment Requests
8. Stripe
9. Dojo
10. CRM / Clients
11. Tasks / Projects
12. Customer Support
13. Customer Portal
14. Staff Management
15. Staff Assignment / Reporting
16. Staff Chat
17. Realtime / Presence
18. WebRTC
19. HR
20. Salary / Payroll
21. Expenses / Leave
22. Approvals
23. GitHub
24. Vercel
25. Cloudflare
26. cPanel / Registrar integrations
27. Notifications
28. Monitoring / Incidents
29. Reports
30. Security hardening
31. Production release
```

Do not jump ahead to later modules unless explicitly instructed.

---

## Domain / Infrastructure Priority

Domain and infrastructure management are the first major business features.

First make these genuinely functional:

```text
Domains
DNS
Hosting
Websites
SSL
Provider relationships
```

Do not build fake provider information.

---

## Payments

Build a generic payment abstraction first.

Then implement:

```text
Stripe
Dojo
```

Do not scatter provider-specific payment logic throughout the application.

Never silently switch between Stripe and Dojo.

---

## Third-Party Integrations

Before implementing any external integration:

1. Read current official documentation.
2. Verify authentication.
3. Verify permissions/scopes.
4. Verify API behavior.
5. Verify webhook behavior.
6. Verify rate limits.
7. Verify production requirements.
8. Record findings in:

```text
docs/ai/INTEGRATION_STATUS.md
```

Never implement a provider from outdated memory or tutorials when official documentation is available.

---

## Environment Separation

Maintain strict separation:

```text
LOCAL
TEST
STAGING
PRODUCTION
```

Never use production credentials locally.

Never use live payment credentials for local tests.

Never point development at the production database.

---

## Testing

After meaningful changes run the relevant:

```text
lint
typecheck
unit tests
integration tests
RLS/security tests
build
```

Use E2E tests for important workflows.

Never claim a test passed unless it was actually run.

---

## Feature Status

Track actual evidence in project documentation:

```text
NOT_STARTED
DESIGNED
IMPLEMENTED
UNIT_TESTED
INTEGRATION_TESTED
E2E_TESTED
CONNECTED
PRODUCTION_VERIFIED
BLOCKED
DEGRADED
UNSUPPORTED
```

Code existence does not mean production readiness.

---

## End of Every Session

Update:

```text
docs/ai/CURRENT_TASK.md
docs/ai/SESSION_LOG.md
docs/ai/ROADMAP.md
docs/ai/KNOWN_ISSUES.md
```

Only update:

```text
docs/ai/DECISIONS.md
```

when an actual architectural decision is made.

Record:

```text
Completed
Files changed
Database changes
Tests
Security checks
Known issues
Remaining work
Next task
```

Keep documentation concise and factual.

---

## TASK COMPLETION AND NEXT-TASK RULE

After completing the current task:

1. Verify the implementation.
2. Run all relevant tests/checks.
3. Perform a security review.
4. Review the Git diff.
5. Update:
   - `docs/ai/CURRENT_TASK.md`
   - `docs/ai/SESSION_LOG.md`
   - `docs/ai/ROADMAP.md`
   - `docs/ai/KNOWN_ISSUES.md`
6. Mark the current task as `COMPLETED` only when its acceptance criteria have actually passed.
7. Write the next recommended task into `CURRENT_TASK.md`.
8. Clearly identify anything blocked, incomplete, placeholder-only, or requiring external credentials.
9. STOP after completing the current task.

Do NOT automatically implement the next task unless the user explicitly instructs you to continue.

The next task written into `CURRENT_TASK.md` is a recommendation/state transition, not permission to begin implementation.

## VS Code / Web / Session Continuity

The Git repository is the canonical source of truth.

Do not assume previous conversation context is available.

Before starting work:

1. Read CLAUDE.md.
2. Read docs/ai/CURRENT_TASK.md.
3. Read docs/ai/WORKSPACE_STATE.md.
4. Check git status.
5. Check current branch.
6. Check current commit.
7. Inspect relevant files.

After completing work:

1. Run relevant tests.
2. Review git diff.
3. Update project documentation.
4. Update WORKSPACE_STATE.md.
5. Update CURRENT_TASK.md.
6. Update SESSION_LOG.md.
7. Record the next task.
8. Do not begin the next task automatically.

Never assume that work performed in another VS Code or web session is available unless it exists in the current repository state.

## Project Memory Hierarchy

Use the following hierarchy:

1. MASTER_SPEC.md
   - Defines what the product should eventually be.

2. CLAUDE.md
   - Defines how Claude must work.

3. CURRENT_TASK.md
   - Defines what Claude is authorized to work on now.

4. WORKSPACE_STATE.md
   - Defines the current repository/session state.

5. ARCHITECTURE.md / DATA_MODEL.md / SECURITY_BASELINE.md
   - Define current technical decisions.

6. INTEGRATION_STATUS.md
   - Defines actual external integration state.

7. KNOWN_ISSUES.md
   - Defines known problems and blockers.

8. PRODUCTION_READINESS.md
   - Defines whether the system is actually ready for production.

When documents conflict, do not silently choose one.
Stop, identify the conflict, and resolve it according to the project's
approved architecture/decision process.

## Most Important Rule

Correctness, security, maintainability and verifiable functionality are more important than feature count.

Never fake functionality.
Never claim incomplete work is complete.
Never sacrifice security for convenience.

## Production Safety

Claude must never perform production-destructive operations automatically.

Never automatically:

- delete production domains
- modify production nameservers
- delete production DNS
- rotate production credentials
- delete production websites
- deploy to production
- issue refunds
- modify production payroll
- modify live payment configuration
- revoke production integrations
- delete production databases

For these operations:

1. Explain the action.
2. Show the intended change.
3. Identify the production resource.
4. Request explicit approval.
5. Execute only after approval.
6. Verify result.
7. Record audit information.
