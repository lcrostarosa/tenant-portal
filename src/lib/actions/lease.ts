"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { createLease, updateLease, deleteLease } from "@/lib/services/lease"
import { createLeaseSchema, updateLeaseSchema } from "@/lib/validations/lease"
import type { ActionResult } from "@/lib/actions/property"

export async function createLeaseAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = createLeaseSchema.safeParse({
    ...raw,
    rentAmount: raw.rentAmount ? Number(raw.rentAmount) : undefined,
    securityDeposit: raw.securityDeposit ? Number(raw.securityDeposit) : undefined,
    rentDueDay: raw.rentDueDay ? Number(raw.rentDueDay) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const lease = await createLease(parsed.data, session.user.id)
    revalidatePath("/leases")
    revalidatePath(`/properties/${raw.propertyId}`)
    return { success: true, data: { id: lease.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create lease" }
  }
}

export async function updateLeaseAction(id: string, formData: FormData): Promise<ActionResult> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = updateLeaseSchema.safeParse({
    ...raw,
    rentAmount: raw.rentAmount ? Number(raw.rentAmount) : undefined,
    securityDeposit: raw.securityDeposit ? Number(raw.securityDeposit) : undefined,
    rentDueDay: raw.rentDueDay ? Number(raw.rentDueDay) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    await updateLease(id, parsed.data, session.user.id)
    revalidatePath("/leases")
    revalidatePath(`/leases/${id}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update lease" }
  }
}

export async function deleteLeaseAction(id: string): Promise<ActionResult> {
  const session = await requireAuth()

  try {
    await deleteLease(id, session.user.id)
    revalidatePath("/leases")
    revalidatePath("/properties")
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete lease" }
  }
}
