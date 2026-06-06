import * as React from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Inbox } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { cartApi, wishlistApi } from "@/lib/api/handlers"
import { ProductCard } from "@/components/shop/product-card"
import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/query-keys"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"
import type { PageResponse, Product } from "@/lib/types/api"
import { ProductsPagination } from "@/components/shop/products-pagination"


const emptyProducts: PageResponse<Product> = {
  content: [],
  page: 0,
  size: 12,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  empty: true,
}

export function ProductsPage() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get("q") ?? ""
  const categorySlug = searchParams.get("category") ?? ""
  const [onlyAvailable, setOnlyAvailable] = React.useState(true)
  const page = Math.max(Number(searchParams.get("page")) || 1, 1) - 1

  const productParams = React.useMemo(
    () => ({
      searchTerm: query,
      categorySlug,
      onlyAvailable,
      page,
      size: 12,
      sort: "createdAt,desc",
    }),
    [categorySlug, onlyAvailable, page, query]
  )

  const { data: products = emptyProducts, error, isLoading } = useQuery({
    ...queries.products(productParams),
    placeholderData: keepPreviousData,
  })

  const addToCartMutation = useMutation({
    mutationFn: (product: Product) => cartApi.add(product.id, 1),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
    },
  })

  const wishlistMutation = useMutation({
    mutationFn: (product: Product) => wishlistApi.add(product.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header Catalogo */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Catalogo prodotti</h1>
          <p className="text-sm text-muted-foreground">
            Sfoglia e filtra l'inventario disponibile in tempo reale.
          </p>
        </div>
      </section>

      {/* Gestione Errori */}
      {error instanceof Error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive font-medium">
          Si è verificato un errore durante il recupero dei prodotti: {error.message}
        </div>
      )}

      {/* Contenuto Principale / Grid */}
      {isLoading ? (
        <div className="flex min-h-100 flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground animate-pulse">Aggiornamento catalogo...</p>
        </div>
      ) : products.content.length === 0 ? (
        /* Empty State Strutturato */
        <div className="flex min-h-87.5 flex-col items-center justify-center text-center rounded-xl border border-dashed p-8 bg-muted/10 animate-in fade-in-50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground/80 mb-4">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Nessun prodotto trovato</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Nessun articolo corrisponde ai criteri di ricerca attuali. Prova a cambiare parole chiave o a reimpostare i filtri.
          </p>
          {(query || categorySlug || !onlyAvailable) && (
            <Button
              variant="link"
              size="sm"
              className="mt-3 text-primary font-medium"
              onClick={() => {
                setSearchParams({})
                setOnlyAvailable(true)
              }}
            >
              Azzera tutti i filtri
            </Button>
          )}
        </div>
      ) : (
        /* Griglia dei Prodotti */
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-200">
          {products.content.map((product) => (
            <ProductCard
              disabledActions={!isAuthenticated || addToCartMutation.isPending || wishlistMutation.isPending}
              key={product.id}
              onAddToCart={(item) => void addToCartMutation.mutateAsync(item)}
              onWishlist={(item) => void wishlistMutation.mutateAsync(item)}
              product={product}
            />
          ))}
        </div>
      )}

      <ProductsPagination products={products}/>
    </div>
  )
}
