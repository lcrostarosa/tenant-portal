"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createTenantSchema, type CreateTenantInput } from "@/lib/validations/tenant"
import { createTenantAction, updateTenantAction } from "@/lib/actions/tenant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface TenantFormProps {
  tenant?: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    notes: string | null
  }
}

export function TenantForm({ tenant }: TenantFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTenantInput>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: tenant
      ? {
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email ?? "",
          phone: tenant.phone ?? undefined,
          notes: tenant.notes ?? undefined,
        }
      : undefined,
  })

  async function onSubmit(data: CreateTenantInput) {
    setIsSubmitting(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.set(key, String(value))
      }
    })

    const result = tenant
      ? await updateTenantAction(tenant.id, formData)
      : await createTenantAction(formData)

    setIsSubmitting(false)

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    toast({ title: tenant ? "Tenant updated" : "Tenant created" })
    if (tenant) {
      router.push(`/tenants/${tenant.id}`)
    } else if (result.data && "id" in result.data) {
      router.push(`/tenants/${result.data.id}`)
    } else {
      router.push("/tenants")
    }
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tenant ? "Edit Tenant" : "New Tenant"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" {...register("firstName")} />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" {...register("lastName")} />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="(555) 123-4567" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional notes..." {...register("notes")} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : tenant ? "Update Tenant" : "Create Tenant"}
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
