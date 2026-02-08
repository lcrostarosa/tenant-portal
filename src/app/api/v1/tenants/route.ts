import { NextRequest, NextResponse } from "next/server"
import { requireApiKey, handleApiError } from "@/lib/api-auth"
import { getTenants, createTenant } from "@/lib/services/tenant"
import { createTenantSchema } from "@/lib/validations/tenant"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireApiKey(req)
    const tenants = await getTenants(userId)
    return NextResponse.json(tenants)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireApiKey(req)
    const body = await req.json()
    const parsed = createTenantSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const tenant = await createTenant(parsed.data)
    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
