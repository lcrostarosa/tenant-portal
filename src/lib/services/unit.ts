import { prisma } from "@/lib/prisma"
import type { CreateUnitInput, UpdateUnitInput } from "@/lib/validations/unit"

export async function getUnitsByProperty(propertyId: string, ownerId: string) {
  return prisma.unit.findMany({
    where: { propertyId, property: { ownerId } },
    include: {
      leases: {
        where: { status: "ACTIVE" },
        include: { tenant: true },
      },
    },
    orderBy: { unitNumber: "asc" },
  })
}

export async function getUnitById(id: string, ownerId: string) {
  return prisma.unit.findFirst({
    where: { id, property: { ownerId } },
    include: {
      property: true,
      leases: {
        include: { tenant: true, charges: true },
        orderBy: { startDate: "desc" },
      },
    },
  })
}

export async function createUnit(data: CreateUnitInput, ownerId: string) {
  // Verify the property belongs to the owner
  const property = await prisma.property.findFirst({
    where: { id: data.propertyId, ownerId },
  })
  if (!property) throw new Error("Property not found")

  return prisma.unit.create({
    data: {
      unitNumber: data.unitNumber,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      sqft: data.sqft,
      marketRent: data.marketRent,
      status: data.status,
      notes: data.notes,
      propertyId: data.propertyId,
    },
  })
}

export async function updateUnit(id: string, data: UpdateUnitInput, ownerId: string) {
  const unit = await prisma.unit.findFirst({
    where: { id, property: { ownerId } },
  })
  if (!unit) throw new Error("Unit not found")

  return prisma.unit.update({
    where: { id },
    data,
  })
}

export async function deleteUnit(id: string, ownerId: string) {
  const unit = await prisma.unit.findFirst({
    where: { id, property: { ownerId } },
  })
  if (!unit) throw new Error("Unit not found")

  return prisma.unit.delete({ where: { id } })
}
