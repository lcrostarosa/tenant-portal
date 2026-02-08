import { NextRequest, NextResponse } from "next/server"
import { requireApiKey, handleApiError } from "@/lib/api-auth"
import { getPropertyById, updateProperty, deleteProperty } from "@/lib/services/property"
import { updatePropertySchema } from "@/lib/validations/property"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    const property = await getPropertyById(id, userId)
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }
    return NextResponse.json(property)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    const body = await req.json()
    const parsed = updatePropertySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const result = await updateProperty(id, parsed.data, userId)
    if (result.count === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    const result = await deleteProperty(id, userId)
    if (result.count === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
