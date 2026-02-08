# Ralph Fix Plan

## High Priority
- [ ] **Service layer** (`src/lib/services/*.ts`) — pure business logic for properties, units, tenants, leases, charges, payments
- [ ] **Server actions** (`src/lib/actions/*.ts`) — thin wrappers: requireAuth() → validate → call service → revalidatePath()
- [ ] **API routes** (`src/app/api/v1/...`) — REST API with API key auth for external integrations
- [ ] **API key auth** (`src/lib/api-auth.ts`) — requireApiKey() helper for API routes
- [ ] **Validation schemas** (`src/lib/validations/*.ts`) — Zod schemas for all entities
- [ ] **Dashboard layout** — sidebar navigation, shared components (page-header, breadcrumbs, empty-state, status-badge, delete-dialog)
- [ ] **Properties + Units CRUD** — pages, forms, server actions
- [ ] **Tenants + Leases CRUD** — pages, forms, server actions with business rules
- [ ] **Billing** — charges generation, payment recording with allocation logic
- [ ] Run migration: `npx prisma migrate dev --name init`
- [ ] Seed database: `npx prisma db seed`
- [ ] Test auth: login with admin@example.com / admin123, verify redirect to dashboard
- [ ] Test properties: create property, add units, edit, delete
- [ ] Test tenants: create tenant, verify list
- [ ] Test leases: create lease linking tenant to unit, verify unit status changes to OCCUPIED
- [ ] Test billing: generate rent charges for current month, verify charges appear
- [ ] Test payments: record payment, verify it allocates to oldest charge, verify charge status updates
- [ ] Test REST API: `curl -H "Authorization: Bearer $API_KEY" http://localhost:3000/api/v1/properties` — verify JSON response
- [ ] Test API create: POST to `/api/v1/tenants` with valid payload, verify 201 response
- [ ] Test API auth: request without API key returns 401

## Medium Priority
- [ ] Loading skeletons for each route group
- [ ] Mobile responsive sidebar (Sheet component)
- [ ] File upload handler for lease PDFs

## Low Priority
- [ ] Performance optimization
- [ ] Extended feature set
- [ ] Integration with external services (Paperless, webhooks)

## Completed
- [x] Project enabled for Ralph
- [x] **Phase 1: Auth** — NextAuth v5 with JWT strategy, Credentials provider, edge-compatible middleware
  - `src/lib/auth.ts` — full NextAuth config with Credentials provider, jwt/session callbacks
  - `src/lib/auth.config.ts` — edge-compatible config for middleware (no Node.js dependencies)
  - `src/middleware.ts` — route protection using authorized callback
  - `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
  - `src/lib/validations/auth.ts` — loginSchema (Zod v4)
  - `src/types/next-auth.d.ts` — session type extensions (id + role)
  - `src/app/(auth)/login/page.tsx` — centered login form with react-hook-form + zod validation
  - `src/app/(auth)/layout.tsx` — auth route group layout
  - `src/app/(dashboard)/page.tsx` — placeholder dashboard with stat cards
  - `src/app/(dashboard)/layout.tsx` — dashboard layout with auth check
  - `prisma/seed.ts` — seed admin user (admin@example.com / admin123)
  - `prisma/schema.prisma` — added Session + Account models, removed url from datasource (Prisma 7)
  - `src/lib/prisma.ts` — updated for Prisma 7 with @prisma/adapter-pg
  - `src/app/layout.tsx` — wrapped with SessionProvider + Toaster
  - `src/app/page.tsx` — redirects to /dashboard
  - `package.json` — added prisma seed command, tsx devDependency
  - `.env.example` — documented required env vars
  - `.gitignore` — comprehensive gitignore
  - `.env` — local development env vars
  - Build passes with no TypeScript errors

## Notes
- Prisma 7 breaking change: datasource url removed from schema, connection via @prisma/adapter-pg driver adapter
- NextAuth v5 beta + Edge Runtime: auth.config.ts (edge-safe) separated from auth.ts (Node.js) to avoid bcryptjs/Prisma in middleware
- JWT strategy used instead of DB sessions (Credentials provider doesn't support DB sessions in NextAuth v5)
- Focus on MVP functionality first
- Ensure each feature is properly tested
- Update this file after each major milestone
