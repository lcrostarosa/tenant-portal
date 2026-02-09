import { describe, test, expect } from "vitest"
import { createExpenseSchema, updateExpenseSchema } from "@/lib/validations/expense"
import { createMileageSchema, updateMileageSchema } from "@/lib/validations/mileage"
import { createMaintenanceRequestSchema, updateMaintenanceStatusSchema, createMaintenanceCommentSchema } from "@/lib/validations/maintenance"
import { createPreventiveMaintenanceSchema, updatePreventiveMaintenanceSchema } from "@/lib/validations/preventive-maintenance"
import { createPropertySchema, updatePropertySchema } from "@/lib/validations/property"
import { createTenantSchema, updateTenantSchema } from "@/lib/validations/tenant"
import { createUnitSchema, updateUnitSchema } from "@/lib/validations/unit"
import { createChargeSchema, updateChargeSchema } from "@/lib/validations/charge"
import { createPaymentSchema } from "@/lib/validations/payment"
import { createLeaseSchema, updateLeaseSchema } from "@/lib/validations/lease"

// ---- Expense ----
describe("Expense validations", () => {
  test("createExpenseSchema accepts valid input", () => {
    const result = createExpenseSchema.safeParse({
      date: "2025-01-15",
      amount: 150.5,
      category: "REPAIRS",
      description: "Plumbing fix",
    })
    expect(result.success).toBe(true)
  })

  test("createExpenseSchema rejects missing required fields", () => {
    const result = createExpenseSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  test("createExpenseSchema rejects invalid category", () => {
    const result = createExpenseSchema.safeParse({
      date: "2025-01-15",
      amount: 100,
      category: "INVALID",
      description: "Test",
    })
    expect(result.success).toBe(false)
  })

  test("createExpenseSchema rejects non-positive amount", () => {
    const result = createExpenseSchema.safeParse({
      date: "2025-01-15",
      amount: -10,
      category: "REPAIRS",
      description: "Test",
    })
    expect(result.success).toBe(false)
  })

  test("updateExpenseSchema accepts partial input", () => {
    const result = updateExpenseSchema.safeParse({ amount: 200 })
    expect(result.success).toBe(true)
  })

  test("updateExpenseSchema accepts empty object", () => {
    const result = updateExpenseSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ---- Mileage ----
describe("Mileage validations", () => {
  test("createMileageSchema accepts valid input", () => {
    const result = createMileageSchema.safeParse({
      date: "2025-01-15",
      miles: 25.5,
      purpose: "Property inspection",
    })
    expect(result.success).toBe(true)
  })

  test("createMileageSchema rejects missing purpose", () => {
    const result = createMileageSchema.safeParse({
      date: "2025-01-15",
      miles: 10,
    })
    expect(result.success).toBe(false)
  })

  test("createMileageSchema rejects non-positive miles", () => {
    const result = createMileageSchema.safeParse({
      date: "2025-01-15",
      miles: 0,
      purpose: "Test",
    })
    expect(result.success).toBe(false)
  })

  test("updateMileageSchema accepts partial input", () => {
    const result = updateMileageSchema.safeParse({ miles: 30 })
    expect(result.success).toBe(true)
  })
})

// ---- Maintenance ----
describe("Maintenance validations", () => {
  test("createMaintenanceRequestSchema accepts valid input", () => {
    const result = createMaintenanceRequestSchema.safeParse({
      title: "Leaking faucet",
      description: "Kitchen faucet is dripping",
      priority: "HIGH",
      category: "PLUMBING",
      unitId: "unit-123",
    })
    expect(result.success).toBe(true)
  })

  test("createMaintenanceRequestSchema rejects missing title", () => {
    const result = createMaintenanceRequestSchema.safeParse({
      description: "Something",
      priority: "LOW",
      category: "OTHER",
      unitId: "unit-1",
    })
    expect(result.success).toBe(false)
  })

  test("updateMaintenanceStatusSchema accepts valid status", () => {
    const result = updateMaintenanceStatusSchema.safeParse({
      status: "IN_PROGRESS",
    })
    expect(result.success).toBe(true)
  })

  test("updateMaintenanceStatusSchema rejects invalid status", () => {
    const result = updateMaintenanceStatusSchema.safeParse({
      status: "INVALID",
    })
    expect(result.success).toBe(false)
  })

  test("createMaintenanceCommentSchema accepts valid input", () => {
    const result = createMaintenanceCommentSchema.safeParse({
      text: "Working on it",
    })
    expect(result.success).toBe(true)
  })

  test("createMaintenanceCommentSchema rejects empty text", () => {
    const result = createMaintenanceCommentSchema.safeParse({ text: "" })
    expect(result.success).toBe(false)
  })
})

// ---- Preventive Maintenance ----
describe("Preventive Maintenance validations", () => {
  test("createPreventiveMaintenanceSchema accepts valid input", () => {
    const result = createPreventiveMaintenanceSchema.safeParse({
      title: "HVAC filter change",
      frequency: "QUARTERLY",
      nextDueDate: "2025-04-01",
    })
    expect(result.success).toBe(true)
  })

  test("createPreventiveMaintenanceSchema rejects invalid frequency", () => {
    const result = createPreventiveMaintenanceSchema.safeParse({
      title: "Test",
      frequency: "DAILY",
      nextDueDate: "2025-04-01",
    })
    expect(result.success).toBe(false)
  })

  test("updatePreventiveMaintenanceSchema accepts partial input", () => {
    const result = updatePreventiveMaintenanceSchema.safeParse({
      title: "Updated title",
    })
    expect(result.success).toBe(true)
  })
})

// ---- Property ----
describe("Property validations", () => {
  test("createPropertySchema accepts valid input", () => {
    const result = createPropertySchema.safeParse({
      name: "Sunset Apartments",
      address: "123 Main St",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
    })
    expect(result.success).toBe(true)
  })

  test("createPropertySchema rejects missing address", () => {
    const result = createPropertySchema.safeParse({
      name: "Test",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
    })
    expect(result.success).toBe(false)
  })

  test("updatePropertySchema accepts partial input", () => {
    const result = updatePropertySchema.safeParse({ name: "New Name" })
    expect(result.success).toBe(true)
  })
})

// ---- Tenant ----
describe("Tenant validations", () => {
  test("createTenantSchema accepts valid input", () => {
    const result = createTenantSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    })
    expect(result.success).toBe(true)
  })

  test("createTenantSchema rejects invalid email", () => {
    const result = createTenantSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "not-an-email",
    })
    expect(result.success).toBe(false)
  })

  test("updateTenantSchema accepts partial input", () => {
    const result = updateTenantSchema.safeParse({ phone: "555-1234" })
    expect(result.success).toBe(true)
  })
})

// ---- Unit ----
describe("Unit validations", () => {
  test("createUnitSchema accepts valid input", () => {
    const result = createUnitSchema.safeParse({
      unitNumber: "101",
      bedrooms: 2,
      bathrooms: 1,
      marketRent: 1500,
      propertyId: "prop-123",
    })
    expect(result.success).toBe(true)
  })

  test("createUnitSchema rejects negative bedrooms", () => {
    const result = createUnitSchema.safeParse({
      unitNumber: "101",
      bedrooms: -1,
      bathrooms: 1,
      marketRent: 1500,
      propertyId: "prop-123",
    })
    expect(result.success).toBe(false)
  })

  test("createUnitSchema rejects non-positive market rent", () => {
    const result = createUnitSchema.safeParse({
      unitNumber: "101",
      bedrooms: 2,
      bathrooms: 1,
      marketRent: 0,
      propertyId: "prop-123",
    })
    expect(result.success).toBe(false)
  })

  test("updateUnitSchema accepts partial input without propertyId", () => {
    const result = updateUnitSchema.safeParse({ unitNumber: "202" })
    expect(result.success).toBe(true)
  })
})

// ---- Charge ----
describe("Charge validations", () => {
  test("createChargeSchema accepts valid input", () => {
    const result = createChargeSchema.safeParse({
      type: "RENT",
      description: "Monthly rent",
      amount: 1500,
      dueDate: new Date("2025-02-01"),
      leaseId: "lease-123",
    })
    expect(result.success).toBe(true)
  })

  test("createChargeSchema rejects invalid type", () => {
    const result = createChargeSchema.safeParse({
      type: "INVALID",
      description: "Test",
      amount: 100,
      dueDate: new Date(),
      leaseId: "lease-1",
    })
    expect(result.success).toBe(false)
  })

  test("updateChargeSchema accepts status update", () => {
    const result = updateChargeSchema.safeParse({ status: "PAID" })
    expect(result.success).toBe(true)
  })

  test("updateChargeSchema rejects invalid status", () => {
    const result = updateChargeSchema.safeParse({ status: "INVALID" })
    expect(result.success).toBe(false)
  })
})

// ---- Payment ----
describe("Payment validations", () => {
  test("createPaymentSchema accepts valid input", () => {
    const result = createPaymentSchema.safeParse({
      amount: 1500,
      method: "CHECK",
      receivedDate: new Date("2025-01-15"),
      tenantId: "tenant-123",
    })
    expect(result.success).toBe(true)
  })

  test("createPaymentSchema rejects non-positive amount", () => {
    const result = createPaymentSchema.safeParse({
      amount: 0,
      method: "CASH",
      receivedDate: new Date(),
      tenantId: "tenant-1",
    })
    expect(result.success).toBe(false)
  })

  test("createPaymentSchema rejects invalid method", () => {
    const result = createPaymentSchema.safeParse({
      amount: 100,
      method: "BITCOIN",
      receivedDate: new Date(),
      tenantId: "tenant-1",
    })
    expect(result.success).toBe(false)
  })
})

// ---- Lease ----
describe("Lease validations", () => {
  test("createLeaseSchema accepts valid input", () => {
    const result = createLeaseSchema.safeParse({
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      rentAmount: 1500,
      tenantId: "tenant-123",
      unitId: "unit-123",
    })
    expect(result.success).toBe(true)
  })

  test("createLeaseSchema rejects end date before start date", () => {
    const result = createLeaseSchema.safeParse({
      startDate: new Date("2025-12-31"),
      endDate: new Date("2025-01-01"),
      rentAmount: 1500,
      tenantId: "tenant-123",
      unitId: "unit-123",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("endDate"))).toBe(true)
    }
  })

  test("createLeaseSchema rejects non-positive rent", () => {
    const result = createLeaseSchema.safeParse({
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      rentAmount: -100,
      tenantId: "tenant-1",
      unitId: "unit-1",
    })
    expect(result.success).toBe(false)
  })

  test("updateLeaseSchema accepts partial input", () => {
    const result = updateLeaseSchema.safeParse({ rentAmount: 1800 })
    expect(result.success).toBe(true)
  })
})
