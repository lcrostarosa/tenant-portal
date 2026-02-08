import { z } from "zod"

export const createUnitSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  bedrooms: z.number().int().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.number().min(0, "Bathrooms must be 0 or more"),
  sqft: z.number().int().positive("Square footage must be positive").optional(),
  marketRent: z.number().positive("Market rent must be positive"),
  status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE"]).optional(),
  notes: z.string().optional(),
  propertyId: z.string().min(1, "Property is required"),
})

export const updateUnitSchema = createUnitSchema.partial().omit({ propertyId: true })

export type CreateUnitInput = z.infer<typeof createUnitSchema>
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>
