import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export type ApiAuthResult = {
  userId: string
  role: string
}

/**
 * Validates an API key from the Authorization header.
 * Expected format: `Bearer <API_KEY>`
 *
 * The API key is matched against the `API_KEYS` env variable,
 * which should be a comma-separated list of `key:userId` pairs.
 * Example: API_KEYS="sk-abc123:cuid1,sk-def456:cuid2"
 */
export async function requireApiKey(req: NextRequest): Promise<ApiAuthResult> {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiAuthError("Missing or invalid Authorization header", 401)
  }

  const apiKey = authHeader.slice(7)
  const apiKeys = process.env.API_KEYS ?? ""

  // Parse API_KEYS env var: "key1:userId1,key2:userId2"
  const keyMap = new Map(
    apiKeys
      .split(",")
      .filter(Boolean)
      .map((entry) => {
        const [key, userId] = entry.split(":")
        return [key.trim(), userId.trim()] as [string, string]
      })
  )

  const userId = keyMap.get(apiKey)
  if (!userId) {
    throw new ApiAuthError("Invalid API key", 401)
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })
  if (!user) {
    throw new ApiAuthError("User not found for API key", 401)
  }

  return { userId: user.id, role: user.role }
}

export class ApiAuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = "ApiAuthError"
  }
}

/** Helper to create a JSON error response from an ApiAuthError */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error("Unexpected API error:", error)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}
