import { prisma } from "@/lib/prisma"
import type { CreateExpenseInput, UpdateExpenseInput } from "@/lib/validations/expense"

export async function getExpenses(ownerId: string) {
  return prisma.expense.findMany({
    where: { ownerId },
    include: {
      property: { select: { id: true, name: true } },
      unit: { select: { id: true, unitNumber: true } },
    },
    orderBy: { date: "desc" },
  })
}

export async function getExpenseById(id: string, ownerId: string) {
  return prisma.expense.findFirst({
    where: { id, ownerId },
    include: {
      property: { select: { id: true, name: true } },
      unit: { select: { id: true, unitNumber: true } },
    },
  })
}

export async function createExpense(data: CreateExpenseInput, ownerId: string) {
  return prisma.expense.create({
    data: {
      date: new Date(data.date),
      amount: data.amount,
      category: data.category,
      description: data.description,
      vendor: data.vendor || null,
      propertyId: data.propertyId || null,
      unitId: data.unitId || null,
      notes: data.notes || null,
      ownerId,
    },
  })
}

export async function updateExpense(id: string, data: UpdateExpenseInput, ownerId: string) {
  const updateData: Record<string, unknown> = {}
  if (data.date !== undefined) updateData.date = new Date(data.date)
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.category !== undefined) updateData.category = data.category
  if (data.description !== undefined) updateData.description = data.description
  if (data.vendor !== undefined) updateData.vendor = data.vendor || null
  if (data.propertyId !== undefined) updateData.propertyId = data.propertyId || null
  if (data.unitId !== undefined) updateData.unitId = data.unitId || null
  if (data.notes !== undefined) updateData.notes = data.notes || null

  return prisma.expense.updateMany({
    where: { id, ownerId },
    data: updateData,
  })
}

export async function deleteExpense(id: string, ownerId: string) {
  return prisma.expense.deleteMany({
    where: { id, ownerId },
  })
}
