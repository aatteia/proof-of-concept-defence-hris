"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { NotificationBell } from "@/components/layout/notification-bell";
import { cn } from "@/lib/utils";

interface TopBarProps {
  /** Called when the hamburger is pressed — opens the mobile Sheet */
  onMenuOpen: () => void;
  breadcrumbs: { label: string; href?: string }[];
}

export function TopBar({ onMenuOpen, breadcrumbs }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:px-6"
      )}
    >
      {/* Mobile menu trigger — hidden at desktop */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex-1 min-w-0">
        <ol className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              {idx > 0 && (
                <span className="text-muted-foreground/50" aria-hidden="true">
                  /
                </span>
              )}
              {idx === breadcrumbs.length - 1 ? (
                // Current page — non-interactive, marked for assistive technology
                <span
                  className="font-medium text-foreground truncate max-w-[160px]"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : crumb.href ? (
                // Ancestor with a known destination — navigable link
                <Link
                  href={crumb.href}
                  className={cn(
                    "text-muted-foreground truncate max-w-[120px]",
                    "transition-colors hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  )}
                >
                  {crumb.label}
                </Link>
              ) : (
                // Ancestor without a destination — label only
                <span className="text-muted-foreground truncate max-w-[120px]">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Search — visible at sm+ */}
      <div className="relative hidden sm:block w-56 lg:w-72">
        <Search
          className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search requests…"
          className="pl-8 h-8 text-sm bg-background"
          aria-label="Search requests"
        />
      </div>

      {/* Notification bell */}
      <NotificationBell />

      {/* Role switcher / user menu */}
      <RoleSwitcher />
    </header>
  );
}
