import { z } from "zod"

export const createMileageSchema = z.object({
  date: z.string().min(1, "Date is required"),
  miles: z.number().positive("Miles must be positive"),
  purpose: z.string().min(1, "Purpose is required"),
  propertyId: z.string().optional(),
  notes: z.string().optional(),
})

export const updateMileageSchema = createMileageSchema.partial()

export type CreateMileageInput = z.infer<typeof createMileageSchema>
export type UpdateMileageInput = z.infer<typeof updateMileageSchema>
