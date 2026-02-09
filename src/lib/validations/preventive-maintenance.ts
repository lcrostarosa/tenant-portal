import { z } from "zod"

export const createPreventiveMaintenanceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL", "CUSTOM"]),
  customDays: z.number().int().positive().optional(),
  nextDueDate: z.string().min(1, "Next due date is required"),
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
  notifyTenants: z.boolean().optional(),
})

export const updatePreventiveMaintenanceSchema = createPreventiveMaintenanceSchema.partial()

export type CreatePreventiveMaintenanceInput = z.infer<typeof createPreventiveMaintenanceSchema>
export type UpdatePreventiveMaintenanceInput = z.infer<typeof updatePreventiveMaintenanceSchema>
