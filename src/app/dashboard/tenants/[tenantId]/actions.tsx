"use client"

import { useRouter } from "next/navigation"
import { deleteTenantAction } from "@/lib/actions/tenant"
import { DeleteDialog } from "@/components/delete-dialog"
import { useToast } from "@/hooks/use-toast"

export function TenantActions({ tenantId }: { tenantId: string }) {
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete() {
    const result = await deleteTenantAction(tenantId)
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }
    toast({ title: "Tenant deleted" })
    router.push("/dashboard/tenants")
    router.refresh()
  }

  return (
    <DeleteDialog
      title="Delete this tenant?"
      description="This will permanently delete this tenant and all associated data. This action cannot be undone."
      onConfirm={handleDelete}
    />
  )
}
