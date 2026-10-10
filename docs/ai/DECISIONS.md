## Architectural Decision Rule

Do not make major architectural changes silently.

Record a decision when changing:

- database architecture
- authentication architecture
- authorization model
- encryption strategy
- payment architecture
- provider abstraction
- job architecture
- realtime architecture
- WebRTC architecture
- deployment architecture
- storage architecture

Each decision should include:

Decision
Reason
Alternatives considered
Security impact
Cost impact
Migration impact
Date

---

# Decisions Log

## ADR-001 — MASTER_SPEC split into Part A (product) and Part B (implementation rules)

- Date: 2026-10-10
- Decision: Add a product specification (Part A: vision, users, 18 requirement areas, journeys, release gates, AI Website Builder later phase, open decisions) above the existing master prompt, which is preserved verbatim as Part B.
- Reason: User request to combine the existing spec with a comprehensive product spec; preserves all existing requirements.
- Alternatives: Rewrite into one document (risk of losing requirements); separate PRODUCT_SPEC.md (two sources of truth).
- Security / cost / migration impact: None.

## ADR-002 — Project-memory docs live in `docs/ai/`

- Date: 2026-10-10
- Decision: `COST_MATRIX.md` and `ARCHITECTURE.md` live in `docs/ai/` (spec §167/§171 name `docs/` / root paths). Root-level `ARCHITECTURE.md`, `SECURITY.md`, etc. (§167) are produced later from these when code exists.
- Reason: Single location for Claude project memory; CURRENT_TASK already listed `docs/ai/` paths.
- Impact: None.

## ADR-003 — Build order follows MASTER_SPEC §8, not ROADMAP phase numbering

- Date: 2026-10-10
- Decision: ROADMAP §0 added as the authoritative execution order (infrastructure first). Phase numbers kept as catalogue references.
- Reason: ROADMAP phases 4–6 (Staff/CRM/Tasks) preceded Domains, contradicting MASTER_SPEC §1A/§8 and CLAUDE.md, which agree with each other.
- Impact: None on code (none exists).
