"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { addMaintenanceCommentAction } from "@/lib/actions/maintenance"

interface Comment {
  id: string
  text: string
  authorName: string
  authorRole: string
  createdAt: Date | string
}

interface MaintenanceCommentsProps {
  comments: Comment[]
  requestId: string
  currentUserRole: string
}

export function MaintenanceComments({
  comments,
  requestId,
  currentUserRole,
}: MaintenanceCommentsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.set("text", text.trim())

    const result = await addMaintenanceCommentAction(requestId, formData)
    setIsSubmitting(false)

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    setText("")
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>

      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}

      <div className="space-y-3">
        {comments.map((comment) => {
          const isLandlord = comment.authorRole === "LANDLORD"
          return (
            <div
              key={comment.id}
              className={cn(
                "flex",
                isLandlord ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  isLandlord
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{comment.authorName}</span>
                  <span className={cn("text-xs", isLandlord ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting || !text.trim()}>
          {isSubmitting ? "..." : "Send"}
        </Button>
      </form>
    </div>
  )
}
