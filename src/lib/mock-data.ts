import type {
  User,
  Request,
  HistoryEvent,
  ApprovalChecklist,
  RoleDefinition,
} from "@/lib/types";

// ─── Role definitions ─────────────────────────────────────────────────────────

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "admin",
    label: "Administrator",
    description: "Full access — submit requests, view all queues",
  },
  {
    id: "approver",
    label: "Approver",
    description: "Review and action assigned requests",
  },
  {
    id: "user",
    label: "Standard User",
    description: "Submit and track personal requests",
  },
];

// ─── Units and locations ──────────────────────────────────────────────────────

export const UNITS: string[] = [
  "1st Signals Regiment",
  "2nd Cavalry Regiment",
  "3rd Brigade",
  "6th Brigade",
  "16th Air Land Regiment",
  "HQJOC",
  "Defence Intelligence",
  "Navy Cyber",
  "Air Force Command",
  "Joint Logistics Command",
];

export const LOCATIONS: string[] = [
  "Gallipoli Barracks, Enoggera QLD",
  "Lavarack Barracks, Townsville QLD",
  "Robertson Barracks, Darwin NT",
  "Holsworthy Barracks, Sydney NSW",
  "Duntroon, ACT",
  "HMAS Stirling, Rockingham WA",
  "RAAF Base Williamtown, NSW",
  "Victoria Barracks, Melbourne VIC",
  "Keswick Barracks, Adelaide SA",
  "RAAF Base Edinburgh, SA",
];

export const RELOCATE_REASONS: { value: string; label: string }[] = [
  { value: "posting", label: "Posting — permanent unit transfer" },
  { value: "permanent-move", label: "Permanent relocation (non-posting)" },
  { value: "temporary-detachment", label: "Temporary detachment or exercise" },
  { value: "other", label: "Other — provide details in notes" },
];

// ─── Users ────────────────────────────────────────────────────────────────────

export const USERS: User[] = [
  {
    id: "u-001",
    name: "Maj Sarah Chen",
    serviceNumber: "8214573",
    rank: "Major",
    unit: "HQJOC",
    location: "Duntroon, ACT",
    email: "s.chen@defence.gov.au",
    role: "admin",
    initials: "SC",
  },
  {
    id: "u-002",
    name: "WO2 David Hartley",
    serviceNumber: "7430128",
    rank: "Warrant Officer Class 2",
    unit: "6th Brigade",
    location: "Gallipoli Barracks, Enoggera QLD",
    email: "d.hartley@defence.gov.au",
    role: "approver",
    initials: "DH",
  },
  {
    id: "u-003",
    name: "Cpl James Nguyen",
    serviceNumber: "9012845",
    rank: "Corporal",
    unit: "1st Signals Regiment",
    location: "Gallipoli Barracks, Enoggera QLD",
    email: "j.nguyen@defence.gov.au",
    role: "user",
    initials: "JN",
  },
  {
    id: "u-004",
    name: "Lt Priya Sharma",
    serviceNumber: "8567234",
    rank: "Lieutenant",
    unit: "2nd Cavalry Regiment",
    location: "Robertson Barracks, Darwin NT",
    email: "p.sharma@defence.gov.au",
    role: "user",
    initials: "PS",
  },
  {
    id: "u-005",
    name: "Sgt Michael Torres",
    serviceNumber: "7891234",
    rank: "Sergeant",
    unit: "16th Air Land Regiment",
    location: "Holsworthy Barracks, Sydney NSW",
    email: "m.torres@defence.gov.au",
    role: "user",
    initials: "MT",
  },
  {
    id: "u-006",
    name: "Capt Aisha Okafor",
    serviceNumber: "8340912",
    rank: "Captain",
    unit: "Defence Intelligence",
    location: "Duntroon, ACT",
    email: "a.okafor@defence.gov.au",
    role: "approver",
    initials: "AO",
  },
  {
    id: "u-007",
    name: "Pte Ryan Walsh",
    serviceNumber: "9567012",
    rank: "Private",
    unit: "3rd Brigade",
    location: "Lavarack Barracks, Townsville QLD",
    email: "r.walsh@defence.gov.au",
    role: "user",
    initials: "RW",
  },
  {
    id: "u-008",
    name: "CPO Lee Andersen",
    serviceNumber: "7234890",
    rank: "Chief Petty Officer",
    unit: "Navy Cyber",
    location: "HMAS Stirling, Rockingham WA",
    email: "l.andersen@defence.gov.au",
    role: "user",
    initials: "LA",
  },
  {
    id: "u-009",
    name: "FLGOFF Kira Papadopoulos",
    serviceNumber: "8901234",
    rank: "Flying Officer",
    unit: "Air Force Command",
    location: "RAAF Base Williamtown, NSW",
    email: "k.papadopoulos@defence.gov.au",
    role: "user",
    initials: "KP",
  },
  {
    id: "u-010",
    name: "Brig Marcus Webb",
    serviceNumber: "6123456",
    rank: "Brigadier",
    unit: "HQJOC",
    location: "Duntroon, ACT",
    email: "m.webb@defence.gov.au",
    role: "admin",
    initials: "MW",
  },
];

// Convenience lookups
export const getUserById = (id: string): User | undefined =>
  USERS.find((u) => u.id === id);

export const ADMIN_USER = USERS[0];    // Maj Sarah Chen
export const APPROVER_USER = USERS[1]; // WO2 David Hartley
export const STANDARD_USER = USERS[2]; // Cpl James Nguyen

// Users available as applicant search targets
export const SEARCHABLE_USERS: User[] = USERS.filter(
  (u) => u.role === "user"
);

// ─── History events ───────────────────────────────────────────────────────────

function makeHistory(
  submitter: User,
  approver: User,
  status: Request["status"],
  submittedAt: string
): HistoryEvent[] {
  const base: HistoryEvent[] = [
    {
      id: `h-${submittedAt}-1`,
      type: "submitted",
      actor: submitter,
      timestamp: submittedAt,
      note: "Request submitted via MAMS portal.",
    },
    {
      id: `h-${submittedAt}-2`,
      type: "assigned",
      actor: approver,
      timestamp: new Date(
        new Date(submittedAt).getTime() + 2 * 60 * 60 * 1000
      ).toISOString(),
      note: `Assigned to ${approver.name} for review.`,
    },
    {
      id: `h-${submittedAt}-3`,
      type: "under-review",
      actor: approver,
      timestamp: new Date(
        new Date(submittedAt).getTime() + 6 * 60 * 60 * 1000
      ).toISOString(),
      note: "Checklist review commenced.",
    },
  ];

  if (status === "approved") {
    base.push({
      id: `h-${submittedAt}-4`,
      type: "approved",
      actor: approver,
      timestamp: new Date(
        new Date(submittedAt).getTime() + 26 * 60 * 60 * 1000
      ).toISOString(),
      note: "All checklist items completed. Request approved.",
    });
  } else if (status === "rejected") {
    base.push({
      id: `h-${submittedAt}-4`,
      type: "rejected",
      actor: approver,
      timestamp: new Date(
        new Date(submittedAt).getTime() + 20 * 60 * 60 * 1000
      ).toISOString(),
      note: "Destination network segment not available. Request rejected pending network provisioning.",
    });
  }

  return base;
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export const REQUESTS: Request[] = [
  {
    id: "REQ-2024-0841",
    type: "relocate-account",
    status: "pending",
    submittedBy: USERS[2], // Cpl James Nguyen
    submittedAt: "2026-05-07T09:14:00.000Z",
    applicant: USERS[2],
    summary: "Relocate account from 1st Signals Regiment to 6th Brigade following posting order.",
    moveDetails: {
      fromUnit: "1st Signals Regiment",
      fromLocation: "Gallipoli Barracks, Enoggera QLD",
      toUnit: "6th Brigade",
      toLocation: "Gallipoli Barracks, Enoggera QLD",
      effectiveDate: "2026-06-01",
      destinationSupervisor: "WO2 David Hartley",
      reason: "posting",
      notes: "Posting order reference: PO-2026-0312. Clearance level TS confirmed.",
    },
    assignedApproverId: "u-002",
    priority: "routine",
    history: makeHistory(USERS[2], USERS[1], "pending", "2026-05-07T09:14:00.000Z"),
  },
  {
    id: "REQ-2024-0840",
    type: "relocate-account",
    status: "in-progress",
    submittedBy: ADMIN_USER,
    submittedAt: "2026-05-06T14:30:00.000Z",
    applicant: USERS[3], // Lt Priya Sharma
    summary: "Relocate account for Lt Sharma — temporary detachment to HQJOC for Exercise TALISMAN SABRE.",
    moveDetails: {
      fromUnit: "2nd Cavalry Regiment",
      fromLocation: "Robertson Barracks, Darwin NT",
      toUnit: "HQJOC",
      toLocation: "Duntroon, ACT",
      effectiveDate: "2026-05-20",
      destinationSupervisor: "Maj Sarah Chen",
      reason: "temporary-detachment",
      notes: "Detachment period 20 May – 15 Aug 2026. Return account transfer to follow.",
    },
    assignedApproverId: "u-002",
    priority: "urgent",
    history: makeHistory(ADMIN_USER, USERS[1], "in-progress", "2026-05-06T14:30:00.000Z"),
  },
  {
    id: "REQ-2024-0839",
    type: "relocate-account",
    status: "approved",
    submittedBy: USERS[4], // Sgt Michael Torres
    submittedAt: "2026-05-05T11:00:00.000Z",
    applicant: USERS[4],
    summary: "Permanent relocation — Sgt Torres transferring to Joint Logistics Command.",
    moveDetails: {
      fromUnit: "16th Air Land Regiment",
      fromLocation: "Holsworthy Barracks, Sydney NSW",
      toUnit: "Joint Logistics Command",
      toLocation: "Duntroon, ACT",
      effectiveDate: "2026-05-26",
      destinationSupervisor: "WO2 Karen Briggs",
      reason: "permanent-move",
    },
    assignedApproverId: "u-006",
    priority: "routine",
    history: makeHistory(USERS[4], USERS[5], "approved", "2026-05-05T11:00:00.000Z"),
  },
  {
    id: "REQ-2024-0838",
    type: "relocate-account",
    status: "rejected",
    submittedBy: ADMIN_USER,
    submittedAt: "2026-05-04T08:45:00.000Z",
    applicant: USERS[7], // CPO Lee Andersen
    summary: "Relocate account for CPO Andersen — transfer to Navy Cyber Duntroon node.",
    moveDetails: {
      fromUnit: "Navy Cyber",
      fromLocation: "HMAS Stirling, Rockingham WA",
      toUnit: "Navy Cyber",
      toLocation: "Duntroon, ACT",
      effectiveDate: "2026-05-15",
      destinationSupervisor: "LCDR Fiona Marsh",
      reason: "posting",
    },
    assignedApproverId: "u-002",
    priority: "urgent",
    history: makeHistory(ADMIN_USER, USERS[1], "rejected", "2026-05-04T08:45:00.000Z"),
  },
  {
    id: "REQ-2024-0837",
    type: "relocate-account",
    status: "pending",
    submittedBy: ADMIN_USER,
    submittedAt: "2026-05-08T16:00:00.000Z",
    applicant: USERS[8], // FLGOFF Kira Papadopoulos
    summary: "Relocate account for FLGOFF Papadopoulos — posting to Air Force Command HQ.",
    moveDetails: {
      fromUnit: "Air Force Command",
      fromLocation: "RAAF Base Williamtown, NSW",
      toUnit: "Air Force Command",
      toLocation: "Duntroon, ACT",
      effectiveDate: "2026-06-10",
      destinationSupervisor: "SQNLDR Ben Park",
      reason: "posting",
    },
    assignedApproverId: "u-006",
    priority: "routine",
    history: makeHistory(ADMIN_USER, USERS[5], "pending", "2026-05-08T16:00:00.000Z"),
  },
  {
    id: "REQ-2024-0836",
    type: "new-account",
    status: "approved",
    submittedBy: USERS[5], // Capt Aisha Okafor
    submittedAt: "2026-05-03T10:20:00.000Z",
    applicant: USERS[6], // Pte Ryan Walsh
    summary: "New network account for Pte Walsh — newly enlisted, 3rd Brigade.",
    assignedApproverId: "u-002",
    priority: "routine",
    history: makeHistory(USERS[5], USERS[1], "approved", "2026-05-03T10:20:00.000Z"),
  },
  {
    id: "REQ-2024-0835",
    type: "app-access",
    status: "in-progress",
    submittedBy: USERS[3], // Lt Priya Sharma
    submittedAt: "2026-05-07T13:00:00.000Z",
    applicant: USERS[3],
    summary: "Application access — PMKEYS read access for 2nd Cavalry Regiment S1 duties.",
    assignedApproverId: "u-006",
    priority: "routine",
    history: makeHistory(USERS[3], USERS[5], "in-progress", "2026-05-07T13:00:00.000Z"),
  },
  {
    id: "REQ-2024-0834",
    type: "employee-registration",
    status: "pending",
    submittedBy: ADMIN_USER,
    submittedAt: "2026-05-08T09:00:00.000Z",
    applicant: {
      id: "u-new",
      name: "Pte Tom Bradley",
      serviceNumber: "9998877",
      rank: "Private",
      unit: "6th Brigade",
      location: "Gallipoli Barracks, Enoggera QLD",
      email: "t.bradley@defence.gov.au",
      role: "user",
      initials: "TB",
    },
    summary: "Employee registration for new recruit Pte Bradley — 6th Brigade intake.",
    assignedApproverId: "u-002",
    priority: "routine",
    history: makeHistory(ADMIN_USER, USERS[1], "pending", "2026-05-08T09:00:00.000Z"),
  },
];

export const getRequestById = (id: string): Request | undefined =>
  REQUESTS.find((r) => r.id === id);

// ─── Approval checklist ───────────────────────────────────────────────────────

export const APPROVAL_CHECKLISTS: ApprovalChecklist[] = [
  {
    requestType: "relocate-account",
    items: [
      {
        id: "cl-ra-1",
        label: "Confirm destination network segment exists and is provisioned",
        detail:
          "Verify the receiving unit's ADNMS network segment is active. Check with network operations if unsure.",
      },
      {
        id: "cl-ra-2",
        label: "Verify applicant clearance level matches destination requirement",
        detail:
          "Cross-reference the applicant's current clearance with the minimum required at the destination unit.",
      },
      {
        id: "cl-ra-3",
        label: "Confirm no outstanding incidents or tickets on source account",
        detail:
          "Search the service desk for open tickets linked to this service number. Do not approve if unresolved P1 or P2 tickets exist.",
      },
      {
        id: "cl-ra-4",
        label: "Confirm effective date does not conflict with active operations or exercises",
        detail:
          "Check the Defence calendar for active operations at either location during the transition window.",
      },
      {
        id: "cl-ra-5",
        label: "Notify destination unit IT administrator of incoming account transfer",
        detail:
          "Email the destination unit's registered IT administrator. Attach the posting order reference if provided.",
      },
    ],
  },
  {
    requestType: "new-account",
    items: [
      {
        id: "cl-na-1",
        label: "Confirm identity documents sighted and verified",
        detail: "Service card and photo ID must be physically sighted before account creation.",
      },
      {
        id: "cl-na-2",
        label: "Confirm unit TAPS profile exists for the new member",
        detail: "A TAPS profile must be active before a network account can be linked.",
      },
      {
        id: "cl-na-3",
        label: "Assign correct security group for unit and role",
        detail: "Refer to the unit's security group matrix to select the correct AD group.",
      },
    ],
  },
];

export const getChecklistForRequest = (
  requestType: Request["type"]
): ApprovalChecklist | undefined =>
  APPROVAL_CHECKLISTS.find((c) => c.requestType === requestType);

// ─── Dashboard stats helpers ──────────────────────────────────────────────────

/** Requests pending approval assigned to the given approver */
export const getPendingForApprover = (approverId: string): Request[] =>
  REQUESTS.filter(
    (r) => r.assignedApproverId === approverId && r.status === "pending"
  );

/** Requests submitted by the given user */
export const getRequestsBySubmitter = (userId: string): Request[] =>
  REQUESTS.filter((r) => r.submittedBy.id === userId);

/** All requests except those submitted by the given user (team view) */
export const getTeamRequests = (userId: string): Request[] =>
  REQUESTS.filter((r) => r.submittedBy.id !== userId);

// ─── UI helpers ───────────────────────────────────────────────────────────────

export const REQUEST_TYPE_LABELS: Record<Request["type"], string> = {
  "relocate-account": "Relocate Account",
  "new-account": "New Account",
  "app-access": "Application Access",
  "employee-registration": "Employee Registration",
};

export const STATUS_LABELS: Record<Request["status"], string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};
