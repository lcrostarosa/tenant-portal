import { NextRequest, NextResponse } from "next/server"
import { requireApiKey, handleApiError } from "@/lib/api-auth"
import { getUnitById, updateUnit, deleteUnit } from "@/lib/services/unit"
import { updateUnitSchema } from "@/lib/validations/unit"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    const unit = await getUnitById(id, userId)
    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 })
    }
    return NextResponse.json(unit)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    const body = await req.json()
    const parsed = updateUnitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const unit = await updateUnit(id, parsed.data, userId)
    return NextResponse.json(unit)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    await deleteUnit(id, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
