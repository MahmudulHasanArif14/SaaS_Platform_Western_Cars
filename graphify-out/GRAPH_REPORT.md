# Graph Report - saasplatformwesterncars  (2026-10-10)

## Corpus Check
- Corpus is ~45,900 words - fits in a single context window. You may not need a graph.

## Summary
- 124 nodes · 99 edges · 33 communities (13 shown, 20 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.86)
- Token cost: 132,359 input · 10,374 output

## Community Hubs (Navigation)
- TypeScript Compiler Config
- ESLint & Package Manifest
- Project Spec & Agent Rules
- Next.js App Shell
- Dev Dependencies
- Core Architecture Patterns
- Project State Tracking
- NPM Scripts
- Request Flow & Observability
- Security & Tenant Isolation
- Runtime Dependencies
- Webhook & Deployment Safety
- Payment Provider Adapters
- Search & RBAC Testing
- Globe Icon
- Window Icon
- HR & Salary Architecture
- Architectural Decisions
- Integration Status
- Known Issues
- Dashboards
- DNS Safety & Rollback
- Feature Folder Structure
- Threat Model
- Design System (empty)
- Design References
- Screen Inventory (empty)
- UI/UX Spec (empty)
- Payment Reconciliation
- Realtime Notifications
- File Icon
- Next.js Logo
- Vercel Logo

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `Master Implementation Spec` - 8 edges
3. `scripts` - 5 edges
4. `next` - 4 edges
5. `Next.js` - 4 edges
6. `Provider Adapter Layer` - 3 edges
7. `Standard Request Flow` - 3 edges
8. `Project Roadmap` - 3 edges
9. `Supabase` - 3 edges
10. `Project Context` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Webhook Security Flow` --calls--> `Audit Logging System`  [EXTRACTED]
  docs/ai/MASTER_SPEC.md → lib/audit/write-audit-event.ts
- `Deployment Safety` --calls--> `Audit Logging System`  [EXTRACTED]
  docs/ai/MASTER_SPEC.md → lib/audit/write-audit-event.ts
- `Security Baseline` --semantically_similar_to--> `Threat Model`  [INFERRED] [semantically similar]
  docs/ai/SECURITY_BASELINE.md → docs/ai/THREAT_MODEL.md
- `Master Implementation Spec` --references--> `Next.js`  [EXTRACTED]
  docs/ai/MASTER_SPEC.md → README.md
- `Project Context` --references--> `Next.js`  [EXTRACTED]
  docs/ai/PROJECT_CONTEXT.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Core Security Enforcement** — docs_ai_data_model_tenant_isolation, docs_ai_architecture_request_flow, docs_ai_architecture_audit_logging [EXTRACTED 0.95]
- **External Integration Pattern** — docs_ai_architecture_provider_adapter, docs_ai_architecture_durable_jobs, docs_ai_architecture_audit_logging [EXTRACTED 0.90]
- **Security Governance Framework** — docs_ai_security_baseline_security_baseline, docs_ai_threat_model_threat_model, supabase_rls, tenant_isolation [INFERRED 0.85]
- **AI Context Management System** — docs_ai_current_task_current_task, docs_ai_workspace_state_workspace_state, docs_ai_session_log_session_log, docs_ai_known_issues_known_issues, docs_ai_integration_status_integration_status [EXTRACTED 1.00]
- **Project Memory & Documentation** — claude_md, docs_ai_master_spec, docs_ai_decisions, docs_ai_environment_matrix [EXTRACTED 0.90]
- **Core Technology Stack** — nextjs_framework, supabase_platform [EXTRACTED 1.00]
- **Payment Processing & Reconciliation Flow** — lib_payments_payment_provider, app_api_webhooks_handler, lib_payments_reconciliation [EXTRACTED 0.95]
- **Infrastructure & Deployment Safety** — docs_ai_master_spec_dns_safety, docs_ai_master_spec_deployment_safety, lib_audit_write_audit_event [INFERRED 0.85]
- **Payment Provider Integrations** — stripe_integration, dojo_integration [EXTRACTED 0.90]

## Communities (33 total, 20 thin omitted)

### Community 0 - "TypeScript Compiler Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 1 - "ESLint & Package Manifest"
Cohesion: 0.13
Nodes (14): eslintConfig, name, private, version, eslint, eslint-config-next, react, react-dom (+6 more)

### Community 2 - "Project Spec & Agent Rules"
Cohesion: 0.18
Nodes (10): Business Operations MVP, Environment Matrix, Master Implementation Spec, Project Context, Dojo, Graphify, Infrastructure MVP, Next.js (+2 more)

### Community 3 - "Next.js App Shell"
Cohesion: 0.18
Nodes (5): geistMono, geistSans, metadata, nextConfig, next

### Community 4 - "Dev Dependencies"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/turbopack, @types/node, @types/react, @types/react-dom (+1 more)

### Community 5 - "Core Architecture Patterns"
Cohesion: 0.40
Nodes (5): Safe DNS Workflow, Durable Job Processing, Modular Monolith Architecture, Payment Architecture, Provider Adapter Layer

### Community 6 - "Project State Tracking"
Cohesion: 0.50
Nodes (5): Current Task, Production Readiness, Project Roadmap, Session Log, Workspace State

### Community 7 - "NPM Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 8 - "Request Flow & Observability"
Cohesion: 0.50
Nodes (4): Audit & Observability, Standard Request Flow, WebRTC Signaling & Media, Multi-Tenant Isolation

### Community 9 - "Security & Tenant Isolation"
Cohesion: 0.50
Nodes (4): Security Baseline, Threat Model, Supabase Row Level Security, Multi-Tenant Isolation

### Community 10 - "Runtime Dependencies"
Cohesion: 0.50
Nodes (4): dependencies, next, react, react-dom

### Community 11 - "Webhook & Deployment Safety"
Cohesion: 0.67
Nodes (3): Webhook Security Flow, Deployment Safety, Audit Logging System

### Community 12 - "Payment Provider Adapters"
Cohesion: 0.67
Nodes (3): PaymentProvider Interface, DojoPaymentProvider, StripePaymentProvider

## Knowledge Gaps
- **49 isolated node(s):** `react`, `react-dom`, `@tailwindcss/turbopack`, `@types/node`, `@types/react` (+44 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 95 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Next.js App Shell` to `ESLint & Package Manifest`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `react`, `react-dom`, `@tailwindcss/turbopack` to the rest of the system?**
  _49 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TypeScript Compiler Config` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Dev Dependencies` to `ESLint & Package Manifest`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `ESLint & Package Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `NPM Scripts` to `ESLint & Package Manifest`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._