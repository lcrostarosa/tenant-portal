"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadLeaseDocumentAction, deleteLeaseDocumentAction } from "@/lib/actions/document"
import { useToast } from "@/hooks/use-toast"
import { FileText, Upload, Trash2, Loader2, ExternalLink } from "lucide-react"

type Document = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  createdAt: string
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function LeaseDocuments({
  leaseId,
  documents,
}: {
  leaseId: string
  documents: Document[]
}) {
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadLeaseDocumentAction(leaseId, formData)
      if (result.success) {
        toast({ title: "Document uploaded" })
      } else {
        toast({ title: "Upload failed", description: result.error, variant: "destructive" })
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleDelete(documentId: string) {
    setDeletingId(documentId)
    try {
      const result = await deleteLeaseDocumentAction(documentId, leaseId)
      if (result.success) {
        toast({ title: "Document deleted" })
      } else {
        toast({ title: "Delete failed", description: result.error, variant: "destructive" })
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-semibold">Documents</CardTitle>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-1" />
            )}
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No documents attached. Upload a lease PDF or photo.
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.sizeBytes)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={`/api/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
