import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 })
  }

  const tenants = await prisma.tenant.findMany({
    where: {
      leases: {
        some: {
          unit: { property: { ownerId: session.user.id } },
        },
      },
    },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  })

  return NextResponse.json(
    tenants.map((t) => ({ id: t.id, name: `${t.firstName} ${t.lastName}` }))
  )
}
