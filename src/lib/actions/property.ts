"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { createProperty, updateProperty, deleteProperty } from "@/lib/services/property"
import { createPropertySchema, updatePropertySchema } from "@/lib/validations/property"

export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }

export async function createPropertyAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = createPropertySchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const property = await createProperty(parsed.data, session.user.id)
    revalidatePath("/dashboard/properties")
    return { success: true, data: { id: property.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create property" }
  }
}

export async function updatePropertyAction(id: string, formData: FormData): Promise<ActionResult> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = updatePropertySchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    await updateProperty(id, parsed.data, session.user.id)
    revalidatePath("/dashboard/properties")
    revalidatePath(`/dashboard/properties/${id}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update property" }
  }
}

export async function deletePropertyAction(id: string): Promise<ActionResult> {
  const session = await requireAuth()

  try {
    await deleteProperty(id, session.user.id)
    revalidatePath("/dashboard/properties")
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete property" }
  }
}
