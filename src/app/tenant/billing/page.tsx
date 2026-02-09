import { requireTenantAuth } from "@/lib/auth"
import { getTenantCharges, getTenantPayments } from "@/lib/services/tenant-portal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function TenantBillingPage() {
  const { tenantId } = await requireTenantAuth()
  const [charges, payments] = await Promise.all([
    getTenantCharges(tenantId),
    getTenantPayments(tenantId),
  ])

  const outstanding = charges.filter((c) => c.status === "DUE" || c.status === "PARTIAL")
  const totalOutstanding = outstanding.reduce(
    (sum, c) => sum + (Number(c.amount) - Number(c.paidAmount)),
    0
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Outstanding balance: {formatCurrency(totalOutstanding)}
        </p>
      </div>

      <Tabs defaultValue="charges">
        <TabsList>
          <TabsTrigger value="charges">Charges ({charges.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="charges" className="mt-4">
          {charges.length === 0 ? (
            <p className="text-sm text-muted-foreground">No charges yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {charges.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(charge.dueDate)}
                      </TableCell>
                      <TableCell>{charge.description}</TableCell>
                      <TableCell>
                        <StatusBadge status={charge.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(charge.amount))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(charge.paidAmount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(payment.receivedDate)}
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(payment.amount))}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.reference ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
