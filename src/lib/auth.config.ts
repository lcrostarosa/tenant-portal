import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // Providers added in auth.ts (not edge-compatible)
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = request.nextUrl
      const isOnLogin = pathname.startsWith("/login")
      const isOnDocs = pathname.startsWith("/docs")
      const isApiV1 = pathname.startsWith("/api/v1")
      const isWebhook = pathname.startsWith("/api/webhooks")
      const isCron = pathname.startsWith("/api/cron")

      if (isApiV1 || isWebhook || isCron) return true
      if (isOnLogin || isOnDocs) return true

      if (!isLoggedIn) return false

      const role = (auth?.user as { role?: string })?.role

      // Role-based routing at root
      if (pathname === "/") {
        const dest = role === "TENANT" ? "/tenant" : "/dashboard"
        return Response.redirect(new URL(dest, request.nextUrl))
      }

      // Redirect tenants away from landlord dashboard
      if (role === "TENANT" && pathname.startsWith("/dashboard")) {
        return Response.redirect(new URL("/tenant", request.nextUrl))
      }

      // Redirect landlords away from tenant portal
      if (role === "LANDLORD" && pathname.startsWith("/tenant")) {
        return Response.redirect(new URL("/dashboard", request.nextUrl))
      }

      return true
    },
  },
} satisfies NextAuthConfig
