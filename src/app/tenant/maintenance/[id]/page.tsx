import { requireTenantAuth } from "@/lib/auth"
import { getTenantMaintenanceRequestById } from "@/lib/services/maintenance"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { MaintenanceComments } from "@/components/maintenance-comments"
import { formatDate } from "@/lib/utils"

export default async function TenantMaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { session, tenantId } = await requireTenantAuth()
  const { id } = await params
  const request = await getTenantMaintenanceRequestById(id, tenantId)

  if (!request) notFound()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{request.title}</h1>
          <p className="text-muted-foreground mt-1">
            {request.unit.property.name} — Unit {request.unit.unitNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={request.priority} />
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{request.category.replace(/_/g, " ")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatDate(request.createdAt)}</p>
          </CardContent>
        </Card>
        {request.scheduledDate && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{formatDate(request.scheduledDate)}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{request.description}</p>
        </CardContent>
      </Card>

      <MaintenanceComments
        comments={request.comments}
        requestId={request.id}
        currentUserRole="TENANT"
      />
    </div>
  )
}
