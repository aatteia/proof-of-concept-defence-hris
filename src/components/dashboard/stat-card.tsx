import { cn } from "@/lib/utils";
import type { LucideProps } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<LucideProps>;
  /** When true, renders with the tinted blue-grey background */
  tinted?: boolean;
  description?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tinted = false,
  description,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-5 flex flex-col gap-3",
        tinted
          ? "bg-card-tinted"
          : "bg-card border border-border shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            tinted ? "bg-white/60" : "bg-primary/10"
          )}
        >
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
      </div>

      <p className="text-3xl font-bold text-foreground leading-none">
        {value}
      </p>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
