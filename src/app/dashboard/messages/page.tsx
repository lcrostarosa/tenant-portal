import { auth } from "@/lib/auth"
import { getConversations } from "@/lib/services/message"
import { EmptyState } from "@/components/empty-state"
import { MessageSquare } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { StartConversationDialog } from "./new-conversation"

export default async function MessagesPage() {
  const session = await auth()
  const conversations = await getConversations(session!.user.id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
          </p>
        </div>
        <StartConversationDialog />
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations"
          description="Start a conversation with a tenant from their profile or use the button above."
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const lastMessage = conv.messages[0]
            const unreadCount = conv._count.messages

            return (
              <Link key={conv.id} href={`/dashboard/messages/${conv.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {conv.tenant.firstName} {conv.tenant.lastName}
                        </p>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-xs font-medium px-1.5">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {lastMessage.direction === "OUTBOUND" ? "You: " : ""}
                          {lastMessage.body}
                        </p>
                      )}
                    </div>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {format(new Date(lastMessage.createdAt), "MMM d, h:mm a")}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
