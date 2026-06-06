import * as React from "react"
import { createBrowserRouter } from "react-router-dom"

import { AdminLayout } from "@/components/layouts/admin-layout"
import { ShopLayout } from "@/components/layouts/shop-layout"
import { AuthLayout } from "@/components/layouts/auth-layout"

const AccountPage = React.lazy(() => import("@/pages/shop/account-page").then((module) => ({ default: module.AccountPage })))
const CartPage = React.lazy(() => import("@/pages/shop/cart-page").then((module) => ({ default: module.CartPage })))
const CategoriesPage = React.lazy(() => import("@/pages/shop/categories-page").then((module) => ({ default: module.CategoriesPage })))
const LoginPage = React.lazy(() => import("@/pages/auth/auth-page").then((module) => ({ default: module.LoginPage })))
const RegisterPage = React.lazy(() => import("@/pages/auth/auth-page").then((module) => ({ default: module.RegisterPage })))
const NotFound = React.lazy(() => import("@/pages/shop/not-found").then((module) => ({ default: module.NotFound })))
const OrderSuccessPage = React.lazy(() => import("@/pages/shop/order-success-page").then((module) => ({ default: module.OrderSuccessPage })))
const OrdersPage = React.lazy(() => import("@/pages/shop/my-orders-page").then((module) => ({ default: module.OrdersPage })))
const ProductPage = React.lazy(() => import("@/pages/shop/product-page").then((module) => ({ default: module.ProductPage })))
const ProductsPage = React.lazy(() => import("@/pages/shop/products-page").then((module) => ({ default: module.ProductsPage })))

const AllOrdersPage = React.lazy(() => import("@/pages/admin/admin-orders-page").then((module) => ({ default: module.AllOrdersPage })))
const AllProductsPage = React.lazy(() => import("@/pages/admin/admin-products-page").then((module) => ({ default: module.AllProductsPage })))
const CategoryManagementPage = React.lazy(() => import("@/pages/admin/admin-categories-page").then((module) => ({ default: module.CategoryManagementPage })))
const CreateProductPage = React.lazy(() => import("@/pages/admin/create-product-page").then((module) => ({ default: module.CreateProductPage })))
const LowStockProductsPage = React.lazy(() => import("@/pages/admin/low-stock-products-page").then((module) => ({ default: module.LowStockProductsPage })))
const SummaryPage = React.lazy(() => import("@/pages/admin/summary-page").then((module) => ({ default: module.SummaryPage })))

function lazyPage(element: React.ReactNode) {
  return (
    <React.Suspense fallback={<RouteFallback />}>
      {element}
    </React.Suspense>
  )
}

function RouteFallback() {
  return (
    <div className="flex min-h-75 items-center justify-center text-sm text-muted-foreground">
      Caricamento...
    </div>
  )
}

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
      { path: "orders", element: lazyPage(<OrdersPage />) },
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
      { path: "products", element: lazyPage(<AllProductsPage />) },
      { path: "products/new", element: lazyPage(<CreateProductPage />) },
      { path: "categories", element: lazyPage(<CategoryManagementPage />) },
      { path: "orders", element: lazyPage(<AllOrdersPage />) },
      { path: "low-stock", element: lazyPage(<LowStockProductsPage />) },
    ],
  },

  {
    path: "*",
    element: lazyPage(<NotFound />)
  },
])
