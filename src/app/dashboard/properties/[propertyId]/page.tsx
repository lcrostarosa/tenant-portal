import { auth } from "@/lib/auth"
import { getPropertyById } from "@/lib/services/property"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { PropertyActions } from "./actions"
import { getFullAddress, formatCurrency, getTenantFullName } from "@/lib/utils"
import { Home, Pencil, Plus } from "lucide-react"

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const session = await auth()
  const { propertyId } = await params
  const property = await getPropertyById(propertyId, session!.user.id)

  if (!property) notFound()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
          <p className="text-muted-foreground mt-1">{getFullAddress(property)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/properties/${property.id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <PropertyActions propertyId={property.id} />
        </div>
      </div>

      {property.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{property.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Units ({property.units.length})
        </h2>
        <Button asChild>
          <Link href={`/dashboard/properties/${property.id}/units/new`}>
            <Plus className="h-4 w-4 mr-1" />
            Add Unit
          </Link>
        </Button>
      </div>

      {property.units.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No units yet"
          description="Add units to this property to start managing tenants and leases."
          actionLabel="Add Unit"
          actionHref={`/dashboard/properties/${property.id}/units/new`}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bed / Bath</TableHead>
                <TableHead>Market Rent</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {property.units.map((unit) => {
                const activeLease = unit.leases[0]
                return (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">
                      {unit.unitNumber}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={unit.status} />
                    </TableCell>
                    <TableCell>
                      {unit.bedrooms}bd / {unit.bathrooms}ba
                    </TableCell>
                    <TableCell>{formatCurrency(Number(unit.marketRent))}</TableCell>
                    <TableCell>
                      {activeLease ? (
                        <Link
                          href={`/dashboard/tenants/${activeLease.tenant.id}`}
                          className="hover:underline"
                        >
                          {getTenantFullName(activeLease.tenant)}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/properties/${property.id}/units/${unit.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
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
