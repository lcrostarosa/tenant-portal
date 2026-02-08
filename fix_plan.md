# Property Manager MVP — Fix Plan

## Completed
- [x] S01: Project scaffolding (Next.js 14, shadcn/ui, Tailwind, Docker)
- [x] S02: Database schema (Prisma — 11 models, enums, relations)
- [x] S03: Authentication (NextAuth v5 credentials + DB sessions, login page, middleware, seed script)
- [x] Phase 2 - Dashboard layout: sidebar nav, mobile responsive Sheet menu, loading skeletons
- [x] Phase 2 - Shared components: page-header, empty-state, status-badge, delete-dialog
- [x] Phase 2 - Dashboard page with live DB queries (properties, units, leases, outstanding balance)
- [x] Phase 2 - Utility functions: getFullAddress, getTenantFullName, getOutstandingAmount, formatCurrency, formatDate

## In Progress
_None — pick the next high-priority task_

## High Priority — Phase 1.5: Service Layer + API
- [ ] Create `src/lib/services/properties.ts` — findAll, findById, create, update, delete (accept `ownerId`)
- [ ] Create `src/lib/services/units.ts` — CRUD scoped by property ownership
- [ ] Create `src/lib/services/tenants.ts` — CRUD
- [ ] Create `src/lib/services/leases.ts` — CRUD + business rules (one active lease per unit)
- [ ] Create `src/lib/services/charges.ts` — generateRentCharges, list
- [ ] Create `src/lib/services/payments.ts` — recordPayment with allocation logic
- [ ] Create `src/lib/api-auth.ts` — requireApiKey helper for REST API routes

## High Priority — Phase 3: Properties + Units CRUD
- [ ] Create `src/lib/validations/property.ts` — propertySchema
- [ ] Create `src/lib/validations/unit.ts` — unitSchema
- [ ] Create `src/lib/actions/properties.ts` — server actions (requireAuth → validate → service → revalidate)
- [ ] Create `src/lib/actions/units.ts` — server actions
- [ ] Create `src/components/forms/property-form.tsx` — shared create/edit form
- [ ] Create `src/components/forms/unit-form.tsx` — shared create/edit form
- [ ] Create properties list page (`/properties`)
- [ ] Create property detail page (`/properties/[propertyId]`) with inline units list
- [ ] Create property new/edit pages
- [ ] Create unit new/edit pages

## Medium Priority — Phase 4: Tenants + Leases
- [ ] Create `src/lib/validations/tenant.ts` — tenantSchema
- [ ] Create `src/lib/validations/lease.ts` — leaseSchema with date refinement
- [ ] Create `src/lib/actions/tenants.ts` — server actions
- [ ] Create `src/lib/actions/leases.ts` — server actions with business rules
- [ ] Create tenant list, detail, new/edit pages
- [ ] Create lease list, detail, new pages
- [ ] Implement lease → unit status sync (ACTIVE → OCCUPIED, TERMINATED → VACANT)

## Medium Priority — Phase 5: Billing
- [ ] Create `src/lib/validations/charge.ts` — generateChargesSchema
- [ ] Create `src/lib/validations/payment.ts` — paymentSchema
- [ ] Create `src/lib/actions/charges.ts` — server actions
- [ ] Create `src/lib/actions/payments.ts` — server actions
- [ ] Create billing overview page (`/billing`)
- [ ] Create generate charges page
- [ ] Create record payment page

## Low Priority — REST API Routes
- [ ] Properties API routes (`/api/v1/properties/...`)
- [ ] Units API routes (`/api/v1/properties/[propertyId]/units/...`)
- [ ] Tenants API routes (`/api/v1/tenants/...`)
- [ ] Leases API routes (`/api/v1/leases/...`)
- [ ] Charges API routes (`/api/v1/charges/...`)
- [ ] Payments API routes (`/api/v1/payments/...`)

## Low Priority — Polish
- [ ] Breadcrumb navigation component
- [ ] Loading skeletons for all route groups
- [ ] File upload for lease PDFs
- [ ] Serve uploaded files via API route

## Notes
- All queries must be scoped by `ownerId` for multi-tenancy
- Service layer is pure business logic — no auth, no revalidation
- Server actions are thin wrappers: auth → validate → service → revalidate
- Use `decimal.js` for monetary arithmetic, never raw JS floats
- Zod v4 with `@hookform/resolvers` v5.2.2 (compatible)
- Build warning about standalone trace + parenthesized routes is a known Next.js 14 issue, non-blocking
