import { prisma } from "@/lib/prisma"
import type { CreateTenantInput, UpdateTenantInput } from "@/lib/validations/tenant"

export async function getTenants(ownerId: string) {
  return prisma.tenant.findMany({
    where: {
      leases: { some: { unit: { property: { ownerId } } } },
    },
    include: {
      leases: {
        where: { status: "ACTIVE" },
        include: { unit: { include: { property: true } } },
      },
    },
    orderBy: { lastName: "asc" },
  })
}

export async function getTenantById(id: string, ownerId: string) {
  return prisma.tenant.findFirst({
    where: {
      id,
      leases: { some: { unit: { property: { ownerId } } } },
    },
    include: {
      leases: {
        include: {
          unit: { include: { property: true } },
          charges: { orderBy: { dueDate: "desc" } },
        },
        orderBy: { startDate: "desc" },
      },
      payments: { orderBy: { receivedDate: "desc" } },
    },
  })
}

export async function createTenant(data: CreateTenantInput) {
  return prisma.tenant.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone,
      notes: data.notes,
    },
  })
}

export async function updateTenant(id: string, data: UpdateTenantInput) {
  return prisma.tenant.update({
    where: { id },
    data: {
      ...data,
      email: data.email || null,
    },
  })
}

export async function deleteTenant(id: string) {
  return prisma.tenant.delete({ where: { id } })
}
