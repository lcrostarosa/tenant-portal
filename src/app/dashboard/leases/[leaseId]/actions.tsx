"use client"

import { useRouter } from "next/navigation"
import { deleteLeaseAction } from "@/lib/actions/lease"
import { DeleteDialog } from "@/components/delete-dialog"
import { useToast } from "@/hooks/use-toast"

export function LeaseActions({ leaseId }: { leaseId: string }) {
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete() {
    const result = await deleteLeaseAction(leaseId)
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }
    toast({ title: "Lease deleted" })
    router.push("/dashboard/leases")
    router.refresh()
  }

  return (
    <DeleteDialog
      title="Delete this lease?"
      description="This will permanently delete this lease and its charges. The unit will be marked as vacant."
      onConfirm={handleDelete}
    />
  )
}
