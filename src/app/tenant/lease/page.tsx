import { requireTenantAuth } from "@/lib/auth"
import { getTenantLease } from "@/lib/services/tenant-portal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate, getFullAddress } from "@/lib/utils"
import { StatusBadge } from "@/components/status-badge"

export default async function TenantLeasePage() {
  const { tenantId } = await requireTenantAuth()
  const lease = await getTenantLease(tenantId)

  if (!lease) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">My Lease</h1>
        <p className="text-muted-foreground mt-2">You don't have an active lease.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Lease</h1>
          <p className="text-muted-foreground mt-1">
            {lease.unit.property.name} — Unit {lease.unit.unitNumber}
          </p>
        </div>
        <StatusBadge status={lease.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Rent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(Number(lease.rentAmount))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rent Due Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{lease.rentDueDay}th</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Start Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{formatDate(lease.startDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">End Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{formatDate(lease.endDate)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Property Address</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{getFullAddress(lease.unit.property)}</p>
        </CardContent>
      </Card>

      {lease.securityDeposit && Number(lease.securityDeposit) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Security Deposit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{formatCurrency(Number(lease.securityDeposit))}</p>
          </CardContent>
        </Card>
      )}

      {lease.documentPath && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Lease Document</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={lease.documentPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Download Lease PDF
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
