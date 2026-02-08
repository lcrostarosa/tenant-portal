"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { createUnit, updateUnit, deleteUnit } from "@/lib/services/unit"
import { createUnitSchema, updateUnitSchema } from "@/lib/validations/unit"
import type { ActionResult } from "@/lib/actions/property"

export async function createUnitAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = createUnitSchema.safeParse({
    ...raw,
    bedrooms: raw.bedrooms ? Number(raw.bedrooms) : undefined,
    bathrooms: raw.bathrooms ? Number(raw.bathrooms) : undefined,
    sqft: raw.sqft ? Number(raw.sqft) : undefined,
    marketRent: raw.marketRent ? Number(raw.marketRent) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const unit = await createUnit(parsed.data, session.user.id)
    revalidatePath(`/properties/${parsed.data.propertyId}`)
    return { success: true, data: { id: unit.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create unit" }
  }
}

export async function updateUnitAction(id: string, propertyId: string, formData: FormData): Promise<ActionResult> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = updateUnitSchema.safeParse({
    ...raw,
    bedrooms: raw.bedrooms ? Number(raw.bedrooms) : undefined,
    bathrooms: raw.bathrooms ? Number(raw.bathrooms) : undefined,
    sqft: raw.sqft ? Number(raw.sqft) : undefined,
    marketRent: raw.marketRent ? Number(raw.marketRent) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    await updateUnit(id, parsed.data, session.user.id)
    revalidatePath(`/properties/${propertyId}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update unit" }
  }
}

export async function deleteUnitAction(id: string, propertyId: string): Promise<ActionResult> {
  const session = await requireAuth()

  try {
    await deleteUnit(id, session.user.id)
    revalidatePath(`/properties/${propertyId}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete unit" }
  }
}
