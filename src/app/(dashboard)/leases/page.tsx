import { auth } from "@/lib/auth"
import { getLeases } from "@/lib/services/lease"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { FileText } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { getTenantFullName, formatCurrency, formatDate } from "@/lib/utils"

export default async function LeasesPage() {
  const session = await auth()
  const leases = await getLeases(session!.user.id)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Leases"
        description={`${leases.length} ${leases.length === 1 ? "lease" : "leases"}`}
        actionLabel="New Lease"
        actionHref="/leases/new"
      />

      {leases.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No leases yet"
          description="Create a lease to link a tenant to a unit and start tracking billing."
          actionLabel="New Lease"
          actionHref="/leases/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property / Unit</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Rent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leases.map((lease) => (
                <TableRow key={lease.id}>
                  <TableCell>
                    <Link
                      href={`/leases/${lease.id}`}
                      className="font-medium hover:underline"
                    >
                      {lease.unit.property.name} — Unit {lease.unit.unitNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/tenants/${lease.tenant.id}`}
                      className="hover:underline"
                    >
                      {getTenantFullName(lease.tenant)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lease.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(lease.startDate)} – {formatDate(lease.endDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(lease.rentAmount))}
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
