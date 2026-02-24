# Tenant Portal

A full-featured property management application built with Next.js. 

## Screenshots

### Login
![Login](docs/screenshots/01-login.png)

### Landlord Dashboard
![Dashboard](docs/screenshots/02-dashboard.png)

### Properties
![Properties](docs/screenshots/03-properties.png)

### Tenants
![Tenants](docs/screenshots/04-tenants.png)

### Billing
![Billing](docs/screenshots/05-billing.png)

### Maintenance
![Maintenance](docs/screenshots/06-maintenance.png)

### Leases
![Leases](docs/screenshots/07-leases.png)

### Tenant Portal
![Tenant Portal](docs/screenshots/08-tenant-portal.png)

## Why This Exists

Managing rental properties involves a lot of repetitive work: generating rent charges every month, tracking payments, coordinating maintenance, communicating with tenants. Commercial tools either lock you into their workflow or charge premium prices for basic automation. This app gives me full control over my data with a REST API that lets me integrate with whatever tools I want.

## Features

### Property & Unit Management
- Create and manage properties with multiple units
- Track unit status (vacant, occupied, maintenance)
- Unit details including bedrooms, bathrooms, square footage, and market rent

### Tenant & Lease Management
- Full tenant profiles with contact information
- Lease tracking with start/end dates, rent amounts, security deposits
- Lease document upload (PDF)
- Lease status lifecycle (draft, active, expired, terminated)

### Billing
- Automated rent charge generation across all active leases
- Charge tracking with status (due, partial, paid, void)
- Payment recording with multiple methods (cash, check, Zelle, Venmo, bank transfer)
- Payment allocation to specific charges
- Outstanding balance dashboard

### Expenses & Mileage
- Expense tracking by category (repairs, mortgage, insurance, utilities, taxes, HOA, landscaping, cleaning, supplies, other)
- Link expenses to specific properties and units
- Mileage trip logging for property visits
- Useful for tax preparation and deduction tracking

### Maintenance
- Maintenance request submission and tracking
- Priority levels (low, medium, high, emergency)
- Category classification (plumbing, electrical, HVAC, appliance, structural, pest, other)
- Comment thread on each request for landlord-tenant communication
- Status workflow (open, in progress, scheduled, completed, closed)
- Preventive maintenance scheduling with recurring frequencies (weekly through annual)

### Tenant Portal
- Separate tenant-facing interface with role-based access
- Tenants can view their lease details, billing, and payment history
- Submit and track maintenance requests
- Comment on open maintenance requests

### Messaging
- In-app messaging between landlord and tenants
- SMS integration via Twilio (optional — works without it)
- Inbound SMS webhook for tenant replies
- Unread message tracking

### Notifications
- Email notifications via Resend (optional)
- Maintenance status update emails to tenants
- Cron endpoint for scheduled reminders (billing due dates, preventive maintenance)

### REST API
- Full CRUD API at `/api/v1/` for properties, units, tenants, leases, charges, and payments
- API key authentication for external integrations
- Designed for automation — generate charges, record payments, sync data with other tools

### Other
- Dark mode with system preference detection
- Breadcrumb navigation with entity name resolution
- Loading skeletons and navigation progress bar
- Responsive sidebar with mobile support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma 7 ORM
- **Auth**: NextAuth v5 (JWT strategy, credentials provider)
- **UI**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **SMS**: Twilio (optional)
- **Email**: Resend (optional)
- **Testing**: Vitest (91 tests)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use Docker)

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Start PostgreSQL with Docker:

```bash
docker compose up -d
```

3. Copy the environment file and configure:

```bash
cp .env.example .env
```

Required environment variables:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/property_manager
AUTH_SECRET=your-secret-here
```

Optional (for SMS/email):
```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
RESEND_API_KEY=...
```

4. Run migrations and seed the database:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

5. Start the dev server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) and log in:
   - **Landlord**: `admin@example.com` / `admin123`
   - **Tenant**: `tenant@example.com` / `tenant123`

## Testing

```bash
npm test              # Run all tests (91 tests)
npm run test:watch    # Watch mode
npm run test:routes   # Route smoke tests (requires dev server running)
```

## API Usage

Authenticate API requests with the `x-api-key` header. The API key is the user's ID (visible in the database).

```bash
# List properties
curl -H "x-api-key: YOUR_USER_ID" http://localhost:3000/api/v1/properties

# Create a charge
curl -X POST -H "x-api-key: YOUR_USER_ID" -H "Content-Type: application/json" \
  -d '{"type":"RENT","description":"March rent","amount":1500,"dueDate":"2025-03-01","leaseId":"..."}' \
  http://localhost:3000/api/v1/charges
```

## Project Structure

```
src/
  app/
    (auth)/          # Login page
    dashboard/       # Landlord dashboard (properties, tenants, leases, billing, expenses, mileage, maintenance, messages)
    tenant/          # Tenant portal (lease, billing, maintenance)
    api/             # REST API routes + webhooks
  components/        # UI components (forms, sidebar, breadcrumbs, etc.)
  lib/
    actions/         # Server actions (form handlers)
    services/        # Data access layer
    validations/     # Zod schemas
  generated/prisma/  # Generated Prisma client
prisma/
  schema.prisma      # Database schema
  seed.ts            # Demo data seeder
tests/               # Vitest test suites
```
