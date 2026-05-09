"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Search, Lock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRole } from "@/lib/role-context";
import { USERS, REQUESTS, REQUEST_TYPE_LABELS } from "@/lib/mock-data";
import type { User, Role } from "@/lib/types";
import { formatDistanceToNow } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

// ── Role badge ────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<Role, { label: string; className: string }> = {
  admin: {
    label: "Admin",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  approver: {
    label: "Approver",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  user: {
    label: "User",
    className: "border-border bg-muted text-muted-foreground",
  },
};

// ── Expanded request list ─────────────────────────────────────────────────────

function PersonRequests({ userId }: { userId: string }) {
  const requests = REQUESTS.filter((r) => r.submittedBy.id === userId);

  if (requests.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No requests submitted.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5" aria-label="Submitted requests">
      {requests.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-center gap-2 rounded-lg bg-background px-3 py-2"
        >
          <Link
            href={`/requests/${r.id}`}
            className="font-mono text-[11px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {r.id}
          </Link>
          <span className="text-xs text-muted-foreground">
            {REQUEST_TYPE_LABELS[r.type]}
          </span>
          <StatusBadge status={r.status} />
          <span className="ml-auto text-[11px] text-muted-foreground/60">
            {formatDistanceToNow(r.submittedAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Personnel row ─────────────────────────────────────────────────────────────

function PersonnelRow({
  user,
  isExpanded,
  onToggle,
}: {
  user: User;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const requestCount = REQUESTS.filter(
    (r) => r.submittedBy.id === user.id
  ).length;
  const badge = ROLE_BADGE[user.role];
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <>
      <tr
        className={cn(
          "border-b border-border transition-colors cursor-pointer select-none",
          isExpanded
            ? "bg-muted/40"
            : "hover:bg-muted/30"
        )}
        onClick={onToggle}
        aria-expanded={isExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-label={`${user.name} — click to ${isExpanded ? "collapse" : "expand"} request history`}
      >
        {/* Expand indicator */}
        <td className="w-8 pl-4 pr-0 py-3">
          <ChevronIcon
            className="h-3.5 w-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        </td>

        {/* Name + initials */}
        <td className="py-3 pr-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">
                {user.email}
              </p>
            </div>
          </div>
        </td>

        {/* Rank */}
        <td className="py-3 pr-4 text-sm text-muted-foreground hidden md:table-cell">
          {user.rank}
        </td>

        {/* Service number */}
        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground hidden lg:table-cell">
          {user.serviceNumber}
        </td>

        {/* Unit */}
        <td className="py-3 pr-4 text-sm text-muted-foreground hidden xl:table-cell max-w-[180px]">
          <span className="truncate block">{user.unit}</span>
        </td>

        {/* System role */}
        <td className="py-3 pr-4">
          <Badge variant="outline" className={cn("text-xs", badge.className)}>
            {badge.label}
          </Badge>
        </td>

        {/* Request count */}
        <td className="py-3 pr-4 text-right">
          {requestCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
              {requestCount}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/40">—</span>
          )}
        </td>
      </tr>

      {/* Expanded panel */}
      {isExpanded && (
        <tr className="border-b border-border bg-muted/20">
          <td colSpan={7} className="px-12 py-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Submitted requests
            </p>
            <PersonRequests userId={user.id} />
          </td>
        </tr>
      )}
    </>
  );
}

// ── Standard user own-profile view ───────────────────────────────────────────

function OwnProfileView({ user }: { user: User }) {
  const requests = REQUESTS.filter((r) => r.submittedBy.id === user.id);
  const badge = ROLE_BADGE[user.role];

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold text-foreground">
                {user.name}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{user.rank}</p>
                <Badge
                  variant="outline"
                  className={cn("text-xs", badge.className)}
                >
                  {badge.label}
                </Badge>
              </div>
            </div>
          </div>

          <dl className="grid gap-0 divide-y divide-border">
            {[
              { label: "Service number", value: user.serviceNumber },
              { label: "Unit", value: user.unit },
              { label: "Location", value: user.location },
              { label: "Email", value: user.email },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="grid grid-cols-[160px_1fr] gap-2 py-2.5"
              >
                <dt className="text-xs font-medium text-muted-foreground self-center">
                  {label}
                </dt>
                <dd className="text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          My Requests
        </h2>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have not submitted any requests yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
              >
                <Link
                  href={`/requests/${r.id}`}
                  className="font-mono text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {r.id}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {REQUEST_TYPE_LABELS[r.type]}
                </span>
                <StatusBadge status={r.status} />
                <span className="ml-auto text-xs text-muted-foreground/60">
                  {formatDistanceToNow(r.submittedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type RoleFilter = Role | "all";

export default function PersonnelPage() {
  const { activeRole, activeUser } = useRole();

  // Standard users see only their own profile
  if (activeRole === "user") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 w-fit">
            <Lock className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-xs text-amber-700">
              The personnel directory is restricted to administrators and approvers.
            </p>
          </div>
        </div>
        <OwnProfileView user={activeUser} />
      </div>
    );
  }

  // Admin/approver: full directory
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const units = useMemo(
    () => Array.from(new Set(USERS.map((u) => u.unit))).sort(),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return USERS.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (unitFilter !== "all" && u.unit !== unitFilter) return false;
      if (
        q &&
        !u.name.toLowerCase().includes(q) &&
        !u.rank.toLowerCase().includes(q) &&
        !u.serviceNumber.includes(q) &&
        !u.unit.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [search, roleFilter, unitFilter]);

  const toggleRow = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const isFiltered =
    search.trim().length > 0 || roleFilter !== "all" || unitFilter !== "all";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Personnel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All personnel registered in MAMS. Click a row to view their submitted
          requests.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Name, rank, or service number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm w-64 bg-background"
            aria-label="Search personnel"
          />
        </div>

        {/* Unit filter */}
        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className={cn(
            "h-8 rounded-lg border border-input bg-background px-3 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            unitFilter !== "all" && "border-primary text-primary"
          )}
          aria-label="Filter by unit"
        >
          <option value="all">All units</option>
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        {/* Role filter chips */}
        <div role="group" aria-label="Filter by system role" className="flex gap-1.5">
          {(["all", "admin", "approver", "user"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              aria-pressed={roleFilter === r}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                roleFilter === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {r === "all" ? "All roles" : r === "user" ? "User" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Count */}
        <p
          className="ml-auto text-xs text-muted-foreground"
          aria-live="polite"
        >
          <span className="font-medium text-foreground">{filtered.length}</span>{" "}
          of{" "}
          <span className="font-medium text-foreground">{USERS.length}</span>{" "}
          personnel
          {isFiltered && " (filtered)"}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left" aria-label="Personnel directory">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-8" />
              <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Personnel
              </th>
              <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                Rank
              </th>
              <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">
                Service No
              </th>
              <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden xl:table-cell">
                Unit
              </th>
              <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Role
              </th>
              <th className="py-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Requests
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No personnel match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <PersonnelRow
                  key={user.id}
                  user={user}
                  isExpanded={expandedId === user.id}
                  onToggle={() => toggleRow(user.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
