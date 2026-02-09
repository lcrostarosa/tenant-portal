import { auth } from "@/lib/auth"
import { getTenantById } from "@/lib/services/tenant"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { TenantActions } from "./actions"
import { getTenantFullName, formatCurrency, formatDate, getOutstandingAmount } from "@/lib/utils"
import { Pencil, MessageSquare } from "lucide-react"

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const session = await auth()
  const { tenantId } = await params
  const tenant = await getTenantById(tenantId, session!.user.id)

  if (!tenant) notFound()

  const outstandingCharges = tenant.leases.flatMap((l) =>
    l.charges.filter((c) => c.status === "DUE" || c.status === "PARTIAL")
  )
  const outstandingBalance = getOutstandingAmount(
    outstandingCharges.map((c) => ({ amount: Number(c.amount), paidAmount: Number(c.paidAmount) }))
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getTenantFullName(tenant)}
          </h1>
          <div className="flex gap-4 text-muted-foreground mt-1">
            {tenant.email && <span>{tenant.email}</span>}
            {tenant.phone && <span>{tenant.phone}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tenants/${tenant.id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/messages?tenant=${tenant.id}`}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Send Message
            </Link>
          </Button>
          <TenantActions tenantId={tenant.id} />
        </div>
      </div>

      {tenant.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{tenant.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Leases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenant.leases.filter((l) => l.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(outstandingBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant.payments.length}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Leases</h2>
        {tenant.leases.length === 0 ? (
          <p className="text-muted-foreground text-sm">No leases found.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Rent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenant.leases.map((lease) => (
                  <TableRow key={lease.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/leases/${lease.id}`}
                        className="font-medium hover:underline"
                      >
                        {lease.unit.property.name} — Unit {lease.unit.unitNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lease.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(lease.startDate)} – {formatDate(lease.endDate)}
                    </TableCell>
                    <TableCell>{formatCurrency(Number(lease.rentAmount))}</TableCell>
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
