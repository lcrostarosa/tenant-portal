"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { Fragment } from "react"

const SEGMENT_LABELS: Record<string, string> = {
  properties: "Properties",
  tenants: "Tenants",
  leases: "Leases",
  billing: "Billing",
  new: "New",
  edit: "Edit",
  units: "Units",
  charges: "Charges",
  payments: "Payments",
  generate: "Generate",
}

function getLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment
}

export function Breadcrumbs() {
  const pathname = usePathname()

  // Don't show breadcrumbs on dashboard root
  if (pathname === "/") return null

  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 0) return null

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const isLast = index === segments.length - 1
    const label = getLabel(segment)

    return { href, label, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground px-6 pt-4">
      <Link href="/" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <Fragment key={crumb.href}>
          <ChevronRight className="h-3.5 w-3.5" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
