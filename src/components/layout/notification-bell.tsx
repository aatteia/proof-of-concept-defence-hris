"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { REQUESTS, REQUEST_TYPE_LABELS } from "@/lib/mock-data";
import { formatDistanceToNow } from "@/lib/date-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type NotificationKind =
  | "submitted"
  | "assigned"
  | "under-review"
  | "approved"
  | "rejected";

interface AppNotification {
  id: string;
  requestId: string;
  text: string;
  timestamp: string;
  kind: NotificationKind;
}

// ── Notification derivation ───────────────────────────────────────────────────

/**
 * Derives the list of notifications relevant to the active user and role.
 *
 * - admin:    all submission events (monitors new requests across the system)
 * - approver: assignment events on requests assigned to them
 * - user:     status-change events (assigned, under-review, approved, rejected)
 *             on requests they personally submitted
 */
function deriveNotifications(
  activeRole: Role,
  activeUserId: string
): AppNotification[] {
  const results: AppNotification[] = [];

  for (const req of REQUESTS) {
    if (activeRole === "user") {
      // Only requests this user submitted
      if (req.submittedBy.id !== activeUserId) continue;

      for (const event of req.history) {
        if (
          event.type === "assigned" ||
          event.type === "under-review" ||
          event.type === "approved" ||
          event.type === "rejected"
        ) {
          const textByKind: Record<string, string> = {
            assigned: `${req.id} has been assigned for review`,
            "under-review": `${req.id} is now under review`,
            approved: `${req.id} has been approved`,
            rejected: `${req.id} has been rejected`,
          };

          results.push({
            id: event.id,
            requestId: req.id,
            text: textByKind[event.type] ?? event.type,
            timestamp: event.timestamp,
            kind: event.type as NotificationKind,
          });
        }
      }
    } else if (activeRole === "approver") {
      // Requests assigned to this approver — one notification per request
      if (req.assignedApproverId !== activeUserId) continue;

      const assignedEvent = req.history.find((e) => e.type === "assigned");
      if (!assignedEvent) continue;

      results.push({
        id: assignedEvent.id,
        requestId: req.id,
        text: `${req.applicant.name} — ${REQUEST_TYPE_LABELS[req.type]} requires your review`,
        timestamp: assignedEvent.timestamp,
        kind: "assigned",
      });
    } else {
      // Admin — all submission events (new requests entering the system)
      const submittedEvent = req.history.find((e) => e.type === "submitted");
      if (!submittedEvent) continue;

      results.push({
        id: submittedEvent.id,
        requestId: req.id,
        text: `${req.submittedBy.name} submitted ${REQUEST_TYPE_LABELS[req.type]} for ${req.applicant.name}`,
        timestamp: submittedEvent.timestamp,
        kind: "submitted",
      });
    }
  }

  // Newest first
  return results.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// ── Kind colours ──────────────────────────────────────────────────────────────

const KIND_DOT_CLASS: Record<NotificationKind, string> = {
  submitted: "bg-primary",
  assigned: "bg-amber-500",
  "under-review": "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-destructive",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function NotificationBell() {
  const { activeRole, activeUser } = useRole();
  const [seen, setSeen] = useState(false);

  // Treat notifications as unread again whenever the active role changes
  // (role switch simulates signing in as a different user)
  useEffect(() => {
    setSeen(false);
  }, [activeRole]);

  const notifications = useMemo(
    () => deriveNotifications(activeRole, activeUser.id),
    [activeRole, activeUser.id]
  );

  const unreadCount = seen ? 0 : notifications.length;

  // Mark all as seen when the dropdown opens
  const handleOpenChange = (open: boolean) => {
    if (open) setSeen(true);
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          "text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "data-popup-open:bg-accent data-popup-open:text-accent-foreground"
        )}
        aria-label={
          unreadCount > 0
            ? `Notifications — ${unreadCount} unread`
            : "Notifications — none unread"
        }
      >
        <Bell className="h-4.5 w-4.5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary"
            aria-hidden="true"
          />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <DropdownMenuLabel className="px-0 py-0 text-sm font-semibold text-foreground">
            Notifications
          </DropdownMenuLabel>
          {notifications.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {notifications.length}{" "}
              {notifications.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {/* Empty state */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <CheckCheck
              className="h-5 w-5 text-muted-foreground/50"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">You are up to date.</p>
          </div>
        ) : (
          /* Notification list */
          <ul
            className="max-h-80 divide-y divide-border overflow-y-auto"
            role="list"
            aria-label="Notifications"
          >
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "px-3 py-3 transition-colors hover:bg-accent/40",
                  // Left border marks unread items (cleared once the panel is opened)
                  !seen && "border-l-2 border-primary"
                )}
              >
                <div className="flex items-start gap-2.5">
                  {/* Kind indicator dot */}
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      KIND_DOT_CLASS[n.kind]
                    )}
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-snug text-foreground">
                      {n.text}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Link
                        href={`/requests/${n.requestId}`}
                        className="rounded font-mono text-[11px] text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {n.requestId}
                      </Link>
                      <span className="text-[11px] text-muted-foreground/60">
                        {formatDistanceToNow(n.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer — visible only when there are notifications */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2">
              <p className="text-[11px] text-muted-foreground">
                Showing the {notifications.length} most recent{" "}
                {notifications.length === 1 ? "notification" : "notifications"}{" "}
                for your role.
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
