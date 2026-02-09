import { z } from "zod"

export const createExpenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(["REPAIRS", "MORTGAGE", "INSURANCE", "UTILITIES", "TAXES", "HOA", "LANDSCAPING", "CLEANING", "SUPPLIES", "OTHER"]),
  description: z.string().min(1, "Description is required"),
  vendor: z.string().optional(),
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
  notes: z.string().optional(),
})

export const updateExpenseSchema = createExpenseSchema.partial()

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
