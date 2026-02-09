import { requireTenantAuth } from "@/lib/auth"
import { TenantSidebar, TenantMobileSidebar } from "@/components/tenant-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireTenantAuth()

  return (
    <div className="flex min-h-screen">
      <TenantSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
          <TenantMobileSidebar />
          <span className="font-semibold">Tenant Portal</span>
        </header>
        <main className="flex-1 overflow-auto">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  )
}
