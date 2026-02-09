"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createPreventiveMaintenanceSchema,
  type CreatePreventiveMaintenanceInput,
} from "@/lib/validations/preventive-maintenance"
import { createPreventiveMaintenanceAction } from "@/lib/actions/preventive-maintenance"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface Props {
  properties: { id: string; name: string; units: { id: string; unitNumber: string }[] }[]
}

const FREQUENCIES = ["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL", "CUSTOM"] as const

export function PreventiveMaintenanceForm({ properties }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreatePreventiveMaintenanceInput>({
    resolver: zodResolver(createPreventiveMaintenanceSchema),
    defaultValues: {
      frequency: "MONTHLY",
      nextDueDate: new Date().toISOString().split("T")[0],
      notifyTenants: false,
    },
  })

  const frequency = watch("frequency")
  const selectedPropertyId = watch("propertyId")
  const selectedProperty = properties.find((p) => p.id === selectedPropertyId)

  async function onSubmit(data: CreatePreventiveMaintenanceInput) {
    setIsSubmitting(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.set(key, String(value))
      }
    })

    const result = await createPreventiveMaintenanceAction(formData)
    setIsSubmitting(false)

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    toast({ title: "Schedule created" })
    router.push("/dashboard/maintenance/preventive")
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Preventive Maintenance Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. HVAC Filter Replacement" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Optional description..." {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Controller
                name="frequency"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((f) => (
                        <SelectItem key={f} value={f}>{f.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {frequency === "CUSTOM" && (
              <div className="space-y-2">
                <Label htmlFor="customDays">Custom Days</Label>
                <Input id="customDays" type="number" {...register("customDays")} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nextDueDate">Next Due Date</Label>
              <Input id="nextDueDate" type="date" {...register("nextDueDate")} />
              {errors.nextDueDate && <p className="text-sm text-destructive">{errors.nextDueDate.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property</Label>
              <Controller
                name="propertyId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Controller
                name="unitId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={!selectedProperty}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProperty?.units.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.unitNumber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              name="notifyTenants"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="notifyTenants"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="notifyTenants">Notify tenants when maintenance is due</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Schedule"}
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
