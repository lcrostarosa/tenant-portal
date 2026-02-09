"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { createCharge, updateCharge, voidCharge, generateRentCharges } from "@/lib/services/charge"
import { createChargeSchema, updateChargeSchema } from "@/lib/validations/charge"
import type { ActionResult } from "@/lib/actions/property"

export async function createChargeAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = createChargeSchema.safeParse({
    ...raw,
    amount: raw.amount ? Number(raw.amount) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const charge = await createCharge(parsed.data, session.user.id)
    revalidatePath(`/dashboard/leases/${parsed.data.leaseId}`)
    revalidatePath("/dashboard/billing")
    return { success: true, data: { id: charge.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create charge" }
  }
}

export async function updateChargeAction(id: string, leaseId: string, formData: FormData): Promise<ActionResult> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = updateChargeSchema.safeParse({
    ...raw,
    amount: raw.amount ? Number(raw.amount) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    await updateCharge(id, parsed.data, session.user.id)
    revalidatePath(`/dashboard/leases/${leaseId}`)
    revalidatePath("/dashboard/billing")
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update charge" }
  }
}

export async function voidChargeAction(id: string, leaseId: string): Promise<ActionResult> {
  const session = await requireAuth()

  try {
    await voidCharge(id, session.user.id)
    revalidatePath(`/dashboard/leases/${leaseId}`)
    revalidatePath("/dashboard/billing")
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to void charge" }
  }
}

export async function generateRentChargesAction(month: string): Promise<ActionResult<{ count: number }>> {
  const session = await requireAuth()

  try {
    const charges = await generateRentCharges(session.user.id, new Date(month))
    revalidatePath("/dashboard/billing")
    revalidatePath("/dashboard/leases")
    return { success: true, data: { count: charges.length } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to generate rent charges" }
  }
}
