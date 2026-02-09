import { auth } from "@/lib/auth"
import { getMaintenanceRequests } from "@/lib/services/maintenance"
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
import { Button } from "@/components/ui/button"

export default async function MaintenancePage() {
  const session = await auth()
  const requests = await getMaintenanceRequests(session!.user.id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Maintenance"
          description={`${requests.length} ${requests.length === 1 ? "request" : "requests"}`}
        />
        <Button asChild variant="outline">
          <Link href="/dashboard/maintenance/preventive">Preventive Schedules</Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance requests"
          description="Maintenance requests from tenants will appear here."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Property / Unit</TableHead>
                <TableHead>Tenant</TableHead>
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
                      href={`/dashboard/maintenance/${req.id}`}
                      className="font-medium hover:underline"
                    >
                      {req.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {req.unit.property.name} — {req.unit.unitNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {req.tenant.firstName} {req.tenant.lastName}
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
