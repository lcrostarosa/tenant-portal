import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PaymentForm } from "@/components/forms/payment-form"

export default async function NewPaymentPage() {
  const session = await auth()
  const userId = session!.user.id

  // Get tenants that have active leases under this owner
  const tenants = await prisma.tenant.findMany({
    where: {
      leases: {
        some: {
          status: "ACTIVE",
          unit: { property: { ownerId: userId } },
        },
      },
    },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  })

  return (
    <div className="p-6 max-w-2xl">
      <PaymentForm tenants={tenants} />
    </div>
  )
}
