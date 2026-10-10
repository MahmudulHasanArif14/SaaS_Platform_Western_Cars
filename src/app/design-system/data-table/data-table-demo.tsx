"use client";

import { useMemo, useState } from "react";

import {
  DataTable,
  type DataTableColumn,
  type PaginationState,
  type SortingState,
} from "@/components/data-table";
import { StatusBadge, type StatusTone } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

// Sample rows for the component preview only. Reserved example names and
// documentation IP ranges; not real infrastructure.
type SampleRow = {
  id: string;
  name: string;
  target: string;
  status: { tone: StatusTone; label: string };
  renews: string;
};

const STATUSES: SampleRow["status"][] = [
  { tone: "success", label: "Verified" },
  { tone: "pending", label: "Verifying DNS" },
  { tone: "warning", label: "Expires soon" },
  { tone: "danger", label: "Failed" },
];

const SAMPLE: SampleRow[] = Array.from({ length: 23 }, (_, index) => ({
  id: `sample-${index + 1}`,
  name: `site-${String(index + 1).padStart(2, "0")}.example.com`,
  target: `203.0.113.${10 + index}`,
  status: STATUSES[index % STATUSES.length] ?? { tone: "info", label: "Draft" },
  renews: `2027-${String((index % 12) + 1).padStart(2, "0")}-15`,
}));

const columns: DataTableColumn<SampleRow>[] = [
  { id: "name", accessorKey: "name", header: "Name" },
  {
    id: "target",
    accessorKey: "target",
    header: "Target",
    cell: ({ row }) => <span className="font-mono">{row.original.target}</span>,
  },
  {
    id: "status",
    accessorFn: (row) => row.status.label,
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => (
      <StatusBadge tone={row.original.status.tone}>
        {row.original.status.label}
      </StatusBadge>
    ),
  },
  { id: "renews", accessorKey: "renews", header: "Renews" },
];

const VIEWS = ["ready", "loading", "empty", "error"] as const;
type View = (typeof VIEWS)[number];

export function DataTableDemo() {
  const [view, setView] = useState<View>("ready");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });

  // Stands in for the server: sorts, then returns one page.
  const page = useMemo(() => {
    const sort = sorting[0];
    const sorted = sort
      ? [...SAMPLE].sort((a, b) => {
          const key = sort.id as "name" | "target" | "renews";
          const order = a[key].localeCompare(b[key], undefined, {
            numeric: true,
          });
          return sort.desc ? -order : order;
        })
      : SAMPLE;
    const start = pagination.pageIndex * pagination.pageSize;
    return sorted.slice(start, start + pagination.pageSize);
  }, [sorting, pagination]);

  const empty = view === "empty";

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="Table state"
        className="flex flex-wrap gap-2"
      >
        {VIEWS.map((option) => (
          <Button
            key={option}
            variant={view === option ? "secondary" : "outline"}
            aria-pressed={view === option}
            onClick={() => setView(option)}
            className="capitalize"
          >
            {option}
          </Button>
        ))}
      </div>
      <DataTable
        label="Sample records"
        columns={columns}
        data={view === "ready" ? page : []}
        rowCount={view === "ready" ? SAMPLE.length : 0}
        getRowId={(row) => row.id}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={pagination}
        onPaginationChange={setPagination}
        status={empty ? "ready" : view}
        errorReferenceId="demo-0000"
        onRetry={() => setView("ready")}
        mobile={{
          title: "name",
          status: "status",
          fields: ["target", "renews"],
        }}
      />
    </div>
  );
}
