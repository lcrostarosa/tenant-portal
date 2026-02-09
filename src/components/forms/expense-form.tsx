"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createExpenseSchema, type CreateExpenseInput } from "@/lib/validations/expense"
import { createExpenseAction, updateExpenseAction } from "@/lib/actions/expense"
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
import { EXPENSE_CATEGORIES } from "@/lib/constants"
import { Controller } from "react-hook-form"

interface ExpenseFormProps {
  expense?: {
    id: string
    date: Date
    amount: number | string
    category: string
    description: string
    vendor?: string | null
    propertyId?: string | null
    unitId?: string | null
    notes?: string | null
  }
  properties: { id: string; name: string; units: { id: string; unitNumber: string }[] }[]
}

function toDateInputValue(date: Date): string {
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

export function ExpenseForm({ expense, properties }: ExpenseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: expense
      ? {
          date: toDateInputValue(expense.date),
          amount: Number(expense.amount),
          category: expense.category as CreateExpenseInput["category"],
          description: expense.description,
          vendor: expense.vendor ?? undefined,
          propertyId: expense.propertyId ?? undefined,
          unitId: expense.unitId ?? undefined,
          notes: expense.notes ?? undefined,
        }
      : {
          date: new Date().toISOString().split("T")[0],
        },
  })

  const selectedPropertyId = watch("propertyId")
  const selectedProperty = properties.find((p) => p.id === selectedPropertyId)

  async function onSubmit(data: CreateExpenseInput) {
    setIsSubmitting(true)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.set(key, String(value))
      }
    })

    const result = expense
      ? await updateExpenseAction(expense.id, formData)
      : await createExpenseAction(formData)

    setIsSubmitting(false)

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    toast({ title: expense ? "Expense updated" : "Expense created" })
    if (expense) {
      router.push(`/dashboard/expenses/${expense.id}`)
    } else if (result.data && "id" in result.data) {
      router.push(`/dashboard/expenses/${result.data.id}`)
    } else {
      router.push("/dashboard/expenses")
    }
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{expense ? "Edit Expense" : "New Expense"}</CardTitle>
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
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register("amount", { valueAsNumber: true })} />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="e.g. Plumbing repair" {...register("description")} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input id="vendor" placeholder="Optional vendor name" {...register("vendor")} />
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
              <Label>Unit</Label>
              <Controller
                name="unitId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={!selectedProperty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProperty?.units.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.unitNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional notes..." {...register("notes")} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : expense ? "Update Expense" : "Create Expense"}
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
