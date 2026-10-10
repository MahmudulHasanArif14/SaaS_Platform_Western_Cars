# ADR-006 — Secret encryption and key rotation

| Field | Value |
|---|---|
| Status | PENDING |
| Date | 2026-10-10 (stub) |
| Deciders | UNKNOWN — to be assigned |
| Related | TR-053, SEC-C05, SEC-C07, T-201 |

## Context

Per-organization provider credentials must be stored encrypted and decrypted only server-side. No credential storage or key management exists yet.

## Options

1. App-level AES-256-GCM with versioned key from environment, ciphertext in `private.provider_credentials`.
2. Supabase Vault.
3. External KMS / secrets manager.

Rotation procedure (re-encrypt by key version) must be defined with the chosen option.

## Decision

PENDING

## Consequences

To be written when the decision is made (security, cost and migration impact per `docs/ai/DECISIONS.md`).
