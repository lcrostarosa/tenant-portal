"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { generateRentChargesAction } from "@/lib/actions/charge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function GenerateChargesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const now = new Date()
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const [month, setMonth] = useState(defaultMonth)

  async function handleGenerate() {
    setIsSubmitting(true)
    // Convert "YYYY-MM" to ISO date for the first of the month
    const result = await generateRentChargesAction(`${month}-01`)
    setIsSubmitting(false)

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    const count = result.data.count
    toast({
      title: "Charges generated",
      description: `${count} rent charge${count !== 1 ? "s" : ""} created.`,
    })
    router.push("/billing")
    router.refresh()
  }

  return (
    <div className="p-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Generate Rent Charges</CardTitle>
          <CardDescription>
            Generate monthly rent charges for all active leases. Charges that already exist
            for the selected month will be skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isSubmitting}>
              {isSubmitting ? "Generating..." : "Generate Charges"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
