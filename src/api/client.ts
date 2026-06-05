import type { ApiError, AuthResponse } from "@/types/api"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")

if (!API_BASE_URL) {
  throw new Error("Missing VITE_API_BASE_URL environment variable")
}

const ACCESS_TOKEN_KEY = "springshop.accessToken"
const REFRESH_TOKEN_KEY = "springshop.refreshToken"

export class ApiClientError extends Error {
  readonly status: number
  readonly details: ApiError | null

  constructor(status: number, details: ApiError | null) {
    super(details?.message ?? details?.error ?? `Request failed (${status})`)
    this.name = "ApiClientError"
    this.status = status
    this.details = details
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAuthTokens(tokens: Pick<AuthResponse, "token" | "refreshToken">) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.token)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

function toQueryString(params?: Record<string, unknown>) {
  if (!params) {
    return ""
  }

  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return
    }
    query.set(key, String(value))
  })

  const encoded = query.toString()
  return encoded ? `?${encoded}` : ""
}

async function parseBody(response: Response) {
  if (response.status === 204) {
    return undefined
  }

  const text = await response.text()
  if (!text) {
    return undefined
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return false
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    clearAuthTokens()
    return false
  }

  const tokens = (await response.json()) as AuthResponse
  setAuthTokens(tokens)
  window.dispatchEvent(new Event("springshop:auth-changed"))
  return true
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { query?: Record<string, unknown>; auth?: boolean } = {}
): Promise<T> {
  const { query, auth = true, headers, ...init } = options
  const token = getAccessToken()
  const requestHeaders = new Headers(headers)

  if (!requestHeaders.has("Content-Type") && init.body) {
    requestHeaders.set("Content-Type", "application/json")
  }

  if (auth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}${toQueryString(query)}`, {
    ...init,
    headers: requestHeaders,
  })

  if (response.status === 401 && auth && (await refreshAccessToken())) {
    return apiRequest<T>(path, options)
  }

  const body = await parseBody(response)
  if (!response.ok) {
    throw new ApiClientError(response.status, body as ApiError | null)
  }

  return body as T
}

export const apiBaseUrl = API_BASE_URL
