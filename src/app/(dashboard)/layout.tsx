"use client";

import { useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { SkipLink } from "@/components/ui/skip-link";
import { RoleProvider } from "@/lib/role-context";
import { Toaster } from "@/components/ui/sonner";
import type { Role } from "@/lib/types";

/** Derive breadcrumbs from pathname. */
function useBreadcrumbs(): { label: string; href?: string }[] {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    requests: "Requests",
    relocate: "Relocate Account",
    personnel: "Personnel",
    settings: "Settings",
  };

  // Segments that have no corresponding page and should be omitted from the
  // trail. "/requests/new" has no page — the form lives at
  // "/requests/new/relocate" — so "new" would produce a dead intermediate link.
  const SKIP_SEGMENTS = new Set(["new"]);

  const crumbs: { label: string; href?: string }[] = [
    { label: "MAMS", href: "/dashboard" },
  ];

  let path = "";
  segments.forEach((seg, idx) => {
    path += `/${seg}`;
    if (SKIP_SEGMENTS.has(seg)) return;

    const label =
      LABELS[seg] ??
      (seg.startsWith("REQ-")
        ? seg
        : seg.charAt(0).toUpperCase() + seg.slice(1));

    crumbs.push({
      label,
      href: idx < segments.length - 1 ? path : undefined,
    });
  });

  return crumbs;
}

const VALID_ROLES: Role[] = ["admin", "approver", "user"];

function DashboardInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role");
  const initialRole: Role =
    rawRole && VALID_ROLES.includes(rawRole as Role)
      ? (rawRole as Role)
      : "admin";

  const [mobileOpen, setMobileOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs();

  return (
    <RoleProvider initialRole={initialRole}>
      <SkipLink />

      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:shrink-0">
          <AppSidebar />
        </aside>

        {/* Mobile sidebar (Sheet) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="w-64 p-0"
            aria-label="Navigation menu"
          >
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            onMenuOpen={() => setMobileOpen(true)}
            breadcrumbs={breadcrumbs}
          />

          <main
            id="main-content"
            className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>

      <Toaster position="bottom-right" richColors />
    </RoleProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Suspense boundary required because useSearchParams needs it in App Router
  return (
    <Suspense>
      <DashboardInner>{children}</DashboardInner>
    </Suspense>
  );
}
