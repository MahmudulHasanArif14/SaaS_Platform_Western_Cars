# Production Readiness

This document is the authoritative checklist for determining whether the platform is safe and ready for production.

A feature is NOT considered production-ready merely because code exists.

Each area must have evidence from implementation, testing, security review, and where applicable a real provider/staging verification.

---

# Status Definitions

```text
NOT_STARTED
DESIGNED
IN_PROGRESS
IMPLEMENTED
UNIT_TESTED
INTEGRATION_TESTED
E2E_TESTED
STAGING_VERIFIED
PRODUCTION_VERIFIED
BLOCKED
DEGRADED
UNSUPPORTED
```

## Production Ready Definition

A subsystem may be marked `PRODUCTION_VERIFIED` only when:

1. Implementation is complete.
2. Relevant automated tests pass.
3. Security controls are verified.
4. Required RLS policies are tested.
5. RBAC/authorization is tested.
6. Error handling is verified.
7. Production configuration is documented.
8. Required external integrations are actually connected and tested.
9. No known critical/high-severity issues remain.
10. Rollback/recovery behavior is understood.
11. Documentation is updated.

Never mark a feature production-ready based only on a successful local build.

---

# 1. Project Foundation

| Requirement               | Status      | Evidence / Notes |
| ------------------------- | ----------- | ---------------- |
| Next.js configured        | NOT_STARTED |                  |
| TypeScript configured     | NOT_STARTED |                  |
| Tailwind configured       | NOT_STARTED |                  |
| shadcn/ui configured      | NOT_STARTED |                  |
| Dark mode                 | NOT_STARTED |                  |
| Light mode                | NOT_STARTED |                  |
| System theme support      | NOT_STARTED |                  |
| Responsive layout         | NOT_STARTED |                  |
| Accessibility baseline    | NOT_STARTED |                  |
| Error boundaries          | NOT_STARTED |                  |
| Loading states            | NOT_STARTED |                  |
| Environment validation    | NOT_STARTED |                  |
| Git repository configured | NOT_STARTED |                  |
| CI configured             | NOT_STARTED |                  |

---

# 2. Authentication

| Requirement                    | Status      | Evidence / Notes |
| ------------------------------ | ----------- | ---------------- |
| Supabase Auth                  | NOT_STARTED |                  |
| Login                          | NOT_STARTED |                  |
| Logout                         | NOT_STARTED |                  |
| Email verification             | NOT_STARTED |                  |
| Password reset                 | NOT_STARTED |                  |
| Session handling               | NOT_STARTED |                  |
| Protected routes               | NOT_STARTED |                  |
| MFA                            | NOT_STARTED |                  |
| Step-up authentication         | NOT_STARTED |                  |
| Session revocation             | NOT_STARTED |                  |
| Unauthorized response handling | NOT_STARTED |                  |

---

# 3. Multi-Tenancy

| Requirement                    | Status      | Evidence / Notes |
| ------------------------------ | ----------- | ---------------- |
| Organizations                  | NOT_STARTED |                  |
| Organization membership        | NOT_STARTED |                  |
| Tenant isolation               | NOT_STARTED |                  |
| Cross-tenant security tests    | NOT_STARTED |                  |
| Organization-level permissions | NOT_STARTED |                  |
| Organization-aware caching     | NOT_STARTED |                  |

---

# 4. RBAC / Authorization

| Requirement                        | Status      | Evidence / Notes |
| ---------------------------------- | ----------- | ---------------- |
| Roles                              | NOT_STARTED |                  |
| Permissions                        | NOT_STARTED |                  |
| Custom roles                       | NOT_STARTED |                  |
| Central authorization helpers      | NOT_STARTED |                  |
| Server-side permission enforcement | NOT_STARTED |                  |
| Resource-level authorization       | NOT_STARTED |                  |
| Step-up authorization              | NOT_STARTED |                  |
| Approval workflow                  | NOT_STARTED |                  |
| Privilege escalation tests         | NOT_STARTED |                  |

---

# 5. Supabase / Database Security

| Requirement                    | Status      | Evidence / Notes |
| ------------------------------ | ----------- | ---------------- |
| PostgreSQL schema              | NOT_STARTED |                  |
| Version-controlled migrations  | NOT_STARTED |                  |
| Foreign keys                   | NOT_STARTED |                  |
| Constraints                    | NOT_STARTED |                  |
| Indexes                        | NOT_STARTED |                  |
| RLS enabled                    | NOT_STARTED |                  |
| RLS policies tested            | NOT_STARTED |                  |
| Service/secret key server-only | NOT_STARTED |                  |
| Sensitive schemas protected    | NOT_STARTED |                  |
| Database backup strategy       | NOT_STARTED |                  |
| Restore procedure              | NOT_STARTED |                  |
| Restore test completed         | NOT_STARTED |                  |

---

# 6. Secrets / Credentials

| Requirement                      | Status      | Evidence / Notes |
| -------------------------------- | ----------- | ---------------- |
| Secrets never exposed to browser | NOT_STARTED |                  |
| Secret encryption                | NOT_STARTED |                  |
| Key versioning                   | NOT_STARTED |                  |
| Key rotation design              | NOT_STARTED |                  |
| Secret redaction                 | NOT_STARTED |                  |
| Secret access audit              | NOT_STARTED |                  |
| Credential revocation            | NOT_STARTED |                  |
| Production secret storage        | NOT_STARTED |                  |
| Secret scanning                  | NOT_STARTED |                  |

---

# 7. Domain Management

| Requirement           | Status      | Evidence / Notes |
| --------------------- | ----------- | ---------------- |
| Domain CRUD           | NOT_STARTED |                  |
| Registrar tracking    | NOT_STARTED |                  |
| DNS provider tracking | NOT_STARTED |                  |
| Expiry calculation    | NOT_STARTED |                  |
| Expiry alerts         | NOT_STARTED |                  |
| Auto-renew tracking   | NOT_STARTED |                  |
| Domain permissions    | NOT_STARTED |                  |
| Domain audit logging  | NOT_STARTED |                  |
| Safe deletion         | NOT_STARTED |                  |

---

# 8. DNS

| Requirement               | Status      | Evidence / Notes |
| ------------------------- | ----------- | ---------------- |
| DNS provider abstraction  | NOT_STARTED |                  |
| A records                 | NOT_STARTED |                  |
| AAAA records              | NOT_STARTED |                  |
| CNAME records             | NOT_STARTED |                  |
| MX records                | NOT_STARTED |                  |
| TXT records               | NOT_STARTED |                  |
| NS records                | NOT_STARTED |                  |
| CAA records               | NOT_STARTED |                  |
| SRV records               | NOT_STARTED |                  |
| Change preview            | NOT_STARTED |                  |
| Confirmation              | NOT_STARTED |                  |
| High-risk warnings        | NOT_STARTED |                  |
| DNS snapshot              | NOT_STARTED |                  |
| Verification after change | NOT_STARTED |                  |
| Reconciliation            | NOT_STARTED |                  |
| DNS security tests        | NOT_STARTED |                  |

---

# 9. Hosting / Website Management

| Requirement                   | Status      | Evidence / Notes |
| ----------------------------- | ----------- | ---------------- |
| Hosting accounts              | NOT_STARTED |                  |
| Website records               | NOT_STARTED |                  |
| Environment management        | NOT_STARTED |                  |
| Production/staging separation | NOT_STARTED |                  |
| SSL status                    | NOT_STARTED |                  |
| Repository relationship       | NOT_STARTED |                  |
| Deployment records            | NOT_STARTED |                  |
| Deployment permissions        | NOT_STARTED |                  |
| Deployment approval           | NOT_STARTED |                  |
| Health checks                 | NOT_STARTED |                  |
| Rollback/recovery procedure   | NOT_STARTED |                  |

---

# 10. Payment Foundation

| Requirement                  | Status      | Evidence / Notes |
| ---------------------------- | ----------- | ---------------- |
| Payment provider abstraction | NOT_STARTED |                  |
| Payment request model        | NOT_STARTED |                  |
| Payment link model           | NOT_STARTED |                  |
| Payment status lifecycle     | NOT_STARTED |                  |
| Idempotency                  | NOT_STARTED |                  |
| Payment audit trail          | NOT_STARTED |                  |
| Reconciliation               | NOT_STARTED |                  |
| Refund authorization         | NOT_STARTED |                  |
| Financial data protection    | NOT_STARTED |                  |
| Currency handling            | NOT_STARTED |                  |
| Integer minor-unit handling  | NOT_STARTED |                  |

---

# 11. Stripe

| Requirement                  | Status      | Evidence / Notes |
| ---------------------------- | ----------- | ---------------- |
| Stripe provider adapter      | NOT_STARTED |                  |
| Test credentials             | NOT_STARTED |                  |
| Payment creation             | NOT_STARTED |                  |
| Checkout/payment flow        | NOT_STARTED |                  |
| Webhook verification         | NOT_STARTED |                  |
| Duplicate webhook protection | NOT_STARTED |                  |
| Payment reconciliation       | NOT_STARTED |                  |
| Failure handling             | NOT_STARTED |                  |
| Refund handling              | NOT_STARTED |                  |
| Staging verification         | NOT_STARTED |                  |
| Production verification      | NOT_STARTED |                  |

---

# 12. Dojo

| Requirement                | Status      | Evidence / Notes |
| -------------------------- | ----------- | ---------------- |
| Dojo provider adapter      | NOT_STARTED |                  |
| Test credentials           | NOT_STARTED |                  |
| Payment creation           | NOT_STARTED |                  |
| Payment link               | NOT_STARTED |                  |
| Webhook verification       | NOT_STARTED |                  |
| Duplicate event protection | NOT_STARTED |                  |
| Reconciliation             | NOT_STARTED |                  |
| Failure handling           | NOT_STARTED |                  |
| Staging verification       | NOT_STARTED |                  |
| Production verification    | NOT_STARTED |                  |

---

# 13. CRM / Customers

| Requirement                 | Status      | Evidence / Notes |
| --------------------------- | ----------- | ---------------- |
| Clients                     | NOT_STARTED |                  |
| Contacts                    | NOT_STARTED |                  |
| Customer relationships      | NOT_STARTED |                  |
| Client/website relationship | NOT_STARTED |                  |
| Client/domain relationship  | NOT_STARTED |                  |
| Customer activity           | NOT_STARTED |                  |
| Customer permissions        | NOT_STARTED |                  |
| Customer portal             | NOT_STARTED |                  |

---

# 14. Tasks / Projects

| Requirement         | Status      | Evidence / Notes |
| ------------------- | ----------- | ---------------- |
| Tasks               | NOT_STARTED |                  |
| Projects            | NOT_STARTED |                  |
| Assignment          | NOT_STARTED |                  |
| Reassignment        | NOT_STARTED |                  |
| Progress reporting  | NOT_STARTED |                  |
| Comments            | NOT_STARTED |                  |
| Attachments         | NOT_STARTED |                  |
| Checklists          | NOT_STARTED |                  |
| Dependencies        | NOT_STARTED |                  |
| Approvals           | NOT_STARTED |                  |
| Notifications       | NOT_STARTED |                  |
| Task security tests | NOT_STARTED |                  |

---

# 15. Support

| Requirement                   | Status      | Evidence / Notes |
| ----------------------------- | ----------- | ---------------- |
| Support tickets               | NOT_STARTED |                  |
| Ticket assignment             | NOT_STARTED |                  |
| Internal notes                | NOT_STARTED |                  |
| Customer replies              | NOT_STARTED |                  |
| SLA tracking                  | NOT_STARTED |                  |
| Ticket → task workflow        | NOT_STARTED |                  |
| Payment link from ticket      | NOT_STARTED |                  |
| Attachments                   | NOT_STARTED |                  |
| Customer portal ticket access | NOT_STARTED |                  |

---

# 16. Staff Management

| Requirement            | Status      | Evidence / Notes |
| ---------------------- | ----------- | ---------------- |
| Staff invitation       | NOT_STARTED |                  |
| Staff profiles         | NOT_STARTED |                  |
| Roles                  | NOT_STARTED |                  |
| Permissions            | NOT_STARTED |                  |
| Assignment             | NOT_STARTED |                  |
| Session revocation     | NOT_STARTED |                  |
| Offboarding            | NOT_STARTED |                  |
| Ownership reassignment | NOT_STARTED |                  |
| Credential review      | NOT_STARTED |                  |

---

# 17. Staff Chat / Realtime

| Requirement             | Status      | Evidence / Notes |
| ----------------------- | ----------- | ---------------- |
| Channels                | NOT_STARTED |                  |
| Direct messages         | NOT_STARTED |                  |
| Private channels        | NOT_STARTED |                  |
| Durable message storage | NOT_STARTED |                  |
| Realtime delivery       | NOT_STARTED |                  |
| Presence                | NOT_STARTED |                  |
| Typing indicator        | NOT_STARTED |                  |
| Read state              | NOT_STARTED |                  |
| Attachments             | NOT_STARTED |                  |
| Channel authorization   | NOT_STARTED |                  |
| Chat security tests     | NOT_STARTED |                  |

---

# 18. WebRTC

## V1 Scope

| Requirement           | Status      | Evidence / Notes |
| --------------------- | ----------- | ---------------- |
| 1-to-1 audio          | NOT_STARTED |                  |
| 1-to-1 video          | NOT_STARTED |                  |
| Screen sharing        | NOT_STARTED |                  |
| Mute                  | NOT_STARTED |                  |
| Camera control        | NOT_STARTED |                  |
| Incoming call         | NOT_STARTED |                  |
| Call rejection        | NOT_STARTED |                  |
| Call history          | NOT_STARTED |                  |
| Signaling security    | NOT_STARTED |                  |
| STUN                  | NOT_STARTED |                  |
| TURN                  | NOT_STARTED |                  |
| Reconnection handling | NOT_STARTED |                  |
| Permission handling   | NOT_STARTED |                  |

Group calling is NOT required for the first production release.

---

# 19. HR / Salary / Payroll

| Requirement             | Status      | Evidence / Notes |
| ----------------------- | ----------- | ---------------- |
| Employee records        | NOT_STARTED |                  |
| Employment history      | NOT_STARTED |                  |
| Salary records          | NOT_STARTED |                  |
| Payroll periods         | NOT_STARTED |                  |
| Salary payment tracking | NOT_STARTED |                  |
| Salary access controls  | NOT_STARTED |                  |
| Salary audit logging    | NOT_STARTED |                  |
| Expenses                | NOT_STARTED |                  |
| Expense approval        | NOT_STARTED |                  |
| Leave requests          | NOT_STARTED |                  |
| Work logs               | NOT_STARTED |                  |

Do not implement jurisdiction-specific tax calculations without an explicitly approved specification.

---

# 20. GitHub / Vercel / Cloudflare / cPanel

| Integration         | Status      | Production Verified | Notes |
| ------------------- | ----------- | ------------------- | ----- |
| GitHub              | NOT_STARTED | NO                  |       |
| Vercel              | NOT_STARTED | NO                  |       |
| Cloudflare          | NOT_STARTED | NO                  |       |
| cPanel              | NOT_STARTED | NO                  |       |
| Registrar           | NOT_STARTED | NO                  |       |
| Monitoring provider | NOT_STARTED | NO                  |       |
| Email provider      | NOT_STARTED | NO                  |       |

---

# 21. Jobs / Webhooks / Reconciliation

| Requirement                | Status      | Evidence / Notes |
| -------------------------- | ----------- | ---------------- |
| Durable jobs               | NOT_STARTED |                  |
| Retry strategy             | NOT_STARTED |                  |
| Exponential backoff        | NOT_STARTED |                  |
| Dead-letter handling       | NOT_STARTED |                  |
| Outbox/event model         | NOT_STARTED |                  |
| Webhook persistence        | NOT_STARTED |                  |
| Webhook verification       | NOT_STARTED |                  |
| Duplicate event protection | NOT_STARTED |                  |
| Provider reconciliation    | NOT_STARTED |                  |
| Job monitoring             | NOT_STARTED |                  |

---

# 22. Monitoring / Incidents

| Requirement                  | Status      | Evidence / Notes |
| ---------------------------- | ----------- | ---------------- |
| Application error monitoring | NOT_STARTED |                  |
| Database health              | NOT_STARTED |                  |
| Authentication health        | NOT_STARTED |                  |
| Realtime health              | NOT_STARTED |                  |
| Job health                   | NOT_STARTED |                  |
| Webhook health               | NOT_STARTED |                  |
| Provider health              | NOT_STARTED |                  |
| Incident system              | NOT_STARTED |                  |
| Alerting                     | NOT_STARTED |                  |
| Incident runbook             | NOT_STARTED |                  |

---

# 23. Logging / Audit

| Requirement              | Status      | Evidence / Notes |
| ------------------------ | ----------- | ---------------- |
| Structured logging       | NOT_STARTED |                  |
| Request/correlation IDs  | NOT_STARTED |                  |
| Audit logs               | NOT_STARTED |                  |
| Audit immutability       | NOT_STARTED |                  |
| Sensitive-data redaction | NOT_STARTED |                  |
| Security-event logging   | NOT_STARTED |                  |
| Export auditing          | NOT_STARTED |                  |

---

# 24. Security Testing

| Test                                     | Status      | Evidence / Notes |
| ---------------------------------------- | ----------- | ---------------- |
| Unauthenticated dashboard access blocked | NOT_STARTED |                  |
| Viewer mutation blocked                  | NOT_STARTED |                  |
| Cross-tenant access blocked              | NOT_STARTED |                  |
| IDOR protection verified                 | NOT_STARTED |                  |
| Salary access tested                     | NOT_STARTED |                  |
| Secret access tested                     | NOT_STARTED |                  |
| Customer isolation tested                | NOT_STARTED |                  |
| Staff chat authorization tested          | NOT_STARTED |                  |
| WebRTC signaling authorization tested    | NOT_STARTED |                  |
| Payment authorization tested             | NOT_STARTED |                  |
| Webhook forgery tested                   | NOT_STARTED |                  |
| Replay protection tested                 | NOT_STARTED |                  |
| Rate limiting tested                     | NOT_STARTED |                  |
| File access tested                       | NOT_STARTED |                  |
| Production secrets absent from Git       | NOT_STARTED |                  |
| Production secrets absent from browser   | NOT_STARTED |                  |
| Sensitive data absent from logs          | NOT_STARTED |                  |

---

# 25. Automated Quality

| Check               | Status      | Last Result |
| ------------------- | ----------- | ----------- |
| Lint                | NOT_STARTED |             |
| TypeScript          | NOT_STARTED |             |
| Unit tests          | NOT_STARTED |             |
| Integration tests   | NOT_STARTED |             |
| Database tests      | NOT_STARTED |             |
| RLS tests           | NOT_STARTED |             |
| Security tests      | NOT_STARTED |             |
| Payment tests       | NOT_STARTED |             |
| Webhook tests       | NOT_STARTED |             |
| Playwright E2E      | NOT_STARTED |             |
| Production build    | NOT_STARTED |             |
| Dependency scanning | NOT_STARTED |             |
| Secret scanning     | NOT_STARTED |             |

---

# 26. Backup / Recovery

| Requirement                              | Status      | Evidence / Notes |
| ---------------------------------------- | ----------- | ---------------- |
| Backup strategy documented               | NOT_STARTED |                  |
| Backup retention defined                 | NOT_STARTED |                  |
| RPO defined                              | NOT_STARTED |                  |
| RTO defined                              | NOT_STARTED |                  |
| Restore procedure documented             | NOT_STARTED |                  |
| Staging restore tested                   | NOT_STARTED |                  |
| Recovery credentials documented securely | NOT_STARTED |                  |
| Disaster recovery runbook                | NOT_STARTED |                  |

---

# 27. Production Environment

| Requirement                      | Status      | Evidence / Notes |
| -------------------------------- | ----------- | ---------------- |
| Production Supabase project      | NOT_STARTED |                  |
| Production environment variables | NOT_STARTED |                  |
| HTTPS                            | NOT_STARTED |                  |
| Security headers                 | NOT_STARTED |                  |
| Production domain                | NOT_STARTED |                  |
| Authentication redirect URLs     | NOT_STARTED |                  |
| Webhook URLs                     | NOT_STARTED |                  |
| Monitoring                       | NOT_STARTED |                  |
| Backup                           | NOT_STARTED |                  |
| Rate limiting                    | NOT_STARTED |                  |
| Error monitoring                 | NOT_STARTED |                  |
| Production smoke tests           | NOT_STARTED |                  |

---

# 28. Environment Separation

| Requirement                                       | Status      |
| ------------------------------------------------- | ----------- |
| Local environment isolated                        | NOT_STARTED |
| Test environment isolated                         | NOT_STARTED |
| Staging environment isolated                      | NOT_STARTED |
| Production environment isolated                   | NOT_STARTED |
| Live payment credentials restricted to production | NOT_STARTED |
| Production provider credentials restricted        | NOT_STARTED |
| Development database cannot access production     | NOT_STARTED |

---

# 29. Documentation

| Document             | Status      |
| -------------------- | ----------- |
| README.md            | NOT_STARTED |
| ARCHITECTURE.md      | NOT_STARTED |
| SECURITY.md          | NOT_STARTED |
| DATABASE.md          | NOT_STARTED |
| DEPLOYMENT.md        | NOT_STARTED |
| INTEGRATIONS.md      | NOT_STARTED |
| DISASTER_RECOVERY.md | NOT_STARTED |
| INCIDENT_RESPONSE.md | NOT_STARTED |
| COST_MATRIX.md       | NOT_STARTED |
| CLAUDE.md            | NOT_STARTED |
| MASTER_SPEC.md       | NOT_STARTED |
| PROJECT_CONTEXT.md   | NOT_STARTED |

---

# 30. Production Blockers

Claude must maintain this section.

## Critical

```text
None
```

## High

```text
None
```

## Medium

```text
None
```

## Low

```text
None
```

A feature must NOT be marked `PRODUCTION_VERIFIED` if an unresolved Critical or High issue affects that feature.

---

# 31. External Dependencies

Track all services that production depends on:

| Service        | Purpose                | Required for Core Platform | Current Status |
| -------------- | ---------------------- | -------------------------: | -------------- |
| Supabase       | Database/Auth/Realtime |                        YES | NOT_CONNECTED  |
| Vercel/Hosting | Application hosting    |                        YES | NOT_CONNECTED  |
| GitHub         | Source control         |                         NO | NOT_CONNECTED  |
| Cloudflare     | DNS/CDN                |                         NO | NOT_CONNECTED  |
| Stripe         | Payments               |                         NO | NOT_CONNECTED  |
| Dojo           | Payments               |                         NO | NOT_CONNECTED  |
| TURN           | WebRTC reliability     |                         NO | NOT_CONNECTED  |
| Email provider | Notifications          |                         NO | NOT_CONNECTED  |

Update this table when actual providers are selected.

---

# 32. Production Release Gate

The platform may only be declared production-ready when ALL applicable requirements below are satisfied:

### Security

- Authentication verified
- MFA/step-up verified where required
- RBAC verified
- RLS verified
- Cross-tenant isolation verified
- Secrets protected
- Webhooks verified
- Rate limiting verified
- Sensitive logs reviewed
- No known critical/high security vulnerabilities

### Application

- Core workflows work
- Errors handled
- Loading states work
- Empty states work
- Responsive UI verified
- Dark mode verified
- Light mode verified
- Accessibility checked

### Database

- Production migrations tested
- Constraints verified
- Indexes verified
- Backup strategy verified
- Restore procedure tested

### Payments

- Stripe verified if enabled
- Dojo verified if enabled
- Webhooks verified
- Idempotency verified
- Reconciliation verified
- Refund controls verified

### Infrastructure

- Domains verified
- DNS controls verified
- Hosting verified
- SSL verified
- Deployment verified
- Health checks verified
- Monitoring verified

### Operations

- Tasks verified
- Support verified
- Staff management verified
- Customer portal verified
- Notifications verified
- Incident process documented

### Recovery

- Rollback plan documented
- Disaster recovery documented
- Recovery credentials secured
- Restore process tested

### Release

- CI passes
- TypeScript passes
- Lint passes
- Tests pass
- E2E tests pass
- Production build passes
- Production smoke tests pass
- Documentation complete

---

# 33. Final Production Decision

At release time, record:

```text
Release:
Version:
Date:
Environment:
Commit:
Verified by:
Critical issues:
High issues:
Known limitations:
Rollback plan:
Production status:
```

Final status must be exactly one of:

```text
NOT READY
READY WITH KNOWN LIMITATIONS
PRODUCTION READY
```

Do not use "Production Ready" without evidence.

---

# 34. Update Rule

Claude must update this document whenever a meaningful production-readiness state changes.

Do not change a status simply because code was written.

Use evidence such as:

```text
test result
migration result
staging verification
real provider connection
security test
deployment verification
backup restore test
```

Keep this document factual and concise.
