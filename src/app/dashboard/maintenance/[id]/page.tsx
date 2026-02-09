import { auth } from "@/lib/auth"
import { getMaintenanceRequestById } from "@/lib/services/maintenance"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { MaintenanceComments } from "@/components/maintenance-comments"
import { MaintenanceStatusControl } from "./status-control"
import { formatDate } from "@/lib/utils"

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params
  const request = await getMaintenanceRequestById(id, session!.user.id)

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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{request.tenant.firstName} {request.tenant.lastName}</p>
            {request.tenant.email && <p className="text-sm text-muted-foreground">{request.tenant.email}</p>}
          </CardContent>
        </Card>
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

      <MaintenanceStatusControl
        requestId={request.id}
        currentStatus={request.status}
      />

      <MaintenanceComments
        comments={request.comments}
        requestId={request.id}
        currentUserRole="LANDLORD"
      />
    </div>
  )
}
