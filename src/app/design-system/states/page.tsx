import type { Metadata } from "next";

import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import {
  EmptyState,
  ErrorState,
  ForbiddenState,
} from "@/components/state-view";
import { Button } from "@/components/ui/button";

import { Section } from "../section";

export const metadata: Metadata = { title: "Page states" };

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border bg-surface">{children}</div>;
}

export default function StatesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Page states"
        description="Every list and page has a designed empty, error and no-access state."
      />
      <Section
        title="Empty"
        description="Says what belongs here and offers the first action when the viewer is allowed to take it."
      >
        <Frame>
          <EmptyState
            title="No records yet"
            description="Records you add will be listed here."
            action={<Button>Add record</Button>}
          />
        </Frame>
      </Section>
      <Section
        title="Error"
        description="What happened, what to do, and a reference ID. Never a stack trace."
      >
        <Frame>
          <ErrorState
            referenceId="demo-0000"
            action={<Button variant="outline">Try again</Button>}
          />
        </Frame>
      </Section>
      <Section
        title="No access"
        description="Deliberately generic: it never reveals whether the resource exists."
      >
        <Frame>
          <ForbiddenState />
        </Frame>
      </Section>
    </PageContainer>
  );
}
