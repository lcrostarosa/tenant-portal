"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import {
  createPreventiveMaintenance,
  updatePreventiveMaintenance,
  deletePreventiveMaintenance,
  completePreventiveMaintenance,
} from "@/lib/services/preventive-maintenance"
import {
  createPreventiveMaintenanceSchema,
  updatePreventiveMaintenanceSchema,
} from "@/lib/validations/preventive-maintenance"
import type { ActionResult } from "@/lib/actions/property"

export async function createPreventiveMaintenanceAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const processed = {
    ...raw,
    customDays: raw.customDays ? Number(raw.customDays) : undefined,
    notifyTenants: raw.notifyTenants === "true" || raw.notifyTenants === "on",
  }
  const parsed = createPreventiveMaintenanceSchema.safeParse(processed)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const item = await createPreventiveMaintenance(parsed.data, session.user.id)
    revalidatePath("/dashboard/maintenance/preventive")
    return { success: true, data: { id: item.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create schedule" }
  }
}

export async function updatePreventiveMaintenanceAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const processed = {
    ...raw,
    customDays: raw.customDays ? Number(raw.customDays) : undefined,
    notifyTenants: raw.notifyTenants !== undefined ? (raw.notifyTenants === "true" || raw.notifyTenants === "on") : undefined,
  }
  const parsed = updatePreventiveMaintenanceSchema.safeParse(processed)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    await updatePreventiveMaintenance(id, parsed.data, session.user.id)
    revalidatePath("/dashboard/maintenance/preventive")
    revalidatePath(`/dashboard/maintenance/preventive/${id}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update schedule" }
  }
}

export async function deletePreventiveMaintenanceAction(id: string): Promise<ActionResult> {
  const session = await requireAuth()

  try {
    await deletePreventiveMaintenance(id, session.user.id)
    revalidatePath("/dashboard/maintenance/preventive")
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete schedule" }
  }
}

export async function completePreventiveMaintenanceAction(id: string): Promise<ActionResult> {
  const session = await requireAuth()

  try {
    await completePreventiveMaintenance(id, session.user.id)
    revalidatePath("/dashboard/maintenance/preventive")
    revalidatePath(`/dashboard/maintenance/preventive/${id}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to complete" }
  }
}
