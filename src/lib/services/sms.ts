export function isSmsConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  )
}

export async function sendSms(to: string, body: string): Promise<{ sid: string } | null> {
  if (!isSmsConfigured()) return null

  try {
    const twilio = await import("twilio")
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )

    const message = await client.messages.create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER!,
    })

    return { sid: message.sid }
  } catch (err) {
    console.error("SMS send failed:", err)
    return null
  }
}

export function validateTwilioWebhook(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  if (!process.env.TWILIO_WEBHOOK_SECRET) return false

  try {
    const twilio = require("twilio")
    return twilio.validateRequest(
      process.env.TWILIO_WEBHOOK_SECRET,
      signature,
      url,
      params
    )
  } catch {
    return false
  }
}
