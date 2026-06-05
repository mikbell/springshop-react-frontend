import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Package } from "lucide-react"

import { AdminLoading, AdminPageShell } from "../../components/layouts/admin-page-shell"
import { ordersApi } from "@/lib/api/handlers"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate, formatMoney } from "@/lib/format"
import { queryKeys } from "@/lib/query-keys"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"
import type { OrderStatus } from "@/lib/types/api"

const orderStatuses: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "CANCELLED"]

// Helper per mappare lo stato a varianti di colore semantiche
const getStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case "PAID":
      return "secondary" // o un verde personalizzato
    case "SHIPPED":
      return "default" // colore primario (es. blu/nero)
    case "CANCELLED":
      return "destructive"
    case "PENDING":
    default:
      return "outline"
  }
}

export function AllOrdersPage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()

  const { data: orderPage, isLoading } = useQuery(queries.adminOrders(isAdmin))

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders })
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders })
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboardSummary })
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboardRecentOrders })
    },
  })

  const orders = orderPage?.content ?? []

  return (
    <AdminPageShell isAdmin={isAdmin} title="Gestione Ordini">
      {isLoading ? (
        <AdminLoading />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          <Package className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <p className="text-sm">Nessun ordine disponibile nel sistema.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            // Controlliamo se questo specifico ordine sta subendo un update di stato
            const isUpdating = statusMutation.isPending && statusMutation.variables?.id === order.id

            return (
              <Card key={order.id} className="shadow-sm transition-all hover:shadow-md">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">

                  {/* Info Ordine */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tracking-tight">{order.orderNumber}</span>
                      <Badge variant={getStatusVariant(order.status)} className="text-[11px] font-medium uppercase px-2 py-0">
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)} · <span className="font-medium text-foreground">{formatMoney(order.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Azione di Cambio Stato */}
                  <div className="flex items-center gap-2 sm:self-center">
                    {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

                    <Select
                      disabled={statusMutation.isPending}
                      value={order.status}
                      onValueChange={(value) =>
                        void statusMutation.mutateAsync({
                          id: order.id,
                          status: value as OrderStatus,
                        })
                      }
                    >
                      <SelectTrigger className="w-[140px] h-9 text-xs font-medium bg-background rounded-lg shadow-sm">
                        <SelectValue placeholder="Cambia stato" />
                      </SelectTrigger>
                      <SelectContent align="end" className="rounded-xl">
                        {orderStatuses.map((status) => (
                          <SelectItem key={status} value={status} className="text-xs cursor-pointer">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </AdminPageShell>
  )
}