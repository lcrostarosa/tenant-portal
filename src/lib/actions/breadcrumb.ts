"use server"

import { prisma } from "@/lib/prisma"

export async function resolveBreadcrumbNames(
  pathname: string
): Promise<Record<string, string>> {
  const segments = pathname.split("/").filter(Boolean)
  const resolved: Record<string, string> = {}

  // Collect all ID resolution tasks to run in parallel
  const tasks: Array<{ segment: string; promise: Promise<string | null> }> = []

  const staticSegments = new Set([
    "dashboard", "tenant", "properties", "tenants", "leases", "billing",
    "units", "new", "edit", "charges", "payments", "generate",
    "expenses", "mileage", "maintenance", "preventive", "messages",
  ])

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const prevSegment = segments[i - 1]

    if (staticSegments.has(segment)) continue

    let promise: Promise<string | null> | null = null

    if (prevSegment === "properties") {
      promise = prisma.property.findUnique({
        where: { id: segment },
        select: { name: true },
      }).then((p) => p?.name ?? null)
    } else if (prevSegment === "tenants") {
      promise = prisma.tenant.findUnique({
        where: { id: segment },
        select: { firstName: true, lastName: true },
      }).then((t) => t ? `${t.firstName} ${t.lastName}` : null)
    } else if (prevSegment === "leases") {
      promise = prisma.lease.findUnique({
        where: { id: segment },
        include: { unit: { include: { property: { select: { name: true } } } } },
      }).then((l) => l ? `${l.unit.property.name} — ${l.unit.unitNumber}` : null)
    } else if (prevSegment === "units") {
      promise = prisma.unit.findUnique({
        where: { id: segment },
        select: { unitNumber: true },
      }).then((u) => u ? `Unit ${u.unitNumber}` : null)
    } else if (prevSegment === "expenses") {
      promise = prisma.expense.findUnique({
        where: { id: segment },
        select: { description: true },
      }).then((e) => e?.description ?? null)
    } else if (prevSegment === "mileage") {
      promise = prisma.mileageTrip.findUnique({
        where: { id: segment },
        select: { purpose: true },
      }).then((t) => t?.purpose ?? null)
    }

    if (promise) {
      tasks.push({ segment, promise })
    }
  }

  // Resolve all DB lookups in parallel
  const results = await Promise.all(
    tasks.map(async ({ segment, promise }) => {
      try {
        const name = await promise
        return { segment, name }
      } catch {
        return { segment, name: null }
      }
    })
  )

  for (const { segment, name } of results) {
    if (name) resolved[segment] = name
  }

  return resolved
}
