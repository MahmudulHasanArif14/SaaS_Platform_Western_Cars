# Threat Model

## 1. Purpose

This document defines the security threats, trust boundaries, attack surfaces, security assumptions, mitigations, and verification requirements for the Company Infrastructure & Operations Platform.

The platform is a multi-tenant business operations system handling potentially sensitive:

- Organization data
- Employee data
- Customer data
- Domain and DNS configuration
- Hosting infrastructure
- GitHub/Vercel/Cloudflare/cPanel integrations
- Provider credentials
- Payment information and payment status
- Salary information
- Support conversations
- Internal staff communications
- WebRTC signaling and call metadata
- Audit records

Security must be designed into the architecture rather than added after implementation.

---

# 2. Security Objectives

The system must preserve:

## Confidentiality

Users must only access information they are authorized to access.

## Integrity

Users and external providers must not be able to make unauthorized or manipulated changes.

## Availability

Critical company operations should remain usable during provider failures, network failures, or application failures.

## Tenant Isolation

One organization must never access another organization's data.

## Accountability

Security-sensitive actions must be auditable.

## Recoverability

Critical data and configuration must be recoverable after accidental or malicious changes.

---

# 3. Security Priority

Threats are classified as:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

### CRITICAL

Potential:

- Cross-tenant data exposure
- Authentication bypass
- Privilege escalation
- Secret compromise
- Payment manipulation
- Database compromise
- Destructive infrastructure takeover
- Irrecoverable data loss

CRITICAL threats block production.

### HIGH

Significant security impact requiring remediation before production unless formally accepted.

### MEDIUM

Meaningful security weakness that requires mitigation or documented acceptance.

### LOW

Limited-impact issue or defense-in-depth improvement.

---

# 4. System Architecture

The expected architecture is:

```text
                         INTERNET
                            │
                            ▼
                    ┌────────────────┐
                    │    Next.js     │
                    │   Web Client   │
                    └───────┬────────┘
                            │
                     Authenticated
                        Requests
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Application Layer   │
                 │                     │
                 │ Validation          │
                 │ Authorization       │
                 │ Business Rules      │
                 │ Transactions        │
                 │ Audit               │
                 └──────────┬──────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      ┌────────────────┐          ┌─────────────────┐
      │    Supabase    │          │ Background Jobs │
      │                │          │ / Webhooks      │
      │ Auth           │          └────────┬────────┘
      │ PostgreSQL     │                   │
      │ RLS            │                   │
      │ Storage        │                   │
      │ Realtime       │                   │
      └────────────────┘                   │
                                           ▼
                                  Provider Adapters
                                           │
              ┌────────────┬───────────────┼─────────────┐
              ▼            ▼               ▼             ▼
           GitHub        Vercel        Cloudflare     cPanel
              │
              ├──────── Stripe
              └──────── Dojo
```

Provider-specific credentials and privileged operations must remain server-side.

---

# 5. Trust Boundaries

The system contains several trust boundaries.

## Boundary 1 — Browser → Application

The browser is untrusted.

Never trust:

- User IDs
- Organization IDs
- Role values
- Permission values
- Resource IDs
- Payment amounts
- Provider selections
- Hidden form fields
- Client-side authorization
- UI visibility

Everything security-sensitive must be validated server-side.

---

## Boundary 2 — Application → Database

The application must enforce authorization.

Supabase RLS must provide database-level tenant isolation.

Privileged database access must be:

- Server-side only
- Minimized
- Explicitly authorized
- Audited where appropriate

A service-role credential must never be exposed to the browser.

---

## Boundary 3 — Application → External Provider

External APIs are separate trust domains.

Examples:

```text
GitHub
Vercel
Cloudflare
cPanel
Stripe
Dojo
Email providers
TURN providers
Monitoring providers
Domain registrars
```

The application must not assume:

```text
Provider success
=
Local database truth
```

Provider operations require:

- Authentication
- Authorization
- Validation
- Timeouts
- Error handling
- Idempotency where appropriate
- Reconciliation
- Audit logging

---

## Boundary 4 — User → User

Employees may have different privileges.

One employee must not automatically be trusted with:

- Another employee's salary
- Administrative credentials
- Payment configuration
- Domain transfer operations
- Infrastructure secrets
- Private support information

Authorization must be resource- and action-specific.

---

## Boundary 5 — Customer → Internal System

Customers are less trusted than internal staff.

Customer-facing interfaces must never expose:

- Internal notes
- Staff-only conversations
- Salary information
- Provider credentials
- Internal audit data
- Other customer information

---

# 6. Threat Actors

## External Attacker

Goals:

- Account takeover
- Data theft
- Payment fraud
- Infrastructure compromise
- Credential theft
- Denial of service

---

## Malicious Customer

Goals:

- Access another customer's information
- Manipulate payment requests
- Access internal support information
- Abuse uploads or APIs

---

## Compromised Employee

An employee account may become compromised.

Goals:

- Escalate privileges
- Access customer data
- Steal credentials
- Manipulate payments
- Modify infrastructure
- Exfiltrate internal communications

The system must assume that a valid authenticated account can become compromised.

---

## Malicious Insider

An authorized employee may intentionally abuse their privileges.

Mitigations:

- Least privilege
- Separation of duties
- Audit logs
- Approval workflows
- Reauthentication
- Restricted credential access
- Alerts for sensitive actions

---

## Compromised Provider Account

An external provider account may be compromised.

Examples:

- GitHub
- Vercel
- Cloudflare
- Registrar
- cPanel
- Stripe
- Dojo

The application should minimize the blast radius through:

- Least privilege
- Separate credentials
- Scoped access
- Credential rotation
- Revocation
- Monitoring

---

## Supply-Chain Attacker

Potential attack through:

- npm package
- dependency
- third-party SDK
- compromised provider library
- malicious update

Mitigations:

- Dependency auditing
- Lockfiles
- Security scanning
- Minimal dependencies
- Controlled upgrades

---

# 7. Multi-Tenant Threats

## Threat

User modifies:

```text
organization_id
```

to access another organization.

### Mitigation

Never trust organization IDs supplied by the browser.

Derive organization membership from authenticated context and authorized server-side queries.

Use:

- RLS
- Membership checks
- Foreign keys
- Tenant-aware queries
- Server-side authorization

### Test

Attempt:

```text
Tenant A user
→ Tenant B resource
```

Expected:

```text
DENIED
```

---

## Threat

IDOR/resource enumeration.

Example:

```text
/tasks/123
/tasks/124
/tasks/125
```

### Mitigation

Every resource access must verify:

```text
User
+
Organization
+
Permission
+
Resource ownership
```

---

## Threat

Cross-tenant relationship injection.

Example:

```text
Tenant A task
→ Tenant B employee
```

### Mitigation

Database constraints and application validation must prevent cross-tenant relationships.

---

# 8. Authentication Threats

Potential attacks:

- Credential stuffing
- Password attacks
- Session theft
- Token theft
- Account takeover
- Session fixation
- MFA bypass
- Invitation abuse

Mitigations:

- Supabase Auth
- Secure session handling
- MFA where appropriate
- Reauthentication for sensitive operations
- Session revocation
- Rate limiting
- Secure cookies
- Account disable functionality

Sensitive operations should support step-up authentication.

---

# 9. Authorization Threats

## Threat

User modifies their own role.

Example:

```text
staff
→ administrator
```

### Mitigation

Roles and permissions must only be changed through authorized server-side workflows.

Never trust:

```text
role=admin
```

from the client.

---

## Threat

Privilege escalation through API manipulation.

### Mitigation

Authorization must execute at the service/application boundary.

UI checks are insufficient.

---

## Threat

Horizontal privilege escalation.

Example:

```text
Employee A
→ Employee B's private data
```

### Mitigation

Resource-level authorization.

---

## Threat

Vertical privilege escalation.

Example:

```text
Staff
→ Finance
→ Administrator
```

### Mitigation

Permission matrix and server-side enforcement.

---

# 10. Secrets & Credential Threats

Sensitive credentials may include:

- API keys
- OAuth tokens
- Refresh tokens
- Provider credentials
- Database credentials
- SMTP credentials
- TURN credentials
- Webhook secrets

## Threat

Secret exposed in:

- Browser bundle
- Git
- Logs
- Error messages
- Database plaintext
- Session logs
- Client-side environment variables

### Mitigation

Secrets must:

- Remain server-side.
- Never be committed.
- Never appear in logs.
- Never be returned unnecessarily to clients.
- Be encrypted at rest where stored.
- Have rotation/revocation support.
- Have expiration metadata where possible.

---

# 11. Secret Vault Threat Model

If provider credentials are stored in the platform:

```text
User
 ↓
Authorized server operation
 ↓
Secret service
 ↓
Encrypted credential
 ↓
Provider
```

Never:

```text
Browser
 ↓
Secret
 ↓
Provider
```

Encryption keys must be separated from encrypted application data.

Credential access should be permission-controlled and audited.

---

# 12. Domain & DNS Threats

DNS is a high-impact administrative surface.

Potential attacks:

- Unauthorized DNS modification
- Nameserver takeover
- MX modification
- CAA modification
- SPF modification
- DKIM modification
- DMARC modification
- DNS record deletion
- Domain takeover

## Mitigations

Sensitive DNS changes should use:

```text
Preview
→ Validation
→ Authorization
→ Confirmation
→ Apply
→ Provider Verification
→ Audit
```

High-risk changes may require additional approval.

---

# 13. Registrar Threats

Potential attacks:

- Domain transfer
- Nameserver change
- Renewal manipulation
- Contact modification
- Domain deletion

Registrar capabilities vary.

Never assume an API operation exists.

Provider capabilities must be verified and tracked in:

```text
INTEGRATION_STATUS.md
```

---

# 14. Hosting Threats

Potential attacks:

- Deployment takeover
- Project deletion
- Environment variable exposure
- Domain mapping manipulation
- Server credential compromise
- File modification

Mitigations:

- Least privilege
- Deployment approvals
- Audit logs
- Environment separation
- Secret protection
- Deployment history
- Health checks
- Rollback procedures

---

# 15. GitHub Threats

Potential attacks:

- Repository takeover
- Malicious commit
- Token theft
- Unauthorized deployment
- Secret extraction

Mitigations:

- Least-privilege integration.
- Token protection.
- Repository scope restrictions.
- Audit logging.
- Deployment controls.
- Secret scanning.

---

# 16. Vercel Threats

Potential attacks:

- Project takeover
- Deployment manipulation
- Environment variable exposure
- Domain manipulation

Mitigations:

- Least privilege.
- Server-side integration.
- Deployment authorization.
- Audit logging.
- Environment separation.

---

# 17. Cloudflare Threats

Potential attacks:

- DNS takeover
- Zone modification
- Proxy configuration manipulation
- SSL configuration changes

High-risk configuration changes require stronger authorization.

---

# 18. cPanel Threats

Potential attacks:

- Hosting account compromise
- File modification
- Database access
- Email configuration manipulation
- DNS manipulation

Only verified API capabilities should be exposed through the platform.

---

# 19. Payment Threat Model

Payment functionality is a critical security area.

Supported providers may include:

```text
Stripe
Dojo
```

## Threats

- Payment amount manipulation
- Currency manipulation
- Customer substitution
- Unauthorized payment-link creation
- Fake payment success
- Replay attacks
- Webhook forgery
- Webhook duplication
- Refund abuse
- Provider mismatch
- Payment status manipulation

---

# 20. Payment Amount Security

Never trust payment amount supplied by the client.

Bad:

```text
Browser
→ amount=1
→ server creates £1 payment
```

Better:

```text
Browser
→ payment request ID
→ server retrieves authoritative amount
→ server validates permissions
→ provider request
```

If arbitrary amounts are permitted, the server must validate limits and authorization.

---

# 21. Payment Provider Selection

Employee may select:

```text
Stripe
or
Dojo
```

But the server must verify:

```text
Provider enabled
AND
Provider connected
AND
Provider verified
AND
Employee authorized
AND
Provider supports requested operation
```

The client selection is only a request.

---

# 22. Payment Webhook Threats

Never trust a webhook solely because it reached the endpoint.

Required:

```text
Receive
→ Verify signature/authentication
→ Validate payload
→ Deduplicate
→ Persist event
→ Process
→ Reconcile
```

Webhook endpoints must resist:

- Forged events
- Replay
- Duplicate events
- Malformed payloads
- Event ordering problems

---

# 23. Payment Reconciliation

Local state can become incorrect because of:

- Network timeout
- Provider outage
- Webhook failure
- Duplicate webhook
- Partial transaction

Therefore:

```text
Provider state
↕
Local state
```

must periodically be reconciled.

---

# 24. Customer Support Threats

Potential attacks:

- Customer accesses internal notes.
- Customer accesses another ticket.
- Employee sends sensitive information.
- Malicious attachment.
- Ticket ID enumeration.

Mitigations:

- Ticket-level authorization.
- Tenant isolation.
- Internal/public message distinction.
- Attachment validation.
- File size/type restrictions.
- Malware scanning where appropriate.

---

# 25. Staff Chat Threats

Potential attacks:

- Unauthorized room access.
- Message enumeration.
- Deleted-message abuse.
- Attachment abuse.
- Employee impersonation.
- Cross-organization realtime subscription.

Mitigations:

- RLS.
- Room membership validation.
- Message-level authorization.
- Secure realtime channels.
- Attachment access controls.
- Audit sensitive operations.

---

# 26. WebRTC Threats

WebRTC introduces additional attack surfaces.

Potential threats:

- Unauthorized calls.
- Call signaling interception.
- Room enumeration.
- TURN credential theft.
- IP/privacy leakage.
- Call metadata exposure.
- Unauthorized screen sharing.

Mitigations:

- Authenticated signaling.
- Authorized call participants.
- Short-lived TURN credentials where possible.
- Secure signaling channels.
- Permission checks before call creation.
- Explicit camera/microphone permissions.
- Minimal call metadata storage.

Never expose long-lived TURN credentials unnecessarily.

---

# 27. Salary / HR Threats

Salary data is highly sensitive.

Threats:

- Unauthorized employee access.
- Salary modification.
- Fake payment status.
- Record deletion.
- Data export abuse.

Mitigations:

- Dedicated permissions.
- Strong RLS.
- Server-side authorization.
- Audit logging.
- Restricted exports.
- Approval workflows.
- Reauthentication for sensitive changes.

---

# 28. File Upload Threats

Potential attacks:

- Malware.
- Executable uploads.
- Oversized files.
- Path traversal.
- Content-type spoofing.
- Storage abuse.
- Unauthorized file access.

Mitigations:

- File-size limits.
- Allowed MIME types.
- Extension validation.
- Generated filenames.
- Storage authorization.
- Malware scanning where required.
- No executable serving.
- Private buckets for sensitive files.

---

# 29. API Security

All API/server actions must use:

```text
Authentication
→ Authorization
→ Validation
→ Business Rules
→ Database/Provider Operation
→ Audit
```

Where appropriate.

APIs should support:

- Rate limiting.
- Pagination.
- Maximum request size.
- Timeouts.
- Structured errors.
- Correlation IDs.

Never return internal stack traces to clients.

---

# 30. SSRF Threat

The application may interact with external URLs.

Potential attacker behavior:

```text
Application
→ attacker-controlled URL
→ internal network
```

Mitigations:

- Allowlist external destinations where possible.
- Validate URLs.
- Block private IP ranges.
- Block localhost.
- Block internal metadata endpoints.
- Restrict redirects.
- Apply network timeouts.

---

# 31. XSS Threat

Potential injection locations:

- Chat messages.
- Support messages.
- Customer notes.
- Task comments.
- User profiles.
- Uploaded content.

Mitigations:

- React escaping.
- Avoid unsafe HTML.
- Sanitize HTML if HTML is intentionally supported.
- Content Security Policy where practical.

---

# 32. CSRF Threat

State-changing operations must not be executable through unauthorized cross-site requests.

Use appropriate:

- SameSite cookies.
- Origin validation.
- CSRF protection where required.
- Framework security mechanisms.

---

# 33. SQL / Database Threats

Potential attacks:

- SQL injection.
- Unauthorized queries.
- RLS bypass.
- Privileged credential abuse.

Mitigations:

- Parameterized queries.
- Typed database access.
- RLS.
- Restricted service-role access.
- Migration review.
- Database authorization tests.

---

# 34. Realtime Threats

Realtime subscriptions must be treated as authorization-sensitive.

A user must not subscribe to:

```text
another organization
another private room
another customer's private data
```

RLS and channel authorization must be tested.

---

# 35. Background Job Threats

Jobs may execute with elevated privileges.

Potential attacks:

- Unauthorized job creation.
- Job parameter manipulation.
- Duplicate execution.
- Privilege abuse.

Mitigations:

- Authorized job creation.
- Server-generated job parameters where possible.
- Idempotency.
- Retry limits.
- Job ownership.
- Audit logs.
- Dead-letter handling.

---

# 36. Webhook Threats

All external webhooks must be treated as untrusted until verified.

Required:

```text
Authenticate
Validate
Deduplicate
Authorize
Process
Audit
```

Never allow a webhook to directly perform unrestricted privileged operations.

---

# 37. Audit Log Threats

Potential attacks:

- Deleting audit records.
- Modifying audit records.
- Hiding malicious activity.

Mitigations:

- Restricted write path.
- Restricted deletion.
- Append-oriented design.
- Server-generated events.
- Privileged administrative access.
- Monitoring for suspicious activity.

Audit logs must never contain secrets.

---

# 38. Logging Threats

Never log:

```text
Passwords
API keys
Access tokens
Refresh tokens
Private keys
Payment card data
Webhook secrets
Database credentials
Sensitive salary information
```

Use structured logging and redaction.

---

# 39. Rate Limiting

Rate limiting should be considered for:

- Login.
- Password/reset operations.
- Invitations.
- Payment-link creation.
- Webhook endpoints.
- File uploads.
- Chat/message endpoints.
- Search.
- Provider API operations.
- Expensive infrastructure actions.

Limits should be tenant-aware where appropriate.

---

# 40. Concurrency Threats

Security-sensitive operations must handle simultaneous requests.

Examples:

```text
Two employees create payment links
Two admins modify DNS
Two managers approve the same task
Two workers process the same webhook
Two users modify the same record
```

Mitigations:

- Transactions.
- Unique constraints.
- Optimistic locking where appropriate.
- Idempotency keys.
- State-machine validation.
- Row-level locking where appropriate.

---

# 41. Approval / Separation of Duties

High-risk operations may require two-person approval.

Potential examples:

- Domain transfer.
- Nameserver changes.
- Destructive DNS changes.
- Large refunds.
- Provider credential changes.
- Critical infrastructure deletion.
- Sensitive financial changes.

The system should support configurable approval requirements.

---

# 42. Data Export Threats

Exports may contain large amounts of sensitive information.

Threats:

- Unauthorized export.
- Cross-tenant export.
- Salary export abuse.
- Customer-data leakage.

Mitigations:

- Explicit export permission.
- Tenant filtering.
- Audit export events.
- Rate limits.
- Restricted sensitive-data exports.
- Optional approval.

---

# 43. Account Compromise Response

If an employee account is compromised:

```text
Detect
 ↓
Disable account
 ↓
Revoke sessions
 ↓
Revoke credentials
 ↓
Review active integrations
 ↓
Review recent activity
 ↓
Reassign owned resources
 ↓
Investigate audit logs
 ↓
Rotate affected secrets
 ↓
Restore normal access
```

---

# 44. Provider Compromise Response

If an integration credential is compromised:

```text
Disable integration
 ↓
Revoke provider credential
 ↓
Rotate credential
 ↓
Review provider activity
 ↓
Review platform activity
 ↓
Reconcile resources
 ↓
Reconnect
 ↓
Verify
```

---

# 45. Backup Threats

Threats:

- Backup corruption.
- Backup deletion.
- Backup credential compromise.
- Incomplete backup.
- Unrestorable backup.

Requirement:

```text
Backup exists
≠
Backup verified
```

Perform periodic restore testing.

---

# 46. Disaster Scenario

Potential incident:

```text
Database corruption
+
Provider outage
+
Compromised employee account
```

The platform should have documented recovery procedures.

See:

```text
docs/runbooks/DISASTER_RECOVERY.md
docs/runbooks/INCIDENT_RESPONSE.md
```

---

# 47. Security Testing Matrix

Every security-sensitive module should have tests for:

| Area           | Required Tests                   |
| -------------- | -------------------------------- |
| Authentication | Bypass, session abuse            |
| RBAC           | Privilege escalation             |
| RLS            | Cross-tenant access              |
| Tasks          | Unauthorized assignment/access   |
| CRM            | Cross-customer access            |
| Domains        | Unauthorized changes             |
| DNS            | Unauthorized/destructive changes |
| Hosting        | Unauthorized deployment          |
| Payments       | Amount/provider manipulation     |
| Stripe         | Webhook forgery/replay           |
| Dojo           | Webhook forgery/replay           |
| Support        | Internal-note leakage            |
| Chat           | Unauthorized room/message access |
| WebRTC         | Unauthorized calls               |
| HR             | Salary access                    |
| Files          | Unauthorized download/upload     |
| Jobs           | Duplicate/unauthorized execution |
| Webhooks       | Forgery/replay/duplication       |
| Exports        | Unauthorized data export         |

---

# 48. Security Verification Rule

Claude must never mark a threat as mitigated merely because code exists.

Use:

```text
IDENTIFIED
→ DESIGNED
→ IMPLEMENTED
→ TESTED
→ VERIFIED
```

Only `VERIFIED` means the mitigation has sufficient evidence.

---

# 49. Threat Register

Every important threat should have an entry:

```text
ID:
Threat:
Category:
Severity:
Affected Component:
Attack Scenario:
Impact:
Likelihood:
Mitigation:
Implementation:
Security Test:
Status:
Owner:
Related Issue:
Related ADR:
```

Example:

```text
ID:
THREAT-001

Threat:
Cross-tenant resource access

Category:
Authorization

Severity:
CRITICAL

Attack Scenario:
Authenticated user manipulates resource ID to access another organization's record.

Impact:
Confidentiality breach.

Mitigation:
RLS + server-side authorization + tenant-aware constraints.

Security Test:
Attempt cross-tenant resource access using authenticated test users.

Status:
VERIFIED
```

---

# 50. Production Security Blockers

The following must block production:

- Cross-tenant data access.
- Authentication bypass.
- Privilege escalation.
- Secret exposure.
- Payment integrity vulnerability.
- Unauthorized domain/DNS control.
- Database compromise.
- Critical RLS failure.
- Critical webhook forgery vulnerability.
- Unrecoverable critical data.
- Critical provider credential exposure.
- Critical security test failure.

---

# 51. AI Implementation Rules

Claude must use this threat model during implementation.

Before implementing a security-sensitive feature:

1. Identify relevant threats.
2. Identify trust boundaries.
3. Identify required permissions.
4. Identify sensitive data.
5. Identify external providers.
6. Identify failure scenarios.
7. Implement mitigation.
8. Add security tests.
9. Verify behavior.
10. Update documentation.

Claude must not silently weaken a security control to make implementation easier.

If a requirement conflicts with security:

```text
STOP
→ Explain the conflict
→ Record the issue
→ Propose secure alternatives
→ Wait for authorization when necessary
```

---

# 52. Threat Model Maintenance

Update this document when:

- A new major feature is introduced.
- A new external provider is added.
- A new trust boundary is introduced.
- Sensitive data is added.
- Authentication/authorization changes.
- Payment functionality changes.
- Infrastructure control changes.
- A serious vulnerability is discovered.
- Architecture changes.

Related documents must also be updated where appropriate:

```text
SECURITY_BASELINE.md
ARCHITECTURE.md
INTEGRATION_STATUS.md
KNOWN_ISSUES.md
PRODUCTION_READINESS.md
DECISIONS.md
SESSION_LOG.md
```

---

# 53. Final Security Principle

Assume:

```text
The browser is untrusted.
Users can be compromised.
Employees can make mistakes.
Providers can fail.
Networks can fail.
Requests can be replayed.
Webhooks can be duplicated.
External APIs can return unexpected data.
Database state can become inconsistent.
```

Therefore the system must enforce:

```text
Least Privilege
+
Defense in Depth
+
Tenant Isolation
+
Server-Side Authorization
+
RLS
+
Validation
+
Auditability
+
Idempotency
+
Reconciliation
+
Monitoring
+
Recovery
```

Security is a continuous property of the system, not a final checklist.

Create or update `docs/ai/THREAT_MODEL.md`.

Use the existing architecture and security baseline to build a practical threat model.

Include:

- System assets, trust boundaries, actors, entry points, data flows, and privileged operations.
- Tenant-to-tenant data leakage.
- Unauthorized role escalation and broken object-level authorization.
- Supabase RLS mistakes and service-role misuse.
- Session theft, credential compromise, and exposed integration tokens.
- Payment forgery, replayed webhooks, duplicate processing, unauthorized refunds, and entitlement manipulation.
- DNS takeover, registrar compromise, unsafe record changes, and accidental mail disruption.
- Deployment compromise, repository token abuse, malicious build steps, and secret leakage.
- Malicious uploads, SSRF, injection, and denial of service.
- Chat-room information leakage, WebRTC signaling abuse, and unauthorized attachment access.
- Unauthorized access to employee and salary data.
- Future AI-builder threats: malicious prompts, unsafe generated code, cross-tenant preview access, resource exhaustion, abusive publishing, domain hijacking, and generated-site vulnerabilities.
- Backup theft, destructive administrative actions, and insufficient incident visibility.

Use a threat register with identifier, asset, scenario, likelihood, impact, severity, existing controls, required mitigations, verification tests, owner, and status.

Prioritize by realistic business impact. Include prevention, detection, response, and recovery.

Reference SECURITY_BASELINE.md and ARCHITECTURE.md.

Do not claim a threat is mitigated unless the control is implemented and evidence exists. Mark unknowns and open risks clearly. Do not make code changes.
