import { auth } from "@/lib/auth"
import { getPreventiveMaintenanceItems } from "@/lib/services/preventive-maintenance"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
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
import { Badge } from "@/components/ui/badge"

export default async function PreventiveMaintenancePage() {
  const session = await auth()
  const items = await getPreventiveMaintenanceItems(session!.user.id)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Preventive Maintenance"
        description={`${items.length} ${items.length === 1 ? "schedule" : "schedules"}`}
        actionLabel="New Schedule"
        actionHref="/dashboard/maintenance/preventive/new"
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No preventive schedules"
          description="Create recurring maintenance schedules to stay on top of property upkeep."
          actionLabel="New Schedule"
          actionHref="/dashboard/maintenance/preventive/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Property / Unit</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isDue = new Date(item.nextDueDate) <= new Date()
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/maintenance/preventive/${item.id}`}
                        className="font-medium hover:underline"
                      >
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.frequency.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.property?.name ?? "—"}
                      {item.unit ? ` — ${item.unit.unitNumber}` : ""}
                    </TableCell>
                    <TableCell className={isDue ? "text-destructive font-medium" : "text-muted-foreground"}>
                      {formatDate(item.nextDueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
