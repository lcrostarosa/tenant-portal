"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { updateMaintenanceStatusAction } from "@/lib/actions/maintenance"

const STATUSES = ["OPEN", "IN_PROGRESS", "SCHEDULED", "COMPLETED", "CLOSED"] as const

interface MaintenanceStatusControlProps {
  requestId: string
  currentStatus: string
}

export function MaintenanceStatusControl({
  requestId,
  currentStatus,
}: MaintenanceStatusControlProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleUpdate() {
    if (status === currentStatus) return
    setIsUpdating(true)

    const formData = new FormData()
    formData.set("status", status)

    const result = await updateMaintenanceStatusAction(requestId, formData)
    setIsUpdating(false)

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    toast({ title: "Status updated" })
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">Update Status:</span>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        onClick={handleUpdate}
        disabled={isUpdating || status === currentStatus}
      >
        {isUpdating ? "Updating..." : "Update"}
      </Button>
    </div>
  )
}
