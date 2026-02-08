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
      const isOnLogin = request.nextUrl.pathname.startsWith("/login")
      const isApiV1 = request.nextUrl.pathname.startsWith("/api/v1")

      if (isApiV1) return true
      if (isOnLogin) return true

      return isLoggedIn
    },
  },
} satisfies NextAuthConfig
