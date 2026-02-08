"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUnitSchema, type CreateUnitInput } from "@/lib/validations/unit"
import { createUnitAction, updateUnitAction } from "@/lib/actions/unit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface UnitFormProps {
  propertyId: string
  unit?: {
    id: string
    unitNumber: string
    bedrooms: number
    bathrooms: number
    sqft: number | null
    marketRent: number | string
    status: string
    notes?: string | null
  }
}

export function UnitForm({ propertyId, unit }: UnitFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUnitInput>({
    resolver: zodResolver(createUnitSchema),
    defaultValues: unit
      ? {
          unitNumber: unit.unitNumber,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          sqft: unit.sqft ?? undefined,
          marketRent: typeof unit.marketRent === "string" ? parseFloat(unit.marketRent) : unit.marketRent,
          notes: unit.notes ?? undefined,
          propertyId,
        }
      : { propertyId },
  })

  async function onSubmit(data: CreateUnitInput) {
    setIsSubmitting(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.set(key, String(value))
      }
    })
    // Always include propertyId for create
    if (!unit) {
      formData.set("propertyId", propertyId)
    }

    const result = unit
      ? await updateUnitAction(unit.id, propertyId, formData)
      : await createUnitAction(formData)

    setIsSubmitting(false)

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    toast({ title: unit ? "Unit updated" : "Unit created" })
    router.push(`/properties/${propertyId}`)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{unit ? "Edit Unit" : "Add Unit"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unitNumber">Unit Number</Label>
            <Input id="unitNumber" placeholder="e.g. 101, A, Ground Floor" {...register("unitNumber")} />
            {errors.unitNumber && <p className="text-sm text-destructive">{errors.unitNumber.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" type="number" min="0" {...register("bedrooms", { valueAsNumber: true })} />
              {errors.bedrooms && <p className="text-sm text-destructive">{errors.bedrooms.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" type="number" min="0" step="0.5" {...register("bathrooms", { valueAsNumber: true })} />
              {errors.bathrooms && <p className="text-sm text-destructive">{errors.bathrooms.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sqft">Square Feet</Label>
              <Input id="sqft" type="number" min="0" placeholder="Optional" {...register("sqft", { valueAsNumber: true })} />
              {errors.sqft && <p className="text-sm text-destructive">{errors.sqft.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketRent">Market Rent ($)</Label>
              <Input id="marketRent" type="number" min="0" step="0.01" {...register("marketRent", { valueAsNumber: true })} />
              {errors.marketRent && <p className="text-sm text-destructive">{errors.marketRent.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional notes..." {...register("notes")} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : unit ? "Update Unit" : "Add Unit"}
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
