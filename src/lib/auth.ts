import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cache } from "react"
import type { Role } from "@/generated/prisma"
import { authConfig } from "@/lib/auth.config"

export const { handlers, auth: uncachedAuth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) return null

        const isValid = await compare(password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: Role }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
})

// Deduplicate auth() calls within the same React Server Component render pass
export const auth = cache(uncachedAuth)

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  return session
}

export async function requireLandlordAuth() {
  const session = await requireAuth()
  if (session.user.role !== "LANDLORD") redirect("/tenant")
  return session
}

export async function requireTenantAuth() {
  const session = await requireAuth()
  if (session.user.role !== "TENANT") redirect("/dashboard")

  const tenant = await prisma.tenant.findFirst({
    where: { userId: session.user.id },
  })
  if (!tenant) redirect("/login")

  return { session, tenantId: tenant.id }
}
