# Known Issues

This document contains verified bugs, blockers, limitations, technical debt, integration problems, security concerns, and incomplete work.

It is a living document.

Claude must read this file before starting a task and update it when issues are discovered, resolved, deferred, or changed.

---

# Status Definitions

```text id="8m0c2a"
OPEN
IN_PROGRESS
BLOCKED
DEFERRED
MITIGATED
RESOLVED
WONT_FIX
DUPLICATE
```

# Severity Definitions

```text id="p6d1x4"
CRITICAL
HIGH
MEDIUM
LOW
```

## Severity Guidance

### CRITICAL

Potential:

- data loss
- cross-tenant data exposure
- authentication bypass
- privilege escalation
- production payment corruption
- production database compromise
- secret exposure

Must block production release.

### HIGH

Major functionality, security, reliability, or operational problem.

Normally blocks production release for the affected subsystem.

### MEDIUM

Important but does not normally prevent the core platform from operating.

### LOW

Minor bug, UX issue, documentation issue, or technical debt.

---

# 1. Current Issues

## CRITICAL

```text id="kq5xg2"
None
```

## HIGH

```text id="y3q8w1"
None
```

## MEDIUM

```text id="4kq9dc"
ISSUE-002 (MITIGATED), ISSUE-009 (MITIGATED)
```

### ISSUE-002 — 5 high-severity advisories in the lint toolchain

```text
Status: MITIGATED (not fixed)
Severity: MEDIUM
Area: Dependencies (dev only)
Environment: LOCAL
First detected: 2026-10-10 (npm audit)
Last updated: 2026-10-10 (T-100)
Actual: braces (GHSA-vfj7-8cjw-p6xm, DoS) -> micromatch -> fast-glob -> @next/eslint-plugin-next -> eslint-config-next 16.4.0.
        `npm audit` (full tree) still reports 5 high.
Impact: Dev/lint dependency chain; not shipped.
Workaround: CI gate scoped to production deps: `npm audit --omit=dev --audit-level=high` (0 vulnerabilities,
            verified 2026-10-10). npm's suggested fix (`npm audit fix --force`) downgrades eslint-config-next to
            14.2.35 — a breaking change; do not apply.
Proposed fix: Upgrade when upstream ships a fix (weekly Dependabot), then widen the gate to the full tree.
Related task: T-100
Related files: package.json, package-lock.json, .github/workflows/ci.yml
Related decision: DECISIONS.md "CI audit gate scope"
```

## LOW

```text id="m7t3za"
ISSUE-004, ISSUE-006, ISSUE-007, ISSUE-010 (ISSUE-001, ISSUE-003, ISSUE-005, ISSUE-008 RESOLVED)
```

### ISSUE-001 — Home page references deleted images

```text
Status: RESOLVED
Severity: LOW
Area: UI (starter page)
First detected: 2026-10-10
Resolution: Starter page replaced in T-102; src/app/page.tsx no longer references any image.
Verification: E2E smoke passes; `grep -r "svg" src/app/page.tsx` has no match. (The 5 public/*.svg deletions are
              still uncommitted in the working tree and are now unreferenced.)
Related files: src/app/page.tsx, public/
```

### ISSUE-007 — Border token does not give 3:1 against surfaces

```text
Status: OPEN
Severity: LOW
Area: UI / accessibility (WCAG 1.4.11 non-text contrast)
First detected: 2026-10-10 (T-102, calculated; axe does not test this)
Actual: The brief's `--border` (#262a30 dark, #e3e6ea light) is roughly 1.3:1 against `--background`/`--surface`,
        while brief §3 asks for component boundaries >= 3:1. Fine for dividers; not enough to identify a form
        control by its border alone.
Impact: None today (no form inputs exist). Affects the first forms (T-104 login).
Proposed fix: Add a stronger `--input` border token before building forms; confirm values with the owner.
Related files: src/app/globals.css, docs/design/UI_UX_DESIGN_BRIEF.md
```

### ISSUE-008 — Theme script needs the CSP nonce

```text
Status: RESOLVED
Severity: LOW
Area: Security headers / theming
First detected: 2026-10-10 (T-102)
Resolution: T-103 passes the request nonce from the root layout to ThemeProvider.
Verification: E2E — every script tag carries the request nonce; theme tests pass with 0 CSP violations.
Related task: T-103
Related files: src/app/layout.tsx, src/components/theme-provider.tsx
```

### ISSUE-009 — `notFound()` in a layout answers 200 on streamed routes

```text
Status: MITIGATED
Severity: MEDIUM
Area: Security / routing
First detected: 2026-10-11 (T-103, production-build probe)
Actual: With a nonce-based CSP every route is rendered per request and streamed. The status line is sent before
        a nested layout runs, so `notFound()` there returns HTTP 200 with the not-found UI, and the page
        segment's content was still present in the response. `/design-system` did this in a production build.
Mitigation: `src/proxy.ts` rewrites preview routes to a 404 before rendering when `APP_ENV=production`
        (case, percent-encoding, RSC and prefetch variants probed: 404, no content). The layout check stays as
        a second layer.
Impact: Any future gate written only as `notFound()` / `redirect()` in a layout can leak the page payload and
        return the wrong status. Directly relevant to authentication (T-104) and org resolution (T-107).
Required: Decide access in `src/proxy.ts` and again in each page / data function; never rely on a layout alone.
          Add an E2E test for unauthenticated access that asserts the status and the absence of content.
Not covered: the production block is verified by a manual probe and a unit test of the matcher; E2E runs with
             `APP_ENV` unset, so CI does not exercise it.
Related task: T-103, T-104, T-107
Related files: src/proxy.ts, src/lib/preview-routes.ts, src/app/design-system/layout.tsx
```

### ISSUE-010 — No route is static

```text
Status: OPEN (accepted trade-off)
Severity: LOW
Area: Performance
First detected: 2026-10-11 (T-103)
Actual: A per-request nonce requires dynamic rendering (Next.js CSP guide), so the root layout sets
        `instant = false` and reads `headers()`. All 6 routes are server-rendered on demand; `cacheComponents`
        provides no static shell. `"use cache"` for data is unaffected.
Impact: Higher server cost per page view; no CDN caching of HTML. Not measured (NFR-02 has no baseline yet).
Proposed fix: None now — the authenticated app is dynamic anyway. If public marketing pages are added, serve
        them from a route group with a hash-based (SRI) policy instead of a nonce.
Related files: src/app/layout.tsx, src/proxy.ts
```

### ISSUE-003 — .gitignore would ignore .env.example

```text
Status: RESOLVED
Severity: LOW
Area: Environment / repo hygiene
First detected: 2026-10-10
Last updated: 2026-10-10 (T-101)
Resolution: `!.env.example` added to .gitignore and .env.example (names only) committed in T-101.
Verification: `git status` shows .env.example tracked; `git check-ignore .env.local` still matches `.env*`.
Note: .claude/settings.json denies the agent read/write on `.env.*`, which also matches .env.example; the file
      was created at the owner's explicit request. Narrow the rule if the agent should maintain it.
Related files: .gitignore
```

### ISSUE-004 — Docs and tooling config do not match the repo layout / package manager

```text
Status: OPEN (partly resolved in T-100)
Severity: LOW
Area: Documentation / tooling
First detected: 2026-10-10
Last updated: 2026-10-10 (T-100)
Actual: (a) RESOLVED — code moved to src/app, `@/*` -> `./src/*` (ADR-001).
        (b) OPEN — .claude/settings.json allowlists `pnpm lint/test/typecheck/build`; package manager is npm.
        (c) RESOLVED — scripts added; CLAUDE.md commands use npm.
Proposed fix: (b) owner replaces the pnpm entries with the npm equivalents (permission allowlist, not changed by the agent).
Related files: CLAUDE.md, .claude/settings.json, tsconfig.json, package.json
```

### ISSUE-005 — Turbopack workspace-root warning on build

```text
Status: RESOLVED
Severity: LOW
Area: Build (local environment)
First detected: 2026-10-10 (npm run build)
Actual: Next.js warned that it ignored a package-lock.json in the user home directory because it is outside the
        Git repository, and suggested setting `turbopack.root`.
Resolution: `turbopack.root: __dirname` set in next.config.ts (T-100).
Resolved date: 2026-10-10
Verification: `npm run build` output contains no warning.
Related files: next.config.ts
```

### ISSUE-006 — Leftover generation-prompt text and missing file in docs/ai

```text
Status: OPEN
Severity: LOW
Area: Documentation
First detected: 2026-10-10
Actual: Several docs end with the prompt that generated a document rather than document content (seen at the
        end of ARCHITECTURE.md, DATA_MODEL.md, THREAT_MODEL.md, ROADMAP.md, PROJECT_CONTEXT.md,
        INTEGRATION_STATUS.md, PRODUCTION_READINESS.md and this file). WORKSPACE_STATE.md had the same and was
        rewritten. docs/ai/COST_MATRIX.md (Day 0 required output) does not exist.
Impact: An agent reading a file tail may treat the stray prompt as an instruction.
Proposed fix: Remove the trailing prompt blocks; create COST_MATRIX.md. Needs owner go-ahead (doc cleanup).
```

Not assessed on Day 0 (nothing exists to assess): authentication, authorization, RLS, database, payments,
integrations, deployment, accessibility, performance. Missing test framework, CI, Supabase and env validation
are planned work (T-100..T-111), not bugs.

---

# 2. Issue Template

Every issue should contain:

```text id="6h2s1c"
ID:
Title:
Status:
Severity:
Area:
Environment:
First detected:
Last updated:
Detected by:
Description:
Impact:
Reproduction:
Expected:
Actual:
Root cause:
Workaround:
Proposed fix:
Dependencies:
Security impact:
Production impact:
Related task:
Related files:
Related decision:
Resolution:
Resolved date:
Verification:
```

Do not fill fields with guesses.

Use:

```text id="2n7f4p"
UNKNOWN
```

when the information has not yet been determined.

---

# 3. Example Issue

## ISSUE-001

```text id="a7d3kf"
Title:
DNS deletion does not currently require step-up authentication

Status:
OPEN

Severity:
HIGH

Area:
DNS

Environment:
STAGING

First detected:
2026-10-08

Description:
The current DNS deletion flow can reach the mutation endpoint without
an additional step-up authentication check.

Impact:
A compromised authorized session could potentially perform a high-risk
DNS operation.

Expected:
DNS deletion must require the appropriate permission plus step-up
authentication and confirmation.

Actual:
Permission is checked but step-up authentication is not yet implemented.

Root cause:
Step-up authentication has not yet been implemented.

Workaround:
Do not enable production DNS deletion.

Security impact:
HIGH

Production impact:
BLOCKED

Related task:
DNS security hardening

Resolution:
PENDING

Verification:
NOT_TESTED
```

---

# 4. Security Issues

Security-related issues must also be tracked here.

| ID      | Issue                | Severity | Status | Production Impact |
| ------- | -------------------- | -------- | ------ | ----------------- |
| SEC-001 | None currently known | —        | —      | —                 |

Potential security categories include:

```text id="h4q8z7"
Authentication
Authorization
RLS
Tenant isolation
IDOR
Privilege escalation
Session handling
Secrets
Encryption
File access
Webhooks
Payments
Rate limiting
CSRF
XSS
SSRF
SQL injection
Command execution
API abuse
Realtime authorization
WebRTC signaling
Logging/data leakage
```

Do not mark a category secure merely because no issue has been found.

Security verification belongs in:

```text id="4wq0a8"
THREAT_MODEL.md
SECURITY_BASELINE.md
PRODUCTION_READINESS.md
```

This file records discovered issues.

---

# 5. Database Issues

Track:

```text id="m1c5qk"
migration problems
RLS problems
constraint problems
index problems
query performance
data integrity
concurrency
locking
transaction failures
backup problems
restore problems
```

Example:

```text id="db-001"

Title:
Missing composite index for organization task queries

Status:
OPEN

Severity:
MEDIUM

Area:
Database

Environment:
STAGING

Impact:
Potential performance degradation as organization task volume grows.

Proposed fix:
Add organization_id/status index.

Production impact:
NOT CURRENTLY BLOCKING
```

---

# 6. Integration Issues

Track problems with:

```text id="d9x4z1"
Supabase
Stripe
Dojo
GitHub
Vercel
Cloudflare
cPanel
registrars
email
TURN/WebRTC
monitoring
```

Do not duplicate full integration information here.

The authoritative integration state remains:

```text id="y7v3m8"
docs/ai/INTEGRATION_STATUS.md
```

Example:

```text id="INT-001"

Title:
Dojo production credentials not available

Status:
BLOCKED

Severity:
HIGH

Area:
Dojo

Environment:
PRODUCTION

Description:
Production merchant credentials have not yet been provided.

Impact:
Dojo production payment verification cannot be completed.

Workaround:
Use Dojo sandbox/test environment.

Production impact:
Dojo cannot be marked PRODUCTION VERIFIED.

Related task:
Dojo production verification
```

---

# 7. Environment Issues

Track differences between:

```text id="7x1m4s"
LOCAL
TEST
STAGING
PRODUCTION
```

Examples:

- environment variable missing
- incorrect callback URL
- staging provider unavailable
- local service unavailable
- production-only behavior
- deployment configuration mismatch

Example:

```text id="ENV-001"

Title:
Production OAuth callback URL not configured

Status:
OPEN

Severity:
HIGH

Area:
Authentication

Environment:
PRODUCTION

Impact:
OAuth login cannot be production verified.

Production impact:
BLOCKED
```

---

# 8. Deployment Issues

Track:

```text id="a8z6w4"
build failures
deployment failures
runtime errors
environment variable issues
DNS issues
SSL issues
cache issues
rollback problems
migration deployment issues
```

Every production deployment problem should include:

```text id="h3x5m0"
deployment
commit
environment
timestamp
error
impact
rollback status
```

---

# 9. UI / UX Issues

Track:

```text id="p7z3r5"
layout problems
responsive issues
accessibility
dark mode
light mode
loading states
empty states
error states
keyboard navigation
mobile problems
```

Do not allow UI issues to become invisible technical debt.

Example:

```text id="UI-001"

Title:
DNS table is difficult to use on mobile

Status:
OPEN

Severity:
LOW

Area:
DNS UI

Environment:
ALL

Impact:
Mobile users need horizontal scrolling.

Proposed fix:
Create responsive card/table presentation.

Production impact:
NOT BLOCKING
```

---

# 10. Performance Issues

Track:

```text id="c3w8x1"
slow pages
slow database queries
large bundles
excessive client JavaScript
slow API requests
N+1 queries
memory problems
high provider API usage
Realtime scaling
WebRTC performance
```

Include measurements where available.

Example:

```text id="PERF-001"

Title:
Dashboard initial load exceeds target

Status:
OPEN

Severity:
MEDIUM

Area:
Dashboard

Environment:
STAGING

Measurement:
TBD

Expected:
Meet project performance budget.

Actual:
TBD

Proposed fix:
Measure server/client waterfall before optimization.
```

Never invent performance measurements.

---

# 11. Data Integrity Issues

Track any situation where two systems may disagree.

Examples:

```text id="x1k5m9"
payment says succeeded but local database says pending
DNS provider differs from local snapshot
deployment provider says success but health check fails
domain renewal differs from registrar
webhook received twice
job executed twice
```

These issues are particularly important.

Example:

```text id="DATA-001"

Title:
Payment reconciliation mismatch

Status:
OPEN

Severity:
HIGH

Area:
Payments

Description:
Provider reports payment succeeded while local payment record
remains pending.

Impact:
Financial status may be incorrect.

Required action:
Run reconciliation before changing payment status manually.

Production impact:
BLOCKED for affected payment flow.
```

---

# 12. Realtime / Chat Issues

Track:

```text id="q7v3c2"
message delivery
presence
typing indicators
read states
Realtime authorization
offline behavior
reconnection
duplicate messages
message ordering
attachments
```

Never solve realtime authorization problems by disabling security policies.

---

# 13. WebRTC Issues

Track:

```text id="f8y2k5"
signaling
STUN
TURN
NAT traversal
camera permissions
microphone permissions
reconnection
call state
browser compatibility
mobile compatibility
```

Example:

```text id="RTC-001"

Title:
TURN fallback has not been tested on restricted networks

Status:
OPEN

Severity:
HIGH

Area:
WebRTC

Impact:
Calls may fail for users behind restrictive NAT/firewalls.

Required:
Test TURN from independent networks.

Production impact:
WebRTC production verification blocked.
```

---

# 14. Payment Issues

Track separately because payment problems can have financial consequences.

```text id="pay-001"

Title:
Stripe webhook replay protection not implemented

Status:
OPEN

Severity:
CRITICAL

Area:
Stripe

Environment:
STAGING

Impact:
Repeated webhook events could potentially trigger duplicate processing.

Required:
Implement event-id idempotency and test replay behavior.

Production impact:
BLOCKED
```

Payment issues must never be silently ignored.

---

# 15. Staff / HR Issues

Track:

```text id="hr-001"
salary permissions
employee access
offboarding
role changes
leave calculations
expense approval
salary status
audit issues
```

Salary information must have explicit authorization.

Example:

```text id="HR-001"

Title:
Salary records currently visible to managers outside approved scope

Status:
OPEN

Severity:
CRITICAL

Area:
HR

Impact:
Unauthorized financial information disclosure.

Production impact:
BLOCKED

Required:
Fix server-side authorization and RLS, then add regression tests.
```

---

# 16. Customer Support Issues

Track:

```text id="sup-001"
ticket assignment
customer visibility
internal notes
attachments
SLA
notifications
customer portal
```

Customer users must never be able to access:

```text id="2h7n5x"
internal notes
staff-only conversations
internal salary information
other customers
other organizations
```

---

# 17. Technical Debt

Technical debt should not be mixed with actual bugs.

Track separately:

| ID     | Description  | Priority | Reason  | Target |
| ------ | ------------ | -------- | ------- | ------ |
| TD-001 | Example only | LOW      | Example | Later  |

Technical debt must have a reason.

Do not create unnecessary refactoring tasks.

---

# 18. Deferred Issues

Some issues are intentionally deferred.

Example:

```text id="defer8"
Title:
Advanced group WebRTC calling

Status:
DEFERRED

Severity:
LOW

Reason:
V1 supports 1-to-1 calling only.

Target:
Post-V1
```

A deferred item is not a bug if the current specification intentionally excludes it.

---

# 19. Known Limitations

Use this section for limitations that are understood and accepted.

```text id="lim82x"
None currently known.
```

Examples:

```text id="r2d4q7"
Registrar APIs differ by provider.
cPanel capabilities differ between hosts.
Some DNS propagation checks cannot guarantee global propagation.
WebRTC may require TURN for restrictive networks.
Some providers may not support all requested operations.
```

Only record verified limitations.

---

# 20. Blocked Work

Maintain:

## BLOCKED

```text id="b1x7m3"
T-107 — org-creation mode (self-serve vs operator-provisioned) undecided; D1 itself answered 2026-10-10 (SaaS, multi-tenant). Required: product owner.
T-104 / T-105 — Supabase CLI not installed and no supabase/ directory. Required: install CLI locally when the task starts.
```

Each blocked item must include:

```text id="g2k8p4"
What is blocked
Why
Who/what is required
Workaround
Next action
```

Example:

```text id="BLOCK-001"

Blocked:
Dojo production verification

Reason:
Merchant production credentials unavailable.

Required:
Production merchant account credentials.

Workaround:
Continue with sandbox.

Next action:
Request credentials from authorized account owner.
```

---

# 21. Resolved Issues

Do not delete resolved issues immediately.

Keep a short history.

Example:

```text id="res55a"
ISSUE-001
Status: RESOLVED

Resolution:
Added step-up authentication to DNS deletion.

Verification:
RLS/security/API tests passed.

Resolved:
2026-10-12
```

This provides historical context and prevents regressions.

---

# 22. Regression Protection

When a significant issue is resolved, add a regression test whenever practical.

Record:

```text id="reg7x2"
Issue:
Regression test:
Test location:
Verification:
```

Example:

```text
Issue: Cross-tenant client access
Regression test: rejects organization mismatch
Test: tests/security/tenant-isolation.test.ts
Status: PASS
```

---

# 23. Issue Ownership

Where the platform supports staff assignment, issues can have an owner.

```text id="owner12"
Owner:
Assigned:
Due:
Priority:
```

An issue may also become a task in the task-management system.

Do not duplicate the entire task system here.

Reference the task ID instead.

---

# 24. Update Rules

Claude must update this file when:

- discovering a real bug
- finding a security issue
- encountering a blocker
- discovering an integration limitation
- finding an environment problem
- discovering a deployment problem
- identifying technical debt
- resolving an issue
- changing the severity of an issue
- discovering that a previous issue has returned

Claude must NOT:

- invent issues
- mark issues resolved without verification
- hide issues to make production readiness look better
- delete historical critical/high issues
- mark a workaround as a permanent fix
- silently downgrade severity

---

# 25. Before Every Task

Claude should review:

```text
CLAUDE.md
CURRENT_TASK.md
WORKSPACE_STATE.md
KNOWN_ISSUES.md
```

Then inspect only the relevant additional documentation.

If a known issue affects the current task, address it or explicitly record why it remains unresolved.

---

# 26. End-of-Task Update

At the end of every task:

1. Review newly discovered issues.
2. Add new issues.
3. Resolve verified issues.
4. Update existing issue status.
5. Update severity if required.
6. Link related tasks.
7. Link relevant architectural decisions.
8. Update production impact.
9. Update verification evidence.

Do not leave the document stale.

---

# 27. Production Blocking Rule

The following must normally block production:

```text id="block90"
Unresolved critical security issue
Cross-tenant data exposure
Authentication bypass
Privilege escalation
Production secret exposure
Unverified payment integrity issue
Production database corruption
Unrecoverable backup/restore failure
Critical deployment failure
Critical data integrity issue
```

A high-severity issue may also block production depending on its scope and impact.

The final decision must be recorded in:

```text id="finalpr"
docs/ai/PRODUCTION_READINESS.md
```

---

# 28. Current Summary

## Open Critical

```text id="8s4zq2"
None
```

## Open High

```text id="5v7m1k"
None
```

## Open Medium

```text id="3j9p6c"
ISSUE-002 (MITIGATED), ISSUE-009 (MITIGATED)
```

## Open Low

```text id="6x2r8d"
ISSUE-004 (b only), ISSUE-006, ISSUE-007, ISSUE-010
```

## Blocked

```text id="4q7m0z"
T-107 (org-creation mode), T-104 / T-105 (Supabase CLI) — see section 20
```

## Deferred

```text id="2c8n5y"
None
```

## Last Updated

```text
2026-10-11
```

Create or update `docs/ai/KNOWN_ISSUES.md`.

Inspect actual repository evidence, failing tests, TODOs, incomplete integrations, and documented blockers.

Use a structured issue register with:

- Issue ID and title.
- Category and severity.
- Affected component or workflow.
- Actual observed behavior.
- Reproduction steps or supporting evidence.
- Expected behavior.
- Security, data, user, or operational impact.
- Workaround, if verified.
- Owner or responsible role.
- Status: OPEN, INVESTIGATING, BLOCKED, FIXED_PENDING_VERIFICATION, or VERIFIED_RESOLVED.
- Related task and resolution evidence.

Do not invent bugs to populate the file. If no issues are verified, state that no verified issues were identified during the inspection and list areas not yet assessed.

Distinguish bugs from planned functionality, unresolved design decisions, and environmental setup problems.

Never mark an issue resolved solely because code was changed. Require appropriate verification.
