import { auth } from "@/lib/auth"
import { getTenantById } from "@/lib/services/tenant"
import { notFound } from "next/navigation"
import { TenantForm } from "@/components/forms/tenant-form"

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const session = await auth()
  const { tenantId } = await params
  const tenant = await getTenantById(tenantId, session!.user.id)

  if (!tenant) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <TenantForm tenant={tenant} />
    </div>
  )
}
