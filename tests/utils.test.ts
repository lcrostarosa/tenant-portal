import { describe, test, expect } from "vitest"
import { cn, formatCurrency, formatDate, normalizePhone } from "@/lib/utils"
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  CHARGE_TYPES,
  UNIT_STATUSES,
  LEASE_STATUSES,
} from "@/lib/constants"

// ---------------------------------------------------------------------------
// cn() - Tailwind class name merge utility
// ---------------------------------------------------------------------------
describe("cn()", () => {
  test("merges multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  test("handles conditional classes via clsx object syntax", () => {
    expect(cn("base", { "text-red-500": true, "text-blue-500": false })).toBe(
      "base text-red-500"
    )
  })

  test("resolves Tailwind conflicts in favor of the last class", () => {
    expect(cn("px-4", "px-8")).toBe("px-8")
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  test("returns empty string when called with no arguments", () => {
    expect(cn()).toBe("")
  })

  test("handles undefined and null values gracefully", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b")
  })

  test("handles arrays of class names", () => {
    expect(cn(["px-2", "py-2"], "mt-4")).toBe("px-2 py-2 mt-4")
  })
})

// ---------------------------------------------------------------------------
// formatCurrency()
// ---------------------------------------------------------------------------
describe("formatCurrency()", () => {
  test("formats a whole number as USD", () => {
    expect(formatCurrency(1500)).toBe("$1,500.00")
  })

  test("formats a decimal number as USD", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50")
  })

  test("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00")
  })

  test("formats a negative number", () => {
    expect(formatCurrency(-250)).toBe("-$250.00")
  })

  test("accepts a numeric string and formats it", () => {
    expect(formatCurrency("999.99")).toBe("$999.99")
  })

  test("handles a large number with comma grouping", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000.00")
  })
})

// ---------------------------------------------------------------------------
// formatDate()
// ---------------------------------------------------------------------------
describe("formatDate()", () => {
  test("formats a Date object as 'MMM d, yyyy'", () => {
    const date = new Date(2025, 0, 15) // Jan 15, 2025
    expect(formatDate(date)).toBe("Jan 15, 2025")
  })

  test("formats an ISO date string", () => {
    // Use a full timestamp so it doesn't shift across timezones
    expect(formatDate("2024-12-25T12:00:00")).toBe("Dec 25, 2024")
  })

  test("formats a date with single-digit day (no leading zero)", () => {
    const date = new Date(2025, 5, 3) // Jun 3, 2025
    expect(formatDate(date)).toBe("Jun 3, 2025")
  })

  test("handles end-of-year date", () => {
    const date = new Date(2025, 11, 31) // Dec 31, 2025
    expect(formatDate(date)).toBe("Dec 31, 2025")
  })
})

// ---------------------------------------------------------------------------
// normalizePhone()
// ---------------------------------------------------------------------------
describe("normalizePhone()", () => {
  test("strips non-digit characters and prepends +1 for 10-digit numbers", () => {
    expect(normalizePhone("(555) 123-4567")).toBe("+15551234567")
  })

  test("handles 10 raw digits", () => {
    expect(normalizePhone("5551234567")).toBe("+15551234567")
  })

  test("handles 11 digits starting with 1 (adds + prefix)", () => {
    expect(normalizePhone("15551234567")).toBe("+15551234567")
  })

  test("handles already formatted +1 number (11 digits starting with 1)", () => {
    expect(normalizePhone("+1-555-123-4567")).toBe("+15551234567")
  })

  test("handles dots as separators", () => {
    expect(normalizePhone("555.123.4567")).toBe("+15551234567")
  })

  test("handles spaces as separators", () => {
    expect(normalizePhone("555 123 4567")).toBe("+15551234567")
  })

  test("returns + prefixed digits for non-standard lengths", () => {
    // International or unusual length numbers get a plain + prefix
    expect(normalizePhone("44123456789")).toBe("+44123456789")
  })
})

// ---------------------------------------------------------------------------
// Constants – value/label shape and expected lengths
// ---------------------------------------------------------------------------
describe("Constants", () => {
  function assertValueLabelShape(
    items: ReadonlyArray<{ readonly value: string; readonly label: string }>
  ) {
    for (const item of items) {
      expect(item).toHaveProperty("value")
      expect(item).toHaveProperty("label")
      expect(typeof item.value).toBe("string")
      expect(typeof item.label).toBe("string")
      expect(item.value.length).toBeGreaterThan(0)
      expect(item.label.length).toBeGreaterThan(0)
    }
  }

  describe("EXPENSE_CATEGORIES", () => {
    test("has 10 entries", () => {
      expect(EXPENSE_CATEGORIES).toHaveLength(10)
    })

    test("every entry has value and label strings", () => {
      assertValueLabelShape(EXPENSE_CATEGORIES)
    })
  })

  describe("PAYMENT_METHODS", () => {
    test("has 6 entries", () => {
      expect(PAYMENT_METHODS).toHaveLength(6)
    })

    test("every entry has value and label strings", () => {
      assertValueLabelShape(PAYMENT_METHODS)
    })
  })

  describe("CHARGE_TYPES", () => {
    test("has 5 entries", () => {
      expect(CHARGE_TYPES).toHaveLength(5)
    })

    test("every entry has value and label strings", () => {
      assertValueLabelShape(CHARGE_TYPES)
    })
  })

  describe("UNIT_STATUSES", () => {
    test("has 3 entries", () => {
      expect(UNIT_STATUSES).toHaveLength(3)
    })

    test("every entry has value and label strings", () => {
      assertValueLabelShape(UNIT_STATUSES)
    })
  })

  describe("LEASE_STATUSES", () => {
    test("has 4 entries", () => {
      expect(LEASE_STATUSES).toHaveLength(4)
    })

    test("every entry has value and label strings", () => {
      assertValueLabelShape(LEASE_STATUSES)
    })
  })
})
