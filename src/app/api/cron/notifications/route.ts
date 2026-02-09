import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { addDays } from "date-fns"
import {
  sendEmail,
  preventiveMaintenanceReminderEmail,
  billingDueReminderEmail,
} from "@/lib/notifications"
import { formatCurrency, formatDate } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret")
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results = { preventiveReminders: 0, billingReminders: 0 }

  try {
    // 1. Check preventive maintenance items past due
    const dueItems = await prisma.preventiveMaintenance.findMany({
      where: {
        isActive: true,
        nextDueDate: { lte: new Date() },
      },
      include: {
        owner: { select: { email: true, name: true } },
        property: { select: { name: true } },
      },
    })

    for (const item of dueItems) {
      const { subject, html } = preventiveMaintenanceReminderEmail(
        item.owner.name,
        item.title,
        formatDate(item.nextDueDate)
      )
      const sent = await sendEmail(item.owner.email, subject, html)
      if (sent) results.preventiveReminders++
    }

    // 2. Check charges due within 3 days
    const threeDaysFromNow = addDays(new Date(), 3)
    const upcomingCharges = await prisma.charge.findMany({
      where: {
        status: { in: ["DUE", "PARTIAL"] },
        dueDate: { lte: threeDaysFromNow, gte: new Date() },
      },
      include: {
        lease: {
          include: {
            tenant: { select: { firstName: true, email: true } },
          },
        },
      },
    })

    for (const charge of upcomingCharges) {
      if (!charge.lease.tenant.email) continue
      const outstanding = Number(charge.amount) - Number(charge.paidAmount)
      const { subject, html } = billingDueReminderEmail(
        charge.lease.tenant.firstName,
        formatCurrency(outstanding),
        formatDate(charge.dueDate)
      )
      const sent = await sendEmail(charge.lease.tenant.email, subject, html)
      if (sent) results.billingReminders++
    }

    return NextResponse.json({ success: true, ...results })
  } catch (err) {
    console.error("Cron notification error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
