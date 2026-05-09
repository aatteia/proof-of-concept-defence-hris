"use client";

import { ChevronDown, ShieldCheck, Users, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRole } from "@/lib/role-context";
import { ROLE_DEFINITIONS } from "@/lib/mock-data";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<Role, React.ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  approver: Users,
  user: User,
};

export function RoleSwitcher() {
  const { activeRole, activeUser, setRole } = useRole();
  const Icon = ROLE_ICONS[activeRole];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-foreground",
          "transition-colors hover:bg-accent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label={`Active role: ${activeUser.name}. Click to switch role.`}
      >
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {activeUser.initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:block max-w-[120px] truncate">
          {activeUser.name}
        </span>
        <span className="hidden sm:flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          <Icon className="h-3 w-3" aria-hidden="true" />
          {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Switch role (demo)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {ROLE_DEFINITIONS.map((def) => {
          const RoleIcon = ROLE_ICONS[def.id];
          const isActive = def.id === activeRole;

          return (
            <DropdownMenuItem
              key={def.id}
              onClick={() => setRole(def.id)}
              className={cn(
                "flex flex-col items-start gap-0.5 py-2.5",
                isActive && "bg-accent"
              )}
            >
              <span className="flex w-full items-center gap-2 font-medium text-sm">
                <RoleIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                {def.label}
                {isActive && (
                  <span className="ml-auto text-xs text-primary font-semibold">
                    Active
                  </span>
                )}
              </span>
              <span className="ml-6 text-xs text-muted-foreground">
                {def.description}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
