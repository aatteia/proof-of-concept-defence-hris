"use client";

import { useReducer, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { StepIndicator } from "@/components/forms/step-indicator";
import { ApplicantSearch } from "@/components/forms/applicant-search";
import { StatusBadge } from "@/components/ui/status-badge";
import { UNITS, LOCATIONS, RELOCATE_REASONS } from "@/lib/mock-data";
import type { RelocateFormState, RelocateFormAction, RelocateReason } from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Reducer ──────────────────────────────────────────────────────────────────

const INITIAL_STATE: RelocateFormState = {
  step: 1,
  reason: "",
  notes: "",
  applicant: null,
  fromUnit: "",
  fromLocation: "",
  toUnit: "",
  toLocation: "",
  effectiveDate: "",
  destinationSupervisor: "",
  confirmed: false,
};

function formReducer(
  state: RelocateFormState,
  action: RelocateFormAction
): RelocateFormState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_REASON":
      return { ...state, reason: action.payload };
    case "SET_NOTES":
      return { ...state, notes: action.payload };
    case "SET_APPLICANT":
      return { ...state, applicant: action.payload };
    case "SET_FROM_UNIT":
      return { ...state, fromUnit: action.payload };
    case "SET_FROM_LOCATION":
      return { ...state, fromLocation: action.payload };
    case "SET_TO_UNIT":
      return { ...state, toUnit: action.payload };
    case "SET_TO_LOCATION":
      return { ...state, toLocation: action.payload };
    case "SET_EFFECTIVE_DATE":
      return { ...state, effectiveDate: action.payload };
    case "SET_DESTINATION_SUPERVISOR":
      return { ...state, destinationSupervisor: action.payload };
    case "SET_CONFIRMED":
      return { ...state, confirmed: action.payload };
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<string, string>>;

function validateStep1(state: RelocateFormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!state.reason) {
    errors.reason = "Select a reason for the relocation.";
  }
  return errors;
}

function validateStep2(state: RelocateFormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!state.applicant) {
    errors.applicant = "Select the person whose account is being relocated.";
  }
  return errors;
}

function validateStep3(state: RelocateFormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!state.fromUnit) errors.fromUnit = "Select the source unit.";
  if (!state.fromLocation) errors.fromLocation = "Select the source location.";
  if (!state.toUnit) errors.toUnit = "Select the destination unit.";
  if (!state.toLocation) errors.toLocation = "Select the destination location.";
  if (!state.effectiveDate) {
    errors.effectiveDate = "Enter the relocation effective date.";
  } else {
    const d = new Date(state.effectiveDate);
    if (isNaN(d.getTime())) {
      errors.effectiveDate = "Enter a valid date.";
    } else if (d <= new Date()) {
      errors.effectiveDate = "The effective date must be in the future.";
    }
  }
  if (!state.destinationSupervisor.trim()) {
    errors.destinationSupervisor =
      "Enter the name of the supervisor at the destination.";
  }
  return errors;
}

// ── Steps metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { number: 1 as const, label: "Reason" },
  { number: 2 as const, label: "Applicant" },
  { number: 3 as const, label: "Details" },
  { number: 4 as const, label: "Confirm" },
];

// ── Reusable field components ─────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

interface ConfirmRowProps {
  label: string;
  value?: string;
}

function ConfirmRow({ label, value }: ConfirmRowProps) {
  return (
    <div className="flex gap-3 py-2">
      <span className="w-40 shrink-0 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value || "—"}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RelocateFormPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(formReducer, INITIAL_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  // Focus the step heading when the step changes — keyboard and screen reader support
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [state.step]);

  const advance = (nextStep: RelocateFormState["step"]) => {
    setErrors({});
    dispatch({ type: "SET_STEP", payload: nextStep });
  };

  const handleNext = () => {
    let newErrors: FieldErrors = {};

    if (state.step === 1) newErrors = validateStep1(state);
    if (state.step === 2) newErrors = validateStep2(state);
    if (state.step === 3) newErrors = validateStep3(state);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    advance((state.step + 1) as RelocateFormState["step"]);
  };

  const handleBack = () => {
    setErrors({});
    dispatch({ type: "SET_STEP", payload: (state.step - 1) as RelocateFormState["step"] });
  };

  const handleSubmit = () => {
    if (!state.confirmed) {
      setErrors({ confirmed: "Confirm accuracy before submitting." });
      return;
    }
    setSubmitting(true);
    // Simulate async submission
    setTimeout(() => {
      toast.success("Request submitted successfully", {
        description: "REQ-2024-0842 has been created and assigned for review.",
      });
      router.push("/dashboard");
    }, 800);
  };

  const reasonLabel =
    RELOCATE_REASONS.find((r) => r.value === state.reason)?.label ?? "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Relocate Account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit a request to move a network account to a new unit or location.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator steps={STEPS} currentStep={state.step} />

      {/* Form card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* ── Step 1: Reason ──────────────────────────────────────────────── */}
          {state.step === 1 && (
            <section aria-labelledby="step-heading">
              <h2
                id="step-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
                className="mb-4 text-base font-semibold text-foreground focus-visible:outline-none"
              >
                Reason for relocation
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reason-select">
                    Reason{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </Label>
                  <Select
                    value={state.reason}
                    onValueChange={(v) => {
                      if (v) dispatch({ type: "SET_REASON", payload: v as RelocateReason });
                    }}
                  >
                    <SelectTrigger
                      id="reason-select"
                      className={cn("w-full", errors.reason && "border-destructive")}
                      aria-describedby={errors.reason ? "reason-error" : undefined}
                      aria-required="true"
                    >
                      <SelectValue placeholder="Select a reason…" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELOCATE_REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.reason && (
                    <FieldError message={errors.reason} />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">
                    Additional notes{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="notes"
                    value={state.notes}
                    onChange={(e) =>
                      dispatch({ type: "SET_NOTES", payload: e.target.value })
                    }
                    placeholder="Provide any relevant context, reference numbers, or special instructions…"
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </section>
          )}

          {/* ── Step 2: Applicant ────────────────────────────────────────────── */}
          {state.step === 2 && (
            <section aria-labelledby="step-heading">
              <h2
                id="step-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
                className="mb-1 text-base font-semibold text-foreground focus-visible:outline-none"
              >
                Select applicant
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Search for the person whose account will be relocated.
              </p>
              <ApplicantSearch
                value={state.applicant}
                onChange={(u) =>
                  dispatch({ type: "SET_APPLICANT", payload: u })
                }
                error={errors.applicant}
              />
            </section>
          )}

          {/* ── Step 3: Move details ─────────────────────────────────────────── */}
          {state.step === 3 && (
            <section aria-labelledby="step-heading">
              <h2
                id="step-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
                className="mb-4 text-base font-semibold text-foreground focus-visible:outline-none"
              >
                Move details
              </h2>

              <div className="space-y-5">
                {/* From */}
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-foreground">
                    Current location
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="from-unit">
                        Unit{" "}
                        <span className="text-destructive" aria-hidden="true">
                          *
                        </span>
                      </Label>
                      <Select
                        value={state.fromUnit}
                        onValueChange={(v) => {
                          if (v) dispatch({ type: "SET_FROM_UNIT", payload: v });
                        }}
                      >
                        <SelectTrigger
                          id="from-unit"
                          className={cn("w-full", errors.fromUnit && "border-destructive")}
                        >
                          <SelectValue placeholder="Select unit…" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError message={errors.fromUnit} />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="from-location">
                        Location{" "}
                        <span className="text-destructive" aria-hidden="true">
                          *
                        </span>
                      </Label>
                      <Select
                        value={state.fromLocation}
                        onValueChange={(v) => {
                          if (v) dispatch({ type: "SET_FROM_LOCATION", payload: v });
                        }}
                      >
                        <SelectTrigger
                          id="from-location"
                          className={cn(
                            "w-full",
                            errors.fromLocation && "border-destructive"
                          )}
                        >
                          <SelectValue placeholder="Select location…" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATIONS.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError message={errors.fromLocation} />
                    </div>
                  </div>
                </fieldset>

                {/* To */}
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-foreground">
                    Destination
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="to-unit">
                        Unit{" "}
                        <span className="text-destructive" aria-hidden="true">
                          *
                        </span>
                      </Label>
                      <Select
                        value={state.toUnit}
                        onValueChange={(v) => {
                          if (v) dispatch({ type: "SET_TO_UNIT", payload: v });
                        }}
                      >
                        <SelectTrigger
                          id="to-unit"
                          className={cn("w-full", errors.toUnit && "border-destructive")}
                        >
                          <SelectValue placeholder="Select unit…" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError message={errors.toUnit} />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="to-location">
                        Location{" "}
                        <span className="text-destructive" aria-hidden="true">
                          *
                        </span>
                      </Label>
                      <Select
                        value={state.toLocation}
                        onValueChange={(v) => {
                          if (v) dispatch({ type: "SET_TO_LOCATION", payload: v });
                        }}
                      >
                        <SelectTrigger
                          id="to-location"
                          className={cn(
                            "w-full",
                            errors.toLocation && "border-destructive"
                          )}
                        >
                          <SelectValue placeholder="Select location…" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATIONS.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError message={errors.toLocation} />
                    </div>
                  </div>
                </fieldset>

                {/* Date and supervisor */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="effective-date">
                      Effective date{" "}
                      <span className="text-destructive" aria-hidden="true">
                        *
                      </span>
                    </Label>
                    <Input
                      id="effective-date"
                      type="date"
                      value={state.effectiveDate}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_EFFECTIVE_DATE",
                          payload: e.target.value,
                        })
                      }
                      className={cn(
                        errors.effectiveDate && "border-destructive"
                      )}
                      aria-required="true"
                    />
                    <FieldError message={errors.effectiveDate} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dest-supervisor">
                      Destination supervisor{" "}
                      <span className="text-destructive" aria-hidden="true">
                        *
                      </span>
                    </Label>
                    <Input
                      id="dest-supervisor"
                      type="text"
                      value={state.destinationSupervisor}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_DESTINATION_SUPERVISOR",
                          payload: e.target.value,
                        })
                      }
                      placeholder="e.g. WO2 David Hartley"
                      className={cn(
                        errors.destinationSupervisor && "border-destructive"
                      )}
                      aria-required="true"
                    />
                    <FieldError message={errors.destinationSupervisor} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Step 4: Confirmation ─────────────────────────────────────────── */}
          {state.step === 4 && (
            <section aria-labelledby="step-heading">
              <h2
                id="step-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
                className="mb-1 text-base font-semibold text-foreground focus-visible:outline-none"
              >
                Review and confirm
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Review all details before submitting. This request will be sent
                for approval.
              </p>

              <div className="rounded-lg border border-border divide-y divide-border">
                {/* Request type header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-semibold text-foreground">
                    Relocate Account
                  </span>
                  <StatusBadge status="pending" />
                </div>

                <div className="px-4 py-2">
                  <ConfirmRow label="Reason" value={reasonLabel} />
                  {state.notes && (
                    <ConfirmRow label="Notes" value={state.notes} />
                  )}
                </div>

                <div className="px-4 py-2">
                  <ConfirmRow
                    label="Applicant"
                    value={
                      state.applicant
                        ? `${state.applicant.name} (${state.applicant.serviceNumber})`
                        : undefined
                    }
                  />
                  {state.applicant && (
                    <ConfirmRow
                      label="Current unit"
                      value={state.applicant.unit}
                    />
                  )}
                </div>

                <div className="px-4 py-2">
                  <ConfirmRow
                    label="From"
                    value={
                      state.fromUnit
                        ? `${state.fromUnit} — ${state.fromLocation}`
                        : undefined
                    }
                  />
                  <ConfirmRow
                    label="To"
                    value={
                      state.toUnit
                        ? `${state.toUnit} — ${state.toLocation}`
                        : undefined
                    }
                  />
                  <ConfirmRow
                    label="Effective date"
                    value={
                      state.effectiveDate
                        ? new Intl.DateTimeFormat("en-AU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }).format(new Date(state.effectiveDate))
                        : undefined
                    }
                  />
                  <ConfirmRow
                    label="Supervisor"
                    value={state.destinationSupervisor}
                  />
                </div>
              </div>

              {/* Confirmation checkbox */}
              <div className="mt-5 space-y-1.5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="confirm-accuracy"
                    checked={state.confirmed}
                    onCheckedChange={(checked) =>
                      dispatch({
                        type: "SET_CONFIRMED",
                        payload: checked === true,
                      })
                    }
                    className="mt-0.5"
                    aria-describedby={
                      errors.confirmed ? "confirm-error" : undefined
                    }
                  />
                  <Label
                    htmlFor="confirm-accuracy"
                    className="text-sm font-normal leading-relaxed cursor-pointer"
                  >
                    I confirm that the information above is accurate to the best
                    of my knowledge. I understand that submitting a request with
                    incorrect information may result in delays.
                  </Label>
                </div>
                {!state.confirmed && (
                  <p className="ml-7 text-xs text-muted-foreground">
                    Tick the confirmation above to enable submission.
                  </p>
                )}
              </div>
            </section>
          )}

          <Separator />

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            {state.step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={submitting}
              >
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}

            {state.step < 4 ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!state.confirmed || submitting}
                className="min-w-[100px]"
              >
                {submitting ? "Submitting…" : "Submit request"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

