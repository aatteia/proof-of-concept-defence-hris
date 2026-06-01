# MAMS — Military Account Management System

A proof-of-concept frontend prototype for a Defence Human Resources Information System (HRIS), demonstrating a role-aware request management workflow for military network account operations within the Australian Defence Force.

## Stack
- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Components**: ShadCN on `@base-ui/react`
- **State**: React context + `useReducer` — no external state library
- **Data**: Client-side mock data only — no database, no auth, no server-side logic
- **Deployment**: Vercel (auto-deploy from `main`)

## Prototype Scope
This is a demonstration prototype. All data lives in `src/lib/mock-data.ts` and resets on page refresh. No environment variables are required to run the application. The Prisma schema exists but is not used.

## Project Structure
```
src/
  app/
    (auth)/login/             # Demo login page
    (dashboard)/
      layout.tsx              # Shell — sidebar, top bar, role provider
      dashboard/              # Role-aware dashboard
      requests/               # All Requests list
      requests/[id]/          # Request detail and approval screen
      requests/new/relocate/  # Multi-step relocation form
      personnel/              # Personnel directory or own profile
      settings/               # Appearance, notifications, access settings
  components/
    layout/                   # AppSidebar, TopBar, RoleSwitcher, NotificationBell
    dashboard/                # StatCard, RequestTable, QuickActions, ActivityFeed
    approval/                 # ChecklistItem, HistoryTimeline
    forms/                    # StepIndicator, ApplicantSearch
    ui/                       # ShadCN-derived component primitives
  lib/
    mock-data.ts              # All users, requests, history, checklists
    types.ts                  # Shared TypeScript types
    role-context.tsx          # Active role and user context
    theme-context.tsx         # Theme switching and persistence
    date-utils.ts             # Relative and formatted date helpers
```

## Conventions
- Use Server Components by default; add `"use client"` only when needed
- All shared types live in `src/lib/types.ts`
- All mock data lives in `src/lib/mock-data.ts` — do not introduce a database dependency without explicit instruction
- Role-aware rendering is driven by `src/lib/role-context.tsx`

## Key Commands
```bash
npm run dev       # Start dev server (no environment variables required)
npm run build     # Production build — verifies no type or compilation errors
npx tsc --noEmit  # Type-check without building
```
