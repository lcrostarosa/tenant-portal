import { NextRequest, NextResponse } from "next/server"
import { requireApiKey, handleApiError } from "@/lib/api-auth"
import { updateCharge, voidCharge } from "@/lib/services/charge"
import { updateChargeSchema } from "@/lib/validations/charge"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    const body = await req.json()
    const parsed = updateChargeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const charge = await updateCharge(id, parsed.data, userId)
    return NextResponse.json(charge)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    const charge = await voidCharge(id, userId)
    return NextResponse.json(charge)
  } catch (error) {
    return handleApiError(error)
  }
}
