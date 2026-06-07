import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CreditCard,
  Loader2,
  Minus,
  PackageOpen,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react"
import { Link } from "react-router-dom"

import { cartApi, checkoutApi } from "@/lib/api/handlers"
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

  const invalidateCart = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.cart })

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.update(productId, quantity),
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
    mutationFn: async () => {
      const session = await checkoutApi.createStripeSession({
        successUrl: `${window.location.origin}/orders/success`,
        cancelUrl: `${window.location.origin}/cart`,
      })

      const checkoutUrl = session.url ?? session.checkoutUrl ?? session.sessionUrl

      if (!checkoutUrl) {
        throw new Error("La sessione Stripe non contiene una URL di checkout.")
      }

      return checkoutUrl
    },
    onSuccess: (checkoutUrl) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders })
      window.location.assign(checkoutUrl)
    },
  })

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-7 w-7" />}
        title="Accedi al carrello"
        message="Effettua l’accesso per visualizzare i prodotti salvati nel carrello."
        action={
          <Button asChild>
            <Link to="/login">Accedi ora</Link>
          </Button>
        }
      />
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="grid gap-3">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />

          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border bg-muted/30"
            />
          ))}
        </section>

        <div className="h-64 animate-pulse rounded-2xl border bg-muted/30" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen className="h-7 w-7" />}
        title="Carrello vuoto"
        message="Aggiungi prodotti dal catalogo per procedere al checkout."
        action={
          <Button asChild>
            <Link to="/">Sfoglia il catalogo</Link>
          </Button>
        }
      />
    )
  }

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const isCartBusy =
    updateMutation.isPending ||
    removeMutation.isPending ||
    clearMutation.isPending ||
    checkoutMutation.isPending

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="grid gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carrello</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalItems} articoli pronti per il checkout.
          </p>
        </div>

        <div className="grid gap-3">
          {cart.items.map((item) => (
            <Card
              className="overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md"
              key={item.id}
            >
              <CardContent className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{item.sku}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {formatMoney(item.priceAtAdded)} × {item.quantity}
                  </div>
                  <div className="mt-2 text-sm font-medium sm:hidden">
                    Totale: {formatMoney(item.totalPrice)}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="hidden min-w-24 text-right font-semibold sm:block">
                    {formatMoney(item.totalPrice)}
                  </div>

                  <div className="flex items-center rounded-lg border bg-background">
                    <Button
                      aria-label="Diminuisci quantità"
                      disabled={isCartBusy}
                      onClick={() =>
                        void updateMutation.mutateAsync({
                          productId: item.productId,
                          quantity: Math.max(0, item.quantity - 1),
                        })
                      }
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <span className="min-w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>

                    <Button
                      aria-label="Aumenta quantità"
                      disabled={isCartBusy}
                      onClick={() =>
                        void updateMutation.mutateAsync({
                          productId: item.productId,
                          quantity: item.quantity + 1,
                        })
                      }
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    aria-label="Rimuovi articolo"
                    disabled={isCartBusy}
                    onClick={() => void removeMutation.mutateAsync(item.productId)}
                    size="icon-sm"
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card className="h-fit rounded-2xl shadow-sm lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Riepilogo ordine</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="grid gap-3 rounded-xl bg-muted/30 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Articoli</span>
              <span className="font-medium">{totalItems}</span>
            </div>

            <div className="flex justify-between border-t pt-3 text-lg font-bold">
              <span>Totale</span>
              <span>{formatMoney(cart.totalCartPrice)}</span>
            </div>
          </div>

          <Button
            className="h-11 gap-2"
            disabled={checkoutMutation.isPending}
            onClick={() => void checkoutMutation.mutateAsync()}
            type="button"
          >
            {checkoutMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Reindirizzamento...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Paga con Stripe
              </>
            )}
          </Button>

          {checkoutMutation.error ? (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {checkoutMutation.error.message}
            </p>
          ) : null}

          <Button
            disabled={clearMutation.isPending || checkoutMutation.isPending}
            onClick={() => void clearMutation.mutateAsync()}
            type="button"
            variant="outline"
          >
            {clearMutation.isPending ? "Svuotamento..." : "Svuota carrello"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyState({
  title,
  message,
  icon,
  action,
}: {
  title: string
  message: string
  icon: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="grid min-h-100 place-items-center rounded-2xl border border-dashed bg-muted/20 p-8">
      <div className="grid max-w-sm place-items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>

        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>

        {action}
      </div>
    </div>
  )
}