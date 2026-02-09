import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { hash } from "bcryptjs"
import { subMonths, subDays, addMonths, addDays } from "date-fns"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await hash("admin123", 12)
  const tenantPasswordHash = await hash("tenant123", 12)

  // ── Users ──────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: "seed-admin-user-001",
      email: "admin@example.com",
      name: "Admin",
      passwordHash,
      role: "LANDLORD",
    },
  })
  console.log("Seeded admin user:", admin.email)

  const tenantUser = await prisma.user.upsert({
    where: { email: "tenant@example.com" },
    update: {},
    create: {
      id: "seed-tenant-user-001",
      email: "tenant@example.com",
      name: "Sarah Johnson",
      passwordHash: tenantPasswordHash,
      role: "TENANT",
    },
  })
  console.log("Seeded tenant user:", tenantUser.email)

  const ownerId = admin.id

  // ── Properties ─────────────────────────────────────────
  const properties = [
    { id: "seed-property-001", name: "Sunset Apartments", address: "100 Sunset Blvd", city: "Los Angeles", state: "CA", zipCode: "90028" },
    { id: "seed-property-002", name: "Oak Ridge Townhomes", address: "250 Oak Ridge Dr", city: "Austin", state: "TX", zipCode: "73301" },
    { id: "seed-property-003", name: "Maple Street Duplex", address: "42 Maple St", city: "Denver", state: "CO", zipCode: "80202" },
    { id: "seed-property-004", name: "Harbor View Condos", address: "800 Harbor Way", city: "San Diego", state: "CA", zipCode: "92101" },
  ]

  for (const p of properties) {
    await prisma.property.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, ownerId },
    })
  }
  console.log("Seeded", properties.length, "properties")

  // ── Units ──────────────────────────────────────────────
  const units = [
    // Sunset Apartments (6 units)
    { id: "seed-unit-001", unitNumber: "101", bedrooms: 1, bathrooms: 1, sqft: 650, marketRent: 1500, status: "OCCUPIED" as const, propertyId: "seed-property-001" },
    { id: "seed-unit-002", unitNumber: "102", bedrooms: 1, bathrooms: 1, sqft: 650, marketRent: 1500, status: "OCCUPIED" as const, propertyId: "seed-property-001" },
    { id: "seed-unit-003", unitNumber: "201", bedrooms: 2, bathrooms: 1, sqft: 900, marketRent: 2000, status: "OCCUPIED" as const, propertyId: "seed-property-001" },
    { id: "seed-unit-004", unitNumber: "202", bedrooms: 2, bathrooms: 1, sqft: 900, marketRent: 2000, status: "VACANT" as const, propertyId: "seed-property-001" },
    { id: "seed-unit-005", unitNumber: "301", bedrooms: 3, bathrooms: 2, sqft: 1200, marketRent: 2800, status: "OCCUPIED" as const, propertyId: "seed-property-001" },
    { id: "seed-unit-006", unitNumber: "302", bedrooms: 3, bathrooms: 2, sqft: 1200, marketRent: 2800, status: "MAINTENANCE" as const, propertyId: "seed-property-001" },
    // Oak Ridge Townhomes (5 units)
    { id: "seed-unit-007", unitNumber: "A", bedrooms: 3, bathrooms: 2.5, sqft: 1800, marketRent: 2200, status: "OCCUPIED" as const, propertyId: "seed-property-002" },
    { id: "seed-unit-008", unitNumber: "B", bedrooms: 3, bathrooms: 2.5, sqft: 1800, marketRent: 2200, status: "OCCUPIED" as const, propertyId: "seed-property-002" },
    { id: "seed-unit-009", unitNumber: "C", bedrooms: 2, bathrooms: 2, sqft: 1400, marketRent: 1800, status: "OCCUPIED" as const, propertyId: "seed-property-002" },
    { id: "seed-unit-010", unitNumber: "D", bedrooms: 2, bathrooms: 2, sqft: 1400, marketRent: 1800, status: "VACANT" as const, propertyId: "seed-property-002" },
    { id: "seed-unit-011", unitNumber: "E", bedrooms: 4, bathrooms: 3, sqft: 2400, marketRent: 3200, status: "OCCUPIED" as const, propertyId: "seed-property-002" },
    // Maple Street Duplex (2 units)
    { id: "seed-unit-012", unitNumber: "Upper", bedrooms: 2, bathrooms: 1, sqft: 1000, marketRent: 1600, status: "OCCUPIED" as const, propertyId: "seed-property-003" },
    { id: "seed-unit-013", unitNumber: "Lower", bedrooms: 2, bathrooms: 1, sqft: 1000, marketRent: 1600, status: "OCCUPIED" as const, propertyId: "seed-property-003" },
    // Harbor View Condos (5 units)
    { id: "seed-unit-014", unitNumber: "1A", bedrooms: 1, bathrooms: 1, sqft: 700, marketRent: 1800, status: "OCCUPIED" as const, propertyId: "seed-property-004" },
    { id: "seed-unit-015", unitNumber: "1B", bedrooms: 1, bathrooms: 1, sqft: 700, marketRent: 1800, status: "VACANT" as const, propertyId: "seed-property-004" },
    { id: "seed-unit-016", unitNumber: "2A", bedrooms: 2, bathrooms: 2, sqft: 1100, marketRent: 2500, status: "OCCUPIED" as const, propertyId: "seed-property-004" },
    { id: "seed-unit-017", unitNumber: "2B", bedrooms: 2, bathrooms: 2, sqft: 1100, marketRent: 2500, status: "OCCUPIED" as const, propertyId: "seed-property-004" },
    { id: "seed-unit-018", unitNumber: "PH", bedrooms: 3, bathrooms: 2, sqft: 1600, marketRent: 3500, status: "OCCUPIED" as const, propertyId: "seed-property-004" },
  ]

  for (const u of units) {
    await prisma.unit.upsert({
      where: { id: u.id },
      update: {},
      create: u,
    })
  }
  console.log("Seeded", units.length, "units")

  // ── Tenants ────────────────────────────────────────────
  const tenants = [
    { id: "seed-tenant-001", firstName: "Sarah", lastName: "Johnson", email: "sarah.j@example.com", phone: "555-100-0001", userId: tenantUser.id },
    { id: "seed-tenant-002", firstName: "Michael", lastName: "Chen", email: "m.chen@example.com", phone: "555-100-0002" },
    { id: "seed-tenant-003", firstName: "Emily", lastName: "Rodriguez", email: "emily.r@example.com", phone: "555-100-0003" },
    { id: "seed-tenant-004", firstName: "James", lastName: "Wilson", email: "j.wilson@example.com", phone: "555-100-0004" },
    { id: "seed-tenant-005", firstName: "Olivia", lastName: "Brown", email: "olivia.b@example.com", phone: "555-100-0005" },
    { id: "seed-tenant-006", firstName: "Daniel", lastName: "Martinez", email: "d.martinez@example.com", phone: "555-100-0006" },
    { id: "seed-tenant-007", firstName: "Sophia", lastName: "Lee", email: "sophia.l@example.com", phone: "555-100-0007" },
    { id: "seed-tenant-008", firstName: "David", lastName: "Taylor", email: "d.taylor@example.com", phone: "555-100-0008" },
    { id: "seed-tenant-009", firstName: "Emma", lastName: "Garcia", email: "emma.g@example.com", phone: "555-100-0009" },
    { id: "seed-tenant-010", firstName: "Alex", lastName: "Kim", email: "alex.k@example.com", phone: "555-100-0010" },
    { id: "seed-tenant-011", firstName: "Ryan", lastName: "Thompson", email: "ryan.t@example.com", phone: "555-100-0011" },
    { id: "seed-tenant-012", firstName: "Isabella", lastName: "White", email: "isabella.w@example.com", phone: "555-100-0012" },
  ]

  for (const t of tenants) {
    await prisma.tenant.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    })
  }
  console.log("Seeded", tenants.length, "tenants")

  // ── Leases ─────────────────────────────────────────────
  const now = new Date()
  const leases = [
    // Active leases
    { id: "seed-lease-001", status: "ACTIVE" as const, startDate: subMonths(now, 8), endDate: addMonths(now, 4), rentAmount: 1500, tenantId: "seed-tenant-001", unitId: "seed-unit-001", rentDueDay: 1 },
    { id: "seed-lease-002", status: "ACTIVE" as const, startDate: subMonths(now, 6), endDate: addMonths(now, 6), rentAmount: 1500, tenantId: "seed-tenant-002", unitId: "seed-unit-002", rentDueDay: 1 },
    { id: "seed-lease-003", status: "ACTIVE" as const, startDate: subMonths(now, 10), endDate: addMonths(now, 2), rentAmount: 2000, tenantId: "seed-tenant-003", unitId: "seed-unit-003", rentDueDay: 1 },
    { id: "seed-lease-004", status: "ACTIVE" as const, startDate: subMonths(now, 4), endDate: addMonths(now, 8), rentAmount: 2800, tenantId: "seed-tenant-004", unitId: "seed-unit-005", rentDueDay: 1 },
    { id: "seed-lease-005", status: "ACTIVE" as const, startDate: subMonths(now, 3), endDate: addMonths(now, 9), rentAmount: 2200, tenantId: "seed-tenant-005", unitId: "seed-unit-007", rentDueDay: 1 },
    { id: "seed-lease-006", status: "ACTIVE" as const, startDate: subMonths(now, 7), endDate: addMonths(now, 5), rentAmount: 2200, tenantId: "seed-tenant-006", unitId: "seed-unit-008", rentDueDay: 1 },
    { id: "seed-lease-007", status: "ACTIVE" as const, startDate: subMonths(now, 5), endDate: addMonths(now, 7), rentAmount: 1800, tenantId: "seed-tenant-007", unitId: "seed-unit-009", rentDueDay: 1 },
    // Expired
    { id: "seed-lease-008", status: "EXPIRED" as const, startDate: subMonths(now, 18), endDate: subMonths(now, 6), rentAmount: 1400, tenantId: "seed-tenant-008", unitId: "seed-unit-004", rentDueDay: 1 },
    { id: "seed-lease-009", status: "EXPIRED" as const, startDate: subMonths(now, 24), endDate: subMonths(now, 12), rentAmount: 2400, tenantId: "seed-tenant-009", unitId: "seed-unit-011", rentDueDay: 1 },
    // Draft
    { id: "seed-lease-010", status: "DRAFT" as const, startDate: addDays(now, 14), endDate: addMonths(now, 14), rentAmount: 2000, tenantId: "seed-tenant-010", unitId: "seed-unit-004", rentDueDay: 1 },
  ]

  for (const l of leases) {
    await prisma.lease.upsert({
      where: { id: l.id },
      update: {},
      create: l,
    })
  }
  console.log("Seeded", leases.length, "leases")

  // ── Charges (last 3 months of rent) ───────────────────
  const activeLeases = leases.filter((l) => l.status === "ACTIVE")
  let chargeCount = 0

  for (const lease of activeLeases) {
    for (let m = 3; m >= 1; m--) {
      const dueDate = subMonths(now, m - 1)
      dueDate.setDate(1)
      const chargeId = `seed-charge-${lease.id.slice(-3)}-m${m}`

      // Older months are PAID, current month varies
      const isPaid = m > 1
      const isPartial = m === 1 && Math.random() > 0.6

      await prisma.charge.upsert({
        where: { id: chargeId },
        update: {},
        create: {
          id: chargeId,
          type: "RENT",
          status: isPaid ? "PAID" : isPartial ? "PARTIAL" : "DUE",
          description: `Rent — ${dueDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
          amount: lease.rentAmount,
          paidAmount: isPaid ? lease.rentAmount : isPartial ? Math.floor(lease.rentAmount / 2) : 0,
          dueDate,
          leaseId: lease.id,
        },
      })
      chargeCount++
    }
  }
  console.log("Seeded", chargeCount, "charges")

  // ── Payments ───────────────────────────────────────────
  const payments = [
    { id: "seed-payment-001", amount: 1500, method: "BANK_TRANSFER" as const, receivedDate: subMonths(now, 2), tenantId: "seed-tenant-001" },
    { id: "seed-payment-002", amount: 1500, method: "BANK_TRANSFER" as const, receivedDate: subMonths(now, 1), tenantId: "seed-tenant-001" },
    { id: "seed-payment-003", amount: 1500, method: "CHECK" as const, receivedDate: subMonths(now, 2), tenantId: "seed-tenant-002" },
    { id: "seed-payment-004", amount: 1500, method: "CHECK" as const, receivedDate: subMonths(now, 1), tenantId: "seed-tenant-002" },
    { id: "seed-payment-005", amount: 2000, method: "ZELLE" as const, receivedDate: subMonths(now, 2), tenantId: "seed-tenant-003" },
    { id: "seed-payment-006", amount: 2000, method: "ZELLE" as const, receivedDate: subMonths(now, 1), tenantId: "seed-tenant-003" },
    { id: "seed-payment-007", amount: 2800, method: "BANK_TRANSFER" as const, receivedDate: subMonths(now, 2), tenantId: "seed-tenant-004" },
    { id: "seed-payment-008", amount: 2800, method: "BANK_TRANSFER" as const, receivedDate: subMonths(now, 1), tenantId: "seed-tenant-004" },
  ]

  for (const p of payments) {
    await prisma.payment.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    })
  }
  console.log("Seeded", payments.length, "payments")

  // ── Expenses ───────────────────────────────────────────
  const expenses = [
    { id: "seed-expense-001", date: subMonths(now, 2), amount: 450, category: "REPAIRS" as const, description: "Plumbing repair unit 302", vendor: "Mike's Plumbing", propertyId: "seed-property-001", unitId: "seed-unit-006", ownerId },
    { id: "seed-expense-002", date: subMonths(now, 2), amount: 1200, category: "INSURANCE" as const, description: "Property insurance - Sunset Apartments", vendor: "StateFarm", propertyId: "seed-property-001", ownerId },
    { id: "seed-expense-003", date: subMonths(now, 1), amount: 85, category: "LANDSCAPING" as const, description: "Monthly lawn service", vendor: "Green Thumb LLC", propertyId: "seed-property-002", ownerId },
    { id: "seed-expense-004", date: subMonths(now, 1), amount: 320, category: "UTILITIES" as const, description: "Common area electricity", propertyId: "seed-property-001", ownerId },
    { id: "seed-expense-005", date: subDays(now, 10), amount: 175, category: "CLEANING" as const, description: "Move-out cleaning unit 202", vendor: "Sparkle Clean", propertyId: "seed-property-001", unitId: "seed-unit-004", ownerId },
    { id: "seed-expense-006", date: subDays(now, 5), amount: 2100, category: "MORTGAGE" as const, description: "Monthly mortgage - Maple Street", propertyId: "seed-property-003", ownerId },
    { id: "seed-expense-007", date: subDays(now, 3), amount: 55, category: "SUPPLIES" as const, description: "Light bulbs and filters", ownerId },
    { id: "seed-expense-008", date: subDays(now, 1), amount: 350, category: "HOA" as const, description: "HOA fees - Harbor View", propertyId: "seed-property-004", ownerId },
    { id: "seed-expense-009", date: subMonths(now, 3), amount: 890, category: "TAXES" as const, description: "Property tax quarterly", propertyId: "seed-property-002", ownerId },
    { id: "seed-expense-010", date: subDays(now, 15), amount: 200, category: "REPAIRS" as const, description: "Dishwasher repair", vendor: "Appliance Pro", propertyId: "seed-property-004", unitId: "seed-unit-016", ownerId },
  ]

  for (const e of expenses) {
    await prisma.expense.upsert({
      where: { id: e.id },
      update: {},
      create: e,
    })
  }
  console.log("Seeded", expenses.length, "expenses")

  // ── Mileage Trips ──────────────────────────────────────
  const mileageTrips = [
    { id: "seed-mileage-001", date: subDays(now, 20), miles: 12.5, purpose: "Property inspection — Sunset Apartments", propertyId: "seed-property-001", ownerId },
    { id: "seed-mileage-002", date: subDays(now, 15), miles: 28.0, purpose: "Meet contractor for plumbing repair", propertyId: "seed-property-001", ownerId },
    { id: "seed-mileage-003", date: subDays(now, 10), miles: 35.5, purpose: "Showing unit D to prospective tenant", propertyId: "seed-property-002", ownerId },
    { id: "seed-mileage-004", date: subDays(now, 7), miles: 8.0, purpose: "Picked up supplies from Home Depot", ownerId },
    { id: "seed-mileage-005", date: subDays(now, 3), miles: 22.0, purpose: "Annual inspection — Maple Street Duplex", propertyId: "seed-property-003", ownerId },
    { id: "seed-mileage-006", date: subDays(now, 1), miles: 15.5, purpose: "Key handoff for new tenant", propertyId: "seed-property-004", ownerId },
  ]

  for (const m of mileageTrips) {
    await prisma.mileageTrip.upsert({
      where: { id: m.id },
      update: {},
      create: m,
    })
  }
  console.log("Seeded", mileageTrips.length, "mileage trips")

  // ── Maintenance Requests ───────────────────────────────
  const maintenanceRequests = [
    { id: "seed-maint-001", title: "Leaking kitchen faucet", description: "The kitchen faucet has been dripping constantly for the past 2 days. Water is pooling around the base.", status: "OPEN" as const, priority: "MEDIUM" as const, category: "PLUMBING" as const, unitId: "seed-unit-001", tenantId: "seed-tenant-001" },
    { id: "seed-maint-002", title: "Broken dishwasher", description: "Dishwasher makes loud grinding noise and doesn't drain properly after cycle.", status: "IN_PROGRESS" as const, priority: "MEDIUM" as const, category: "APPLIANCE" as const, unitId: "seed-unit-003", tenantId: "seed-tenant-003" },
    { id: "seed-maint-003", title: "AC not cooling", description: "AC unit is blowing warm air. Thermostat reads 82°F despite being set to 72°F.", status: "SCHEDULED" as const, priority: "HIGH" as const, category: "HVAC" as const, scheduledDate: addDays(now, 2), unitId: "seed-unit-007", tenantId: "seed-tenant-005" },
    { id: "seed-maint-004", title: "Light fixture in hallway", description: "Hallway light flickers intermittently. Sometimes it goes out entirely.", status: "COMPLETED" as const, priority: "LOW" as const, category: "ELECTRICAL" as const, completedDate: subDays(now, 3), unitId: "seed-unit-008", tenantId: "seed-tenant-006" },
    { id: "seed-maint-005", title: "Mouse spotted in kitchen", description: "Saw a mouse near the pantry area. Possible entry point near the back door.", status: "OPEN" as const, priority: "HIGH" as const, category: "PEST" as const, unitId: "seed-unit-009", tenantId: "seed-tenant-007" },
  ]

  for (const mr of maintenanceRequests) {
    await prisma.maintenanceRequest.upsert({
      where: { id: mr.id },
      update: {},
      create: mr,
    })
  }
  console.log("Seeded", maintenanceRequests.length, "maintenance requests")

  // ── Maintenance Comments ───────────────────────────────
  const comments = [
    { id: "seed-comment-001", text: "I've been using a towel to catch the water but it's getting worse.", authorId: "seed-tenant-001", authorName: "Sarah Johnson", authorRole: "TENANT", maintenanceRequestId: "seed-maint-001" },
    { id: "seed-comment-002", text: "We'll send a plumber out this week. In the meantime, please turn off the water supply valve under the sink if needed.", authorId: admin.id, authorName: "Admin", authorRole: "LANDLORD", maintenanceRequestId: "seed-maint-001" },
    { id: "seed-comment-003", text: "Technician has been dispatched and will arrive tomorrow between 2-4 PM.", authorId: admin.id, authorName: "Admin", authorRole: "LANDLORD", maintenanceRequestId: "seed-maint-002" },
    { id: "seed-comment-004", text: "Thank you! I'll make sure to be home.", authorId: "seed-tenant-003", authorName: "Emily Rodriguez", authorRole: "TENANT", maintenanceRequestId: "seed-maint-002" },
    { id: "seed-comment-005", text: "HVAC service scheduled for this Friday. They'll call 30 min before arrival.", authorId: admin.id, authorName: "Admin", authorRole: "LANDLORD", maintenanceRequestId: "seed-maint-003" },
    { id: "seed-comment-006", text: "Fixed — replaced the ballast. Should be all good now.", authorId: admin.id, authorName: "Admin", authorRole: "LANDLORD", maintenanceRequestId: "seed-maint-004" },
    { id: "seed-comment-007", text: "Thank you, it's working great!", authorId: "seed-tenant-006", authorName: "Daniel Martinez", authorRole: "TENANT", maintenanceRequestId: "seed-maint-004" },
  ]

  for (const c of comments) {
    await prisma.maintenanceComment.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    })
  }
  console.log("Seeded", comments.length, "maintenance comments")

  // ── Preventive Maintenance ─────────────────────────────
  const preventiveItems = [
    { id: "seed-pm-001", title: "HVAC Filter Replacement", description: "Replace air filters in all HVAC units", frequency: "QUARTERLY" as const, nextDueDate: addDays(now, 15), lastCompleted: subMonths(now, 2), notifyTenants: true, propertyId: "seed-property-001", ownerId, isActive: true },
    { id: "seed-pm-002", title: "Smoke Detector Battery Check", description: "Test all smoke detectors and replace batteries if needed", frequency: "SEMIANNUAL" as const, nextDueDate: addMonths(now, 2), lastCompleted: subMonths(now, 4), notifyTenants: true, ownerId, isActive: true },
    { id: "seed-pm-003", title: "Gutter Cleaning", description: "Clean gutters and downspouts", frequency: "ANNUAL" as const, nextDueDate: subDays(now, 5), notifyTenants: false, propertyId: "seed-property-003", ownerId, isActive: true },
  ]

  for (const pm of preventiveItems) {
    await prisma.preventiveMaintenance.upsert({
      where: { id: pm.id },
      update: {},
      create: pm,
    })
  }
  console.log("Seeded", preventiveItems.length, "preventive maintenance schedules")

  // ── Conversations & Messages ───────────────────────────
  const conv1 = await prisma.conversation.upsert({
    where: { tenantId_ownerId: { tenantId: "seed-tenant-001", ownerId } },
    update: {},
    create: {
      id: "seed-conv-001",
      tenantId: "seed-tenant-001",
      ownerId,
      lastMessageAt: subDays(now, 1),
    },
  })

  const conv2 = await prisma.conversation.upsert({
    where: { tenantId_ownerId: { tenantId: "seed-tenant-005", ownerId } },
    update: {},
    create: {
      id: "seed-conv-002",
      tenantId: "seed-tenant-005",
      ownerId,
      lastMessageAt: subDays(now, 3),
    },
  })

  const messages = [
    { id: "seed-msg-001", conversationId: conv1.id, direction: "OUTBOUND" as const, channel: "IN_APP" as const, status: "IN_APP_ONLY" as const, body: "Hi Sarah, just a reminder that your lease renewal is coming up in 4 months. Let me know if you'd like to discuss renewal terms.", createdAt: subDays(now, 5) },
    { id: "seed-msg-002", conversationId: conv1.id, direction: "INBOUND" as const, channel: "IN_APP" as const, status: "DELIVERED" as const, body: "Thanks for the heads up! I'm definitely interested in renewing. Can we schedule a time to talk about it?", createdAt: subDays(now, 4) },
    { id: "seed-msg-003", conversationId: conv1.id, direction: "OUTBOUND" as const, channel: "IN_APP" as const, status: "IN_APP_ONLY" as const, body: "Of course! I'm free this Thursday afternoon. Does 3 PM work for you?", createdAt: subDays(now, 3) },
    { id: "seed-msg-004", conversationId: conv1.id, direction: "INBOUND" as const, channel: "IN_APP" as const, status: "DELIVERED" as const, body: "Thursday at 3 PM works perfectly. See you then!", createdAt: subDays(now, 1) },
    { id: "seed-msg-005", conversationId: conv2.id, direction: "INBOUND" as const, channel: "IN_APP" as const, status: "DELIVERED" as const, body: "Hi, I wanted to ask about adding a parking spot to my lease. Is there availability?", createdAt: subDays(now, 5) },
    { id: "seed-msg-006", conversationId: conv2.id, direction: "OUTBOUND" as const, channel: "IN_APP" as const, status: "IN_APP_ONLY" as const, body: "Hi Olivia! Yes, we have 2 spots available. It's an additional $75/month. Would you like to add one?", createdAt: subDays(now, 3) },
  ]

  for (const m of messages) {
    await prisma.message.upsert({
      where: { id: m.id },
      update: {},
      create: m,
    })
  }
  console.log("Seeded", messages.length, "messages in", 2, "conversations")

  console.log("\n✓ Seed complete!")
  console.log("  Login as landlord: admin@example.com / admin123")
  console.log("  Login as tenant:   tenant@example.com / tenant123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
