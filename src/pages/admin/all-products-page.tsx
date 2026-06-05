import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2, Loader2, PackageX, Layers } from "lucide-react"
import { Link } from "react-router-dom"

import { AdminLoading, AdminPageShell } from "../../components/layouts/admin-page-shell"
import { productsApi } from "@/lib/api/handlers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatMoney } from "@/lib/format"
import { queryKeys } from "@/lib/query-keys"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"
import { cn } from "@/lib/utils"

export function AllProductsPage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()

  const { data: productPage, isLoading } = useQuery(
    queries.adminProducts(isAdmin)
  )

  const removeMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminDashboardSummary,
      })
    },
  })

  const products = productPage?.content ?? []

  // Sfruttiamo lo shell passando il pulsante d'azione direttamente nel flusso superiore,
  // ma se preferisci mantenerlo dentro la pagina, lo organizziamo in un flex header pulito.
  return (
    <AdminPageShell isAdmin={isAdmin} title="Prodotti">
      <div className="space-y-4">
        {/* Top Bar d'azione */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {products.length > 0 && (
              <span>Totale: <strong className="text-foreground">{products.length}</strong> prodotti</span>
            )}
          </div>
          <Button asChild size="sm" className="h-9 gap-1.5 rounded-lg shadow-sm">
            <Link to="/admin/products/new">
              <Plus className="h-4 w-4" />
              <span>Nuovo prodotto</span>
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <AdminLoading />
        ) : products.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground animate-in fade-in-50">
            <PackageX className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium">Nessun prodotto disponibile in catalogo.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((product) => {
              const isDeleting = removeMutation.isPending && removeMutation.variables === product.id
              const isLowStock = product.stockQuantity <= 5

              return (
                <Card
                  key={product.id}
                  className={cn(
                    "shadow-sm transition-all hover:shadow-md",
                    isDeleting && "opacity-60 pointer-events-none animate-pulse"
                  )}
                >
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* Informazioni Prodotto */}
                    <div className="space-y-1">
                      <div className="font-semibold tracking-tight text-base">{product.name}</div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">{product.sku}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {product.category?.name ?? "Senza categoria"}
                        </span>
                      </div>
                    </div>

                    {/* Badge di Stato e Azioni */}
                    <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end sm:gap-6">
                      <div className="flex items-center gap-2.5">
                        {/* Prezzo */}
                        <span className="text-lg font-bold tracking-tight text-foreground">
                          {formatMoney(product.price)}
                        </span>

                        {/* Inventario */}
                        <Badge
                          variant={isLowStock ? "destructive" : "outline"}
                          className={cn("text-xs font-medium px-2 py-0", isLowStock && "bg-destructive/10 text-destructive hover:bg-destructive/10")}
                        >
                          {product.stockQuantity} pz
                        </Badge>

                        {/* Stato Visibilità */}
                        <Badge variant="secondary" className="text-xs font-medium px-2 py-0 uppercase tracking-wider text-[10px]">
                          {product.status}
                        </Badge>
                      </div>

                      {/* Bottone Elimina */}
                      <Button
                        disabled={removeMutation.isPending}
                        onClick={() => void removeMutation.mutateAsync(product.id)}
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors shrink-0"
                        type="button"
                        aria-label="Elimina prodotto"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AdminPageShell>
  )
}