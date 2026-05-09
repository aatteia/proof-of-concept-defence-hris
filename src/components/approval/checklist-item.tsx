import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ChecklistItem as ChecklistItemType } from "@/lib/types";

interface ChecklistItemProps {
  item: ChecklistItemType;
  checked: boolean;
  onChange: (id: string, checked: boolean) => void;
  index: number;
}

export function ChecklistItem({
  item,
  checked,
  onChange,
  index,
}: ChecklistItemProps) {
  const inputId = `checklist-item-${item.id}`;

  return (
    <li
      className={cn(
        "rounded-lg border p-4 transition-colors",
        checked
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-border bg-card"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={inputId}
          checked={checked}
          onCheckedChange={(v) => onChange(item.id, v === true)}
          className="mt-0.5 shrink-0"
          aria-describedby={item.detail ? `${inputId}-detail` : undefined}
        />
        <div className="space-y-1 min-w-0">
          <Label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium cursor-pointer leading-relaxed",
              checked && "line-through text-muted-foreground"
            )}
          >
            <span className="text-muted-foreground mr-1.5 text-xs font-normal not-italic">
              {index}.
            </span>
            {item.label}
          </Label>
          {item.detail && (
            <p
              id={`${inputId}-detail`}
              className="text-xs text-muted-foreground leading-relaxed"
            >
              {item.detail}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
