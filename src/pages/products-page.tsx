import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Filter, Loader2, Search, SlidersHorizontal, Inbox } from "lucide-react"

import { cartApi, wishlistApi } from "@/api/handlers"
import { ProductCard } from "@/components/shop/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { queryKeys } from "@/lib/query-keys"
import { queries } from "@/lib/queries"
import { useAuth } from "@/state/auth"
import type { PageResponse, Product } from "@/types/api"
import { cn } from "@/lib/utils"

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

  const [queryInput, setQueryInput] = React.useState("")
  const query = useDebouncedValue(queryInput, 400)
  const [categorySlug, setCategorySlug] = React.useState("")
  const [onlyAvailable, setOnlyAvailable] = React.useState(true)
  const [page, setPage] = React.useState(0)

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

  const { data: products = emptyProducts, error, isLoading } = useQuery(queries.products(productParams))
  const { data: categories = [] } = useQuery(queries.categories())

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

  const handleCategoryChange = (value: string) => {
    setPage(0)
    setCategorySlug(value === "all" ? "" : value)
  }

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

      {/* Barra dei Filtri */}
      <section className="flex flex-col gap-3 p-4 rounded-xl border bg-card shadow-sm sm:flex-row sm:items-center">
        {/* Input di Ricerca */}
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground/70" />
          <Input
            className="pl-9 h-10 bg-background"
            onChange={(event) => {
              setPage(0)
              setQueryInput(event.target.value)
            }}
            placeholder="Cerca per nome o descrizione..."
            value={queryInput}
          />
        </div>

        {/* Dropdown Categorie (Shadcn UI Select) */}
        <Select value={categorySlug || "all"} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-50 h-10 bg-background">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-muted-foreground/70" />
            <SelectValue placeholder="Tutte le categorie" />
          </SelectTrigger>
          <SelectContent rounded-xl>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Toggle Filtro Disponibilità */}
        <Button
          onClick={() => {
            setPage(0)
            setOnlyAvailable((current) => !current)
          }}
          className={cn(
            "h-10 gap-2 w-full sm:w-auto font-medium transition-all",
            onlyAvailable
              ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
              : "bg-background text-muted-foreground hover:text-foreground"
          )}
          type="button"
          variant={onlyAvailable ? undefined : "outline"}
        >
          <Filter className="h-4 w-4" />
          <span>Solo disponibili</span>
        </Button>
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
          {(queryInput || categorySlug || !onlyAvailable) && (
            <Button
              variant="link"
              size="sm"
              className="mt-3 text-primary font-medium"
              onClick={() => {
                setQueryInput("")
                setCategorySlug("")
                setOnlyAvailable(true)
                setPage(0)
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

      {/* Paginazione */}
      {products.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-muted/60">
          <div className="text-sm text-muted-foreground font-medium order-2 sm:order-1">
            Mostrando <span className="text-foreground">{products.content.length}</span> di{" "}
            <span className="text-foreground">{products.totalElements}</span> prodotti — Pagina{" "}
            {products.page + 1} di {products.totalPages}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2 justify-end">
            <Button
              disabled={products.first}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 h-9 flex-1 sm:flex-none shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Precedente</span>
            </Button>
            <Button
              disabled={products.last}
              onClick={() => setPage((current) => current + 1)}
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 h-9 flex-1 sm:flex-none shadow-sm"
            >
              <span>Successiva</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Custom hook invariato, isolato correttamente
function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timeout)
    }
  }, [delay, value])

  return debouncedValue
}