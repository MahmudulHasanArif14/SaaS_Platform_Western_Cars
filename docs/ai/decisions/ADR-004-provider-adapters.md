# ADR-004 — Provider adapters

| Field | Value |
|---|---|
| Status | PENDING |
| Date | 2026-10-10 (stub) |
| Deciders | UNKNOWN — to be assigned |
| Related | TRD §2, TR-001, TR-040, TR-050, T-204, T-301 |

## Context

Stripe, Dojo, Cloudflare, Vercel, GitHub, cPanel, registrars, email and TURN must not leak provider-specific logic into modules or UI. No adapter exists yet.

## Options

1. One interface per capability (`PaymentProvider`, `DnsProvider`, `EmailProvider`, …) with `capabilities()`, implementations under `modules/integrations/providers/<provider>/`.
2. Direct SDK use inside feature modules.
3. A single generic provider interface for everything.

## Decision

PENDING

## Consequences

To be written when the decision is made (security, cost and migration impact per `docs/ai/DECISIONS.md`).
