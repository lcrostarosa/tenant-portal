"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { Fragment, useEffect, useState, useTransition } from "react"
import { resolveBreadcrumbNames } from "@/lib/actions/breadcrumb"

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
  expenses: "Expenses",
  mileage: "Mileage",
  maintenance: "Maintenance",
  preventive: "Preventive",
  messages: "Messages",
  lease: "My Lease",
}

function getLabel(segment: string, resolvedNames: Record<string, string>): string {
  if (resolvedNames[segment]) return resolvedNames[segment]
  return SEGMENT_LABELS[segment] ?? segment
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({})
  const [cache, setCache] = useState<Record<string, Record<string, string>>>({})

  // Determine base prefix: /dashboard or /tenant
  const segments = pathname.split("/").filter(Boolean)
  const prefix = segments[0] === "tenant" ? "/tenant" : "/dashboard"
  const isHome = pathname === prefix

  useEffect(() => {
    if (isHome) return

    // Check if there are any dynamic segments (non-static labels)
    const displaySegs = segments.slice(1)
    const hasDynamic = displaySegs.some(
      (s) => !SEGMENT_LABELS[s]
    )
    if (!hasDynamic) {
      setResolvedNames({})
      return
    }

    // Check cache first
    if (cache[pathname]) {
      setResolvedNames(cache[pathname])
      return
    }

    resolveBreadcrumbNames(pathname).then((names) => {
      setResolvedNames(names)
      setCache((prev) => ({ ...prev, [pathname]: names }))
    })
  }, [pathname, isHome])

  if (isHome) return null

  const displaySegments = segments.slice(1)
  if (displaySegments.length === 0) return null

  const crumbs = displaySegments.map((segment, index) => {
    const href = prefix + "/" + displaySegments.slice(0, index + 1).join("/")
    const isLast = index === displaySegments.length - 1
    const label = getLabel(segment, resolvedNames)

    return { href, label, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground px-6 pt-4">
      <Link href={prefix} className="hover:text-foreground transition-colors">
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
