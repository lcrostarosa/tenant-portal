"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import {
  sendMessage,
  getOrCreateConversation,
  markMessagesRead,
} from "@/lib/services/message"
import {
  sendMessageSchema,
  startConversationSchema,
} from "@/lib/validations/message"
import type { ActionResult } from "@/lib/actions/property"

export async function sendMessageAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = sendMessageSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    await sendMessage(parsed.data.conversationId, parsed.data.body, session.user.id)
    revalidatePath("/dashboard/messages")
    revalidatePath(`/dashboard/messages/${parsed.data.conversationId}`)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to send message" }
  }
}

export async function startConversationAction(
  formData: FormData
): Promise<ActionResult<{ conversationId: string }>> {
  const session = await requireAuth()
  const raw = Object.fromEntries(formData)
  const parsed = startConversationSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  try {
    const conversation = await getOrCreateConversation(parsed.data.tenantId, session.user.id)
    await sendMessage(conversation.id, parsed.data.body, session.user.id)
    revalidatePath("/dashboard/messages")
    return { success: true, data: { conversationId: conversation.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to start conversation" }
  }
}

export async function markReadAction(conversationId: string): Promise<ActionResult> {
  const session = await requireAuth()

  try {
    await markMessagesRead(conversationId, session.user.id)
    revalidatePath("/dashboard/messages")
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to mark as read" }
  }
}
