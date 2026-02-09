"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { uploadDocument, deleteDocument } from "@/lib/services/document"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/lib/actions/property"

export async function uploadLeaseDocumentAction(
  leaseId: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth()

  // Verify lease belongs to the user
  const lease = await prisma.lease.findFirst({
    where: {
      id: leaseId,
      unit: { property: { ownerId: session.user.id } },
    },
  })
  if (!lease) {
    return { success: false, error: "Lease not found" }
  }

  const file = formData.get("file") as File | null
  if (!file || file.size === 0) {
    return { success: false, error: "No file provided" }
  }

  try {
    const document = await uploadDocument(file, "lease", leaseId, "lease-document")
    revalidatePath(`/dashboard/leases/${leaseId}`)
    return { success: true, data: { id: document.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Upload failed" }
  }
}

export async function deleteLeaseDocumentAction(
  documentId: string,
  leaseId: string
): Promise<ActionResult> {
  const session = await requireAuth()

  // Verify lease belongs to the user
  const lease = await prisma.lease.findFirst({
    where: {
      id: leaseId,
      unit: { property: { ownerId: session.user.id } },
    },
  })
  if (!lease) {
    return { success: false, error: "Lease not found" }
  }

  try {
    await deleteDocument(documentId)
    revalidatePath(`/dashboard/leases/${leaseId}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Delete failed" }
  }
}
