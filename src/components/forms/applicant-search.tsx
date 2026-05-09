"use client";

import { useState, useId } from "react";
import { Search, Check, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SEARCHABLE_USERS } from "@/lib/mock-data";
import type { User } from "@/lib/types";

interface ApplicantSearchProps {
  value: User | null;
  onChange: (user: User | null) => void;
  error?: string;
}

export function ApplicantSearch({ value, onChange, error }: ApplicantSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputId = useId();
  const listId = useId();
  const errorId = useId();

  const filtered = query.trim()
    ? SEARCHABLE_USERS.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.serviceNumber.includes(query) ||
          u.rank.toLowerCase().includes(query.toLowerCase()) ||
          u.unit.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCHABLE_USERS;

  const showList = focused && !value;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>
        Applicant{" "}
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      </Label>

      {/* Selected state */}
      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {value.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{value.name}</p>
              <p className="text-xs text-muted-foreground">
                {value.serviceNumber} · {value.unit}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label={`Remove ${value.name} as applicant`}
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Search input */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search by name, service number, or unit…"
              className={cn("pl-9", error && "border-destructive")}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls={listId}
              aria-expanded={showList}
              aria-describedby={error ? errorId : undefined}
              aria-required="true"
            />
          </div>

          {/* Results list */}
          {showList && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Matching personnel"
              className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
            >
              {filtered.length === 0 ? (
                <li className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                  <UserCircle className="h-4 w-4" aria-hidden="true" />
                  No matching personnel found
                </li>
              ) : (
                filtered.map((user) => (
                  <li key={user.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none transition-colors"
                      onMouseDown={(e) => {
                        // Prevent input blur before click registers
                        e.preventDefault();
                        onChange(user);
                        setQuery("");
                      }}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.serviceNumber} · {user.unit}
                        </p>
                      </div>
                      <Check
                        className="h-4 w-4 text-primary opacity-0"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
