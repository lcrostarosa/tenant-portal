import { auth } from "@/lib/auth"
import { getMileageTripById } from "@/lib/services/mileage"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MileageActions } from "./actions"
import { formatDate } from "@/lib/utils"
import { Pencil } from "lucide-react"

export default async function MileageDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const session = await auth()
  const { tripId } = await params
  const trip = await getMileageTripById(tripId, session!.user.id)

  if (!trip) notFound()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{trip.purpose}</h1>
          <p className="text-muted-foreground mt-1">{formatDate(trip.date)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/mileage/${trip.id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <MileageActions tripId={trip.id} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Miles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trip.miles.toFixed(1)}</div>
          </CardContent>
        </Card>
        {trip.property && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Property</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">{trip.property.name}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {trip.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{trip.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
