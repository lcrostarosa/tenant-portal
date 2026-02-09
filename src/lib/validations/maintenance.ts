import { z } from "zod"

export const createMaintenanceRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "EMERGENCY"]).optional(),
  category: z.enum(["PLUMBING", "ELECTRICAL", "HVAC", "APPLIANCE", "STRUCTURAL", "PEST", "OTHER"]).optional(),
  unitId: z.string().min(1, "Unit is required"),
})

export const updateMaintenanceStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "SCHEDULED", "COMPLETED", "CLOSED"]),
  scheduledDate: z.string().optional(),
})

export const createMaintenanceCommentSchema = z.object({
  text: z.string().min(1, "Comment is required"),
})

export type CreateMaintenanceRequestInput = z.infer<typeof createMaintenanceRequestSchema>
export type UpdateMaintenanceStatusInput = z.infer<typeof updateMaintenanceStatusSchema>
export type CreateMaintenanceCommentInput = z.infer<typeof createMaintenanceCommentSchema>
