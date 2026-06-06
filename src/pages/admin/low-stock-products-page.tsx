import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, PackageCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/shop/loading-spinner"

export function LowStockProductsPage() {
  const { isAdmin } = useAuth()

  const { data: lowStockPage, isLoading } = useQuery(
    queries.adminDashboardLowStockProducts(isAdmin, 5)
  )

  const products = lowStockPage?.content ?? []

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-75 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground animate-in fade-in-50">
        <PackageCheck className="h-8 w-8 text-emerald-500 mb-2 opacity-80" />
        <p className="text-sm font-medium">Ottimo lavoro! Nessun prodotto sotto la soglia minima.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {products.map((product) => {
        const isOutofStock = product.stockQuantity === 0

        return (
          <Card key={product.id} className="shadow-sm transition-all hover:shadow-md">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">

              {/* Dettagli Prodotto e SKU */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-tight text-base">{product.name}</span>
                  {isOutofStock && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                      <AlertTriangle className="h-3 w-3" />
                      Esaurito
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono bg-muted/60 w-fit px-1.5 py-0.5 rounded">
                  {product.sku}
                </div>
              </div>

              {/* Stato e Conteggio Quantità */}
              <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
                {/* Badge Stato Catalogo */}
                <Badge variant="outline" className="text-xs font-medium uppercase tracking-wider text-[10px]">
                  {product.status}
                </Badge>

                {/* Badge Quantità Dinamico */}
                <Badge
                  variant={isOutofStock ? "destructive" : "secondary"}
                  className={cn(
                    "text-xs font-bold px-2.5 py-0.5 min-w-16.25 justify-center",
                    !isOutofStock && "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  )}
                >
                  {product.stockQuantity} pz
                </Badge>
              </div>

            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}