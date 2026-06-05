import { queryOptions } from "@tanstack/react-query"

import {
  cartApi,
  categoriesApi,
  dashboardApi,
  ordersApi,
  productsApi,
  reviewsApi,
  wishlistApi,
} from "@/lib/api/handlers"
import { queryKeys } from "@/lib/query-keys"
import type { ProductSearchParams } from "@/lib/types/api"

export const queries = {
  adminDashboardSummary: (enabled = true) =>
    queryOptions({
      queryKey: queryKeys.adminDashboardSummary,
      queryFn: () => dashboardApi.summary(),
      enabled,
    }),
  adminDashboardRecentOrders: (enabled = true) =>
    queryOptions({
      queryKey: queryKeys.adminDashboardRecentOrders,
      queryFn: () => dashboardApi.recentOrders(),
      enabled,
    }),
  adminDashboardLowStockProducts: (enabled = true, threshold = 5) =>
    queryOptions({
      queryKey: queryKeys.adminDashboardLowStock(threshold),
      queryFn: () => dashboardApi.lowStockProducts({ threshold, size: 10 }),
      enabled,
    }),
  adminOrders: (enabled = true) =>
    queryOptions({
      queryKey: queryKeys.adminOrders,
      queryFn: () => ordersApi.adminList({ size: 50 }),
      enabled,
    }),
  adminProducts: (enabled = true) =>
    queryOptions({
      queryKey: [...queryKeys.products, "admin"],
      queryFn: () => productsApi.list({ size: 50, sort: "createdAt,desc" }),
      enabled,
    }),
  cart: (enabled = true) =>
    queryOptions({
      queryKey: queryKeys.cart,
      queryFn: () => cartApi.get(),
      enabled,
    }),
  categories: (enabled = true) =>
    queryOptions({
      queryKey: queryKeys.categories,
      queryFn: () => categoriesApi.list(),
      enabled,
    }),
  orders: (enabled = true) =>
    queryOptions({
      queryKey: queryKeys.orders,
      queryFn: () => ordersApi.mine(),
      enabled,
    }),
  product: (productId: string) =>
    queryOptions({
      queryKey: queryKeys.product(productId),
      queryFn: () => productsApi.byId(productId),
      enabled: Boolean(productId),
    }),
  productBySlug: (slug: string) =>
    queryOptions({
      queryKey: queryKeys.productBySlug(slug),
      queryFn: () => productsApi.bySlug(slug),
      enabled: Boolean(slug),
    }),
  products: (params: ProductSearchParams) =>
    queryOptions({
      queryKey: [...queryKeys.products, params],
      queryFn: () => productsApi.list(params),
    }),
  reviews: (
    productId: string,
    params: { page?: number; size?: number } = { size: 6 }
  ) =>
    queryOptions({
      queryKey: queryKeys.reviews(productId, params),
      queryFn: () => reviewsApi.list(productId, params),
      enabled: Boolean(productId),
    }),
  wishlist: (enabled = true) =>
    queryOptions({
      queryKey: queryKeys.wishlist,
      queryFn: () => wishlistApi.list(),
      enabled,
    }),
}
