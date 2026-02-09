"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { createMileageTrip, updateMileageTrip, deleteMileageTrip } from "@/lib/services/mileage"
import { createMileageSchema, updateMileageSchema } from "@/lib/validations/mileage"
import type { ActionResult } from "@/lib/actions/property"

export async function createMileageAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = createMileageSchema.safeParse({
    ...raw,
    miles: raw.miles ? Number(raw.miles) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const trip = await createMileageTrip(parsed.data, session.user.id)
    revalidatePath("/dashboard/mileage")
    return { success: true, data: { id: trip.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create mileage trip" }
  }
}

export async function updateMileageAction(id: string, formData: FormData): Promise<ActionResult> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = updateMileageSchema.safeParse({
    ...raw,
    miles: raw.miles ? Number(raw.miles) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    await updateMileageTrip(id, parsed.data, session.user.id)
    revalidatePath("/dashboard/mileage")
    revalidatePath(`/dashboard/mileage/${id}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update mileage trip" }
  }
}

export async function deleteMileageAction(id: string): Promise<ActionResult> {
  const session = await requireAuth()

  try {
    await deleteMileageTrip(id, session.user.id)
    revalidatePath("/dashboard/mileage")
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete mileage trip" }
  }
}
