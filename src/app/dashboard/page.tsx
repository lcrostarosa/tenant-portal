import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Home, FileText, DollarSign, Wrench, MessageSquare, Loader2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/status-badge"
import Link from "next/link"
import { Suspense } from "react"

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-7 w-12 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}

function SectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function StatCards({ userId }: { userId: string }) {
  const [propertyCount, unitCount, activeLeaseCount, outstandingAgg, openMaintenanceCount] =
    await Promise.all([
      prisma.property.count({ where: { ownerId: userId } }),
      prisma.unit.count({ where: { property: { ownerId: userId } } }),
      prisma.lease.count({
        where: {
          status: "ACTIVE",
          unit: { property: { ownerId: userId } },
        },
      }),
      prisma.charge.aggregate({
        where: {
          status: { in: ["DUE", "PARTIAL"] },
          lease: { unit: { property: { ownerId: userId } } },
        },
        _sum: { amount: true, paidAmount: true },
      }),
      prisma.maintenanceRequest.count({
        where: {
          status: { in: ["OPEN", "IN_PROGRESS"] },
          unit: { property: { ownerId: userId } },
        },
      }).catch(() => 0),
    ])

  const totalAmount = Number(outstandingAgg._sum?.amount ?? 0)
  const totalPaid = Number(outstandingAgg._sum?.paidAmount ?? 0)
  const outstandingBalance = totalAmount - totalPaid

  const stats = [
    { label: "Properties", value: propertyCount, icon: Building2, href: "/dashboard/properties" },
    { label: "Units", value: unitCount, icon: Home, href: "/dashboard/properties" },
    { label: "Active Leases", value: activeLeaseCount, icon: FileText, href: "/dashboard/leases" },
    { label: "Outstanding Balance", value: formatCurrency(outstandingBalance), icon: DollarSign, href: "/dashboard/billing" },
    { label: "Open Requests", value: openMaintenanceCount, icon: Wrench, href: "/dashboard/maintenance" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Link key={stat.label} href={stat.href}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

async function RecentMaintenance({ userId }: { userId: string }) {
  const recentMaintenance = await prisma.maintenanceRequest.findMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS"] },
      unit: { property: { ownerId: userId } },
    },
    include: {
      unit: { include: { property: { select: { name: true } } } },
      tenant: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  }).catch(() => [])

  if (recentMaintenance.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Maintenance</CardTitle>
        <Link href="/dashboard/maintenance" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentMaintenance.map((req: any) => (
            <Link
              key={req.id}
              href={`/dashboard/maintenance/${req.id}`}
              className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{req.title}</p>
                <p className="text-xs text-muted-foreground">
                  {req.unit.property.name} — Unit {req.unit.unitNumber}
                </p>
              </div>
              <StatusBadge status={req.status} />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function RecentMessages({ userId }: { userId: string }) {
  const [unreadMessageCount, recentMessages] = await Promise.all([
    prisma.message.count({
      where: {
        conversation: { ownerId: userId },
        direction: "INBOUND",
        readAt: null,
      },
    }).catch(() => 0),
    prisma.message.findMany({
      where: {
        conversation: { ownerId: userId },
        direction: "INBOUND",
      },
      include: {
        conversation: {
          include: { tenant: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),
  ])

  if (recentMessages.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Messages from Renters</CardTitle>
          {unreadMessageCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-xs font-medium px-1.5">
              {unreadMessageCount}
            </span>
          )}
        </div>
        <Link href="/dashboard/messages" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentMessages.map((msg: any) => (
            <Link
              key={msg.id}
              href={`/dashboard/messages/${msg.conversationId}`}
              className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {msg.conversation.tenant.firstName} {msg.conversation.tenant.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{msg.body}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {formatDate(msg.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name ?? "User"}
        </p>
      </div>

      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      }>
        <StatCards userId={userId} />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<SectionSkeleton />}>
          <RecentMaintenance userId={userId} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <RecentMessages userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}
