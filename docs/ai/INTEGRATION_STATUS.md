# Integration Status

This document is the authoritative record of all external service integrations used by the platform.

It must reflect the actual state of integrations.

Never mark an integration as connected merely because credentials were entered.

An integration becomes `CONNECTED` only after an appropriate real connection/authorization test succeeds.

---

# Status Definitions

```text id="7z2m2j"
NOT_PLANNED
PLANNED
DESIGNED
IMPLEMENTING
CONFIGURED
CONNECTED
VERIFIED
DEGRADED
EXPIRED
REVOKED
DISCONNECTED
BLOCKED
UNSUPPORTED
MANUAL_REQUIRED
```

## Important Rule

```text
Credential Exists ≠ Connected
API Call Succeeds Once ≠ Production Verified
UI Exists ≠ Integration Complete
```

---

# 1. Integration Overview

| Provider            | Category               | Priority | Status      | Production Verified | Owner | Notes |
| ------------------- | ---------------------- | -------: | ----------- | ------------------- | ----- | ----- |
| Supabase            | Database/Auth/Realtime |       P0 | IMPLEMENTED | NO                  |       | Auth only (T-104). Not connected: no project exists; never run against real Supabase Auth |
| Vercel              | Application Hosting    |       P0 | NOT_STARTED | NO                  |       |       |
| Domain Registrar    | Domain                 |       P0 | NOT_STARTED | NO                  |       |       |
| DNS Provider        | DNS                    |       P0 | NOT_STARTED | NO                  |       |       |
| GitHub              | Source Control         |       P2 | NOT_STARTED | NO                  |       |       |
| Cloudflare          | DNS/CDN/SSL            |       P2 | NOT_STARTED | NO                  |       |       |
| cPanel              | Hosting                |       P2 | NOT_STARTED | NO                  |       |       |
| Stripe              | Payments               |       P1 | NOT_STARTED | NO                  |       |       |
| Dojo                | Payments               |       P1 | NOT_STARTED | NO                  |       |       |
| Email Provider      | Notifications          |       P2 | NOT_STARTED | NO                  |       |       |
| TURN Provider       | WebRTC                 |       P3 | NOT_STARTED | NO                  |       |       |
| Monitoring Provider | Monitoring             |       P3 | NOT_STARTED | NO                  |       |       |

Do not assume all providers will be used in every deployment.

---

# 2. Required Provider Information

For every integration record:

```text id="ef3f3y"
Provider
Category
Purpose
Environment
Account
Organization
Connection method
Authentication method
Required scopes
Required permissions
API version
Webhook support
Webhook URL
Credential status
Connection status
Last successful test
Last successful sync
Last failure
Failure reason
Token expiry
Rate limits
Free/paid status
Production requirements
Known limitations
Owner
```

---

# 3. Environment Status

Every integration must distinguish:

```text id="s7d5wt"
LOCAL
TEST
STAGING
PRODUCTION
```

Example:

| Provider   | LOCAL      | TEST       | STAGING    | PRODUCTION  |
| ---------- | ---------- | ---------- | ---------- | ----------- |
| Supabase   | CONFIGURED | CONFIGURED | CONFIGURED | NOT_STARTED |
| Stripe     | TEST       | TEST       | TEST       | NOT_STARTED |
| Dojo       | TEST       | TEST       | TEST       | NOT_STARTED |
| Cloudflare | MOCK       | TEST       | TEST       | NOT_STARTED |

Do not put live credentials into local development.

---

# 4. SUPABASE

## Purpose

```text id="l80d3f"
PostgreSQL
Authentication
RLS
Realtime
Storage
Jobs/Queues where applicable
```

## Connection

```text
Status: IMPLEMENTED (Auth only) — NOT CONNECTED
Environment: LOCAL (local CLI stack is the intended backend; it cannot start on the dev machine — no Docker)
Hosted project: none for this application
```

## Findings from official documentation (read 2026-10-11)

Sources: supabase.com/docs "Creating a Supabase client for SSR", "Build a User Management App with Next.js"
(via the Supabase docs search), `@supabase/ssr` 0.12.7 and `@supabase/auth-js` type definitions.

```text
Authentication : publishable key (sb_publishable_…) for user-scoped clients, secret key (sb_secret_…) for the
                 admin client. Legacy anon / service_role keys work until the end of 2026; not used here.
Server clients : createServerClient with getAll / setAll cookie handlers. setAll also receives cache headers
                 (Cache-Control, Expires, Pragma) that must be copied to the response.
Session refresh: must happen in the Next.js proxy by calling auth.getClaims(); nothing may run between creating
                 the client and that call.
Authorization  : getClaims() verifies the JWT signature (JWKS for asymmetric keys, otherwise a getUser call).
                 getSession() must not be trusted on the server.
Email links    : server-side flow uses a token hash: /auth/confirm?token_hash=…&type=recovery → verifyOtp.
                 The email template has to be changed for this (config.toml locally, dashboard when hosted).
Caching        : responses that set session cookies must not be cached by a CDN.
Rate limits    : Auth has built-in per-IP limits (config.toml [auth.rate_limit]); see KNOWN_ISSUES ISSUE-011.
Webhooks       : none used.
Production     : separate project per environment; custom SMTP; leaked-password protection; site URL and
                 redirect allow-list set to the exact app URL. None of this is done.
```

Deviation from the documented example: session cookies are forced `HttpOnly`, so the browser client is
anonymous (DECISIONS.md 2026-10-11).

## Required Configuration

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

Use the current Supabase key model.

Do not introduce legacy key usage unless required for compatibility.

## Verification

```text id="p8v1nd"
Database connection
Auth
SSR session
RLS
Realtime
Storage
```

## Security Checks

```text id="v3x2rq"
Secret key remains server-only
RLS enabled
Cross-tenant access blocked
Client cannot access privileged operations
```

## Production

```text
Status: NOT_STARTED
Last Verified:
Notes:
```

---

# 5. DOMAIN REGISTRAR

This integration represents the actual registrar where domains are registered.

Examples may include:

```text
Namecheap
GoDaddy
Cloudflare Registrar
Other
```

Do not assume a DNS provider is the registrar.

## Required Information

```text id="7p9k2c"
Registrar
Account
API access
API scope
Supported TLDs
Renewal API
Domain status API
Nameserver API
```

## Status

```text
Status: NOT_STARTED
```

## Verification

Test only supported capabilities:

```text
Domain lookup
Domain expiry
Renewal information
Nameservers
Update operation if enabled
```

## Safety

Destructive domain operations require:

```text
permission
step-up authentication
confirmation
audit
```

---

# 6. DNS PROVIDER

Examples:

```text id="l2f2o5"
Cloudflare
Route53
Provider-specific DNS
```

## Required Capabilities

```text
List records
Create record
Update record
Delete record
Read nameservers
Read zone status
```

## Safety

For:

```text
NS
MX
CAA
```

require enhanced confirmation.

## Verification

```text
Authentication
Zone access
Read DNS
Safe test operation where possible
```

## Status

```text
Status: NOT_STARTED
```

---

# 7. CLOUDFLARE

## Purpose

```text id="y1j8nl"
DNS
CDN
SSL
Zones
Nameservers
Security
```

## Authentication

Prefer appropriately scoped API tokens.

Avoid unrestricted global credentials where possible.

## Required Permissions

Only request the minimum required capabilities.

Examples:

```text id="jv3s9m"
Zone Read
DNS Read
DNS Edit
Zone Settings Read
```

Do not grant write access if only read access is required.

## Verification

```text
List zones
Read zone
Read DNS
Verify SSL/status
```

## Production

```text
Status: NOT_STARTED
Production Verified: NO
```

---

# 8. VERCEL

## Purpose

```text
Application hosting
Deployments
Projects
Production domains
Deployment status
```

## Authentication

Use the least-privilege supported authentication model.

## Required Capabilities

```text
List projects
Read project
Read deployments
Read domains
Trigger deployment where authorized
```

## Verification

```text
Authentication test
Project read
Deployment read
Production domain read
Safe deployment test in non-production
```

## Production

```text
Status: NOT_STARTED
Production Verified: NO
```

---

# 9. GITHUB

## Purpose

```text
Repositories
Branches
Commits
Pull requests
Deployment relationships
```

## Preferred Authentication

Prefer GitHub App/OAuth where appropriate.

Avoid unnecessary long-lived personal access tokens.

## Required Scopes

Use minimum required permissions.

## Verification

```text
Connection
Repository listing
Repository read
Branch read
Commit read
PR read
```

## Production

```text
Status: NOT_STARTED
Production Verified: NO
```

---

# 10. CPANEL

## Purpose

```text
Hosting
Account information
Websites
Server information
Available provider APIs
```

## Important Rule

Do not assume every cPanel provider supports the same API capabilities.

Record each capability separately.

| Capability          | Status      |
| ------------------- | ----------- |
| Authentication      | NOT_STARTED |
| Account information | NOT_STARTED |
| Domains             | NOT_STARTED |
| DNS                 | NOT_STARTED |
| SSL                 | NOT_STARTED |
| Files               | NOT_STARTED |
| Database            | NOT_STARTED |

Use:

```text
SUPPORTED
UNSUPPORTED
MANUAL_REQUIRED
```

where appropriate.

Never fabricate cPanel information.

---

# 11. STRIPE

## Purpose

```text
Payment requests
Hosted payment flow
Payment status
Refunds
Webhooks
Reconciliation
```

## Authentication

Server-side secret only.

Never expose Stripe secret keys to browser code.

## Environments

```text id="uluvs5"
LOCAL: TEST
TEST: TEST
STAGING: TEST
PRODUCTION: LIVE
```

Do not use live keys outside production.

## Required Capabilities

```text
Create payment
Get payment status
Webhook verification
Refund where authorized
Reconciliation
```

## Verification

```text
Test payment creation
Webhook success
Duplicate webhook
Invalid webhook signature
Failed payment
Status reconciliation
Refund authorization
```

## Status

```text
Status: NOT_STARTED
Production Verified: NO
```

---

# 12. DOJO

## Purpose

```text
Payment links
Payment processing
Payment status
Webhooks
Reconciliation
```

## Authentication

Store credentials server-side only.

## Verification

Confirm against current official Dojo documentation:

```text
Authentication
Payment link creation
Payment status
Webhook verification
Webhook events
Expiry behavior
Cancellation support
Reconciliation behavior
```

Never assume an older Dojo API is still valid.

## Status

```text
Status: NOT_STARTED
Production Verified: NO
```

---

# 13. EMAIL PROVIDER

## Purpose

```text
Staff invitations
Support replies
Payment links
Notifications
Password/reset-related communication where configured
```

## Requirements

```text
Provider
SMTP/API
From address
Reply address
Authentication
SPF/DKIM/DMARC
Rate limits
Bounce handling
```

## Security

Never expose SMTP/API credentials to clients.

Never put credentials into support messages or logs.

## Status

```text
Status: NOT_STARTED
```

---

# 14. TURN / WEBRTC

## Purpose

```text
WebRTC connection reliability
NAT traversal
Fallback connectivity
```

## Requirements

```text
STUN
TURN
Credentials
Credential expiry/rotation
ICE configuration
```

## Verification

Test from:

```text
same network
different networks
mobile network
restricted NAT where possible
```

## Status

```text
Status: NOT_STARTED
```

A functioning browser-to-browser test on one network does not prove TURN works.

---

# 15. MONITORING PROVIDER

## Purpose

```text
Application errors
Performance
Availability
Provider failures
Incidents
```

## Required Capabilities

```text
error tracking
alerts
health monitoring
safe logs
```

## Security

Do not send:

```text
passwords
API tokens
payment credentials
salary
private customer data
```

to monitoring systems unless explicitly required and protected.

---

# 16. WEBHOOK STATUS

Track every webhook integration:

| Provider   | Webhook URL | Verification | Idempotency | Retry       | Reconciliation | Status      |
| ---------- | ----------- | ------------ | ----------- | ----------- | -------------- | ----------- |
| Stripe     | NOT_SET     | NOT_STARTED  | NOT_STARTED | NOT_STARTED | NOT_STARTED    | NOT_STARTED |
| Dojo       | NOT_SET     | NOT_STARTED  | NOT_STARTED | NOT_STARTED | NOT_STARTED    | NOT_STARTED |
| GitHub     | NOT_SET     | NOT_STARTED  | NOT_STARTED | NOT_STARTED | OPTIONAL       | NOT_STARTED |
| Vercel     | NOT_SET     | NOT_STARTED  | NOT_STARTED | NOT_STARTED | OPTIONAL       | NOT_STARTED |
| Cloudflare | NOT_SET     | NOT_STARTED  | NOT_STARTED | NOT_STARTED | OPTIONAL       | NOT_STARTED |

---

# 17. PROVIDER CREDENTIAL STATUS

Never write actual secrets in this file.

Use statuses:

```text id="p0xk2b"
NOT_CONFIGURED
CONFIGURED
TESTED
ACTIVE
EXPIRING
EXPIRED
REVOKED
ROTATION_REQUIRED
```

Example:

```text id="9v5snx"
Stripe:

Credential:
ACTIVE

Last tested:
2026-10-08

Expires:
N/A

Environment:
PRODUCTION

Secret location:
Production secret manager

Actual secret:
NOT STORED IN THIS FILE
```

---

# 18. PROVIDER HEALTH

For every connected provider record:

```text id="7l0p9a"
Current status
Last health check
Last successful operation
Last failed operation
Failure count
Last error code
Last error time
```

Status:

```text
HEALTHY
DEGRADED
FAILED
UNKNOWN
```

Do not mark HEALTHY solely because credentials exist.

---

# 19. PROVIDER SYNCHRONIZATION

Track:

```text id="l8shyo"
Initial sync
Manual sync
Scheduled sync
Incremental sync
Last sync
Last success
Last failure
Cursor/checkpoint
Reconciliation status
```

Example:

```text id="xck9n6"
Cloudflare
Last sync: 2026-10-08 18:30 UTC
Last success: 2026-10-08 18:30 UTC
Status: HEALTHY
```

---

# 20. RATE LIMITS

Record known provider limits.

| Provider   | Rate Limit                | Strategy         |
| ---------- | ------------------------- | ---------------- |
| Supabase   | Verify current plan/docs  | Cache/pagination |
| GitHub     | Verify current API limits | Backoff          |
| Vercel     | Verify current API limits | Backoff          |
| Cloudflare | Verify current API limits | Backoff          |
| Stripe     | Verify current limits     | Retry/backoff    |
| Dojo       | Verify current limits     | Retry/backoff    |

Do not hard-code outdated limits.

---

# 21. COST / PLAN STATUS

Record:

```text id="j0k0o2"
Provider
Plan
Free/paid
Monthly cost
Usage limit
Production limitation
What happens after limit
Alternative
```

Never mark an integration as "free" without verifying the provider's current plan.

---

# 22. INTEGRATION SECURITY CHECKLIST

For each integration:

- [ ] Least-privilege credentials
- [ ] Credentials stored server-side
- [ ] Credentials encrypted/protected
- [ ] No secret in Git
- [ ] No secret in browser
- [ ] No secret in logs
- [ ] Permission scopes documented
- [ ] Rotation procedure documented
- [ ] Revocation procedure documented
- [ ] Failure behavior documented
- [ ] Webhooks verified where applicable
- [ ] Idempotency implemented where required
- [ ] Reconciliation implemented where required

---

# 23. TEST STATUS

Every integration should have:

```text id="0y8tqx"
Unit tests
Integration tests
Failure tests
Authorization tests
Webhook tests where applicable
Staging test
Production verification where applicable
```

Track:

| Provider   | Unit        | Integration | E2E         | Staging     | Production  |
| ---------- | ----------- | ----------- | ----------- | ----------- | ----------- |
| Supabase   | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED |
| Stripe     | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED |
| Dojo       | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED |
| GitHub     | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED |
| Vercel     | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED |
| Cloudflare | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED |
| cPanel     | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED |

---

# 24. Provider Change History

Record meaningful integration changes:

```text
Date:
Provider:
Environment:
Change:
Reason:
Performed by:
Test result:
Rollback:
```

Example:

```text
2026-10-08

Provider: Cloudflare
Environment: Staging

Change:
Replaced DNS token with a least-privilege token.

Reason:
Reduce provider permissions.

Test:
Zone read PASS
DNS read PASS
DNS edit PASS

Rollback:
Previous token retained until verification completed.
```

Never store the actual credential.

---

# 25. Known Integration Limitations

Maintain current limitations here.

Example:

```text
- cPanel capabilities vary by hosting provider.
- Registrar API may not support all TLD operations.
- WebRTC requires TURN for reliable connectivity across restrictive networks.
- Stripe/Dojo production access requires merchant/provider accounts.
```

Only record verified limitations.

---

# 26. Current Blockers

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

---

# 27. Current Integration Summary

Update this section whenever the integration landscape changes.

```text
Core:
- Supabase: NOT_STARTED
- Application hosting: NOT_STARTED

Infrastructure:
- Registrar: NOT_STARTED
- DNS: NOT_STARTED
- Hosting: NOT_STARTED

Payments:
- Stripe: NOT_STARTED
- Dojo: NOT_STARTED

Development:
- GitHub: NOT_STARTED
- Vercel: NOT_STARTED
- Cloudflare: NOT_STARTED
- cPanel: NOT_STARTED

Communication:
- Email: NOT_STARTED
- TURN/WebRTC: NOT_STARTED

Monitoring:
- Monitoring provider: NOT_STARTED
```

---

# 28. Update Rules

Claude must update this document when:

- an integration is added
- credentials are configured
- permissions/scopes change
- connection status changes
- a provider API changes
- a webhook is added/changed
- synchronization is implemented
- provider health changes
- an integration becomes degraded
- an integration is revoked/disconnected
- a production verification is completed
- a limitation is discovered

Do not update statuses based on assumptions.

---

# 29. Never Store Here

This file must NEVER contain:

```text
passwords
API tokens
secret keys
private keys
encryption keys
refresh tokens
payment card information
database credentials
SMTP passwords
webhook secrets
```

Only store:

```text
status
metadata
safe identifiers
documentation references
non-sensitive configuration information
```

---

# 30. Final Integration Verification

Before declaring an integration `PRODUCTION VERIFIED`, confirm:

```text id="8dfq1g"
Authentication verified
Correct permissions verified
Connection tested
Required API operations tested
Failure handling tested
Rate limits considered
Secrets protected
Webhook verified
Idempotency verified
Reconciliation verified where needed
Audit logging verified
Staging verified
Production verified
Documentation updated
Rollback/revocation documented
```

Final integration status must be:

```text
CONNECTED
```

only when the provider actually works.

Use:

```text
VERIFIED
```

only after the required tests have passed.

Use:

```text
PRODUCTION VERIFIED
```

only after real production verification.

Create or update `docs/ai/INTEGRATION_STATUS.md`.

Inventory external integrations that exist or are planned. Inspect the repository and available configuration before assigning a status.

Potential integrations include Supabase, GitHub, Vercel, Cloudflare, cPanel, domain registrars, DNS providers, Stripe, Dojo, email delivery, monitoring, analytics, WebRTC/STUN/TURN, and future AI-generation or hosting providers.

For each integration document:

- Provider and business purpose.
- Current status: PLANNED, DESIGNED, CONFIGURED, CONNECTED, VERIFIED, DEGRADED, EXPIRED, REVOKED, DISCONNECTED, BLOCKED, UNSUPPORTED, or MANUAL_REQUIRED.
- Verified supported capabilities.
- Required credentials and permission scopes, without storing their values.
- Environment and configuration location.
- Webhook or event handling requirements.
- Rate limits, pricing, account prerequisites, and known restrictions where verified.
- Last verification date and evidence.
- Failure modes, retries, reconciliation, monitoring, and recovery.
- Outstanding implementation work.

Use CONNECTED or VERIFIED only when evidence supports the status. A package installed in the repository does not prove an account is connected.

Do not fabricate URLs, API endpoints, provider permissions, account status, or successful tests. Flag all unverified details for investigation.
