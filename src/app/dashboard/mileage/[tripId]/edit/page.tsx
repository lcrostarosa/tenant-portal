import { auth } from "@/lib/auth"
import { getMileageTripById } from "@/lib/services/mileage"
import { getProperties } from "@/lib/services/property"
import { notFound } from "next/navigation"
import { MileageForm } from "@/components/forms/mileage-form"

export default async function EditMileagePage({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const session = await auth()
  const { tripId } = await params
  const [trip, properties] = await Promise.all([
    getMileageTripById(tripId, session!.user.id),
    getProperties(session!.user.id),
  ])

  if (!trip) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <MileageForm
        trip={{
          id: trip.id,
          date: trip.date,
          miles: trip.miles,
          purpose: trip.purpose,
          propertyId: trip.propertyId,
          notes: trip.notes,
        }}
        properties={properties.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  )
}
