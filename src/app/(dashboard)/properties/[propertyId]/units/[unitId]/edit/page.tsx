import { auth } from "@/lib/auth"
import { getUnitById } from "@/lib/services/unit"
import { notFound } from "next/navigation"
import { UnitForm } from "@/components/forms/unit-form"

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ propertyId: string; unitId: string }>
}) {
  const session = await auth()
  const { propertyId, unitId } = await params
  const unit = await getUnitById(unitId, session!.user.id)

  if (!unit) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <UnitForm
        propertyId={propertyId}
        unit={{
          id: unit.id,
          unitNumber: unit.unitNumber,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          sqft: unit.sqft,
          marketRent: Number(unit.marketRent),
          status: unit.status,
          notes: unit.notes,
        }}
      />
    </div>
  )
}
