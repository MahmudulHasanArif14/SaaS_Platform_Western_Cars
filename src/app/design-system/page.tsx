import { PageContainer, PageHeader } from "@/components/app-shell/page-header";

import { Panel, Section } from "./section";

const SURFACES = [
  { token: "--background", swatch: "bg-background", use: "Page" },
  { token: "--surface", swatch: "bg-surface", use: "Cards, tables, overlays" },
  { token: "--surface-2", swatch: "bg-surface-2", use: "Headers, hover" },
  { token: "--border", swatch: "bg-border", use: "Dividers, outlines" },
  { token: "--text", swatch: "bg-foreground", use: "Body text" },
  { token: "--text-muted", swatch: "bg-muted-foreground", use: "Secondary" },
];

const SEMANTIC = [
  { token: "--primary", swatch: "bg-primary", use: "Primary action, focus" },
  { token: "--success", swatch: "bg-success", use: "Verified good state" },
  { token: "--warning", swatch: "bg-warning", use: "Needs attention" },
  { token: "--danger", swatch: "bg-danger", use: "Failed or destructive" },
  { token: "--info", swatch: "bg-info", use: "Pending, neutral" },
];

const TYPE_SCALE = [
  { size: "30", className: "text-3xl font-semibold" },
  { size: "24", className: "text-2xl font-semibold" },
  { size: "20", className: "text-xl font-semibold" },
  { size: "16", className: "text-lg" },
  { size: "14", className: "text-base" },
  { size: "13", className: "text-sm" },
  { size: "12", className: "text-xs" },
];

function Swatches({ items }: { items: typeof SURFACES }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ token, swatch, use }) => (
        <li
          key={token}
          className="flex items-center gap-3 rounded-xl border bg-surface p-3"
        >
          <span
            aria-hidden
            className={`size-10 shrink-0 rounded-md border ${swatch}`}
          />
          <span className="min-w-0">
            <span className="block font-mono text-sm">{token}</span>
            <span className="block text-sm text-muted-foreground">{use}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function TokensPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Tokens"
        description="Colour, type, radius and spacing tokens from the design brief. Switch theme in the top bar to compare light and dark."
      />
      <Section title="Surfaces and text">
        <Swatches items={SURFACES} />
      </Section>
      <Section
        title="Semantic colour"
        description="Status colours mean verified states only. Pending is neutral, never green."
      >
        <Swatches items={SEMANTIC} />
      </Section>
      <Section
        title="Type scale"
        description="Geist for the interface, Geist Mono for DNS values, IDs, commits and amounts. Numerals are tabular."
      >
        <Panel>
          <ul className="space-y-3">
            {TYPE_SCALE.map(({ size, className }) => (
              <li key={size} className="flex items-baseline gap-4">
                <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">
                  {size}
                </span>
                <span className={className}>Renewal due in 12 days</span>
              </li>
            ))}
            <li className="flex items-baseline gap-4">
              <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">
                mono
              </span>
              <span className="font-mono">
                203.0.113.10 · a1b2c3d · 1,204.50
              </span>
            </li>
          </ul>
        </Panel>
      </Section>
      <Section
        title="Radius and spacing"
        description="Two radii only: 6 px for controls, 10 px for cards and dialogs. Spacing follows a 4 px grid."
      >
        <Panel>
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-2">
              <div className="h-10 w-28 rounded-md border bg-surface-2" />
              <p className="text-sm text-muted-foreground">Control · 6 px</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 w-40 rounded-xl border bg-surface-2" />
              <p className="text-sm text-muted-foreground">Card · 10 px</p>
            </div>
          </div>
        </Panel>
      </Section>
    </PageContainer>
  );
}
