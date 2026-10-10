# ADR-003 — Job engine

| Field | Value |
|---|---|
| Status | PENDING |
| Date | 2026-10-10 (stub) |
| Deciders | UNKNOWN — to be assigned |
| Related | TRD §1 (Jobs), TR-042, T-110 |

## Context

Provider calls (DNS apply, payment link creation, webhooks, reconciliation, expiry alerts) need durable, retryable, idempotent background work. Nothing is implemented; hosting platform limits are unverified.

## Options

1. Supabase Queues (pgmq) + Supabase Cron.
2. Custom `private.jobs` table with `FOR UPDATE SKIP LOCKED` + cron-triggered worker route or Edge Function.
3. External queue service.

Each option's current behaviour and limits must be verified against official docs before deciding.

## Decision

PENDING

## Consequences

To be written when the decision is made (security, cost and migration impact per `docs/ai/DECISIONS.md`).
