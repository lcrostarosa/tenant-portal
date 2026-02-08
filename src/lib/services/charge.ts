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
  // Use UTC to avoid timezone issues when month is parsed from "YYYY-MM" strings
  const year = month.getUTCFullYear()
  const monthIndex = month.getUTCMonth()

  const monthStart = new Date(Date.UTC(year, monthIndex, 1))
  const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 0))
  const nextMonthStart = new Date(Date.UTC(year, monthIndex + 1, 1))

  const activeLeases = await prisma.lease.findMany({
    where: {
      status: "ACTIVE",
      unit: { property: { ownerId } },
      startDate: { lte: monthEnd },
      endDate: { gte: monthStart },
    },
    include: { unit: { include: { property: true } }, tenant: true },
  })

  const charges = []
  for (const lease of activeLeases) {
    const existing = await prisma.charge.findFirst({
      where: {
        leaseId: lease.id,
        type: "RENT",
        dueDate: { gte: monthStart, lt: nextMonthStart },
      },
    })
    if (existing) continue

    const dueDay = Math.min(lease.rentDueDay, 28)
    const charge = await prisma.charge.create({
      data: {
        type: "RENT",
        description: `Rent - ${lease.unit.property.name} Unit ${lease.unit.unitNumber}`,
        amount: lease.rentAmount,
        dueDate: new Date(Date.UTC(year, monthIndex, dueDay)),
        leaseId: lease.id,
      },
    })
    charges.push(charge)
  }

  return charges
}
