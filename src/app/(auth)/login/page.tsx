"use client";

import { useRouter } from "next/navigation";
import { Shield, ShieldCheck, Users, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SkipLink } from "@/components/ui/skip-link";
import type { Role } from "@/lib/types";

interface RoleOption {
  role: Role;
  label: string;
  description: string;
  persona: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "admin",
    label: "Administrator",
    description:
      "View all requests, submit on behalf of personnel, manage the full approval queue.",
    persona: "Maj Sarah Chen · HQJOC",
    icon: ShieldCheck,
  },
  {
    role: "approver",
    label: "Approver",
    description:
      "Review requests assigned to you, complete checklists, and record approval decisions.",
    persona: "WO2 David Hartley · 6th Brigade",
    icon: Users,
  },
  {
    role: "user",
    label: "Standard User",
    description:
      "Submit requests for yourself and track the progress of your own submissions.",
    persona: "Cpl James Nguyen · 1st Signals Regiment",
    icon: User,
  },
];

export default function LoginPage() {
  const router = useRouter();

  const handleEnter = (role: Role) => {
    // Role is stored in RoleProvider inside the dashboard layout.
    // We pass the selected role via a URL param so the layout can initialise correctly.
    router.push(`/dashboard?role=${role}`);
  };

  return (
    <>
      <SkipLink />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <main id="main-content" className="w-full max-w-2xl" tabIndex={-1}>
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-md">
              <Shield className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              My Account Management System
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Defence ICT Account &amp; Identity Management
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
              Prototype — select a role to explore the system
            </div>
          </div>

          {/* Role selection cards */}
          <fieldset>
            <legend className="sr-only">Select a role to continue</legend>
            <div className="grid gap-3 sm:grid-cols-3" role="list">
              {ROLE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.role}
                    className="cursor-pointer border-border transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring"
                    role="listitem"
                  >
                    <CardContent className="flex flex-col gap-3 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
                        </div>
                        <span className="font-semibold text-foreground text-sm">
                          {option.label}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {option.description}
                      </p>

                      <p className="text-xs text-muted-foreground/70 italic">
                        {option.persona}
                      </p>

                      <Button
                        size="sm"
                        className="mt-1 w-full gap-1.5"
                        onClick={() => handleEnter(option.role)}
                        aria-label={`Continue as ${option.label}`}
                      >
                        Continue
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </fieldset>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            This prototype contains no real data and no authentication. It
            demonstrates UI and interaction design only.
          </p>
        </main>
      </div>
    </>
  );
}
