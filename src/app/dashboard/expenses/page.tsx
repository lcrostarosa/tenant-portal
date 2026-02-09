import { auth } from "@/lib/auth"
import { getExpenses } from "@/lib/services/expense"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Receipt } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"

export default async function ExpensesPage() {
  const session = await auth()
  const expenses = await getExpenses(session!.user.id)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Expenses"
        description={`${expenses.length} ${expenses.length === 1 ? "expense" : "expenses"}`}
        actionLabel="Add Expense"
        actionHref="/dashboard/expenses/new"
      />

      {expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description="Track your property expenses for tax reporting."
          actionLabel="Add Expense"
          actionHref="/dashboard/expenses/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Property</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/expenses/${expense.id}`}
                      className="font-medium hover:underline"
                    >
                      {expense.description}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {expense.category.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {expense.property?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(expense.amount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
