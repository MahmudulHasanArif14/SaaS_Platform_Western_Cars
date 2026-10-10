# ADR-007 — Rate-limit store

| Field | Value |
|---|---|
| Status | PENDING |
| Date | 2026-10-10 (stub) |
| Deciders | UNKNOWN — to be assigned |
| Related | TRD §1 (Rate limiting), TR-026, SEC-B03, T-109 |

## Context

Rate limits must hold across multiple server instances (login, reset, invite, payment links, webhooks). Nothing is implemented; no Redis or database is provisioned.

## Options

1. Postgres-backed counters (table/function in Supabase).
2. Upstash Redis.
3. Platform-level firewall/rate limiting in front of the app, alone or combined with 1 or 2.

## Decision

PENDING

## Consequences

To be written when the decision is made (security, cost and migration impact per `docs/ai/DECISIONS.md`).
