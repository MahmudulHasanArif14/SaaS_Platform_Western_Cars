# UI/UX Design Brief

Status: PROPOSED. Detailed tokens/components belong in `DESIGN_SYSTEM.md`; screens in `SCREEN_INVENTORY.md`.

Day 0 (VERIFIED 2026-10-10) — what the repo has today:
- Tailwind CSS 4.3.3, configured in CSS (`@import "tailwindcss"` + `@theme inline` in `app/globals.css`); no `tailwind.config.*`.
- Fonts: Geist + Geist Mono already loaded via `next/font/google` (`app/layout.tsx`) — the "Inter (or Geist)" / "Geist Mono" option in §3 is the one in place. `body` still falls back to `Arial, Helvetica` in `globals.css`.
- Tokens: only `--background` / `--foreground` (`#ffffff`/`#171717`, dark `#0a0a0a`/`#ededed`). None of the §3 tokens exist.
- Theming: `prefers-color-scheme` media query only — no light/dark/system switch, no `next-themes`.
- Not installed: shadcn/ui, Radix, Lucide, TanStack Table. No components, app shell or screens exist; `/` is the starter page.

## 1. Product feel
**"Calm control room."** Operators make high-consequence changes (DNS, money, salaries). The UI must feel precise, dense-but-readable, and trustworthy — closer to Linear/Vercel/Stripe Dashboard than to a colourful admin template.

Principles
1. **Truth over delight** — status colours only mean verified states. Pending is neutral, never green.
2. **Consequence is visible** — risky actions show what changes, for whom, and how to undo.
3. **Density with hierarchy** — tables first; cards for summaries only.
4. **Permission-shaped** — users never see controls they can't use; disabled controls explain why.
5. **Same pattern everywhere** — one table, one drawer form, one confirm dialog.

## 2. Audience & context
Staff on 13–16" laptops and 27" monitors most of the day; managers and support on phones occasionally; customers on phones mostly (portal). Dark mode is the default for staff; light default for portal.

## 3. Visual direction

| Element | Direction |
|---|---|
| Typography | UI: **Inter** (or Geist) 14 px base; numerals tabular. Mono: **JetBrains Mono / Geist Mono** for DNS values, IDs, commits, amounts in tables |
| Scale | 12 · 13 · 14 · 16 · 20 · 24 · 30 px; line-height 1.5 body, 1.25 headings |
| Spacing | 4 px grid; page padding 24 px desktop / 16 px mobile |
| Radius | 6 px controls, 10 px cards/dialogs — one value each, consistent |
| Elevation | Borders over shadows; shadow only on overlays |
| Icons | Lucide 16/20 px, stroke 1.75 |
| Motion | 120–200 ms ease-out; respect `prefers-reduced-motion`; no decorative animation |

### Colour tokens (semantic, CSS variables, HSL/OKLCH)
| Token | Dark | Light |
|---|---|---|
| `--background` | near-black `#0A0B0D` | `#F7F8FA` |
| `--surface` | `#121417` | `#FFFFFF` |
| `--surface-2` | `#1A1D21` | `#F1F3F5` |
| `--border` | `#262A30` | `#E3E6EA` |
| `--text` | `#E8EAED` | `#111317` |
| `--text-muted` | `#9AA1AB` | `#5B636E` |
| `--primary` | indigo `#6E7BFF` | `#4652E0` |
| `--success` | `#2FBF71` | `#16884A` |
| `--warning` | `#E5A93A` | `#B26B00` |
| `--danger` | `#F0525A` | `#C9252F` |
| `--info / pending` | slate `#7C8794` | `#64707D` |
All text/background pairs ≥ 4.5:1; UI component boundaries ≥ 3:1. Never hard-code hex in components.

## 4. Layout
- **App shell:** collapsible left sidebar (240 / 64 px) grouped: Infrastructure · Finance · Workspace · Team · Communication · Management · Security · System. Top bar: org switcher, ⌘K command/search, notifications, theme, user menu.
- **Page:** breadcrumb → title + status + primary action (right) → tabs → content. Max width 1440 px for tables, 880 px for forms.
- **Detail pattern:** list → row click → full detail page (deep-linkable); quick edits in right drawer (480 px).
- **Mobile (< 768 px):** sidebar becomes sheet; tables collapse to stacked cards with 3 key fields + status; primary action as bottom bar.

## 5. Signature components
| Component | Notes |
|---|---|
| **DataTable** | TanStack Table; sticky header, column visibility, server pagination/sort/filter, row selection for bulk, empty/loading/error states built-in |
| **StatusBadge** | Fixed vocabulary per entity; dot + text (never colour alone) |
| **ExpiryChip** | days-left: >30 neutral, ≤30 warning, ≤7 danger, expired danger solid |
| **DiffPreview** | DNS/config before→after, red/green with +/- markers, mono font |
| **RiskConfirmDialog** | Title states action + object; impact list; HIGH risk requires typing the domain/name; step-up MFA inline |
| **ProviderPicker** | Radio cards with health dot + reason when disabled |
| **SecretField** | Write-only; shows `••••last4`, "Rotate" not "Reveal" |
| **AuditTimeline** | actor · action · time · result, filter by type |
| **InternalNote** | amber left border + "Internal — not visible to customer" label |
| **CommandPalette** | ⌘K: navigate, search clients/domains/tickets, quick actions within permissions |

## 6. Key screens (priority order)
1. Dashboard — expiring domains/SSL, failing sites, pending payments, my tasks, open tickets, incidents (only widgets user can access; no fake numbers — empty state if no data).
2. Domains list + domain detail (DNS tab, renewal, linked website/client, activity).
3. DNS change preview & confirm.
4. Websites list + detail (environments, health, deployments).
5. Payment request create + detail (timeline: created → sent → paid / failed).
6. Tasks (list + board), task detail with updates.
7. Ticket workspace (conversation + internal notes + side panel: customer, tasks, payments).
8. Chat three-pane + call overlay.
9. Salary period table (restricted badge in header).
10. Integrations, Audit log, Security center.

## 7. Content & microcopy rules
- Verbs on buttons ("Create payment link", not "Submit").
- Pending wording: "Awaiting provider", "Confirming payment", "Verifying DNS".
- Errors: what happened + what to do + reference ID.
- Never reveal whether a hidden resource exists.
- Dates relative in lists ("in 12 days"), absolute in details with timezone.

## 8. Accessibility (WCAG 2.2 AA)
Keyboard for every action; visible focus ring 2 px `--primary`; focus trapped in dialogs and returned on close; target size ≥ 24×24; form errors linked via `aria-describedby`; live region for toasts and realtime status; no information by colour alone; reduced motion honoured; tested with axe + VoiceOver/NVDA on core flows.

## 9. Deliverables expected from design
Token file (`globals.css` variables + Tailwind theme mapping) · component inventory mapped to shadcn primitives · Figma (or coded) frames for the 10 key screens in light + dark + mobile · empty/error/forbidden variants · icon set list.

## 10. Anti-patterns (don't)
Gradients on data UI · glassmorphism on tables · green "Connected" before test · spinners over whole page · modals for long forms · different radii per component · hiding destructive actions in unlabeled icons · fake chart data.
