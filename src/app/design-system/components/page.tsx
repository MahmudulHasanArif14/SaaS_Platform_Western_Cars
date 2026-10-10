import type { Metadata } from "next";

import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Panel, Section } from "../section";
import { FeedbackDemo } from "./feedback-demo";

export const metadata: Metadata = { title: "Status and actions" };

export default function ComponentsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Status and actions"
        status={<StatusBadge tone="pending">Sample content</StatusBadge>}
        description="Badges, buttons, confirmation and toasts. Everything on this page is sample content."
        actions={<Button>Primary action</Button>}
      />
      <Section
        title="Status badge"
        description="A dot and a label, so status never depends on colour alone. The pending dot is hollow and neutral."
      >
        <Panel>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="success">Verified</StatusBadge>
            <StatusBadge tone="warning">Expires in 12 days</StatusBadge>
            <StatusBadge tone="danger">Failed</StatusBadge>
            <StatusBadge tone="pending">Awaiting provider</StatusBadge>
            <StatusBadge tone="info">Draft</StatusBadge>
          </div>
        </Panel>
      </Section>
      <Section
        title="Buttons"
        description="Labels are verbs. One primary action per page."
      >
        <Panel>
          <div className="flex flex-wrap items-center gap-2">
            <Button>Create record</Button>
            <Button variant="outline">Export</Button>
            <Button variant="secondary">Duplicate</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive">Delete record</Button>
            <Button disabled>Unavailable</Button>
          </div>
        </Panel>
      </Section>
      <Section
        title="Confirmation and toasts"
        description="Risky actions state what changes before they run. Toasts report the real outcome."
      >
        <Panel>
          <FeedbackDemo />
        </Panel>
      </Section>
      <Section
        title="Skeleton"
        description="Loading placeholders keep the layout stable. No full-page spinners."
      >
        <Panel>
          <div className="space-y-2" aria-hidden>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Panel>
      </Section>
    </PageContainer>
  );
}
