"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { startConversationAction } from "@/lib/actions/message"
import { Plus } from "lucide-react"

export function StartConversationDialog() {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [tenantId, setTenantId] = useState("")
  const [body, setBody] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (open) {
      fetch("/api/v1/tenants-list")
        .then((r) => r.json())
        .then((data) => setTenants(data))
        .catch(() => {})
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tenantId || !body.trim()) return

    setIsSending(true)
    const formData = new FormData()
    formData.set("tenantId", tenantId)
    formData.set("body", body.trim())

    const result = await startConversationAction(formData)
    setIsSending(false)

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    setOpen(false)
    setBody("")
    setTenantId("")

    if (result.data?.conversationId) {
      router.push(`/dashboard/messages/${result.data.conversationId}`)
    }
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tenant</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger>
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              maxLength={1600}
            />
          </div>
          <Button type="submit" disabled={isSending || !tenantId || !body.trim()} className="w-full">
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
