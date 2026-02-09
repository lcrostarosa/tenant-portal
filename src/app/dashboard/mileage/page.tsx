import { auth } from "@/lib/auth"
import { getMileageTrips } from "@/lib/services/mileage"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Car } from "lucide-react"
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

export default async function MileagePage() {
  const session = await auth()
  const trips = await getMileageTrips(session!.user.id)

  const totalMiles = trips.reduce((sum, t) => sum + t.miles, 0)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Mileage"
        description={`${trips.length} ${trips.length === 1 ? "trip" : "trips"} — ${totalMiles.toFixed(1)} total miles`}
        actionLabel="Add Trip"
        actionHref="/dashboard/mileage/new"
      />

      {trips.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No mileage trips yet"
          description="Track your property-related mileage for tax deductions."
          actionLabel="Add Trip"
          actionHref="/dashboard/mileage/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Property</TableHead>
                <TableHead className="text-right">Miles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(trip.date)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/mileage/${trip.id}`}
                      className="font-medium hover:underline"
                    >
                      {trip.purpose}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {trip.property?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {trip.miles.toFixed(1)}
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
