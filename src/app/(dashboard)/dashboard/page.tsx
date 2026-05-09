"use client";

import { ClipboardList, Clock, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RequestTable } from "@/components/dashboard/request-table";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { useRole } from "@/lib/role-context";
import {
  REQUESTS,
  getPendingForApprover,
  getRequestsBySubmitter,
  getTeamRequests,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const { activeRole, activeUser } = useRole();

  // ── Derive role-specific data ─────────────────────────────────────────────

  const pendingForMe = getPendingForApprover(activeUser.id);
  const myRequests = getRequestsBySubmitter(activeUser.id);
  const teamRequests = getTeamRequests(activeUser.id);
  const allRequests = REQUESTS;

  // Queue shown in the main table
  const tableRequests =
    activeRole === "admin"
      ? allRequests
      : activeRole === "approver"
      ? pendingForMe
      : myRequests;

  const tableCaption =
    activeRole === "admin"
      ? "All requests"
      : activeRole === "approver"
      ? "Requests pending your approval"
      : "Your submitted requests";

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats =
    activeRole === "admin"
      ? [
          {
            label: "Pending Approvals",
            value: allRequests.filter((r) => r.status === "pending").length,
            icon: Clock,
            tinted: true,
            description: "Awaiting action across all approvers",
          },
          {
            label: "My Requests",
            value: myRequests.length,
            icon: ClipboardList,
            tinted: true,
            description: "Submitted by you",
          },
          {
            label: "Team Requests",
            value: teamRequests.length,
            icon: Users,
            tinted: true,
            description: "Submitted by other personnel",
          },
        ]
      : activeRole === "approver"
      ? [
          {
            label: "Assigned to Me",
            value: pendingForMe.length,
            icon: Clock,
            tinted: true,
            description: "Pending your review",
          },
          {
            label: "In Progress",
            value: allRequests.filter(
              (r) =>
                r.assignedApproverId === activeUser.id &&
                r.status === "in-progress"
            ).length,
            icon: ClipboardList,
            tinted: true,
            description: "Under review",
          },
          {
            label: "Approved This Week",
            value: allRequests.filter(
              (r) =>
                r.assignedApproverId === activeUser.id &&
                r.status === "approved"
            ).length,
            icon: Users,
            tinted: true,
            description: "Completed by you",
          },
        ]
      : [
          {
            label: "My Requests",
            value: myRequests.length,
            icon: ClipboardList,
            tinted: true,
            description: "All your submissions",
          },
          {
            label: "Pending",
            value: myRequests.filter((r) => r.status === "pending").length,
            icon: Clock,
            tinted: true,
            description: "Awaiting approval",
          },
          {
            label: "Approved",
            value: myRequests.filter((r) => r.status === "approved").length,
            icon: Users,
            tinted: true,
            description: "Completed",
          },
        ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* ── Page heading ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeRole === "admin" &&
            "Overview of all requests and system activity."}
          {activeRole === "approver" &&
            "Your pending approval queue and recent activity."}
          {activeRole === "user" &&
            "Your requests and their current status."}
        </p>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            tinted={stat.tinted}
            description={stat.description}
          />
        ))}
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <QuickActions />

      {/* ── Main content: table + activity feed side-by-side at xl ──────── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        {/* Request table */}
        <section aria-labelledby="requests-table-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2
              id="requests-table-heading"
              className="text-sm font-semibold text-foreground"
            >
              {activeRole === "admin" && "All Requests"}
              {activeRole === "approver" && "Pending Approval"}
              {activeRole === "user" && "My Requests"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {tableRequests.length} record
              {tableRequests.length !== 1 ? "s" : ""}
            </span>
          </div>
          <RequestTable
            requests={tableRequests}
            caption={tableCaption}
          />
        </section>

        {/* Activity feed */}
        <aside className="rounded-xl border border-border bg-card p-5 shadow-sm self-start">
          <ActivityFeed />
        </aside>
      </div>
    </div>
  );
}
