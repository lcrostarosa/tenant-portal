export const EXPENSE_CATEGORIES = [
  { value: "REPAIRS", label: "Repairs & Maintenance" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "TAXES", label: "Taxes" },
  { value: "HOA", label: "HOA Fees" },
  { value: "LANDSCAPING", label: "Landscaping" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "SUPPLIES", label: "Supplies" },
  { value: "OTHER", label: "Other" },
] as const

export const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "CHECK", label: "Check" },
  { value: "ZELLE", label: "Zelle" },
  { value: "VENMO", label: "Venmo" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "OTHER", label: "Other" },
] as const

export const CHARGE_TYPES = [
  { value: "RENT", label: "Rent" },
  { value: "LATE_FEE", label: "Late Fee" },
  { value: "UTILITY", label: "Utility" },
  { value: "REPAIR", label: "Repair" },
  { value: "OTHER", label: "Other" },
] as const

export const UNIT_STATUSES = [
  { value: "VACANT", label: "Vacant" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "MAINTENANCE", label: "Maintenance" },
] as const

export const LEASE_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
  { value: "TERMINATED", label: "Terminated" },
] as const
