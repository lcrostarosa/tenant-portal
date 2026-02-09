"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createMileageSchema, type CreateMileageInput } from "@/lib/validations/mileage"
import { createMileageAction, updateMileageAction } from "@/lib/actions/mileage"
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
import { Controller } from "react-hook-form"

interface MileageFormProps {
  trip?: {
    id: string
    date: Date
    miles: number
    purpose: string
    propertyId?: string | null
    notes?: string | null
  }
  properties: { id: string; name: string }[]
}

function toDateInputValue(date: Date): string {
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

export function MileageForm({ trip, properties }: MileageFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateMileageInput>({
    resolver: zodResolver(createMileageSchema),
    defaultValues: trip
      ? {
          date: toDateInputValue(trip.date),
          miles: trip.miles,
          purpose: trip.purpose,
          propertyId: trip.propertyId ?? undefined,
          notes: trip.notes ?? undefined,
        }
      : {
          date: new Date().toISOString().split("T")[0],
        },
  })

  async function onSubmit(data: CreateMileageInput) {
    setIsSubmitting(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.set(key, String(value))
      }
    })

    const result = trip
      ? await updateMileageAction(trip.id, formData)
      : await createMileageAction(formData)

    setIsSubmitting(false)

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    toast({ title: trip ? "Mileage trip updated" : "Mileage trip created" })
    if (trip) {
      router.push(`/dashboard/mileage/${trip.id}`)
    } else if (result.data && "id" in result.data) {
      router.push(`/dashboard/mileage/${result.data.id}`)
    } else {
      router.push("/dashboard/mileage")
    }
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{trip ? "Edit Mileage Trip" : "New Mileage Trip"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="miles">Miles</Label>
              <Input id="miles" type="number" step="0.1" placeholder="0.0" {...register("miles", { valueAsNumber: true })} />
              {errors.miles && <p className="text-sm text-destructive">{errors.miles.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input id="purpose" placeholder="e.g. Property inspection" {...register("purpose")} />
            {errors.purpose && <p className="text-sm text-destructive">{errors.purpose.message}</p>}
          </div>
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
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
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
              {isSubmitting ? "Saving..." : trip ? "Update Trip" : "Create Trip"}
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
