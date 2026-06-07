import * as React from "react"
import { createBrowserRouter } from "react-router-dom"
import { lazyPage } from "@/lib/routes/lazy-page"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { ShopLayout } from "@/components/layouts/shop-layout"
import { AuthLayout } from "@/components/layouts/auth-layout"

function lazyNamed<T extends React.ComponentType>(
  importer: () => Promise<Record<string, unknown>>,
  exportName: string
) {
  return React.lazy(async () => {
    const module = await importer()
    const component = module[exportName]

    if (!component) {
      throw new Error(
        `lazyNamed: export "${exportName}" non trovato. Export disponibili: ${Object.keys(
          module
        ).join(", ")}`
      )
    }

    return {
      default: component as T,
    }
  })
}

const AccountPage = lazyNamed(
  () => import("@/pages/shop/account-page"),
  "AccountPage"
)
const CartPage = lazyNamed(() => import("@/pages/shop/cart-page"), "CartPage")
const CategoriesPage = lazyNamed(
  () => import("@/pages/shop/categories-page"),
  "CategoriesPage"
)
const LoginPage = lazyNamed(() => import("@/pages/auth/login-page"), "LoginPage")
const RegisterPage = lazyNamed(
  () => import("@/pages/auth/register-page"),
  "RegisterPage"
)
const NotFound = lazyNamed(() => import("@/pages/shop/not-found"), "NotFound")
const OrderSuccessPage = lazyNamed(
  () => import("@/pages/shop/order-success-page"),
  "OrderSuccessPage"
)
const MyOrdersPage = lazyNamed(
  () => import("@/pages/shop/my-orders-page"),
  "MyOrdersPage"
)
const ProductPage = lazyNamed(
  () => import("@/pages/shop/product-page"),
  "ProductPage"
)
const ProductsPage = lazyNamed(
  () => import("@/pages/shop/products-page"),
  "ProductsPage"
)

const AdminOrdersPage = lazyNamed(
  () => import("@/pages/admin/admin-orders-page"),
  "AdminOrdersPage"
)
const AdminProductsPage = lazyNamed(
  () => import("@/pages/admin/admin-products-page"),
  "AdminProductsPage"
)
const AdminCategoriesPage = lazyNamed(
  () => import("@/pages/admin/admin-categories-page"),
  "AdminCategoriesPage"
)
const CreateProductPage = lazyNamed(
  () => import("@/pages/admin/create-product-page"),
  "CreateProductPage"
)
const LowStockProductsPage = lazyNamed(
  () => import("@/pages/admin/low-stock-products-page"),
  "LowStockProductsPage"
)
const SummaryPage = lazyNamed(
  () => import("@/pages/admin/summary-page"),
  "SummaryPage"
)

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ShopLayout />,
    children: [
      { index: true, element: lazyPage(<ProductsPage />) },
      { path: "categories", element: lazyPage(<CategoriesPage />) },
      { path: "products/:slug", element: lazyPage(<ProductPage />) },
      { path: "cart", element: lazyPage(<CartPage />) },
      { path: "orders/success", element: lazyPage(<OrderSuccessPage />) },
      { path: "orders", element: lazyPage(<MyOrdersPage />) },
      { path: "account", element: lazyPage(<AccountPage />) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: lazyPage(<LoginPage />) },
      { path: "register", element: lazyPage(<RegisterPage />) },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: lazyPage(<SummaryPage />) },
      { path: "products", element: lazyPage(<AdminProductsPage />) },
      { path: "products/new", element: lazyPage(<CreateProductPage />) },
      { path: "categories", element: lazyPage(<AdminCategoriesPage />) },
      { path: "orders", element: lazyPage(<AdminOrdersPage />) },
      { path: "low-stock", element: lazyPage(<LowStockProductsPage />) },
    ],
  },
  {
    path: "*",
    element: lazyPage(<NotFound />),
  },
])