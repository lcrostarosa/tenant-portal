"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

interface MessageComposeProps {
  conversationId: string
  onSend: (formData: FormData) => Promise<{ success: boolean; error?: string }>
}

export function MessageCompose({ conversationId, onSend }: MessageComposeProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [body, setBody] = useState("")
  const [isSending, setIsSending] = useState(false)

  const smsSegments = Math.ceil(body.length / 160)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return

    setIsSending(true)
    const formData = new FormData()
    formData.set("conversationId", conversationId)
    formData.set("body", body.trim())

    const result = await onSend(formData)
    setIsSending(false)

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    setBody("")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1 space-y-1">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your message..."
          rows={2}
          maxLength={1600}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{body.length}/1600</span>
          {body.length > 0 && <span>{smsSegments} SMS segment{smsSegments > 1 ? "s" : ""}</span>}
        </div>
      </div>
      <Button type="submit" disabled={isSending || !body.trim()} size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
