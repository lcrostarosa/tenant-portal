import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { formatCurrency, formatDate, getTenantFullName } from "@/lib/utils"
import { DollarSign, Receipt, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function BillingPage() {
  const session = await auth()
  const userId = session!.user.id

  const [outstandingCharges, recentPayments, totalStats] = await Promise.all([
    prisma.charge.findMany({
      where: {
        status: { in: ["DUE", "PARTIAL"] },
        lease: { unit: { property: { ownerId: userId } } },
      },
      include: {
        lease: {
          include: {
            tenant: true,
            unit: { include: { property: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.payment.findMany({
      where: {
        tenant: {
          leases: { some: { unit: { property: { ownerId: userId } } } },
        },
      },
      include: { tenant: true },
      orderBy: { receivedDate: "desc" },
      take: 10,
    }),
    prisma.charge.aggregate({
      where: {
        status: { in: ["DUE", "PARTIAL"] },
        lease: { unit: { property: { ownerId: userId } } },
      },
      _sum: { amount: true, paidAmount: true },
      _count: true,
    }),
  ])

  const totalOutstanding =
    Number(totalStats._sum.amount ?? 0) - Number(totalStats._sum.paidAmount ?? 0)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Billing"
        description="Manage charges and payments"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalStats._count} unpaid charge{totalStats._count !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generate Charges</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/billing/charges/generate">Generate Rent Charges</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Record Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/billing/payments/new">Record Payment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Outstanding Charges ({outstandingCharges.length})
        </h2>
        {outstandingCharges.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No outstanding charges"
            description="All charges are paid. Generate rent charges to create new billing entries."
            actionLabel="Generate Rent Charges"
            actionHref="/dashboard/billing/charges/generate"
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingCharges.map((charge) => (
                  <TableRow key={charge.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/leases/${charge.lease.id}`}
                        className="font-medium hover:underline"
                      >
                        {charge.description}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/tenants/${charge.lease.tenant.id}`}
                        className="hover:underline"
                      >
                        {getTenantFullName(charge.lease.tenant)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(charge.dueDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={charge.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(charge.amount))}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(charge.amount) - Number(charge.paidAmount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
        {recentPayments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(payment.receivedDate)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/tenants/${payment.tenant.id}`}
                        className="hover:underline"
                      >
                        {getTenantFullName(payment.tenant)}
                      </Link>
                    </TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.reference ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(payment.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
