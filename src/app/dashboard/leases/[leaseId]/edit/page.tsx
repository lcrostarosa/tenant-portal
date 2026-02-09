import { auth } from "@/lib/auth"
import { getLeaseById } from "@/lib/services/lease"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { LeaseForm } from "@/components/forms/lease-form"

export default async function EditLeasePage({
  params,
}: {
  params: Promise<{ leaseId: string }>
}) {
  const session = await auth()
  const { leaseId } = await params
  const lease = await getLeaseById(leaseId, session!.user.id)

  if (!lease) notFound()

  // For edit, we still need tenant/unit lists (though they're read-only for existing lease)
  const [tenants, units] = await Promise.all([
    prisma.tenant.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
    prisma.unit.findMany({
      where: { property: { ownerId: session!.user.id } },
      select: {
        id: true,
        unitNumber: true,
        property: { select: { id: true, name: true } },
      },
      orderBy: { unitNumber: "asc" },
    }),
  ])

  const formattedUnits = units.map((u) => ({
    id: u.id,
    unitNumber: u.unitNumber,
    propertyName: u.property.name,
    propertyId: u.property.id,
  }))

  return (
    <div className="p-6 max-w-2xl">
      <LeaseForm
        tenants={tenants}
        units={formattedUnits}
        lease={{
          id: lease.id,
          startDate: lease.startDate,
          endDate: lease.endDate,
          rentAmount: Number(lease.rentAmount),
          securityDeposit: Number(lease.securityDeposit),
          rentDueDay: lease.rentDueDay,
          status: lease.status,
          documentPath: lease.documentPath,
          notes: lease.notes,
          tenantId: lease.tenantId,
          unitId: lease.unitId,
        }}
      />
    </div>
  )
}
