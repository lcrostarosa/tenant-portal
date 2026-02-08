"use client"

import { useRouter } from "next/navigation"
import { deletePropertyAction } from "@/lib/actions/property"
import { DeleteDialog } from "@/components/delete-dialog"
import { useToast } from "@/hooks/use-toast"

export function PropertyActions({ propertyId }: { propertyId: string }) {
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete() {
    const result = await deletePropertyAction(propertyId)
    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }
    toast({ title: "Property deleted" })
    router.push("/properties")
    router.refresh()
  }

  return (
    <DeleteDialog
      title="Delete this property?"
      description="This will permanently delete this property and all its units. This action cannot be undone."
      onConfirm={handleDelete}
    />
  )
}
