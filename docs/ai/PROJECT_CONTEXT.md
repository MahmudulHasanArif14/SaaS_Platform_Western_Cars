# PROJECT_CONTEXT.md

## 1. Project Identity

**Project name:** Company Infrastructure & Operations Platform

**Project type:** Secure, multi-tenant web application for managing company infrastructure, staff operations, customer relationships, financial tracking, and internal communications.

**Primary objective:** Build a maintainable, production-ready platform that brings multiple company management and technical infrastructure workflows into one central dashboard.

The platform should reduce the need to manage domains, DNS, hosting, deployments, payments, employees, tasks, customers, and integrations across disconnected dashboards.

The system must prioritize security, correctness, reliability, maintainability, and verifiable functionality over rapid feature count.

The final product should be suitable for real business operations, not just a demonstration or portfolio project.

---

## 2. Business Goals

The platform should eventually allow authorized users to:

1. Manage company domains, registrars, DNS records, renewals, and domain assignments.
2. Manage websites, hosting accounts, repositories, environments, deployments, and deployment history.
3. Connect and manage external providers through a unified dashboard.
4. Generate and track customer payment links through supported payment providers.
5. Manage customers, companies, contacts, projects, support tickets, and business documents.
6. Assign tasks to specific employees and track progress, deadlines, approvals, and reports.
7. Communicate through team chatrooms and private employee conversations.
8. Make internal audio and video calls where supported.
9. Manage employee records, salary information, payment periods, and paid/unpaid status.
10. Escalate operational issues to managers and track approvals.
11. Monitor integration health, system failures, operational incidents, and outstanding actions.
12. Maintain auditable records of sensitive administrative and business operations.

These are long-term product goals. Their inclusion here does not mean they have been implemented or verified.

Refer to `MASTER_SPEC.md` for the complete product requirements and `ROADMAP.md` for implementation phases.

---

## 3. Initial Priorities

Implement the platform incrementally, following the approved roadmap.

### Priority 1: Foundation

- Inspect the existing repository.
- Establish the actual application structure and technical state.
- Configure development environments.
- Implement authentication and organization membership.
- Design tenant isolation, permissions, and RLS.
- Establish migrations, audit logging, testing, and secure configuration.
- Define the boundaries between UI, business logic, data access, and providers.

### Priority 2: Infrastructure Management

- Client and website inventory.
- Domain and registrar inventory.
- DNS management and verification.
- Hosting accounts and environments.
- GitHub, Vercel, Cloudflare, and cPanel integrations where supported.
- Deployment tracking, health checks, and appropriate rollback procedures.

### Priority 3: Payments

- Payment-provider abstraction.
- Stripe integration.
- Dojo integration, subject to verified account and API capabilities.
- Payment-link creation and tracking.
- Signed webhooks, idempotency, reconciliation, and audit records.

### Priority 4: Company Operations

- Staff and department management.
- Tasks, projects, assignments, and reports.
- Customer relationship management.
- Customer support and managerial escalation.
- Notifications and approvals.

### Priority 5: Communication and HR

- Internal chatrooms and direct messages.
- Audio and video calls using WebRTC where supported.
- Employee salary records and payment tracking.
- Restricted access to sensitive employee information.

### Priority 6: Production Hardening

- Durable background jobs.
- Integration monitoring.
- Backup and disaster recovery.
- Security and tenant-isolation testing.
- Performance, accessibility, and reliability improvements.
- Production deployment verification.

The roadmap may change when repository inspection, technical constraints, cost, provider capabilities, or security findings justify an adjustment. Significant changes must be documented rather than silently made.

---

## 4. Intended Users

The application is expected to support the following user categories.

### Platform administrators

Manage platform-level configuration, approved operational controls, and global administration within explicitly defined boundaries.

### Organization administrators

Manage their organization's members, configuration, integrations, and permitted resources.

### Managers

Assign work, review progress, manage escalations, and approve designated operations.

### Employees

Access assigned tasks, authorized resources, internal communication, and permitted operational features.

### Customers

Access only the customer-facing functionality explicitly provided to them, such as support, payment requests, or selected business information.

These are logical categories, not final role definitions. The exact permissions and relationships must be implemented through the approved authorization model.

A platform administrator must not automatically receive unrestricted access to every sensitive business record without a deliberate, auditable policy.

---

## 5. Technical Direction

The intended baseline stack is:

- **Language:** TypeScript.
- **Application framework:** Next.js App Router.
- **Frontend:** React.
- **Styling:** Tailwind CSS.
- **UI components:** shadcn/ui and accessible component primitives.
- **Database:** Supabase PostgreSQL.
- **Authentication:** Supabase Auth.
- **File storage:** Supabase Storage or an approved equivalent.
- **Realtime:** Supabase Realtime where appropriate.
- **Validation:** Zod or an equivalent runtime validation library.
- **Source control:** GitHub.
- **Deployment:** Vercel or another explicitly verified hosting environment.
- **Payments:** Stripe and Dojo through provider adapters.
- **Testing:** Unit, integration, security, and end-to-end tests.

This is the intended technology direction, not a statement about the current repository.

Before introducing or replacing dependencies, inspect the existing project and confirm the need, compatibility, maintenance status, security implications, and cost.

---

## 6. Core Architectural Decisions

The intended architecture follows these principles:

- Begin with a modular monolith rather than premature microservices.
- Separate user interfaces, application services, data access, and provider adapters.
- Keep privileged operations and secrets on the server.
- Use PostgreSQL as the primary source of truth for application-owned transactional data.
- Enforce organization isolation through server-side authorization, RLS, and database integrity constraints.
- Use migrations for all database schema changes.
- Use durable processing for operations that require retries, scheduling, or reliable execution.
- Treat external provider calls and webhooks as potentially unreliable.
- Make sensitive operations auditable.
- Design important operations for retries, partial failure, and reconciliation.
- Avoid unnecessary infrastructure, duplicated data, and excessive abstraction.

See `ARCHITECTURE.md`, `DATA_MODEL.md`, and `SECURITY_BASELINE.md` for implementation requirements.

---

## 7. External Integrations

The platform may integrate with:

| Integration         | Intended purpose                                                        |
| ------------------- | ----------------------------------------------------------------------- |
| Supabase            | Database, authentication, storage, and selected realtime functionality  |
| GitHub              | Repository information and approved repository operations               |
| Vercel              | Website hosting and deployment management                               |
| Cloudflare          | DNS, zone management, and supported infrastructure operations           |
| cPanel              | Supported hosting and account management operations                     |
| Domain registrars   | Domain inventory, renewal, and supported registration operations        |
| Stripe              | Payment requests, checkout links, payment events, and supported refunds |
| Dojo                | Payment operations supported by the configured account and API          |
| Email provider      | Transactional notifications and business communications                 |
| STUN/TURN provider  | WebRTC connectivity and media relay                                     |
| Monitoring provider | Application errors, system health, and operational alerts               |

Every provider must have a documented status.

Use `INTEGRATION_STATUS.md` to distinguish planned integrations from configured, connected, tested, and production-verified integrations.

Never invent credentials, account access, API capabilities, successful operations, or provider connection status.

---

## 8. Security and Data Protection

Security is a foundational requirement, not a later enhancement.

The application must:

- Authenticate and authorize every protected operation.
- Validate permissions on the server.
- Prevent cross-tenant data access.
- Enforce RLS on protected database resources.
- Keep service-role keys and provider secrets out of client bundles.
- Validate external input and provider responses.
- Verify webhooks and prevent duplicate event processing.
- Use idempotency for sensitive retryable operations.
- Restrict salary records, private conversations, internal support notes, and credentials.
- Use private storage for confidential files.
- Record security-relevant administrative actions.
- Protect DNS, payments, deployments, role changes, and credential management.
- Support credential rotation, revocation, and secure employee offboarding.
- Maintain backup and recovery procedures.
- Test authorization failures, not only successful operations.

If a requested implementation conflicts with the security baseline, document the conflict and propose a secure alternative before implementing a risky workaround.

---

## 9. User Experience Expectations

The product should provide a modern, professional, responsive administrative interface.

Design expectations:

- Clear navigation between modules.
- Consistent dashboard layout and reusable components.
- Accessible forms and controls.
- Responsive layouts for desktop and mobile.
- Light and dark themes where supported.
- Clear loading, empty, success, and failure states.
- Useful filtering, searching, sorting, and pagination.
- Confirmation and impact previews for sensitive operations.
- Clear permission-denied states.
- No misleading success messages.
- No inaccessible controls or unnecessary interface complexity.

Target WCAG 2.2 AA accessibility where practical and applicable.

Prioritize clear workflows and reliable functionality over decorative effects.

---

## 10. Development Workflow

Development is task-based and incremental.

Claude Code and Claude Web must follow the same repository documentation and task boundaries.

At the start of a work session:

1. Read `CLAUDE.md`.
2. Read `CURRENT_TASK.md`.
3. Read `WORKSPACE_STATE.md`.
4. Inspect the Git branch, working tree, and relevant repository files.
5. Review only the additional architecture, security, data-model, issue, and integration documents required for the current task.
6. Verify that previous work exists and that its tests and documentation support the recorded status.

During implementation:

1. Work only on the authorized task.
2. Make the smallest coherent change.
3. Preserve existing working functionality.
4. Follow the established architecture and security rules.
5. Add appropriate tests.
6. Report blockers and newly discovered risks honestly.

At task completion:

1. Review the changed files and Git diff.
2. Run the relevant tests, type checks, lint, and build.
3. Record the actual results, including failures or unexecuted checks.
4. Update `CURRENT_TASK.md`.
5. Update `WORKSPACE_STATE.md`.
6. Update relevant integration, issue, security, or readiness documentation.
7. Append a concise entry to `SESSION_LOG.md` for a meaningful session.
8. Update `ROADMAP.md` if milestone status changed.
9. Record significant architectural decisions where appropriate.
10. Recommend the exact next task and stop.

Do not automatically start the next task unless explicitly authorized.

---

## 11. Truthful Implementation Status

Never confuse product goals with actual implementation.

Use these distinctions:

- **Planned:** Identified as a future requirement.
- **Designed:** A proposed solution has been documented.
- **Implemented:** Relevant code or configuration exists.
- **Tested:** The relevant automated or manual checks have been executed.
- **Verified:** Required tests and real integration checks support the claim.
- **Production verified:** The feature has been validated in the appropriate production environment.
- **Blocked:** A known issue prevents progress.
- **Unsupported:** The provider, environment, or application cannot currently perform the operation.

A successful build does not prove that authorization, provider integration, or production behavior is correct.

A mock integration does not prove that a real provider integration works.

An empty readiness or integration document must not be treated as evidence of readiness.

Use `PRODUCTION_READINESS.md`, `INTEGRATION_STATUS.md`, and `KNOWN_ISSUES.md` to record the actual status.

---

## 12. Project Context and Documentation Rules

Use the following documents for their specific responsibilities:

| Document                  | Responsibility                                                                    |
| ------------------------- | --------------------------------------------------------------------------------- |
| `PROJECT_CONTEXT.md`      | Short background, business goals, technology direction, and workflow expectations |
| `MASTER_SPEC.md`          | Complete product scope and requirements                                           |
| `CLAUDE.md`               | Persistent development instructions and rules                                     |
| `CURRENT_TASK.md`         | The single task currently authorized for work                                     |
| `WORKSPACE_STATE.md`      | Verified current repository and implementation state                              |
| `ROADMAP.md`              | Phases, milestones, and future priorities                                         |
| `ARCHITECTURE.md`         | Module boundaries, request flow, and technical architecture                       |
| `DATA_MODEL.md`           | Logical entities, relationships, ownership, constraints, and data access          |
| `SECURITY_BASELINE.md`    | Mandatory security controls                                                       |
| `THREAT_MODEL.md`         | Threats, attack scenarios, mitigations, and verification                          |
| `INTEGRATION_STATUS.md`   | Actual external provider configuration and verification status                    |
| `KNOWN_ISSUES.md`         | Open problems, blockers, and limitations                                          |
| `PRODUCTION_READINESS.md` | Evidence-based release readiness                                                  |
| `SESSION_LOG.md`          | Chronological history of meaningful work sessions                                 |
| `CHANGELOG.md`            | Meaningful project changes                                                        |
| `docs/ai/decisions/`      | Important architectural decision records                                          |
| `docs/runbooks/`          | Operational, incident, deployment, and recovery instructions                      |

These documents must have distinct responsibilities rather than duplicating large sections of each other.

If two authoritative documents conflict, do not silently choose one. Identify the conflict, inspect the actual repository where relevant, and resolve it through a documented decision.

---

## 13. Current Project State

The initial known direction is:

- Product concept: central company infrastructure and operations platform.
- Intended stack: Next.js, TypeScript, Tailwind CSS, and Supabase.
- Intended development tools: VS Code, Claude Code, and Claude Web.
- Intended workflow: incremental, task-based implementation.
- Long-term priorities: infrastructure management, payments, company operations, communication, HR, and production hardening.

The following must be verified from the actual repository before being treated as current facts:

- Repository existence and structure.
- Current branch and commit.
- Installed dependencies.
- Current application functionality.
- Supabase project and schema.
- Existing authentication and RLS policies.
- Configured environments.
- External provider connections.
- Test coverage and test results.
- Deployment status.
- Outstanding bugs and blockers.
- Production readiness.

Do not invent values for these fields. Record verified findings in `WORKSPACE_STATE.md`.

---

## 14. Definition of Success

The project succeeds when it provides a secure and maintainable central platform that:

- Correctly isolates organizations and permissions.
- Manages infrastructure through verified provider capabilities.
- Processes payment events reliably and securely.
- Supports day-to-day staff and customer operations.
- Restricts confidential HR and financial information.
- Handles external failures without reporting false success.
- Provides accurate audit trails and operational visibility.
- Can be deployed, monitored, backed up, and recovered using documented procedures.
- Has automated tests protecting critical business and security rules.
- Can be maintained by developers working in different sessions without losing project context.

The platform should grow through verified, production-quality milestones rather than attempting to implement every feature at once.

## 15. Final Instruction

Treat this document as a concise overview, not a replacement for the detailed specifications.

Before making changes, understand the authorized task, inspect the actual repository, identify the relevant constraints, and implement only what is appropriate for that task.

**The goal is a reliable production system—not merely a feature-rich application or a successful build.**

Create or update `docs/ai/PROJECT_CONTEXT.md`.

Inspect the current repository and related documentation before writing.

Document:

- The verified business and project purpose.
- The current repository structure and important entry points.
- The verified frontend, backend, database, authentication, styling, testing, and deployment technologies.
- Existing routes, modules, reusable components, migrations, and integrations.
- Current implementation status and incomplete work.
- The planned company operations capabilities.
- The later AI website builder and hosting product, clearly marked as future scope.
- Important constraints, known risks, external dependencies, and unresolved decisions.
- How Claude Code should use persistent documentation and the current-task workflow.
- Links to CLAUDE.md, MASTER_SPEC.md, ARCHITECTURE.md, ROADMAP.md, CURRENT_TASK.md, and WORKSPACE_STATE.md.

Separate verified facts, proposals, assumptions, and unknowns. Never guess the repository's stack, business decisions, deployment state, or implemented functionality.

Keep this file concise enough to be read at the beginning of a development session. Put detailed requirements in the appropriate specialized documents.

Do not implement features or install dependencies.
