import { prisma } from "@/lib/prisma"
import { Decimal } from "decimal.js"
import type { CreatePaymentInput } from "@/lib/validations/payment"

export async function getPaymentsByTenant(tenantId: string) {
  return prisma.payment.findMany({
    where: { tenantId },
    include: { allocations: { include: { charge: true } } },
    orderBy: { receivedDate: "desc" },
  })
}

/**
 * Record a payment and automatically allocate it to the tenant's oldest outstanding charges.
 * Returns the payment with allocations.
 */
export async function recordPayment(data: CreatePaymentInput, ownerId: string) {
  // Verify tenant has leases under this owner
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: data.tenantId,
      leases: { some: { unit: { property: { ownerId } } } },
    },
  })
  if (!tenant) throw new Error("Tenant not found")

  // Get outstanding charges for this tenant, ordered by oldest first
  const outstandingCharges = await prisma.charge.findMany({
    where: {
      lease: { tenantId: data.tenantId },
      status: { in: ["DUE", "PARTIAL"] },
    },
    orderBy: { dueDate: "asc" },
  })

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      amount: data.amount,
      method: data.method,
      receivedDate: data.receivedDate,
      reference: data.reference,
      notes: data.notes,
      source: data.source ?? "MANUAL",
      tenantId: data.tenantId,
    },
  })

  // Allocate payment to charges (oldest first)
  let remaining = new Decimal(data.amount)

  for (const charge of outstandingCharges) {
    if (remaining.lte(0)) break

    const chargeAmount = new Decimal(charge.amount.toString())
    const chargePaid = new Decimal(charge.paidAmount.toString())
    const chargeOutstanding = chargeAmount.minus(chargePaid)

    if (chargeOutstanding.lte(0)) continue

    const allocationAmount = Decimal.min(remaining, chargeOutstanding)

    await prisma.paymentAllocation.create({
      data: {
        amount: allocationAmount.toNumber(),
        paymentId: payment.id,
        chargeId: charge.id,
      },
    })

    const newPaidAmount = chargePaid.plus(allocationAmount)
    const newStatus = newPaidAmount.gte(chargeAmount) ? "PAID" : "PARTIAL"

    await prisma.charge.update({
      where: { id: charge.id },
      data: {
        paidAmount: newPaidAmount.toNumber(),
        status: newStatus,
      },
    })

    remaining = remaining.minus(allocationAmount)
  }

  return prisma.payment.findUniqueOrThrow({
    where: { id: payment.id },
    include: { allocations: { include: { charge: true } } },
  })
}
