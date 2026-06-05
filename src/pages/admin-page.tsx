import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save, Trash2 } from "lucide-react"

import { categoriesApi, ordersApi, productsApi } from "@/api/handlers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { formatDate, formatMoney } from "@/lib/format"
import { queryKeys } from "@/lib/query-keys"
import { queries } from "@/lib/queries"
import { useAuth } from "@/state/auth"
import type { Category, Order, OrderStatus, Product } from "@/types/api"

const orderStatuses: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "CANCELLED"]

export function AdminPage() {
  const { isAdmin } = useAuth()
  const { data: productPage, isLoading: loadingProducts } = useQuery(queries.adminProducts(isAdmin))
  const { data: categories = [], isLoading: loadingCategories } = useQuery(queries.categories(isAdmin))
  const { data: orderPage, isLoading: loadingOrders } = useQuery(queries.adminOrders(isAdmin))

  if (!isAdmin) {
    return <p className="rounded-lg border p-4 text-sm text-muted-foreground">Sezione riservata agli amministratori.</p>
  }

  if (loadingProducts || loadingCategories || loadingOrders) {
    return (
      <div className="grid min-h-72 place-items-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="products">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-normal">Admin</h1>
        <TabsList>
          <TabsTrigger value="products">Prodotti</TabsTrigger>
          <TabsTrigger value="categories">Categorie</TabsTrigger>
          <TabsTrigger value="orders">Ordini</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="products">
        <ProductAdmin categories={categories} products={productPage?.content ?? []} />
      </TabsContent>
      <TabsContent value="categories">
        <CategoryAdmin categories={categories} />
      </TabsContent>
      <TabsContent value="orders">
        <OrderAdmin orders={orderPage?.content ?? []} />
      </TabsContent>
    </Tabs>
  )
}

function ProductAdmin({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const queryClient = useQueryClient()
  const refreshProducts = () => queryClient.invalidateQueries({ queryKey: queryKeys.products })
  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      void refreshProducts()
    },
  })
  const removeMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      void refreshProducts()
    },
  })

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    await createMutation.mutateAsync({
      name: String(data.get("name")),
      description: String(data.get("description") || ""),
      price: Number(data.get("price")),
      stockQuantity: Number(data.get("stockQuantity")),
      sku: String(data.get("sku")),
      imageUrl: String(data.get("imageUrl") || ""),
      categoryId: String(data.get("categoryId") || "") || undefined,
    })
    form.reset()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="h-fit rounded-lg">
        <CardHeader><CardTitle>Nuovo prodotto</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={(event) => void createProduct(event)}>
            <Field label="Nome" name="name" />
            <Field label="SKU" name="sku" />
            <Field label="Prezzo" min="0.01" name="price" step="0.01" type="number" />
            <Field label="Stock" min="0" name="stockQuantity" type="number" />
            <Field label="Immagine URL" name="imageUrl" required={false} />
            <select className="h-9 rounded-md border bg-background px-3 text-sm" name="categoryId">
              <option value="">Senza categoria</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <Textarea name="description" placeholder="Descrizione" />
            <Button disabled={createMutation.isPending} type="submit"><Save />Salva</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-3">
        {products.map((product) => (
          <Card className="rounded-lg" key={product.id} size="sm">
            <CardContent className="grid gap-3 py-1 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground">{product.sku} - {product.category?.name ?? "Senza categoria"}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatMoney(product.price)}</span>
                <Badge variant="outline">{product.stockQuantity} pz</Badge>
                <Button onClick={() => void removeMutation.mutateAsync(product.id)} size="icon-sm" type="button" variant="destructive">
                  <Trash2 />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CategoryAdmin({ categories }: { categories: Category[] }) {
  const queryClient = useQueryClient()
  const refreshCategories = () => queryClient.invalidateQueries({ queryKey: queryKeys.categories })
  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      void refreshCategories()
    },
  })
  const removeMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      void refreshCategories()
      void queryClient.invalidateQueries({ queryKey: queryKeys.products })
    },
  })

  async function createCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    await createMutation.mutateAsync({
      name: String(data.get("name")),
      description: String(data.get("description") || ""),
    })
    form.reset()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="h-fit rounded-lg">
        <CardHeader><CardTitle>Nuova categoria</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={(event) => void createCategory(event)}>
            <Field label="Nome" name="name" />
            <Textarea name="description" placeholder="Descrizione" />
            <Button disabled={createMutation.isPending} type="submit"><Save />Salva</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <Card className="rounded-lg" key={category.id} size="sm">
            <CardHeader>
              <CardTitle className="flex justify-between gap-2">
                {category.name}
                <Button onClick={() => void removeMutation.mutateAsync(category.id)} size="icon-sm" type="button" variant="destructive">
                  <Trash2 />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{category.description}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function OrderAdmin({ orders }: { orders: Order[] }) {
  const queryClient = useQueryClient()
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders })
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders })
    },
  })

  return (
    <div className="grid gap-3">
      {orders.map((order) => (
        <Card className="rounded-lg" key={order.id} size="sm">
          <CardContent className="grid gap-3 py-1 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div>
              <div className="font-medium">{order.orderNumber}</div>
              <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)} - {formatMoney(order.totalAmount)}</div>
            </div>
            <Badge variant="secondary">{order.status}</Badge>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              onChange={(event) => void statusMutation.mutateAsync({ id: order.id, status: event.target.value as OrderStatus })}
              value={order.status}
            >
              {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function Field({
  label,
  name,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; name: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required {...props} />
    </div>
  )
}
