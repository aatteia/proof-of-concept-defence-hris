import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDateTime } from "@/lib/date-utils";
import { REQUESTS } from "@/lib/mock-data";
import type { HistoryEvent } from "@/lib/types";

const EVENT_LABELS: Record<HistoryEvent["type"], string> = {
  submitted: "submitted a request",
  assigned: "was assigned a request",
  "under-review": "started reviewing",
  approved: "approved a request",
  rejected: "rejected a request",
  comment: "added a comment",
};

/** Derive a flat list of recent events from all requests, newest first. */
function getRecentActivity(limit: number): (HistoryEvent & { requestId: string })[] {
  const events = REQUESTS.flatMap((r) =>
    r.history.map((h) => ({ ...h, requestId: r.id }))
  );
  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return events.slice(0, limit);
}

export function ActivityFeed() {
  const events = getRecentActivity(8);

  return (
    <section aria-labelledby="activity-heading" className="flex flex-col gap-0">
      <h2
        id="activity-heading"
        className="mb-4 text-sm font-semibold text-foreground"
      >
        Recent Activity
      </h2>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        <ol className="space-y-4" aria-label="Recent activity list">
          {events.map((event) => (
            <li key={event.id} className="flex items-start gap-3">
              <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {event.actor.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed text-foreground">
                  <span className="font-medium">{event.actor.name}</span>{" "}
                  <span className="text-muted-foreground">
                    {EVENT_LABELS[event.type]}
                  </span>{" "}
                  <Link
                    href={`/requests/${event.requestId}`}
                    className="font-mono text-primary text-[11px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {event.requestId}
                  </Link>
                </p>
                <time
                  className="text-[11px] text-muted-foreground/60"
                  dateTime={event.timestamp}
                >
                  {formatDateTime(event.timestamp)}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
