export const queryKeys = {
  adminDashboardLowStock: (threshold: number) =>
    ["admin", "dashboard", "low-stock-products", threshold] as const,
  adminDashboardRecentOrders: ["admin", "dashboard", "recent-orders"] as const,
  adminDashboardSummary: ["admin", "dashboard", "summary"] as const,
  adminOrders: ["admin", "orders"] as const,
  cart: ["cart"] as const,
  categories: ["categories"] as const,
  orders: ["orders"] as const,
  product: (productId: string) => ["products", productId] as const,
  productBySlug: (slug: string) => ["products", "slug", slug] as const,
  products: ["products"] as const,
  reviews: (productId: string, params?: { page?: number; size?: number }) =>
    params
      ? (["reviews", productId, params] as const)
      : (["reviews", productId] as const),
  wishlist: ["wishlist"] as const,
}
