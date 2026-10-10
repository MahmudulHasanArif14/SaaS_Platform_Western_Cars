# ARCHITECTURE.md

## 1. Purpose

This document defines the target technical architecture for the Company Infrastructure & Operations Platform.

The platform brings company operations and technical infrastructure management into one secure, multi-tenant system.

Core capabilities include:

- Domain registration inventory and DNS management.
- Website and hosting management.
- GitHub, Vercel, Cloudflare, and cPanel integrations.
- Payment requests and payment links using Stripe and Dojo.
- Customer and company relationship management.
- Staff management, task assignments, projects, and reporting.
- Customer support and managerial escalation.
- Internal chatrooms, direct messaging, and audio/video calls.
- Employee salary records and payment tracking.
- Background jobs, webhooks, monitoring, audit logs, and disaster recovery.

This document describes the target architecture, not proof that any feature has already been implemented.

Actual repository code, database migrations, test results, and verified provider connections determine the current implementation state.

---

## 2. Architectural Principles

The architecture must follow these principles:

1. Security and data integrity take priority over feature count.
2. Use a modular monolith initially rather than prematurely introducing microservices.
3. Separate UI, business logic, data access, and provider integration.
4. Enforce tenant isolation at both the application and database levels.
5. Treat the browser, external providers, incoming webhooks, and integration responses as untrusted.
6. Keep credentials and privileged operations on the server.
7. Use PostgreSQL as the primary transactional data store.
8. Use database migrations for schema changes.
9. Prefer explicit interfaces and typed contracts between modules.
10. Use background jobs for operations that require retries or may outlive a request.
11. Use idempotency for retryable external operations.
12. Make important actions observable, auditable, and recoverable.
13. Verify integrations against current provider capabilities and documentation.
14. Make deployment and rollback procedures reproducible.
15. Keep the architecture understandable and affordable to operate.
16. Avoid unnecessary infrastructure until the application's actual requirements justify it.

---

## 3. High-Level Architecture

```text
                         USERS
                           |
              +------------+-------------+
              |                          |
       Staff / Managers             Customers
              |                          |
              +------------+-------------+
                           |
                    Next.js Frontend
                 App Router / TypeScript
                           |
                Authentication & Session
                           |
               Authorization / Permissions
                           |
                Runtime Input Validation
                           |
                  Application Layer
                           |
              +------------+-------------+
              |                          |
      Application Services       Read / Query Services
              |                          |
              +------------+-------------+
                           |
               Data Access / Repositories
                           |
                 Supabase / PostgreSQL
              +------------+-------------+
              |            |             |
           Auth         Storage       Realtime
              |
      Tenant and Permission Model
                           |
             Background Jobs / Outbox
                           |
                 Worker Execution
                           |
              Provider Adapter Layer
                           |
       +---------+---------+---------+----------+
       |         |         |         |          |
     GitHub    Vercel   Cloudflare  Stripe     Dojo
       |         |         |         |          |
       +---------+---------+---------+----------+
                           |
             Registrar / cPanel / Email /
                TURN / Monitoring Services
```

This diagram represents logical components. It does not imply that every component is a separately deployed service.

---

## 4. Recommended Technology Stack

Use the following technologies where compatible with the existing repository and deployment environment.

| Area                | Recommended technology                                              |
| ------------------- | ------------------------------------------------------------------- |
| Language            | TypeScript with strict checks                                       |
| Web framework       | Next.js App Router                                                  |
| UI                  | React                                                               |
| Styling             | Tailwind CSS                                                        |
| UI components       | shadcn/ui and accessible primitives                                 |
| Forms               | React Hook Form where useful                                        |
| Runtime validation  | Zod or an equivalent schema validator                               |
| Primary database    | Supabase PostgreSQL                                                 |
| Authentication      | Supabase Auth                                                       |
| File storage        | Supabase Storage                                                    |
| Realtime            | Supabase Realtime where appropriate                                 |
| Database migrations | Supabase CLI migrations                                             |
| Unit testing        | Vitest or the established repository equivalent                     |
| Component testing   | React Testing Library where useful                                  |
| End-to-end testing  | Playwright                                                          |
| Version control     | GitHub                                                              |
| Application hosting | Vercel or another verified compatible host                          |
| Monitoring          | Structured application logs and a suitable error-monitoring service |
| Payments            | Stripe and Dojo through separate provider adapters                  |

Do not add a dependency merely because it is popular. Evaluate maintenance, security, compatibility, cost, and actual requirements first.

Do not replace an established working technology without a documented reason.

---

## 5. Application Architecture

### 5.1 Modular Monolith

The initial system should be a modular monolith.

A single Next.js application contains well-separated business modules. The application may use separate background workers or provider-specific infrastructure later, when operational needs justify it.

Advantages include:

- Lower initial hosting and operational complexity.
- Shared authentication and authorization.
- Easier transactions and data consistency.
- Simpler development and deployment.
- Clear module boundaries without premature distributed-system complexity.

Modules must not freely manipulate each other's internal implementation details.

For example, a payment feature should use the approved payment service rather than directly accessing provider-specific SDKs from UI components.

### 5.2 Business Modules

Organize the application around business capabilities:

```text
Identity and Access
Organizations and Memberships
Clients and CRM
Staff and Departments
Tasks and Projects
Support and Escalations
Domains and DNS
Websites and Hosting
Repositories and Deployments
Payments
Chat and Communications
Calls and WebRTC
HR and Salary
Integrations
Notifications
Background Jobs
Audit and Monitoring
Administration
```

Each module should have clearly defined responsibilities, permissions, data ownership, and interfaces.

Avoid circular dependencies between modules.

---

## 6. Repository Structure

Use the following as the target structure. Adapt it to the repository's existing conventions rather than duplicating folders unnecessarily.

```text
/
├── CLAUDE.md
├── README.md
├── package.json
├── .env.example
│
├── docs/
│   ├── ai/
│   │   ├── MASTER_SPEC.md
│   │   ├── ROADMAP.md
│   │   ├── CURRENT_TASK.md
│   │   ├── WORKSPACE_STATE.md
│   │   ├── ARCHITECTURE.md
│   │   ├── DATA_MODEL.md
│   │   ├── SECURITY_BASELINE.md
│   │   ├── THREAT_MODEL.md
│   │   ├── INTEGRATION_STATUS.md
│   │   ├── KNOWN_ISSUES.md
│   │   ├── PRODUCTION_READINESS.md
│   │   ├── SESSION_LOG.md
│   │   ├── CHANGELOG.md
│   │   └── decisions/
│   │
│   └── runbooks/
│       ├── DEPLOYMENT.md
│       ├── INCIDENT_RESPONSE.md
│       └── DISASTER_RECOVERY.md
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── (customer)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── shared/
│   │
│   ├── modules/
│   │   ├── identity/
│   │   ├── organizations/
│   │   ├── clients/
│   │   ├── staff/
│   │   ├── tasks/
│   │   ├── support/
│   │   ├── domains/
│   │   ├── hosting/
│   │   ├── deployments/
│   │   ├── payments/
│   │   ├── chat/
│   │   ├── calls/
│   │   ├── hr/
│   │   ├── integrations/
│   │   ├── notifications/
│   │   └── audit/
│   │
│   ├── lib/
│   │   ├── auth/
│   │   ├── authorization/
│   │   ├── supabase/
│   │   ├── validation/
│   │   ├── errors/
│   │   ├── logging/
│   │   ├── rate-limit/
│   │   └── utilities/
│   │
│   └── config/
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── tests/
│
├── workers/
│   └── README.md
│
└── tests/
    ├── unit/
    ├── integration/
    ├── security/
    └── e2e/
```

The `workers/` directory is only needed when a separate worker process is selected. Durable background processing must not be implemented as an untracked in-memory task running inside a short-lived web request.

Avoid implementing every module and every directory at the beginning. Create components as their tasks require them.

---

## 7. Request Processing

The standard request flow must be:

```text
HTTP Request / Server Action
          |
          v
Authenticate
          |
          v
Resolve Trusted User Identity
          |
          v
Authorize Organization and Resource
          |
          v
Validate Input
          |
          v
Execute Application Service
          |
          v
Enforce Business Rules
          |
          v
Read / Write Database or Call Provider
          |
          v
Record Required Audit Event
          |
          v
Return Minimal Safe Response
```

Some operations require a transaction, idempotency key, approval, background job, or provider reconciliation step.

The exact flow may vary, but authorization must never be skipped.

### Request handling rules

- Use Server Components for suitable server-rendered reads.
- Use Client Components only where client-side interactivity is needed.
- Use Route Handlers for HTTP APIs, incoming webhooks, and clients requiring HTTP endpoints.
- Use Server Actions for suitable application mutations initiated by the Next.js application.
- Treat Server Actions and Route Handlers as public attack surfaces.
- Do not put core business rules solely inside UI components.
- Do not expose server-only modules to browser bundles.
- Do not automatically create a separate API endpoint for every internal function.

---

## 8. Module Internal Structure

Where module complexity justifies it, use the following logical separation:

```text
modules/domains/
├── domain.types.ts
├── domain.schemas.ts
├── domain.permissions.ts
├── domain.service.ts
├── domain.repository.ts
├── domain.provider.ts
├── domain.actions.ts
├── domain.queries.ts
└── domain.test.ts
```

This is an illustrative structure, not a requirement to create every file for every module.

Responsibilities:

**Types**

Define business concepts and contracts.

**Schemas**

Validate runtime input and important external responses.

**Permissions**

Define module-specific permission requirements.

**Services**

Implement business rules and orchestrate operations.

**Repositories**

Encapsulate database reads and writes where useful.

**Provider interfaces**

Define contracts for external services.

**Actions and queries**

Expose appropriately authorized application entry points.

**Tests**

Verify business rules, error handling, and security expectations.

Keep simple modules simple. Avoid building abstractions that offer no real benefit.

---

## 9. Authentication and Authorization

### Authentication

Supabase Auth provides the identity system, subject to confirmation against the actual project configuration.

The application must securely manage sessions and handle:

- Login and logout.
- Session refresh.
- Invitation and account activation.
- Password recovery where applicable.
- Session revocation.
- MFA or step-up authentication for sensitive operations.
- Disabled and departing users.
- Administrative account recovery.

Authentication confirms identity. It does not establish access to every organization or resource.

### Authorization

Implement permission-based authorization on the server and reinforce it with PostgreSQL RLS.

Example permissions:

```text
domains.read
domains.manage
dns.read
dns.manage
hosting.read
hosting.manage
deployments.create
deployments.rollback
payments.read
payments.create
payments.refund
staff.read
staff.manage
salary.read
salary.manage
support.read
support.manage
chat.manage
integrations.manage
audit.read
```

Permission definitions and assignment mechanisms must be consistent with `DATA_MODEL.md`.

Do not trust roles or permissions supplied by the browser.

The server must resolve the user's active organization membership, role assignments, and access to the requested resource.

High-risk operations require additional authorization and may require a second approver.

---

## 10. Multi-Tenancy

Organization boundaries are a foundational security requirement.

All organization-owned resources must have a defined ownership relationship.

The system must prevent:

- Accessing another organization's domain or DNS zone.
- Reading another organization's payment history.
- Accessing another organization's staff or salary records.
- Joining private chatrooms without authorization.
- Viewing customer support messages belonging to another tenant.
- Using another organization's connected provider credentials.
- Triggering infrastructure changes against another tenant's resources.

### Enforcement

Use multiple layers:

1. Organization membership validation.
2. Server-side resource authorization.
3. PostgreSQL RLS.
4. Foreign keys and appropriate database constraints.
5. Tenant-aware queries and repository methods.
6. Integration and security tests.

Where relational ownership matters, use appropriate constraints or schema patterns that prevent cross-tenant references.

The presence of an `organization_id` column alone does not establish tenant isolation.

---

## 11. Supabase and Database Architecture

PostgreSQL is the source of truth for application-owned transactional records.

Supabase may provide:

- PostgreSQL.
- Authentication.
- Object storage.
- Realtime messaging and subscriptions.
- Database tooling.

### Database access

Use a standard server-side data access layer for sensitive business operations.

Browser-to-Supabase access may be used selectively where the feature is designed for it and RLS, validation, and ownership rules are sufficient.

The service-role key bypasses RLS. It must only be used in server-only code and only where genuinely needed.

Before using privileged database access, independently validate the user's identity and authorization.

### Database requirements

- Version-controlled SQL migrations.
- Foreign keys and appropriate constraints.
- Explicit indexes for important access patterns.
- Runtime validation.
- Transactional handling of related writes.
- RLS and tenant-isolation tests.
- Migration testing against representative data.
- Backup and restore procedures.
- Safe pagination for potentially large datasets.

Do not treat generated TypeScript database types as a substitute for database enforcement.

See `DATA_MODEL.md` for table ownership, relationships, and integrity requirements.

---

## 12. Direct Database Access vs. Application Services

Not every database operation requires a separate API call. However, operations with business consequences must have a controlled entry point.

### Direct access may be appropriate for

- Authorized reads protected by RLS.
- Limited profile updates.
- Simple tenant-scoped records.
- Authorized Realtime subscriptions.

### Application services are required for operations such as

- Creating or approving payment requests.
- Issuing refunds.
- Changing DNS.
- Connecting or disconnecting provider accounts.
- Deploying or rolling back a website.
- Changing roles or permissions.
- Recording salary payments.
- Terminating employee access.
- Processing privileged support actions.

The service layer must validate permissions, business invariants, state transitions, idempotency, and audit requirements.

---

## 13. External Provider Architecture

All external integrations must be isolated behind provider adapters.

Application modules must depend on internal interfaces rather than vendor SDKs directly.

Example:

```text
Payment Service
      |
      v
Payment Provider Interface
      |
      +-- Stripe Adapter
      |
      +-- Dojo Adapter
```

Similarly:

```text
Domain Service
      |
      v
Domain / DNS Provider Interface
      |
      +-- Cloudflare Adapter
      +-- Registrar Adapter
      +-- Other Supported Adapter
```

### Provider interface responsibilities

Each adapter should define:

- Supported operations.
- Required permissions.
- Input validation.
- Output normalization.
- Provider error handling.
- Retry behavior.
- Timeout behavior.
- Rate-limit handling.
- Idempotency support where available.
- Capability reporting.
- Health and connection checks.

Do not assume all providers support the same capabilities.

For example, a registrar's API may support domain lookup and renewal but not arbitrary DNS management.

### Provider selection

Provider choice must be checked on the server against:

- Organization configuration.
- Connection status.
- Supported capability.
- User permission.
- Provider account ownership.
- Environment restrictions.

Never trust a browser-submitted provider identifier without verification.

---

## 14. Domain and DNS Architecture

The domain management module must distinguish between:

- Domain registration.
- Domain registrar.
- DNS provider.
- DNS zone.
- DNS records.
- Website assignment.
- Domain verification.
- Renewal information.

A registrar and DNS provider may be different companies.

### Safe DNS change workflow

```text
User Requests Change
         |
         v
Authenticate and Authorize
         |
         v
Validate Requested Record
         |
         v
Read Current Provider State
         |
         v
Generate Change Preview
         |
         v
Warn About Potential Impact
         |
         v
Confirm / Approve
         |
         v
Apply Provider Change
         |
         v
Read Back and Verify
         |
         v
Record Result and Audit
         |
         v
Reconcile if Outcome Is Uncertain
```

### Critical safeguards

- Protect nameserver, MX, CAA, SPF, DKIM, and DMARC-related records from accidental changes.
- Require explicit confirmation for high-impact changes.
- Validate record names, types, content, TTL, and provider-specific constraints.
- Check whether an external operation succeeded even if the response timed out.
- Preserve a safe snapshot when appropriate.
- Record before-and-after state where safe.
- Never claim a DNS change succeeded until verified.
- Provide recovery guidance for failed or partial operations.

Registrar renewal and domain transfer operations require similarly explicit validation and auditing.

---

## 15. Hosting and Deployment Architecture

The hosting module manages websites, environments, and hosting-provider accounts.

The deployment module integrates with supported deployment systems.

A website can reference:

- An organization.
- An optional client.
- A repository.
- One or more environments.
- One or more domains.
- A hosting provider account.
- Deployment history.

### Deployment workflow

```text
Deployment Request
        |
        v
Authorization / Approval
        |
        v
Validate Project and Environment
        |
        v
Create Deployment Job
        |
        v
Call Provider Adapter
        |
        v
Track Provider Status
        |
        v
Run Health / Smoke Checks
        |
        v
Record Deployment Result
        |
        v
Notify Authorized Users
```

The application must not claim to run a successful deployment simply because an API request was accepted.

Track the real provider deployment state.

Where supported, rollback must identify the target deployment and verify the resulting health.

Provider logs returned to the application must be treated as untrusted and redacted before display or storage.

---

## 16. Payment Architecture

The payment module must separate business requests from provider-specific implementations.

### Logical components

```text
Payment Request
       |
       v
Payment Application Service
       |
       v
Permission / Amount / Currency Validation
       |
       v
Payment Provider Interface
       |
       +-- Stripe
       |
       +-- Dojo
       |
       v
Provider Payment Link / Checkout
       |
       v
Signed Webhook
       |
       v
Event Verification and Deduplication
       |
       v
Payment State Update
       |
       v
Reconciliation and Audit
```

### Payment request creation

The server must validate:

- Organization and client ownership.
- Requesting user's permissions.
- Amount and currency.
- Applicable invoice or business reference.
- Selected provider.
- Provider account connection and capabilities.
- Approval requirements.
- Idempotency key.

Staff may select Stripe or Dojo only when the provider is enabled, verified as necessary, permitted, and capable of performing the requested operation.

### Payment webhooks

Incoming webhooks must be:

1. Received through a dedicated endpoint.
2. Verified using the provider's supported signature mechanism.
3. Stored or registered for reliable processing.
4. Deduplicated using provider event identifiers.
5. Processed idempotently.
6. Matched against local payment records.
7. Reconciled when necessary.
8. Recorded without leaking sensitive data.

Browser redirects are not proof that a payment succeeded.

Never store card numbers, CVVs, or other prohibited payment-card data.

Do not assume Stripe and Dojo provide identical payment-link, refund, settlement, or webhook capabilities. Confirm these against current official documentation and the organization's specific account.

---

## 17. Background Jobs and Durable Processing

Operations that require retries, scheduled execution, or reliable processing must use a durable job mechanism.

Examples:

- Provider synchronization.
- DNS verification.
- Deployment status checks.
- Payment reconciliation.
- Email and notification delivery.
- Webhook processing.
- Domain expiry reminders.
- Integration health checks.
- Scheduled maintenance.
- Retry and dead-letter handling.

### Job lifecycle

```text
QUEUED
   |
   v
RUNNING
   |
   +-----> COMPLETED
   |
   +-----> RETRYING
                |
                v
             RUNNING

Repeated Failure
       |
       v
 DEAD LETTER
```

### Requirements

- Durable persistence.
- Retry policy with bounded attempts.
- Backoff for transient failures.
- Idempotent handlers.
- Duplicate-job protection.
- Locking or claiming semantics.
- Execution timeouts.
- Dead-letter visibility.
- Safe error recording.
- Manual retry with authorization.
- Monitoring and alerting.

Do not implement reliability-sensitive work using only `setTimeout`, an unawaited promise, or in-memory state.

The job engine is a design decision that must be confirmed against the available hosting and database capabilities before production use.

An initial PostgreSQL-backed job system or a supported managed queue may be selected after evaluating durability, concurrency, scheduling, observability, and operating cost.

---

## 18. Database Transactions and the Outbox Pattern

Database transactions must protect operations that require several local writes to succeed together.

However, PostgreSQL transactions cannot automatically roll back an external provider API call.

For important workflows, use an appropriate combination of:

- Database transactions.
- Idempotency keys.
- Durable jobs.
- Outbox records.
- Provider-side idempotency.
- Reconciliation.
- Compensating operations.

### Example

For a payment request:

```text
Database Transaction
    |
    +-- Create payment request
    +-- Record intended operation
    +-- Record audit event
    +-- Add outbox/job record
    |
    v
Commit
    |
    v
Worker calls provider
    |
    v
Persist provider result
```

The exact transaction boundary should be designed around the external provider's behavior.

A payment request that has been created locally but not yet created successfully by the provider must not be shown as a confirmed, usable payment link.

---

## 19. Realtime and Internal Chat

Use Supabase Realtime where its current product capabilities and authorization model meet the requirements.

Features may include:

- Team chatrooms.
- Department rooms.
- Project rooms.
- Direct messages.
- Room membership.
- Read status.
- Presence.
- Typing indicators.
- Notifications.
- Message attachments.

### Security requirements

- Verify membership before message reads and writes.
- Scope private room access to authorized participants.
- Enforce RLS on relevant persistent tables.
- Validate access to storage objects.
- Prevent unauthorized subscription to protected channels.
- Keep internal conversation data private.
- Define the behavior when a user leaves a room or organization.

Do not assume that hiding a room from the UI secures its data.

### Realtime limitations

Transient features such as presence and typing indicators should not be treated as durable business records.

Persistent messages and business-critical events must be stored using an appropriate durable mechanism.

---

## 20. WebRTC Audio and Video

WebRTC is responsible for peer media transport; it does not replace the application's identity and authorization system.

The architecture includes:

- Call creation and participant authorization.
- Authenticated signaling.
- Session and call metadata.
- Audio/video negotiation.
- STUN for connectivity discovery.
- TURN relay for networks that require it.
- Connection failure handling.
- Reconnection and call termination.
- Optional screen sharing.
- Call history.

### Call workflow

```text
Caller Requests Call
        |
        v
Authorize Caller and Participants
        |
        v
Create Call Session
        |
        v
Authenticated Signaling
        |
        v
Exchange SDP / ICE Candidates
        |
        v
Establish WebRTC Connection
        |
        v
Connect or Relay Through TURN
        |
        v
End Call and Store Metadata
```

Sensitive signaling messages must only reach authorized call participants.

Use appropriately protected, short-lived TURN credentials when supported by the selected TURN service.

Do not expose permanent TURN credentials in client code.

Do not store media streams in PostgreSQL. Store only appropriate call and participation metadata unless a separate recording feature is explicitly approved and designed.

Production readiness must be tested across different browsers, networks, firewalls, and mobile conditions.

---

## 21. Staff, Tasks, Projects, and Reporting

The staff and task modules manage operational work.

The architecture should support:

- Staff records.
- Teams and departments.
- Manager relationships.
- Task assignment.
- Due dates and priorities.
- Checklists and dependencies.
- Comments and attachments.
- Progress reports.
- Review and approval.
- Escalation.
- Recurring tasks where required.
- Notifications.

### Assignment rules

Every assignment must identify the organization and authorized participants.

The server must validate that the assignee belongs to the relevant organization and is eligible for the assignment.

Manager permissions must not automatically imply unrestricted access to salary, payment, integration credentials, or unrelated private conversations.

### Reporting

Reports must be computed from trusted database records or validated aggregates.

Do not rely on client-submitted completion percentages or unverified counts for authoritative management metrics.

---

## 22. Customer Support and Managerial Escalation

The support module manages tickets, customer responses, assignments, internal notes, SLA tracking, and escalation.

Separate customer-visible replies from internal notes at the data, query, and authorization levels.

Customer endpoints must never return internal messages.

Managerial workflows may include:

- Ticket escalation.
- Task review.
- Staff workload review.
- Approval requests.
- Payment approval.
- Infrastructure change approval.
- Incident management.

Each approval must record who requested it, who approved or rejected it, the decision, and when it occurred.

High-risk actions may require separation of duties so that a requester cannot approve their own operation.

---

## 23. HR and Salary Architecture

The HR module maintains employee and salary-payment records.

It must not assume that a basic paid/unpaid tracker is a complete payroll or tax system.

Support, where authorized:

- Salary records.
- Pay periods.
- Payment status.
- Payment date.
- Currency and amount.
- Supporting references.
- Proof documents.
- Approvals.
- Salary history.
- Audit history.

Access to salary data must use dedicated permissions.

General staff-management access must not expose salary amounts or payment evidence.

Sensitive documents must remain in private storage with strict authorization.

Employee termination workflows must revoke access while preserving appropriate historical records.

---

## 24. File Storage

Use Supabase Storage or another explicitly selected storage provider.

Choose public or private access according to the resource's intended visibility.

Examples of private objects include:

- Salary payment evidence.
- Customer support attachments.
- Internal chat attachments.
- Confidential business documents.
- Provider configuration exports.

### File handling requirements

- Validate file type and size.
- Treat filenames and metadata as untrusted.
- Generate safe storage paths.
- Enforce authorization for upload and download.
- Restrict file access based on tenant and resource membership.
- Avoid public URLs for confidential files.
- Apply malware scanning where justified and supported.
- Set retention and deletion rules where required.

A valid signed URL must not become an unlimited substitute for authorization. Use appropriate expiry and access rules.

---

## 25. Notifications and Communications

The notification module coordinates:

- In-app notifications.
- Task assignment alerts.
- Ticket updates.
- Payment status updates.
- Approval requests.
- Domain expiry warnings.
- Deployment results.
- Integration failures.
- Chat notifications.

Notifications must be delivered to an explicitly authorized recipient.

For notifications requiring reliable delivery, create durable work records and track sending status.

Do not send messages containing secrets or sensitive salary, payment, or infrastructure information unnecessarily.

Delivery failure must not silently change the actual business state.

---

## 26. Auditing and Observability

### Audit records

Record sensitive actions, including:

- Role and permission changes.
- Provider connections and revocations.
- DNS modifications.
- Domain transfer and renewal actions.
- Deployment and rollback operations.
- Payment request and refund actions.
- Salary updates and payment approvals.
- Employee access changes.
- Data exports.
- Administrative configuration changes.

A useful audit event includes:

```text
organization_id
actor_user_id
action
resource_type
resource_id
result
request_id
timestamp
safe_metadata
```

Do not store credentials, tokens, card details, or other secrets in audit records.

### Operational observability

Capture enough information to investigate:

- Failed application requests.
- Database errors.
- Provider timeouts.
- Webhook verification failures.
- Failed jobs.
- Token expiry.
- Payment reconciliation discrepancies.
- DNS verification failures.
- Deployment errors.
- Unusual authorization failures.

Use correlation IDs to connect related request, job, provider, and webhook events.

Logs must be structured and appropriately redacted.

---

## 27. Error Handling and Resilience

Normalize application errors into a consistent internal error model.

Example categories:

```text
UNAUTHENTICATED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
CONFLICT
RATE_LIMITED
PROVIDER_ERROR
TIMEOUT
TEMPORARY_UNAVAILABLE
INTERNAL_ERROR
```

These are conceptual categories; actual HTTP status codes and response structures must be appropriate to each endpoint.

### Error handling rules

- Do not expose stack traces to clients.
- Avoid revealing whether sensitive resources exist when that information should remain private.
- Distinguish validation errors from provider failures.
- Use timeouts for external operations.
- Retry transient errors only when safe.
- Avoid retrying permanent authorization or validation errors.
- Record enough information for investigation.
- Never claim an uncertain operation succeeded.
- Reconcile operations when external state may differ from local state.

---

## 28. Rate Limiting and Abuse Prevention

Rate limits should protect:

- Login and recovery endpoints.
- Search and enumeration endpoints.
- Customer ticket submission.
- Payment-link creation.
- Expensive provider API calls.
- DNS changes.
- Deployment requests.
- File uploads.
- Webhook processing.
- WebRTC signaling and call initiation.

Use shared, durable rate-limit enforcement when the deployment requires multiple application instances.

Do not rely solely on in-memory counters in a horizontally scaled environment.

Rate limits must be designed to avoid preventing legitimate users from completing critical operations.

---

## 29. Security Architecture

Security controls are mandatory architectural requirements.

### Browser security

- Never trust client-side authorization.
- Validate all untrusted input.
- Avoid unsafe HTML rendering.
- Apply appropriate security headers.
- Implement CSRF protections where applicable.
- Restrict cross-origin access.
- Do not expose sensitive values through client components or public environment variables.

### Server security

- Authenticate and authorize each protected operation.
- Use server-only modules for privileged functionality.
- Apply runtime validation to inputs and important provider responses.
- Minimize privileged database access.
- Redact logs and error responses.
- Apply rate limits and timeouts.
- Protect secrets and rotate credentials appropriately.

### Data security

- Enforce RLS.
- Use database constraints.
- Maintain tenant isolation.
- Use private storage for sensitive documents.
- Encrypt sensitive credentials with suitable key-management practices.
- Retain audit history.
- Restrict salary and provider credentials to authorized roles.

### Integration security

- Verify webhooks.
- Use least-privilege provider credentials.
- Validate callback URLs and outbound destinations.
- Protect against SSRF.
- Handle duplicate events safely.
- Reconcile external state.
- Support credential revocation and rotation.

Refer to `SECURITY_BASELINE.md` and `THREAT_MODEL.md` for the detailed mandatory controls.

---

## 30. Environment and Configuration

Maintain distinct environments as available and appropriate:

```text
Local Development
       |
       v
Automated Test Environment
       |
       v
Staging
       |
       v
Production
```

Never assume separate environment configuration merely because the code supports environment variables.

Each environment must use the appropriate database, provider credentials, webhook endpoints, storage, and permitted operations.

### Configuration rules

- Maintain `.env.example` with names and safe descriptions only.
- Never commit real credentials.
- Never copy production secrets into tests.
- Validate required configuration at startup or first use.
- Fail closed when required security configuration is missing.
- Separate test payment configurations from live payment configurations.
- Prevent unintended destructive actions against production.
- Rotate compromised credentials immediately.

---

## 31. Deployment Architecture

The production deployment should have a reproducible release workflow.

```text
Code Change
    |
    v
Pull Request / Review
    |
    v
Static Checks and Tests
    |
    v
Build
    |
    v
Security and Migration Checks
    |
    v
Staging Deployment
    |
    v
Smoke and Integration Tests
    |
    v
Approval
    |
    v
Production Deployment
    |
    v
Health Monitoring
```

Actual deployment gates depend on project maturity and risk. High-risk modules require stronger review and verification.

### Release requirements

- Build and type checks must pass.
- Lint and appropriate automated tests must pass.
- Database migrations must be reviewed.
- Security and RLS tests must pass.
- Critical environment variables must be verified.
- External provider configuration must be checked.
- Rollback or recovery procedures must be understood.
- Production health must be monitored after release.

Do not label a deployment production-ready simply because the build succeeded.

---

## 32. Database Migration Strategy

Every schema change must use a version-controlled migration.

The migration workflow is:

```text
Model Change
     |
     v
Write Migration
     |
     v
Review Constraints / RLS / Indexes
     |
     v
Run Automated Tests
     |
     v
Deploy Migration
     |
     v
Verify Application Compatibility
```

For risky schema changes, consider an expand-and-contract migration:

1. Add compatible schema.
2. Deploy code supporting old and new structures.
3. Backfill data safely.
4. Verify the migrated records.
5. Switch reads and writes.
6. Remove obsolete structures in a later release.

Do not assume that a reverse migration can safely restore lost production data.

Backups and recovery procedures must exist for destructive operations.

---

## 33. Testing Architecture

Testing must verify both functional correctness and security.

### Unit tests

Test:

- Business rules.
- State transitions.
- Amount and currency validation.
- Permission decisions.
- Provider response normalization.
- Retry and idempotency logic.

### Integration tests

Test:

- Database operations.
- Foreign keys and constraints.
- RLS behavior.
- Application services.
- Provider adapters using appropriate test doubles or sandbox accounts.
- Webhook verification and deduplication.
- Job processing.

### Security tests

Test:

- Cross-tenant access denial.
- IDOR scenarios.
- Privilege escalation.
- Unauthorized salary access.
- Internal support-note leakage.
- Private chat access.
- Forged webhooks.
- Invalid provider ownership.
- Unauthorized DNS and deployment operations.

### End-to-end tests

Test critical user journeys, including:

- Login and organization selection.
- Creating and assigning a task.
- Creating a customer support ticket.
- Connecting and verifying a provider.
- Creating and paying a test payment request.
- Applying and verifying a DNS change in a test environment.
- Viewing deployment status.
- Managing an employee's salary payment with appropriate permissions.

Do not treat mocked provider tests as proof that a real provider integration works.

---

## 34. Backup and Disaster Recovery

The application must have a documented recovery strategy.

Define and verify:

- Database backup schedule.
- Recovery Point Objective (RPO).
- Recovery Time Objective (RTO).
- Storage recovery requirements.
- Credential recovery and rotation.
- Provider reconnection procedures.
- Migration recovery.
- Data restoration procedure.
- Incident responsibilities.
- Periodic restore tests.

A backup is not proven usable until a restore has been tested.

Keep the backup strategy appropriate to the Supabase plan, storage configuration, hosting provider, and business requirements.

Do not claim a particular backup frequency or recovery guarantee until it is configured and verified.

See `docs/runbooks/DISASTER_RECOVERY.md`.

---

## 35. Monitoring and Alerts

Monitor system health, business-critical operations, and integration failures.

Important signals include:

- Application availability.
- Error rates.
- Response latency.
- Database health.
- Failed jobs.
- Queue backlog.
- Unprocessed webhooks.
- Provider authentication failures.
- Credential expiry.
- DNS verification errors.
- Deployment failures.
- Payment reconciliation mismatches.
- Unusual access patterns.

Alert thresholds and retention must be configured for the actual monitoring system.

Alerts should have an owner and a runbook or documented response path.

Avoid collecting more personal or confidential data than monitoring requires.

---

## 36. Performance and Scalability

Start with measurable performance goals and optimize based on evidence.

Use:

- Pagination for large datasets.
- Database indexes for real query patterns.
- Efficient relational queries.
- Bounded API responses.
- Caching for appropriate non-sensitive data.
- Background processing for slow operations.
- Provider request timeouts.
- Concurrency controls for sensitive updates.
- Lazy loading for heavy UI components where appropriate.

Do not cache authorization decisions indefinitely.

Do not serve one tenant's private data to another tenant through a shared cache.

Do not introduce distributed services, extra databases, or complex infrastructure until actual workload or reliability requirements justify them.

---

## 37. Accessibility and User Experience

The application should target WCAG 2.2 AA.

The UI must support:

- Keyboard navigation.
- Visible focus.
- Accessible forms and error messages.
- Screen-reader-friendly controls.
- Responsive layouts.
- Useful empty states.
- Loading and failure states.
- Confirmation of destructive actions.
- Clear permission-denied states.
- Accessible light and dark themes.

Operational interfaces must make high-impact actions and their consequences clear.

Do not present an unverified operation as successful.

Sensitive operations should display meaningful confirmation details before execution.

---

## 38. Cost and Free-Tier Strategy

Cost control must not undermine security or reliability.

For each external service, record:

- Free-tier or trial capabilities.
- Usage limits.
- Production limitations.
- Required paid capabilities.
- Expected usage.
- Billing owner.
- Failure behavior when a limit is reached.
- Migration or replacement options.

Evaluate actual provider limits before relying on a free tier for production.

In particular, verify background processing, backups, monitoring, storage access, rate limits, email delivery, and TURN capacity.

The platform must degrade safely when a non-critical integration is unavailable.

Critical workflows must clearly indicate when the provider is unavailable instead of reporting false success.

---

## 39. Architectural Decision Records

Significant architectural changes must be documented under:

```text
docs/ai/decisions/
```

Suggested initial decisions:

- ADR-001: Modular monolith vs. distributed services.
- ADR-002: Multi-tenant data isolation.
- ADR-003: Database and data-access strategy.
- ADR-004: Provider adapter architecture.
- ADR-005: Payment processing and webhook reliability.
- ADR-006: Durable job processing.
- ADR-007: Realtime chat and WebRTC.
- ADR-008: Production hosting and environment separation.
- ADR-009: Secret storage and provider credential management.
- ADR-010: Backup and disaster recovery.

Each decision should record:

- Context.
- Problem.
- Considered options.
- Chosen approach.
- Reasoning.
- Security implications.
- Operational and cost implications.
- Consequences.
- Status.

Do not create an ADR for every minor code decision.

---

## 40. Architectural Rules for AI-Assisted Development

Before implementing a feature, Claude must:

1. Read `CLAUDE.md`.
2. Read `CURRENT_TASK.md`.
3. Read `WORKSPACE_STATE.md`.
4. Inspect the relevant architecture, data-model, and security requirements.
5. Inspect the existing repository and relevant migrations.
6. Identify the affected modules.
7. Identify ownership and authorization requirements.
8. Identify external dependencies and failure scenarios.
9. Plan the smallest coherent implementation.
10. Implement and test the change.
11. Review the resulting diff.
12. Update the relevant documentation.

### Mandatory rules

- Do not implement a new architecture without a documented reason.
- Do not bypass module services for convenience.
- Do not place provider secrets in client-side code.
- Do not trust client-submitted organization or ownership identifiers.
- Do not bypass RLS to avoid fixing a policy.
- Do not create database tables without considering relationships, integrity, and access control.
- Do not simulate successful provider operations.
- Do not mark untested functionality as verified.
- Do not replace existing working functionality unnecessarily.
- Do not automatically begin the next task after completing the authorized task.

If a requirement conflicts with the security baseline or established architecture, stop and document the conflict before proceeding with the risky implementation.

---

## 41. Change Completion Checklist

For a meaningful feature, verify the following as applicable:

- [ ] Module boundaries are respected.
- [ ] Authentication is enforced.
- [ ] Authorization is enforced server-side.
- [ ] Tenant isolation is preserved.
- [ ] Input validation is implemented.
- [ ] Database constraints and migrations are reviewed.
- [ ] RLS policies and tests are added.
- [ ] Provider interactions use the correct adapter.
- [ ] Timeouts and failures are handled.
- [ ] Retry and idempotency behavior is appropriate.
- [ ] Required audit events are recorded.
- [ ] Sensitive output is restricted.
- [ ] Unit and integration tests pass.
- [ ] Relevant security tests pass.
- [ ] Type checks, lint, and build pass as applicable.
- [ ] Relevant documentation is updated.
- [ ] Production-readiness status reflects actual evidence.

Not every checklist item applies to every change. Inapplicable items must be assessed rather than ignored automatically.

---

## 42. Current Implementation vs. Target Architecture

This document defines the target architecture.

Claude must maintain an honest distinction between:

- Planned.
- Designed.
- Implemented.
- Tested.
- Staging verified.
- Production verified.
- Blocked.
- Unsupported.

For actual implementation status, consult:

- `WORKSPACE_STATE.md`
- `CURRENT_TASK.md`
- `INTEGRATION_STATUS.md`
- `KNOWN_ISSUES.md`
- `PRODUCTION_READINESS.md`

A documented component does not prove it exists in code.

A successful build does not prove security, integration correctness, or production readiness.

A connected provider does not prove every supported operation works.

---

## 43. Final Architectural Principle

The platform must be designed so that security, consistency, and recovery do not depend on ideal conditions.

Assume that:

- Requests may be malicious.
- Users may have stale permissions.
- Organizations may be incorrectly selected.
- Providers may return unexpected data.
- Webhooks may be duplicated or forged.
- Networks may time out after an operation succeeds.
- Jobs may run more than once.
- Deployments may fail.
- Credentials may expire or be compromised.
- Integrations may become unavailable.

Therefore, the architecture must consistently apply:

**Explicit authorization + tenant isolation + database integrity + isolated provider adapters + durable processing + idempotency + auditability + reconciliation + tested recovery.**

The ultimate objective is a maintainable, secure, cost-conscious platform whose behavior can be verified—not merely a large collection of working screens.

Create or update `docs/ai/ARCHITECTURE.md`.

Inspect the existing codebase, package dependencies, route structure, server/client boundaries, Supabase setup, and existing provider integrations. Distinguish the verified current architecture from the proposed target architecture.

Document:

1. System context and major components.
2. Frontend, server-side application services, database, storage, authentication, real-time messaging, background jobs, and external providers.
3. The request flow from UI to validation, authorization, business logic, persistence, audit logging, and external integrations.
4. Multi-tenant architecture and tenant-boundary enforcement.
5. Supabase access patterns, RLS, service-role restrictions, migrations, transactions, and database constraints.
6. Provider adapter architecture for payments, GitHub, deployments, DNS, hosting, email, and monitoring.
7. Webhook processing, idempotency, retry policies, reconciliation, and durable jobs.
8. File uploads, signed URLs, attachment access, and storage isolation.
9. Realtime chat and authenticated WebRTC signaling, including STUN/TURN requirements.
10. Domain operations and safe DNS/deployment workflows.
11. Logging, metrics, tracing, alerts, audit events, and correlation IDs.
12. Environment separation, CI/CD, secrets management, backups, and recovery.
13. Testing boundaries and failure handling.
14. Architecture decisions, trade-offs, unresolved questions, and migration path from current to target design.
15. A separate bounded context for the future AI website builder and hosting service.

For the AI builder, address project isolation, AI provider abstraction, generation jobs, previews, deployment lifecycle, quotas, billing entitlements, domain mapping, and abuse prevention.

Use Mermaid diagrams where useful and supported by the repository documentation conventions.

Do not invent existing components or provider capabilities. Mark unverified designs as proposed. Avoid introducing unnecessary microservices. Prefer a modular architecture appropriate to the verified scale and team.

Do not change application code or create migrations.
Create or update `docs/ai/CURRENT_TASK.md`.

This document authorizes exactly one development task at a time.

Initially set the task to repository discovery and documentation initialization unless the repository proves that this task is already complete.

Include:

- Task ID and title.
- Status: NOT_STARTED, IN_PROGRESS, BLOCKED, or COMPLETE.
- Objective and business reason.
- Scope and explicit non-goals.
- Relevant source files and documentation.
- Dependencies and required approvals.
- Acceptance criteria written as verifiable checks.
- Required tests and validation commands, discovered from the actual repository.
- Security and data considerations.
- Risks and blockers.
- Work performed and evidence.
- Files changed.
- Test results.
- Decisions needed.
- Recommended next task, without authorizing it.

Never mark a task complete before its acceptance criteria are verified.

When work begins, update the task status. At completion, record actual outcomes and leave the next task as a recommendation only.

Do not silently expand the task or automatically start the next milestone. Preserve useful existing task information if a task is already in progress.
