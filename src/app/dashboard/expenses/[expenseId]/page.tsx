import { auth } from "@/lib/auth"
import { getExpenseById } from "@/lib/services/expense"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseActions } from "./actions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Pencil } from "lucide-react"

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ expenseId: string }>
}) {
  const session = await auth()
  const { expenseId } = await params
  const expense = await getExpenseById(expenseId, session!.user.id)

  if (!expense) notFound()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{expense.description}</h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(expense.date)} — {expense.category.replace(/_/g, " ")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/expenses/${expense.id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <ExpenseActions expenseId={expense.id} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(expense.amount))}</div>
          </CardContent>
        </Card>
        {expense.vendor && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">{expense.vendor}</div>
            </CardContent>
          </Card>
        )}
        {expense.property && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Property</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">
                {expense.property.name}
                {expense.unit && ` — Unit ${expense.unit.unitNumber}`}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {expense.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{expense.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
