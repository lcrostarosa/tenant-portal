"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { recordPayment } from "@/lib/services/payment"
import { createPaymentSchema } from "@/lib/validations/payment"
import type { ActionResult } from "@/lib/actions/property"

export async function recordPaymentAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = createPaymentSchema.safeParse({
    ...raw,
    amount: raw.amount ? Number(raw.amount) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const payment = await recordPayment(parsed.data, session.user.id)
    revalidatePath(`/tenants/${parsed.data.tenantId}`)
    revalidatePath("/billing")
    revalidatePath("/payments")
    return { success: true, data: { id: payment.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to record payment" }
  }
}
