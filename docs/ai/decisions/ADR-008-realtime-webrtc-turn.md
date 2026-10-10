# ADR-008 — Realtime, WebRTC and TURN

| Field | Value |
|---|---|
| Status | PENDING |
| Date | 2026-10-10 (stub) |
| Deciders | UNKNOWN — to be assigned |
| Related | TR-060..062, PRD D6, T-501, T-504 |

## Context

Chat, presence and 1-to-1 calls need authorized realtime delivery, signaling and TURN relay. Nothing is implemented. PRD decision D6 (managed vs self-hosted TURN) is unanswered. Not needed before R4.

## Options

1. Supabase Realtime (Postgres Changes and/or private Broadcast channels with `realtime.messages` RLS) for chat and signaling; managed TURN with short-lived credentials.
2. Same, with self-hosted coturn.
3. Third-party calling SDK/service instead of raw WebRTC.

## Decision

PENDING

## Consequences

To be written when the decision is made (security, cost and migration impact per `docs/ai/DECISIONS.md`).
