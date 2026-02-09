import { auth } from "@/lib/auth"
import { getProperties } from "@/lib/services/property"
import { MileageForm } from "@/components/forms/mileage-form"

export default async function NewMileagePage() {
  const session = await auth()
  const properties = await getProperties(session!.user.id)

  return (
    <div className="p-6 max-w-2xl">
      <MileageForm
        properties={properties.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  )
}
