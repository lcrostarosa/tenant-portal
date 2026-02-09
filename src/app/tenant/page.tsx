import { requireTenantAuth } from "@/lib/auth"
import { getTenantDashboardStats } from "@/lib/services/tenant-portal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, Wrench } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function TenantDashboardPage() {
  const { session, tenantId } = await requireTenantAuth()
  const stats = await getTenantDashboardStats(tenantId)

  const cards = [
    {
      label: "Lease Status",
      value: stats.activeLease ? "Active" : "None",
      subtitle: stats.activeLease
        ? `${stats.activeLease.unit.property.name} — Unit ${stats.activeLease.unit.unitNumber}`
        : undefined,
      icon: FileText,
      href: "/tenant/lease",
    },
    {
      label: "Outstanding Balance",
      value: formatCurrency(stats.outstandingBalance),
      icon: DollarSign,
      href: "/tenant/billing",
    },
    {
      label: "Open Maintenance",
      value: stats.openMaintenanceCount,
      icon: Wrench,
      href: "/tenant/maintenance",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          {session.user.name ?? "Tenant"}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.label}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/tenant/maintenance/new">Submit Maintenance Request</Link>
        </Button>
      </div>
    </div>
  )
}
