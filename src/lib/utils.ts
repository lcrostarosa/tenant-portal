import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "MMM d, yyyy")
}

export function getFullAddress(property: {
  address: string
  city: string
  state: string
  zipCode: string
}): string {
  return `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`
}

export function getTenantFullName(tenant: {
  firstName: string
  lastName: string
}): string {
  return `${tenant.firstName} ${tenant.lastName}`
}

export function getOutstandingAmount(charges: { amount: string | number; paidAmount: string | number }[]): number {
  return charges.reduce((sum, charge) => {
    const amount = typeof charge.amount === "string" ? parseFloat(charge.amount) : charge.amount
    const paid = typeof charge.paidAmount === "string" ? parseFloat(charge.paidAmount) : charge.paidAmount
    return sum + (amount - paid)
  }, 0)
}
