"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChecklistItem } from "@/components/approval/checklist-item";
import { HistoryTimeline } from "@/components/approval/history-timeline";
import { formatShortDate } from "@/lib/date-utils";
import {
  getRequestById,
  getChecklistForRequest,
  REQUEST_TYPE_LABELS,
} from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import type { HistoryEvent } from "@/lib/types";

// ── Shared detail row ─────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 py-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value || "—"}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { activeUser } = useRole();

  const request = getRequestById(id);
  const checklist = request ? getChecklistForRequest(request.type) : undefined;

  // Local state — simulates a session-scoped approval action
  const [checkState, setCheckState] = useState<Record<string, boolean>>({});
  const [localStatus, setLocalStatus] = useState(request?.status);
  const [localHistory, setLocalHistory] = useState<HistoryEvent[]>(
    request?.history ?? []
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [acting, setActing] = useState(false);

  if (!request) {
    return (
      <div className="mx-auto max-w-2xl mt-12 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
        <h1 className="text-xl font-semibold text-foreground">
          Request not found
        </h1>
        <p className="text-sm text-muted-foreground">
          The request ID <span className="font-mono">{id}</span> does not exist
          in the system.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Return to dashboard
        </Button>
      </div>
    );
  }

  const checklistItems = checklist?.items ?? [];
  const checkedCount = checklistItems.filter((i) => checkState[i.id]).length;
  const allChecked =
    checklistItems.length > 0 && checkedCount === checklistItems.length;
  const progressPct =
    checklistItems.length > 0
      ? Math.round((checkedCount / checklistItems.length) * 100)
      : 0;

  const canApprove =
    (localStatus === "pending" || localStatus === "in-progress") &&
    allChecked;

  const handleCheck = (itemId: string, checked: boolean) => {
    setCheckState((prev) => ({ ...prev, [itemId]: checked }));
  };

  const handleApprove = () => {
    setActing(true);
    setTimeout(() => {
      const approvalEvent: HistoryEvent = {
        id: `h-approval-${Date.now()}`,
        type: "approved",
        actor: activeUser,
        timestamp: new Date().toISOString(),
        note: "All checklist items completed. Request approved.",
      };
      setLocalStatus("approved");
      setLocalHistory((prev) => [...prev, approvalEvent]);
      setConfirmOpen(false);
      setActing(false);
      toast.success("Request approved", {
        description: `${request.id} has been approved and the applicant notified.`,
      });
    }, 700);
  };

  const handleReject = () => {
    setActing(true);
    setTimeout(() => {
      const rejectEvent: HistoryEvent = {
        id: `h-reject-${Date.now()}`,
        type: "rejected",
        actor: activeUser,
        timestamp: new Date().toISOString(),
        note: "Request rejected by approver.",
      };
      setLocalStatus("rejected");
      setLocalHistory((prev) => [...prev, rejectEvent]);
      setRejectOpen(false);
      setActing(false);
      toast.error("Request rejected", {
        description: `${request.id} has been rejected. The submitter has been notified.`,
      });
    }, 700);
  };

  const md = request.moveDetails;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to dashboard
      </Link>

      {/* Request header */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-semibold text-foreground font-mono">
              {request.id}
            </h1>
            {localStatus && <StatusBadge status={localStatus} />}
            {request.priority === "urgent" && (
              <Badge
                variant="outline"
                className="border-red-200 bg-red-50 text-red-700 text-xs"
              >
                Urgent
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {REQUEST_TYPE_LABELS[request.type]} · Submitted by{" "}
            <span className="font-medium text-foreground">
              {request.submittedBy.name}
            </span>{" "}
            on {formatShortDate(request.submittedAt)}
          </p>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="instructions">
            Instructions
            {checklistItems.length > 0 && (
              <span
                className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                aria-label={`${checkedCount} of ${checklistItems.length} items checked`}
              >
                {checkedCount}/{checklistItems.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ── Details tab ──────────────────────────────────────────────────── */}
        <TabsContent value="details" className="mt-4 space-y-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-0 divide-y divide-border">
              <div className="pb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Applicant
                </p>
                <DetailRow label="Name" value={request.applicant.name} />
                <DetailRow
                  label="Service number"
                  value={request.applicant.serviceNumber}
                />
                <DetailRow label="Rank" value={request.applicant.rank} />
                <DetailRow
                  label="Current unit"
                  value={request.applicant.unit}
                />
              </div>

              {md && (
                <div className="pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Relocation details
                  </p>
                  <DetailRow label="Reason" value={md.reason.replace(/-/g, " ")} />
                  <DetailRow
                    label="From"
                    value={`${md.fromUnit} — ${md.fromLocation}`}
                  />
                  <DetailRow
                    label="To"
                    value={`${md.toUnit} — ${md.toLocation}`}
                  />
                  <DetailRow
                    label="Effective date"
                    value={formatShortDate(md.effectiveDate)}
                  />
                  <DetailRow
                    label="Destination supervisor"
                    value={md.destinationSupervisor}
                  />
                  {md.notes && <DetailRow label="Notes" value={md.notes} />}
                </div>
              )}

              <div className="pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Request metadata
                </p>
                <DetailRow
                  label="Submitted by"
                  value={request.submittedBy.name}
                />
                <DetailRow
                  label="Submitted at"
                  value={formatShortDate(request.submittedAt)}
                />
                <DetailRow
                  label="Priority"
                  value={
                    request.priority.charAt(0).toUpperCase() +
                    request.priority.slice(1)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Instructions tab ─────────────────────────────────────────────── */}
        <TabsContent value="instructions" className="mt-4 space-y-4">
          {checklistItems.length === 0 ? (
            <Card className="border-border shadow-sm">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No approval checklist defined for this request type.
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    Checklist progress
                  </span>
                  <span className="text-muted-foreground">
                    {checkedCount} of {checklistItems.length} complete
                  </span>
                </div>
                <Progress
                  value={progressPct}
                  className="h-2"
                  aria-label={`${progressPct}% of checklist complete`}
                />
              </div>

              {/* Checklist */}
              <ul className="space-y-2" aria-label="Approval checklist">
                {checklistItems.map((item, idx) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    checked={checkState[item.id] ?? false}
                    onChange={handleCheck}
                    index={idx + 1}
                  />
                ))}
              </ul>

              {/* Approval actions */}
              <Card className="border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      {canApprove ? (
                        <p className="text-sm font-medium text-emerald-700">
                          All items complete — ready to approve.
                        </p>
                      ) : localStatus === "approved" ||
                        localStatus === "rejected" ? (
                        <p className="text-sm text-muted-foreground">
                          This request has already been actioned.
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Complete all {checklistItems.length} items to enable
                          approval.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setRejectOpen(true)}
                        disabled={
                          localStatus === "approved" ||
                          localStatus === "rejected"
                        }
                        aria-label="Reject this request"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setConfirmOpen(true)}
                        disabled={!canApprove}
                        aria-label={
                          canApprove
                            ? "Approve this request"
                            : `Approve (disabled — ${checklistItems.length - checkedCount} checklist item${checklistItems.length - checkedCount !== 1 ? "s" : ""} remaining)`
                        }
                        aria-disabled={!canApprove}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── History tab ──────────────────────────────────────────────────── */}
        <TabsContent value="history" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5">
              <HistoryTimeline events={localHistory} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Approve confirmation dialog ───────────────────────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve request?</DialogTitle>
            <DialogDescription>
              You are about to approve{" "}
              <span className="font-mono font-medium">{request.id}</span>. This
              will notify the applicant and mark the request as complete. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={acting}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={acting}>
              {acting ? "Approving…" : "Confirm approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject confirmation dialog ────────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject request?</DialogTitle>
            <DialogDescription>
              You are about to reject{" "}
              <span className="font-mono font-medium">{request.id}</span>. The
              submitter will be notified. Provide a reason via the comment field
              in a full implementation — this prototype will record the
              rejection without a reason.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={acting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={acting}
            >
              {acting ? "Rejecting…" : "Confirm rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
