import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  // Unit statuses
  VACANT: "bg-green-100 text-green-800 border-green-200",
  OCCUPIED: "bg-blue-100 text-blue-800 border-blue-200",
  MAINTENANCE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  // Lease statuses
  DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  EXPIRED: "bg-red-100 text-red-800 border-red-200",
  TERMINATED: "bg-red-100 text-red-800 border-red-200",
  // Charge statuses
  DUE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PARTIAL: "bg-orange-100 text-orange-800 border-orange-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  VOID: "bg-gray-100 text-gray-800 border-gray-200",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClasses = statusColors[status] ?? "bg-gray-100 text-gray-800 border-gray-200"

  return (
    <Badge
      variant="outline"
      className={cn(colorClasses, "font-medium", className)}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  )
}
