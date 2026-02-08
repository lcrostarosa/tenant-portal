import { NextRequest, NextResponse } from "next/server"
import { requireApiKey, handleApiError } from "@/lib/api-auth"
import { getPaymentsByTenant, recordPayment } from "@/lib/services/payment"
import { createPaymentSchema } from "@/lib/validations/payment"

export async function GET(req: NextRequest) {
  try {
    await requireApiKey(req)
    const tenantId = req.nextUrl.searchParams.get("tenantId")
    if (!tenantId) {
      return NextResponse.json({ error: "tenantId query parameter is required" }, { status: 400 })
    }
    const payments = await getPaymentsByTenant(tenantId)
    return NextResponse.json(payments)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireApiKey(req)
    const body = await req.json()
    const parsed = createPaymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const payment = await recordPayment(parsed.data, userId)
    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
