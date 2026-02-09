import { prisma } from "@/lib/prisma"
import { sendSms, isSmsConfigured } from "@/lib/services/sms"
import { normalizePhone } from "@/lib/utils"

export async function getOrCreateConversation(tenantId: string, ownerId: string) {
  const existing = await prisma.conversation.findUnique({
    where: { tenantId_ownerId: { tenantId, ownerId } },
  })
  if (existing) return existing

  return prisma.conversation.create({
    data: { tenantId, ownerId },
  })
}

export async function getConversations(ownerId: string) {
  return prisma.conversation.findMany({
    where: { ownerId },
    include: {
      tenant: { select: { firstName: true, lastName: true, phone: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          messages: { where: { direction: "INBOUND", readAt: null } },
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  })
}

export async function getConversationWithMessages(
  conversationId: string,
  ownerId: string
) {
  return prisma.conversation.findFirst({
    where: { id: conversationId, ownerId },
    include: {
      tenant: { select: { firstName: true, lastName: true, phone: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  })
}

export async function sendMessage(
  conversationId: string,
  body: string,
  ownerId: string
) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, ownerId },
    include: { tenant: { select: { phone: true } } },
  })
  if (!conversation) throw new Error("Conversation not found")

  let channel: "SMS" | "IN_APP" = "IN_APP"
  let status: "PENDING" | "SENT" | "FAILED" | "IN_APP_ONLY" = "IN_APP_ONLY"
  let twilioSid: string | null = null
  let errorMessage: string | null = null

  if (isSmsConfigured() && conversation.tenant.phone) {
    channel = "SMS"
    status = "PENDING"
    const normalizedPhone = normalizePhone(conversation.tenant.phone)
    const result = await sendSms(normalizedPhone, body)
    if (result) {
      status = "SENT"
      twilioSid = result.sid
    } else {
      status = "FAILED"
      errorMessage = "SMS send failed"
    }
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      direction: "OUTBOUND",
      channel,
      status,
      body,
      twilioSid,
      errorMessage,
    },
  })

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  })

  return message
}

export async function receiveInboundMessage(
  fromPhone: string,
  body: string,
  sid?: string
) {
  const normalized = normalizePhone(fromPhone)
  // Try to match tenant by phone
  const tenant = await prisma.tenant.findFirst({
    where: { phone: { not: null } },
  })

  // Try various phone formats
  const tenants = await prisma.tenant.findMany({
    where: { phone: { not: null } },
    select: { id: true, phone: true },
  })

  const matchedTenant = tenants.find((t) => {
    if (!t.phone) return false
    return normalizePhone(t.phone) === normalized
  })

  if (!matchedTenant) {
    console.warn("Inbound SMS from unknown number:", fromPhone)
    return null
  }

  // Find existing conversation or create
  const conversations = await prisma.conversation.findMany({
    where: { tenantId: matchedTenant.id },
  })

  if (conversations.length === 0) {
    console.warn("No conversation found for tenant:", matchedTenant.id)
    return null
  }

  const conversation = conversations[0]

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "INBOUND",
      channel: "SMS",
      status: "DELIVERED",
      body,
      twilioSid: sid ?? null,
    },
  })

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  })

  return message
}

export async function markMessagesRead(conversationId: string, ownerId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, ownerId },
  })
  if (!conversation) return

  await prisma.message.updateMany({
    where: {
      conversationId,
      direction: "INBOUND",
      readAt: null,
    },
    data: { readAt: new Date() },
  })
}

export async function getUnreadCount(ownerId: string) {
  return prisma.message.count({
    where: {
      conversation: { ownerId },
      direction: "INBOUND",
      readAt: null,
    },
  })
}
