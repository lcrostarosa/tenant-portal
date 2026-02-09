"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/delete-dialog"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle } from "lucide-react"

interface PreventiveMaintenanceActionsProps {
  id: string
  completeAction: (id: string) => Promise<{ success: boolean; error?: string }>
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function PreventiveMaintenanceActions({
  id,
  completeAction,
  deleteAction,
}: PreventiveMaintenanceActionsProps) {
  const router = useRouter()
  const { toast } = useToast()

  async function handleComplete() {
    const result = await completeAction(id)
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }
    toast({ title: "Marked as completed — next due date updated" })
    router.refresh()
  }

  async function handleDelete() {
    const result = await deleteAction(id)
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }
    toast({ title: "Schedule deleted" })
    router.push("/dashboard/maintenance/preventive")
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleComplete}>
        <CheckCircle className="h-4 w-4 mr-1" />
        Mark Complete
      </Button>
      <DeleteDialog
        title="Delete this schedule?"
        description="This will permanently delete this preventive maintenance schedule."
        onConfirm={handleDelete}
      />
    </div>
  )
}
