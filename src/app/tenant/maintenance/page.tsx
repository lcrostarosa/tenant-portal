import { requireTenantAuth } from "@/lib/auth"
import { getTenantMaintenanceRequests } from "@/lib/services/maintenance"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { StatusBadge } from "@/components/status-badge"
import { Wrench } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"

export default async function TenantMaintenancePage() {
  const { tenantId } = await requireTenantAuth()
  const requests = await getTenantMaintenanceRequests(tenantId)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Maintenance Requests"
        description={`${requests.length} ${requests.length === 1 ? "request" : "requests"}`}
        actionLabel="New Request"
        actionHref="/tenant/maintenance/new"
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance requests"
          description="Submit a request if something needs fixing."
          actionLabel="New Request"
          actionHref="/tenant/maintenance/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Property / Unit</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <Link
                      href={`/tenant/maintenance/${req.id}`}
                      className="font-medium hover:underline"
                    >
                      {req.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {req.unit.property.name} — {req.unit.unitNumber}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(req.createdAt)}
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
