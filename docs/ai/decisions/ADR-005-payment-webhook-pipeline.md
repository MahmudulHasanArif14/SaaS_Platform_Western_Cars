# ADR-005 — Payment webhook pipeline

| Field | Value |
|---|---|
| Status | PENDING |
| Date | 2026-10-10 (stub) |
| Deciders | UNKNOWN — to be assigned |
| Related | TR-043..045, SEC-D02, T-110, T-303, T-304 |

## Context

Payment status may only change from verified provider events or reconciliation. No webhook route, table or provider account exists yet. Stripe and Dojo webhook behaviour must be confirmed from current official docs (PRD D3, D4).

## Options

1. Verify signature on raw body → insert into `webhook_events` with `UNIQUE(provider, provider_event_id)` → respond 2xx → process in a job.
2. Process synchronously inside the webhook request.
3. Polling/reconciliation only, no webhooks.

## Decision

PENDING

## Consequences

To be written when the decision is made (security, cost and migration impact per `docs/ai/DECISIONS.md`).
