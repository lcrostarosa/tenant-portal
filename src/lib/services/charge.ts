import { prisma } from "@/lib/prisma"
import type { CreateChargeInput, UpdateChargeInput } from "@/lib/validations/charge"

export async function getChargesByLease(leaseId: string, ownerId: string) {
  return prisma.charge.findMany({
    where: { leaseId, lease: { unit: { property: { ownerId } } } },
    include: { allocations: { include: { payment: true } } },
    orderBy: { dueDate: "desc" },
  })
}

export async function createCharge(data: CreateChargeInput, ownerId: string) {
  // Verify the lease belongs to the owner
  const lease = await prisma.lease.findFirst({
    where: { id: data.leaseId, unit: { property: { ownerId } } },
  })
  if (!lease) throw new Error("Lease not found")

  return prisma.charge.create({
    data: {
      type: data.type,
      description: data.description,
      amount: data.amount,
      dueDate: data.dueDate,
      leaseId: data.leaseId,
    },
  })
}

export async function updateCharge(id: string, data: UpdateChargeInput, ownerId: string) {
  const charge = await prisma.charge.findFirst({
    where: { id, lease: { unit: { property: { ownerId } } } },
  })
  if (!charge) throw new Error("Charge not found")

  return prisma.charge.update({
    where: { id },
    data,
  })
}

export async function voidCharge(id: string, ownerId: string) {
  const charge = await prisma.charge.findFirst({
    where: { id, lease: { unit: { property: { ownerId } } } },
  })
  if (!charge) throw new Error("Charge not found")

  return prisma.charge.update({
    where: { id },
    data: { status: "VOID" },
  })
}

/** Generate monthly rent charges for all active leases belonging to the owner */
export async function generateRentCharges(ownerId: string, month: Date) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()

  const activeLeases = await prisma.lease.findMany({
    where: {
      status: "ACTIVE",
      unit: { property: { ownerId } },
      startDate: { lte: new Date(year, monthIndex + 1, 0) }, // before end of month
      endDate: { gte: new Date(year, monthIndex, 1) }, // after start of month
    },
    include: { unit: { include: { property: true } }, tenant: true },
  })

  const charges = []
  for (const lease of activeLeases) {
    // Check if rent charge already exists for this month
    const existing = await prisma.charge.findFirst({
      where: {
        leaseId: lease.id,
        type: "RENT",
        dueDate: {
          gte: new Date(year, monthIndex, 1),
          lt: new Date(year, monthIndex + 1, 1),
        },
      },
    })
    if (existing) continue

    const dueDay = Math.min(lease.rentDueDay, 28)
    const charge = await prisma.charge.create({
      data: {
        type: "RENT",
        description: `Rent - ${lease.unit.property.name} Unit ${lease.unit.unitNumber}`,
        amount: lease.rentAmount,
        dueDate: new Date(year, monthIndex, dueDay),
        leaseId: lease.id,
      },
    })
    charges.push(charge)
  }

  return charges
}
