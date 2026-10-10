# CURRENT TASK

## Stage

Phase 1 — T-102: Design tokens, theming, app shell, base components

## Status

IMPLEMENTED, locally verified — NOT yet COMPLETED (2026-10-10).

Acceptance criterion ("light/dark/mobile screenshots; axe clean") passes locally. Not complete because the work is
uncommitted on `feature/t-102-app-shell` and CI has not run on GitHub.

Previous tasks: T-100 COMPLETED (PR #1, `3c6b99c`). T-101 COMPLETED (PR #5, `e65fc07`; CI runs 38039995101 and
38040051372 green).

## Scope delivered

| Item | Evidence |
|---|---|
| Design tokens (colour, type scale, radius, focus, reduced motion), light + dark | `src/app/globals.css`, `docs/design/DESIGN_SYSTEM.md` |
| Theming: light / dark / system, default dark | `src/components/theme-provider.tsx`, `theme-toggle.tsx` |
| shadcn/ui set up (`radix-nova`) | `components.json`, `src/components/ui/*` |
| App shell: collapsible sidebar (240 / 64 px), mobile sheet, top bar, skip link | `src/components/app-shell/app-shell.tsx` |
| ⌘K command menu (navigation + theme only) | `src/components/app-shell/command-palette.tsx` |
| PageHeader / PageContainer | `src/components/app-shell/page-header.tsx` |
| DataTable (TanStack Table v9, controlled sort + pagination, loading/empty/error, mobile cards) | `src/components/data-table.tsx` |
| StatusBadge, ConfirmDialog, Empty/Error/Forbidden states, toasts, skeleton | `src/components/*` |
| Route-level not-found and error pages | `src/app/not-found.tsx`, `src/app/error.tsx` |
| Starter home page replaced (ISSUE-001) | `src/app/page.tsx` |
| Preview routes, not served in production | `src/app/design-system/**` |

## Not included (deferred to the first module that needs them)

- DataTable: column visibility, row selection / bulk actions, filters, sticky header.
- ExpiryChip, DiffPreview, RiskConfirmDialog, ProviderPicker, SecretField, AuditTimeline, InternalNote, forms.
- Org switcher, notifications, user menu (slot exists in the top bar; need T-104 / T-107).
- The real `(dashboard)/[orgSlug]` layout: needs auth and org resolution. The shell is only mounted on the
  preview routes today. Sidebar groups from brief §4 are added with their modules.
- Sidebar collapsed state is not persisted across reloads.

## Checks run locally (2026-10-10, `e65fc07` + working tree, Node v22.23.3)

| Check | Result |
|---|---|
| `npm run format:check` · `lint` · `typecheck` | PASS |
| `npm test` | PASS — 3 files, 27 tests (3 consecutive runs) |
| `npm run build` | PASS — routes `/`, `/_not-found`, `/design-system` (+3) |
| `npm run test:e2e` | PASS — 29 tests |
| axe (WCAG 2.0/2.1/2.2 A + AA) | 0 violations on 4 pages × light/dark × desktop/mobile, plus command menu, confirm dialog, toast, mobile sheet, collapsed sidebar, table loading/empty/error |
| Screenshots | 17 PNGs in `test-results/` (4 pages × 2 themes × 2 viewports + mobile sheet); reviewed by eye |
| Production build (`APP_ENV=production`, fake test values) | `/` 200, `/design-system` 404, `/design-system/data-table` 404 |
| `npm run check:bundle` | PASS — 37 files |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| GitHub Actions | NOT RUN — not pushed |

Not verified: screen readers (VoiceOver / NVDA), real mobile devices, browsers other than Chromium.

## Remaining to mark COMPLETED

1. Commit, push, PR; confirm CI green.

## Open items

- ISSUE-007 (border contrast), ISSUE-008 (theme script vs CSP in T-103) — see `KNOWN_ISSUES.md`.
- Dependabot PRs #2–#4 open (owner to review): `typescript` 7.0.2 — CI fails; `eslint` 10.12.0 — CI passes;
  `@types/node` 26.6.4 — conflicts with the Node 22 pin.
- `.claude/settings.json` still allowlists `pnpm …` (ISSUE-004b).
- No production/staging environment exists; `APP_ENV` must be set there when one is created.
- ADR-002..008 `Decision: PENDING`. `docs/ai/COST_MATRIX.md` missing (ISSUE-006).

## Recommended next task (NOT STARTED — requires explicit instruction)

**T-103** — Security headers + CSP nonce, `poweredByHeader:false`, no browser source maps. Satisfies SEC-D03, D06.
Done when: header test passes. Must pass the nonce to `next-themes` (ISSUE-008).

## Do NOT implement yet

Domain CRUD · DNS · Hosting · Payments · Stripe · Dojo · CRM · Staff chat · WebRTC · HR · Salary.
