import { createBrowserRouter, Navigate } from "react-router-dom"

import App from "@/App"
import { AccountPage } from "@/pages/shop/account-page"
import { AllOrdersPage } from "@/pages/admin/all-orders-page"
import { AllProductsPage } from "@/pages/admin/all-products-page"
import { CategoriesPage } from "@/pages/admin/categories-page"
import { CreateProductPage } from "@/pages/admin/create-product-page"
import { LowStockProductsPage } from "@/pages/admin/low-stock-products-page"
import { SummaryPage } from "@/pages/admin/summary-page"
import { CartPage } from "@/pages/shop/cart-page"
import { ProductsPage } from "@/pages/shop/products-page"
import { ProductPage } from "@/pages/shop/product-page"
import { OrdersPage } from "@/pages/shop/my-orders-page"
import { LoginPage, RegisterPage } from "@/pages/shop/auth-page"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <ProductsPage /> },
      { path: "products/:slug", element: <ProductPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "account", element: <AccountPage /> },
      { path: "admin", element: <SummaryPage /> },
      { path: "admin/products", element: <AllProductsPage /> },
      { path: "admin/products/new", element: <CreateProductPage /> },
      { path: "admin/categories", element: <CategoriesPage /> },
      { path: "admin/orders", element: <AllOrdersPage /> },
      { path: "admin/low-stock", element: <LowStockProductsPage /> },
      { path: "*", element: <Navigate replace to="/" /> },
    ],
  },
])
