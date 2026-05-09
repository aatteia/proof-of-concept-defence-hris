import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Form progress" className="w-full">
      <ol className="flex items-center">
        {steps.map((step, idx) => {
          const isComplete = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isLast = idx === steps.length - 1;

          return (
            <li
              key={step.number}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              {/* Step node */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isComplete &&
                      "bg-primary text-primary-foreground",
                    isActive &&
                      "border-2 border-primary bg-white text-primary",
                    !isComplete &&
                      !isActive &&
                      "border-2 border-border bg-card text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true">{step.number}</span>
                  )}
                  <span className="sr-only">
                    Step {step.number}: {step.label}
                    {isComplete && " (completed)"}
                    {isActive && " (current)"}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium text-center leading-tight hidden sm:block",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-colors",
                    isComplete ? "bg-primary" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
