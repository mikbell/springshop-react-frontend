import * as React from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Inbox } from "lucide-react"
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
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Catalogo prodotti</h1>
          <p className="text-sm text-muted-foreground">
            Sfoglia l’inventario aggiornato e trova rapidamente i prodotti disponibili.
          </p>
        </div>

        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{products.totalElements}</span>{" "}
            prodotti trovati
          </p>
        )}
      </section>

      {error instanceof Error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive shadow-sm"
        >
          <p className="font-semibold">Impossibile caricare il catalogo</p>
          <p className="mt-1 text-destructive/90">{error.message}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-2xl border bg-muted/30"
            />
          ))}
        </div>
      ) : products.content.length === 0 ? (
        <div className="flex min-h-87.5 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/10 p-8 text-center animate-in fade-in-50">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-7 w-7" />
          </div>

          <h3 className="text-lg font-semibold text-foreground">
            Nessun prodotto trovato
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Non ci sono prodotti compatibili con i filtri attuali. Prova a modificare la ricerca,
            cambiare categoria o mostrare anche gli articoli non disponibili.
          </p>

          {(query || categorySlug || !onlyAvailable) && (
            <Button
              variant="default"
              size="sm"
              className="mt-5"
              onClick={() => {
                setSearchParams({})
                setOnlyAvailable(true)
              }}
            >
              Azzera filtri
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 animate-in fade-in duration-200">
            {products.content.map((product) => (
              <ProductCard
                key={product.id}
                disabledActions={
                  !isAuthenticated ||
                  addToCartMutation.isPending ||
                  wishlistMutation.isPending
                }
                onAddToCart={(item) => void addToCartMutation.mutateAsync(item)}
                onWishlist={(item) => void wishlistMutation.mutateAsync(item)}
                product={product}
              />
            ))}
          </div>

          <ProductsPagination products={products} />
        </>
      )}
    </div>
  )
}
