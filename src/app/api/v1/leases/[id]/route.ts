import { NextRequest, NextResponse } from "next/server"
import { requireApiKey, handleApiError } from "@/lib/api-auth"
import { getLeaseById, updateLease, deleteLease } from "@/lib/services/lease"
import { updateLeaseSchema } from "@/lib/validations/lease"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    const lease = await getLeaseById(id, userId)
    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 })
    }
    return NextResponse.json(lease)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    const body = await req.json()
    const parsed = updateLeaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const lease = await updateLease(id, parsed.data, userId)
    return NextResponse.json(lease)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    await deleteLease(id, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
