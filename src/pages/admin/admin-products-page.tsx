import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus,PackageX } from "lucide-react"
import { Link } from "react-router-dom"
import { productsApi } from "@/lib/api/handlers"
import { Button } from "@/components/ui/button"
import { queryKeys } from "@/lib/query-keys"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"
import { LoadingSpinner } from "@/components/shop/loading-spinner"
import AdminProductCard from "@/components/admin/admin-product-card"

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

  return (
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
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="flex min-h-75 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground animate-in fade-in-50">
          <PackageX className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <p className="text-sm font-medium">Nessun prodotto disponibile in catalogo.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) =>
            <AdminProductCard key={product.id} product={product} removeMutation={removeMutation} />
          )}
        </div>
      )}
    </div>
  )
}