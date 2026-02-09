import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar, MobileSidebar } from "@/components/sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
          <MobileSidebar />
          <span className="font-semibold">Property Manager</span>
        </header>
        <main className="flex-1 overflow-auto">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  )
}
