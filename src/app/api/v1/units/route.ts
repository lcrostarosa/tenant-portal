import { NextRequest, NextResponse } from "next/server"
import { requireApiKey, handleApiError } from "@/lib/api-auth"
import { getUnitsByProperty, createUnit } from "@/lib/services/unit"
import { createUnitSchema } from "@/lib/validations/unit"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireApiKey(req)
    const propertyId = req.nextUrl.searchParams.get("propertyId")
    if (!propertyId) {
      return NextResponse.json({ error: "propertyId query parameter is required" }, { status: 400 })
    }
    const units = await getUnitsByProperty(propertyId, userId)
    return NextResponse.json(units)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireApiKey(req)
    const body = await req.json()
    const parsed = createUnitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const unit = await createUnit(parsed.data, userId)
    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
