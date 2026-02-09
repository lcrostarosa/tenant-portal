import { UnitForm } from "@/components/forms/unit-form"

export default async function NewUnitPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params

  return (
    <div className="p-6 max-w-2xl">
      <UnitForm propertyId={propertyId} />
    </div>
  )
}
