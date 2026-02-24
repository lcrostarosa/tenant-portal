"use client"

import dynamic from "next/dynamic"
import "swagger-ui-react/swagger-ui.css"
import spec from "./openapi.json"

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false })

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <SwaggerUI spec={spec} />
      </div>
    </div>
  )
}
