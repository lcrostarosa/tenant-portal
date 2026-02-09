"use client"

import { useRouter } from "next/navigation"
import { deleteMileageAction } from "@/lib/actions/mileage"
import { DeleteDialog } from "@/components/delete-dialog"
import { useToast } from "@/hooks/use-toast"

export function MileageActions({ tripId }: { tripId: string }) {
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete() {
    const result = await deleteMileageAction(tripId)
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }
    toast({ title: "Mileage trip deleted" })
    router.push("/dashboard/mileage")
    router.refresh()
  }

  return (
    <DeleteDialog
      title="Delete this mileage trip?"
      description="This will permanently delete this mileage record. This action cannot be undone."
      onConfirm={handleDelete}
    />
  )
}
