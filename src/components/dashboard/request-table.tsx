"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileX,
  RotateCcw,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REQUEST_TYPE_LABELS } from "@/lib/mock-data";
import type { Request, RequestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Sort types ────────────────────────────────────────────────────────────────

type SortColumn =
  | "id"
  | "type"
  | "applicant"
  | "status"
  | "priority"
  | "submitted";

type SortDirection = "asc" | "desc";

interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

/** Default: newest submission first — matches the visual order from mock data. */
const DEFAULT_SORT: SortState = { column: "submitted", direction: "desc" };

/** Workflow order for status: pending leads, cancelled trails. */
const STATUS_ORDER: Record<RequestStatus, number> = {
  pending: 0,
  "in-progress": 1,
  approved: 2,
  rejected: 3,
  cancelled: 4,
};

/** Human-readable column name for the sort indicator bar. */
const COLUMN_LABELS: Record<SortColumn, string> = {
  id: "Request ID",
  type: "Type",
  applicant: "Applicant",
  status: "Status",
  priority: "Priority",
  submitted: "Date submitted",
};

// ── Sort logic ────────────────────────────────────────────────────────────────

function sortRequests(requests: Request[], sort: SortState): Request[] {
  return [...requests].sort((a, b) => {
    let cmp = 0;

    switch (sort.column) {
      case "id":
        cmp = a.id.localeCompare(b.id);
        break;
      case "type":
        cmp = REQUEST_TYPE_LABELS[a.type].localeCompare(
          REQUEST_TYPE_LABELS[b.type]
        );
        break;
      case "applicant":
        cmp = a.applicant.name.localeCompare(b.applicant.name);
        break;
      case "status":
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        break;
      case "priority":
        // asc → urgent (0) before routine (1)
        cmp =
          (a.priority === "urgent" ? 0 : 1) -
          (b.priority === "urgent" ? 0 : 1);
        break;
      case "submitted":
        cmp =
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        break;
    }

    return sort.direction === "asc" ? cmp : -cmp;
  });
}

// ── Sortable header cell ──────────────────────────────────────────────────────

interface SortableHeadProps {
  column: SortColumn;
  label: string;
  sort: SortState;
  onSort: (col: SortColumn) => void;
  className?: string;
}

function SortableHead({
  column,
  label,
  sort,
  onSort,
  className,
}: SortableHeadProps) {
  const isActive = sort.column === column;
  const isAsc = isActive && sort.direction === "asc";
  const isDesc = isActive && sort.direction === "desc";

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors group",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-sort={isActive ? (isAsc ? "ascending" : "descending") : "none"}
      >
        {label}
        <span aria-hidden="true" className="shrink-0">
          {isAsc ? (
            <ChevronUp className="h-3 w-3 text-primary" />
          ) : isDesc ? (
            <ChevronDown className="h-3 w-3 text-primary" />
          ) : (
            <ChevronsUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
          )}
        </span>
      </button>
    </TableHead>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface RequestTableProps {
  requests: Request[];
  caption: string;
  /** Suppress Applicant and Priority columns for compact contexts. */
  compact?: boolean;
}

export function RequestTable({
  requests,
  caption,
  compact = false,
}: RequestTableProps) {
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

  const isDefaultSort =
    sort.column === DEFAULT_SORT.column &&
    sort.direction === DEFAULT_SORT.direction;

  const handleSort = (column: SortColumn) => {
    setSort((prev) =>
      prev.column === column
        ? { column, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "asc" }
    );
  };

  const handleReset = () => setSort(DEFAULT_SORT);

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-14 text-center">
        <FileX className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
        <p className="text-sm font-medium text-muted-foreground">
          No requests to show
        </p>
        <p className="text-xs text-muted-foreground/60 max-w-[240px]">
          Requests will appear here once they have been submitted.
        </p>
      </div>
    );
  }

  const sorted = sortRequests(requests, sort);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Sort status bar — only visible when sort differs from the default */}
      {!isDefaultSort && (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/20 px-4 py-2">
          <p className="text-xs text-muted-foreground">
            Sorted by{" "}
            <span className="font-medium text-foreground">
              {COLUMN_LABELS[sort.column]}
            </span>{" "}
            &mdash;{" "}
            {sort.direction === "asc" ? "ascending" : "descending"}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-6 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Reset table sort to default order"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Reset
          </Button>
        </div>
      )}

      <Table>
        <caption className="sr-only">{caption}</caption>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <SortableHead
              column="id"
              label="Request ID"
              sort={sort}
              onSort={handleSort}
              className="w-[130px]"
            />
            <SortableHead
              column="type"
              label="Type"
              sort={sort}
              onSort={handleSort}
            />
            {!compact && (
              <SortableHead
                column="applicant"
                label="Applicant"
                sort={sort}
                onSort={handleSort}
              />
            )}
            <SortableHead
              column="status"
              label="Status"
              sort={sort}
              onSort={handleSort}
            />
            {!compact && (
              <SortableHead
                column="priority"
                label="Priority"
                sort={sort}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
            )}
            <SortableHead
              column="submitted"
              label="Submitted"
              sort={sort}
              onSort={handleSort}
              className="hidden md:table-cell"
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((req) => (
            <TableRow
              key={req.id}
              className="hover:bg-muted/30 transition-colors"
            >
              <TableCell className="font-mono text-xs font-medium text-primary">
                <Link
                  href={`/requests/${req.id}`}
                  className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {req.id}
                </Link>
              </TableCell>
              <TableCell className="text-sm">
                {REQUEST_TYPE_LABELS[req.type]}
              </TableCell>
              {!compact && (
                <TableCell className="text-sm text-muted-foreground">
                  {req.applicant.name}
                </TableCell>
              )}
              <TableCell>
                <StatusBadge status={req.status} />
              </TableCell>
              {!compact && (
                <TableCell className="hidden lg:table-cell">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      req.priority === "urgent"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {req.priority === "urgent" ? "Urgent" : "Routine"}
                  </Badge>
                </TableCell>
              )}
              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                {formatDistanceToNow(req.submittedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
