import { prisma } from "@/lib/prisma"
import type { CreateMileageInput, UpdateMileageInput } from "@/lib/validations/mileage"

export async function getMileageTrips(ownerId: string) {
  return prisma.mileageTrip.findMany({
    where: { ownerId },
    include: {
      property: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  })
}

export async function getMileageTripById(id: string, ownerId: string) {
  return prisma.mileageTrip.findFirst({
    where: { id, ownerId },
    include: {
      property: { select: { id: true, name: true } },
    },
  })
}

export async function createMileageTrip(data: CreateMileageInput, ownerId: string) {
  return prisma.mileageTrip.create({
    data: {
      date: new Date(data.date),
      miles: data.miles,
      purpose: data.purpose,
      propertyId: data.propertyId || null,
      notes: data.notes || null,
      ownerId,
    },
  })
}

export async function updateMileageTrip(id: string, data: UpdateMileageInput, ownerId: string) {
  const updateData: Record<string, unknown> = {}
  if (data.date !== undefined) updateData.date = new Date(data.date)
  if (data.miles !== undefined) updateData.miles = data.miles
  if (data.purpose !== undefined) updateData.purpose = data.purpose
  if (data.propertyId !== undefined) updateData.propertyId = data.propertyId || null
  if (data.notes !== undefined) updateData.notes = data.notes || null

  return prisma.mileageTrip.updateMany({
    where: { id, ownerId },
    data: updateData,
  })
}

export async function deleteMileageTrip(id: string, ownerId: string) {
  return prisma.mileageTrip.deleteMany({
    where: { id, ownerId },
  })
}
