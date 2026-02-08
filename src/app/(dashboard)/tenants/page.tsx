import { auth } from "@/lib/auth"
import { getTenants } from "@/lib/services/tenant"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Users } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getTenantFullName } from "@/lib/utils"

export default async function TenantsPage() {
  const session = await auth()
  const tenants = await getTenants(session!.user.id)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Tenants"
        description={`${tenants.length} ${tenants.length === 1 ? "tenant" : "tenants"}`}
        actionLabel="Add Tenant"
        actionHref="/tenants/new"
      />

      {tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants yet"
          description="Add your first tenant to start managing leases and billing."
          actionLabel="Add Tenant"
          actionHref="/tenants/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Active Lease</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => {
                const activeLease = tenant.leases[0]
                return (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <Link
                        href={`/tenants/${tenant.id}`}
                        className="font-medium hover:underline"
                      >
                        {getTenantFullName(tenant)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tenant.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tenant.phone ?? "—"}
                    </TableCell>
                    <TableCell>
                      {activeLease ? (
                        <span className="text-sm">
                          {activeLease.unit.property.name} — Unit {activeLease.unit.unitNumber}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
