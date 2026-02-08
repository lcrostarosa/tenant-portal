import { NextRequest, NextResponse } from "next/server"
import { requireApiKey, handleApiError } from "@/lib/api-auth"
import { getChargesByLease, createCharge, generateRentCharges } from "@/lib/services/charge"
import { createChargeSchema } from "@/lib/validations/charge"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireApiKey(req)
    const leaseId = req.nextUrl.searchParams.get("leaseId")
    if (!leaseId) {
      return NextResponse.json({ error: "leaseId query parameter is required" }, { status: 400 })
    }
    const charges = await getChargesByLease(leaseId, userId)
    return NextResponse.json(charges)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireApiKey(req)
    const body = await req.json()

    // Support generating rent charges via special action
    if (body.action === "generateRent") {
      if (!body.month) {
        return NextResponse.json({ error: "month is required for generateRent action" }, { status: 400 })
      }
      const charges = await generateRentCharges(userId, new Date(body.month))
      return NextResponse.json({ generated: charges.length, charges }, { status: 201 })
    }

    const parsed = createChargeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const charge = await createCharge(parsed.data, userId)
    return NextResponse.json(charge, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
