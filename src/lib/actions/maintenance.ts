"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import {
  createMaintenanceRequest,
  updateMaintenanceStatus,
  addMaintenanceComment,
} from "@/lib/services/maintenance"
import {
  createMaintenanceRequestSchema,
  updateMaintenanceStatusSchema,
  createMaintenanceCommentSchema,
} from "@/lib/validations/maintenance"
import type { ActionResult } from "@/lib/actions/property"

export async function createMaintenanceRequestAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = createMaintenanceRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    // For landlord-created requests, we need a tenantId from the form
    const tenantId = formData.get("tenantId") as string
    if (!tenantId) {
      return { success: false, error: "Tenant is required" }
    }
    const request = await createMaintenanceRequest(parsed.data, tenantId)
    revalidatePath("/dashboard/maintenance")
    return { success: true, data: { id: request.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create request" }
  }
}

export async function createTenantMaintenanceRequestAction(
  formData: FormData,
  tenantId: string
): Promise<ActionResult<{ id: string }>> {
  const raw = Object.fromEntries(formData)
  const parsed = createMaintenanceRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const request = await createMaintenanceRequest(parsed.data, tenantId)
    revalidatePath("/tenant/maintenance")
    return { success: true, data: { id: request.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create request" }
  }
}

export async function updateMaintenanceStatusAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = updateMaintenanceStatusSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    await updateMaintenanceStatus(id, parsed.data, session.user.id)
    revalidatePath("/dashboard/maintenance")
    revalidatePath(`/dashboard/maintenance/${id}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update status" }
  }
}

export async function addMaintenanceCommentAction(
  requestId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = createMaintenanceCommentSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    await addMaintenanceComment(
      requestId,
      parsed.data,
      session.user.id,
      session.user.name ?? "Landlord",
      session.user.role ?? "LANDLORD"
    )
    revalidatePath(`/dashboard/maintenance/${requestId}`)
    revalidatePath(`/tenant/maintenance/${requestId}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to add comment" }
  }
}
