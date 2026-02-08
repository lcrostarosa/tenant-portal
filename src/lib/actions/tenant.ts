"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { createTenant, updateTenant, deleteTenant } from "@/lib/services/tenant"
import { createTenantSchema, updateTenantSchema } from "@/lib/validations/tenant"
import type { ActionResult } from "@/lib/actions/property"

export async function createTenantAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = createTenantSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const tenant = await createTenant(parsed.data)
    revalidatePath("/tenants")
    return { success: true, data: { id: tenant.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create tenant" }
  }
}

export async function updateTenantAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = updateTenantSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    await updateTenant(id, parsed.data)
    revalidatePath("/tenants")
    revalidatePath(`/tenants/${id}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update tenant" }
  }
}

export async function deleteTenantAction(id: string): Promise<ActionResult> {
  await requireAuth()

  try {
    await deleteTenant(id)
    revalidatePath("/tenants")
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete tenant" }
  }
}
