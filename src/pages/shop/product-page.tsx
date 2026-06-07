import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
} from "lucide-react"
import { Link, Navigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"
import { ReviewsSection } from "@/components/shop/sections/reviews-section"
import ProductDetailsSection from "@/components/shop/sections/product-details-section"

export function ProductPage() {
  const { slug } = useParams()
  const { isAuthenticated } = useAuth()
  const productSlug = slug ?? ""

  const {
    data: product,
    error,
    isLoading,
  } = useQuery({
    ...queries.productBySlug(productSlug),
    enabled: Boolean(productSlug),
  })

  const productId = product?.id ?? ""

  if (!slug) {
    return <Navigate replace to="/" />
  }

  if (isLoading) {
    return (
      <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-6">
        <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px]">
          <div className="aspect-4/3 animate-pulse rounded-2xl border bg-muted md:aspect-square lg:aspect-16/10" />

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-5 flex gap-2">
              <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
            </div>

            <div className="space-y-3">
              <div className="h-10 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-5 w-44 animate-pulse rounded bg-muted" />
            </div>

            <div className="mt-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>

            <div className="mt-10 rounded-2xl border bg-muted/20 p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-10 w-40 animate-pulse rounded bg-muted" />
              <div className="mt-5 h-12 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error instanceof Error || !product) {
    return (
      <div className="container mx-auto flex min-h-100 max-w-7xl items-center justify-center px-4 py-6">
        <div className="grid max-w-md gap-5 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ArrowLeft className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-destructive">
              Prodotto non disponibile
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Il prodotto cercato non esiste oppure non è più disponibile."}
            </p>
          </div>

          <Button asChild className="mx-auto" variant="outline">
            <Link to="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Torna al catalogo
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto grid max-w-7xl gap-10 px-4 py-6 lg:py-8">
      <Button
        asChild
        className="-ml-3 w-fit text-muted-foreground hover:text-foreground"
        variant="ghost"
      >
        <Link to="/" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Torna al catalogo</span>
        </Link>
      </Button>

      <ProductDetailsSection
        product={product}
        isAuthenticated={isAuthenticated}
      />

      <div className="h-px bg-border" />

      <ReviewsSection
        isAuthenticated={isAuthenticated}
        productId={productId}
        productSlug={productSlug}
      />
    </div>
  )
}