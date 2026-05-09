"use client";

import Link from "next/link";
import { FilePlus, ClipboardCheck, ClipboardList, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRole } from "@/lib/role-context";
import type { Role } from "@/lib/types";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const ACTIONS: QuickAction[] = [
  {
    label: "Relocate Account",
    description: "Submit a network account relocation request",
    href: "/requests/new/relocate",
    icon: FilePlus,
    roles: ["admin", "user"],
  },
  {
    label: "Review Pending",
    description: "Open your approval queue",
    href: "/requests?status=pending",
    icon: ClipboardCheck,
    roles: ["admin", "approver"],
  },
  {
    label: "View All Requests",
    description: "Browse the full request history",
    href: "/requests",
    icon: ClipboardList,
    roles: ["admin"],
  },
];

export function QuickActions() {
  const { activeRole } = useRole();
  const visible = ACTIONS.filter((a) => a.roles.includes(activeRole));

  if (visible.length === 0) return null;

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Quick Actions
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href + action.label}
              href={action.href}
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full border-border shadow-sm transition-shadow group-hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {action.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
