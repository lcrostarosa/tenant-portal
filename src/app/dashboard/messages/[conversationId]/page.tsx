import { auth } from "@/lib/auth"
import { getConversationWithMessages, markMessagesRead } from "@/lib/services/message"
import { sendMessageAction } from "@/lib/actions/message"
import { notFound } from "next/navigation"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { MessageCompose } from "@/components/forms/message-compose"
import { StatusBadge } from "@/components/status-badge"

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const session = await auth()
  const { conversationId } = await params
  const conversation = await getConversationWithMessages(conversationId, session!.user.id)

  if (!conversation) notFound()

  // Mark inbound messages as read
  await markMessagesRead(conversationId, session!.user.id)

  return (
    <div className="p-6 flex flex-col h-[calc(100vh-7rem)]">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-xl font-bold">
          {conversation.tenant.firstName} {conversation.tenant.lastName}
        </h1>
        {conversation.tenant.phone && (
          <p className="text-sm text-muted-foreground">{conversation.tenant.phone}</p>
        )}
      </div>

      <div className="flex-1 overflow-auto space-y-3 mb-4">
        {conversation.messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
        )}
        {conversation.messages.map((msg) => {
          const isOutbound = msg.direction === "OUTBOUND"
          return (
            <div
              key={msg.id}
              className={cn("flex", isOutbound ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-lg p-3",
                  isOutbound ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <div className={cn(
                  "flex items-center gap-2 mt-1",
                  isOutbound ? "justify-end" : "justify-start"
                )}>
                  <span className={cn(
                    "text-xs",
                    isOutbound ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                  </span>
                  {isOutbound && msg.status !== "IN_APP_ONLY" && (
                    <StatusBadge status={msg.status} className="text-[10px] h-4" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <MessageCompose conversationId={conversationId} onSend={sendMessageAction} />
    </div>
  )
}
