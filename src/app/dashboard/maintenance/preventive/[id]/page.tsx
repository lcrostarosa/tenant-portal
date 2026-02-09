import { auth } from "@/lib/auth"
import { getPreventiveMaintenanceById } from "@/lib/services/preventive-maintenance"
import { completePreventiveMaintenanceAction, deletePreventiveMaintenanceAction } from "@/lib/actions/preventive-maintenance"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { PreventiveMaintenanceActions } from "./actions"

export default async function PreventiveMaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params
  const item = await getPreventiveMaintenanceById(id, session!.user.id)

  if (!item) notFound()

  const isDue = new Date(item.nextDueDate) <= new Date()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
          <p className="text-muted-foreground mt-1">
            {item.frequency.replace(/_/g, " ")} schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={item.isActive ? "default" : "secondary"}>
            {item.isActive ? "Active" : "Inactive"}
          </Badge>
          <PreventiveMaintenanceActions
            id={item.id}
            completeAction={completePreventiveMaintenanceAction}
            deleteAction={deletePreventiveMaintenanceAction}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Due</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={isDue ? "text-lg font-bold text-destructive" : "text-lg font-medium"}>
              {formatDate(item.nextDueDate)}
            </p>
          </CardContent>
        </Card>
        {item.lastCompleted && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{formatDate(item.lastCompleted)}</p>
            </CardContent>
          </Card>
        )}
        {item.property && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Property / Unit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {item.property.name}
                {item.unit ? ` — Unit ${item.unit.unitNumber}` : ""}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {item.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{item.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
