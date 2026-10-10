# ADR-001 — Modular monolith

| Field | Value |
|---|---|
| Status | PENDING |
| Date | 2026-10-10 (stub) |
| Deciders | UNKNOWN — to be assigned |
| Related | TRD §2, `docs/ai/ARCHITECTURE.md`, T-100 |

## Context

The platform spans many domains (infrastructure, payments, operations, chat, HR). The repo today is a single Next.js 16.4.0 app with only the create-next-app starter (`app/`, no `src/`, no modules).

## Options

1. Modular monolith: one Next.js app, `modules/<module>` boundaries enforced by lint.
2. Monorepo with separate packages/apps.
3. Separate services per domain.

Open sub-question: keep root `app/` (current) or move to `src/app` as the docs assume.

## Decision

PENDING

## Consequences

To be written when the decision is made (security, cost and migration impact per `docs/ai/DECISIONS.md`).
