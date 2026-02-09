import { describe, test, expect, beforeAll } from "vitest"

const BASE_URL = "http://localhost:3000"

/** Cookies collected after login, sent with every authenticated request. */
let cookies = ""

/**
 * Parse every Set-Cookie header from a Response and merge them into
 * the running `cookies` string (key=value pairs joined by "; ").
 */
function collectCookies(response: Response): void {
  const setCookies = response.headers.getSetCookie?.() ?? []
  const parsed = new Map<string, string>()

  // Seed with existing cookies
  if (cookies) {
    for (const pair of cookies.split("; ")) {
      const [k, ...rest] = pair.split("=")
      if (k) parsed.set(k, rest.join("="))
    }
  }

  for (const header of setCookies) {
    // Take only the key=value portion (before the first ";")
    const kv = header.split(";")[0]?.trim()
    if (!kv) continue
    const [k, ...rest] = kv.split("=")
    if (k) parsed.set(k, rest.join("="))
  }

  cookies = [...parsed.entries()].map(([k, v]) => `${k}=${v}`).join("; ")
}

/**
 * Authenticated fetch helper — attaches stored cookies and follows
 * redirects manually so we can inspect the status code.
 */
async function authFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (cookies) {
    headers["Cookie"] = cookies
  }
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    redirect: "manual",
  })
}

describe.sequential("Route smoke tests", () => {
  // ---------------------------------------------------------------
  // Login via NextAuth credentials flow
  // ---------------------------------------------------------------
  beforeAll(async () => {
    // Step 1 — grab CSRF token
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`, {
      redirect: "manual",
    })
    expect(csrfRes.ok).toBe(true)
    collectCookies(csrfRes)

    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string }
    expect(csrfToken).toBeTruthy()

    // Step 2 — POST credentials
    const loginRes = await fetch(
      `${BASE_URL}/api/auth/callback/credentials`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: cookies,
        },
        body: new URLSearchParams({
          csrfToken,
          email: "admin@example.com",
          password: "admin123",
        }).toString(),
        redirect: "manual",
      }
    )

    // NextAuth responds with a 302 redirect on success
    expect([200, 302].includes(loginRes.status)).toBe(true)
    collectCookies(loginRes)

    // Follow any redirect chain to collect all session cookies
    const location = loginRes.headers.get("location")
    if (location) {
      const followUrl = location.startsWith("http")
        ? location
        : `${BASE_URL}${location}`
      const followRes = await fetch(followUrl, {
        headers: { Cookie: cookies },
        redirect: "manual",
      })
      collectCookies(followRes)
    }

    // Verify we actually have a session cookie
    expect(cookies).toMatch(/authjs\.session-token/)
  }, 30_000)

  // ---------------------------------------------------------------
  // Authenticated dashboard routes — all should return 200
  // ---------------------------------------------------------------
  const dashboardRoutes = [
    "/dashboard",
    "/dashboard/properties",
    "/dashboard/tenants",
    "/dashboard/leases",
    "/dashboard/billing",
    "/dashboard/expenses",
    "/dashboard/mileage",
    "/dashboard/maintenance",
    "/dashboard/messages",
    "/dashboard/properties/new",
    "/dashboard/tenants/new",
    "/dashboard/leases/new",
    "/dashboard/expenses/new",
    "/dashboard/mileage/new",
  ]

  for (const route of dashboardRoutes) {
    test(`GET ${route} returns 200`, async () => {
      const res = await authFetch(route)
      collectCookies(res)
      expect(
        res.status,
        `Expected 200 for ${route} but got ${res.status}`
      ).toBe(200)
    }, 15_000)
  }

  // ---------------------------------------------------------------
  // Unauthenticated access — should redirect to /login
  // ---------------------------------------------------------------
  test("GET /dashboard without auth returns 302 redirect to /login", async () => {
    const res = await fetch(`${BASE_URL}/dashboard`, {
      redirect: "manual",
    })
    expect([302, 307].includes(res.status)).toBe(true)
    const location = res.headers.get("location") ?? ""
    expect(location).toContain("/login")
  }, 15_000)

  // ---------------------------------------------------------------
  // Login page — accessible without auth
  // ---------------------------------------------------------------
  test("GET /login returns 200 without auth", async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      redirect: "manual",
    })
    expect(res.status).toBe(200)
  }, 15_000)

  // ---------------------------------------------------------------
  // API routes — should return 200 or 401
  // ---------------------------------------------------------------
  test("GET /api/v1/properties returns 200 or 401", async () => {
    const res = await authFetch("/api/v1/properties")
    expect([200, 401].includes(res.status)).toBe(true)
  }, 15_000)

  test("GET /api/v1/tenants returns 200 or 401", async () => {
    const res = await authFetch("/api/v1/tenants")
    expect([200, 401].includes(res.status)).toBe(true)
  }, 15_000)
})
