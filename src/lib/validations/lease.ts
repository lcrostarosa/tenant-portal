import { z } from "zod"

export const createLeaseSchema = z.object({
  startDate: z.coerce.date({ message: "Start date is required" }),
  endDate: z.coerce.date({ message: "End date is required" }),
  rentAmount: z.number().positive("Rent amount must be positive"),
  securityDeposit: z.number().min(0, "Security deposit cannot be negative").optional(),
  rentDueDay: z.number().int().min(1).max(28, "Rent due day must be 1–28").optional(),
  status: z.enum(["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"]).optional(),
  documentPath: z.string().optional(),
  notes: z.string().optional(),
  tenantId: z.string().min(1, "Tenant is required"),
  unitId: z.string().min(1, "Unit is required"),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
})

export const updateLeaseSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  rentAmount: z.number().positive("Rent amount must be positive").optional(),
  securityDeposit: z.number().min(0).optional(),
  rentDueDay: z.number().int().min(1).max(28).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"]).optional(),
  documentPath: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>
export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>
