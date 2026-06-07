import { useQuery } from "@tanstack/react-query"
import { PackageCheck, PackageOpen, UserRound } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatMoney } from "@/lib/format"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"

export function MyOrdersPage() {
  const { isAuthenticated } = useAuth()
  const { data: orders = [], isLoading } = useQuery(queries.orders(isAuthenticated))

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<UserRound className="h-7 w-7" />}
        title="Accesso richiesto"
        message="Accedi per vedere lo storico dei tuoi ordini."
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
      <div className="grid gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        </div>

        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-2xl border bg-muted/30"
          />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen className="h-7 w-7" />}
        title="Nessun ordine presente"
        message="Quando completerai un acquisto, lo troverai qui."
        action={
          <Button asChild variant="outline">
            <Link to="/">Sfoglia il catalogo</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">I miei ordini</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulta lo storico dei tuoi acquisti e lo stato degli ordini.
        </p>
      </section>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="rounded-2xl shadow-sm">
            <CardHeader className="gap-3">
              <CardTitle className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <PackageCheck className="h-5 w-5 shrink-0 text-primary" />
                  <span className="truncate">{order.orderNumber}</span>
                </span>

                <Badge variant="secondary">{order.status}</Badge>
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Effettuato il {formatDate(order.createdAt)}
              </p>
            </CardHeader>

            <CardContent className="grid gap-3">
              <div className="grid gap-2 rounded-xl bg-muted/30 p-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="min-w-0 truncate text-muted-foreground">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatMoney(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t pt-4 text-base font-bold">
                <span>Totale ordine</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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