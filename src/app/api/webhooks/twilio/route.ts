import { NextRequest, NextResponse } from "next/server"
import { receiveInboundMessage } from "@/lib/services/message"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const from = formData.get("From") as string
    const body = formData.get("Body") as string
    const sid = formData.get("MessageSid") as string | null

    if (!from || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await receiveInboundMessage(from, body, sid ?? undefined)

    // Return empty TwiML
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { "Content-Type": "text/xml" },
      }
    )
  } catch (err) {
    console.error("Twilio webhook error:", err)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { "Content-Type": "text/xml" },
      }
    )
  }
}
