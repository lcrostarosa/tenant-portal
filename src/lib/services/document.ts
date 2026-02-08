import { prisma } from "@/lib/prisma"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads")

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function uploadDocument(
  file: File,
  entityType: string,
  entityId: string,
  category?: string
) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Allowed: PDF, JPEG, PNG, WebP`)
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of 10MB`)
  }

  // Create upload directory if it doesn't exist
  const entityDir = path.join(UPLOAD_DIR, entityType, entityId)
  await mkdir(entityDir, { recursive: true })

  // Generate unique filename
  const ext = path.extname(file.name) || ".pdf"
  const uniqueName = `${randomUUID()}${ext}`
  const storagePath = path.join(entityType, entityId, uniqueName)
  const fullPath = path.join(UPLOAD_DIR, storagePath)

  // Write file to disk
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(fullPath, buffer)

  // Create database record
  const document = await prisma.document.create({
    data: {
      filename: file.name,
      storagePath,
      mimeType: file.type,
      sizeBytes: file.size,
      category,
      entityType,
      entityId,
    },
  })

  return document
}

export async function getDocumentsByEntity(entityType: string, entityId: string) {
  return prisma.document.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
  })
}

export async function getDocumentById(id: string) {
  return prisma.document.findUnique({ where: { id } })
}

export async function deleteDocument(id: string) {
  const document = await prisma.document.findUnique({ where: { id } })
  if (!document) throw new Error("Document not found")

  // Delete file from disk
  const fullPath = path.join(UPLOAD_DIR, document.storagePath)
  try {
    await unlink(fullPath)
  } catch {
    // File may already be deleted, continue with DB cleanup
  }

  return prisma.document.delete({ where: { id } })
}

export function getDocumentFilePath(storagePath: string) {
  return path.join(UPLOAD_DIR, storagePath)
}
