import { NextRequest, NextResponse } from "next/server"
import { requireApiKey, handleApiError } from "@/lib/api-auth"
import { getProperties, createProperty } from "@/lib/services/property"
import { createPropertySchema } from "@/lib/validations/property"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireApiKey(req)
    const properties = await getProperties(userId)
    return NextResponse.json(properties)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireApiKey(req)
    const body = await req.json()
    const parsed = createPropertySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const property = await createProperty(parsed.data, userId)
    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
