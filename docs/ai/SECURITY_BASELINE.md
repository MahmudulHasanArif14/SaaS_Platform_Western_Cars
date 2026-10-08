“Claude, these are the security rules you are never allowed to violate while writing code.”

# Security Baseline

## 1. Purpose

This document defines the mandatory security requirements for the Company Infrastructure & Operations Platform.

These requirements apply to:

- Next.js application code
- TypeScript
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Server Actions
- API routes
- Background jobs
- Webhooks
- Provider integrations
- Payment systems
- Staff tools
- Customer portals
- Infrastructure management
- Domain/DNS operations
- Hosting operations
- Chat
- WebRTC
- HR/salary functionality
- Deployment systems

Security requirements apply to both the UI and backend.

UI restrictions alone are never considered authorization.

---

# 2. Non-Negotiable Security Principles

Claude MUST follow these principles:

1. Never trust the browser.
2. Never trust client-supplied authorization.
3. Never trust client-supplied tenant IDs.
4. Never expose secrets to the browser.
5. Never expose Supabase service-role credentials to clients.
6. Never rely on UI visibility for authorization.
7. Always enforce authorization server-side.
8. Use RLS for tenant isolation.
9. Validate all external input.
10. Validate provider responses where appropriate.
11. Never store payment card information.
12. Verify payment webhooks.
13. Make sensitive operations auditable.
14. Use least privilege.
15. Fail closed for security decisions.
16. Do not silently bypass security controls.
17. Do not disable security to make development easier.
18. Do not claim security verification without evidence.
19. Do not store secrets in documentation.
20. Do not commit secrets to Git.

---

# 3. Security Architecture

The preferred request flow is:

```text id="h2u8d4"
Browser
   ↓
Authentication
   ↓
Authorization
   ↓
Input Validation
   ↓
Application Service
   ↓
Business Rules
   ↓
Database / Provider
   ↓
Audit
   ↓
Response
```

Security-sensitive logic must not live exclusively in React components.

---

# 4. Browser Security

The browser must be considered fully untrusted.

Never trust values such as:

```text id="jz0g0r"
user_id
organization_id
role
permission
client_id
employee_id
task_id
payment_id
payment amount
currency
provider
resource ownership
```

The server must derive or validate security-sensitive values.

---

# 5. Authentication

Use the project's approved authentication system.

Authentication must provide:

- Secure sessions.
- Session expiration.
- Session revocation.
- Account disable functionality.
- Password/reset protections where applicable.
- MFA support.
- Reauthentication for sensitive actions.

Sensitive operations may require step-up authentication.

Examples:

```text id="1wqj1a"
Change provider credentials
Change DNS
Delete domain
Create high-value payment
Issue refund
Change employee permissions
Access sensitive salary information
```

---

# 6. Authorization

Authorization must be permission-based.

Do not use:

```text id="f9l1l4"
if (user.role === "admin")
```

as the only security mechanism.

Prefer explicit permissions such as:

```text id="g3m3vn"
domains.read
domains.write
domains.delete

dns.read
dns.write
dns.delete

payments.create
payments.refund

staff.read
staff.manage

salary.read
salary.manage

chat.manage

integrations.manage
```

Authorization must be checked at the server/application boundary.

---

# 7. Multi-Tenant Isolation

Every tenant-owned resource must have a reliable organization relationship.

Example:

```text id="0s4k5x"
organizations
    ↓
clients
    ↓
websites
    ↓
domains
    ↓
dns records
```

Users must only access resources belonging to organizations in which they have authorized membership.

---

# 8. RLS Requirements

Supabase Row Level Security is mandatory for tenant-sensitive tables.

RLS must prevent:

```text id="kzq4x5"
Tenant A
   ↓
Tenant B data
```

RLS must be tested directly.

Do not assume RLS is correct because the application UI works.

Required tests should include:

```text id="o7b2s8"
Tenant A → own data → ALLOW
Tenant A → Tenant B data → DENY
Unauthenticated → protected data → DENY
Staff → unauthorized resource → DENY
Manager → permitted resource → ALLOW
```

---

# 9. Service-Role Security

Supabase service-role credentials bypass RLS.

Therefore:

- Never expose them to the browser.
- Never put them in `NEXT_PUBLIC_*`.
- Never return them through an API.
- Never commit them.
- Never log them.
- Restrict usage to server-side code.
- Keep privileged operations inside a small server-only data-access/service layer.

Before using service-role access, validate application-level authorization.

Service-role access is not a substitute for authorization.

---

# 10. Tenant-Aware Database Design

Database relationships must prevent cross-tenant references.

For example:

```text id="2a3r7n"
Tenant A Task
      ↓
Tenant A Employee
```

must be allowed.

But:

```text id="0ezq1d"
Tenant A Task
      ↓
Tenant B Employee
```

must be rejected.

Use:

- Foreign keys.
- Composite constraints where appropriate.
- Application validation.
- RLS.

---

# 11. Input Validation

All external input must be validated.

Sources include:

- Forms.
- Query parameters.
- URL parameters.
- API bodies.
- Server actions.
- Webhooks.
- File metadata.
- Provider responses.

Use a consistent schema-validation strategy such as Zod where appropriate.

Never assume TypeScript types make runtime input safe.

---

# 12. Output Security

Never return data merely because it exists in the database.

Return only fields required by the requesting user.

Sensitive fields should be excluded by default.

Examples:

- Provider credentials.
- Internal notes.
- Salary data.
- Private customer information.
- Internal audit metadata.

Use explicit response DTOs where appropriate.

---

# 13. Secrets Management

Secrets include:

```text id="e5k5mi"
API keys
OAuth secrets
Access tokens
Refresh tokens
Database credentials
SMTP credentials
Webhook secrets
TURN credentials
Provider credentials
Encryption keys
```

Secrets must:

- Remain server-side.
- Never be committed.
- Never be logged.
- Never be returned unnecessarily.
- Never be placed in client bundles.
- Be rotated when required.
- Be revocable where supported.
- Have expiration metadata where supported.

---

# 14. Environment Variables

Client-visible variables must use the framework's explicit public prefix only when intentionally public.

Never expose:

```text id="q8z2gk"
DATABASE_PASSWORD
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
DOJO_SECRET
GITHUB_TOKEN
CLOUDFLARE_API_TOKEN
SMTP_PASSWORD
WEBHOOK_SECRET
```

as public variables.

---

# 15. Environment Separation

Maintain separate:

```text id="h4o3f0"
Development
Test
Staging
Production
```

credentials and resources.

Never casually connect development code to production infrastructure.

Production credentials must never be placed in local development files committed to Git.

---

# 16. Git Security

Never commit:

```text id="f2j9b8"
.env
.env.local
.env.production
API keys
private keys
certificates
database dumps containing secrets
credential exports
```

Use:

```text id="d2k8qq"
.env.example
```

with variable names only.

Enable secret scanning where possible.

---

# 17. Password Security

Passwords must never be stored directly by application code when using the approved authentication provider.

Never:

- Log passwords.
- Return passwords.
- Store plaintext passwords.
- Email passwords.
- Include passwords in audit records.

---

# 18. Session Security

Sessions must be:

- Secure.
- HttpOnly where applicable.
- SameSite protected.
- Revocable.
- Properly expired.

On employee departure:

```text id="3wy4f6"
Disable account
→ Revoke sessions
→ Revoke active credentials
→ Review integrations
→ Reassign resources
```

---

# 19. MFA & Reauthentication

Require stronger authentication for high-risk operations where appropriate.

Examples:

```text id="7l0k2x"
Domain transfer
DNS nameserver change
Provider credential change
Large payment/refund
Role/permission changes
Salary administration
Security settings
```

Do not treat an active session as sufficient proof for every sensitive action.

---

# 20. Rate Limiting

Rate limiting must be considered for:

- Login.
- Password/reset.
- Invitations.
- Payment-link creation.
- Payment operations.
- Search.
- File uploads.
- Chat.
- Webhooks.
- Expensive infrastructure operations.
- Provider API operations.

Rate limits should be appropriate to the operation and tenant.

---

# 21. API Security

Every protected endpoint should follow:

```text id="uw0v3b"
Authenticate
→ Authorize
→ Validate
→ Execute
→ Audit
```

APIs should use:

- Structured errors.
- Request size limits.
- Timeouts.
- Pagination.
- Rate limiting.
- Correlation IDs.

Never expose stack traces or internal implementation details to users.

---

# 22. IDOR Protection

Never assume that knowing an ID grants access.

Bad:

```text id="t2y4qu"
/api/tasks/123
```

with no authorization check.

Every resource request must validate:

```text id="6i2x5c"
Authenticated user
+
Organization membership
+
Permission
+
Resource ownership/access
```

---

# 23. SQL Injection

Use parameterized queries and approved database APIs.

Never construct SQL using raw user input.

Security testing must include injection attempts where relevant.

---

# 24. XSS Protection

Potential XSS sources include:

- Chat.
- Support messages.
- Task comments.
- Customer notes.
- Profiles.
- Rich text.
- Imported content.

Prefer normal React escaping.

Avoid unsafe HTML rendering.

If HTML is intentionally supported:

- Sanitize it.
- Restrict allowed elements/attributes.
- Test malicious payloads.

---

# 25. CSRF Protection

For cookie-authenticated state-changing operations, use appropriate CSRF protections.

Consider:

- SameSite cookies.
- Origin validation.
- Framework protections.
- CSRF tokens where required.

---

# 26. Security Headers

Production should use appropriate headers such as:

```text id="z6h3me"
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Frame protections
```

Exact policy should be tested against the application's requirements.

Do not introduce a CSP that silently breaks critical functionality without investigation.

---

# 27. HTTPS

Production traffic must use HTTPS.

Sensitive credentials and payment information must never be transmitted over insecure connections.

Redirect HTTP to HTTPS where appropriate.

---

# 28. SSRF Protection

Any feature that fetches remote URLs must treat the URL as untrusted.

Block or restrict access to:

```text id="0qg4yq"
localhost
127.0.0.1
private IP ranges
internal services
cloud metadata endpoints
```

Validate redirects.

Apply:

- URL allowlists where possible.
- Timeouts.
- Response size limits.
- Redirect restrictions.

---

# 29. File Upload Security

Uploaded files must be treated as untrusted.

Apply:

- File-size limits.
- MIME validation.
- Extension validation.
- Generated filenames.
- Storage authorization.
- Private storage for sensitive files.
- Malware scanning where required.

Never trust a browser-provided MIME type by itself.

---

# 30. File Download Security

Users must only download files they are authorized to access.

Use private storage for sensitive documents.

Avoid predictable publicly accessible URLs for:

- Salary documents.
- Customer documents.
- Internal attachments.
- Support attachments.

---

# 31. Payment Security

Payment data must be handled by approved payment providers.

Never store:

- Card numbers.
- CVV.
- Full magnetic-stripe data.
- Payment credentials.

The application should store only appropriate provider references and payment metadata.

---

# 32. Payment Provider Selection

When an employee chooses Stripe or Dojo:

```text id="8gc3fi"
Browser selection
       ↓
Server validation
       ↓
Permission check
       ↓
Provider availability check
       ↓
Provider capability check
       ↓
Create payment
```

The browser's provider selection must never directly determine an unrestricted provider API call.

---

# 33. Payment Amount Security

Never blindly trust client-supplied:

```text id="7g5gq5"
amount
currency
customer
invoice
discount
refund amount
```

Where possible:

```text id="r2p8m1"
Payment Request ID
→ Server retrieves authoritative data
→ Authorization
→ Validation
→ Provider
```

If arbitrary amounts are supported, enforce server-side validation and limits.

---

# 34. Payment Webhooks

Payment webhooks must:

1. Verify provider authenticity/signature.
2. Validate payload.
3. Deduplicate.
4. Persist event.
5. Process safely.
6. Update local state.
7. Record audit information.

Never mark a payment as successful based only on a client redirect.

---

# 35. Payment Idempotency

Payment creation and other sensitive provider operations should use idempotency where supported.

Prevent:

```text id="4s5l6n"
Double click
+
Network retry
+
Server retry
=
Two payments
```

---

# 36. Payment Reconciliation

Provider state and local state may diverge.

Use reconciliation for:

- Missing webhooks.
- Duplicate events.
- Provider outages.
- Timeouts.
- Partial failures.

Never permanently assume local payment state is correct without appropriate provider confirmation.

---

# 37. Refund Security

Refund operations require explicit permission.

Consider:

- Amount limits.
- Reauthentication.
- Approval workflows.
- Idempotency.
- Audit logs.

Never trust refund amount from an untrusted client.

---

# 38. Domain Security

Domain operations must use strong authorization.

High-risk operations include:

- Transfer.
- Delete.
- Nameserver changes.
- Registrar changes.
- Ownership changes.

Require confirmation and audit logging.

---

# 39. DNS Security

DNS operations must support:

```text id="7k0l7m"
Preview
→ Validate
→ Authorize
→ Confirm
→ Apply
→ Verify
→ Audit
```

Special warnings are required for:

```text id="xq4w6e"
NS
MX
CAA
SPF
DKIM
DMARC
```

Never silently overwrite critical DNS records.

---

# 40. Hosting Security

Hosting actions must enforce:

- Organization authorization.
- Provider permissions.
- Environment restrictions.
- Deployment approval where required.
- Audit logging.

Production infrastructure should have stronger controls than development.

---

# 41. Deployment Security

Deployment workflow:

```text id="c0p8l2"
Code
→ Tests
→ Security checks
→ Approval where required
→ Deployment
→ Health check
→ Smoke test
→ Audit
```

Production deployment must not depend on an employee bypassing security controls manually.

---

# 42. Provider Credential Security

Provider integrations should use:

- Least privilege.
- Minimal scopes.
- Separate credentials where appropriate.
- Rotation.
- Revocation.
- Expiry tracking.
- Connection health monitoring.

Providers include:

```text id="4l8x2d"
GitHub
Vercel
Cloudflare
cPanel
Domain registrar
Stripe
Dojo
Email
TURN
Monitoring
```

---

# 43. Webhook Security

All webhooks are untrusted until authenticated.

Protect against:

- Forgery.
- Replay.
- Duplicate events.
- Malformed data.
- Event ordering.
- Excessive request rates.

Webhook secrets must never be logged.

---

# 44. Background Job Security

Jobs must:

- Be created only by authorized processes.
- Validate their parameters.
- Use least privilege.
- Be idempotent.
- Have retry limits.
- Record failures.
- Avoid leaking secrets into job logs.

---

# 45. Realtime Security

Supabase Realtime subscriptions must respect authorization.

A user must not be able to subscribe to:

- Another organization.
- Private staff rooms.
- Private customer conversations.
- Unauthorized tasks.
- Sensitive notifications.

Test realtime authorization independently.

---

# 46. Staff Chat Security

Chat must enforce:

```text id="a9v9b7"
Organization
+
Room membership
+
User permission
```

Internal chat must never become customer-visible accidentally.

Attachments must have the same authorization model as messages.

---

# 47. WebRTC Security

WebRTC signaling must require authentication and authorization.

Only authorized participants can initiate or join calls.

Protect:

- Call IDs.
- Signaling channels.
- TURN credentials.
- Call metadata.

Use short-lived TURN credentials where supported.

Do not expose long-lived TURN secrets to clients.

---

# 48. HR & Salary Security

Salary information must have dedicated permissions.

Required protections:

- RLS.
- Server-side authorization.
- Restricted queries.
- Audit logs.
- Restricted exports.
- Reauthentication for sensitive changes where appropriate.

Never expose salary information through general employee APIs.

---

# 49. Employee Departure Security

When an employee leaves:

```text id="x9h4e7"
Disable account
↓
Revoke sessions
↓
Revoke provider access
↓
Review API credentials
↓
Rotate shared credentials if required
↓
Reassign tasks
↓
Reassign resource ownership
↓
Preserve audit history
```

This should be an explicit operational workflow.

---

# 50. Audit Logging

Audit sensitive operations.

Record:

```text id="e1g0kl"
Actor
Organization
Action
Resource
Resource ID
Timestamp
Result
Correlation ID
Relevant safe metadata
```

Never record secrets.

Sensitive operations that should normally be audited include:

- Login/security events.
- Permission changes.
- Domain changes.
- DNS changes.
- Provider connection changes.
- Payment creation.
- Payment refunds.
- Salary changes.
- Staff access changes.
- Deployment actions.
- Data exports.
- Administrative changes.

---

# 51. Audit Integrity

Audit records should be append-oriented.

Regular users must not be able to:

- Delete audit records.
- Modify audit records.
- Disable audit logging.

Privileged administrative access must be tightly controlled.

---

# 52. Logging Security

Logs must be structured and redacted.

Never log:

```text id="5c9q7e"
Passwords
API keys
Tokens
Refresh tokens
Private keys
Card information
Webhook secrets
Database passwords
Full sensitive HR information
```

Use redaction before data reaches the logging system.

---

# 53. Error Handling

Production errors must not expose:

- Stack traces.
- SQL queries.
- Secrets.
- Provider credentials.
- Internal filesystem paths.
- Database structure.
- Authentication details.

Users should receive safe, actionable error messages.

Developers should have enough server-side diagnostics to investigate failures.

---

# 54. Concurrency Security

Security-sensitive operations must be safe under concurrent execution.

Examples:

```text id="0y9d2k"
Two payment requests
Two refunds
Two DNS modifications
Two role changes
Two webhook processors
Two task approvals
```

Use appropriate:

- Transactions.
- Unique constraints.
- Idempotency.
- State validation.
- Locking/optimistic concurrency.

---

# 55. Approval Controls

Consider two-person approval for high-risk operations:

```text id="e4z5cn"
Domain transfer
Critical DNS change
Large refund
Provider credential change
Production infrastructure deletion
Sensitive financial changes
```

Approval rules must be enforced server-side.

---

# 56. Data Minimization

Only collect and store data that the platform actually needs.

Do not create unnecessary sensitive fields.

Avoid storing duplicate copies of provider/customer data unless there is an operational reason.

---

# 57. Data Retention

Sensitive information should have documented retention rules where appropriate.

Consider:

- Customer data.
- Chat history.
- Support tickets.
- Salary records.
- Payment events.
- Audit logs.
- Uploaded documents.

Do not implement automatic deletion of legally/operationally important records without an approved retention policy.

---

# 58. Export Security

Exports must require explicit permission.

Before exporting sensitive data:

```text id="6f8e5g"
Authenticate
→ Authorize
→ Filter by tenant
→ Apply field restrictions
→ Generate export
→ Audit
```

Sensitive exports may require additional approval.

---

# 59. Dependency Security

Use:

- Lockfiles.
- Dependency auditing.
- Regular security updates.
- Minimal dependencies.
- Secret scanning.

Do not install a package solely to solve a trivial problem without evaluating its security and maintenance status.

---

# 60. Supply Chain Security

Before introducing a third-party dependency, consider:

- Maintainer reputation.
- Maintenance activity.
- Security history.
- Dependency count.
- License.
- Package permissions.
- Whether the dependency is actually necessary.

---

# 61. Database Migration Security

Every migration must be reviewed for:

- Data loss.
- Locking.
- Downtime.
- RLS behavior.
- Index requirements.
- Constraint behavior.
- Backward compatibility.

Never casually delete production data through a migration.

Destructive migrations require explicit review.

---

# 62. Backup Security

Backups must be:

- Protected.
- Access-controlled.
- Encrypted where appropriate.
- Monitored.
- Tested for restoration.

A backup that has never been restored is not considered fully verified.

---

# 63. Disaster Recovery

Security and recovery plans must include:

- Database failure.
- Provider failure.
- Credential compromise.
- Accidental deletion.
- Malicious deletion.
- Deployment failure.
- DNS failure.

Recovery procedures belong in:

```text id="s7q8xz"
docs/runbooks/DISASTER_RECOVERY.md
```

---

# 64. Monitoring & Alerts

Monitor for:

- Repeated authentication failures.
- Suspicious permission changes.
- Cross-tenant authorization failures.
- Provider credential failures.
- Webhook failures.
- Payment anomalies.
- DNS changes.
- Deployment failures.
- Job failures.
- Unexpected administrative activity.

High-risk security events should generate appropriate alerts.

---

# 65. Incident Response

When a serious security incident occurs:

```text id="5s8v4q"
Detect
↓
Contain
↓
Revoke
↓
Investigate
↓
Recover
↓
Verify
↓
Document
↓
Prevent recurrence
```

Do not silently hide security incidents.

Record them in:

```text id="f9n5u2"
KNOWN_ISSUES.md
SESSION_LOG.md
```

and the incident system when implemented.

---

# 66. Security Testing

Every security-sensitive feature must have security tests.

Minimum categories:

```text id="t1v5js"
Authentication
Authorization
RLS
Tenant isolation
IDOR
Privilege escalation
Input validation
Webhook verification
Payment integrity
File authorization
Realtime authorization
Sensitive-data access
```

---

# 67. Cross-Tenant Security Tests

For every tenant-owned resource:

```text id="p8f2o3"
Create in Tenant A
Read as Tenant A → ALLOW

Read as Tenant B → DENY

Update as Tenant A with permission → ALLOW

Update as Tenant B → DENY

Delete as Tenant B → DENY
```

This pattern must be applied to all major resources.

---

# 68. Production Security Gate

The application cannot be marked production-ready if any of the following remain unresolved:

```text id="2xj3kp"
Critical security issue
Cross-tenant data exposure
Authentication bypass
Privilege escalation
Secret exposure
Critical RLS failure
Payment integrity vulnerability
Unauthorized infrastructure control
Critical webhook vulnerability
Unrecoverable critical data
```

---

# 69. Security Status

Use:

```text id="x5f9p8"
NOT_STARTED
DESIGNED
IMPLEMENTED
TESTED
VERIFIED
DEGRADED
BLOCKED
```

Important:

```text id="c6r5h7"
IMPLEMENTED ≠ VERIFIED
```

A security control is only considered verified when appropriate tests/evidence exist.

---

# 70. Claude Security Workflow

Before implementing a sensitive feature:

```text id="d0h1mw"
1. Read relevant threat model section.
2. Identify trust boundaries.
3. Identify sensitive data.
4. Identify required permissions.
5. Identify tenant ownership.
6. Identify external integrations.
7. Design server-side authorization.
8. Implement RLS.
9. Implement validation.
10. Implement audit logging.
11. Handle failure/concurrency.
12. Add security tests.
13. Run tests.
14. Review resulting diff.
15. Update documentation.
```

---

# 71. Security Stop Rule

Claude MUST STOP and ask for clarification/approval when:

- A requested feature weakens tenant isolation.
- A requested feature exposes a secret.
- A service-role credential would need to be exposed client-side.
- A payment flow would store card data.
- A provider operation requires excessive permissions.
- A destructive infrastructure action lacks adequate authorization.
- A security control would need to be disabled.
- A critical security requirement conflicts with a product requirement.

Do not silently implement an insecure workaround.

---

# 72. Security Change Documentation

When a meaningful security architecture decision is made, update:

```text id="h0s4rj"
THREAT_MODEL.md
SECURITY_BASELINE.md
ARCHITECTURE.md
DECISIONS.md
```

Update:

```text id="y0j5u8"
KNOWN_ISSUES.md
```

if a security issue remains unresolved.

Update:

```text id="v6q2s3"
PRODUCTION_READINESS.md
```

when verification status changes.

---

# 73. Security Completion Checklist

Before marking a security-sensitive feature complete:

- [ ] Authentication verified
- [ ] Authorization verified
- [ ] Tenant isolation verified
- [ ] RLS verified
- [ ] Input validation implemented
- [ ] Sensitive output restricted
- [ ] Secrets protected
- [ ] Errors safely handled
- [ ] Audit logging implemented
- [ ] Concurrency considered
- [ ] Rate limiting considered
- [ ] External provider security considered
- [ ] Security tests added
- [ ] Tests pass
- [ ] Documentation updated

---

# 74. Final Security Rule

The system must always assume:

```text id="t5u9x2"
The client can lie.
The user can be compromised.
An employee can make a mistake.
An employee can become malicious.
An API can fail.
A webhook can be forged.
A webhook can be duplicated.
A provider can become unavailable.
A request can be replayed.
A database operation can race.
A dependency can be compromised.
```

Therefore:

```text id="3q7v1e"
Security
=
Authentication
+
Authorization
+
RLS
+
Validation
+
Least Privilege
+
Tenant Isolation
+
Audit
+
Idempotency
+
Monitoring
+
Recovery
```

Security controls must be enforced by the system, not merely documented or displayed in the UI.
