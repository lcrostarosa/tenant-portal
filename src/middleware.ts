import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /api/auth/* (NextAuth routes)
     * - /api/v1/* (REST API)
     * - /api/webhooks/* (Twilio, etc.)
     * - /api/cron/* (Cron jobs)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, static assets
     */
    "/((?!api/auth|api/v1|api/webhooks|api/cron|_next|favicon\\.ico|icons).*)",
  ],
}
