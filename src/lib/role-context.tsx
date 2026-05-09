"use client";

import React, { createContext, useContext, useState } from "react";
import type { Role, User } from "@/lib/types";
import {
  ADMIN_USER,
  APPROVER_USER,
  STANDARD_USER,
} from "@/lib/mock-data";

interface RoleContextValue {
  activeRole: Role;
  activeUser: User;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

/** Maps each role to the corresponding mock persona. */
const ROLE_TO_USER: Record<Role, User> = {
  admin: ADMIN_USER,
  approver: APPROVER_USER,
  user: STANDARD_USER,
};

interface RoleProviderProps {
  children: React.ReactNode;
  /** Initial role — defaults to admin so the dashboard loads in admin view. */
  initialRole?: Role;
}

export function RoleProvider({
  children,
  initialRole = "admin",
}: RoleProviderProps) {
  const [activeRole, setActiveRole] = useState<Role>(initialRole);

  const setRole = (role: Role) => {
    setActiveRole(role);
  };

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        activeUser: ROLE_TO_USER[activeRole],
        setRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

/** Must be used inside RoleProvider. Throws if called outside context. */
export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}
