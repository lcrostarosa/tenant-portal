import { prisma } from "@/lib/prisma"
import type { CreatePropertyInput, UpdatePropertyInput } from "@/lib/validations/property"

export async function getProperties(ownerId: string) {
  return prisma.property.findMany({
    where: { ownerId },
    include: { units: { select: { id: true, unitNumber: true, status: true, marketRent: true } } },
    orderBy: { name: "asc" },
  })
}

export async function getPropertyById(id: string, ownerId: string) {
  return prisma.property.findFirst({
    where: { id, ownerId },
    include: {
      units: {
        include: {
          leases: {
            where: { status: "ACTIVE" },
            include: { tenant: true },
          },
        },
        orderBy: { unitNumber: "asc" },
      },
    },
  })
}

export async function createProperty(data: CreatePropertyInput, ownerId: string) {
  return prisma.property.create({
    data: { ...data, ownerId },
  })
}

export async function updateProperty(id: string, data: UpdatePropertyInput, ownerId: string) {
  return prisma.property.updateMany({
    where: { id, ownerId },
    data,
  })
}

export async function deleteProperty(id: string, ownerId: string) {
  return prisma.property.deleteMany({
    where: { id, ownerId },
  })
}
