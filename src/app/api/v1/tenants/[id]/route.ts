import { NextRequest, NextResponse } from "next/server"
import { requireApiKey, handleApiError } from "@/lib/api-auth"
import { getTenantById, updateTenant, deleteTenant } from "@/lib/services/tenant"
import { updateTenantSchema } from "@/lib/validations/tenant"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireApiKey(req)
    const { id } = await params
    const tenant = await getTenantById(id, userId)
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }
    return NextResponse.json(tenant)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiKey(req)
    const { id } = await params
    const body = await req.json()
    const parsed = updateTenantSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const tenant = await updateTenant(id, parsed.data)
    return NextResponse.json(tenant)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiKey(req)
    const { id } = await params
    await deleteTenant(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
