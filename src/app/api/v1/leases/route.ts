import { NextRequest, NextResponse } from "next/server"
import { requireApiKey, handleApiError } from "@/lib/api-auth"
import { getLeases, createLease } from "@/lib/services/lease"
import { createLeaseSchema } from "@/lib/validations/lease"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireApiKey(req)
    const leases = await getLeases(userId)
    return NextResponse.json(leases)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireApiKey(req)
    const body = await req.json()
    const parsed = createLeaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const lease = await createLease(parsed.data, userId)
    return NextResponse.json(lease, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
