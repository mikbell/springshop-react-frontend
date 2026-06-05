import { useQuery } from "@tanstack/react-query"
import { Loader2, PackageCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatMoney } from "@/lib/format"
import { queries } from "@/lib/queries"
import { useAuth } from "@/state/auth"

export function OrdersPage() {
  const { isAuthenticated } = useAuth()
  const { data: orders = [], isLoading } = useQuery(queries.orders(isAuthenticated))

  if (!isAuthenticated) {
    return <p className="rounded-lg border p-4 text-sm text-muted-foreground">Accedi per vedere lo storico ordini.</p>
  }

  if (isLoading) {
    return (
      <div className="grid min-h-72 place-items-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold tracking-normal">Ordini</h1>
      {orders.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-lg border text-muted-foreground">
          Nessun ordine presente.
        </div>
      ) : null}
      {orders.map((order) => (
        <Card className="rounded-lg" key={order.id}>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <PackageCheck className="size-5" />
                {order.orderNumber}
              </span>
              <Badge variant="secondary">{order.status}</Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {order.items.map((item) => (
              <div className="flex justify-between gap-3 text-sm" key={item.id}>
                <span>
                  {item.productName} x {item.quantity}
                </span>
                <span>{formatMoney(item.totalPrice)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Totale</span>
              <span>{formatMoney(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
