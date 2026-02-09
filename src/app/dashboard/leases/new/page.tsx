import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { LeaseForm } from "@/components/forms/lease-form"

export default async function NewLeasePage() {
  const session = await auth()
  const userId = session!.user.id

  const [tenants, units] = await Promise.all([
    prisma.tenant.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
    prisma.unit.findMany({
      where: {
        property: { ownerId: userId },
        status: { not: "OCCUPIED" },
      },
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
      <LeaseForm tenants={tenants} units={formattedUnits} />
    </div>
  )
}
