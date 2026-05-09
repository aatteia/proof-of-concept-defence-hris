# Next.js SaaS Starter

## Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v3
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js v5
- **Payments**: Stripe (webhook handler included)
- **Language**: TypeScript (strict mode)

## Project Structure
```
src/
  app/           # Next.js App Router pages and layouts
    (auth)/      # Auth pages (login, register, forgot-password)
    (dashboard)/ # Protected dashboard routes
    api/         # API route handlers
  components/    # Shared UI components
  lib/           # Utilities, db client, auth config
  hooks/         # Custom React hooks
prisma/
  schema.prisma  # Database schema
```

## Conventions
- Use Server Components by default; add `"use client"` only when needed
- Co-locate types with their modules
- All DB access goes through `lib/db.ts` (Prisma client singleton)
- Environment variables validated at startup via `lib/env.ts` (zod schema)
- API routes return typed JSON responses with consistent error shapes

## Key Commands
```bash
npm run dev           # Start dev server
npm run db:push       # Sync Prisma schema to DB
npm run db:studio     # Open Prisma Studio
npm run stripe:listen # Forward Stripe webhooks locally
```
