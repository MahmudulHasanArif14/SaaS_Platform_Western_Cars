import type { Metadata } from "next";

import { PageContainer, PageHeader } from "@/components/app-shell/page-header";
import { StatusBadge } from "@/components/status-badge";

import { DataTableDemo } from "./data-table-demo";

export const metadata: Metadata = { title: "Data table" };

export default function DataTablePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Data table"
        status={<StatusBadge tone="pending">Sample data</StatusBadge>}
        description="One table pattern for every list. Sorting and paging are driven from outside the table, the way a server-backed list works. Below 768 px rows become cards."
      />
      <DataTableDemo />
    </PageContainer>
  );
}
