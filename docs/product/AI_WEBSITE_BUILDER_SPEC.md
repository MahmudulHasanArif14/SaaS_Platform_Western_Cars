Create or update `docs/product/AI_WEBSITE_BUILDER_SPEC.md`.

This document defines a future customer-facing AI website creation and hosting product that will be built after the foundational company operations platform is stable and its release gates are met.

Do not implement this product during specification work.

## Product vision

Allow a customer to register, select a plan, create a website using AI-assisted generation, edit and preview it, publish it, connect a custom domain, and manage hosting from a self-service dashboard.

The long-term ambition may include GoDaddy-like domain and hosting management, but the initial version must be narrowly scoped and commercially validated.

## Specify these areas

1. Target users, problems, value proposition, MVP scope, non-goals, and success metrics.
2. Registration, authentication, workspaces, account ownership, and onboarding.
3. Hosting plans, feature limits, storage/build quotas, usage tracking, renewals, cancellations, and upgrades.
4. Payment provider integration, server-verified payment events, entitlements, refunds, and billing history.
5. AI provider evaluation: supported generation methods, API access, commercial terms, cost, rate limits, latency, output rights, and fallback strategy.
6. Website generation from prompts, templates, assets, and optional existing content.
7. Project editing, version history, preview environments, autosave, and recovery.
8. Publishing workflow, deployment status, logs, retries, failure recovery, and rollback.
9. Platform subdomains, custom-domain verification, DNS instructions, SSL provisioning, and domain removal.
10. Customer dashboard for projects, domains, deployments, usage, billing, and support.
11. Ownership, export, portability, cancellation, retention, and deletion.
12. Architecture boundaries, provider adapters, database entities, API contracts, background jobs, and integration status.
13. Tenant isolation, sandboxing, generated-code security, SSRF protection, upload restrictions, abuse prevention, and resource quotas.
14. Monitoring, support, incident response, backup, disaster recovery, and cost management.
15. Acceptance criteria, end-to-end tests, release gates, unresolved decisions, and phased delivery.

## Mandatory business and technical constraints

- Do not assume AI generation or hosting is free to operate.
- Distinguish a free-to-use AI tool from a production API with commercial-use rights.
- Evaluate whether a managed hosting provider can safely meet the MVP requirements before proposing custom infrastructure.
- Never execute arbitrary customer-generated code in the privileged application server.
- Isolate customer projects, preview environments, deployments, files, credentials, and logs.
- Verify domain ownership before enabling sensitive domain operations.
- Verify payment through trusted server-side events before granting paid entitlements.
- Enforce plan quotas on the server, not only in the interface.
- Prevent unauthorized cross-tenant access, runaway resource consumption, and abusive publishing.
- Document provider limitations, account prerequisites, pricing, and contractual restrictions.
- Do not promise GoDaddy-level functionality in the MVP.

## Required customer journey

Registration → workspace → plan selection → checkout → server-side payment verification → project creation → AI generation → editing → preview → publishing → platform subdomain → custom-domain verification → SSL and health checks → ongoing management.

Include alternative paths for failed payments, failed generation, failed deployments, DNS misconfiguration, expired plans, quota exhaustion, and cancellation.

## Delivery strategy

Describe an MVP, subsequent iterations, dependencies, cost validation, security gates, and go/no-go criteria.

Reference MASTER_SPEC.md, ROADMAP.md, ARCHITECTURE.md, DATA_MODEL.md, SECURITY_BASELINE.md, and DESIGN_SYSTEM.md.

Mark this product as FUTURE / NOT AUTHORIZED FOR IMPLEMENTATION until the required foundational milestones are approved.
