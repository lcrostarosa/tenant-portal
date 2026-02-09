import { prisma } from "@/lib/prisma"

export async function getTenantLease(tenantId: string) {
  return prisma.lease.findFirst({
    where: { tenantId, status: "ACTIVE" },
    include: {
      unit: {
        include: { property: true },
      },
      charges: {
        where: { status: { in: ["DUE", "PARTIAL"] } },
        orderBy: { dueDate: "asc" },
      },
    },
  })
}

export async function getTenantCharges(tenantId: string) {
  return prisma.charge.findMany({
    where: { lease: { tenantId } },
    include: {
      lease: {
        include: {
          unit: { include: { property: { select: { name: true } } } },
        },
      },
    },
    orderBy: { dueDate: "desc" },
  })
}

export async function getTenantPayments(tenantId: string) {
  return prisma.payment.findMany({
    where: { tenantId },
    include: {
      allocations: {
        include: {
          charge: { select: { description: true } },
        },
      },
    },
    orderBy: { receivedDate: "desc" },
  })
}

export async function getTenantDashboardStats(tenantId: string) {
  const [activeLease, outstandingCharges, openMaintenance] = await Promise.all([
    prisma.lease.findFirst({
      where: { tenantId, status: "ACTIVE" },
      include: { unit: { include: { property: { select: { name: true } } } } },
    }),
    prisma.charge.findMany({
      where: {
        lease: { tenantId },
        status: { in: ["DUE", "PARTIAL"] },
      },
      select: { amount: true, paidAmount: true },
    }),
    prisma.maintenanceRequest.count({
      where: {
        tenantId,
        status: { in: ["OPEN", "IN_PROGRESS", "SCHEDULED"] },
      },
    }),
  ])

  const outstandingBalance = outstandingCharges.reduce((sum, c) => {
    return sum + (Number(c.amount) - Number(c.paidAmount))
  }, 0)

  return {
    activeLease,
    outstandingBalance,
    openMaintenanceCount: openMaintenance,
  }
}
