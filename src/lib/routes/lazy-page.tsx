// lib/routing/lazy-page.tsx
import * as React from "react"
import { RouteFallback } from "@/components/routing/route-fallback"

export function lazyPage(element: React.ReactNode) {
  return <React.Suspense fallback={<RouteFallback />}>{element}</React.Suspense>
}