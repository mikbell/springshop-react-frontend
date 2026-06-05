import { apiBaseUrl } from "@/lib/api/client"

export function resolveAssetUrl(value: string | null | undefined) {
  if (!value) {
    return null
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) {
    return value
  }

  return `${apiBaseUrl}${value.startsWith("/") ? value : `/${value}`}`
}

export function formatMoney(value: number | null | undefined) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value ?? 0)
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function initials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "U"
}


const numberFormatter = new Intl.NumberFormat("it-IT")

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}
