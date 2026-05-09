import { cn } from "@/lib/utils";
import type { Request } from "@/lib/types";

interface StatusBadgeProps {
  status: Request["status"];
  className?: string;
}

const CONFIG: Record<
  Request["status"],
  { label: string; classes: string; dotColor: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border border-amber-200",
    dotColor: "bg-amber-500",
  },
  "in-progress": {
    label: "In Progress",
    classes: "bg-blue-50 text-blue-700 border border-blue-200",
    dotColor: "bg-blue-500",
  },
  approved: {
    label: "Approved",
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-red-50 text-red-700 border border-red-200",
    dotColor: "bg-red-500",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-gray-100 text-gray-500 border border-gray-200",
    dotColor: "bg-gray-400",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, classes, dotColor } = CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        classes,
        className
      )}
    >
      {/* Dot is decorative — the text label carries the meaning */}
      <span
        className={cn("h-1.5 w-1.5 rounded-full", dotColor)}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
