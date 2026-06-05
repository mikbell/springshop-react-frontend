import { createBrowserRouter, Navigate } from "react-router-dom"

import App from "@/App"
import { AccountPage } from "@/pages/account-page"
import { AdminPage } from "@/pages/admin-page"
import { CartPage } from "@/pages/cart-page"
import { ProductsPage } from "@/pages/products-page"
import { ProductPage } from "@/pages/product-page"
import { OrdersPage } from "@/pages/orders-page"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <ProductsPage /> },
      { path: "products/:slug", element: <ProductPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "account", element: <AccountPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "*", element: <Navigate replace to="/" /> },
    ],
  },
])
