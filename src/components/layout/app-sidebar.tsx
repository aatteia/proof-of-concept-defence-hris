"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useRole } from "@/lib/role-context";
import type { Role } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Roles that can see this item. Undefined = visible to all. */
  roles?: Role[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "New Request",
    href: "/requests/new/relocate",
    icon: FilePlus,
    roles: ["admin", "user"],
  },
  {
    label: "All Requests",
    href: "/requests",
    icon: ClipboardList,
    roles: ["admin"],
  },
  {
    label: "Approval Queue",
    href: "/requests",
    icon: ClipboardList,
    roles: ["approver"],
  },
  {
    label: "My Requests",
    href: "/requests",
    icon: ClipboardList,
    roles: ["user"],
  },
  {
    label: "Personnel",
    href: "/personnel",
    icon: Users,
    roles: ["admin"],
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}

function NavLink({ item, isActive, onClick }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-sidebar-accent text-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
      )}
    >
      <Icon
        className={cn("h-4 w-4 shrink-0", isActive && "text-primary")}
        aria-hidden="true"
      />
      {item.label}
    </Link>
  );
}

interface AppSidebarProps {
  /** Called when a nav item is clicked — used to close mobile sheet */
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const { activeRole } = useRole();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(activeRole)
  );

  return (
    <nav
      aria-label="Main navigation"
      className="flex h-full flex-col bg-sidebar"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">MAMS</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Defence
          </p>
        </div>
      </div>

      {/* Primary nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
        <ul className="space-y-0.5" role="list">
          {visibleItems.map((item) => (
            <li key={`${item.href}-${item.label}`}>
              <NavLink
                item={item}
                isActive={pathname === item.href}
                onClick={onNavigate}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom nav */}
      <div className="px-3 pb-4">
        <Separator className="mb-4" />
        <ul className="space-y-0.5" role="list">
          {BOTTOM_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                isActive={pathname === item.href}
                onClick={onNavigate}
              />
            </li>
          ))}
          <li>
            <Link
              href="/login"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              Sign out
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
