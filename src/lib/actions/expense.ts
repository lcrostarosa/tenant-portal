"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { createExpense, updateExpense, deleteExpense } from "@/lib/services/expense"
import { createExpenseSchema, updateExpenseSchema } from "@/lib/validations/expense"
import type { ActionResult } from "@/lib/actions/property"

export async function createExpenseAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = createExpenseSchema.safeParse({
    ...raw,
    amount: raw.amount ? Number(raw.amount) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const expense = await createExpense(parsed.data, session.user.id)
    revalidatePath("/dashboard/expenses")
    return { success: true, data: { id: expense.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create expense" }
  }
}

export async function updateExpenseAction(id: string, formData: FormData): Promise<ActionResult> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = updateExpenseSchema.safeParse({
    ...raw,
    amount: raw.amount ? Number(raw.amount) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    await updateExpense(id, parsed.data, session.user.id)
    revalidatePath("/dashboard/expenses")
    revalidatePath(`/dashboard/expenses/${id}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update expense" }
  }
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  const session = await requireAuth()

  try {
    await deleteExpense(id, session.user.id)
    revalidatePath("/dashboard/expenses")
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete expense" }
  }
}
