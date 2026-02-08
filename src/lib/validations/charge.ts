import { z } from "zod"

export const createChargeSchema = z.object({
  type: z.enum(["RENT", "LATE_FEE", "UTILITY", "REPAIR", "OTHER"]),
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.coerce.date({ message: "Due date is required" }),
  leaseId: z.string().min(1, "Lease is required"),
})

export const updateChargeSchema = z.object({
  type: z.enum(["RENT", "LATE_FEE", "UTILITY", "REPAIR", "OTHER"]).optional(),
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  dueDate: z.coerce.date().optional(),
  status: z.enum(["DUE", "PARTIAL", "PAID", "VOID"]).optional(),
})

export type CreateChargeInput = z.infer<typeof createChargeSchema>
export type UpdateChargeInput = z.infer<typeof updateChargeSchema>
