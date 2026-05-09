import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDateTime } from "@/lib/date-utils";
import type { HistoryEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const EVENT_LABELS: Record<HistoryEvent["type"], string> = {
  submitted: "Request submitted",
  assigned: "Assigned for review",
  "under-review": "Review commenced",
  approved: "Request approved",
  rejected: "Request rejected",
  comment: "Comment added",
};

const EVENT_COLORS: Record<HistoryEvent["type"], string> = {
  submitted: "bg-blue-500",
  assigned: "bg-gray-400",
  "under-review": "bg-amber-400",
  approved: "bg-emerald-500",
  rejected: "bg-red-500",
  comment: "bg-gray-400",
};

interface HistoryTimelineProps {
  events: HistoryEvent[];
}

export function HistoryTimeline({ events }: HistoryTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No history recorded yet.
      </p>
    );
  }

  return (
    <ol aria-label="Request history" className="space-y-0">
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <li key={event.id} className="relative flex gap-4">
            {/* Vertical line */}
            {!isLast && (
              <div
                className="absolute left-3.5 top-8 w-0.5 h-full -ml-px bg-border"
                aria-hidden="true"
              />
            )}

            {/* Dot */}
            <div
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5",
                EVENT_COLORS[event.type]
              )}
              aria-hidden="true"
            />

            {/* Content */}
            <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-medium text-foreground">
                  {EVENT_LABELS[event.type]}
                </span>
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={event.timestamp}
                >
                  {formatDateTime(event.timestamp)}
                </time>
              </div>

              <p className="mt-0.5 text-xs text-muted-foreground">
                By{" "}
                <span className="font-medium text-foreground">
                  {event.actor.name}
                </span>{" "}
                · {event.actor.unit}
              </p>

              {event.note && (
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed rounded-md bg-muted/50 px-3 py-2 border border-border">
                  {event.note}
                </p>
              )}

              {/* Avatar */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                    {event.actor.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[11px] text-muted-foreground/70">
                  {event.actor.email}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
