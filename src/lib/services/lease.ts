import { prisma } from "@/lib/prisma"
import type { CreateLeaseInput, UpdateLeaseInput } from "@/lib/validations/lease"

export async function getLeases(ownerId: string) {
  return prisma.lease.findMany({
    where: { unit: { property: { ownerId } } },
    include: {
      tenant: true,
      unit: { include: { property: true } },
    },
    orderBy: { startDate: "desc" },
  })
}

export async function getLeaseById(id: string, ownerId: string) {
  return prisma.lease.findFirst({
    where: { id, unit: { property: { ownerId } } },
    include: {
      tenant: true,
      unit: { include: { property: true } },
      charges: {
        include: { allocations: true },
        orderBy: { dueDate: "desc" },
      },
    },
  })
}

export async function createLease(data: CreateLeaseInput, ownerId: string) {
  // Verify the unit belongs to the owner
  const unit = await prisma.unit.findFirst({
    where: { id: data.unitId, property: { ownerId } },
  })
  if (!unit) throw new Error("Unit not found")

  // Check no active lease on this unit
  const existingLease = await prisma.lease.findFirst({
    where: { unitId: data.unitId, status: "ACTIVE" },
  })
  if (existingLease) throw new Error("Unit already has an active lease")

  const lease = await prisma.lease.create({
    data: {
      startDate: data.startDate,
      endDate: data.endDate,
      rentAmount: data.rentAmount,
      securityDeposit: data.securityDeposit ?? 0,
      rentDueDay: data.rentDueDay ?? 1,
      status: data.status ?? "DRAFT",
      documentPath: data.documentPath,
      notes: data.notes,
      tenantId: data.tenantId,
      unitId: data.unitId,
    },
    include: { tenant: true, unit: true },
  })

  // If lease is active, mark unit as occupied
  if (lease.status === "ACTIVE") {
    await prisma.unit.update({
      where: { id: data.unitId },
      data: { status: "OCCUPIED" },
    })
  }

  return lease
}

export async function updateLease(id: string, data: UpdateLeaseInput, ownerId: string) {
  const lease = await prisma.lease.findFirst({
    where: { id, unit: { property: { ownerId } } },
  })
  if (!lease) throw new Error("Lease not found")

  const updated = await prisma.lease.update({
    where: { id },
    data,
    include: { tenant: true, unit: true },
  })

  // Handle unit status changes based on lease status
  if (data.status === "ACTIVE" && lease.status !== "ACTIVE") {
    await prisma.unit.update({
      where: { id: lease.unitId },
      data: { status: "OCCUPIED" },
    })
  } else if (data.status && data.status !== "ACTIVE" && lease.status === "ACTIVE") {
    // Check if another active lease exists on this unit
    const otherActive = await prisma.lease.findFirst({
      where: { unitId: lease.unitId, status: "ACTIVE", id: { not: id } },
    })
    if (!otherActive) {
      await prisma.unit.update({
        where: { id: lease.unitId },
        data: { status: "VACANT" },
      })
    }
  }

  return updated
}

export async function deleteLease(id: string, ownerId: string) {
  const lease = await prisma.lease.findFirst({
    where: { id, unit: { property: { ownerId } } },
  })
  if (!lease) throw new Error("Lease not found")

  await prisma.lease.delete({ where: { id } })

  // If was active, mark unit as vacant (unless another active lease)
  if (lease.status === "ACTIVE") {
    const otherActive = await prisma.lease.findFirst({
      where: { unitId: lease.unitId, status: "ACTIVE" },
    })
    if (!otherActive) {
      await prisma.unit.update({
        where: { id: lease.unitId },
        data: { status: "VACANT" },
      })
    }
  }
}
