# Company Infrastructure & Operations Platform — Roadmap

## 1. Purpose

This roadmap defines the planned implementation order for the platform.

It is the high-level execution plan.

It does NOT replace:

- `MASTER_SPEC.md` — product requirements
- `CURRENT_TASK.md` — current authorized task
- `WORKSPACE_STATE.md` — actual repository state
- `ARCHITECTURE.md` — technical architecture
- `DATA_MODEL.md` — database design
- `SECURITY_BASELINE.md` — security requirements
- `INTEGRATION_STATUS.md` — actual external integration state
- `KNOWN_ISSUES.md` — known problems
- `PRODUCTION_READINESS.md` — production verification
- `SESSION_LOG.md` — historical session record

---

# 2. Roadmap Principles

The project must follow these principles:

1. Security before convenience.
2. Database integrity before UI polish.
3. Authorization before feature exposure.
4. Real integrations before fake/demo integrations.
5. Verification before marking work complete.
6. Small vertical slices instead of massive feature batches.
7. One focused task at a time.
8. Every completed task must have evidence.
9. Never skip RLS/RBAC testing.
10. Never expose provider credentials to the browser.
11. Never store payment card details.
12. Never claim an integration is connected without verification.
13. Never mark production-ready because the application merely builds.
14. Do not automatically start the next task without authorization.
15. Preserve project context between Claude Code, VS Code and Claude Web.

---

# 3. Priority System

## P0 — Critical Foundation

Nothing dependent on these should be considered production-ready until verified.

- Repository foundation
- Environment separation
- Authentication
- Multi-tenancy
- RBAC
- RLS
- Security baseline
- Database integrity
- Audit logging
- Secrets architecture
- Error handling
- Testing foundation
- Backup/recovery strategy

## P1 — Core Infrastructure

- Clients
- Websites
- Domains
- Registrars
- DNS
- Hosting
- Environments
- Deployments
- GitHub
- Vercel
- Cloudflare
- cPanel
- Infrastructure inventory

## P2 — Payments

- Payment abstraction
- Payment requests
- Stripe
- Dojo
- Payment links
- Webhooks
- Reconciliation
- Refunds
- Payment permissions
- Customer payment communication

## P3 — Company Operations

- CRM
- Tasks
- Projects
- Staff assignments
- Staff reports
- Customer support
- Managerial workflows
- Notifications

## P4 — Communication

- Staff chatrooms
- Direct employee messaging
- Realtime presence
- File attachments
- Notifications
- WebRTC calls
- Screen sharing
- Call history

## P5 — HR

- Employee records
- Salary records
- Pay periods
- Paid/unpaid tracking
- Salary history
- Manager approval
- Audit trail

## P6 — Reliability & Production Hardening

- Monitoring
- Alerts
- Incident management
- Background jobs
- Webhook processing
- Reconciliation
- Backup verification
- Disaster recovery
- Security testing
- Performance testing
- Accessibility
- Production release gates

---

# 4. Phase 0 — Project Discovery & Foundation

Status:

```text
IN_PROGRESS
Discovery (T-000) done 2026-10-10 — evidence: WORKSPACE_STATE.md.
Open: ADR-001..008 are PENDING stubs; PRD D1 unanswered; COST_MATRIX.md missing; foundation code not started.
```

## Goals

Understand the existing repository before changing anything.

## Tasks

- Inspect existing repository.
- Inspect package manager.
- Inspect Next.js version.
- Inspect TypeScript configuration.
- Inspect Tailwind/shadcn configuration.
- Inspect existing components.
- Inspect Supabase setup.
- Inspect environment variables.
- Inspect existing routes.
- Inspect existing API/server actions.
- Inspect authentication.
- Inspect database migrations.
- Inspect tests.
- Inspect deployment configuration.
- Identify technical debt.
- Identify existing functionality that must be preserved.

## Deliverables

```text
CLAUDE.md
MASTER_SPEC.md
ROADMAP.md
CURRENT_TASK.md
WORKSPACE_STATE.md
ARCHITECTURE.md
DATA_MODEL.md
SECURITY_BASELINE.md
INTEGRATION_STATUS.md
KNOWN_ISSUES.md
PRODUCTION_READINESS.md
SESSION_LOG.md
DECISIONS.md
CHANGELOG.md
```

## Exit Criteria

- Repository understood.
- Existing functionality documented.
- Architecture baseline documented.
- No unnecessary rewrite started.
- Initial task identified.

---

# 5. Phase 1 — Secure Application Foundation

Status:

```text
IN_PROGRESS — T-100 (tooling + CI skeleton) implemented and locally verified 2026-10-10; CI not yet run on GitHub. T-101+ NOT_STARTED.
```

## Goals

Create a secure technical foundation.

## Tasks

- Configure TypeScript strictness.
- Establish project conventions.
- Establish application/service/data-access layers.
- Configure validation.
- Configure structured errors.
- Configure logging.
- Configure request correlation IDs.
- Configure security headers.
- Configure environment validation.
- Establish server/client boundaries.
- Establish API conventions.
- Establish pagination conventions.
- Establish loading/error/empty-state patterns.
- Establish UI design tokens.
- Establish dark/light/system themes.
- Establish responsive layout.
- Establish accessibility baseline.

## Security

- No secrets in client bundles.
- No service-role key in browser.
- Server-only provider credentials.
- Input validation.
- Output validation where appropriate.
- Rate limiting strategy.
- SSRF protection.
- XSS protection.
- CSRF protection where applicable.
- Secure cookies.
- File upload limits.

## Exit Criteria

- Lint passes.
- Typecheck passes.
- Tests pass.
- Production build passes.
- Security baseline documented.

---

# 6. Phase 2 — Authentication & Multi-Tenancy

Status:

```text
NOT_STARTED
```

## Goals

Create the organization and identity foundation.

## Features

- Supabase Auth.
- User profiles.
- Organizations.
- Organization memberships.
- Invitations.
- Roles.
- Permissions.
- Custom roles where appropriate.
- Session management.
- MFA support.
- Reauthentication for sensitive operations.
- Account disable/revoke.
- Staff departure workflow.

## Roles

Example baseline:

```text
Super Admin
Organization Owner
Administrator
Manager
Finance
HR
Infrastructure
Support
Staff
Read Only
Customer
```

Roles should not be hard-coded into UI-only checks.

Use permission-based authorization.

## Exit Criteria

- Authentication verified.
- Tenant isolation verified.
- RLS policies tested.
- Cross-tenant access tests pass.
- Privilege escalation tests pass.

---

# 7. Phase 3 — Database & Authorization Hardening

Status:

```text
NOT_STARTED
```

## Goals

Build a reliable relational data foundation.

## Core entities

```text
organizations
users/profiles
memberships
roles
permissions
role_permissions
clients
contacts
websites
domains
registrars
dns_zones
dns_records
hosting_accounts
repositories
environments
provider_accounts
provider_credentials
tasks
support_tickets
chat_rooms
chat_members
chat_messages
payments
payment_links
payment_events
employees
salary_records
notifications
audit_logs
jobs
webhooks
incidents
```

## Requirements

- Foreign keys.
- Unique constraints.
- Check constraints.
- Appropriate indexes.
- Tenant ownership constraints.
- Transaction boundaries.
- Concurrency handling.
- Soft deletion where appropriate.
- Immutable audit records where appropriate.
- Migration discipline.

## Exit Criteria

- Schema reviewed.
- Migrations reproducible.
- RLS enabled.
- Authorization tests pass.
- Cross-tenant tests pass.

---

# 8. Phase 4 — Staff & Company Structure

Status:

```text
NOT_STARTED
```

## Features

- Employee directory.
- Departments.
- Teams.
- Manager relationships.
- Staff availability.
- Staff status.
- Assignment capabilities.
- Permissions.
- Workload visibility.
- Employee profile.
- Employee activity history.

## Staff lifecycle

```text
Invited
→ Active
→ Suspended
→ Departing
→ Disabled
```

Departure must support:

- Access revocation.
- Session revocation.
- Credential review.
- Task reassignment.
- Ownership reassignment.
- Preservation of audit history.

---

# 9. Phase 5 — Client & CRM

Status:

```text
NOT_STARTED
```

## Features

- Client records.
- Contacts.
- Customer notes.
- Documents.
- Websites.
- Domains.
- Hosting.
- Billing information.
- Communication history.
- Support history.
- Payment history.
- Internal notes.

## Requirement

The infrastructure relationship should be visible:

```text
Client
 ├── Websites
 │    ├── Domains
 │    ├── DNS
 │    ├── Hosting
 │    ├── Repository
 │    └── Deployments
 │
 ├── Payments
 ├── Support
 └── Tasks
```

---

# 10. Phase 6 — Task & Work Management

Status:

```text
NOT_STARTED
```

## Features

- Tasks.
- Projects.
- Assignment.
- Priority.
- Due dates.
- Status.
- Checklists.
- Dependencies.
- Comments.
- Attachments.
- Progress reporting.
- Assignment history.
- Manager approval.
- Escalation.
- Recurring tasks.
- Notifications.

## Employee workflow

A manager can assign:

```text
Task
→ Employee
→ Due date
→ Priority
→ Instructions
```

Employee can:

```text
Accept
→ Work
→ Add progress
→ Add report
→ Submit
```

Manager can:

```text
Review
→ Approve
→ Request changes
→ Reassign
→ Close
```

## Exit Criteria

- Assignment authorization tested.
- Employee cannot access unauthorized tasks.
- Manager controls verified.
- Audit events generated.
- Notifications tested.

---

# 11. Phase 7 — Domain Management

Status:

```text
NOT_STARTED
```

## Features

- Domain inventory.
- Registrar.
- Expiry.
- Renewal date.
- Client ownership.
- DNS provider.
- Nameservers.
- Auto-renew status.
- Renewal reminders.
- Domain status.

## Safety

Before destructive changes:

```text
Current configuration
        ↓
Preview changes
        ↓
Warning
        ↓
Confirmation
        ↓
Apply
        ↓
Verify
        ↓
Audit
```

Special warnings for:

- NS
- MX
- CAA
- SPF
- DKIM
- DMARC

Never assume registrar and DNS provider are the same service.

---

# 12. Phase 8 — DNS Management

Status:

```text
NOT_STARTED
```

## Features

- DNS zone discovery.
- Record listing.
- Record creation.
- Record modification.
- Record deletion.
- TTL.
- Provider synchronization.
- Verification.
- Propagation checks.
- Snapshots.
- Change history.

## Safety

Every DNS modification should support:

```text
Preview
→ Validate
→ Authorize
→ Apply
→ Verify
→ Audit
```

Handle partial failures and provider timeouts safely.

---

# 13. Phase 9 — Hosting & Website Management

Status:

```text
NOT_STARTED
```

## Features

- Website inventory.
- Hosting provider.
- Hosting account.
- Environment.
- Server status.
- SSL status.
- Domain mapping.
- Repository.
- Deployment status.
- Health checks.

Support provider adapters for:

```text
Vercel
Cloudflare
cPanel
Other providers
```

Provider-specific logic must not be embedded directly throughout the UI.

---

# 14. Phase 10 — Deployment & Infrastructure Operations

Status:

```text
NOT_STARTED
```

## Features

- Deployment history.
- Commit.
- Branch.
- Author.
- Environment.
- Logs.
- Status.
- Health checks.
- Deployment approval.
- Rollback where supported.
- Post-deployment smoke tests.
- Notifications.
- Audit trail.

## Deployment workflow

```text
Commit
→ Validate
→ Build
→ Approval
→ Deploy
→ Health Check
→ Smoke Test
→ Complete
```

If deployment fails:

```text
Failed
→ Diagnose
→ Retry or Rollback
→ Verify
→ Audit
```

---

# 15. Phase 11 — GitHub Integration

Status:

```text
NOT_STARTED
```

## Features

- Organizations.
- Repositories.
- Branches.
- Commits.
- Pull requests.
- Deployment relationships.
- Repository access.
- Integration health.

## Security

- OAuth/app-based authentication where appropriate.
- Least privilege.
- Token rotation.
- Revocation.
- No tokens in database plaintext.
- Integration ownership tracking.

---

# 16. Phase 12 — Cloudflare Integration

Status:

```text
NOT_STARTED
```

## Features

- Account connection.
- Zones.
- DNS.
- SSL status.
- Proxy status.
- Health status.
- Integration diagnostics.

Never assume Cloudflare is the DNS provider without verification.

---

# 17. Phase 13 — Vercel Integration

Status:

```text
NOT_STARTED
```

## Features

- Teams/projects.
- Domains.
- Deployments.
- Environments.
- Deployment status.
- Logs where available.
- Project configuration metadata.
- Health checks.

Credentials must remain server-side.

---

# 18. Phase 14 — cPanel Integration

Status:

```text
NOT_STARTED
```

## Features

Only implement capabilities confirmed by the specific cPanel environment/API.

Potential capabilities:

- Account status.
- Domains.
- SSL.
- Files.
- Databases.
- Email.
- DNS.
- Hosting usage.

Do not promise provider capabilities that cannot be verified.

---

# 19. Phase 15 — Payment Architecture

Status:

```text
NOT_STARTED
```

## Goals

Create one payment abstraction supporting multiple providers.

Architecture:

```text
Payment Service
      │
      ├── Stripe Adapter
      │
      └── Dojo Adapter
```

The UI must never directly implement provider credentials.

## Payment entity

Track:

- Customer.
- Amount.
- Currency.
- Provider.
- Payment link.
- Status.
- Expiry.
- Created by.
- Tenant.
- Reference.
- Provider ID.
- Webhook state.
- Reconciliation state.

---

# 20. Phase 16 — Stripe

Status:

```text
NOT_STARTED
```

## Features

- Customer/payment request.
- Payment link.
- Hosted checkout.
- Webhooks.
- Payment confirmation.
- Failed payment.
- Expiration.
- Refund workflow.
- Reconciliation.

## Security

- Server-side API.
- Signed webhook verification.
- Idempotency.
- No card storage.
- Least privilege.
- Audit logging.

---

# 21. Phase 17 — Dojo

Status:

```text
NOT_STARTED
```

## Features

Implement only capabilities verified against current Dojo documentation/API access.

Potential functionality:

- Payment request.
- Hosted checkout/payment link.
- Payment status.
- Webhooks.
- Reconciliation.
- Refund where supported.

Do not assume Stripe and Dojo have identical capabilities.

---

# 22. Phase 18 — Employee Payment-Link Workflow

Status:

```text
NOT_STARTED
```

## Workflow

Authorized employee:

```text
Create Payment Request
        ↓
Enter customer/order details
        ↓
Select provider
   ┌────┴────┐
 Stripe    Dojo
   └────┬────┘
        ↓
Server validates permission
        ↓
Create provider checkout/link
        ↓
Store safe metadata
        ↓
Return payment link
```

The employee can only select providers that:

- are enabled;
- are connected;
- are verified;
- are allowed for their organization;
- they have permission to use.

If a provider is unavailable, it must not appear as a usable option.

---

# 23. Phase 19 — Customer Payment Communication

Status:

```text
NOT_STARTED
```

Employees can send payment links through authorized channels.

Potential channels:

- Email.
- Support ticket.
- Customer portal.
- Internal workflow.
- Chat where appropriate.

Track:

```text
Created
Sent
Opened
Paid
Failed
Expired
Cancelled
Refunded
```

Do not claim a customer received/opened a message unless the communication provider provides evidence.

---

# 24. Phase 20 — Customer Support

Status:

```text
NOT_STARTED
```

## Features

- Support tickets.
- Customer messages.
- Internal notes.
- Assignment.
- Priority.
- Status.
- SLA.
- Attachments.
- Staff responses.
- Manager escalation.
- Payment requests.
- Customer history.

## Example workflow

```text
Customer
→ Ticket
→ Support Staff
→ Investigation
→ Manager escalation if required
→ Resolution
→ Customer notification
→ Close
```

Internal notes must never be exposed to customers.

---

# 25. Phase 21 — Managerial Support

Status:

```text
NOT_STARTED
```

## Features

- Escalations.
- Approval queues.
- Staff workload.
- Task review.
- Support escalation.
- Payment approval.
- Infrastructure approval.
- Incident management.
- Performance overview.

Managers should see operational dashboards based on their permissions.

---

# 26. Phase 22 — Staff Chatrooms

Status:

```text
NOT_STARTED
```

## Features

- Team rooms.
- Project rooms.
- Department rooms.
- Private rooms.
- Direct employee chat.
- Messages.
- Replies.
- Mentions.
- Attachments.
- Read status.
- Presence.
- Search.
- Notifications.

## Security

Chat authorization must be enforced by the database/application layer.

Never rely on hiding rooms in the UI.

---

# 27. Phase 23 — Realtime Infrastructure

Status:

```text
NOT_STARTED
```

Use Supabase Realtime where appropriate.

Potential realtime features:

- Chat messages.
- Presence.
- Task updates.
- Support updates.
- Notifications.
- Call signaling.

Do not use realtime for data that does not need realtime behavior.

---

# 28. Phase 24 — WebRTC

Status:

```text
NOT_STARTED
```

## Initial scope

- 1-to-1 audio.
- 1-to-1 video.
- Camera/microphone controls.
- Screen sharing.
- Call status.
- Incoming call.
- Outgoing call.
- Reconnection.
- Call history.

## Architecture

```text
User A
  │
  ├── Authenticated signaling
  │
  ▼
Supabase Realtime
  │
  ▼
User B

Media:
User A ←→ WebRTC ←→ User B
```

STUN/TURN must be evaluated.

Do not assume direct peer-to-peer connectivity works in every network.

TURN credentials should be handled securely and preferably be short-lived.

---

# 29. Phase 25 — HR & Salary Tracking

Status:

```text
NOT_STARTED
```

## Features

- Employee salary records.
- Pay periods.
- Salary amount.
- Paid/unpaid.
- Payment date.
- Payment reference.
- Proof/document.
- Approval.
- Salary history.
- Audit trail.

## Access

Salary information must be heavily restricted.

Example:

```text
Employee:
Own permitted information

Manager:
Only information explicitly authorized

HR:
HR records

Finance:
Payment information

Admin:
According to explicit organization policy
```

Do not implement tax/payroll calculations unless specifically required.

---

# 30. Phase 26 — Notifications

Status:

```text
NOT_STARTED
```

Support:

- In-app notifications.
- Email notifications.
- Task notifications.
- Support notifications.
- Payment notifications.
- Deployment notifications.
- Domain renewal reminders.
- Incident alerts.
- Chat notifications.

Use a centralized notification service.

---

# 31. Phase 27 — Background Jobs

Status:

```text
NOT_STARTED
```

Create durable job infrastructure for:

- Provider synchronization.
- Webhooks.
- Retries.
- Email.
- Notifications.
- DNS verification.
- Domain reminders.
- Health checks.
- Reconciliation.
- Scheduled tasks.

Job states:

```text
QUEUED
RUNNING
COMPLETED
FAILED
RETRYING
CANCELLED
DEAD_LETTER
```

Requirements:

- Idempotency.
- Exponential backoff.
- Retry limits.
- Dead-letter handling.
- Provider rate-limit handling.
- Observability.

Do not depend on long-running serverless requests.

---

# 32. Phase 28 — Webhooks & Reconciliation

Status:

```text
NOT_STARTED
```

Every provider webhook must support:

```text
Receive
→ Authenticate
→ Validate
→ Deduplicate
→ Store event
→ Process
→ Update state
→ Audit
```

If a webhook is missed:

```text
Scheduled reconciliation
→ Provider API
→ Compare state
→ Correct local state
→ Audit
```

Local state must never blindly assume provider state.

---

# 33. Phase 29 — Audit & Compliance Foundation

Status:

```text
NOT_STARTED
```

Audit events should include:

- Actor.
- Organization.
- Action.
- Resource.
- Resource ID.
- Timestamp.
- Result.
- Request/correlation ID.
- Relevant metadata.
- IP/device information where appropriate.

Never log:

- Passwords.
- API keys.
- Tokens.
- Card data.
- Sensitive secrets.

---

# 34. Phase 30 — Monitoring

Status:

```text
NOT_STARTED
```

Monitor:

- Application errors.
- API errors.
- Database health.
- Provider health.
- Job failures.
- Webhook failures.
- Authentication anomalies.
- Integration expiry.
- Deployment failures.
- Payment failures.
- Infrastructure health.

---

# 35. Phase 31 — Incident Management

Status:

```text
NOT_STARTED
```

Features:

- Incident creation.
- Severity.
- Owner.
- Timeline.
- Investigation notes.
- Related service.
- Related deployment.
- Related integration.
- Resolution.
- Post-incident review.

---

# 36. Phase 32 — Backup & Disaster Recovery

Status:

```text
NOT_STARTED
```

Define:

- Backup frequency.
- Retention.
- RPO.
- RTO.
- Database backup.
- Important file backup.
- Configuration backup.
- Secret recovery strategy.
- Restore procedure.

Most importantly:

```text
Backup exists
≠
Recovery verified
```

Perform periodic restore tests.

---

# 37. Phase 33 — Security Testing

Status:

```text
NOT_STARTED
```

Test:

- Authentication bypass.
- Authorization bypass.
- Cross-tenant access.
- Privilege escalation.
- RLS.
- IDOR.
- SSRF.
- XSS.
- CSRF.
- File upload abuse.
- Rate limiting.
- Webhook forgery.
- Replay attacks.
- Payment manipulation.
- Secret exposure.
- Session abuse.

Security tests must run against the application/database boundaries, not only the UI.

---

# 38. Phase 34 — Automated Quality Gates

Status:

```text
NOT_STARTED
```

Required where applicable:

```text
Lint
Typecheck
Unit tests
Integration tests
Security tests
Database migration tests
E2E tests
Build
Dependency audit
Secret scanning
```

CI should block merges/deployments when required gates fail.

---

# 39. Phase 35 — Accessibility & UX

Status:

```text
NOT_STARTED
```

Target:

```text
WCAG 2.2 AA
```

Verify:

- Keyboard navigation.
- Focus management.
- Screen-reader semantics.
- Contrast.
- Form labels.
- Error messages.
- Responsive layouts.
- Mobile usability.
- Loading states.
- Empty states.
- Error states.
- Confirmation states.

Support:

```text
Light
Dark
System
```

---

# 40. Phase 36 — Performance

Status:

```text
NOT_STARTED
```

Optimize:

- Server rendering.
- Data fetching.
- Database queries.
- Indexes.
- Pagination.
- Caching.
- Image delivery.
- Bundle size.
- Realtime subscriptions.
- Background processing.

Do not optimize prematurely at the expense of correctness.

---

# 41. Phase 37 — Production Verification

Status:

```text
NOT_STARTED
```

Production verification requires:

- Real authentication tested.
- Real database tested.
- RLS tested.
- RBAC tested.
- Real integrations verified.
- Payment flows verified.
- Webhooks verified.
- Background jobs verified.
- Backup verified.
- Recovery procedure tested.
- Monitoring active.
- Error handling verified.
- No critical/high unresolved security issues.
- Deployment rollback understood.

---

# 42. Phase 38 — Production Release

Status:

```text
NOT_STARTED
```

Final release process:

```text
Development
    ↓
Tests
    ↓
Staging
    ↓
Integration Verification
    ↓
Security Verification
    ↓
Backup Verification
    ↓
Smoke Tests
    ↓
Production
    ↓
Post-Deployment Health Check
    ↓
Production Verification
```

---

# 43. Implementation Strategy

Claude must NOT attempt to implement an entire phase in one task.

Instead use:

```text
Phase
 ↓
Milestone
 ↓
Task
 ↓
Implementation
 ↓
Tests
 ↓
Verification
 ↓
Documentation
 ↓
Next Task
```

Example:

```text
Phase 7: Domain Management

Milestone:
Domain inventory

Task:
Create domains database migration

↓

Task:
Create domain repository

↓

Task:
Create authorization rules

↓

Task:
Create domain API/server action

↓

Task:
Create domain UI

↓

Task:
Add tests

↓

Task:
Verify RLS

↓

Task:
Update documentation
```

---

# 44. Vertical Slice Rule

Whenever practical, implement a feature vertically:

```text
Database
 ↓
RLS
 ↓
Authorization
 ↓
Service
 ↓
API/Server Action
 ↓
Validation
 ↓
UI
 ↓
Tests
 ↓
Audit
 ↓
Documentation
```

Do not build a large UI first and postpone security/database logic.

---

# 45. Task Selection Algorithm

At the beginning of each session Claude should:

1. Read `CLAUDE.md`.
2. Read `CURRENT_TASK.md`.
3. Read `WORKSPACE_STATE.md`.
4. Check relevant `KNOWN_ISSUES.md`.
5. Check relevant `INTEGRATION_STATUS.md`.
6. Identify the current roadmap phase.
7. Verify the previous task.
8. Select only the task explicitly authorized by `CURRENT_TASK.md`.

Claude must not automatically jump several roadmap phases ahead.

---

# 46. Task Completion Algorithm

After implementation:

```text
1. Inspect changes.
2. Run targeted tests.
3. Run typecheck.
4. Run lint.
5. Run build when appropriate.
6. Run security/RLS tests when applicable.
7. Verify actual behavior.
8. Check git diff.
9. Update documentation.
10. Update CURRENT_TASK.md.
11. Update WORKSPACE_STATE.md.
12. Update KNOWN_ISSUES.md if necessary.
13. Update INTEGRATION_STATUS.md if necessary.
14. Update PRODUCTION_READINESS.md if necessary.
15. Append SESSION_LOG.md.
16. Recommend the exact next task.
17. Stop.
```

Do not start the next task automatically.

---

# 47. Roadmap Status Definitions

Use:

```text
NOT_STARTED
PLANNED
DESIGNED
IN_PROGRESS
IMPLEMENTED
TESTED
VERIFIED
BLOCKED
DEGRADED
UNSUPPORTED
COMPLETED
```

Important:

```text
IMPLEMENTED
≠
TESTED

TESTED
≠
PRODUCTION_VERIFIED
```

---

# 48. Roadmap Change Control

The roadmap may change when:

- Requirements change.
- A provider capability changes.
- Security requirements change.
- Architecture changes.
- A dependency becomes unavailable.
- A better implementation order is discovered.

When changing the roadmap:

1. Explain why.
2. Record the decision in `DECISIONS.md`.
3. Update this roadmap.
4. Update `CURRENT_TASK.md`.
5. Update `SESSION_LOG.md`.

Do not silently reorder major phases.

---

# 49. Current Roadmap Position

```text
Current Phase:
Phase 0 — Project Discovery & Foundation

Current Milestone:
Repository and AI workflow initialization

Current Task:
Inspect repository and establish verified project state

Next Planned Phase:
Phase 1 — Secure Application Foundation
```

The actual current task must always be taken from:

```text
docs/ai/CURRENT_TASK.md
```

---

# 50. Final Principle

The objective is not to finish the roadmap as quickly as possible.

The objective is to build a system that is:

```text
Secure
Correct
Tested
Maintainable
Recoverable
Observable
Scalable
Accessible
Production-ready
```

A feature is considered complete only when its implementation, authorization, error handling, testing, documentation, and operational requirements have been appropriately verified.

Create or update `docs/ai/ROADMAP.md`.

Inspect the repository and master specification before planning. Build a phased roadmap with dependencies, acceptance criteria, risks, and release gates.

Use these proposed phases, adjusting them to match verified existing progress:

P0 — Repository discovery, documentation, development workflow, CI, environment setup, and baseline tests.

P1 — Authentication, multi-tenancy, memberships, role and permission model, RLS, audit logging, and database migration discipline.

P2 — Core operations: CRM, customers, staff, teams, tasks, projects, assignments, approvals, and notifications.

P3 — Infrastructure operations: domain inventory, hosting projects, environments, deployment history, GitHub/Vercel/Cloudflare/cPanel/registrar adapters, and safe domain workflows.

P4 — Payments: provider abstraction, supported Stripe/Dojo integrations, payment links, webhook verification, idempotency, reconciliation, and refund controls.

P5 — Customer support, ticket lifecycle, internal notes, customer communication, SLAs, and escalation.

P6 — Chat, realtime collaboration, notifications, and WebRTC audio/video where requirements and infrastructure are verified.

P7 — Restricted HR/salary workflows, approvals, access reviews, and audit.

P8 — Production hardening: monitoring, durable jobs, backups, restore exercises, security testing, accessibility, performance, incident response, and release readiness.

P9 — Separate AI website-builder and customer hosting product: plans, verified payments, quotas, AI generation, editing, previews, publishing, custom domains, SSL, deployment operations, billing, and customer support.

P10 — Further registrar, hosting, and website-management capabilities only after product validation and cost analysis.

For each phase specify:

- Objective and scope.
- Prerequisites.
- Deliverables.
- Security requirements.
- Automated tests.
- Acceptance criteria.
- Operational and cost considerations.
- Exit gate.
- Explicitly excluded work.

Do not treat a phase as completed without evidence. Separate planned, in progress, blocked, and verified complete.

Make CURRENT_TASK.md the single source of truth for the one task currently authorized. Recommend one next task at a time.

Do not begin implementation.
