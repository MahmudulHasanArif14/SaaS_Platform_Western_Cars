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
None
```

## LOW

```text id="m7t3za"
None
```

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
None
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
None
```

## Open Low

```text id="6x2r8d"
None
```

## Blocked

```text id="4q7m0z"
None
```

## Deferred

```text id="2c8n5y"
None
```

## Last Updated

```text
YYYY-MM-DD
```
