// ─── Role ────────────────────────────────────────────────────────────────────

export type Role = "admin" | "approver" | "user";

export interface RoleDefinition {
  id: Role;
  label: string;
  description: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  serviceNumber: string;
  rank: string;
  unit: string;
  location: string;
  email: string;
  role: Role;
  /** Initials derived from name, used for avatar fallback */
  initials: string;
}

// ─── Request ──────────────────────────────────────────────────────────────────

export type RequestType = "relocate-account" | "new-account" | "app-access" | "employee-registration";

export type RequestStatus = "pending" | "in-progress" | "approved" | "rejected" | "cancelled";

export interface MoveDetails {
  fromUnit: string;
  fromLocation: string;
  toUnit: string;
  toLocation: string;
  effectiveDate: string;   // ISO date string
  destinationSupervisor: string;
  reason: RelocateReason;
  notes?: string;
}

export type RelocateReason =
  | "posting"
  | "permanent-move"
  | "temporary-detachment"
  | "other";

export interface Request {
  id: string;
  type: RequestType;
  status: RequestStatus;
  submittedBy: User;
  submittedAt: string;     // ISO date string
  applicant: User;
  summary: string;
  moveDetails?: MoveDetails;
  assignedApproverId: string;
  priority: "routine" | "urgent";
  /** Updatable in local state during demo */
  history: HistoryEvent[];
}

// ─── Approval ────────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  label: string;
  /** Instructional detail shown below the label */
  detail?: string;
}

export interface ApprovalChecklist {
  requestType: RequestType;
  items: ChecklistItem[];
}

// ─── History ─────────────────────────────────────────────────────────────────

export type HistoryEventType =
  | "submitted"
  | "assigned"
  | "under-review"
  | "approved"
  | "rejected"
  | "comment";

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  actor: User;
  timestamp: string;       // ISO date string
  note?: string;
}

// ─── Form state (Relocate Account) ────────────────────────────────────────────

export interface RelocateFormState {
  step: 1 | 2 | 3 | 4;
  reason: RelocateReason | "";
  notes: string;
  applicant: User | null;
  fromUnit: string;
  fromLocation: string;
  toUnit: string;
  toLocation: string;
  effectiveDate: string;
  destinationSupervisor: string;
  confirmed: boolean;
}

export type RelocateFormAction =
  | { type: "SET_STEP"; payload: 1 | 2 | 3 | 4 }
  | { type: "SET_REASON"; payload: RelocateReason | "" }
  | { type: "SET_NOTES"; payload: string }
  | { type: "SET_APPLICANT"; payload: User | null }
  | { type: "SET_FROM_UNIT"; payload: string }
  | { type: "SET_FROM_LOCATION"; payload: string }
  | { type: "SET_TO_UNIT"; payload: string }
  | { type: "SET_TO_LOCATION"; payload: string }
  | { type: "SET_EFFECTIVE_DATE"; payload: string }
  | { type: "SET_DESTINATION_SUPERVISOR"; payload: string }
  | { type: "SET_CONFIRMED"; payload: boolean }
  | { type: "RESET" };
