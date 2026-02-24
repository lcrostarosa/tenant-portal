import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "API Documentation | Tenant Portal",
  description: "Interactive API documentation for the Tenant Portal REST API",
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
