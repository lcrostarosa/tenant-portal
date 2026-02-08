import { z } from "zod"

export const createPaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["CASH", "CHECK", "ZELLE", "VENMO", "BANK_TRANSFER", "OTHER"]),
  receivedDate: z.coerce.date({ message: "Received date is required" }),
  reference: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(["MANUAL", "WEBHOOK"]).optional(),
  tenantId: z.string().min(1, "Tenant is required"),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
