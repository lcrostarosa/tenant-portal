import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Home, FileText, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id

  const [propertyCount, unitCount, activeLeaseCount, outstandingCharges] =
    await Promise.all([
      prisma.property.count({ where: { ownerId: userId } }),
      prisma.unit.count({
        where: { property: { ownerId: userId } },
      }),
      prisma.lease.count({
        where: {
          status: "ACTIVE",
          unit: { property: { ownerId: userId } },
        },
      }),
      prisma.charge.findMany({
        where: {
          status: { in: ["DUE", "PARTIAL"] },
          lease: { unit: { property: { ownerId: userId } } },
        },
        select: { amount: true, paidAmount: true },
      }),
    ])

  const outstandingBalance = outstandingCharges.reduce((sum, charge) => {
    return sum + (Number(charge.amount) - Number(charge.paidAmount))
  }, 0)

  const stats = [
    { label: "Properties", value: propertyCount, icon: Building2 },
    { label: "Units", value: unitCount, icon: Home },
    { label: "Active Leases", value: activeLeaseCount, icon: FileText },
    {
      label: "Outstanding Balance",
      value: formatCurrency(outstandingBalance),
      icon: DollarSign,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name ?? "User"}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
