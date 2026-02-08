import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDocumentById, getDocumentFilePath } from "@/lib/services/document"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const document = await getDocumentById(id)
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  // Verify the user owns the entity this document belongs to
  if (document.entityType === "lease") {
    const lease = await prisma.lease.findFirst({
      where: {
        id: document.entityId,
        unit: { property: { ownerId: session.user.id } },
      },
    })
    if (!lease) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  try {
    const filePath = getDocumentFilePath(document.storagePath)
    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `inline; filename="${document.filename}"`,
        "Content-Length": String(document.sizeBytes),
      },
    })
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 })
  }
}
