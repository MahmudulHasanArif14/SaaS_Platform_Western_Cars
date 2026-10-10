# DATA MODEL

## 1. Purpose

This document defines the authoritative logical data model for the Company Infrastructure & Operations Platform.

It describes:

- Entities
- Relationships
- Tenant ownership
- Sensitive data
- Lifecycle states
- Database constraints
- Indexing requirements
- RLS requirements
- Audit requirements
- Integration relationships
- Data retention considerations

This document is the logical model.

Actual SQL migrations are the implementation source of truth.

Never modify the production schema manually without a migration.

---

# 2. Core Data Principles

The database must follow these principles:

1. Every tenant-owned resource must have a clear organization relationship.
2. Cross-tenant relationships must be impossible or explicitly prevented.
3. Foreign keys must be used wherever appropriate.
4. Unique constraints must enforce business invariants.
5. Check constraints must enforce valid states.
6. Sensitive data must be identified explicitly.
7. RLS must protect tenant-owned data.
8. Application authorization must complement RLS.
9. Audit records must not contain secrets.
10. Provider credentials must never be stored as plaintext.
11. Payment card data must never be stored.
12. Soft deletion should only be used where it has a clear business purpose.
13. Destructive operations require appropriate authorization.
14. Database migrations must be reproducible.
15. Schema changes must be backwards-compatible where required for deployment.
16. Indexes must support actual access patterns.
17. Database integrity must not depend solely on frontend validation.

---

# 3. Tenant Model

The fundamental hierarchy is:

```text id="7q3k7p"
Organization
│
├── Users / Memberships
├── Clients
├── Websites
├── Domains
├── DNS
├── Hosting
├── Repositories
├── Deployments
├── Tasks
├── Support
├── Payments
├── Staff
├── Chat
├── HR
├── Integrations
├── Notifications
├── Jobs
├── Incidents
└── Audit Logs
```

Every organization represents a security boundary.

---

# 4. Organizations

Table:

```text id="w2v8e9"
organizations
```

Purpose:

Represents a company/tenant using the platform.

Suggested fields:

```text id
name
slug
status
timezone
currency
created_at
updated_at
```

Status:

```text id="k2w5g8"
active
suspended
archived
```

Rules:

- `slug` should be unique.
- Organization deletion must be highly restricted.
- Organization status must affect authorization.
- Archived organizations must not behave as active organizations.

---

# 5. Users / Profiles

Table:

```text id="3j7d1x"
profiles
```

Purpose:

Application-level profile linked to the authentication identity.

Suggested fields:

```text id
auth_user_id
display_name
avatar_url
phone
job_title
status
created_at
updated_at
```

Do not duplicate authentication secrets.

Authentication credentials remain managed by the authentication system.

---

# 6. Organization Memberships

Table:

```text id="9k2m4a"
organization_memberships
```

Purpose:

Connects a user to an organization.

Suggested fields:

```text id
organization_id
user_id
status
joined_at
created_at
updated_at
```

Status:

```text id="7h2x5m"
invited
active
suspended
disabled
left
```

Constraints:

```text id="c4r6w8"
UNIQUE(organization_id, user_id)
```

---

# 7. Roles

Tables:

```text id="f6g3n8"
roles
permissions
role_permissions
membership_roles
```

Roles belong to an organization when custom roles are supported.

Permissions should be atomic.

Examples:

```text id="e3r8j1"
clients.read
clients.create
clients.update
clients.delete

domains.read
domains.create
domains.update
domains.delete

dns.read
dns.write
dns.delete

hosting.read
hosting.manage

deployments.read
deployments.create
deployments.rollback

payments.read
payments.create
payments.refund

support.read
support.manage

staff.read
staff.manage

salary.read
salary.manage

chat.read
chat.manage

integrations.read
integrations.manage
```

Do not use the database role name as the sole authorization mechanism.

---

# 8. Teams / Departments

Tables:

```text id="m4p7x9"
departments
teams
team_members
```

Purpose:

Organize employees.

Relationships:

```text id="4f5c8y"
Organization
   ↓
Department
   ↓
Team
   ↓
Employee
```

An employee may belong to multiple teams if required.

---

# 9. Employees

Table:

```text id="h6n8v3"
employees
```

Purpose:

Business-level employee record.

Suggested fields:

```text id
organization_id
profile_id
employee_number
department_id
manager_employee_id
employment_status
joined_at
left_at
created_at
updated_at
```

Employment status:

```text id="6f8j2s"
active
suspended
departing
terminated
```

Employee records must remain separate from authentication state.

---

# 10. Employee Lifecycle

Recommended lifecycle:

```text id="q8x2m5"
Invited
 ↓
Active
 ↓
Suspended
 ↓
Departing
 ↓
Terminated
```

Termination must not automatically delete historical data.

Instead:

- Disable access.
- Revoke sessions.
- Review integrations.
- Reassign tasks.
- Reassign ownership.
- Preserve audit history.

---

# 11. Clients

Table:

```text id="c8v5m2"
clients
```

Suggested fields:

```text id
organization_id
name
status
account_manager_id
billing_email
phone
notes
created_at
updated_at
```

Status:

```text id="y3k8p5"
prospect
active
inactive
archived
```

---

# 12. Client Contacts

Table:

```text id="n4g7w2"
client_contacts
```

Suggested fields:

```text id
client_id
name
email
phone
job_title
is_primary
created_at
updated_at
```

All contacts must inherit tenant ownership through the client relationship.

---

# 13. Websites

Table:

```text id="b7h4x9"
websites
```

Suggested fields:

```text id
organization_id
client_id
name
production_url
status
repository_id
created_at
updated_at
```

A website may belong to:

- An organization.
- Optionally a client.

The client relationship must not cross organizations.

---

# 14. Website Environments

Table:

```text id="r5m2c8"
environments
```

Examples:

```text id="j7x4p2"
development
preview
staging
production
```

Suggested fields:

```text id
website_id
name
environment_type
status
created_at
updated_at
```

Constraint:

```text id="n9k3f5"
UNIQUE(website_id, environment_type)
```

where appropriate.

---

# 15. Domains

Table:

```text id="v4p8m6"
domains
```

Suggested fields:

```text id
organization_id
client_id
website_id
domain_name
registrar_id
dns_provider_id
status
expires_at
auto_renew
created_at
updated_at
```

Status:

```text id="q2m8k4"
active
expiring
expired
transferring
suspended
archived
```

`domain_name` should have appropriate normalization and uniqueness rules.

---

# 16. Registrars

Table:

```text id="t8c4x7"
registrars
```

Purpose:

Represents the domain registrar.

Do not assume the registrar is also the DNS provider.

Suggested fields:

```text id
organization_id
provider_account_id
name
status
created_at
updated_at
```

---

# 17. DNS Zones

Table:

```text id="k5m9p2"
dns_zones
```

Suggested fields:

```text id
organization_id
domain_id
provider_account_id
zone_identifier
status
last_synced_at
created_at
updated_at
```

---

# 18. DNS Records

Table:

```text id="x3h7v8"
dns_records
```

Suggested fields:

```text id
dns_zone_id
record_type
name
content
ttl
priority
provider_record_id
status
created_at
updated_at
```

Sensitive record types include:

```text id="b6v9n2"
NS
MX
CAA
TXT
```

Application workflows must treat them carefully.

---

# 19. DNS Snapshots

Table:

```text id="m8c2f4"
dns_snapshots
```

Purpose:

Store a safe historical representation before major changes.

Suggested fields:

```text id
dns_zone_id
created_by
snapshot_data
created_at
```

Do not store secrets unnecessarily.

---

# 20. Hosting Accounts

Table:

```text id="p4v7x2"
hosting_accounts
```

Suggested fields:

```text id
organization_id
client_id
provider_account_id
provider_type
account_identifier
status
created_at
updated_at
```

Potential providers:

```text id="c7n5k8"
Vercel
cPanel
Cloudflare
Other
```

---

# 21. Repositories

Table:

```text id="f8x3m6"
repositories
```

Suggested fields:

```text id
organization_id
website_id
provider_account_id
provider_repository_id
name
default_branch
private
status
created_at
updated_at
```

Repository secrets must never be stored in normal application fields.

---

# 22. Deployments

Table:

```text id="q7m4c9"
deployments
```

Suggested fields:

```text id
organization_id
website_id
environment_id
repository_id
provider_deployment_id
commit_sha
branch
status
deployed_by
started_at
completed_at
created_at
```

Status:

```text id="a5k8v2"
queued
building
deploying
success
failed
cancelled
rolled_back
```

---

# 23. Provider Accounts

Table:

```text id="z4n8c6"
provider_accounts
```

Purpose:

Represents a connected external provider account.

Examples:

```text id="h7m3p9"
GitHub
Vercel
Cloudflare
cPanel
Stripe
Dojo
Registrar
Email
TURN
Monitoring
```

Suggested fields:

```text id
organization_id
provider_type
display_name
external_account_id
status
last_verified_at
last_sync_at
created_at
updated_at
```

Never store raw credentials here.

---

# 24. Provider Credentials

Table:

```text id="v8x2k5"
provider_credentials
```

Purpose:

References encrypted provider credentials.

Suggested fields:

```text id
provider_account_id
credential_type
encrypted_secret
key_reference
expires_at
revoked_at
created_at
updated_at
```

Requirements:

- Encryption at rest.
- Encryption keys separated from encrypted data.
- Access restricted.
- Rotation support.
- Revocation support.
- Expiry support.
- Access audit.

Never expose the decrypted secret to the browser.

---

# 25. Tasks

Table:

```text id="c5m9x3"
tasks
```

Suggested fields:

```text id
organization_id
client_id
project_id
title
description
status
priority
created_by
assigned_to
manager_id
due_at
completed_at
created_at
updated_at
```

Status:

```text id="p8v4m7"
backlog
todo
in_progress
blocked
review
completed
cancelled
```

Priority:

```text id="j5k9c2"
low
medium
high
urgent
```

---

# 26. Task Assignment History

Table:

```text id="x7m3n8"
task_assignments
```

Purpose:

Track who was assigned and when.

Suggested fields:

```text id
task_id
assigned_to
assigned_by
started_at
ended_at
reason
created_at
```

This provides accountability.

---

# 27. Task Comments

Table:

```text id="m4c8p2"
task_comments
```

Suggested fields:

```text id
task_id
author_id
body
created_at
updated_at
```

---

# 28. Task Checklists

Tables:

```text id="n6x3v8"
task_checklists
task_checklist_items
```

Allow tasks to contain structured completion steps.

---

# 29. Task Dependencies

Table:

```text id="r8p5m4"
task_dependencies
```

Relationship:

```text id="q7c3x9"
Task A
  ↓ blocks
Task B
```

Prevent invalid self-dependencies.

---

# 30. Support Tickets

Table:

```text id="f3m8k2"
support_tickets
```

Suggested fields:

```text id
organization_id
client_id
subject
status
priority
assigned_to
created_by
sla_due_at
resolved_at
created_at
updated_at
```

Status:

```text id="v5n9c7"
open
in_progress
waiting_customer
waiting_internal
escalated
resolved
closed
```

---

# 31. Support Messages

Table:

```text id="k8x4m3"
support_messages
```

Suggested fields:

```text id
ticket_id
author_type
author_id
visibility
body
created_at
```

Visibility:

```text id="q4p7c9"
customer
internal
```

Internal messages must never be exposed to customer-facing queries.

---

# 32. Chat Rooms

Table:

```text id="m7c2x8"
chat_rooms
```

Types:

```text id="f9n4k6"
direct
team
department
project
private
```

Suggested fields:

```text id
organization_id
room_type
name
created_by
created_at
updated_at
```

---

# 33. Chat Members

Table:

```text id="x5p8m3"
chat_members
```

Suggested fields:

```text id
room_id
user_id
joined_at
left_at
created_at
```

Constraint:

```text id="n2v7k4"
UNIQUE(room_id, user_id)
```

---

# 34. Chat Messages

Table:

```text id="c6m9x5"
chat_messages
```

Suggested fields:

```text id
room_id
sender_id
body
reply_to_message_id
created_at
updated_at
deleted_at
```

Messages must be accessible only to authorized room members.

---

# 35. Chat Attachments

Table:

```text id="v3k8p2"
chat_attachments
```

Store references to private storage objects.

Never make sensitive internal attachments publicly accessible.

---

# 36. Calls / WebRTC

Tables:

```text id="p8m4x7"
calls
call_participants
```

Suggested call fields:

```text id
organization_id
room_id
initiated_by
call_type
status
started_at
ended_at
created_at
```

Call type:

```text id="m5c9v2"
audio
video
```

Do not store media streams in the database.

The database stores call metadata/signaling state only.

---

# 37. Customer Records

Customer information may be represented through:

```text id="x7n3k8"
clients
client_contacts
```

Avoid creating duplicate customer records across modules.

Payment, support, tasks, and websites should reference the canonical client record.

---

# 38. Payment Requests

Table:

```text id="c4m8v7"
payment_requests
```

Suggested fields:

```text id
organization_id
client_id
created_by
provider
amount
currency
description
status
expires_at
provider_payment_id
payment_link
created_at
updated_at
```

Status:

```text id="k7p2x5"
draft
pending
sent
opened
paid
failed
expired
cancelled
refunded
```

Payment amounts must be server-authoritative.

---

# 39. Payment Links

If separated from payment requests:

```text id="m3v8c6"
payment_links
```

Suggested fields:

```text id
payment_request_id
provider
provider_link_id
url
status
expires_at
created_at
```

Never store sensitive provider credentials.

---

# 40. Payment Events

Table:

```text id="x8k4m5"
payment_events
```

Purpose:

Store provider events for idempotency, auditability, and reconciliation.

Suggested fields:

```text id
organization_id
provider
provider_event_id
event_type
payload_reference
processed_at
processing_status
created_at
```

Constraint:

```text id="p5c7n2"
UNIQUE(provider, provider_event_id)
```

where provider event IDs are globally unique within the provider.

---

# 41. Payment Reconciliation

Optional table:

```text id="v6m3x9"
payment_reconciliations
```

Track:

```text id
payment_request_id
local_status
provider_status
difference
resolution
resolved_by
resolved_at
created_at
```

---

# 42. Salary / HR

## Salary Records

Table:

```text id="k3x8m4"
salary_records
```

Suggested fields:

```text id
organization_id
employee_id
salary_amount
currency
effective_from
effective_to
status
created_by
created_at
updated_at
```

Salary data is highly sensitive.

---

# 43. Payroll Periods

Table:

```text id="m8v4c7"
payroll_periods
```

Suggested fields:

```text id
organization_id
period_start
period_end
status
created_at
updated_at
```

---

# 44. Salary Payments

Table:

```text id="x5k9p3"
salary_payments
```

Suggested fields:

```text id
organization_id
employee_id
payroll_period_id
amount
currency
status
paid_at
payment_reference
proof_file_id
created_by
approved_by
created_at
updated_at
```

Status:

```text id="q8m3v6"
pending
approved
paid
cancelled
```

Salary information must have dedicated authorization.

---

# 45. Notifications

Table:

```text id="c7x4m8"
notifications
```

Suggested fields:

```text id
organization_id
user_id
type
title
body
resource_type
resource_id
read_at
created_at
```

Notifications must be tenant-aware.

---

# 46. Audit Logs

Table:

```text id="m5v8k3"
audit_logs
```

Suggested fields:

```text id
organization_id
actor_user_id
action
resource_type
resource_id
result
metadata
request_id
created_at
```

Never store:

```text id="p4x7n2"
Passwords
API keys
Tokens
Private keys
Card details
Webhook secrets
```

Audit logs should be append-oriented.

---

# 47. Jobs

Table:

```text id="x8c5m4"
jobs
```

Suggested fields:

```text id
organization_id
job_type
status
payload
attempts
max_attempts
available_at
started_at
completed_at
last_error
created_at
updated_at
```

Status:

```text id="v7k3p9"
queued
running
completed
failed
retrying
cancelled
dead_letter
```

Job payloads must not contain unnecessary secrets.

---

# 48. Webhooks

Table:

```text id="m4x8c2"
webhook_events
```

Suggested fields:

```text id
organization_id
provider
provider_event_id
event_type
processing_status
received_at
processed_at
attempts
last_error
created_at
```

Use uniqueness constraints to prevent duplicate processing.

---

# 49. Incidents

Table:

```text id="k7c3v8"
incidents
```

Suggested fields:

```text id
organization_id
title
severity
status
owner_id
started_at
resolved_at
created_at
updated_at
```

Severity:

```text id="p8m4x2"
low
medium
high
critical
```

---

# 50. Integration Health

Integration status should be represented through:

```text id="x5v9m3"
provider_accounts
```

and supporting health/sync records where required.

Track:

- Connection state.
- Last successful verification.
- Last synchronization.
- Last failure.
- Token expiry.
- Provider account identifier.

Do not store actual secrets in the status table.

---

# 51. Infrastructure Relationship Graph

The system should support relationships such as:

```text id="n8c4m7"
Organization
    │
    ├── Client
    │      │
    │      ├── Website
    │      │      ├── Repository
    │      │      ├── Environment
    │      │      └── Deployment
    │      │
    │      └── Domain
    │             ├── Registrar
    │             └── DNS Provider
    │
    └── Hosting
```

This relationship model should make infrastructure ownership traceable.

---

# 52. Tenant Ownership Matrix

Every table must be classified.

| Entity               | Tenant Owned | Sensitive | RLS |
| -------------------- | -----------: | --------: | --: |
| organizations        |         Root |      High | Yes |
| profiles             |     Indirect |    Medium | Yes |
| memberships          |          Yes |      High | Yes |
| roles                |          Yes |      High | Yes |
| clients              |          Yes |      High | Yes |
| websites             |          Yes |    Medium | Yes |
| domains              |          Yes |      High | Yes |
| DNS records          |          Yes |      High | Yes |
| hosting              |          Yes |      High | Yes |
| repositories         |          Yes |      High | Yes |
| deployments          |          Yes |    Medium | Yes |
| provider accounts    |          Yes |      High | Yes |
| provider credentials |          Yes |  Critical | Yes |
| tasks                |          Yes |    Medium | Yes |
| support tickets      |          Yes |      High | Yes |
| chat rooms           |          Yes |      High | Yes |
| chat messages        |          Yes |      High | Yes |
| calls                |          Yes |    Medium | Yes |
| payment requests     |          Yes |      High | Yes |
| payment events       |          Yes |      High | Yes |
| salary records       |          Yes |  Critical | Yes |
| salary payments      |          Yes |  Critical | Yes |
| notifications        |          Yes |    Medium | Yes |
| audit logs           |          Yes |      High | Yes |
| jobs                 |          Yes |    Medium | Yes |
| webhooks             |          Yes |      High | Yes |
| incidents            |          Yes |      High | Yes |

---

# 53. Cross-Tenant Relationship Rule

A relationship must never allow:

```text id="z4m8x3"
Tenant A resource
        ↓
Tenant B resource
```

Examples:

```text id="p6c2v9"
Tenant A task
→ Tenant B employee

Tenant A website
→ Tenant B domain

Tenant A payment
→ Tenant B client

Tenant A chat room
→ Tenant B user
```

These must be rejected at the application and database levels where practical.

---

# 54. Sensitive Data Classification

## Critical

```text id="m7x3c8"
Provider secrets
Encryption keys
Authentication secrets
Payment credentials
Salary information
```

## High

```text id="v4k8p2"
Customer data
Support conversations
Domain/DNS control data
Infrastructure configuration
Private chat
Payment status
```

## Medium

```text id="x9c5m3"
Tasks
Deployments
Call metadata
Notifications
```

## Low

Public or non-sensitive metadata.

---

# 55. Data Access Rules

Default rule:

```text id="q8v3m5"
DENY
```

Access should be explicitly granted.

The data access layer should avoid broad queries that return sensitive columns unnecessarily.

---

# 56. Indexing

Indexes should be added based on real query patterns.

Likely indexes include:

```text id="m4c8x7"
organization_id
organization_id + status
organization_id + created_at
client_id
website_id
domain_name
employee_id
assigned_to
ticket status
room_id + created_at
payment status
provider_event_id
expires_at
```

Do not create excessive indexes without measuring their impact.

---

# 57. Unique Constraints

Important examples:

```text id="x7m2c9"
organization_memberships:
UNIQUE(organization_id, user_id)

chat_members:
UNIQUE(room_id, user_id)

payment_events:
UNIQUE(provider, provider_event_id)

domains:
appropriate normalized domain uniqueness

teams:
UNIQUE(organization_id, name)
```

Business-specific uniqueness must be decided before implementation.

---

# 58. State Machines

Important entities should use explicit state transitions.

Example payment:

```text id="k5v8m3"
draft
 ↓
pending
 ↓
sent
 ↓
paid
```

Failure paths:

```text id="p7c4x9"
pending
 ↓
failed

sent
 ↓
expired

paid
 ↓
refunded
```

Do not allow arbitrary status changes from the client.

---

# 59. Soft Deletion

Use soft deletion only when historical preservation is required.

Good candidates may include:

- Clients.
- Employees.
- Chat messages.
- Support records.
- Infrastructure resources.

Do not use soft deletion as an excuse to ignore authorization.

Deleted/archived records still require access controls.

---

# 60. Audit Relationships

Sensitive entities should generate audit records.

Examples:

```text id="v3x8m5"
Domain
DNS
Provider credential
Payment
Refund
Salary
Role
Permission
Deployment
Support
Staff access
Data export
```

---

# 61. Database Transactions

Use transactions when multiple changes must succeed together.

Examples:

```text id="m8c4p7"
Create employee
+
Membership
+
Role
```

or:

```text id="x5v9k3"
Payment request
+
Payment provider record
+
Audit event
```

The exact transaction boundary depends on external provider behavior.

Do not assume external API calls can participate in PostgreSQL transactions.

---

# 62. External Provider Consistency

External operations may partially succeed.

Example:

```text id="c7m3x8"
Application
→ DNS Provider
→ Change succeeds
→ Network timeout
→ Application thinks operation failed
```

Therefore:

```text id="p4v8k2"
Provider State
↕
Local State
```

must support reconciliation.

---

# 63. Idempotency

Use idempotency where operations can safely be retried.

Important areas:

- Payments.
- Refunds.
- Webhooks.
- DNS updates.
- Provider synchronization.
- Deployments.
- Notifications.

---

# 64. Storage Model

Supabase Storage should be organized logically.

Example:

```text id="x8m4c7"
organization/
    clients/
    support/
    tasks/
    chat/
    hr/
    payments/
    documents/
```

Sensitive files should use private buckets or equivalent authorization.

Do not construct storage paths from untrusted user input without validation.

---

# 65. Customer vs Internal Data

Customer-visible data must be explicitly separated from internal data.

Example:

```text id="v5c8m2"
Support Message
├── customer
└── internal
```

Do not infer visibility merely from the author's role.

---

# 66. API Data Model Rule

API responses should use explicit DTOs.

Avoid returning complete database rows when only a few fields are needed.

Especially avoid returning:

```text id="k4m8x3"
provider_credentials
salary_records
internal_notes
audit metadata
private integration information
```

to general-purpose endpoints.

---

# 67. Migration Rules

Every schema change must use a migration.

Migration process:

```text id="p7x3c9"
Design
 ↓
Migration
 ↓
Review
 ↓
Local test
 ↓
Integration test
 ↓
Staging
 ↓
Production
```

Never modify production schema manually as the normal workflow.

---

# 68. Migration Safety

Before destructive migrations:

- Confirm backups.
- Confirm rollback/recovery strategy.
- Check dependent queries.
- Check RLS.
- Check indexes.
- Check foreign keys.
- Check data conversion.
- Test against representative data.

---

# 69. Seed Data

Development seed data must be clearly synthetic.

Never copy real:

- Customer data.
- Employee data.
- Salary information.
- Payment information.
- Provider credentials.

into development seed files.

---

# 70. Test Data

Automated tests should create isolated test data.

Tests must include:

```text id="m8c4v7"
Tenant A
Tenant B
Admin
Manager
Staff
Customer
Unauthorized user
```

This is required for authorization testing.

---

# 71. RLS Testing

For each protected table test:

```text id="x5k9p3"
Unauthenticated → DENY

Tenant A user → Tenant A → ALLOW

Tenant A user → Tenant B → DENY

Unauthorized role → DENY

Authorized role → ALLOW
```

Do not test only the happy path.

---

# 72. Data Model Change Process

When adding a new entity:

1. Define purpose.
2. Define tenant ownership.
3. Define relationships.
4. Identify sensitive fields.
5. Define lifecycle states.
6. Define constraints.
7. Define indexes.
8. Define RLS.
9. Define authorization.
10. Define audit requirements.
11. Define migrations.
12. Add tests.
13. Update this document.

---

# 73. AI Implementation Rules

Before creating or modifying database tables Claude must:

1. Read the relevant section of this document.
2. Identify organization ownership.
3. Identify relationships.
4. Identify sensitive fields.
5. Identify RLS requirements.
6. Identify authorization requirements.
7. Identify indexes.
8. Identify constraints.
9. Identify audit requirements.
10. Create a migration.
11. Add database/security tests.
12. Update documentation.

Claude must not create a table simply because the UI needs somewhere to store data.

The model must support the application's security and business rules.

---

# 74. Data Model Completion Criteria

A data-model feature is not complete until:

- [ ] Entity defined.
- [ ] Tenant ownership defined.
- [ ] Relationships defined.
- [ ] Foreign keys defined.
- [ ] Constraints reviewed.
- [ ] Indexes reviewed.
- [ ] Sensitive fields classified.
- [ ] RLS implemented.
- [ ] Authorization implemented.
- [ ] Migration created.
- [ ] Migration tested.
- [ ] Security tests added.
- [ ] Documentation updated.

---

# 75. Source of Truth

The following hierarchy applies:

```text id="q3m8v7"
Actual PostgreSQL schema
        ↓
Migration files
        ↓
DATA_MODEL.md
        ↓
Application types
        ↓
UI assumptions
```

The UI must never become the source of truth for database behavior.

If documentation and migrations disagree:

```text id="x7c4m2"
STOP
→ Inspect actual schema
→ Identify discrepancy
→ Update documentation
→ Record decision if required
```

---

# 76. Final Data Integrity Principle

The database must enforce the most important invariants.

Do not rely exclusively on:

```text id="m5x8c3"
React
TypeScript
UI validation
Hidden fields
Client-side permissions
```

Security and integrity should be enforced through:

```text id="v8k3p6"
PostgreSQL constraints
+
Foreign keys
+
RLS
+
Server-side authorization
+
Transactions
+
State validation
+
Idempotency
+
Audit
```

The objective is a database that remains safe even when the client is malicious, buggy, outdated, or completely bypassed.

Create or update `docs/ai/DATA_MODEL.md`.

Inspect existing Supabase schemas, migrations, generated types, database policies, and application data access before documenting anything.

Separate the existing verified schema from the proposed future schema.

For each entity, document its purpose, fields, primary key, foreign keys, uniqueness constraints, indexes, tenant ownership, sensitive fields, lifecycle, and access rules.

Evaluate entities for:

- Organizations, memberships, users, roles, permissions, and custom role assignments.
- Customers, contacts, CRM records, documents, and activities.
- Employees, teams, reporting relationships, and employment status.
- Tasks, projects, assignments, dependencies, comments, checklists, and approvals.
- Chatrooms, memberships, messages, attachments, reactions, and read state.
- Support tickets, messages, internal notes, assignments, SLAs, and escalations.
- Salary records, pay periods, payment status, approvals, and audit history.
- Payment providers, payment links, payment attempts, webhook events, refunds, and reconciliation.
- Domains, registrars, DNS providers, DNS change requests, verification, renewals, and SSL.
- Websites, hosting projects, environments, deployments, build logs, and deployment history.
- Provider connections, encrypted credential references, sync state, jobs, retries, and integration health.
- Notifications, audit events, incidents, and monitoring records.
- Future website-builder projects, site versions, generation jobs, previews, hosting plans, subscriptions, usage quotas, entitlements, custom-domain bindings, and publishing history.

Do not blindly create every entity. Explain which are needed now, which are future scope, and which depend on business decisions.

Define tenant-isolation invariants, RLS policies, server-side authorization, foreign-key strategies, data retention, soft-delete behavior, and sensitive-data access.

Do not store card details, plaintext provider secrets, or credentials in ordinary application tables. Document secure credential references and secret rotation.

Address webhook idempotency, duplicate events, concurrent updates, transaction boundaries, and durable job processing.

Include an entity relationship diagram where helpful.

Do not generate SQL migrations or claim RLS policies exist unless verified.
