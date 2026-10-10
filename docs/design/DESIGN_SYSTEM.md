# Design System

Status: IMPLEMENTED (foundation) in T-102, 2026-10-10. Direction comes from `UI_UX_DESIGN_BRIEF.md`; this file
records what exists in code. Live reference: `/design-system` (not served when `APP_ENV=production`).

## Principles

"Calm control room": truth over delight, visible consequence, density with hierarchy, permission-shaped UI, one
pattern everywhere (brief §1). Borders over shadows; no gradients, no decorative motion.

## Tokens — `src/app/globals.css`

The only file where a raw colour may appear. Components use Tailwind utilities generated from the tokens.

| Token | Light | Dark | Utility |
|---|---|---|---|
| `--background` | `#f7f8fa` | `#0a0b0d` | `bg-background` |
| `--surface` | `#ffffff` | `#121417` | `bg-surface` (also `card`, `popover`, `sidebar`) |
| `--surface-2` | `#f1f3f5` | `#1a1d21` | `bg-surface-2` (also `muted`, `accent`, `secondary`) |
| `--border` | `#e3e6ea` | `#262a30` | `border-border` |
| `--text` | `#111317` | `#e8eaed` | `text-foreground` |
| `--text-muted` | `#5b636e` | `#9aa1ab` | `text-muted-foreground` |
| `--primary` | `#4652e0` | `#6e7bff` | `bg-primary`, focus ring |
| `--primary-foreground` | `#ffffff` | `#0a0b0d` | text on primary |
| `--success` / `--warning` / `--danger` / `--info` | `#16884a` / `#b26b00` / `#c9252f` / `#64707d` | `#2fbf71` / `#e5a93a` / `#f0525a` / `#7c8794` | `bg-success` … |
| `--danger-foreground` | `#ffffff` | `#0a0b0d` | text on destructive buttons |

Deviations from the brief, made for contrast (WCAG 1.4.3):

- Dark `--primary-foreground` and `--danger-foreground` are near-black: white on the dark primary/danger is ~3.5:1.
- Status colours are used for dots and fills, not for body text (light `--warning` on white is ~4.2:1).

Typography: Geist (UI) and Geist Mono (DNS values, IDs, commits, amounts); 14 px base; scale 12 · 13 · 14 · 16 ·
20 · 24 · 30 mapped to `text-xs … text-3xl`; tabular numerals on `body`.

Radius: 6 px controls (`rounded-md`, `rounded-lg`), 10 px cards/dialogs/overlays (`rounded-xl`). Spacing: 4 px grid;
page padding 24 px desktop / 16 px mobile. Focus: 2 px `--primary` outline. Motion honours `prefers-reduced-motion`.

Themes: `next-themes`, class strategy, default dark, light and system selectable.

## Components

| Component | File | Notes |
|---|---|---|
| shadcn/ui primitives | `src/components/ui/*` | Generated (`radix-nova` style, `components.json`). Local edits: `button` destructive variant is solid; `sidebar` `SidebarInset` renders a `div` so pages own `<main>` |
| AppShell | `src/components/app-shell/app-shell.tsx` | Sidebar 240 / 64 px, icon rail, sheet below 768 px, skip link, top bar with ⌘K and theme. `topBarEnd` slot for org switcher / notifications / user menu |
| CommandPalette | `src/components/app-shell/command-palette.tsx` | ⌘K / Ctrl+K. Navigation and theme only |
| PageHeader, PageContainer | `src/components/app-shell/page-header.tsx` | Title + status + actions; 1440 px (tables) / 880 px (forms) |
| DataTable | `src/components/data-table.tsx` | TanStack Table v9; controlled (server-driven) sort and pagination; loading / empty / error states; cards below 768 px |
| StatusBadge | `src/components/status-badge.tsx` | Dot + label; tones success, warning, danger, pending (hollow, neutral), info |
| ConfirmDialog | `src/components/confirm-dialog.tsx` | AlertDialog with impact list and verb label |
| EmptyState, ErrorState, ForbiddenState | `src/components/state-view.tsx` | Error shows a reference ID; forbidden never reveals existence |
| Toasts | `src/components/ui/sonner.tsx` | `toast.success` / `toast.error` from `sonner` |
| Route states | `src/app/not-found.tsx`, `src/app/error.tsx` | Error page shows the digest only |

## Not built yet (brief §5)

DataTable column visibility, row selection / bulk actions, filters and sticky header · ExpiryChip · DiffPreview ·
RiskConfirmDialog (typed name, step-up MFA) · ProviderPicker · SecretField · AuditTimeline · InternalNote · forms
(inputs, validation) · org switcher, notifications, user menu · charts. Each is added with the first module that
needs it.

## Rules

- No raw hex, no ad-hoc Tailwind palette colours (`bg-zinc-…`) in components.
- Status never by colour alone; pending is never green.
- Destructive confirmation uses `ConfirmDialog` (AlertDialog), not `Dialog`.
- Extend shadcn components in place; record local edits in the table above.
- Every new screen gets an axe check in `tests/e2e` for light, dark and mobile.
