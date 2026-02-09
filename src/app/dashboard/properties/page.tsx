import { auth } from "@/lib/auth"
import { getProperties } from "@/lib/services/property"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Building2 } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getFullAddress } from "@/lib/utils"

export default async function PropertiesPage() {
  const session = await auth()
  const properties = await getProperties(session!.user.id)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Properties"
        description={`${properties.length} ${properties.length === 1 ? "property" : "properties"}`}
        actionLabel="Add Property"
        actionHref="/dashboard/properties/new"
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Add your first property to get started managing units, tenants, and leases."
          actionLabel="Add Property"
          actionHref="/dashboard/properties/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/properties/${property.id}`}
                      className="font-medium hover:underline"
                    >
                      {property.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getFullAddress(property)}
                  </TableCell>
                  <TableCell className="text-right">
                    {property.units.length}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
