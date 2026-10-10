# ADR-002 — Tenancy model

| Field | Value |
|---|---|
| Status | PENDING |
| Date | 2026-10-10 (stub) |
| Deciders | UNKNOWN — to be assigned |
| Related | TRD §6 (TR-030..035), BACKEND_SCHEMA §1, PRD D1, T-105, T-107 |

## Context

Every tenant row must be isolated by organization. No database, schema or RLS exists yet. PRD decision D1 was answered by the owner on 2026-10-10: SaaS architecture with a multi-tenancy foundation, so multiple unrelated organizations must be isolated from day one. How organizations are created (self-serve vs operator-provisioned) is still open.

## Options

1. Shared schema, `organization_id` on every tenant table, RLS forced, org slug in the route path, composite FKs `(organization_id, id)`.
2. Schema per tenant.
3. Project/database per tenant.

## Decision

PENDING

## Consequences

To be written when the decision is made (security, cost and migration impact per `docs/ai/DECISIONS.md`).
