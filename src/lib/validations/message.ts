import { z } from "zod"

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, "Conversation is required"),
  body: z.string().min(1, "Message is required").max(1600, "Message too long"),
})

export const startConversationSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  body: z.string().min(1, "Message is required").max(1600, "Message too long"),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type StartConversationInput = z.infer<typeof startConversationSchema>
