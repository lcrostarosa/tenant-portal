import { requireTenantAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MaintenanceRequestForm } from "@/components/forms/maintenance-request-form"
import { createTenantMaintenanceRequestAction } from "@/lib/actions/maintenance"

export default async function TenantNewMaintenancePage() {
  const { tenantId } = await requireTenantAuth()

  // Get units from active leases for this tenant
  const leases = await prisma.lease.findMany({
    where: { tenantId, status: "ACTIVE" },
    include: {
      unit: {
        include: { property: { select: { name: true } } },
      },
    },
  })

  const units = leases.map((l) => ({
    id: l.unit.id,
    label: `${l.unit.property.name} — Unit ${l.unit.unitNumber}`,
  }))

  async function handleSubmit(formData: FormData) {
    "use server"
    return createTenantMaintenanceRequestAction(formData, tenantId)
  }

  return (
    <div className="p-6 max-w-2xl">
      <MaintenanceRequestForm
        units={units}
        onSubmit={handleSubmit}
        redirectBase="/tenant/maintenance"
      />
    </div>
  )
}
