import { auth } from "@/lib/auth"
import { getLeaseById } from "@/lib/services/lease"
import { getDocumentsByEntity } from "@/lib/services/document"
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
import { LeaseActions } from "./actions"
import { LeaseDocuments } from "@/components/lease-documents"
import { getTenantFullName, formatCurrency, formatDate } from "@/lib/utils"
import { Pencil } from "lucide-react"

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ leaseId: string }>
}) {
  const session = await auth()
  const { leaseId } = await params
  const [lease, documents] = await Promise.all([
    getLeaseById(leaseId, session!.user.id),
    getDocumentsByEntity("lease", leaseId),
  ])

  if (!lease) notFound()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lease.unit.property.name} — Unit {lease.unit.unitNumber}
          </h1>
          <p className="text-muted-foreground mt-1">
            Tenant:{" "}
            <Link href={`/tenants/${lease.tenant.id}`} className="hover:underline">
              {getTenantFullName(lease.tenant)}
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/leases/${lease.id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <LeaseActions leaseId={lease.id} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={lease.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Period</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {formatDate(lease.startDate)} – {formatDate(lease.endDate)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Rent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(Number(lease.rentAmount))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Security Deposit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(Number(lease.securityDeposit))}</p>
          </CardContent>
        </Card>
      </div>

      {lease.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{lease.notes}</p>
          </CardContent>
        </Card>
      )}

      <LeaseDocuments
        leaseId={lease.id}
        documents={documents.map((d) => ({
          id: d.id,
          filename: d.filename,
          mimeType: d.mimeType,
          sizeBytes: d.sizeBytes,
          createdAt: d.createdAt.toISOString(),
        }))}
      />

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Charges ({lease.charges.length})
        </h2>
        {lease.charges.length === 0 ? (
          <p className="text-muted-foreground text-sm">No charges yet.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lease.charges.map((charge) => (
                  <TableRow key={charge.id}>
                    <TableCell className="font-medium">{charge.description}</TableCell>
                    <TableCell>{charge.type}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(charge.dueDate)}</TableCell>
                    <TableCell>
                      <StatusBadge status={charge.status} />
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(charge.amount))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(charge.paidAmount))}</TableCell>
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
