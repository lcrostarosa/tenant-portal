import { auth } from "@/lib/auth"
import { getExpenseById } from "@/lib/services/expense"
import { getProperties } from "@/lib/services/property"
import { notFound } from "next/navigation"
import { ExpenseForm } from "@/components/forms/expense-form"

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ expenseId: string }>
}) {
  const session = await auth()
  const { expenseId } = await params
  const [expense, properties] = await Promise.all([
    getExpenseById(expenseId, session!.user.id),
    getProperties(session!.user.id),
  ])

  if (!expense) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <ExpenseForm
        expense={{
          id: expense.id,
          date: expense.date,
          amount: Number(expense.amount),
          category: expense.category,
          description: expense.description,
          vendor: expense.vendor,
          propertyId: expense.propertyId,
          unitId: expense.unitId,
          notes: expense.notes,
        }}
        properties={properties.map((p) => ({
          id: p.id,
          name: p.name,
          units: p.units.map((u) => ({ id: u.id, unitNumber: u.unitNumber })),
        }))}
      />
    </div>
  )
}
