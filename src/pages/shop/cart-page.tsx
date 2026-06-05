import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreditCard, Loader2, Minus, Plus, Trash2 } from "lucide-react"

import { cartApi, ordersApi } from "@/lib/api/handlers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney } from "@/lib/format"
import { queryKeys } from "@/lib/query-keys"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"

export function CartPage() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const { data: cart = null, isLoading } = useQuery(queries.cart(isAuthenticated))
  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: queryKeys.cart })
  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => cartApi.update(productId, quantity),
    onSuccess: () => {
      void invalidateCart()
    },
  })
  const removeMutation = useMutation({
    mutationFn: (productId: string) => cartApi.remove(productId),
    onSuccess: () => {
      void invalidateCart()
    },
  })
  const clearMutation = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => {
      void invalidateCart()
    },
  })
  const checkoutMutation = useMutation({
    mutationFn: () => ordersApi.checkout(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders })
    },
  })

  if (!isAuthenticated) {
    return <EmptyState title="Carrello riservato" message="Accedi per visualizzare e modificare il carrello." />
  }

  if (isLoading) {
    return (
      <div className="grid min-h-72 place-items-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyState title="Carrello vuoto" message="Aggiungi prodotti dal catalogo per procedere al checkout." />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="grid gap-3">
        <h1 className="text-2xl font-semibold tracking-normal">Carrello</h1>
        {cart.items.map((item) => (
          <Card className="rounded-lg" key={item.id} size="sm">
            <CardContent className="grid gap-3 py-1 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="font-medium">{item.sku}</div>
                <div className="text-sm text-muted-foreground">
                  {formatMoney(item.priceAtAdded)} x {item.quantity}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{formatMoney(item.totalPrice)}</div>
                <div className="flex gap-1">
                  <Button
                    onClick={() =>
                      void updateMutation.mutateAsync({
                        productId: item.productId,
                        quantity: Math.max(0, item.quantity - 1),
                      })
                    }
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <Minus />
                  </Button>
                  <Button
                    onClick={() =>
                      void updateMutation.mutateAsync({ productId: item.productId, quantity: item.quantity + 1 })
                    }
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <Plus />
                  </Button>
                  <Button
                    onClick={() => void removeMutation.mutateAsync(item.productId)}
                    size="icon-sm"
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      <Card className="h-fit rounded-lg">
        <CardHeader>
          <CardTitle>Riepilogo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-between text-sm">
            <span>Articoli</span>
            <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Totale</span>
            <span>{formatMoney(cart.totalCartPrice)}</span>
          </div>
          <Button disabled={checkoutMutation.isPending} onClick={() => void checkoutMutation.mutateAsync()} type="button">
            <CreditCard />
            Checkout
          </Button>
          <Button disabled={clearMutation.isPending} onClick={() => void clearMutation.mutateAsync()} type="button" variant="outline">
            Svuota carrello
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="grid min-h-72 place-items-center rounded-lg border">
      <div className="text-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
