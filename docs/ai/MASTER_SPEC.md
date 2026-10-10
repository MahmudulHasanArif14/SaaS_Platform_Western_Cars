# MASTER SPECIFICATION

Multi-Tenant Company Operations & Infrastructure Management Platform
(with a later, separate customer-facing AI Website Builder & Hosting product)

| Field | Value |
| --- | --- |
| Document version | 2.0 |
| Last updated | 2026-10-10 |
| Repository state at update | Documentation only. No application code, migrations, or tests exist (verified 2026-10-10, commit `3b7f3c9`). |
| Structure | **Part A** — product specification (this part, new in v2.0). **Part B** — detailed implementation requirements (the v1 master prompt, preserved verbatim). |
| Precedence | Part A defines *what* and *why*. Part B defines *how* and remains authoritative for engineering rules. Where Part A adds a requirement absent from Part B, the requirement is marked **NEW**. Where they appear to conflict, do not silently choose: record it in `KNOWN_ISSUES.md` and resolve via `DECISIONS.md`. |

---

## A0. How to read this document

### A0.1 Requirement status markers

Every requirement group in Part A carries one marker. These describe **evidence about the requirement in this repository**, not intent.

| Marker | Meaning |
| --- | --- |
| `PROPOSED` | Specified; no implementation exists. |
| `PARTIAL` | Some implementation exists; acceptance criteria not all met. |
| `NOT_VERIFIED` | Implementation exists but has not been verified against acceptance criteria. |
| `EXISTING_VERIFIED` | Implemented and verified with recorded evidence (tests, checks, `PRODUCTION_READINESS.md`). |

As of 2026-10-10 **every requirement in this document is `PROPOSED`**. Nothing may be upgraded without evidence recorded in `SESSION_LOG.md` and `PRODUCTION_READINESS.md`.

Implementation progress (NOT_STARTED → … → PRODUCTION_VERIFIED) is tracked separately using the feature status model in `CLAUDE.md` (see `KNOWN_ISSUES.md` DOC-002 for the open reconciliation with Part B §188).

### A0.2 Related documents

| Topic | Document |
| --- | --- |
| How Claude works in this repo | [`CLAUDE.md`](../../CLAUDE.md) |
| Project summary / current stage | [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) |
| Technical architecture | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Data model | [`DATA_MODEL.md`](DATA_MODEL.md) |
| Security requirements | [`SECURITY_BASELINE.md`](SECURITY_BASELINE.md) |
| Threats and mitigations | [`THREAT_MODEL.md`](THREAT_MODEL.md) |
| Delivery order | [`ROADMAP.md`](ROADMAP.md) |
| Current authorized task | [`CURRENT_TASK.md`](CURRENT_TASK.md) |
| Provider state | [`INTEGRATION_STATUS.md`](INTEGRATION_STATUS.md) |
| Environments | [`ENVIRONMENT_MATRIX.md`](ENVIRONMENT_MATRIX.md) |
| External costs | [`COST_MATRIX.md`](COST_MATRIX.md) |
| Release gates | [`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md) |
| Decisions | [`DECISIONS.md`](DECISIONS.md) |
| Problems / blockers | [`KNOWN_ISSUES.md`](KNOWN_ISSUES.md) |
| Design system / UI | Part B §1B, §95–§98 (a standalone design document does not yet exist) |

---

## A1. Product vision, goals, non-goals, success criteria — `PROPOSED`

### A1.1 Vision

One secure internal platform where a small-to-medium digital services company runs its whole operation: the infrastructure it manages for clients (domains, DNS, hosting, websites, deployments, SSL), the money it collects (payment requests via Stripe and Dojo), the work its staff do (tasks, projects, support), how staff communicate (chat, calls), and the operational records it keeps about staff (HR, salary records, expenses, leave) — with every sensitive action authorized, audited, and recoverable.

A later, **separate** product (A17) lets external customers generate, publish, and host their own websites. It reuses the platform's foundations but is not part of the internal platform's release gates.

### A1.2 Goals

1. Management can understand the state of the company from one dashboard, using only real data.
2. Infrastructure changes (DNS, nameservers, deployments) are safe: previewed, permission-checked, step-up-protected where risky, audited, and reversible where the provider allows.
3. Payments are collected through hosted provider flows; the platform never handles raw card data.
4. Staff see exactly the data their role and assignments permit; salary data is visible only to explicitly authorized users.
5. Tenant isolation is enforced in the database (RLS), not only in the UI.
6. Non-technical staff can use the product without training on infrastructure internals.

### A1.3 Non-goals (current scope)

- Statutory payroll, tax, pension, VAT, or employment-law calculations (Part B §173C). Salary features are operational records only.
- Acting as a domain registrar, card processor, or certificate authority. The platform orchestrates external providers.
- Storing card numbers or bank credentials.
- A general-purpose video-conferencing product (Part B §173D: V1 is 1-to-1 calls).
- Microservices (Part B §3).
- Accounting/general-ledger functionality.
- The AI Website Builder before its gate (A17.1).

### A1.4 Success criteria

| ID | Criterion | Measured by |
| --- | --- | --- |
| SC-1 | Zero cross-tenant reads/writes in automated RLS and API tests | RLS test suite (Part B §117) |
| SC-2 | Every high-risk action (Part B §173B) enforced server-side and audited | Security tests (Part B §119) |
| SC-3 | Infrastructure MVP used for real domain/DNS/hosting records of the company | Production readiness review |
| SC-4 | Payment status in the platform matches provider status after reconciliation | Reconciliation job results (Part B §71) |
| SC-5 | No secret appears in a browser response, log line, or error message | Security tests + log review |
| SC-6 | WCAG 2.1 AA on core workflows, both themes | Accessibility audit (Part B §95) |
| SC-7 | Backup restore exercised successfully before production release | DR drill record (Part B §113–114) |

Numeric performance budgets are **not yet defined** (open decision OD-6).

---

## A2. User types — `PROPOSED`

Roles are permission bundles, not the security boundary (Part B §17–19). Authorization is permission-based and scoped by organization, assignment, and ownership.

| User type | Default role(s) | Typical scope | Must never |
| --- | --- | --- | --- |
| Platform owner | `SUPER_ADMIN` (see OD-1) | Operates the deployment; manages organizations; break-glass support | Bypass RLS through normal app paths; read salary or secrets without the same permission + step-up + audit as anyone else |
| Organization administrator | `ADMIN` | Full control of one organization: members, roles, settings, integrations | Act outside their organization |
| Manager | `MANAGER` | Team work, assignments, approvals, workload reports | See salary data unless granted `salary.view` |
| Employee | `DEVELOPER`, `SEO_MARKETING`, `VIEWER`, or custom | Assigned tasks, projects, websites, chat | See other staff's private HR data |
| Finance operator | `FINANCE` | Payment requests, invoices, refunds (with approval), reconciliation, salary records if granted | Change payment provider config without step-up |
| Infrastructure operator | `DEVELOPER` + infra permissions, or custom role (see OD-2) | Domains, DNS, hosting, websites, deployments | Change nameservers / deploy to production without step-up and configured approval |
| Support agent | `SUPPORT` | Tickets, customer replies, internal notes, support-linked payment requests | See internal notes of tickets outside their access scope; see salary |
| HR (Part B §17) | `HR` | Employment records, leave, expenses | See salary unless granted |
| External customer | `CUSTOMER` | Own organization's customer-portal data: their tickets, invoices, payment requests, websites | See internal notes, staff conversations, other customers, other organizations |

Custom roles are supported (Part B §18). Separation of duties applies (Part B §139): a requester cannot approve their own sensitive request when the rule requires a second person.

---

## A3. Organizations, tenant isolation, roles, permissions — `PROPOSED`

**Requirements**

- All business data belongs to an `organization`; every applicable table has `organization_id` (Part B §16).
- `organization_id` is derived server-side from authenticated membership, never trusted from input.
- RLS enabled on every tenant/sensitive table; no `USING (true)` on protected data (Part B §20).
- Highly sensitive data lives in a non-exposed `private` schema accessed only through server-side code (Part B §21).
- Permission keys per Part B §18; centralized checks `requireAuth`, `requireOrganizationMembership`, `requirePermission`, `requireStepUpAuth`, `canAccess*` (Part B §19).
- MFA available; step-up enforced on the backend for high-risk actions (Part B §15, §173B).
- Custom roles; role/permission changes require step-up and are audited.
- Users may belong to several organizations; active organization is explicit in the session context.

**Acceptance criteria**

- A user of org A cannot read, list, update, or infer existence of org B records via UI, server actions, route handlers, Realtime, Storage, or direct PostgREST calls with a tampered ID.
- Removing a permission takes effect on the next request (no stale client-side authority).
- Role changes produce an audit event with actor, target, before/after.

**Error conditions**: missing membership → 404-equivalent (no existence leak); missing permission → 403 with safe message; step-up required → explicit step-up challenge, operation not executed.

Links: Part B §16–§24, `SECURITY_BASELINE.md`, `THREAT_MODEL.md` §7–§9, `DATA_MODEL.md` §3–§7.

---

## A4. CRM: customers, contacts, documents, notes, activity — `PROPOSED`

- Client (customer company) records: company, contacts, email, phone, address, status, notes, linked websites/domains/hosting, payment history, tickets (Part B §38).
- Client contacts; a contact may be invited as a `CUSTOMER` portal user.
- Notes: internal (staff-only) vs customer-visible must be distinct fields/tables, never a flag the UI alone respects.
- Documents attached to clients: private Storage buckets, signed URLs, content-type and size validation, malware scanning strategy decided before release (Part B §59, §103; OD-7).
- Activity history / customer timeline (Part B §122) assembled from audit and activity events.
- Soft delete with retention (Part B §133); customer offboarding (Part B §136).

**Acceptance**: staff without `clients.view` cannot list clients; customer users see only their own client record's customer-visible data; deleting a client with active domains/payments is blocked or requires explicit confirmation.

---

## A5. Employee directory, teams, reporting, assignments, offboarding — `PROPOSED`

- Staff directory (Part B §33): name, email, role, status, last login, assignments, security status.
- **NEW** Teams/departments with members and a team lead (see `DATA_MODEL.md` §8).
- **NEW** Reporting relationships: each member may have a `reports_to` member in the same organization; no cycles (DB constraint or trigger). Used for manager scoping and approval routing — not for salary visibility, which requires explicit permission.
- Assignments: staff ↔ clients, websites, projects, tickets (Part B §155).
- Invite → activate → deactivate lifecycle; invitations idempotent and expiring.
- Offboarding (Part B §33, §135): disable account, revoke sessions, reassign tasks/ownership, flag shared credentials for rotation, preserve audit history. Deactivation never deletes historical activity.

**Acceptance**: offboarding a user leaves no open task, ticket, or ownership assigned to them without an explicit reassignment decision; their sessions are invalid on next request.

---

## A6. Tasks and projects — `PROPOSED`

- Tasks per Part B §34: title, description, client, website, project, assignee, reviewer, priority, status, progress, due date, estimates, actual hours.
- Comments, progress reports (Part B §35), attachments, checklists, dependencies (no cycles), watchers, mentions, reopen.
- Projects with statuses Planning / Active / On Hold / Completed / Archived (Part B §36).
- Approvals via the reusable approval engine (A6.1).
- **NEW** Recurring tasks: a recurrence rule (RFC 5545 RRULE subset: daily/weekly/monthly) on a task template; instances generated by a durable scheduled job, idempotent per (template, occurrence date); editing a template affects future instances only.
- Notifications on assignment, mention, due-soon, overdue, status change (A15).
- Task dashboards never expose salary data (Part B §35).

### A6.1 Approvals

Request / approve / reject / request changes / cancel / expire; 1- or 2-approver rules; configurable per action type; self-approval blocked where separation of duties applies (Part B §37, §139).

**Acceptance**: a dependent task cannot be completed while a blocking dependency is open (or override is audited); recurrence job run twice produces no duplicate instance.

---

## A7. Internal communication — `PROPOSED` (Team Operations MVP)

- Channels (public/private), direct messages, threads optional (OD-8) (Part B §43).
- Attachments in private Storage, scanned/validated (Part B §128).
- Mentions with notifications; read receipts via per-member read state (`chat_read_states`).
- Presence and typing via Supabase Realtime with authorized channels (Part B §46, §74).
- Calls: V1 = 1-to-1 audio/video, mute, camera toggle, screen share, call history, TURN support (Part B §47–§50, §173D). Group calls require an SFU provider (OD-9) and are out of V1.
- Message edit/delete policy and retention: OD-10.

**Acceptance**: a non-member cannot subscribe to a private channel's Realtime topic or read its messages via API; calls fall back to TURN on restrictive networks (tested from an independent network).

---

## A8. Customer support and customer portal — `PROPOSED`

- Tickets with status history, priority, assignment, SLA policies, canned replies, attachments (Part B §40–§42).
- Internal notes strictly separated from customer-visible replies.
- **Escalation**: by SLA breach (time-based job) and manually (to manager or tier); escalation recorded in status history and notifies the new owner.
- Customer replies by portal; email inbound is OD-11.
- Ticket ↔ task link, ticket ↔ incident link (Part B §42, §159).
- Support-linked payment requests (Part B §69).
- Customer portal (Part B §39, §129, §153): own tickets, invoices, payment requests, websites/domains overview, profile. Customer users are a distinct principal type with their own RLS predicates.

**Acceptance**: a customer user calling the ticket API with another ticket's ID receives not-found; internal notes are absent from every customer-facing response payload (verified by test, not by UI inspection).

---

## A9. Salary and payroll-record tracking — `PROPOSED` (restricted)

Operational records only (Part B §52–§54, §173C). No tax/statutory calculations, no payroll-provider integration, no bank transfers, unless separately specified and approved.

- Employment records, salary history (amount, currency, effective dates).
- Payroll periods; payroll entries per member per period; states `draft → approved → paid` (and `cancelled`); `paid` records the date, method label, and reference entered by an authorized user — the platform does not move money.
- Approvals for salary adjustments and marking paid where configured.
- Access: `salary.view`, `salary.manage`, `salary.mark_paid` only; step-up for modify; every read of salary detail is audited.
- Money as integer minor units + ISO 4217 currency (Part B §91, §132).

**Acceptance**: users without `salary.view` receive no salary fields in any response (including aggregates, search, exports, reports); marking paid twice is idempotent.

---

## A10. Payments — `PROPOSED` (Business Operations MVP)

- Generic payment abstraction (`PaymentProvider` adapter) with Stripe and Dojo implementations (Part B §30, §64–§68).
- Payment requests / payment links / invoices created internally; customers pay on provider-hosted pages. No card data touches the platform.
- Provider is chosen explicitly per request; never silently switched (Part B §66).
- Signed webhooks verified with the provider's mechanism; raw events stored in `private.webhook_events`; processing idempotent by provider event ID (Part B §70, §109–§110).
- Idempotency keys on creation and refunds (Part B §27).
- Reconciliation job compares provider state with local state; mismatches become issues, never silent overwrites (Part B §71).
- Refunds: `payments.refund` + step-up + optional approval (Part B §173B).
- Full audit history per payment (Part B §124).
- "Paid" is shown only after a verified provider confirmation — never on link creation (Part B §189).

**Dojo note**: capabilities (payment links, webhooks, refunds via API, sandbox) must be confirmed from current Dojo developer documentation before design is final; anything unsupported is marked `UNSUPPORTED`, not simulated.

---

## A11. Domains, DNS, SSL, hosting, environments, deployments — `PROPOSED` (Infrastructure MVP — first priority)

- Domains (Part B §75): registrar, expiry, auto-renew flag, nameservers, client, status; expiry alerts (Part B §161).
- DNS (Part B §76–§77): record CRUD with validation per record type, change preview (diff), snapshot before change, rollback from snapshot, verification after change, reconciliation against provider. Nameserver change = step-up + confirmation + optional approval.
- SSL (Part B §10 schedule, §160): certificate source, issuer, expiry, monitoring.
- Hosting accounts and providers (Vercel, cPanel, other) via `HostingProvider` adapter.
- Websites and environments (production/staging/preview) linked to domains, hosting, repository (Part B §78).
- Deployments (Part B §79–§80): trigger via provider, record logs, post-deploy health check, **rollback** to previous known-good deployment where the provider supports it; production deploys require `websites.deploy` and optional approval.
- Manual records are allowed when no provider is connected and are labelled as manual; provider-synced data shows last sync time.

**Acceptance**: a DNS change always produces a snapshot first; rollback restores the snapshot's records at the provider and records an audit event; a provider failure mid-change is reported as partial with the exact state (Part B §163).

---

## A12. Integration boundaries — `PROPOSED`

All providers live behind adapters in `lib/providers/*` (Part B §30). Credentials are encrypted at rest, decrypted only server-side (Part B §23). Connection status reflects a real connection test (Part B §31–§32).

| Integration | Purpose | Adapter interface | Status |
| --- | --- | --- | --- |
| Supabase | DB, Auth, RLS, Realtime, Storage, queues/cron | (platform) | NOT_CONNECTED |
| GitHub | Repositories, commits, deploy sources | `RepositoryProvider` | NOT_CONNECTED |
| Vercel | Hosting, deployments, domains on Vercel | `HostingProvider` | NOT_CONNECTED |
| Cloudflare | DNS, SSL edge | `DnsProvider` | NOT_CONNECTED |
| cPanel | Shared hosting, DNS zone on host | `HostingProvider` / `DnsProvider` | NOT_CONNECTED |
| Registrar(s) | Domain expiry, nameservers | `RegistrarProvider` | NOT_CONNECTED — registrar(s) not yet identified (OD-3) |
| Stripe | Payments | `PaymentProvider` | NOT_CONNECTED |
| Dojo | Payments | `PaymentProvider` | NOT_CONNECTED |
| Email | Transactional email | `EmailProvider` | NOT_CONNECTED — provider not chosen (OD-4) |
| Monitoring | Uptime/SSL/health | `MonitoringProvider` | NOT_CONNECTED — provider not chosen (OD-5) |
| TURN | WebRTC relay | config | NOT_CONNECTED |

Authoritative state: `INTEGRATION_STATUS.md`. Before implementing any adapter, the current official documentation must be read and findings recorded there (Part B §173).

---

## A13. Monitoring, alerts, incidents, backup/DR, audit — `PROPOSED`

- Website/SSL/domain health checks via scheduled jobs (Part B §86, §160).
- Operational alerts → notifications with deduplication.
- Incidents (Part B §87): severity, timeline, owner, linked websites/tickets, postmortem.
- Security Center (Part B §88): sessions, MFA coverage, recent high-risk actions, failed logins.
- Audit logs append-only, tamper-evident where practical, exportable only with permission (Part B §92–§93, §126).
- Backup and recovery (Part B §113–§114): Supabase backups per plan (PITR availability depends on plan — COST_MATRIX), documented restore procedure, restore drill before production.
- Structured logs with correlation IDs, no secrets (Part B §100, §158).

---

## A14. Non-functional requirements — `PROPOSED`

| Area | Requirement | Part B |
| --- | --- | --- |
| Security | Server-side authorization on every mutation; RLS; secrets server-only; CSRF protections for non-Server-Action endpoints; security headers incl. CSP; rate limiting on auth, webhooks, and sensitive endpoints | §19–§24, §89, §101–§102 |
| Accessibility | WCAG 2.1 AA, keyboard navigation, focus states, both themes contrast-checked | §95 |
| Performance | Server Components by default; minimal client JS; paginated tables (keyset for large sets); budgets TBD (OD-6) | §105 |
| Reliability | Outbox + durable jobs with retry/backoff/dead-letter; idempotency; reconciliation for provider state | §27–§29 |
| Maintainability | Modular monolith; provider adapters; typed env; Zod validation at boundaries | §2–§3, §13 |
| Observability | Structured logs, correlation IDs, job run records, provider error records | §100, §158 |
| Cost control | Every external dependency recorded in `COST_MATRIX.md` with free-tier limits and paid triggers; security and reliability outrank free price | §171, §173A |
| UI | Polished SaaS UI from day one, dark/light/system themes, semantic tokens, responsive | §1B, §96 |

---

## A15. Notifications — `PROPOSED`

In-app (Realtime) and email; per-user preferences; idempotent delivery keyed by event; no secrets or salary amounts in notification bodies (Part B §73–§74).

---

## A16. Key user journeys, permissions, error conditions, release gates — `PROPOSED`

### A16.1 Journeys (Infrastructure MVP)

| Journey | Actor | Permissions | Key error conditions |
| --- | --- | --- | --- |
| Sign in with MFA | Any staff | — | Wrong code; unverified email; locked/rate-limited |
| Add a domain manually | Infra operator | `domains.create` | Duplicate domain in org; invalid FQDN |
| Edit DNS record with preview | Infra operator | `domains.manage_dns` | Invalid record value; provider rejects; provider timeout → partial state shown |
| Roll back DNS to snapshot | Infra operator | `domains.manage_dns` + step-up | Snapshot stale vs provider (reconcile first) |
| Change nameservers | Infra operator | `domains.manage_dns` + step-up + confirm (+ approval if configured) | Registrar unsupported → `UNSUPPORTED`, manual instructions |
| Link website ↔ domain ↔ hosting | Infra operator | `websites.update` | Domain in another org (not found) |
| Trigger production deploy | Developer | `websites.deploy` (+ approval) | Health check fails → mark degraded, offer rollback |

### A16.2 Journeys (Business Operations MVP)

| Journey | Actor | Permissions | Key error conditions |
| --- | --- | --- | --- |
| Create payment request from a ticket | Support agent | `payments.create` | Provider not connected; amount/currency invalid; duplicate submit (idempotent) |
| Customer pays | External customer | (hosted page) | Payment fails/abandoned → stays pending; webhook late → reconciliation |
| Refund | Finance operator | `payments.refund` + step-up (+ approval) | Partial refund exceeds remaining; provider refuses |

### A16.3 Release gates

| Gate | Must pass before |
| --- | --- |
| G0 — Foundation | Any business feature: auth, org membership, RBAC, RLS tests, audit foundation, env validation, CI lint/typecheck/test/build green |
| G1 — Infrastructure MVP | Internal use for real infra records: A11 acceptance, security tests for DNS/nameserver/deploy paths |
| G2 — Business Operations MVP | Real payments: webhook signature + replay tests, reconciliation, refunds gated, test-mode end-to-end with each provider |
| G3 — Company / Team Operations | Customer portal exposure, chat, HR/salary data entry |
| G4 — Production Platform | Production launch checklist (Part B §143), DR drill, final security audit (Part B §184) |
| G5 — AI Website Builder start | G4 passed **and** OD-12…OD-15 resolved (A17.1) |

Detailed acceptance criteria: Part B §183; readiness scoring: Part B §182 and `PRODUCTION_READINESS.md`.

---

## A17. Later phase: customer-facing AI Website Builder & Hosting — `PROPOSED` (NEW, gated)

### A17.1 Gate

Work on this product **must not start** until gate G4 has passed for the internal platform and these decisions are recorded in `DECISIONS.md`: AI model provider and pricing (OD-12), hosting/deployment target and per-site cost (OD-13), custom-domain + SSL mechanism and its limits/pricing (OD-14), subscription plans and billing provider (OD-15). Nothing here is assumed free: AI generation, hosting, bandwidth, SSL, custom domains, email, and storage each require verified pricing, commercial-use terms, quotas, and provider capability before design is finalized.

### A17.2 Intended journey

| Step | Description | Key requirements |
| --- | --- | --- |
| 1. Registration | Customer signs up | Email verification; bot/abuse protection; separate customer principal from internal staff |
| 2. Workspace creation | Customer gets a tenant workspace | Same tenant-isolation model (RLS) as A3 |
| 3. Plan selection | Choose plan | Plans define site count, generation quota, bandwidth, custom domains |
| 4. Payment verification | Pay via billing provider | Plan activates only on verified webhook; idempotent |
| 5. AI generation | Generate site from prompt/brief | Quota enforced server-side; prompt/content moderation; generated output stored as versioned, editable content — not executable server code |
| 6. Editing | Visual/structured editor | Autosave versions; content sanitization (no arbitrary script injection) |
| 7. Preview | Private preview URL | Not indexed; access-controlled |
| 8. Publishing | Publish a version | Immutable published version; rollback to previous version |
| 9. Platform subdomain | `site.<platform-domain>` | Reserved-name list; subdomain takeover prevention |
| 10. Custom domain verification | Customer connects own domain | Ownership proof (TXT/CNAME) before routing; re-verification on change |
| 11. SSL | Certificate for custom domain | Automated issuance via chosen provider; expiry monitoring |
| 12. Deployment monitoring | Health and uptime | Alerts to customer and support |
| 13. Usage limits | Quotas per plan | Hard limits enforced server-side; usage metering stored |
| 14. Billing | Subscription lifecycle | Upgrade/downgrade/cancel; dunning; reconciliation |
| 15. Support | Tickets from builder | Reuses A8 |

### A17.3 Specific risks to design for

Prompt-injection and abusive content generation; phishing/malicious sites hosted on the platform domain (abuse reporting and takedown); cost runaway from generation or bandwidth; subdomain/custom-domain takeover; isolation between customer sites.

---

## A18. Integration assumptions, dependencies, open decisions, out of scope

### A18.1 Assumptions (to verify, not facts)

- Supabase plan supports required features (Auth MFA, Realtime, Storage, queues/cron, backups) at the chosen tier — verify in `COST_MATRIX.md`.
- Stripe and Dojo merchant accounts exist or will be created by the business owner; sandbox access is available for development.
- Company domains are held at registrar(s) with API access, or will be managed manually.
- Hosting is a mix of Vercel and cPanel hosts.

### A18.2 External accounts required for production (Part B §172)

GitHub, Supabase (separate staging and production projects recommended), Vercel (or chosen host), Cloudflare (if used for DNS), domain registrar(s), Stripe merchant account, Dojo merchant account, email provider, TURN provider/server, monitoring provider.

### A18.3 Open business/technical decisions

| ID | Decision | Owner | Blocks |
| --- | --- | --- | --- |
| OD-1 | Is the platform owner a cross-tenant operator, or only `SUPER_ADMIN` within each organization? Break-glass procedure? | Business owner | Day 2 RBAC |
| OD-2 | Add a built-in `INFRA_OPERATOR` role or rely on custom roles? | Business owner | Day 2 RBAC |
| OD-3 | Which registrar(s) hold company domains; do they offer APIs? | Business owner | Day 5 / Day 28 |
| OD-4 | Transactional email provider | Business owner | Invitations, notifications |
| OD-5 | Monitoring provider (or self-implemented checks only) | Business owner | Day 29 |
| OD-6 | Performance budgets (page load, API latency) | Engineering + owner | Release gate G4 |
| OD-7 | File malware-scanning approach | Engineering | Attachments/documents |
| OD-8 | Chat threads in V1? | Business owner | Day 23 |
| OD-9 | SFU provider for future group calls | Business owner | Post-V1 |
| OD-10 | Message/ticket/audit retention periods (and any legal retention obligations) | Business owner (+ legal) | Retention jobs |
| OD-11 | Inbound email-to-ticket in V1? | Business owner | Day 20 |
| OD-12…15 | AI provider, builder hosting target, custom-domain/SSL mechanism, builder billing plans | Business owner | A17 |
| OD-16 | Default currency and supported currencies | Business owner | Day 11 |
| OD-17 | Operating jurisdiction(s) — affects data protection obligations (e.g. UK GDPR) and Dojo availability | Business owner | Privacy (Part B §94), payments |

### A18.4 Out of scope (until separately specified)

Statutory payroll/tax; accounting ledger; card storage; registrar reselling; native mobile apps; group video calls in V1; public API for third parties; AI features inside the internal platform; the AI Website Builder before G5.

---

# PART B — DETAILED IMPLEMENTATION REQUIREMENTS (v1, preserved verbatim)

The content below is the original master implementation prompt. It remains authoritative for engineering rules. All of its requirements carry status `PROPOSED` unless Part A or `PRODUCTION_READINESS.md` records otherwise.


# MASTER IMPLEMENTATION PROMPT

## Production-Grade Multi-Tenant Company Operations, Staff, CRM, Website, Hosting, Domain, Support, Payments & Communication Platform

You are acting as a:

- Senior software architect
- Senior Next.js/TypeScript engineer
- Senior Supabase/PostgreSQL engineer
- Application security engineer
- DevOps/release engineer
- SaaS architecture specialist
- Payments integration engineer
- Realtime/WebRTC engineer
- QA/test automation engineer
- Technical project manager

Your job is to design and build a **real production-grade company management platform**, not a UI prototype.

The existing requirements supplied in the project specification remain authoritative and must be preserved. Extend them with the requirements in this document.

The final result must be secure, maintainable, auditable, modular, performant, responsive, production-deployable, and understandable by non-technical company staff.

Do not fake integrations.

Do not claim functionality is implemented when it is only a placeholder.

Do not sacrifice security merely to keep everything free.

Do not create unnecessary microservices.

Prefer a **modular monolith architecture** using Next.js + Supabase with strong boundaries and provider adapters.

---

# 0. MOST IMPORTANT DEVELOPMENT RULE

Do not begin by generating a huge amount of application code.

First inspect the repository, understand what already exists, determine what is reusable, establish the architecture, create the project-control documentation, and then implement the system incrementally.

The application must remain runnable after every major phase.

Never rewrite working functionality unnecessarily.

Never replace existing functionality merely because you prefer another implementation.

Before changing an existing subsystem:

1. Inspect it.
2. Understand its dependencies.
3. Determine whether it is secure.
4. Determine whether it can be reused.
5. Change only what is necessary.
6. Test the result.

---

# 1. PRIMARY OBJECTIVE

Build a secure internal company platform that centralizes:

```text
Company
├── Organizations / Tenants
├── Staff
├── Roles & Permissions
├── Clients
├── Customer Contacts
├── Customer Portal
├── CRM
├── Websites
├── Domains
├── DNS
├── Hosting
├── Repositories
├── Deployments
├── SSL / Monitoring
├── Providers
├── Integrations
├── Secrets
├── Tasks
├── Projects
├── Approvals
├── Support
├── Tickets
├── Staff Chat
├── Direct Messages
├── WebRTC Calls
├── HR
├── Salary Tracking
├── Payroll Records
├── Expenses
├── Leave
├── Attendance / Work Logs
├── Payments
├── Stripe
├── Dojo
├── Invoices / Payment Requests
├── Notifications
├── Reports
├── Incidents
├── Activity
├── Audit Logs
├── Security Center
├── Settings
└── System Administration
```

The platform should allow management to understand the entire company from one dashboard.

---

# 1A. PRODUCT RELEASE PRIORITY

The system is large, but the initial startup must remain focused.

The first major functional milestone is:

```text
Professional UI
+
Authentication / RBAC / RLS
+
Domain Management
+
DNS Management
+
Hosting Management
+
Website / Environment Management
```

The second major milestone is:

```text
Generic Payments
+
Stripe
+
Dojo
+
Invoices / Payment Requests
```

The later milestones add:

```text
CRM
Projects / Tasks
Support
Customer Portal
Staff Management
Chat / Realtime
WebRTC
HR / Salary / Expenses / Leave
Advanced Provider Integrations
Monitoring / Incidents / Reporting
```

Do not allow secondary features to delay the initial infrastructure-management product.

The first release should already feel polished and useful.

---

# 1B. UI / UX MUST BE BUILT FROM DAY 1

Do not build a plain functional UI and postpone visual design.

The first application shell must already support:

```text
Dark mode
Light mode
System theme detection
Persistent theme preference
Responsive desktop/tablet/mobile
Accessible focus states
Consistent design tokens
Professional typography
Consistent spacing
SaaS-quality tables
Cards
Tabs
Dialogs
Drawers
Forms
Filters
Search
Pagination
Toast notifications
Confirmation dialogs
Loading skeletons
Empty states
Error states
```

Use:

```text
Next.js
Tailwind CSS
shadcn/ui
Lucide
CSS variables / design tokens
React Hook Form
Zod
```

## Dark Theme

Use a professional near-black enterprise interface:

```text
Background: near-black
Surface: dark charcoal
Borders: subtle neutral gray
Primary: professional blue/indigo
Success: green
Warning: amber
Danger: red
Text: high-contrast white/light gray
Muted text: neutral gray
```

## Light Theme

Use a deliberately designed light interface rather than simply inverting dark mode:

```text
Background: light neutral
Surface: white
Borders: subtle gray
Primary: professional blue/indigo
Success: green
Warning: amber
Danger: red
Text: dark neutral
Muted text: gray
```

Both themes must remain accessible and visually polished.

Do not hard-code colors repeatedly inside components.
Use centralized semantic design tokens.

The UI should feel like a modern professional SaaS administration product, not an unfinished admin template.

---

# 1C. INITIAL NAVIGATION PRIORITY

During the early releases, infrastructure should appear before secondary modules:

```text
Dashboard

INFRASTRUCTURE
  Domains
  DNS
  Hosting
  Websites
  Deployments
  SSL

FINANCE
  Payments
  Payment Links
  Invoices

WORKSPACE
  Clients
  Projects
  Tasks
  Support

TEAM
  Staff
  HR
  Salary
  Leave
  Expenses

COMMUNICATION
  Chat
  Calls
  Notifications

MANAGEMENT
  Approvals
  Reports
  Incidents

SECURITY
  Audit Logs
  Security Center
  Sessions

SYSTEM
  Integrations
  Settings
```

Navigation must remain permission-aware.

Do not display modules that are not implemented yet as though they are functional.

---

# 1D. RELEASE TARGETS

## Infrastructure MVP

The first useful internal release should contain:

```text
Authentication
RBAC
Organizations
RLS
Audit foundation
Dark/light mode
Dashboard shell
Domain Management
DNS Management
Hosting Management
Website Management
Basic Notifications
```

## Business Operations MVP

Then add:

```text
Generic Payments
Stripe
Dojo
Invoices
Payment Requests
Clients / CRM
Customer Portal
```

## Company Operations MVP

Then add:

```text
Projects
Tasks
Staff Assignment
Task Reports
Support
Approvals
```

## Team Operations MVP

Then add:

```text
Staff Management
Chat
Realtime
WebRTC
HR
Salary
Expenses
Leave
```

## Production Platform

Finally add and verify:

```text
Advanced Provider Integrations
Monitoring
Incidents
Reports
Backup / Recovery
Security Hardening
Performance
Accessibility
CI/CD
Production Release
```

---

# 1E. NO PREMATURE FEATURE SPRAWL

Do not create fully routed but empty pages for features scheduled much later.

Do not create fake dashboard statistics.

Do not create fake integration cards.

Do not mark providers as connected until a real connection test succeeds.

Do not add chat/WebRTC/HR complexity to the initial infrastructure MVP unless required by the current task.

Build the next highest-priority vertical slice and keep the rest documented in the roadmap.

---

# 2. ARCHITECTURE PRINCIPLE

Use this high-level architecture:

```text
                         Browser
                            │
                            ▼
                    Next.js App Router
                            │
           ┌────────────────┼────────────────┐
           │                │                │
           ▼                ▼                ▼
      Server Components  Server Actions  Route Handlers
           │                │                │
           └────────────────┼────────────────┘
                            ▼
                  Application Service Layer
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
 Authorization         Business Logic       Validation
        │                   │                    │
        └───────────────────┼────────────────────┘
                            ▼
                    Data Access Layer
                            │
                 ┌──────────┴───────────┐
                 │                      │
                 ▼                      ▼
             Supabase             Secure Server
          PostgreSQL/Auth          Operations
          Storage/Realtime
                 │
        ┌────────┼─────────┐
        ▼        ▼         ▼
      RLS      Jobs      Realtime
                 │
                 ▼
          Integration Layer
                 │
     ┌───────┬───┼────┬────────┬─────────┐
     ▼       ▼   ▼    ▼        ▼         ▼
  GitHub  Vercel CF  cPanel  Stripe    Dojo
```

Do not allow UI components to directly contain provider credentials or business-critical integration logic.

---

# 3. DO NOT TURN THIS INTO MICROSERVICES

Do not create:

```text
20 separate backend services
```

unless a real technical requirement appears later.

Start with:

```text
Next.js modular application
+
Supabase
+
Supabase Realtime
+
Supabase Storage
+
durable jobs
+
provider adapters
```

Separate responsibilities through folders/modules/interfaces rather than independent servers.

---

# 4. PHASE ZERO — REPOSITORY DISCOVERY

Before writing feature code:

Inspect:

```text
package.json
package-lock.json / pnpm-lock.yaml / yarn.lock
next.config.*
tsconfig.json
eslint configuration
app/
src/
components/
lib/
public/
supabase/
.env*
.gitignore
README.md
```

Inspect Git history where useful.

Determine:

```text
Next.js version
React version
TypeScript version
Supabase packages
UI framework
authentication implementation
database implementation
existing API routes
existing Server Actions
existing middleware/proxy
existing tests
existing deployment configuration
```

Run the appropriate current project checks:

```text
git status
lint
typecheck
test
build
```

Use the project's actual package manager rather than assuming npm.

Do not modify anything substantial during this discovery step.

---

# 5. CREATE PROJECT MEMORY FIRST

Before feature implementation create:

```text
docs/
  ai/
    PROJECT_CONTEXT.md
    MASTER_SPEC.md
    ROADMAP.md
    CURRENT_TASK.md
    TASK_QUEUE.md
    DECISIONS.md
    SESSION_LOG.md
    SECURITY_BASELINE.md
    THREAT_MODEL.md
    DATA_MODEL.md
    API_CONTRACTS.md
    INTEGRATION_STATUS.md
    ENVIRONMENT_MATRIX.md
    RELEASE_CHECKLIST.md
    KNOWN_ISSUES.md
    PRODUCTION_READINESS.md
```

Also create/update:

```text
CLAUDE.md
```

The original complete specification should be preserved in:

```text
docs/ai/MASTER_SPEC.md
```

Do NOT automatically inject the entire giant specification into every Claude session.

Keep `CLAUDE.md` relatively small.

Use it as the project operating manual.

This is intentional to reduce context/token usage.

---

# 6. CLAUDE.md REQUIREMENTS

Create a concise `CLAUDE.md` containing:

```text
Project purpose
Architecture
Important security rules
Where business logic lives
Where integrations live
How to run tests
How to run build
How to run migrations
How project memory works
Current development stage
Current task file
Rules against fake functionality
Rules against exposing secrets
Git conventions
```

It should tell Claude:

```text
Before every task:
1. Read CLAUDE.md.
2. Read docs/ai/CURRENT_TASK.md.
3. Read relevant sections of docs/ai/MASTER_SPEC.md only when necessary.
4. Inspect affected files.
5. Check git status.
6. Make the smallest safe change.
7. Test the affected area.
8. Update project memory.
```

Do not force Claude to reread the entire repository on every session.

---

# 7. CLAUDE CODE TOKEN-EFFICIENCY RULES

Use Claude efficiently.

Do not repeatedly paste the master prompt.

Use persistent project memory instead.

Use:

```text
CLAUDE.md
docs/ai/*
git history
```

as the continuity mechanism.

At the end of every work session update:

```text
CURRENT_TASK.md
SESSION_LOG.md
ROADMAP.md
KNOWN_ISSUES.md
```

Only update `DECISIONS.md` when an actual architectural decision is made.

Do not write repetitive explanations into the context files.

Use short factual entries.

Example:

```markdown
## 2026-10-08

Completed:
- Authentication foundation
- Supabase SSR setup
- Route protection

Tests:
- typecheck: pass
- lint: pass
- build: pass

Remaining:
- MFA
- RBAC

Next:
- Organization and permission model
```

---

# 8. DAY-BY-DAY EXECUTION MODEL

Build the project as sequential implementation days.

Do not attempt all modules in one session.

Do not automatically jump to the next day unless instructed.

Every day must produce:

```text
Implementation
Tests
Documentation update
Git diff review
Security review
Known limitations
Feature status update
Next task
```

## IMPORTANT PRODUCT PRIORITY

The implementation order is intentional.

Do NOT follow the original database-table order simply because a feature appears earlier in the specification.

The first useful business release must focus on the company's core infrastructure-management workflow:

```text
Foundation + Security + UI
        ↓
Domain Management
        ↓
DNS Management
        ↓
Hosting Management
        ↓
Website / Environment Management
        ↓
Generic Payment System
        ↓
Stripe
        ↓
Dojo
        ↓
Clients / CRM
        ↓
Projects / Tasks / Assignment
        ↓
Customer Support
        ↓
Customer Portal
        ↓
Staff Management
        ↓
Staff Chat / Realtime
        ↓
WebRTC
        ↓
HR / Salary / Expenses / Leave
        ↓
Advanced Infrastructure Integrations
        ↓
Monitoring / Incidents / Reports
        ↓
Final Hardening / Production Release
```

Do not build empty placeholder pages for all future modules merely to complete navigation.

Each priority module should be implemented vertically:

```text
Database
→ RLS
→ Permission
→ Server service
→ Validation
→ CRUD / provider integration
→ Audit
→ UI
→ Tests
→ Documentation
```

## SUGGESTED IMPLEMENTATION SCHEDULE

```text
DAY 0   Repository audit / architecture / threat model / project memory
DAY 1   Project foundation / polished UI shell / theme system / authentication
DAY 2   Organizations / RBAC / permission engine
DAY 3   RLS / tenant isolation / security baseline / audit foundation

DAY 4   Domain management foundation
DAY 5   Domain details / expiry / registrar / client relationships
DAY 6   DNS management / record CRUD / validation / change preview
DAY 7   DNS safety / snapshots / verification / reconciliation
DAY 8   Hosting management / provider abstraction
DAY 9   Website management / environments / domain-hosting relationships
DAY 10  SSL / website health / deployment metadata foundation

DAY 11  Generic payment model / payment request architecture
DAY 12  Payment-request UI / invoices / provider selection
DAY 13  Stripe integration / hosted Checkout or Payment Links
DAY 14  Stripe webhooks / idempotency / reconciliation / refunds where authorized
DAY 15  Dojo integration / webhooks / reconciliation
DAY 16  Unified payment lifecycle / support-linked payment requests

DAY 17  Clients / CRM
DAY 18  Projects / tasks / assignment
DAY 19  Task reporting / approvals / workload
DAY 20  Customer support / tickets / SLA
DAY 21  Customer portal / customer-visible communication

DAY 22  Staff management / roles / assignments / offboarding
DAY 23  Internal chat / direct messages / channels
DAY 24  Realtime notifications / presence / typing / unread state
DAY 25  WebRTC 1-to-1 audio/video / screen sharing / TURN support

DAY 26  HR / employment records / leave / expenses
DAY 27  Salary / payroll tracking / financial permissions
DAY 28  GitHub / Vercel / Cloudflare / cPanel / registrar integrations
DAY 29  Monitoring / incidents / reporting / security center / advanced hardening
DAY 30  Full E2E / security audit / backup-restore verification / staging-to-production release
```

If a day is too large, split it into:

```text
Day 10A
Day 10B
```

Do not rush just to match the schedule.

A day is complete only when its acceptance criteria and relevant tests pass.

---

# 9. DAY 0 — ARCHITECTURE ONLY

Day 0 must NOT implement the entire application.

Produce:

```text
Architecture diagram
Folder structure
Database domain map
RBAC model
RLS strategy
Security threat model
Provider architecture
Payment architecture
Realtime architecture
WebRTC architecture
Background-job architecture
Deployment architecture
Testing strategy
Environment strategy
```

Create:

```text
docs/ai/PROJECT_CONTEXT.md
docs/ai/ROADMAP.md
docs/ai/DATA_MODEL.md
docs/ai/THREAT_MODEL.md
docs/ai/SECURITY_BASELINE.md
docs/ai/ENVIRONMENT_MATRIX.md
```

Then stop.

---

# 10. PRODUCTION ENVIRONMENTS

Use:

```text
LOCAL
TEST
STAGING
PRODUCTION
```

Prefer separate Supabase environments for staging and production where practical.

Never use real customer information in local seed data.

Never use real payment credentials in local development.

Never use production secrets in development.

Never point development code at production databases.

---

# 11. SUPABASE API KEY MODEL

Use the current Supabase API key model.

Prefer:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Do not introduce new dependencies on legacy:

```env
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

unless compatibility with an existing dependency absolutely requires them.

The public/publishable key is safe for browser use only with proper RLS.

The secret/elevated key is server-only.

Never send elevated keys to the browser.

---

# 12. ENVIRONMENT VARIABLES

Create:

```text
.env.example
```

Document every variable.

Group them:

```text
PUBLIC
SERVER
SECURITY
DATABASE
AUTH
GITHUB
VERCEL
CLOUDFLARE
CPANEL
STRIPE
DOJO
EMAIL
WEBRTC
TURN
MONITORING
```

Example:

```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SECRET_KEY=

ENCRYPTION_KEY=
ENCRYPTION_KEY_VERSION=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

VERCEL_API_TOKEN=
CLOUDFLARE_API_TOKEN=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

DOJO_API_KEY=
DOJO_WEBHOOK_SECRET=

TURN_URL=
TURN_USERNAME=
TURN_CREDENTIAL=

EMAIL_PROVIDER=
EMAIL_FROM=
```

Do not invent provider variable names if an official SDK requires something different.

Document exact provider requirements during implementation.

---

# 13. CENTRALIZED ENV VALIDATION

Create:

```text
lib/env/
  server.ts
  client.ts
```

Use Zod or an equivalent strongly typed validation approach.

The server environment schema must reject missing required secrets in production.

Never casually use:

```typescript
process.env.SOME_SECRET
```

throughout the application.

Centralize environment access.

---

# 14. AUTHENTICATION

Use Supabase Auth.

Support:

```text
Email/password
Email verification
Password reset
Session management
Logout
Protected routes
MFA
```

Use current Supabase SSR patterns.

Prefer secure cookie-based server-side sessions.

Do not build custom password hashing.

Do not store application passwords.

---

# 15. MFA / STEP-UP AUTHENTICATION

MFA must be available for sensitive accounts.

High-risk actions should require step-up authentication where appropriate:

```text
Change role
Change permissions
Access secrets
Reveal sensitive credential
Delete domain
Change nameservers
Production deployment
Delete production website
Delete organization
Change payment configuration
Process refund
Modify payroll
Mark salary as paid
Change security configuration
```

Use Supabase MFA where supported.

Do not merely put an MFA checkbox into the UI.

The sensitive backend operation must enforce the requirement.

---

# 16. MULTI-TENANCY

Create:

```text
organizations
organization_members
```

All business data must belong to an organization.

Every applicable table should contain:

```text
organization_id
```

Never trust a user-supplied `organization_id`.

Derive it from authenticated membership and authorized resources.

Cross-tenant data access must be impossible even if someone manually changes an ID in an HTTP request.

---

# 17. RBAC

Initial roles:

```text
SUPER_ADMIN
ADMIN
MANAGER
DEVELOPER
SEO_MARKETING
SUPPORT
FINANCE
HR
VIEWER
CUSTOMER
```

These are permission bundles rather than the security boundary itself.

Never rely only on:

```typescript
if (user.role === "admin")
```

Build permission-based authorization.

---

# 18. PERMISSION SYSTEM

Support permissions such as:

```text
staff.view
staff.create
staff.update
staff.deactivate

roles.view
roles.manage

clients.view
clients.create
clients.update
clients.delete

websites.view
websites.create
websites.update
websites.delete
websites.deploy

domains.view
domains.create
domains.update
domains.delete
domains.manage_dns

hosting.view
hosting.manage

integrations.view
integrations.manage

secrets.view
secrets.manage

tasks.view
tasks.create
tasks.update
tasks.assign
tasks.delete

projects.view
projects.manage

support.view
support.create
support.assign
support.manage

chat.view
chat.send

calls.use

hr.view
hr.manage

salary.view
salary.manage
salary.mark_paid

finance.view
finance.manage

payments.create
payments.view
payments.cancel
payments.refund

audit_logs.view

security.view
security.manage

settings.view
settings.manage
```

Allow custom roles.

---

# 19. CENTRALIZED AUTHORIZATION

Create:

```text
lib/auth/
lib/rbac/
```

Implement reusable functions such as:

```typescript
requireAuth()
requireOrganizationMembership()
requirePermission()
requireRole()
requireStepUpAuth()
canAccessClient()
canAccessWebsite()
canAccessTask()
canAccessSupportTicket()
canAccessSalaryRecord()
canAccessSecret()
```

Every server action and route handler must enforce authorization independently.

Never trust hidden buttons.

Never trust the sidebar.

Never trust client state.

---

# 20. RLS

RLS is mandatory.

Every sensitive table gets explicit RLS.

Create reusable Postgres authorization functions where appropriate.

Policies must consider:

```text
authenticated user
organization membership
permission
resource ownership
assignment
customer membership
```

Avoid dangerous:

```sql
USING (true)
```

policies for protected data.

Do not disable RLS merely because a query is inconvenient.

---

# 21. PRIVATE DATABASE AREAS

Separate especially sensitive records from ordinary application data.

Examples:

```text
private.secrets
private.webhook_events
private.idempotency_keys
private.security_events
private.integration_tokens
```

Do not expose these tables casually through public application APIs.

Use explicit server-side functions or server-only data access.

---

# 22. SECURITY BOUNDARY

Treat these as security-sensitive:

```text
Secrets
API keys
Payment credentials
Payroll
Salary
Staff private information
Customer private information
Support private notes
Audit logs
Session security
Provider tokens
DNS credentials
Deployment credentials
```

Do not log them.

Do not serialize them into client components.

Do not put them in browser network responses.

Do not put them into analytics events.

Do not include them in error messages.

---

# 23. SECRET STORAGE

Do not store credentials as plaintext.

Use authenticated encryption.

Requirements:

```text
Encryption at rest
Random IV/nonce
Authentication tag
Key version
Key rotation support
Decryption only server-side
Redacted display
Rotation/revocation support
Audit events
```

Create:

```text
lib/security/crypto/
```

Include:

```text
encryptSecret()
decryptSecret()
rotateSecret()
redactSecret()
```

Use a maintained cryptographic implementation.

Do not invent cryptography.

Do not create an unaudited home-made encryption algorithm.

Architect the system so secrets can later move to:

```text
Vault
Cloud KMS
Managed secret manager
```

without rewriting business logic.

---

# 24. NEVER RETURN SECRETS TO CLIENTS

A normal API response must never contain:

```text
GitHub token
Vercel token
Cloudflare token
Dojo API key
Stripe secret key
SMTP password
Database password
Encryption master key
```

If a secret must be used, the server should use it internally.

If revealing a secret is absolutely required, require:

```text
permission
step-up authentication
audit event
minimal exposure
one-time display where possible
```

---

# 25. DATABASE ARCHITECTURE

Create migrations under:

```text
supabase/migrations/
```

Never make undocumented production schema changes.

Suggested domain model:

```text
Identity
  profiles
  organizations
  organization_members
  roles
  permissions
  role_permissions
  member_roles

CRM
  clients
  client_contacts
  customer_accounts
  customer_users

Infrastructure
  projects
  websites
  environments
  domains
  dns_records
  ssl_certificates
  hosting_accounts
  providers
  provider_connections
  repositories
  deployments
  deployment_logs

Operations
  tasks
  task_updates
  task_comments
  task_watchers
  task_checklists
  task_dependencies
  approvals
  incidents

Support
  support_tickets
  ticket_messages
  ticket_assignments
  ticket_status_history
  sla_policies
  canned_replies
  support_attachments

Communication
  chat_channels
  chat_channel_members
  direct_conversations
  direct_conversation_members
  chat_messages
  chat_reactions
  chat_read_states
  chat_attachments
  call_sessions
  call_participants
  call_events

HR
  employment_records
  salary_history
  payroll_periods
  payroll_entries
  salary_payments
  leave_requests
  work_logs
  employee_documents
  expenses
  expense_claims

Finance
  invoices
  payment_requests
  payment_links
  payment_events
  payment_refunds

System
  notifications
  notification_preferences
  audit_logs
  activity_events
  webhook_events
  outbox_events
  job_runs
  integration_sync_states
  idempotency_keys
```

Do not blindly create every table.

Review the actual relationships and remove unnecessary duplication.

---

# 26. DATA INTEGRITY

Use:

```text
foreign keys
unique constraints
check constraints
indexes
not-null constraints
status constraints
currency constraints
date constraints
```

Handle:

```text
concurrency
duplicate submissions
race conditions
stale updates
partial provider failures
```

Use transactions where appropriate.

---

# 27. IDEMPOTENCY

Implement idempotency for operations that must not execute twice.

Especially:

```text
payment creation
payment webhook processing
refunds
DNS modifications
deployment triggers
provider synchronization
staff invitations
task automation
notifications
salary payment records
```

Create:

```text
idempotency_keys
```

with suitable uniqueness constraints.

---

# 28. OUTBOX / EVENT PATTERN

For important asynchronous operations use an outbox/event strategy.

Example:

```text
Database mutation
      ↓
outbox event
      ↓
durable queue
      ↓
worker
      ↓
external provider
      ↓
result
      ↓
database state update
      ↓
notification
```

Do not rely on:

```text
fire-and-forget Promise
```

for critical operations.

---

# 29. DURABLE JOB PROCESSING

Implement a job abstraction:

```text
queued
running
succeeded
failed
retrying
cancelled
dead_letter
```

Store:

```text
job id
job type
organization
payload reference
attempt count
started_at
completed_at
error code
safe error message
next retry time
correlation id
```

Use Supabase-native durable queue capabilities where suitable, but keep the application behind a job abstraction so the queue technology can be replaced later.

Supabase currently provides Postgres-backed durable queues and cron capabilities; verify current availability and project-plan compatibility during implementation.

Use:

```text
exponential backoff
jitter
maximum attempts
dead-letter handling
reconciliation
idempotency
```

---

# 30. PROVIDER ADAPTER ARCHITECTURE

Never scatter provider-specific code throughout the application.

Use:

```text
lib/providers/
  github/
  vercel/
  cloudflare/
  cpanel/
  registrar/
  dns/
  stripe/
  dojo/
  email/
  monitoring/
```

Create interfaces.

Example:

```typescript
interface HostingProvider {
  getProjects(): Promise<Project[]>
  getProject(id: string): Promise<Project>
  getDeployments(id: string): Promise<Deployment[]>
  triggerDeployment(input: TriggerDeploymentInput): Promise<DeploymentResult>
}
```

Do the same for:

```text
RepositoryProvider
HostingProvider
DnsProvider
RegistrarProvider
PaymentProvider
EmailProvider
MonitoringProvider
```

---

# 31. PROVIDER CONNECTION MANAGEMENT

A company should be able to connect multiple provider accounts.

For every integration display:

```text
Provider
Account name
Organization
Connection status
Scopes
Last successful sync
Last error
Token expiry
Created date
Last updated
```

States:

```text
Not configured
Connected
Degraded
Expired
Error
Revoked
Disconnected
Unsupported
```

Never display fake "Connected" status.

---

# 32. PROVIDER HEALTH CHECKS

Every integration needs:

```text
connection test
credential validation
permissions validation
sync status
last successful operation
last failure
reconnect
disconnect
credential rotation
```

Do not say "working" merely because credentials are present.

Test actual authorization where safe.

---

# 33. STAFF MANAGEMENT

Staff page:

```text
/staff
/staff/[id]
```

Show:

```text
name
email
role
status
organization
last login
created
assigned clients
assigned websites
assigned tasks
support assignments
security status
```

Actions:

```text
invite
activate
deactivate
change role
change permissions
reassign work
revoke sessions
review security
```

When a staff member leaves:

```text
disable account
revoke active sessions
revoke provider access where applicable
reassign tasks
reassign ownership
preserve audit history
review credentials
rotate shared credentials if required
```

Never delete historical activity merely because a user was deactivated.

---

# 34. STAFF WORK ASSIGNMENT SYSTEM

A staff member must be able to receive a specific task.

Task fields:

```text
title
description
client
website
project
assigned_to
reviewer
created_by
priority
status
progress_percent
due_date
estimated_hours
actual_hours
created_at
updated_at
completed_at
```

Add:

```text
task comments
task updates
attachments
checklists
dependencies
watchers
mentions
approval
reopen
```

---

# 35. STAFF TASK REPORTING

A staff member must be able to report work.

Provide:

```text
Progress update
Completed work
Blocked reason
Next action
Time spent
Attachments
```

Example:

```text
Task:
Fix Western Cars DNS issue

Report:
- Investigated DNS
- Found incorrect CNAME
- Corrected record
- Verified propagation
- Site now resolves correctly
```

Managers should see:

```text
Tasks assigned
Tasks completed
Overdue tasks
Blocked tasks
Workload
Progress
Recent reports
```

Do not expose salary information through ordinary task dashboards.

---

# 36. PROJECT MANAGEMENT

Projects may contain:

```text
client
website
tasks
milestones
members
files
comments
deployments
activity
```

Project statuses:

```text
Planning
Active
On Hold
Completed
Archived
```

---

# 37. APPROVAL WORKFLOW

Create a reusable approval system.

Support:

```text
request
approve
reject
request changes
cancel
expire
```

Critical operations may require:

```text
1 approval
2 approvals
manager approval
admin approval
```

A person should not approve their own sensitive request when separation-of-duties is required.

Use approvals for:

```text
production deployment
DNS/nameserver changes
domain deletion
payment refunds
large payment requests
salary adjustments
salary marking
credential reveal
staff privilege escalation
critical integration changes
organization deletion
```

Make approval rules configurable.

---

# 38. CUSTOMER / CRM

Customer records:

```text
company
contacts
email
phone
address
status
notes
websites
domains
hosting
projects
tasks
tickets
payments
invoices
activity
```

Customer status:

```text
Prospect
Active
Inactive
Archived
```

Never expose internal staff notes to customers.

---

# 39. CUSTOMER PORTAL

Provide a separate restricted customer area.

Example:

```text
/portal
/portal/dashboard
/portal/tickets
/portal/payments
/portal/invoices
/portal/websites
/portal/profile
```

Customers can only see their own resources.

Customer portal users must NEVER inherit staff permissions.

---

# 40. CUSTOMER SUPPORT SYSTEM

Build a real support/helpdesk module.

Support inbox:

```text
New
Open
Pending
Waiting for Customer
Resolved
Closed
```

Ticket fields:

```text
ticket number
customer
contact
subject
description
priority
status
assignee
team
SLA
created_at
updated_at
resolved_at
```

Add:

```text
internal notes
customer-visible replies
attachments
mentions
assignment
escalation
status history
SLA tracking
```

Internal notes must never be sent to the customer.

---

# 41. SUPPORT STAFF ASSIGNMENT

Support manager can assign tickets to:

```text
individual staff
support team
manager
developer
```

The assignee can:

```text
reply
add internal note
update status
assign another staff member
request technical help
create task
create payment request
```

A ticket should be able to generate a linked task.

---

# 42. SUPPORT ↔ TASK CONNECTION

Example:

```text
Customer reports website issue
        ↓
Support ticket
        ↓
Support agent creates technical task
        ↓
Developer receives task
        ↓
Developer reports progress
        ↓
Support sees progress
        ↓
Support replies to customer
        ↓
Ticket resolved
```

This should be a first-class workflow.

---

# 43. STAFF CHAT

Build internal staff communication.

Support:

```text
#general
#developers
#support
#management
#marketing
```

And:

```text
direct messages
group conversations
private channels
```

Features:

```text
send message
edit own message
delete according to policy
reply
mention
reaction
attachments
read state
unread count
search
presence
typing indicator
link preview where safe
```

---

# 44. CHAT SECURITY

Chat channels must be private by default.

Use authorized Supabase Realtime channels.

Use RLS / Realtime authorization to ensure only authorized members can subscribe or broadcast. Supabase currently supports RLS-backed authorization for private Realtime Broadcast/Presence channels.

Do not assume that hiding a channel in the UI is security.

Never allow:

```text
staff A → manually change channel id → read private channel
```

---

# 45. CHAT DATA

Persist messages in PostgreSQL.

Use Realtime for:

```text
new message
typing
presence
notifications
calls
live status
```

Durable information belongs in PostgreSQL.

Do not use WebSocket memory as the permanent source of truth.

Use Supabase Broadcast preferentially for ephemeral realtime communication and Postgres-backed records for durable state. Supabase documents Broadcast as the recommended realtime pattern for scalability/security compared with Postgres Changes for many use cases.

---

# 46. STAFF PRESENCE

Show:

```text
Online
Away
Busy
Offline
```

Presence should not be abused for high-frequency updates.

Use Broadcast for ephemeral events such as:

```text
typing
call signaling
temporary UI state
```

Use database persistence for durable state.

---

# 47. WEBRTC

Implement employee-to-employee audio/video calling.

Support:

```text
1-to-1 audio
1-to-1 video
mute
camera on/off
screen sharing
hang up
incoming call
call accepted
call rejected
call missed
call history
connection status
```

Architecture:

```text
Supabase Realtime
        ↓
signaling
        ↓
WebRTC
        ↓
STUN / TURN
        ↓
peer connection
```

Do not send media through the Next.js server.

---

# 48. WEBRTC PRODUCTION REQUIREMENTS

Do not assume browser-to-browser WebRTC will always work without TURN.

Provide:

```text
STUN
TURN
ICE negotiation
candidate exchange
reconnection
connection state handling
permission handling
device selection
camera/microphone error handling
```

Use a TURN provider or self-hosted coturn.

If self-hosting TURN, document that this normally requires a server with a public network address.

Do not fake TURN configuration.

---

# 49. GROUP CALLS

Do not attempt to scale large conferences using naive full-mesh WebRTC.

Architecture should support:

```text
WebRTCProvider
```

so that future group calling can use an SFU.

Initial production implementation may focus on 1-to-1 calls.

If multi-party calling is implemented later, use an SFU architecture.

---

# 50. CALL SECURITY

Call signaling must check:

```text
authenticated user
organization membership
channel membership
call participant authorization
```

Never allow:

```text
unauthorized user to inject themselves into another call
```

Do not record calls by default.

If recording is ever added, implement explicit consent, permissions, secure storage, retention, and audit requirements.

---

# 51. HR MODULE

Create:

```text
employee profile
employment record
department
job title
manager
joining date
status
employment history
documents
leave
work logs
```

Do not duplicate Supabase Auth credentials into the HR database.

---

# 52. SALARY TRACKING

Add a secure salary module.

The objective is primarily:

```text
Has the salary been paid?
How much?
For which period?
When?
Who recorded it?
```

Track:

```text
employee
payroll period
base salary
allowances
deductions
adjustments
net amount
currency
status
payment date
payment reference
notes
recorded_by
```

Status:

```text
Scheduled
Pending
Partially Paid
Paid
Cancelled
```

---

# 53. SALARY SECURITY

Salary is highly sensitive.

Only authorized roles should access it.

Examples:

```text
super_admin
authorized admin
finance
authorized HR/manager
```

Every sensitive salary mutation must be audited.

Consider auditing sensitive salary views as well.

Never place salary information into:

```text
global search
ordinary staff dashboard
general activity feed
regular chat notifications
```

unless the viewer is authorized.

---

# 54. PAYROLL

Create payroll periods:

```text
2026-10
2026-11
...
```

Each payroll period can contain employees and status.

Support:

```text
draft
review
approved
partially_paid
paid
closed
```

Payroll should support manager approval before finalization if configured.

Do not implement jurisdiction-specific tax calculations without a separately approved payroll specification.

Track financial facts rather than inventing legal payroll calculations.

---

# 55. EXPENSES

Create optional employee expense management.

Staff can submit:

```text
expense
amount
currency
category
description
receipt
date
client/project
```

Manager can:

```text
approve
reject
request clarification
```

Finance can mark:

```text
reimbursed
```

---

# 56. LEAVE / TIME OFF

Add:

```text
leave request
leave type
from
to
reason
status
approved_by
```

Managers can approve requests.

Keep country/company policy configurable.

---

# 57. WORK LOGS

Allow staff to record:

```text
task
project
time spent
description
date
```

Do not automatically infer working hours from online presence.

Being "online" does not mean a person worked that many hours.

---

# 58. COMPANY ANNOUNCEMENTS

Management can publish internal announcements.

Support:

```text
title
message
audience
department
priority
created_by
published_at
expires_at
read state
```

---

# 59. DOCUMENT MANAGEMENT

Use Supabase Storage where appropriate.

Support secure documents for:

```text
clients
websites
projects
tickets
staff
expenses
HR
```

Use:

```text
signed URLs
RLS
file size limits
file type allowlists
safe filenames
permission checks
```

Do not expose permanent public URLs for private company files.

---

# 60. GLOBAL SEARCH

Search:

```text
clients
websites
domains
tasks
projects
staff
tickets
payments
hosting
```

Search results must enforce RBAC.

Sensitive information such as salary or secrets should be excluded unless specifically authorized.

---

# 61. DASHBOARDS

Main dashboard:

```text
Websites
Active websites
Domains
Expiring domains
Hosting
Open tasks
Overdue tasks
Failed deployments
Open support tickets
Payments pending
Payments completed
Staff count
Unpaid salary periods
Active incidents
Integration failures
```

Do not expose sensitive metrics to unauthorized roles.

---

# 62. MANAGER DASHBOARD

Management dashboard:

```text
Company workload
Staff workload
Task completion
Support backlog
SLA performance
Project health
Revenue/payment requests
Outstanding payments
Salary paid/unpaid
Domain renewals
Failed deployments
Incidents
Integration health
```

Provide filters:

```text
period
department
staff
client
project
status
priority
```

---

# 63. FINANCE DASHBOARD

Finance can view:

```text
Payment requests
Pending payments
Completed payments
Refunds
Invoices
Salary periods
Paid salary
Unpaid salary
Expenses
```

No card data should ever be stored.

---

# 64. PAYMENT ARCHITECTURE

Create a common interface:

```typescript
interface PaymentProvider {
  createPaymentRequest(input: CreatePaymentRequestInput): Promise<PaymentLinkResult>
  getPaymentStatus(reference: string): Promise<PaymentStatus>
  cancelPayment(reference: string): Promise<void>
  verifyWebhook(request: Request): Promise<VerifiedWebhook>
  handleWebhook(event: VerifiedWebhook): Promise<void>
  reconcile(reference: string): Promise<PaymentStatus>
}
```

Implement:

```text
StripePaymentProvider
DojoPaymentProvider
```

Staff should not care about provider-specific implementation details.

---

# 65. PAYMENT REQUEST UI

From:

```text
Customer
Support ticket
Invoice
Task
Project
Payment section
```

staff should be able to click:

```text
Create Payment Link
```

Then select:

```text
Provider:
  Stripe
  Dojo
```

Enter:

```text
customer
amount
currency
description
reference
invoice
ticket
due information
```

Then:

```text
Create Link
```

The server creates the provider payment request.

The UI receives only safe information:

```text
provider
payment reference
payment URL
status
expiry
created_at
```

---

# 66. PAYMENT PROVIDER SELECTION

The employee must be able to choose:

```text
Stripe
Dojo
```

Only show providers that are:

```text
enabled
connected
healthy
authorized for that staff member
```

If Stripe is unavailable:

```text
Stripe unavailable
```

Do not silently switch to Dojo.

The employee must knowingly choose the alternative.

---

# 67. STRIPE

Support server-side creation of Stripe-hosted payment flows.

Use the official current Stripe API.

For a customer-specific one-time request, prefer an appropriate server-created Checkout Session unless a reusable Payment Link is specifically required.

Stripe's current API supports hosted Checkout Sessions and Payment Links; Payment Links are shareable hosted payment URLs, while Checkout Sessions are created server-side for a customer payment attempt.

Support:

```text
one-time payment
customer reference
metadata
payment status
webhook processing
refunds where authorized
reconciliation
```

Never store:

```text
card number
CVV
full card details
```

---

# 68. DOJO

Implement Dojo through the provider abstraction.

Use the official Dojo API and current developer documentation.

Do not assume old Dojo API behavior.

Current Dojo documentation supports API-created payment links and webhook-driven payment notification; verify exact endpoints, signatures, fields, expiry and status behavior against the documentation during implementation.

Support:

```text
payment creation
payment URL
provider reference
status
webhook
reconciliation
cancellation where supported
```

---

# 69. PAYMENT LINK FROM SUPPORT CHAT

A support employee should be able to:

```text
Open ticket
→ Create Payment Link
→ Choose Stripe or Dojo
→ Enter amount
→ Generate
→ Insert link into reply
```

Example:

```text
Payment request created: £50

Pay securely:
[Pay £50]
```

The customer should be able to pay without seeing internal staff information.

After payment:

```text
Ticket
Payment request
Customer
Invoice
```

should all show the updated status.

---

# 70. PAYMENT WEBHOOK SECURITY

Webhook endpoints do not use normal user authentication.

They must use provider-specific verification.

Flow:

```text
Webhook request
      ↓
verify signature/authenticity
      ↓
validate provider event
      ↓
deduplicate event
      ↓
resolve integration
      ↓
update payment state
      ↓
write audit event
      ↓
create notification
```

Never trust webhook payloads before verification.

Never process the same event multiple times.

---

# 71. PAYMENT RECONCILIATION

Do not depend entirely on webhooks.

Provide scheduled reconciliation.

Example:

```text
Payment created
↓
Webhook missing
↓
Reconciliation job checks provider
↓
Local database updated
```

Support:

```text
pending
paid
failed
cancelled
expired
refunded
unknown
```

---

# 72. EMAIL / SENDING

Design an email abstraction:

```text
EmailProvider
```

Support future providers.

When staff creates a payment link or support response:

```text
Copy link
Send email
Insert into support reply
```

Do not expose email credentials to the browser.

---

# 73. NOTIFICATIONS

Notification types:

```text
task assigned
task overdue
ticket assigned
ticket updated
customer replied
payment created
payment paid
payment failed
deployment failed
domain expiry
SSL expiry
security alert
incoming call
salary reminder
approval requested
approval completed
incident created
```

Start with:

```text
in-app notifications
```

Add email/push integrations through adapters.

---

# 74. REALTIME NOTIFICATION ARCHITECTURE

Durable notification:

```text
notifications table
```

Realtime delivery:

```text
Supabase Realtime Broadcast
```

Client receives live update and also has database-backed history.

Never make a realtime socket the only copy of an important notification.

---

# 75. DOMAIN MANAGEMENT

Track:

```text
domain
client
website
registrar
DNS provider
registration date
expiry date
auto-renew
nameservers
SSL
status
```

Track registrar and DNS provider separately.

Do not assume the registrar and DNS provider are the same company.

---

# 76. DNS SAFETY

DNS modifications must support:

```text
view current
edit
create
delete
preview change
confirm
audit
verify after change
```

High-risk records:

```text
NS
MX
CAA
```

must show a stronger warning.

Before applying a destructive change:

```text
current value
new value
affected domain
possible consequence
```

Show the user a diff.

---

# 77. DNS ROLLBACK / SNAPSHOT

Before significant DNS mutation:

```text
snapshot current record
```

Store sufficient metadata to restore the previous state.

Never claim instant rollback unless the provider/API actually supports it.

Provide a manual recovery path if automatic rollback is unavailable.

---

# 78. WEBSITE MANAGEMENT

Website:

```text
name
client
domain
production URL
staging URL
framework
repository
hosting
DNS
SSL
environment
status
```

Environments:

```text
development
staging
production
```

Deployment information:

```text
commit
branch
author
deployment ID
provider
status
started
completed
logs
```

---

# 79. DEPLOYMENT SAFETY

Production deployment should support:

```text
permission
review
optional approval
deployment trigger
status monitoring
health check
audit
rollback guidance
```

For high-risk projects:

```text
Developer requests deploy
→ Manager/Admin approval
→ Deploy
→ Health check
→ Completed
```

---

# 80. DEPLOYMENT HEALTH CHECK

After deployment:

```text
HTTP status
DNS resolution
SSL status
expected application response
provider deployment status
```

If the deployment fails:

```text
mark failed
capture safe diagnostics
notify authorized users
create incident if configured
```

Do not expose build secrets or environment values in logs.

---

# 81. GITHUB

Prefer:

```text
GitHub App / OAuth
```

where appropriate instead of long-lived personal access tokens.

Support:

```text
repositories
branches
commits
pull requests
repository metadata
deployment references
```

Scopes must follow least privilege.

---

# 82. VERCEL

Support:

```text
projects
deployments
domains
status
framework
repository
environment
logs where supported
deployment trigger
```

Never expose Vercel tokens in frontend code.

---

# 83. CLOUDFLARE

Support:

```text
zones
domains
DNS
nameservers
SSL
zone status
```

Use least-privilege API tokens.

Only staff with the correct permission can perform DNS changes.

---

# 84. CPANEL

Create a cPanel adapter.

Do not assume every cPanel host exposes identical functionality.

Test actual API availability.

Represent unsupported operations explicitly:

```text
Supported
Unsupported
Requires API access
Requires manual action
```

Never fake cPanel data.

---

# 85. INTEGRATION SYNC

For every provider:

```text
initial sync
incremental sync
manual sync
scheduled sync
failed sync
retry
reconciliation
```

Track:

```text
last_sync_at
last_success_at
last_failure_at
provider_cursor
status
```

---

# 86. MONITORING

Create a system health center.

Monitor:

```text
database
authentication
Realtime
queue
jobs
webhooks
Stripe
Dojo
GitHub
Vercel
Cloudflare
cPanel
email
TURN
```

Show:

```text
healthy
degraded
failed
unknown
```

---

# 87. INCIDENT MANAGEMENT

Create incidents.

Fields:

```text
incident number
title
severity
status
affected services
owner
started_at
resolved_at
description
timeline
root cause
resolution
follow-up tasks
```

Severity:

```text
SEV1
SEV2
SEV3
SEV4
```

Incident workflow:

```text
Detected
→ Investigating
→ Identified
→ Mitigating
→ Resolved
→ Postmortem
```

---

# 88. SECURITY CENTER

Security center must show:

```text
current user
MFA
recent logins
active sessions
recent security events
password/security status
suspicious activity where available
```

Admin security dashboard can show:

```text
failed login spikes
privilege changes
secret changes
integration failures
unusual access patterns
```

Do not invent "AI threat detection" without a real implementation.

---

# 89. RATE LIMITING

Protect:

```text
login
password reset
payment creation
payment webhooks
integration connection
secret operations
file upload
task automation
search
support messaging
```

Use server-side rate limiting.

Never depend on frontend rate limiting.

Do not use process-memory rate limiting as the only protection in a horizontally scaled production deployment.

---

# 90. INPUT VALIDATION

Validate with Zod or equivalent.

Validate:

```text
emails
URLs
domains
DNS
UUIDs
dates
amounts
currency
permissions
role identifiers
file metadata
query parameters
provider payloads
```

All server-side.

Client validation is only UX.

---

# 91. MONEY VALIDATION

Never represent financial values as JavaScript floating point calculations.

Use integer minor units or a decimal-safe strategy.

Example:

```text
£10.50
→ 1050 pence
```

Store:

```text
amount_minor
currency
```

Do not blindly use:

```text
10.50 * 100
```

without a safe numeric strategy.

---

# 92. AUDIT LOGGING

Audit all important actions.

Example:

```text
LOGIN
LOGOUT
STAFF_CREATED
STAFF_DEACTIVATED
ROLE_CHANGED
PERMISSION_CHANGED
SECRET_CREATED
SECRET_ROTATED
SECRET_DELETED
DNS_CHANGED
DOMAIN_CREATED
DOMAIN_DELETED
DEPLOYMENT_TRIGGERED
DEPLOYMENT_APPROVED
PAYMENT_CREATED
PAYMENT_PAID
PAYMENT_REFUNDED
SALARY_UPDATED
SALARY_MARKED_PAID
TICKET_ASSIGNED
CLIENT_UPDATED
INTEGRATION_CONNECTED
INTEGRATION_DISCONNECTED
```

Include:

```text
organization
user
action
resource
resource ID
timestamp
safe metadata
request/correlation ID
IP where legally appropriate
user agent where appropriate
```

Never put full secrets or payment details in audit metadata.

---

# 93. AUDIT LOG IMMUTABILITY

Normal users must never update/delete audit logs.

Prefer an append-only design.

If an administrative correction mechanism is ever needed:

```text
correction action
actor
reason
previous record
new record
```

must itself be audited.

---

# 94. PRIVACY

Use data minimization.

Do not collect unnecessary personal information.

Define:

```text
retention
archiving
deletion
export
```

for customer and employee records.

Keep private employee information separate from normal company information.

---

# 95. ACCESSIBILITY

Target:

```text
WCAG 2.2 AA principles
```

Support:

```text
keyboard
focus
screen readers
semantic HTML
accessible dialogs
labels
contrast
reduced motion
```

Do not rely on color alone.

---

# 96. UI DESIGN

The visual system is a first-class product requirement, not a final polish phase.

Use:

```text
Next.js
Tailwind CSS
shadcn/ui
Lucide
React Hook Form
Zod
CSS variables / semantic design tokens
```

Design requirements:

```text
dark mode
light mode
system theme detection
persistent theme preference
responsive desktop/tablet/mobile
clean enterprise SaaS UI
accessible contrast
keyboard accessibility
reduced-motion support
consistent spacing
consistent typography
professional tables
cards
forms
drawers
dialogs
tabs
filters
pagination
search
skeleton loaders
empty states
error states
confirmation dialogs
toasts
```

Dark and light themes must both be deliberately designed.

Do not merely invert the dark palette to create the light theme.

Use semantic tokens rather than hard-coded color values throughout the application.

The application should look polished from the first infrastructure module onward.

Do not build a crude UI first with the intention of redesigning it later.

Avoid unnecessary animation.

Prioritize speed, clarity and usability.

---

# 97. DASHBOARD NAVIGATION

During the initial releases, place the company's core infrastructure and payment workflows first.

Recommended final navigation:

```text
Dashboard

INFRASTRUCTURE
  Domains
  DNS
  Hosting
  Websites
  Deployments
  SSL
  Providers
  Integrations

FINANCE
  Payments
  Payment Links
  Invoices

WORKSPACE
  Clients
  Customer Portal
  Projects
  Tasks
  Support

TEAM
  Staff
  HR
  Salary
  Leave
  Expenses

COMMUNICATION
  Chat
  Calls
  Notifications

MANAGEMENT
  Reports
  Approvals
  Incidents

SECURITY
  Audit Logs
  Security Center
  Sessions

SYSTEM
  Settings
```

Only display authorized sections.

Do not display a future module as functional merely because its navigation label exists.

---

# 98. ROLE-SPECIFIC DASHBOARDS

Super Admin:

Everything.

Admin:

Operations + most management.

Manager:

Team, projects, tasks, support, reports, approvals.

Developer:

Assigned technical resources, deployments, tasks.

SEO/Marketing:

Assigned websites, domains, SEO tasks, analytics.

Support:

Customers, tickets, support tasks, payment request creation where authorized.

Finance:

Payments, invoices, salary/payroll, expenses.

HR:

Employee/HR records.

Viewer:

Read-only authorized resources.

Customer:

Own portal only.

---

# 99. ERROR HANDLING

Errors must be:

```text
safe
structured
user-friendly
logged server-side
correlated by request ID
```

Never display:

```text
stack trace
database URL
SQL query
API token
provider secret
internal filesystem path
```

Example:

```text
Unable to complete the deployment.
Deployment provider did not respond.
Retry
```

---

# 100. STRUCTURED LOGGING

Use structured logging:

```json
{
  "event": "deployment_failed",
  "organizationId": "...",
  "resourceId": "...",
  "requestId": "...",
  "provider": "vercel",
  "severity": "error"
}
```

Never log:

```text
password
access token
refresh token
secret
card data
encryption key
```

---

# 101. SECURITY HEADERS

Configure appropriate production headers.

At minimum evaluate:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
frame restrictions
```

Use environment-aware configuration.

Do not break:

```text
WebRTC
Stripe
Dojo
Supabase Realtime
OAuth
```

merely to make a CSP look secure.

Test the actual application.

Next.js supports configuring headers including CSP, HSTS, frame restrictions, permissions policy and related security headers through its current configuration mechanisms.

---

# 102. CSRF / REQUEST SECURITY

Do not implement destructive operations through GET.

Use:

```text
POST
PATCH
DELETE
```

appropriately.

Every mutation must:

```text
authenticate
authorize
validate
execute
audit
return sanitized result
```

Do not rely on frontend state.

---

# 103. FILE UPLOAD SECURITY

For uploaded files:

```text
validate MIME
validate extension
limit size
normalize filename
store outside public path
apply RLS
use signed URLs
```

Do not blindly trust the filename or MIME type.

Do not allow executable uploads unless there is an explicit audited requirement.

---

# 104. SEARCH SECURITY

Global search must never bypass authorization.

Search results must be produced from authorized datasets.

Do not:

```text
SELECT everything
filter in browser
```

Instead apply access rules before data reaches the client.

---

# 105. PERFORMANCE

Use:

```text
Server Components
pagination
indexes
selective queries
streaming where useful
cache where safe
debounced search
skeletons
lazy loading
```

Never load thousands of rows unnecessarily.

Do not cache user-sensitive data across users.

---

# 106. CACHE SECURITY

Every cache key containing sensitive or user-specific data must include appropriate identity/organization context.

Never allow:

```text
organization A cached result
→ organization B receives same result
```

Be conservative with caching until authorization correctness is proven.

---

# 107. API DESIGN

Use structured APIs.

Example:

```text
POST /api/integrations/vercel/test
POST /api/payments/create
POST /api/webhooks/stripe
POST /api/webhooks/dojo
POST /api/deployments/trigger
```

But prefer Server Actions for ordinary authenticated internal mutations where appropriate.

Use Route Handlers for:

```text
webhooks
external callbacks
special APIs
download endpoints
provider integrations
```

---

# 108. API RESPONSE RULE

Never return entire database records automatically.

Select only required fields.

Avoid:

```sql
SELECT *
```

in application queries.

Sensitive fields must require explicit server-side access.

---

# 109. WEBHOOK ARCHITECTURE

Create:

```text
app/api/webhooks/
  stripe/
  dojo/
  github/
  vercel/
  cloudflare/
```

Each:

```text
receive
verify
parse
deduplicate
persist raw-safe event metadata
process
audit
acknowledge
```

Never trust external input.

---

# 110. WEBHOOK RETRY

Webhook processing must support:

```text
received
verified
processing
succeeded
failed
retrying
dead_letter
```

Do not lose a valid provider event because a downstream operation temporarily failed.

---

# 111. BACKGROUND WORK

Use jobs for:

```text
domain expiry checks
SSL checks
provider sync
payment reconciliation
notification delivery
ticket SLA calculations
report generation
cleanup
search indexing
webhook retries
```

Do not assume a Vercel server request can run indefinitely.

---

# 112. CRON

Use scheduled jobs for recurring operations.

Examples:

```text
Every hour
  integration health

Every 6 hours
  domain expiry sync

Daily
  domain/SSL checks
  overdue tasks
  support SLA

Monthly
  payroll reminders
```

Do not create unnecessary high-frequency jobs.

---

# 113. BACKUP / DISASTER RECOVERY

Create:

```text
docs/DISASTER_RECOVERY.md
```

Define:

```text
RPO
RTO
backup frequency
retention
restore procedure
credential recovery
migration recovery
production rollback
```

Do not pretend an application export is a complete database backup.

Test restoration periodically.

---

# 114. DATABASE RECOVERY

Use:

```text
version-controlled migrations
safe exports
documented restore procedure
staging restore tests
```

Do not use destructive rollback migrations blindly in production.

For dangerous schema changes:

```text
backup
migration
verify
monitor
```

---

# 115. CI/CD

Create GitHub Actions.

At minimum:

```text
install
lint
typecheck
unit tests
integration tests
RLS/security tests
build
migration validation
secret scanning
dependency checks
```

E2E:

```text
Playwright
```

CI must fail when critical checks fail.

---

# 116. TESTING PYRAMID

Implement:

```text
unit tests
integration tests
database/RLS tests
API tests
provider adapter tests
webhook tests
E2E tests
production smoke tests
```

---

# 117. RLS TESTS

Explicitly test:

```text
User A cannot access User B
Organization A cannot access Organization B
Viewer cannot modify
Support cannot access secrets
Developer cannot access unrelated client
Customer cannot access staff resources
Customer cannot access another customer
Finance cannot modify infrastructure unless permitted
HR cannot modify payment infrastructure
```

Test database access directly.

Do not consider UI hiding to be an RLS test.

---

# 118. PAYMENT TESTS

Test:

```text
Stripe link creation
Stripe invalid credentials
Stripe webhook success
Stripe webhook duplicate
Stripe webhook forged
Stripe payment failure
Dojo link creation
Dojo webhook success
Dojo duplicate event
Dojo invalid event
Payment reconciliation
Staff without payment permission
```

---

# 119. SECURITY TESTS

Before production verify:

```text
Can unauthenticated users access dashboard?
Can users alter organization IDs?
Can users alter resource IDs?
Can Viewer mutate data?
Can Support access secrets?
Can staff access another customer's data?
Can customer access staff chat?
Can a forged webhook change payment status?
Can a user trigger a deployment without permission?
Can a user reveal a secret?
Can salary data appear in general API responses?
Can audit logs be modified?
Can rate limits be bypassed?
Are secrets present in browser bundles?
Are secrets present in logs?
Are secrets committed to Git?
```

---

# 120. THREAT MODEL

Document:

```text
Account takeover
Session theft
Privilege escalation
Cross-tenant access
IDOR
XSS
CSRF
SQL injection
Webhook forgery
Replay attacks
Secret leakage
Provider token theft
DNS mistakes
Payment manipulation
Payroll manipulation
File upload attacks
Realtime channel abuse
WebRTC signaling abuse
Brute force
Data exfiltration
Insider abuse
```

For each:

```text
Threat
Impact
Likelihood
Mitigation
Test
Residual risk
```

---

# 121. COMPANY AUDITABILITY

Every important resource should have an activity timeline.

Example:

```text
Today 14:31
Arif changed DNS

Today 12:05
Sarah updated customer

Yesterday 18:22
Deployment completed

Yesterday 17:55
Developer requested approval
```

Only show events the viewer may see.

---

# 122. CUSTOMER TIMELINE

Customer profile should show:

```text
tickets
payments
tasks
projects
website changes
communications
invoices
```

Never expose internal security details.

---

# 123. STAFF TIMELINE

Authorized management can see:

```text
tasks
projects
approvals
leave
expenses
salary
performance/work reports
```

Sensitive information remains permission protected.

---

# 124. PAYMENT / CUSTOMER RECORD

Payment requests should link:

```text
organization
customer
invoice
support ticket
project
staff creator
provider
provider reference
amount
currency
status
created_at
paid_at
```

This produces an auditable chain:

```text
Customer
→ Ticket
→ Payment Request
→ Provider
→ Payment
→ Invoice
```

---

# 125. REPORTING

Create reports for:

```text
task completion
support performance
customer activity
payment activity
domain expiry
deployments
integration health
salary status
expenses
staff workload
incidents
```

Provide CSV export where authorized.

Do not expose sensitive information during export.

---

# 126. GLOBAL AUDIT / EXPORT SECURITY

Exporting data is itself a sensitive operation.

Log:

```text
who exported
what data
scope
time
format
```

Apply permissions before generating export.

---

# 127. CUSTOMER COMMUNICATION

Support:

```text
internal ticket conversation
customer-visible conversation
payment link insertion
task linkage
attachments
status updates
```

Do not mix:

```text
internal staff conversation
customer conversation
```

into the same permission channel.

---

# 128. CHAT ATTACHMENTS

Chat attachments should use:

```text
Storage
RLS
signed URLs
file limits
safe content types
audit metadata
```

No permanent public links for private company chat.

---

# 129. CUSTOMER PORTAL PAYMENT

Customer portal should show:

```text
Outstanding payment
Pay now
Payment status
Payment history
Invoice reference
```

The customer should not be able to create arbitrary payment requests for another customer.

---

# 130. SETTINGS

System settings should include:

```text
organization
branding
timezone
currency
notifications
support
payments
security
integrations
permissions
approval policies
retention
```

Do not put secrets into ordinary public settings rows.

---

# 131. TIMEZONE

Store server timestamps in UTC.

Display dates according to:

```text
organization timezone
user preference
```

unless a domain requires another timezone.

Never mix server-local time and browser-local time carelessly.

---

# 132. CURRENCY

Support ISO currency codes.

Store:

```text
currency
amount_minor
```

Do not assume every company operates only in GBP.

---

# 133. SOFT DELETE

For important business records consider:

```text
archived_at
archived_by
```

rather than physical deletion.

Permanent deletion should be reserved for resources where it is truly appropriate.

---

# 134. DANGEROUS DELETION

For:

```text
organization
website
domain
DNS record
integration
secret
staff
payment
```

require:

```text
permission
confirmation
audit
```

For critical operations:

```text
Type DELETE
```

or equivalent explicit confirmation.

---

# 135. STAFF OFFBOARDING

Create a formal workflow:

```text
Deactivate account
→ Revoke sessions
→ Review integrations
→ Reassign tasks
→ Reassign customers
→ Reassign projects
→ Review secrets
→ Review approvals
→ Preserve audit records
→ Finalize
```

Management dashboard should provide an offboarding checklist.

---

# 136. CUSTOMER OFFBOARDING

Support:

```text
archive customer
archive customer portal
preserve invoices
preserve payments
preserve support history
preserve audit history
```

Do not silently delete financial records merely because the customer becomes inactive.

---

# 137. SECURITY INCIDENT RESPONSE

Create:

```text
docs/INCIDENT_RESPONSE.md
```

Include scenarios:

```text
API key leaked
GitHub token leaked
Vercel token compromised
Cloudflare token compromised
Staff account compromised
Customer account compromised
Payment webhook compromise
DNS compromise
Database credential leak
Encryption key compromise
```

Each must include:

```text
contain
revoke
rotate
investigate
restore
notify
document
```

---

# 138. PROVIDER CREDENTIAL ROTATION

Every integration should eventually support:

```text
rotate
test
activate
revoke old
audit
```

Do not delete old credentials before validating the replacement when safe.

---

# 139. SEPARATION OF DUTIES

Support optional rules such as:

```text
Developer creates deployment
Manager approves
Developer deploys
```

or:

```text
Finance creates salary batch
Manager approves
Finance marks paid
```

Do not make every organization use approval complexity.

Make it configurable.

---

# 140. PRODUCTION DEPLOYMENT ARCHITECTURE

Recommended:

```text
GitHub
   ↓
CI
   ↓
Staging
   ↓
Automated tests
   ↓
Approval
   ↓
Production
   ↓
Smoke tests
   ↓
Monitoring
```

Use Vercel or another compatible Next.js platform.

---

# 141. STAGING

Staging must use:

```text
separate environment variables
test payment credentials
test integrations
non-production data
```

Never mix:

```text
Stripe live
Dojo live
production Supabase
```

with staging.

---

# 142. PRODUCTION SECRETS

Store production secrets only in:

```text
production environment secret storage
```

Never:

```text
Git
README
`.env` committed
chat
client code
screenshots
logs
```

---

# 143. PRODUCTION LAUNCH CHECKLIST

Before launch:

```text
Domain configured
HTTPS active
HSTS verified
Supabase production configured
Auth URLs correct
MFA tested
RLS tested
RBAC tested
Webhooks tested
Stripe live credentials configured
Dojo live credentials configured
Provider connections tested
Environment variables verified
No test credentials
No demo users
No fake data
Database migrations applied
Backups verified
Monitoring active
Error handling tested
Rate limiting active
Security headers tested
E2E tests pass
Build passes
Rollback plan documented
```

---

# 144. POST-DEPLOYMENT

After production deployment:

```text
login test
MFA test
database test
dashboard test
staff test
customer test
support test
payment test
webhook test
deployment test
chat test
WebRTC test
notification test
security test
```

Monitor:

```text
errors
latency
webhooks
queue
database
authentication
provider failures
```

---

# 145. FOLDER STRUCTURE

Prefer feature-oriented architecture similar to:

```text
app/
├── (auth)/
│   ├── login/
│   ├── forgot-password/
│   ├── reset-password/
│   └── mfa/
│
├── (dashboard)/
│   ├── dashboard/
│   ├── clients/
│   ├── websites/
│   ├── domains/
│   ├── dns/
│   ├── hosting/
│   ├── deployments/
│   ├── projects/
│   ├── tasks/
│   ├── support/
│   ├── chat/
│   ├── calls/
│   ├── staff/
│   ├── hr/
│   ├── salary/
│   ├── expenses/
│   ├── invoices/
│   ├── payments/
│   ├── reports/
│   ├── approvals/
│   ├── incidents/
│   ├── integrations/
│   ├── audit-logs/
│   ├── security/
│   └── settings/
│
├── portal/
│   ├── dashboard/
│   ├── tickets/
│   ├── payments/
│   ├── invoices/
│   ├── websites/
│   └── profile/
│
├── api/
│   ├── webhooks/
│   │   ├── stripe/
│   │   ├── dojo/
│   │   ├── github/
│   │   ├── vercel/
│   │   └── cloudflare/
│   └── ...
│
├── error.tsx
├── not-found.tsx
├── loading.tsx
└── global-error.tsx
```

Then:

```text
components/
├── ui/
├── layout/
├── dashboard/
├── auth/
├── clients/
├── websites/
├── domains/
├── tasks/
├── support/
├── chat/
├── calls/
├── staff/
├── hr/
├── salary/
├── payments/
└── reports/
```

And:

```text
lib/
├── auth/
├── rbac/
├── security/
├── crypto/
├── validation/
├── audit/
├── db/
├── jobs/
├── notifications/
├── storage/
├── realtime/
├── webrtc/
├── payments/
├── email/
├── monitoring/
└── providers/
    ├── github/
    ├── vercel/
    ├── cloudflare/
    ├── cpanel/
    ├── registrar/
    ├── dns/
    ├── stripe/
    └── dojo/
```

Database:

```text
supabase/
├── migrations/
├── seed.sql
├── functions/
│   ├── webhooks/
│   ├── workers/
│   └── jobs/
└── config.toml
```

Tests:

```text
tests/
├── unit/
├── integration/
├── security/
├── rls/
├── payments/
├── webhooks/
└── e2e/
```

Documentation:

```text
docs/
├── architecture/
├── security/
├── deployment/
├── integrations/
├── operations/
└── ai/
```

---

# 146. CORE LIBRARY FILES

Create clear modules such as:

```text
lib/auth/session.ts
lib/auth/require-auth.ts

lib/rbac/permissions.ts
lib/rbac/authorize.ts

lib/security/rate-limit.ts
lib/security/redaction.ts
lib/security/step-up.ts
lib/security/security-events.ts

lib/crypto/encrypt.ts
lib/crypto/decrypt.ts

lib/audit/write-audit-event.ts

lib/payments/payment-provider.ts
lib/payments/payment-service.ts

lib/realtime/channel-auth.ts

lib/webrtc/signaling.ts

lib/jobs/queue.ts
lib/jobs/job-runner.ts
lib/jobs/retry.ts

lib/providers/github/*
lib/providers/vercel/*
lib/providers/cloudflare/*
lib/providers/cpanel/*
lib/providers/stripe/*
lib/providers/dojo/*
```

Names may be adapted to the final architecture.

Do not create unnecessary abstraction layers merely to satisfy this list.

---

# 147. SERVER / CLIENT BOUNDARY

Prefer Server Components.

Use Client Components only when required for:

```text
forms
interactive tables
chat
Realtime
WebRTC
browser APIs
animations
```

Never import:

```text
secret handling
server credentials
database admin clients
payment server SDK credentials
```

into client modules.

---

# 148. ADMIN CLIENT

If an elevated Supabase client is necessary:

```text
server-only
```

only.

Centralize it.

Before using it:

```text
authenticate
authorize
validate
```

The fact that a server uses an elevated key does not eliminate application-level authorization.

---

# 149. DATABASE FUNCTIONS

Use SQL functions selectively.

Potential candidates:

```text
membership checks
permission checks
atomic counters
safe status transitions
audit insertion
```

Do not put the entire business layer in random SQL functions.

Keep complex provider logic in TypeScript.

---

# 150. TRANSACTIONAL STATUS CHANGES

Important status transitions should be validated.

For example:

```text
Task:
Todo → In Progress
In Progress → Completed

Payment:
Pending → Paid
Pending → Failed
Paid → Refunded

Ticket:
New → Open
Open → Pending
Pending → Resolved
```

Reject invalid transitions.

---

# 151. SECURITY STATUS TRANSITIONS

Examples:

```text
integration:
Disconnected → Connecting → Connected

secret:
Active → Rotating → Active
Active → Revoked

deployment:
Requested → Approved → Running → Succeeded/Failed
```

Represent state intentionally.

---

# 152. DATA ACCESS PATTERNS

Avoid scattered raw queries.

Prefer repository/service functions where business rules are needed.

Example:

```text
taskService.assignTask()
paymentService.createPaymentRequest()
deploymentService.requestDeployment()
salaryService.markPaid()
supportService.assignTicket()
```

These functions should perform:

```text
validation
authorization
business rules
transaction
audit
```

where appropriate.

---

# 153. CUSTOMER DATA ACCESS

Customer-facing endpoints must use a separate authorization strategy.

Example:

```text
customer can read own ticket
customer cannot read ticket by another customer's ID
```

Never assume customer IDs are secret.

---

# 154. INTERNAL DATA ACCESS

Staff access must respect:

```text
organization
role
permission
assignment
resource ownership
```

A Developer assigned to Website A should not automatically receive every website in the company.

---

# 155. RESOURCE ASSIGNMENTS

Create explicit relationships:

```text
staff ↔ client
staff ↔ website
staff ↔ project
staff ↔ task
staff ↔ support queue
```

Do not encode assignments as magic strings or JSON blobs.

---

# 156. MANAGERIAL OPERATIONS

Management needs:

```text
team workload
task assignment
task reassignment
approval
support escalation
incident management
salary tracking
expense approval
reports
announcements
performance overview
```

Avoid building a fake HR "performance score".

Use measurable operational data.

---

# 157. SEARCH / REPORT PRIVACY

Management reports should not accidentally aggregate sensitive data from organizations/staff that the requester cannot access.

Every report query must have authorization.

---

# 158. OBSERVABILITY CORRELATION

Every significant request should have:

```text
request_id
organization_id
user_id where available
```

Provider jobs should also have:

```text
job_id
provider
resource_id
```

This makes debugging production failures possible.

---

# 159. SUPPORT + INCIDENT CONNECTION

A support ticket should be able to link to:

```text
incident
website
deployment
task
domain
hosting
payment
```

Example:

```text
10 customers report site outage
→ incident created
→ support tickets linked
→ developer task created
→ incident resolved
→ customer communication sent
```

---

# 160. WEBSITE HEALTH

Add checks:

```text
HTTP availability
SSL
domain expiry
DNS correctness
provider status
latest deployment
```

Health should display:

```text
Healthy
Warning
Critical
Unknown
```

"Unknown" is preferable to fabricated health.

---

# 161. EXPIRY MANAGEMENT

Automated jobs should detect:

```text
domain expiry
SSL expiry
provider subscription renewal
integration token expiry
```

Generate notifications at configurable thresholds.

---

# 162. PROVIDER FAILURE BEHAVIOR

If:

```text
Vercel unavailable
Cloudflare unavailable
Stripe unavailable
Dojo unavailable
GitHub unavailable
```

the platform should:

```text
preserve local state
show degraded status
not duplicate requests
retry safe operations
create diagnostics
allow manual reconciliation
```

Do not blindly retry destructive operations.

---

# 163. PARTIAL FAILURE

Example:

```text
DNS provider accepted request
client timed out
```

The system must not assume failure.

Mark:

```text
unknown / reconciliation required
```

then verify provider state.

This rule applies to:

```text
payments
DNS
deployments
hosting
domain changes
```

---

# 164. PAYMENT SAFETY

Never show:

```text
Paid
```

merely because a payment link was created.

States must distinguish:

```text
Created
Pending
Paid
Failed
Expired
Cancelled
Refunded
Unknown
```

---

# 165. FAKE DATA POLICY

Production must never show:

```text
fake deployment
fake Stripe payment
fake Dojo payment
fake DNS
fake staff
fake domain expiry
fake uptime
```

unless clearly labelled as manually entered company data.

---

# 166. DEMO DATA

Development seed data should be obviously fake:

```text
Demo Company
Demo Customer
Demo Website
Demo User
```

Never put real API credentials in seed data.

Never seed real customer information.

---

# 167. DOCUMENTATION REQUIRED

Maintain:

```text
README.md
SECURITY.md
ARCHITECTURE.md
DATABASE.md
DEPLOYMENT.md
INTEGRATIONS.md
DISASTER_RECOVERY.md
INCIDENT_RESPONSE.md
```

Also:

```text
docs/ai/*
```

for Claude development context.

---

# 168. ARCHITECTURE DOCUMENT

`ARCHITECTURE.md` must explain:

```text
frontend
server layer
Supabase
RLS
RBAC
provider layer
payments
Realtime
WebRTC
jobs
webhooks
storage
monitoring
deployment
```

---

# 169. SECURITY DOCUMENT

`SECURITY.md` must explain:

```text
authentication
MFA
RBAC
RLS
tenant isolation
secret management
rate limiting
audit logs
webhooks
payment security
WebRTC security
file security
incident response
credential rotation
```

---

# 170. INTEGRATIONS DOCUMENT

For each provider:

```text
purpose
required account
required permissions
environment variables
connection flow
webhook setup
security
failure behavior
reconciliation
limitations
pricing dependency
```

Do not claim an integration is free if the provider requires a paid service.

---

# 171. COST MATRIX

Create:

```text
docs/COST_MATRIX.md
```

For every external service record:

```text
service
purpose
free tier
paid dependency
production limitation
what happens if unavailable
alternative
```

The architecture should be free/low-cost wherever realistically possible.

But:

```text
security > free price
reliability > free price
```

---

# 172. POSSIBLE EXTERNAL REQUIREMENTS

Claude must explicitly identify when production requires an external service/account such as:

```text
GitHub account
Supabase
Vercel
Cloudflare
Domain registrar
Stripe merchant account
Dojo merchant account
Email provider
TURN server/provider
```

Do not pretend these can all be eliminated.

---

# 173. MANDATORY PRE-CODING RESEARCH

Before integrating any third-party service:

Read its current official documentation.

At minimum:

```text
Next.js
Supabase Auth
Supabase SSR
Supabase RLS
Supabase Realtime
Supabase Storage
Supabase queues/jobs
GitHub
Vercel
Cloudflare
Stripe
Dojo
WebRTC
TURN/coturn
```

Do not rely on old tutorials when official documentation is available.

Do not blindly use deprecated APIs.

---

# 173A. THIRD-PARTY DEPENDENCY CONTROL

Before installing a new dependency, SDK, package, SaaS service, or infrastructure component, document:

```text
Purpose
Why existing project capabilities are insufficient
Security implications
Free-tier availability
Production limitations
Operational dependency
Vendor lock-in risk
Alternative options
```

Prefer the existing framework, Supabase and platform capabilities where they are sufficient.

Do not add dependencies merely because they make a small task more convenient.

Do not introduce a paid service without documenting why it is required.

---

# 173B. HIGH-RISK OPERATION MATRIX

Maintain a centralized authorization matrix for high-risk actions.

At minimum review:

```text
Change role                → permission + step-up
Change permissions         → permission + step-up
Reveal secret              → permission + step-up + audit
Change nameservers         → DNS permission + step-up + confirmation
Production deployment      → deploy permission + optional approval
Delete domain              → delete permission + step-up + confirmation
Refund payment             → refund permission + step-up + optional approval
Modify salary              → salary permission + step-up + approval where configured
Mark salary paid           → salary permission + audit
Change payment config      → finance/security permission + step-up
Delete organization        → admin permission + step-up + approval
```

Do not scatter high-risk rules across UI components.

Enforce them in the server/application layer and, where appropriate, at the database level.

---

# 173C. FINANCIAL MODULE BOUNDARY

The salary, expense and payment features are operational financial-record systems.

Do not invent jurisdiction-specific legal/tax/payroll calculations.

Store verified financial facts and configurable company-defined values.

Any country-specific tax, pension, VAT, statutory deduction, employment-law or payroll calculation must be treated as a separate approved module with its own specification, tests and legal review.

Never represent an operational salary record as legal payroll compliance merely because it contains an amount.

---

# 173D. WEBRTC V1 SCOPE

Keep the first WebRTC release intentionally small:

```text
1-to-1 audio
1-to-1 video
Mute
Camera on/off
Screen sharing
Incoming call
Reject
Hang up
Connection status
Call history
TURN support
```

Do not attempt to build a full Zoom/Teams replacement in the first release.

Group calls must use an SFU-oriented provider architecture rather than naive full-mesh peer connections.

---

# 174. CLAUDE CODE WORKFLOW

Start architecture work in plan mode where appropriate.

After planning:

```text
inspect
edit
test
review
document
commit
```

Use Claude's project memory rather than repeatedly restating requirements.

Use existing project scripts.

Do not bypass permissions globally just to speed up coding.

Do not use dangerous permission-bypass modes for production credentials or production databases.

---

# 175. MCP / TOOLING

Use MCP integrations only when they materially improve the work.

Possible useful integrations:

```text
GitHub
Supabase
Vercel
Cloudflare
```

Use least privilege.

Do not give an AI tool unrestricted production credentials merely because an integration supports them.

For GitHub:

```text
read repository
branches
pull requests
issues
```

before granting destructive administration permissions.

---

# 176. CLAUDE SESSION START TEMPLATE

At the start of each session Claude should internally follow:

```text
1. Read CLAUDE.md
2. Read CURRENT_TASK.md
3. Read latest SESSION_LOG
4. Check git status
5. Inspect only relevant files
6. Confirm current architecture
7. Implement only current task
```

Do not scan the entire codebase unless necessary.

---

# 177. CLAUDE SESSION END TEMPLATE

At the end of every session:

```text
Implementation:
...

Files changed:
...

Database changes:
...

Tests:
...

Security checks:
...

Known issues:
...

Remaining:
...

Next task:
...

Documentation updated:
...
```

Then update:

```text
CURRENT_TASK.md
SESSION_LOG.md
ROADMAP.md
KNOWN_ISSUES.md
```

---

# 178. GIT WORKFLOW

Use small meaningful commits.

Examples:

```text
feat(auth): add Supabase SSR authentication
feat(rbac): add permission engine
feat(tasks): add assignment workflow
feat(payments): add Stripe provider
feat(payments): add Dojo provider
fix(rls): prevent cross-tenant access
test(security): add salary authorization tests
```

Do not create enormous 5,000-line commits if smaller logical commits are possible.

---

# 179. BRANCHING

Recommended:

```text
main
staging
feature/*
fix/*
```

Production deploys from:

```text
main
```

Staging from:

```text
staging
```

Do not deploy experimental code directly to production.

---

# 180. DATABASE MIGRATION WORKFLOW

For every schema change:

```text
create migration
→ run locally
→ reset local database
→ seed
→ run tests
→ inspect SQL
→ staging
→ verify
→ production
```

Never manually patch production tables as the normal workflow.

---

# 181. RELEASE STRATEGY

Every feature has:

```text
implementation
tests
security review
documentation
migration
release note
```

Critical features additionally require:

```text
staging verification
approval
rollback plan
```

---

# 182. PRODUCTION READINESS SCORE

Create:

```text
docs/ai/PRODUCTION_READINESS.md
```

Categories:

```text
Authentication
Authorization
RLS
Secrets
Payments
Webhooks
Realtime
WebRTC
Database
Backups
Monitoring
Testing
Performance
Accessibility
Privacy
Deployment
Disaster Recovery
Documentation
```

Each:

```text
Not Started
In Progress
Verified
Production Ready
```

Do not mark "Production Ready" merely because code exists.

---

# 183. ACCEPTANCE CRITERIA

The platform is not complete until:

```text
Application runs locally
Application builds
Lint passes
TypeScript passes
Tests pass
E2E passes
Authentication works
MFA works
RBAC works
RLS works
Organizations are isolated
Staff management works
Client management works
Customer portal works
Projects work
Tasks work
Task assignment works
Task reporting works
Support works
Staff chat works
WebRTC works at supported scope
Salary tracking works
Approval workflows work
Payments work
Stripe works where configured
Dojo works where configured
Payment webhooks work
Payment reconciliation works
GitHub works where configured
Vercel works where configured
Cloudflare works where configured
DNS safety works
Deployment system works
Notifications work
Audit logs work
Security center works
Monitoring works
Backup/recovery is documented and tested
CI works
Production deployment works
No credentials are committed
No secrets reach browser
No fake production data exists
No fake integrations exist
```

---

# 184. REQUIRED FINAL SECURITY AUDIT

Before final release perform a deliberate security review.

Attempt to break:

```text
Authentication
RBAC
RLS
tenant isolation
IDOR
webhook verification
payment authorization
payment replay
secret exposure
file access
chat access
WebRTC signaling
salary access
customer portal
deployment permissions
DNS permissions
audit immutability
rate limiting
```

Do not merely state:

```text
Security looks good.
```

Provide evidence.

---

# 185. FINAL OUTPUT FROM CLAUDE

At the end provide:

```text
1. Architecture summary
2. Folder structure
3. Database schema
4. RLS policy summary
5. RBAC matrix
6. Staff workflow
7. Customer support workflow
8. Chat architecture
9. WebRTC architecture
10. Salary/payroll architecture
11. Payment architecture
12. Stripe setup
13. Dojo setup
14. Webhook architecture
15. Background jobs
16. Environment variables
17. Supabase setup
18. Local development
19. Staging deployment
20. Production deployment
21. Backup/recovery
22. Security checklist
23. Testing checklist
24. Monitoring
25. Cost matrix
26. Known limitations
27. External dependencies
28. Future improvements
```

Never report a placeholder as complete.

---

# 186. IMPORTANT "DO NOT" RULES

Never:

```text
put secret keys in client code
put credentials in Git
use NEXT_PUBLIC_ for secrets
trust frontend permissions
disable RLS to fix queries
use plaintext credentials
store card data
trust unverified webhooks
use fake payment records
use fake provider status
use fake deployments
use arbitrary user-supplied organization IDs
return SELECT *
from sensitive tables
use fire-and-forget for critical work
assume Vercel functions are permanent workers
assume WebRTC works without TURN everywhere
pretend raw P2P scales to large conferences
mix customer chat and staff chat permissions
expose salary data to normal staff
allow customers to access internal notes
allow staff to approve their own restricted operations
silently switch payment providers
delete audit history
skip migration files
modify production DB manually as the normal workflow
commit demo secrets
claim security without testing it
```

---

# 187. CRITICAL RULE FOR MISSING INFORMATION

If an external integration cannot be configured because credentials are unavailable:

DO NOT stop the entire project.

Instead:

```text
implement the provider interface
implement local/mock test adapter
implement the UI states
implement authorization
implement database models
implement error states
document the missing credential
mark integration as "Not Connected"
```

Then continue.

However:

Do not call the integration "working" until a real provider test succeeds.

---

# 188. FEATURE STATUS MODEL

Every major feature should have a true status:

```text
NOT_STARTED
IN_PROGRESS
IMPLEMENTED
TESTED
CONNECTED
PRODUCTION_READY
BLOCKED
DEGRADED
UNSUPPORTED
```

This status must be based on evidence.

---

# 189. NO FAKE SUCCESS

Bad:

```text
Payment successful
```

when only a payment link was created.

Bad:

```text
Vercel connected
```

when only a token is stored.

Bad:

```text
Deployment successful
```

when only a local DB record was created.

Good:

```text
Payment link created
Waiting for provider confirmation
```

Good:

```text
Vercel credentials saved but connection test failed
```

Good:

```text
Deployment requested; provider status unknown
```

---

# 190. MOST IMPORTANT ARCHITECTURAL RULE

Build the platform so that:

```text
authorization
+
business logic
+
audit
+
validation
+
provider calls
```

are never duplicated inconsistently throughout UI components.

The frontend should primarily orchestrate user interaction.

The server/application layer should enforce the rules.

The database should enforce tenant isolation and authorization through RLS.

---

# 191. FINAL DEVELOPMENT METHOD

Work vertically.

For example, do not build:

```text
50 UI pages
```

before authentication works.

Instead:

```text
Authentication
→ authorization
→ database
→ server action
→ UI
→ tests
→ audit
```

Then complete the next vertical slice.

Every major feature should exist end-to-end before moving on.

---

# 192. FIRST EXECUTION INSTRUCTION

When this prompt is supplied to Claude Code:

DO NOT start building all features.

Do not jump directly to Domain/Hosting/Payments implementation before the architecture audit is complete.

The first business features after foundation are Domain → DNS → Hosting → Website → Payments → Stripe → Dojo.

First:

```text
1. Inspect repository
2. Inspect existing architecture
3. Inspect package versions
4. Inspect Supabase setup
5. Inspect Git status
6. Run current tests/build
7. Identify existing functionality
8. Create docs/ai/
9. Create/update CLAUDE.md
10. Build the architecture plan
11. Build database domain map
12. Build security threat model
13. Build implementation roadmap
14. Build dependency/account prerequisite list
15. Report findings
```

Then stop after the architecture audit.

Do not begin Day 1 until the architecture documents exist.

---

# 193. SECOND EXECUTION INSTRUCTION

For each subsequent day:

Read:

```text
CLAUDE.md
docs/ai/CURRENT_TASK.md
docs/ai/ROADMAP.md
docs/ai/PROJECT_CONTEXT.md
```

Read only relevant sections of:

```text
docs/ai/MASTER_SPEC.md
docs/ai/DATA_MODEL.md
docs/ai/SECURITY_BASELINE.md
```

Then implement only that day's scoped work.

---

# 194. THIRD EXECUTION INSTRUCTION

Every implementation day must finish with:

```text
npm/package-manager lint
npm/package-manager typecheck
relevant unit tests
relevant integration tests
database/RLS tests if database changed
build if application structure changed
```

Use the project's actual scripts.

Do not claim success without running the relevant checks.

---

# 195. FINAL PRINCIPLE

The goal is NOT:

```text
maximum number of features
```

The goal is:

```text
maximum number of genuinely working,
secure,
auditable,
maintainable,
production-usable features.
```

A smaller platform that is correctly secured and tested is better than a large application containing fake integrations and insecure shortcuts.

Build it as a serious company operating system.

Prioritize the infrastructure-management workflow first, then payments, then company operations.

Preserve the existing good architecture.

Extend it carefully.

Keep the system modular.

Keep the code understandable.

Keep security at the center.

Keep production deployment in mind from the first migration.

Keep Claude's persistent context updated so future sessions do not waste tokens rediscovering the architecture.

Never trade correctness for speed.