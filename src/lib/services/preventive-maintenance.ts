import { prisma } from "@/lib/prisma"
import { addDays, addWeeks, addMonths } from "date-fns"
import type {
  CreatePreventiveMaintenanceInput,
  UpdatePreventiveMaintenanceInput,
} from "@/lib/validations/preventive-maintenance"

export async function getPreventiveMaintenanceItems(ownerId: string) {
  return prisma.preventiveMaintenance.findMany({
    where: { ownerId },
    include: {
      property: { select: { id: true, name: true } },
      unit: { select: { id: true, unitNumber: true } },
    },
    orderBy: { nextDueDate: "asc" },
  })
}

export async function getPreventiveMaintenanceById(id: string, ownerId: string) {
  return prisma.preventiveMaintenance.findFirst({
    where: { id, ownerId },
    include: {
      property: { select: { id: true, name: true } },
      unit: { select: { id: true, unitNumber: true } },
    },
  })
}

export async function createPreventiveMaintenance(
  data: CreatePreventiveMaintenanceInput,
  ownerId: string
) {
  return prisma.preventiveMaintenance.create({
    data: {
      title: data.title,
      description: data.description || null,
      frequency: data.frequency,
      customDays: data.customDays ?? null,
      nextDueDate: new Date(data.nextDueDate),
      propertyId: data.propertyId || null,
      unitId: data.unitId || null,
      notifyTenants: data.notifyTenants ?? false,
      ownerId,
    },
  })
}

export async function updatePreventiveMaintenance(
  id: string,
  data: UpdatePreventiveMaintenanceInput,
  ownerId: string
) {
  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description || null
  if (data.frequency !== undefined) updateData.frequency = data.frequency
  if (data.customDays !== undefined) updateData.customDays = data.customDays ?? null
  if (data.nextDueDate !== undefined) updateData.nextDueDate = new Date(data.nextDueDate)
  if (data.propertyId !== undefined) updateData.propertyId = data.propertyId || null
  if (data.unitId !== undefined) updateData.unitId = data.unitId || null
  if (data.notifyTenants !== undefined) updateData.notifyTenants = data.notifyTenants

  return prisma.preventiveMaintenance.updateMany({
    where: { id, ownerId },
    data: updateData,
  })
}

export async function deletePreventiveMaintenance(id: string, ownerId: string) {
  return prisma.preventiveMaintenance.deleteMany({
    where: { id, ownerId },
  })
}

function calculateNextDueDate(
  currentDate: Date,
  frequency: string,
  customDays?: number | null
): Date {
  switch (frequency) {
    case "WEEKLY":
      return addWeeks(currentDate, 1)
    case "BIWEEKLY":
      return addWeeks(currentDate, 2)
    case "MONTHLY":
      return addMonths(currentDate, 1)
    case "QUARTERLY":
      return addMonths(currentDate, 3)
    case "SEMIANNUAL":
      return addMonths(currentDate, 6)
    case "ANNUAL":
      return addMonths(currentDate, 12)
    case "CUSTOM":
      return addDays(currentDate, customDays ?? 30)
    default:
      return addMonths(currentDate, 1)
  }
}

export async function completePreventiveMaintenance(id: string, ownerId: string) {
  const item = await prisma.preventiveMaintenance.findFirst({
    where: { id, ownerId },
  })
  if (!item) throw new Error("Preventive maintenance not found")

  const now = new Date()
  const nextDue = calculateNextDueDate(now, item.frequency, item.customDays)

  return prisma.preventiveMaintenance.update({
    where: { id },
    data: {
      lastCompleted: now,
      nextDueDate: nextDue,
    },
  })
}

export async function getDuePreventiveMaintenance(ownerId: string) {
  return prisma.preventiveMaintenance.findMany({
    where: {
      ownerId,
      isActive: true,
      nextDueDate: { lte: new Date() },
    },
    include: {
      property: { select: { name: true } },
      unit: { select: { unitNumber: true } },
    },
    orderBy: { nextDueDate: "asc" },
  })
}
