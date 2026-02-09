"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createLeaseSchema, type CreateLeaseInput } from "@/lib/validations/lease"
import { createLeaseAction, updateLeaseAction } from "@/lib/actions/lease"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface LeaseFormProps {
  tenants: { id: string; firstName: string; lastName: string }[]
  units: { id: string; unitNumber: string; propertyName: string; propertyId: string }[]
  lease?: {
    id: string
    startDate: Date | string
    endDate: Date | string
    rentAmount: number | string
    securityDeposit: number | string
    rentDueDay: number
    status: string
    documentPath: string | null
    notes: string | null
    tenantId: string
    unitId: string
  }
}

function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().split("T")[0]
}

export function LeaseForm({ tenants, units, lease }: LeaseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateLeaseInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createLeaseSchema) as any,
    defaultValues: lease
      ? {
          startDate: new Date(lease.startDate),
          endDate: new Date(lease.endDate),
          rentAmount: Number(lease.rentAmount),
          securityDeposit: Number(lease.securityDeposit),
          rentDueDay: lease.rentDueDay,
          status: lease.status as CreateLeaseInput["status"],
          notes: lease.notes ?? undefined,
          tenantId: lease.tenantId,
          unitId: lease.unitId,
        }
      : {
          rentDueDay: 1,
          status: "DRAFT",
        },
  })

  async function onSubmit(data: CreateLeaseInput) {
    setIsSubmitting(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          formData.set(key, value.toISOString())
        } else {
          formData.set(key, String(value))
        }
      }
    })

    const result = lease
      ? await updateLeaseAction(lease.id, formData)
      : await createLeaseAction(formData)

    setIsSubmitting(false)

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    toast({ title: lease ? "Lease updated" : "Lease created" })
    if (lease) {
      router.push(`/dashboard/leases/${lease.id}`)
    } else if (result.data && "id" in result.data) {
      router.push(`/dashboard/leases/${result.data.id}`)
    } else {
      router.push("/dashboard/leases")
    }
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lease ? "Edit Lease" : "New Lease"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!lease && (
            <>
              <div className="space-y-2">
                <Label>Tenant</Label>
                <Controller
                  control={control}
                  name="tenantId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.firstName} {t.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.tenantId && <p className="text-sm text-destructive">{errors.tenantId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Controller
                  control={control}
                  name="unitId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.propertyName} — Unit {u.unitNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unitId && <p className="text-sm text-destructive">{errors.unitId.message}</p>}
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                defaultValue={lease ? toDateInputValue(lease.startDate) : undefined}
                {...register("startDate", { valueAsDate: true })}
              />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                defaultValue={lease ? toDateInputValue(lease.endDate) : undefined}
                {...register("endDate", { valueAsDate: true })}
              />
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Monthly Rent ($)</Label>
              <Input id="rentAmount" type="number" min="0" step="0.01" {...register("rentAmount", { valueAsNumber: true })} />
              {errors.rentAmount && <p className="text-sm text-destructive">{errors.rentAmount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
              <Input id="securityDeposit" type="number" min="0" step="0.01" {...register("securityDeposit", { valueAsNumber: true })} />
              {errors.securityDeposit && <p className="text-sm text-destructive">{errors.securityDeposit.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rentDueDay">Rent Due Day</Label>
              <Input id="rentDueDay" type="number" min="1" max="28" {...register("rentDueDay", { valueAsNumber: true })} />
              {errors.rentDueDay && <p className="text-sm text-destructive">{errors.rentDueDay.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional notes..." {...register("notes")} />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : lease ? "Update Lease" : "Create Lease"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
