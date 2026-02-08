import { auth } from "@/lib/auth"
import { getPropertyById } from "@/lib/services/property"
import { notFound } from "next/navigation"
import { PropertyForm } from "@/components/forms/property-form"

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const session = await auth()
  const { propertyId } = await params
  const property = await getPropertyById(propertyId, session!.user.id)

  if (!property) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <PropertyForm property={property} />
    </div>
  )
}
