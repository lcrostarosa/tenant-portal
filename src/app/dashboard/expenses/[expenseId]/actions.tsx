"use client"

import { useRouter } from "next/navigation"
import { deleteExpenseAction } from "@/lib/actions/expense"
import { DeleteDialog } from "@/components/delete-dialog"
import { useToast } from "@/hooks/use-toast"

export function ExpenseActions({ expenseId }: { expenseId: string }) {
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete() {
    const result = await deleteExpenseAction(expenseId)
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }
    toast({ title: "Expense deleted" })
    router.push("/dashboard/expenses")
    router.refresh()
  }

  return (
    <DeleteDialog
      title="Delete this expense?"
      description="This will permanently delete this expense record. This action cannot be undone."
      onConfirm={handleDelete}
    />
  )
}
