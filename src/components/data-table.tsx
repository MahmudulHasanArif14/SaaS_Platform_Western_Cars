"use client";

import {
  type Cell,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  rowPaginationFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
} from "lucide-react";

import { EmptyState, ErrorState } from "@/components/state-view";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Must be stable across renders, so it lives at module scope.
const features = tableFeatures({ rowSortingFeature, rowPaginationFeature });
type Features = typeof features;

export type DataTableColumn<TData extends RowData> = ColumnDef<Features, TData>;
export type { PaginationState, SortingState };

const SKELETON_ROWS = 5;

type DataTableProps<TData extends RowData> = {
  // Accessible name of the table.
  label: string;
  columns: DataTableColumn<TData>[];
  // One page of rows, already sorted and paginated by the server.
  data: TData[];
  // Total rows across all pages.
  rowCount: number;
  getRowId: (row: TData) => string;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  status?: "ready" | "loading" | "error";
  // Shown when status is "error".
  errorReferenceId?: string;
  onRetry?: () => void;
  // Shown when there are no rows.
  empty?: React.ReactNode;
  // Below 768 px rows become cards: a title, a status and up to three fields,
  // referenced by column id.
  mobile: { title: string; status?: string; fields: string[] };
};

export function DataTable<TData extends RowData>({
  label,
  columns,
  data,
  rowCount,
  getRowId,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  status = "ready",
  errorReferenceId,
  onRetry,
  empty,
  mobile,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    columns,
    data,
    rowCount,
    getRowId,
    state: { sorting, pagination },
    onSortingChange,
    onPaginationChange,
    manualSorting: true,
    manualPagination: true,
  });

  const rows = table.getRowModel().rows;
  const columnCount = table.getAllColumns().length;
  const first = rowCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize;
  const last = Math.min(first + pagination.pageSize, rowCount);

  const placeholder =
    status === "error" ? (
      <ErrorState
        title={`Couldn't load ${label.toLowerCase()}`}
        referenceId={errorReferenceId}
        action={
          onRetry ? (
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          ) : null
        }
      />
    ) : status === "ready" && rows.length === 0 ? (
      (empty ?? <EmptyState />)
    ) : null;

  return (
    <div className="overflow-hidden rounded-xl border bg-surface">
      {/* Desktop and tablet */}
      <div className="max-md:hidden" aria-busy={status === "loading"}>
        <Table aria-label={label}>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      className="h-10 bg-surface-2 text-xs font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="-mx-1 inline-flex min-h-6 items-center gap-1 rounded-sm px-1 hover:text-foreground"
                          onClick={() => header.column.toggleSorting()}
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ArrowUpIcon aria-hidden className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDownIcon aria-hidden className="size-3.5" />
                          ) : (
                            <ChevronsUpDownIcon
                              aria-hidden
                              className="size-3.5 opacity-60"
                            />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {status === "loading" ? (
              Array.from({ length: SKELETON_ROWS }, (_, row) => (
                <TableRow key={row} className="hover:bg-transparent">
                  {Array.from({ length: columnCount }, (_, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : placeholder ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount}>{placeholder}</TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden" aria-busy={status === "loading"}>
        {status === "loading" ? (
          <ul aria-label={label} className="divide-y">
            {Array.from({ length: SKELETON_ROWS }, (_, row) => (
              <li key={row} className="space-y-2 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </li>
            ))}
          </ul>
        ) : placeholder ? (
          placeholder
        ) : (
          <ul aria-label={label} className="divide-y">
            {rows.map((row) => {
              const cells = new Map<string, Cell<Features, TData>>(
                row.getAllCells().map((cell) => [cell.column.id, cell]),
              );
              const title = cells.get(mobile.title);
              const badge = mobile.status
                ? cells.get(mobile.status)
                : undefined;
              return (
                <li key={row.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 font-medium">
                      {title ? <table.FlexRender cell={title} /> : null}
                    </div>
                    {badge ? <table.FlexRender cell={badge} /> : null}
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    {mobile.fields.map((id) => {
                      const cell = cells.get(id);
                      if (!cell) return null;
                      const header = cell.column.columnDef.header;
                      return (
                        <div key={id} className="contents">
                          <dt className="text-muted-foreground">
                            {typeof header === "string" ? header : id}
                          </dt>
                          <dd className="min-w-0 truncate">
                            <table.FlexRender cell={cell} />
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t px-4 py-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {status === "ready"
            ? rowCount === 0
              ? "No results"
              : `${first + 1}–${last} of ${rowCount}`
            : status === "loading"
              ? "Loading…"
              : "Not loaded"}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={status !== "ready" || !table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeftIcon strokeWidth={1.75} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={status !== "ready" || !table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRightIcon strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </div>
  );
}
