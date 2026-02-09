import { prisma } from "@/lib/prisma"
import type {
  CreateMaintenanceRequestInput,
  UpdateMaintenanceStatusInput,
  CreateMaintenanceCommentInput,
} from "@/lib/validations/maintenance"

export async function getMaintenanceRequests(
  ownerId: string,
  filters?: { status?: string; priority?: string; propertyId?: string }
) {
  const where: Record<string, unknown> = {
    unit: { property: { ownerId } },
  }
  if (filters?.status) where.status = filters.status
  if (filters?.priority) where.priority = filters.priority
  if (filters?.propertyId) where.unit = { ...where.unit as object, propertyId: filters.propertyId }

  return prisma.maintenanceRequest.findMany({
    where,
    include: {
      unit: { include: { property: { select: { id: true, name: true } } } },
      tenant: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getMaintenanceRequestById(id: string, ownerId: string) {
  return prisma.maintenanceRequest.findFirst({
    where: { id, unit: { property: { ownerId } } },
    include: {
      unit: { include: { property: { select: { id: true, name: true } } } },
      tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
      comments: { orderBy: { createdAt: "asc" } },
    },
  })
}

export async function createMaintenanceRequest(
  data: CreateMaintenanceRequestInput,
  tenantId: string
) {
  return prisma.maintenanceRequest.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority ?? "MEDIUM",
      category: data.category ?? "OTHER",
      unitId: data.unitId,
      tenantId,
    },
  })
}

export async function updateMaintenanceStatus(
  id: string,
  data: UpdateMaintenanceStatusInput,
  ownerId: string
) {
  const request = await prisma.maintenanceRequest.findFirst({
    where: { id, unit: { property: { ownerId } } },
  })
  if (!request) throw new Error("Maintenance request not found")

  const updateData: Record<string, unknown> = { status: data.status }
  if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate)
  if (data.status === "COMPLETED") updateData.completedDate = new Date()

  return prisma.maintenanceRequest.update({
    where: { id },
    data: updateData,
  })
}

export async function addMaintenanceComment(
  requestId: string,
  data: CreateMaintenanceCommentInput,
  authorId: string,
  authorName: string,
  authorRole: string
) {
  return prisma.maintenanceComment.create({
    data: {
      text: data.text,
      authorId,
      authorName,
      authorRole,
      maintenanceRequestId: requestId,
    },
  })
}

// Tenant-facing functions
export async function getTenantMaintenanceRequests(tenantId: string) {
  return prisma.maintenanceRequest.findMany({
    where: { tenantId },
    include: {
      unit: { include: { property: { select: { name: true } } } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getTenantMaintenanceRequestById(id: string, tenantId: string) {
  return prisma.maintenanceRequest.findFirst({
    where: { id, tenantId },
    include: {
      unit: { include: { property: { select: { name: true } } } },
      comments: { orderBy: { createdAt: "asc" } },
    },
  })
}
