"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X, Search, FilePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RequestTable } from "@/components/dashboard/request-table";
import { useRole } from "@/lib/role-context";
import {
  REQUESTS,
  REQUEST_TYPE_LABELS,
  getPendingForApprover,
  getRequestsBySubmitter,
} from "@/lib/mock-data";
import type { RequestStatus, RequestType } from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Filter types ──────────────────────────────────────────────────────────────

type StatusFilter = RequestStatus | "all";
type TypeFilter = RequestType | "all";
type PriorityFilter = "all" | "urgent";
type ScopeFilter = "mine" | "all"; // approver only

const VALID_STATUS_FILTERS = new Set<StatusFilter>([
  "all",
  "pending",
  "in-progress",
  "approved",
  "rejected",
]);

// ── Status chip group ─────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function StatusChips({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by status"
      className="flex flex-wrap gap-1.5"
    >
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === opt.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const { activeRole, activeUser } = useRole();
  const searchParams = useSearchParams();

  // Honour a ?status= query parameter so links like /requests?status=pending
  // open with the correct filter pre-selected. Validate against known values to
  // prevent arbitrary strings from reaching filter logic.
  const paramStatus = searchParams.get("status") as StatusFilter | null;
  const initialStatus: StatusFilter =
    paramStatus && VALID_STATUS_FILTERS.has(paramStatus) ? paramStatus : "all";

  // For approvers: start on "mine" (assigned to them), allow switching to "all"
  const [scope, setScope] = useState<ScopeFilter>(
    activeRole === "approver" ? "mine" : "all"
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [search, setSearch] = useState("");

  // ── Base dataset (role-gated) ─────────────────────────────────────────────

  const baseRequests = useMemo(() => {
    if (activeRole === "user") {
      // Standard users see only their own submissions — no scope toggle
      return getRequestsBySubmitter(activeUser.id);
    }
    if (activeRole === "approver") {
      return scope === "mine"
        ? getPendingForApprover(activeUser.id)
        : REQUESTS;
    }
    // Admin sees everything
    return REQUESTS;
  }, [activeRole, activeUser.id, scope]);

  // ── Apply filters ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseRequests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (priorityFilter === "urgent" && r.priority !== "urgent") return false;
      if (
        q &&
        !r.id.toLowerCase().includes(q) &&
        !r.applicant.name.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [baseRequests, statusFilter, typeFilter, priorityFilter, search]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const isFiltered =
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    priorityFilter !== "all" ||
    search.trim().length > 0;

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setPriorityFilter("all");
    setSearch("");
  };

  const canSubmit = activeRole === "admin" || activeRole === "user";

  const tableCaption =
    activeRole === "approver" && scope === "mine"
      ? "Requests assigned to me for approval"
      : activeRole === "user"
      ? "My submitted requests"
      : "All requests";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {activeRole === "user" ? "My Requests" : "All Requests"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeRole === "approver"
              ? "Review requests assigned to you, or browse the full queue."
              : activeRole === "user"
              ? "All requests you have submitted."
              : "Full request log across all personnel and statuses."}
          </p>
        </div>
        {canSubmit && (
          <Link
            href="/requests/new/relocate"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <FilePlus className="h-4 w-4" aria-hidden="true" />
            New Request
          </Link>
        )}
      </div>

      {/* Approver scope toggle */}
      {activeRole === "approver" && (
        <div
          role="group"
          aria-label="Request scope"
          className="flex gap-1.5"
        >
          {(["mine", "all"] as ScopeFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              aria-pressed={scope === s}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                scope === s
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {s === "mine" ? "Assigned to me" : "All requests"}
            </button>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="space-y-3">
        {/* Row 1: search */}
        <div className="relative max-w-sm">
          <Search
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search by request ID or applicant…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-background"
            aria-label="Search requests"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Row 2: status chips + type + priority */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusChips value={statusFilter} onChange={setStatusFilter} />

          {/* Type select */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className={cn(
              "h-7 rounded-full border border-input bg-background px-3 text-xs font-medium text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "transition-colors",
              typeFilter !== "all" && "border-primary text-primary"
            )}
            aria-label="Filter by request type"
          >
            <option value="all">All types</option>
            {(
              Object.keys(REQUEST_TYPE_LABELS) as RequestType[]
            ).map((t) => (
              <option key={t} value={t}>
                {REQUEST_TYPE_LABELS[t]}
              </option>
            ))}
          </select>

          {/* Priority toggle */}
          <button
            type="button"
            onClick={() =>
              setPriorityFilter((p) => (p === "all" ? "urgent" : "all"))
            }
            aria-pressed={priorityFilter === "urgent"}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              priorityFilter === "urgent"
                ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            Urgent only
          </button>
        </div>

        {/* Result count + clear */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Showing{" "}
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {baseRequests.length}
            </span>{" "}
            {baseRequests.length === 1 ? "request" : "requests"}
            {isFiltered && " (filtered)"}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-6 items-center gap-1.5 rounded px-2 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Clear all filters"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <RequestTable requests={filtered} caption={tableCaption} />
    </div>
  );
}
