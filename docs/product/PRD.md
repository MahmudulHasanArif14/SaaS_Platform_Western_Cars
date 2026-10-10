# PRD — Product Requirements Document

| Field | Value |
|---|---|
| Product | Company Infrastructure & Operations Platform |
| Version | 0.1 (PROPOSED) |
| Status | Draft — requirements only; nothing here is implemented |
| Related | `MASTER_SPEC.md` (full scope), `TRD.md`, `APP_FLOW.md`, `ROADMAP.md` |

---

## 1. Problem

The company manages domains, DNS, hosting, deployments, payment links, customers, staff tasks,
support and salaries across a dozen separate dashboards (registrar, Cloudflare, Vercel, cPanel,
GitHub, Stripe, Dojo, spreadsheets, chat apps). This causes:

- Missed domain/SSL renewals and accidental DNS breakage with no audit trail.
- No single view of which client owns which website, domain, host and repo.
- Payment links created ad hoc with no link to the ticket/customer/invoice.
- Tasks assigned in chat with no status, report or accountability.
- Salary paid/unpaid tracked in spreadsheets with uncontrolled access.
- Ex-employees retaining access to provider accounts.

## 2. Vision

One secure, permission-aware dashboard where authorized staff can see and safely operate the
company's infrastructure, money flows and work — with every sensitive action authorized, audited
and recoverable.

## 3. Goals and non-goals

### Goals (V1 → V3)
1. **G1** Infrastructure inventory and safe operations (domains, DNS, hosting, websites, deployments).
2. **G2** Payment requests via Stripe or Dojo, tied to customer/ticket/invoice, confirmed by webhook.
3. **G3** Work management: tasks, projects, assignment, reports, approvals.
4. **G4** Customer support with a restricted customer portal.
5. **G5** Internal chat and 1-to-1 audio/video calls.
6. **G6** Restricted HR/salary record-keeping (paid/unpaid, period, amount, who recorded it).

### Non-goals (explicit)
- Not a payroll/tax engine (no statutory calculations).
- Not a registrar or hosting provider (that is the future AI Website Builder, P9).
- No group video conferencing in V1 (1-to-1 only).
- No storing card data, no custom payment forms (hosted provider pages only).
- No microservices; no "AI threat detection" claims.

## 4. Users and personas

| Persona | Primary jobs | Must never |
|---|---|---|
| Owner / Super Admin | Configure org, roles, integrations; see everything allowed by policy | Bypass audit |
| Admin | Run operations, manage staff and providers | Read salary unless granted |
| Manager | Assign/review tasks, approve, see workload, escalations | Approve own request |
| Infrastructure operator / Developer | Domains, DNS, hosting, deployments for assigned resources | Touch unassigned clients' infra |
| Support agent | Tickets, replies, create payment links (if permitted) | See secrets or salary |
| Finance | Payments, refunds, invoices, salary paid status | Change DNS/deploy |
| HR | Employee records, leave, salary records | Manage payment providers |
| Viewer | Read-only on granted resources | Mutate anything |
| Customer (portal) | Own tickets, invoices, payments, websites | See internal notes or other customers |

## 5. Release scope

| Release | Contents | Gate |
|---|---|---|
| **R0 Foundation** | Auth + MFA, orgs, RBAC, RLS, audit, app shell (light/dark), env validation, CI | Security tests pass |
| **R1 Infrastructure MVP** | Clients (minimal), domains, DNS (preview/confirm/verify), hosting accounts, websites, environments, deployment records, expiry alerts | Domain/DNS security tests pass |
| **R2 Payments MVP** | Payment requests, Stripe Checkout, Dojo payment links, webhooks, reconciliation, invoices | Webhook forgery/replay tests pass |
| **R3 Operations** | CRM, projects, tasks, reports, approvals, support, customer portal | Customer isolation tests pass |
| **R4 Team** | Staff mgmt + offboarding, chat, presence, WebRTC 1-to-1, HR, salary, expenses, leave | Salary/chat authorization tests pass |
| **R5 Production** | Provider sync (GitHub/Vercel/Cloudflare/cPanel), monitoring, incidents, reports, backup/restore test | Full release gate in `PRODUCTION_READINESS.md` |

## 6. Functional requirements

Priority: **M** must, **S** should, **C** could. Each FR is `PROPOSED` until verified.

### 6.1 Identity & access
| ID | Requirement | P |
|---|---|---|
| FR-001 | Users sign in with email/password; email verification and password reset | M |
| FR-002 | TOTP MFA enrollment; MFA required for roles flagged sensitive | M |
| FR-003 | Step-up (fresh MFA) before high-risk actions (see TRD §7) | M |
| FR-004 | A user may belong to several organizations and switch between them | M |
| FR-005 | Roles are bundles of atomic permissions; orgs may create custom roles | M |
| FR-006 | Admin can invite, suspend, deactivate staff and revoke all sessions | M |
| FR-007 | Offboarding checklist: revoke sessions, reassign tasks/clients, review credentials | S |

### 6.2 Infrastructure
| ID | Requirement | P |
|---|---|---|
| FR-020 | Record domains with registrar, DNS provider, expiry, auto-renew, client, website | M |
| FR-021 | Alerts at configurable thresholds before domain/SSL expiry | M |
| FR-022 | List DNS records from the connected DNS provider | M |
| FR-023 | Create/update/delete DNS records with diff preview, confirmation, provider read-back verification | M |
| FR-024 | Extra warning + step-up for NS, MX, CAA, SPF/DKIM/DMARC TXT changes | M |
| FR-025 | Snapshot zone before significant change; show manual restore path | S |
| FR-026 | Hosting accounts per provider; websites with environments (dev/staging/prod) | M |
| FR-027 | Deployment history (commit, branch, author, status) from provider | S |
| FR-028 | Trigger production deploy only with permission and optional approval | S |
| FR-029 | Website health: HTTP, DNS, SSL, last deployment → Healthy/Warning/Critical/Unknown | S |

### 6.3 Payments
| ID | Requirement | P |
|---|---|---|
| FR-040 | Create a payment request (customer, amount, currency, description, links to ticket/invoice) | M |
| FR-041 | Choose Stripe or Dojo — only providers enabled, healthy and permitted are selectable | M |
| FR-042 | Server creates hosted checkout/link; UI receives URL + reference only | M |
| FR-043 | Status changes only from verified webhooks or reconciliation, never browser redirects | M |
| FR-044 | Copy link / email link / insert into ticket reply | M |
| FR-045 | Refunds with permission, step-up and optional approval | S |
| FR-046 | Scheduled reconciliation for pending payments | M |
| FR-047 | No silent provider fallback if one is down | M |

### 6.4 Operations
| ID | Requirement | P |
|---|---|---|
| FR-060 | Clients with contacts, linked websites/domains/payments/tickets | M |
| FR-061 | Tasks: assignee, reviewer, priority, due date, status, checklist, comments, attachments | M |
| FR-062 | Staff post progress reports (done, blocked, next, time spent) | M |
| FR-063 | Manager dashboard: workload, overdue, blocked, completion | S |
| FR-064 | Reusable approvals; requester cannot approve own restricted request | M |
| FR-065 | Support tickets with customer replies vs internal notes, SLA, assignment, escalation | M |
| FR-066 | Create a task from a ticket; ticket shows task progress | S |
| FR-067 | Customer portal: own tickets, invoices, payments, websites | S |

### 6.5 Communication
| ID | Requirement | P |
|---|---|---|
| FR-080 | Channels (public/private), DMs, group DMs; persisted messages | M |
| FR-081 | Mentions, replies, reactions, read state, unread counts, attachments | S |
| FR-082 | Presence and typing indicators | C |
| FR-083 | 1-to-1 audio/video, mute, camera toggle, screen share, call history | S |
| FR-084 | In-app notifications with durable history | M |

### 6.6 HR & salary
| ID | Requirement | P |
|---|---|---|
| FR-100 | Employee records: department, manager, job title, status, join/leave dates | M |
| FR-101 | Payroll periods; per-employee net amount, currency, status, paid date, reference | M |
| FR-102 | Salary visible only with `salary.read`; all mutations audited | M |
| FR-103 | Expenses with receipt, approval, reimbursed status | C |
| FR-104 | Leave requests with approval | C |

### 6.7 Platform
| ID | Requirement | P |
|---|---|---|
| FR-120 | Audit log of sensitive actions, filterable, append-only | M |
| FR-121 | Integrations page with real connection test and status | M |
| FR-122 | Global search respecting permissions | S |
| FR-123 | CSV export with permission + audit | C |
| FR-124 | Incidents with severity, timeline, linked tickets/deployments | C |

## 7. Non-functional requirements (summary — detail in TRD)

| ID | Requirement |
|---|---|
| NFR-01 | Zero cross-tenant reads/writes (verified by automated RLS + API tests) |
| NFR-02 | p95 dashboard page server response < 800 ms at 50 concurrent users (to be measured) |
| NFR-03 | WCAG 2.2 AA on core flows; full keyboard support; light + dark themes |
| NFR-04 | Responsive 360 px → 1920 px |
| NFR-05 | No secrets in client bundle, logs, or Git (scanned in CI) |
| NFR-06 | RPO ≤ 24 h, RTO ≤ 4 h initially (confirm against Supabase plan) |
| NFR-07 | All money stored as integer minor units + ISO currency |
| NFR-08 | All timestamps stored UTC; displayed in org/user timezone |

## 8. Success metrics

| Metric | Target (first 90 days after R1/R2) |
|---|---|
| Domains/SSL expiring without alert | 0 |
| DNS changes without audit record | 0 |
| Payment links tied to a customer record | ≥ 95 % |
| Payments with status mismatch after reconciliation | 0 unresolved > 24 h |
| Tasks with assignee + due date | ≥ 90 % |
| Ex-staff with active sessions after offboarding | 0 |
| Critical/High security issues open at release | 0 |

## 9. Assumptions & dependencies

- Accounts exist (or will) for: Supabase, Vercel, GitHub, Cloudflare and/or registrar, Stripe, Dojo, email provider, TURN.
- Stripe/Dojo merchant accounts and API access are provided by the business owner.
- Registrar and cPanel API capabilities vary by provider — each capability verified separately.

## 10. Open decisions (must be answered before the related phase)

| # | Decision | Needed by |
|---|---|---|
| D1 | Is the platform single-company (one org) or a SaaS sold to other companies? | R0 |
| D2 | Which registrar(s) and DNS provider(s) are in use today? | R1 |
| D3 | Stripe Checkout Session vs Payment Link for one-off requests? | R2 |
| D4 | Dojo account type and API access level | R2 |
| D5 | Approval thresholds (refund amount, which DNS records, prod deploys) | R2 |
| D6 | TURN: managed provider vs self-hosted coturn | R4 |
| D7 | Retention period for chat, tickets, audit logs, salary records | R4 |
| D8 | Who may view salary (HR only? Finance? Owner?) | R4 |

## 11. Out of scope for this PRD
The customer-facing AI website builder & hosting product — see `AI_WEBSITE_BUILDER_SPEC.md` (FUTURE, not authorized).
