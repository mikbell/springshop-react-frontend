import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Box,
  Euro,
  PackageCheck,
  ShoppingCart,
  Users,
  TrendingUp,
} from "lucide-react"

import { AdminLoading, AdminPageShell } from "../../components/layouts/admin-page-shell"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatMoney, formatNumber } from "@/lib/format"
import { queries } from "@/lib/queries"
import { useAuth } from "@/lib/state/auth"
import type {
  DashboardSummary,
  LowStockProduct,
  RecentOrder,
} from "@/lib/types/api"
import { cn } from "@/lib/utils"

export function SummaryPage() {
  const { isAdmin } = useAuth()

  // Eseguiamo i fetch solo se l'utente è admin
  const { data: summary, isLoading: loadingSummary } = useQuery(
    queries.adminDashboardSummary(isAdmin)
  )
  const { data: recentOrders = [], isLoading: loadingRecentOrders } = useQuery(
    queries.adminDashboardRecentOrders(isAdmin)
  )
  const { data: lowStockPage, isLoading: loadingLowStock } = useQuery(
    queries.adminDashboardLowStockProducts(isAdmin, 5)
  )

  return (
    <AdminPageShell isAdmin={isAdmin} title="Dashboard">
      {loadingSummary || loadingRecentOrders || loadingLowStock ? (
        <AdminLoading />
      ) : (
        <AdminDashboard
          lowStockProducts={lowStockPage?.content ?? []}
          recentOrders={recentOrders}
          summary={summary}
        />
      )}
    </AdminPageShell>
  )
}

function AdminDashboard({
  lowStockProducts,
  recentOrders,
  summary,
}: {
  lowStockProducts: LowStockProduct[]
  recentOrders: RecentOrder[]
  summary?: DashboardSummary
}) {
  if (!summary) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        I dati della dashboard non sono momentaneamente disponibili.
      </div>
    )
  }

  const metrics = [
    {
      label: "Ricavi totali",
      value: formatMoney(summary.totalRevenue),
      detail: `${formatMoney(summary.todayRevenue)} oggi`,
      icon: Euro,
    },
    {
      label: "Ordini totali",
      value: formatNumber(summary.totalOrders),
      detail: `${summary.pendingOrders} in attesa · ${summary.paidOrders} pagati`,
      icon: ShoppingCart,
    },
    {
      label: "Prodotti in catalogo",
      value: formatNumber(summary.totalProducts),
      detail: `${summary.availableProducts} attivi sul sito`,
      icon: Box,
    },
    {
      label: "Clienti registrati",
      value: formatNumber(summary.totalUsers),
      detail: `${summary.activeUsers} attivi di recente`,
      icon: Users,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Grid delle Metriche Principali */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="overflow-hidden shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">{metric.label}</CardDescription>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{metric.value}</div>
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500 inline" />
                  {metric.detail}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Grid degli Status degli Stock */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatusCard
          icon={PackageCheck}
          label="Ordini Spediti"
          value={summary.shippedOrders}
        />
        <StatusCard
          icon={AlertTriangle}
          label="Prodotti in Esaurimento"
          value={summary.lowStockProducts}
          variant={summary.lowStockProducts > 0 ? "warning" : "default"}
        />
        <StatusCard
          icon={Box}
          label="Prodotti Esauriti"
          value={summary.outOfStockProducts}
          variant={summary.outOfStockProducts > 0 ? "destructive" : "default"}
        />
      </div>

      {/* Sezione Liste / Tabelle */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tabella Ordini Recenti */}
        <Card className="shadow-sm">
          <CardHeader className="px-6 py-4 border-b">
            <CardTitle className="text-lg font-semibold">Ordini recenti</CardTitle>
            <CardDescription>Le ultime transazioni ricevute</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">Nessun ordine recente.</p>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-6">ID Ordine</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right pr-6">Totale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium pl-6">{order.orderNumber}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-medium text-xs">
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-right font-semibold pr-6">
                          {formatMoney(order.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabella Scorte Basse */}
        <Card className="shadow-sm">
          <CardHeader className="px-6 py-4 border-b">
            <CardTitle className="text-lg font-semibold">Scorte in esaurimento</CardTitle>
            <CardDescription>Prodotti con disponibilità critica (&le; 5 unità)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockProducts.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">Tutti i prodotti sono ben riforniti.</p>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="pl-6">Prodotto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right pr-6">Quantità</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium max-w-[200px] truncate pl-6" title={product.name}>
                          {product.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{product.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <span className={cn(
                            "inline-block rounded px-2 py-0.5 text-xs font-bold",
                            product.stockQuantity === 0
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          )}>
                            {product.stockQuantity} pz
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Esportato correttamente il sotto-componente risolvendo i bug grafici
function StatusCard({
  icon: Icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  variant?: "default" | "warning" | "destructive"
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{formatNumber(value)}</p>
        </div>
        <div className={cn(
          "p-2.5 rounded-lg",
          variant === "destructive" && "bg-destructive/10 text-destructive",
          variant === "warning" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          variant === "default" && "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}