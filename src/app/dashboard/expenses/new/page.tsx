import { auth } from "@/lib/auth"
import { getProperties } from "@/lib/services/property"
import { ExpenseForm } from "@/components/forms/expense-form"

export default async function NewExpensePage() {
  const session = await auth()
  const properties = await getProperties(session!.user.id)

  return (
    <div className="p-6 max-w-2xl">
      <ExpenseForm
        properties={properties.map((p) => ({
          id: p.id,
          name: p.name,
          units: p.units.map((u) => ({ id: u.id, unitNumber: u.unitNumber })),
        }))}
      />
    </div>
  )
}
