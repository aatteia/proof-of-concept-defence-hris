"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Monitor } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/lib/role-context";
import {
  useTheme,
  THEME_DEFINITIONS,
  type Theme,
} from "@/lib/theme-context";
import { cn } from "@/lib/utils";

// ── Theme swatch preview ──────────────────────────────────────────────────────

function ThemeSwatch({
  sidebar,
  bg,
  primary,
}: {
  sidebar: string;
  bg: string;
  primary: string;
}) {
  return (
    <div
      className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md border border-border"
      aria-hidden="true"
    >
      {/* Sidebar strip */}
      <div
        className="absolute inset-y-0 left-0 w-[38%]"
        style={{ background: sidebar }}
      />
      {/* Main surface */}
      <div
        className="absolute inset-y-0 right-0 w-[62%]"
        style={{ background: bg }}
      />
      {/* Primary accent dot */}
      <div
        className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full"
        style={{ background: primary }}
      />
    </div>
  );
}

// ── Theme tile ────────────────────────────────────────────────────────────────

function ThemeTile({
  definition,
  isActive,
  disabled,
  onSelect,
}: {
  definition: (typeof THEME_DEFINITIONS)[number];
  isActive: boolean;
  disabled: boolean;
  onSelect: (t: Theme) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(definition.id)}
      disabled={disabled}
      aria-pressed={isActive}
      aria-label={`${definition.label} theme${isActive ? " — active" : ""}`}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-40",
        isActive
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
      )}
    >
      <ThemeSwatch {...definition.preview} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {definition.label}
          </span>
          {isActive && (
            <Check
              className="h-3.5 w-3.5 shrink-0 text-primary"
              aria-hidden="true"
            />
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {definition.description}
        </p>
      </div>
    </button>
  );
}

// ── Notification toggle row ───────────────────────────────────────────────────

function NotificationRow({
  id,
  label,
  description,
  defaultChecked = true,
}: {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleChange = (next: boolean) => {
    setChecked(next);
    toast.success("Preferences saved", {
      description: next ? `"${label}" enabled.` : `"${label}" disabled.`,
    });
  };

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <Label
          htmlFor={id}
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          {label}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={handleChange}
        aria-label={label}
      />
    </div>
  );
}

// ── Role access descriptions ──────────────────────────────────────────────────

const ROLE_ACCESS: Record<
  string,
  { label: string; colour: string; capabilities: string[] }
> = {
  admin: {
    label: "Administrator",
    colour: "bg-primary/10 text-primary border-primary/20",
    capabilities: [
      "View and manage all requests across all personnel",
      "Submit requests on behalf of any personnel",
      "View the full personnel directory",
      "Access system-wide activity and reporting",
    ],
  },
  approver: {
    label: "Approver",
    colour: "bg-amber-50 text-amber-700 border-amber-200",
    capabilities: [
      "Review and action requests assigned to you",
      "Complete approval checklists and record decisions",
      "View the full personnel directory",
      "Submit requests for your own account",
    ],
  },
  user: {
    label: "Standard User",
    colour: "bg-muted text-muted-foreground border-border",
    capabilities: [
      "Submit new requests for your own account",
      "Track the status of your submitted requests",
      "View your own profile and request history",
    ],
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { activeRole, activeUser } = useRole();
  const { selectedTheme, setTheme, followSystem, setFollowSystem } =
    useTheme();

  const access = ROLE_ACCESS[activeRole];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences and display options.
        </p>
      </div>

      {/* ── Profile ──────────────────────────────────────────────────────── */}
      <section aria-labelledby="profile-heading">
        <h2
          id="profile-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Profile
        </h2>
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {activeUser.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold text-foreground">
                  {activeUser.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeUser.rank}
                </p>
              </div>
            </div>

            <Separator />

            <dl className="grid gap-0 divide-y divide-border">
              {[
                { label: "Service number", value: activeUser.serviceNumber },
                { label: "Unit", value: activeUser.unit },
                { label: "Location", value: activeUser.location },
                { label: "Email", value: activeUser.email },
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

            <p className="text-xs text-muted-foreground rounded-lg bg-muted/60 px-3 py-2.5">
              Profile details are managed by your unit administrator. To request
              changes, contact your unit IT administrator or submit a Personnel
              Update request via the service desk.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── Appearance ───────────────────────────────────────────────────── */}
      <section aria-labelledby="appearance-heading">
        <h2
          id="appearance-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Appearance
        </h2>
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-5">
            <p className="text-sm text-muted-foreground">
              Choose a colour scheme for the interface. Your preference is saved
              in this browser.
            </p>

            {/* Follow system toggle */}
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-3">
                <Monitor
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Follow system
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {followSystem
                      ? "Automatically matches your OS light or dark setting."
                      : "Using a manually selected theme."}
                  </p>
                </div>
              </div>
              <Switch
                id="follow-system"
                checked={followSystem}
                onCheckedChange={setFollowSystem}
                aria-label="Follow system colour scheme"
              />
            </div>

            {/* Theme grid */}
            <div
              className="grid gap-3 sm:grid-cols-2"
              role="group"
              aria-label="Colour themes"
            >
              {THEME_DEFINITIONS.map((def) => (
                <ThemeTile
                  key={def.id}
                  definition={def}
                  isActive={selectedTheme === def.id}
                  disabled={followSystem}
                  onSelect={setTheme}
                />
              ))}
            </div>

            {followSystem && (
              <p className="text-xs text-muted-foreground">
                Disable "Follow system" to choose a theme manually.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Notifications ────────────────────────────────────────────────── */}
      <section aria-labelledby="notifications-heading">
        <h2
          id="notifications-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Notifications
        </h2>
        <Card className="border-border shadow-sm">
          <CardContent className="px-5 py-1 divide-y divide-border">
            <NotificationRow
              id="notif-request-actioned"
              label="Request actioned"
              description="Email me when a request I submitted is approved or rejected."
              defaultChecked={true}
            />
            {(activeRole === "approver" || activeRole === "admin") && (
              <NotificationRow
                id="notif-assigned"
                label="Request assigned to me"
                description="Email me when a new request is assigned to me for review."
                defaultChecked={true}
              />
            )}
            {activeRole === "admin" && (
              <NotificationRow
                id="notif-new-submission"
                label="New submission (admin)"
                description="Email me when any new request is submitted to the system."
                defaultChecked={true}
              />
            )}
            <NotificationRow
              id="notif-daily-digest"
              label="Daily digest"
              description="Receive a daily summary of your pending requests each morning."
              defaultChecked={false}
            />
            {activeRole === "admin" && (
              <NotificationRow
                id="notif-weekly-summary"
                label="Weekly system summary"
                description="Receive a weekly overview of all system activity and queue health."
                defaultChecked={false}
              />
            )}
            <NotificationRow
              id="notif-maintenance"
              label="Scheduled maintenance"
              description="Notify me of upcoming planned maintenance windows."
              defaultChecked={false}
            />
          </CardContent>
        </Card>
      </section>

      {/* ── Access & Role ─────────────────────────────────────────────────── */}
      <section aria-labelledby="access-heading">
        <h2
          id="access-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Access and Role
        </h2>
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn("text-xs font-semibold px-2.5 py-1", access.colour)}
              >
                {access.label}
              </Badge>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                This role grants access to:
              </p>
              <ul className="space-y-1.5">
                {access.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2 text-sm">
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="text-foreground">{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <p className="text-xs text-muted-foreground rounded-lg bg-muted/60 px-3 py-2.5">
              System roles are assigned by your unit administrator and cannot be
              changed through this interface. To request a role change, contact
              your unit IT administrator.{" "}
              <span className="font-medium text-foreground">
                This prototype allows role switching via the user menu in the
                top bar.
              </span>
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
